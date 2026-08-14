from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.jobs.seed import seed_database
from app.jobs.sources import JobRecord, JSONJobSource, import_jobs
from app.models import CandidateProfile, Company, Job, SavedJob, User
from app.repositories import search_jobs
from app.schemas import (
    AdminJobImportRequest,
    CandidateProfileIn,
    CandidateProfileOut,
    CareerGapItem,
    CareerGapResponse,
    CompanyOut,
    CompareRequest,
    JobOut,
    JobSearchResponse,
    JobWithMatch,
    SavedJobIn,
    SavedJobOut,
    Token,
    UserCreate,
    UserLogin,
)
from app.services.scoring import analyze_match
from app.utils import freshness, join_csv, split_csv
from app.workers.tasks import WorkerJob, enqueue_job, get_job

router = APIRouter()


def company_out(company: Company, open_jobs: int = 0) -> CompanyOut:
    return CompanyOut(
        id=company.id,
        name=company.name,
        industry=company.industry,
        location=company.location,
        company_size=company.company_size,
        work_style=company.work_style,
        tech_stack=split_csv(company.tech_stack),
        visa_information=company.visa_information,
        open_jobs=open_jobs,
    )


def job_out(job: Job) -> JobOut:
    return JobOut(
        id=job.id,
        title=job.title,
        company=company_out(job.company),
        location=job.location,
        prefecture=job.prefecture,
        remote_policy=job.remote_policy,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        salary_currency=job.salary_currency,
        salary_confidence=job.salary_confidence,
        employment_type=job.employment_type,
        japanese_requirement=job.japanese_requirement,
        english_requirement=job.english_requirement,
        visa_sponsorship=job.visa_sponsorship,
        experience_level=job.experience_level,
        required_skills=split_csv(job.required_skills),
        preferred_skills=split_csv(job.preferred_skills),
        responsibilities=split_csv(job.responsibilities),
        benefits=split_csv(job.benefits),
        source=job.source,
        posting_date=job.posting_date,
        estimated_freshness=freshness(job.posting_date),
        application_url=job.application_url,
    )


def profile_to_schema(profile: CandidateProfile) -> CandidateProfileIn:
    return CandidateProfileIn(
        target_role=profile.target_role,
        years_experience=profile.years_experience,
        education=profile.education,
        degree=profile.degree,
        university=profile.university,
        location=profile.location,
        desired_japan_location=profile.desired_japan_location,
        japanese_level=profile.japanese_level,
        english_level=profile.english_level,
        visa_status=profile.visa_status,
        sponsorship_required=profile.sponsorship_required,
        skills=split_csv(profile.skills),
        programming_languages=split_csv(profile.programming_languages),
        frameworks=split_csv(profile.frameworks),
        cloud_skills=split_csv(profile.cloud_skills),
        certifications=split_csv(profile.certifications),
        projects=split_csv(profile.projects),
    )


@router.post("/auth/register", response_model=Token)
def register(payload: UserCreate, db: Annotated[Session, Depends(get_db)]) -> Token:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=payload.email, name=payload.name, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(user.id))


@router.post("/auth/login", response_model=Token)
def login(payload: UserLogin, db: Annotated[Session, Depends(get_db)]) -> Token:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return Token(access_token=create_access_token(user.id))


@router.post("/seed")
def seed(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    seed_database(db)
    return {"status": "seeded"}


@router.get("/jobs", response_model=JobSearchResponse)
def jobs(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    keyword: str | None = None,
    location: str | None = None,
    japanese: str | None = None,
    visa: str | None = None,
    skill: str | None = None,
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
) -> JobSearchResponse:
    seed_database(db)
    total, rows = search_jobs(db, keyword, location, japanese, visa, skill, limit, offset)
    profile = profile_to_schema(user.profile) if user.profile else CandidateProfileIn()
    items = [JobWithMatch(job=job_out(job), match=analyze_match(job, profile)) for job in rows]
    return JobSearchResponse(items=items, total=total)


@router.get("/jobs/{job_id}", response_model=JobWithMatch)
def job_detail(job_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]) -> JobWithMatch:
    seed_database(db)
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = profile_to_schema(user.profile) if user.profile else CandidateProfileIn()
    return JobWithMatch(job=job_out(job), match=analyze_match(job, profile))


@router.put("/profile", response_model=CandidateProfileOut)
def upsert_profile(
    payload: CandidateProfileIn,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> CandidateProfileOut:
    profile = user.profile or CandidateProfile(user_id=user.id)
    for field, value in payload.model_dump().items():
        setattr(profile, field, join_csv(value) if isinstance(value, list) else value)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    out = profile_to_schema(profile).model_dump()
    out["id"] = profile.id
    return CandidateProfileOut(**out)


@router.get("/profile", response_model=CandidateProfileOut | None)
def get_profile(user: Annotated[User, Depends(get_current_user)]) -> CandidateProfileOut | None:
    if not user.profile:
        return None
    out = profile_to_schema(user.profile).model_dump()
    out["id"] = user.profile.id
    return CandidateProfileOut(**out)


@router.post("/saved")
def save_job(
    payload: SavedJobIn,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    if not db.get(Job, payload.job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    saved = db.query(SavedJob).filter(SavedJob.user_id == user.id, SavedJob.job_id == payload.job_id).first()
    if not saved:
        saved = SavedJob(user_id=user.id, job_id=payload.job_id)
    saved.status = payload.status
    saved.notes = payload.notes
    db.add(saved)
    db.commit()
    return {"status": "saved"}


@router.get("/saved", response_model=list[SavedJobOut])
def saved_jobs(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[SavedJobOut]:
    profile = profile_to_schema(user.profile) if user.profile else CandidateProfileIn()
    rows = db.query(SavedJob).filter(SavedJob.user_id == user.id).all()
    result = []
    for saved in rows:
        job = db.get(Job, saved.job_id)
        if job:
            result.append(
                SavedJobOut(
                    id=saved.id,
                    status=saved.status,
                    notes=saved.notes,
                    job=JobWithMatch(job=job_out(job), match=analyze_match(job, profile)),
                )
            )
    return result


@router.post("/compare", response_model=list[JobWithMatch])
def compare_jobs(
    payload: CompareRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[JobWithMatch]:
    profile = profile_to_schema(user.profile) if user.profile else CandidateProfileIn()
    jobs_to_compare = [db.get(Job, job_id) for job_id in payload.job_ids]
    if any(job is None for job in jobs_to_compare):
        raise HTTPException(status_code=404, detail="One or more jobs were not found")
    return [
        JobWithMatch(job=job_out(job), match=analyze_match(job, profile))
        for job in jobs_to_compare
        if job is not None
    ]


@router.get("/recommendations", response_model=list[JobWithMatch])
def recommendations(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]) -> list[JobWithMatch]:
    seed_database(db)
    profile = profile_to_schema(user.profile) if user.profile else CandidateProfileIn()
    jobs = db.query(Job).limit(80).all()
    ranked = sorted(((job, analyze_match(job, profile)) for job in jobs), key=lambda item: item[1].match_score, reverse=True)
    return [JobWithMatch(job=job_out(job), match=match) for job, match in ranked[:12]]


@router.get("/career-gap", response_model=CareerGapResponse)
def career_gap(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]) -> CareerGapResponse:
    seed_database(db)
    profile = profile_to_schema(user.profile) if user.profile else CandidateProfileIn()
    analyses = [analyze_match(job, profile) for job in db.query(Job).limit(40).all()]
    missing: dict[str, int] = {}
    for analysis in analyses:
        for skill in analysis.missing_skills:
            missing[skill] = missing.get(skill, 0) + 1
    ordered = sorted(missing, key=missing.get, reverse=True)[:6]
    readiness = round(sum(a.match_score for a in analyses[:10]) / 10)
    return CareerGapResponse(
        target=f"{profile.target_role} - {profile.desired_japan_location}",
        readiness=readiness,
        current_skills=profile.skills + profile.programming_languages + profile.frameworks + profile.cloud_skills,
        missing_skills=[
            CareerGapItem(
                skill=skill,
                importance="High" if i < 3 else "Medium",
                current_level="Not started",
                target_level="Production ready",
                reason=f"Appears in {missing[skill]} relevant Japan tech listings.",
                estimated_difficulty=["Medium", "Medium", "Hard", "Medium", "Hard", "Medium"][i],
            )
            for i, skill in enumerate(ordered)
        ],
        suggested_learning_order=ordered,
        target_roles=["Backend Engineer", "AI Engineer", "Cloud Engineer"],
    )


@router.get("/companies", response_model=list[CompanyOut])
def companies(db: Annotated[Session, Depends(get_db)]) -> list[CompanyOut]:
    seed_database(db)
    return [company_out(c, len(c.jobs)) for c in db.query(Company).limit(30).all()]


@router.post("/admin/import/jobs")
def admin_import_jobs(
    payload: AdminJobImportRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> dict[str, int]:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    records = [
        JobRecord(
            company_name=item.company_name,
            company_industry=item.company_industry,
            company_location=item.company_location,
            title=item.title,
            location=item.location,
            prefecture=item.prefecture,
            remote_policy=item.remote_policy,
            salary_min=item.salary_min,
            salary_max=item.salary_max,
            employment_type=item.employment_type,
            japanese_requirement=item.japanese_requirement,
            english_requirement=item.english_requirement,
            visa_sponsorship=item.visa_sponsorship,
            experience_level=item.experience_level,
            required_skills=join_csv(item.required_skills),
            preferred_skills=join_csv(item.preferred_skills),
            responsibilities=join_csv(item.responsibilities),
            benefits=join_csv(item.benefits),
            source=item.source,
            posting_date=item.posting_date,
            application_url=item.application_url,
        )
        for item in payload.records
    ]
    return import_jobs(db, JSONJobSource(records))


@router.post("/workers/jobs/{job_name}", response_model=WorkerJob)
def enqueue_worker_job(job_name: str, user: Annotated[User, Depends(get_current_user)]) -> WorkerJob:
    allowed = {
        "generate_job_embedding",
        "analyze_job",
        "generate_candidate_embedding",
        "refresh_recommendations",
    }
    if job_name not in allowed:
        raise HTTPException(status_code=400, detail="Unknown background job")
    return enqueue_job(job_name, "Local demo queue accepted the job; wire Redis/Celery in production.")


@router.get("/workers/jobs/{job_id}", response_model=WorkerJob)
def worker_job_status(job_id: str, user: Annotated[User, Depends(get_current_user)]) -> WorkerJob:
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Worker job not found")
    return job

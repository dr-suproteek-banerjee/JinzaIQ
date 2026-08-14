from app.ai.providers import get_ai_provider
from app.embeddings.providers import cosine, get_embedding_provider
from app.models import Job
from app.schemas import CandidateProfileIn, MatchAnalysis
from app.utils import EXPERIENCE_ORDER, LEVEL_ORDER, normalize_skill, split_csv


def _score_ratio(matched: int, total: int) -> int:
    if total == 0:
        return 100
    return round((matched / total) * 100)


def analyze_match(job: Job, profile: CandidateProfileIn) -> MatchAnalysis:
    candidate_skills = {
        normalize_skill(skill).lower()
        for field in [
            profile.skills,
            profile.programming_languages,
            profile.frameworks,
            profile.cloud_skills,
            profile.certifications,
        ]
        for skill in field
    }
    required = [normalize_skill(skill) for skill in split_csv(job.required_skills)]
    preferred = [normalize_skill(skill) for skill in split_csv(job.preferred_skills)]
    matched = [skill for skill in required if skill.lower() in candidate_skills]
    missing = [skill for skill in required if skill.lower() not in candidate_skills]
    nice = [skill for skill in preferred if skill.lower() in candidate_skills]

    skill_score = _score_ratio(len(matched), len(required))
    job_exp = EXPERIENCE_ORDER.get(job.experience_level, 2)
    candidate_exp = min(profile.years_experience // 2 + 1, 4)
    experience_score = 100 if candidate_exp >= job_exp else max(35, 100 - (job_exp - candidate_exp) * 25)
    language_score = 100 if LEVEL_ORDER.get(profile.japanese_level, 0) >= LEVEL_ORDER.get(job.japanese_requirement, 0) else 45
    location_matches = profile.desired_japan_location in {
        job.location,
        job.prefecture,
        "Remote",
    }
    location_score = 100 if location_matches or job.remote_policy == "Remote" else 70
    visa_score = 90
    if profile.sponsorship_required and job.visa_sponsorship in {"Not eligible", "Does not mention sponsorship"}:
        visa_score = 35
    elif profile.sponsorship_required and job.visa_sponsorship == "Unknown":
        visa_score = 55
    salary_score = 80 if job.salary_min else 60

    embedder = get_embedding_provider()
    candidate_text = " ".join([profile.target_role, *candidate_skills, profile.desired_japan_location])
    job_text = " ".join([job.title, job.required_skills, job.preferred_skills, job.responsibilities])
    semantic_score = round(max(0.0, cosine(embedder.embed(candidate_text), embedder.embed(job_text))) * 100)

    weights = {
        "skills": 0.35,
        "experience": 0.20,
        "language": 0.15,
        "visa": 0.10,
        "location": 0.05,
        "salary": 0.05,
        "semantic": 0.05,
    }
    overall = round(
        skill_score * weights["skills"]
        + experience_score * weights["experience"]
        + language_score * weights["language"]
        + visa_score * weights["visa"]
        + location_score * weights["location"]
        + salary_score * weights["salary"]
        + semantic_score * weights["semantic"]
        + 100 * 0.05
    )
    risks = []
    if language_score < 70:
        risks.append(f"Japanese requirement is {job.japanese_requirement}; verify language expectations.")
    if visa_score < 70:
        risks.append("Visa sponsorship is not confirmed. Verify directly with the employer.")
    recommendations = missing[:4] + (["Japanese N2"] if language_score < 70 else [])
    analysis = MatchAnalysis(
        match_score=max(0, min(100, overall)),
        skill_match_score=skill_score,
        experience_match_score=experience_score,
        language_match_score=language_score,
        location_match_score=location_score,
        visa_score=visa_score,
        salary_score=salary_score,
        semantic_score=semantic_score,
        matched_skills=matched,
        missing_skills=missing,
        nice_to_have_skills=nice,
        risks=risks,
        recommendations=recommendations[:5],
        summary="Deterministic analysis complete.",
    )
    return get_ai_provider().explain(analysis)

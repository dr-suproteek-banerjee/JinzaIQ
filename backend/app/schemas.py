from datetime import date

from pydantic import BaseModel, EmailStr, Field, HttpUrl


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=160)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class CandidateProfileIn(BaseModel):
    target_role: str = "Software Engineer"
    years_experience: int = Field(default=1, ge=0, le=50)
    education: str = ""
    degree: str = ""
    university: str = ""
    location: str = ""
    desired_japan_location: str = "Tokyo"
    japanese_level: str = "None"
    english_level: str = "Professional"
    visa_status: str = "Needs sponsorship"
    sponsorship_required: bool = True
    skills: list[str] = []
    programming_languages: list[str] = []
    frameworks: list[str] = []
    cloud_skills: list[str] = []
    certifications: list[str] = []
    projects: list[str] = []


class CandidateProfileOut(CandidateProfileIn):
    id: str


class CompanyOut(BaseModel):
    id: str
    name: str
    industry: str
    location: str
    company_size: str
    work_style: str
    tech_stack: list[str]
    visa_information: str
    open_jobs: int = 0


class JobOut(BaseModel):
    id: str
    title: str
    company: CompanyOut
    location: str
    prefecture: str
    remote_policy: str
    salary_min: int | None
    salary_max: int | None
    salary_currency: str
    salary_confidence: str
    employment_type: str
    japanese_requirement: str
    english_requirement: str
    visa_sponsorship: str
    experience_level: str
    required_skills: list[str]
    preferred_skills: list[str]
    responsibilities: list[str]
    benefits: list[str]
    source: str
    posting_date: date
    estimated_freshness: str
    application_url: HttpUrl | str


class MatchAnalysis(BaseModel):
    match_score: int = Field(ge=0, le=100)
    skill_match_score: int = Field(ge=0, le=100)
    experience_match_score: int = Field(ge=0, le=100)
    language_match_score: int = Field(ge=0, le=100)
    location_match_score: int = Field(ge=0, le=100)
    visa_score: int = Field(ge=0, le=100)
    salary_score: int = Field(ge=0, le=100)
    semantic_score: int = Field(ge=0, le=100)
    matched_skills: list[str]
    missing_skills: list[str]
    nice_to_have_skills: list[str]
    risks: list[str]
    recommendations: list[str]
    summary: str
    confidence: str = "medium"


class JobWithMatch(BaseModel):
    job: JobOut
    match: MatchAnalysis


class JobSearchResponse(BaseModel):
    total: int
    items: list[JobWithMatch]


class SavedJobIn(BaseModel):
    job_id: str
    status: str = "Saved"
    notes: str = ""


class SavedJobOut(BaseModel):
    id: str
    status: str
    notes: str
    job: JobWithMatch


class CompareRequest(BaseModel):
    job_ids: list[str] = Field(min_length=2, max_length=5)


class AdminJobImportRecord(BaseModel):
    company_name: str
    company_industry: str = "software"
    company_location: str = "Tokyo"
    title: str
    location: str = "Tokyo"
    prefecture: str = "Tokyo"
    remote_policy: str = "Hybrid"
    salary_min: int | None = None
    salary_max: int | None = None
    employment_type: str = "Full-time"
    japanese_requirement: str = "None"
    english_requirement: str = "Professional English"
    visa_sponsorship: str = "Unknown"
    experience_level: str = "Entry-level"
    required_skills: list[str]
    preferred_skills: list[str] = []
    responsibilities: list[str] = []
    benefits: list[str] = []
    source: str = "Admin JSON import"
    posting_date: date
    application_url: str


class AdminJobImportRequest(BaseModel):
    records: list[AdminJobImportRecord] = Field(min_length=1, max_length=500)


class CareerGapItem(BaseModel):
    skill: str
    importance: str
    current_level: str
    target_level: str
    reason: str
    estimated_difficulty: str


class CareerGapResponse(BaseModel):
    target: str
    readiness: int
    current_skills: list[str]
    missing_skills: list[CareerGapItem]
    suggested_learning_order: list[str]
    target_roles: list[str]

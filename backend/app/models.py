from datetime import UTC, date, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class JapaneseLevel(StrEnum):
    NONE = "None"
    N5 = "N5"
    N4 = "N4"
    BASIC = "Basic"
    N3 = "N3"
    N2 = "N2"
    N1 = "N1"
    NATIVE = "Native"


class ExperienceLevel(StrEnum):
    INTERN = "Intern"
    ENTRY = "Entry-level"
    JUNIOR = "Junior"
    MID = "Mid-level"
    SENIOR = "Senior"


class VisaStatus(StrEnum):
    UNKNOWN = "Unknown"
    LIKELY = "Likely sponsors"
    NOT_MENTIONED = "Does not mention sponsorship"
    NOT_ELIGIBLE = "Not eligible"


class ApplicationStatus(StrEnum):
    SAVED = "Saved"
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"


def utc_now() -> datetime:
    return datetime.now(UTC)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    profile: Mapped["CandidateProfile | None"] = relationship(back_populates="user")


class CandidateProfile(Base, TimestampMixin):
    __tablename__ = "candidate_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True)
    target_role: Mapped[str] = mapped_column(String(120))
    years_experience: Mapped[int] = mapped_column(Integer)
    education: Mapped[str] = mapped_column(String(120), default="")
    degree: Mapped[str] = mapped_column(String(120), default="")
    university: Mapped[str] = mapped_column(String(160), default="")
    location: Mapped[str] = mapped_column(String(120), default="")
    desired_japan_location: Mapped[str] = mapped_column(String(120), default="Tokyo")
    japanese_level: Mapped[str] = mapped_column(String(20), default=JapaneseLevel.NONE)
    english_level: Mapped[str] = mapped_column(String(40), default="Professional")
    visa_status: Mapped[str] = mapped_column(String(120), default="Needs sponsorship")
    sponsorship_required: Mapped[bool] = mapped_column(Boolean, default=True)
    skills: Mapped[str] = mapped_column(Text, default="")
    programming_languages: Mapped[str] = mapped_column(Text, default="")
    frameworks: Mapped[str] = mapped_column(Text, default="")
    cloud_skills: Mapped[str] = mapped_column(Text, default="")
    certifications: Mapped[str] = mapped_column(Text, default="")
    projects: Mapped[str] = mapped_column(Text, default="")

    user: Mapped[User] = relationship(back_populates="profile")


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    industry: Mapped[str] = mapped_column(String(100))
    location: Mapped[str] = mapped_column(String(100))
    company_size: Mapped[str] = mapped_column(String(80))
    work_style: Mapped[str] = mapped_column(String(80))
    tech_stack: Mapped[str] = mapped_column(Text)
    visa_information: Mapped[str] = mapped_column(String(160), default="Unclear")

    jobs: Mapped[list["Job"]] = relationship(back_populates="company")


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"
    __table_args__ = (UniqueConstraint("company_id", "title", "location", name="uq_job_natural"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True)
    title: Mapped[str] = mapped_column(String(180), index=True)
    location: Mapped[str] = mapped_column(String(100), index=True)
    prefecture: Mapped[str] = mapped_column(String(100), index=True)
    remote_policy: Mapped[str] = mapped_column(String(40), index=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="JPY")
    salary_confidence: Mapped[str] = mapped_column(String(20), default="Listed")
    employment_type: Mapped[str] = mapped_column(String(40), default="Full-time")
    japanese_requirement: Mapped[str] = mapped_column(String(20), index=True)
    english_requirement: Mapped[str] = mapped_column(String(60), default="Professional English")
    visa_sponsorship: Mapped[str] = mapped_column(String(80), index=True)
    experience_level: Mapped[str] = mapped_column(String(40), index=True)
    required_skills: Mapped[str] = mapped_column(Text)
    preferred_skills: Mapped[str] = mapped_column(Text, default="")
    responsibilities: Mapped[str] = mapped_column(Text)
    benefits: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(80), default="Demo seed data")
    posting_date: Mapped[date] = mapped_column(Date)
    application_url: Mapped[str] = mapped_column(String(500))
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    company: Mapped[Company] = relationship(back_populates="jobs")
    embedding: Mapped["JobEmbedding | None"] = relationship(back_populates="job")


class JobEmbedding(Base, TimestampMixin):
    __tablename__ = "job_embeddings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), unique=True)
    vector: Mapped[str] = mapped_column(Text)
    provider: Mapped[str] = mapped_column(String(40), default="mock")

    job: Mapped[Job] = relationship(back_populates="embedding")


class SavedJob(Base, TimestampMixin):
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_saved_job"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), index=True)
    status: Mapped[str] = mapped_column(String(40), default=ApplicationStatus.SAVED)
    notes: Mapped[str] = mapped_column(Text, default="")


class JobAnalysis(Base, TimestampMixin):
    __tablename__ = "job_analyses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), index=True)
    overall_score: Mapped[float] = mapped_column(Float)
    payload: Mapped[str] = mapped_column(Text)

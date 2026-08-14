from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date
from typing import Protocol

from sqlalchemy.orm import Session

from app.models import Company, Job


@dataclass(frozen=True)
class JobRecord:
    company_name: str
    company_industry: str
    company_location: str
    title: str
    location: str
    prefecture: str
    remote_policy: str
    salary_min: int | None
    salary_max: int | None
    employment_type: str
    japanese_requirement: str
    english_requirement: str
    visa_sponsorship: str
    experience_level: str
    required_skills: str
    preferred_skills: str
    responsibilities: str
    benefits: str
    source: str
    posting_date: date
    application_url: str


class JobSource(Protocol):
    name: str

    def fetch(self) -> Iterable[JobRecord]:
        raise NotImplementedError


class JSONJobSource:
    name = "json-import"

    def __init__(self, records: list[JobRecord]) -> None:
        self.records = records

    def fetch(self) -> Iterable[JobRecord]:
        return self.records


def import_jobs(db: Session, source: JobSource) -> dict[str, int]:
    imported = 0
    duplicates = 0
    for record in source.fetch():
        company = db.query(Company).filter(Company.name == record.company_name).first()
        if not company:
            company = Company(
                name=record.company_name,
                industry=record.company_industry,
                location=record.company_location,
                company_size="Unknown",
                work_style=record.remote_policy,
                tech_stack=record.required_skills,
                visa_information=record.visa_sponsorship,
            )
            db.add(company)
            db.flush()
        existing = (
            db.query(Job)
            .filter(
                Job.company_id == company.id,
                Job.title == record.title,
                Job.location == record.location,
            )
            .first()
        )
        if existing:
            duplicates += 1
            continue
        db.add(
            Job(
                company_id=company.id,
                title=record.title,
                location=record.location,
                prefecture=record.prefecture,
                remote_policy=record.remote_policy,
                salary_min=record.salary_min,
                salary_max=record.salary_max,
                employment_type=record.employment_type,
                japanese_requirement=record.japanese_requirement,
                english_requirement=record.english_requirement,
                visa_sponsorship=record.visa_sponsorship,
                experience_level=record.experience_level,
                required_skills=record.required_skills,
                preferred_skills=record.preferred_skills,
                responsibilities=record.responsibilities,
                benefits=record.benefits,
                source=record.source,
                posting_date=record.posting_date,
                application_url=record.application_url,
            )
        )
        imported += 1
    db.commit()
    return {"imported": imported, "duplicates": duplicates}

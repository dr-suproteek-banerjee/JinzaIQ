from datetime import date

from app.models import Job
from app.schemas import CandidateProfileIn
from app.services.scoring import analyze_match


def test_match_score_is_explainable() -> None:
    job = Job(
        company_id="company",
        title="Backend Engineer",
        location="Tokyo",
        prefecture="Tokyo",
        remote_policy="Hybrid",
        salary_min=5_000_000,
        salary_max=8_000_000,
        japanese_requirement="None",
        visa_sponsorship="Likely sponsors",
        experience_level="Entry-level",
        required_skills="Python, FastAPI, PostgreSQL, AWS",
        preferred_skills="Kubernetes",
        responsibilities="Build APIs",
        benefits="Learning budget",
        posting_date=date.today(),
        application_url="https://example.com",
    )
    profile = CandidateProfileIn(
        skills=["Python", "PostgreSQL"],
        programming_languages=["Python"],
        frameworks=["FastAPI"],
        cloud_skills=["AWS"],
        years_experience=1,
        japanese_level="None",
        desired_japan_location="Tokyo",
    )
    result = analyze_match(job, profile)
    assert result.match_score >= 80
    assert result.skill_match_score == 100
    assert "Python" in result.matched_skills

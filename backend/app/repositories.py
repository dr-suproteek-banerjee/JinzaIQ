from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Company, Job


def search_jobs(
    db: Session,
    keyword: str | None = None,
    location: str | None = None,
    japanese: str | None = None,
    visa: str | None = None,
    skill: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[int, list[Job]]:
    stmt = select(Job).where(Job.active.is_(True))
    if keyword:
        like = f"%{keyword}%"
        stmt = stmt.join(Company).where(or_(Job.title.ilike(like), Company.name.ilike(like), Job.required_skills.ilike(like)))
    if location:
        stmt = stmt.where(or_(Job.location == location, Job.prefecture == location, Job.remote_policy == location))
    if japanese:
        stmt = stmt.where(Job.japanese_requirement == japanese)
    if visa:
        stmt = stmt.where(Job.visa_sponsorship == visa)
    if skill:
        stmt = stmt.where(Job.required_skills.ilike(f"%{skill}%"))
    total = len(db.scalars(stmt).all())
    jobs = db.scalars(stmt.order_by(Job.posting_date.desc()).limit(limit).offset(offset)).all()
    return total, list(jobs)

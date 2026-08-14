from datetime import UTC, datetime
from uuid import uuid4

from pydantic import BaseModel


class WorkerJob(BaseModel):
    id: str
    name: str
    status: str
    queued_at: datetime
    message: str


_jobs: dict[str, WorkerJob] = {}


def enqueue_job(name: str, message: str = "Queued for background processing") -> WorkerJob:
    job = WorkerJob(
        id=str(uuid4()),
        name=name,
        status="queued",
        queued_at=datetime.now(UTC),
        message=message,
    )
    _jobs[job.id] = job
    return job


def get_job(job_id: str) -> WorkerJob | None:
    return _jobs.get(job_id)

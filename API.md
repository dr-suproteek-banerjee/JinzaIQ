# API

Base URL: `http://localhost:8000/api/v1`

Interactive docs: `http://localhost:8000/docs`

## Auth

- `POST /auth/register`
- `POST /auth/login`

Both return a bearer token.

## Jobs

- `GET /jobs`
- `GET /jobs/{job_id}`

Filters include `keyword`, `location`, `japanese`, `visa`, `skill`, `limit`, and `offset`.

## Profile

- `GET /profile`
- `PUT /profile`

## Intelligence

- `GET /recommendations`
- `GET /career-gap`

## Saved Jobs

- `POST /saved`
- `GET /saved`

Statuses: `Saved`, `Applied`, `Interview`, `Offer`, `Rejected`.

## Comparison

- `POST /compare`

Accepts 2-5 job IDs and returns the same explainable match payload used by job detail pages.

## Admin

- `POST /admin/import/jobs`

Protected by `is_admin`. Accepts validated JSON job records and performs duplicate detection before insert.

## Workers

- `POST /workers/jobs/{job_name}`
- `GET /workers/jobs/{job_id}`

The local implementation is an in-memory queue stub. Production wiring should replace it with Redis plus Celery/RQ.

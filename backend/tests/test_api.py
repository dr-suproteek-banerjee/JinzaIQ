from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    client = TestClient(app)
    assert client.get("/health").json() == {"status": "ok"}


def test_register_and_jobs() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "demo@example.com", "name": "Demo", "password": "password123"},
    )
    assert response.status_code in {200, 409}
    token = response.json()["access_token"] if response.status_code == 200 else client.post(
        "/api/v1/auth/login",
        json={"email": "demo@example.com", "password": "password123"},
    ).json()["access_token"]
    jobs = client.get("/api/v1/jobs", headers={"Authorization": f"Bearer {token}"})
    assert jobs.status_code == 200
    assert jobs.json()["total"] >= 100

    first_two = [item["job"]["id"] for item in jobs.json()["items"][:2]]
    saved = client.post(
        "/api/v1/saved",
        headers={"Authorization": f"Bearer {token}"},
        json={"job_id": first_two[0], "status": "Applied", "notes": "Portfolio demo"},
    )
    assert saved.status_code == 200
    saved_list = client.get("/api/v1/saved", headers={"Authorization": f"Bearer {token}"})
    assert saved_list.status_code == 200
    assert saved_list.json()[0]["status"] == "Applied"

    compare = client.post(
        "/api/v1/compare",
        headers={"Authorization": f"Bearer {token}"},
        json={"job_ids": first_two},
    )
    assert compare.status_code == 200
    assert len(compare.json()) == 2

    worker = client.post(
        "/api/v1/workers/jobs/refresh_recommendations",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert worker.status_code == 200
    status = client.get(
        f"/api/v1/workers/jobs/{worker.json()['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status.json()["status"] == "queued"

# Development

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
ruff check .
pytest
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run typecheck
npm test
npm run dev
```

Data is seeded automatically when job endpoints are called.

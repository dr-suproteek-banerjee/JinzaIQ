# Deployment

## Vercel Frontend

This repository is a monorepo. It now supports Vercel deployment from the repo root through `vercel.json`, and it also supports deploying directly from the `frontend` directory.

### Option 1: Vercel Dashboard

1. Import the Git repository in Vercel.
2. Name the Vercel project `JinzaIQ` or `jinzaiq`.
3. For **Root Directory**, either leave it at the repo root or set it to `frontend`.
4. Keep the detected framework as **Next.js**.
5. Set environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-fastapi-backend.example.com
```

6. Deploy.

If `NEXT_PUBLIC_API_URL` is not configured yet, the frontend falls back to demo data on Vercel so the portfolio UI still loads. Connect the real backend before using it as a live product.

### Option 2: Vercel CLI

```bash
cd /Users/suproteek/Developer/JapanTech-Intelligence/frontend
npm install
npm run build
vercel
vercel env add NEXT_PUBLIC_API_URL production
vercel --prod
```

## Backend Requirement

Vercel should host the Next.js frontend. The FastAPI backend should be deployed separately to AWS, Render, Railway, Fly.io, or another Python-friendly runtime.

After deploying the backend, configure CORS:

```bash
CORS_ORIGINS='["http://localhost:3000","https://your-vercel-project.vercel.app"]'
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_URL=postgresql+psycopg://...
AI_PROVIDER=mock
EMBEDDING_PROVIDER=mock
```

## Production Checklist

- Use a managed PostgreSQL database.
- Replace the local JWT secret.
- Add the Vercel production URL to backend CORS.
- Set `NEXT_PUBLIC_API_URL` to the deployed backend origin.
- Keep visa language cautious and non-legal.
- Run `npm run lint && npm run typecheck && npm test && npm run build` before deploying.

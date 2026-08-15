# Deployment

## Vercel Frontend

This repository is a monorepo. The canonical Vercel project uses `frontend` as its Root Directory. A root `vercel.json` remains for CLI compatibility, but dashboard imports should use `frontend` to keep framework detection and output tracing unambiguous.

### Option 1: Vercel Dashboard

1. Import the Git repository in Vercel.
2. Name the Vercel project `JinzaIQ` or `jinzaiq`.
3. Set **Root Directory** to `frontend`.
4. Keep the detected framework as **Next.js**.
5. Set environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-fastapi-backend.example.com
JINZAIQ_DEMO_TOKEN=replace-with-a-server-side-demo-account-token
```

6. Deploy.

For the public portfolio deployment, leave both variables unset. The frontend then uses bundled read-only demo data and never creates a shared account. When a backend URL is configured, a server-side demo token is required and backend failures are shown instead of silently replaced with sample data.

### Option 2: Vercel CLI

```bash
cd /Users/suproteek/Developer/JapanTech-Intelligence/frontend
npm ci
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
- Set `NEXT_PUBLIC_API_URL` to the deployed backend origin and `JINZAIQ_DEMO_TOKEN` to a restricted demo account token.
- Keep visa language cautious and non-legal.
- Run `npm run lint && npm run typecheck && npm test && npm run build` before deploying.

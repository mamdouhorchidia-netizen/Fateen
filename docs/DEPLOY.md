# Deployment

This repo is deployment-ready with Docker. Two recommended paths:

## Option A: Cloud Run (backend) + Vercel (frontend)

### Backend → Cloud Run
1. Build and push container:
   ```bash
   gcloud builds submit --tag gcr.io/<PROJECT_ID>/sgai-backend ./backend
   ```
2. Deploy:
   ```bash
   gcloud run deploy sgai-backend \
     --image gcr.io/<PROJECT_ID>/sgai-backend \
     --platform managed \
     --region <REGION> \
     --allow-unauthenticated=false \
     --set-env-vars FRONTEND_ORIGIN=https://<your-vercel-domain> \
     --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
   ```
3. Set the remaining env vars in Cloud Run:
   - `ADMIN_USER`, `ADMIN_PASS`, `USER_USER`, `USER_PASS`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_JSON` (store as a Secret Manager secret; pass via `--set-secrets`)

### Frontend → Vercel
1. Import the repo in Vercel.
2. Set env var:
   - `NEXT_PUBLIC_BACKEND_URL=https://<cloud-run-url>`
3. Deploy.

## Option B: Render (both services) or any Docker host

- Use the provided `backend/Dockerfile` and `frontend/Dockerfile`.
- Set env vars from `.env.example`.
- Ensure backend has a persistent disk or volume mounted to `/app/data` to keep audit.sqlite.

## Option C: Single VM with Docker Compose

1. Install Docker + Docker Compose.
2. Copy `backend/.env` and `frontend/.env` to the server.
3. Run:
   ```bash
   docker compose up -d --build
   ```
4. Put a reverse proxy (Caddy / Nginx) in front for TLS.

Notes:
- Basic Auth is demo-grade; for real deployments use OAuth/JWT and secure session handling.
- Treat the Service Account JSON and OpenAI key as secrets.

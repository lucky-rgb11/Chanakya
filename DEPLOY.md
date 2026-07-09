# Deployment

Render and Netlify deployment configuration has been removed from this repository.

If you still want to host the app, run it locally or add your preferred hosting provider manually. Local run instructions:

1. Backend

```powershell
cd backend
npm install
copy .env.example .env
# edit backend/.env and set MONGO_URI and JWT_SECRET
npm run dev
```

2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env
# edit frontend/.env and set VITE_API_URL if pointing to a remote backend
npm run dev
```

If you want me to add a different automated deployment (for example Vercel, Heroku, or Docker), tell me which provider and I will prepare the config.

Secrets required to run CI deploys (add these as GitHub repository secrets):

- `VERCEL_TOKEN` — Vercel personal token (for frontend deploy). If omitted, frontend deploy will be skipped.
- `RENDER_API_KEY` — Render API key (used to trigger a backend deploy via the API).
- `RENDER_SERVICE_ID` — Render backend service id (used with the Render API to trigger deploys).
- `MONGO_URI` — MongoDB connection string (Render secret referenced by `render.yaml`).
- `JWT_SECRET` — JWT signing secret (Render secret referenced by `render.yaml`).

How the GitHub Action works:

- On push to `main` the workflow builds the frontend (`frontend`) and, if `VERCEL_TOKEN` is present, deploys it to Vercel.
- After the frontend build the workflow triggers a Render deploy for the backend using `RENDER_API_KEY` and `RENDER_SERVICE_ID`.

If you'd like Netlify instead of Vercel, tell me and I'll switch the workflow to use Netlify CLI and `NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID`.
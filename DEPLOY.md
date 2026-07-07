# Deployment Guide — Render (backend) + Netlify (frontend)

This guide shows how to deploy the backend on Render and the frontend on Netlify. It assumes your project is in a GitHub repository.

Required environment variables

- Backend (Render):
  - `MONGO_URI` — MongoDB connection string (Atlas or other). Example: `mongodb+srv://user:pass@cluster0.mongodb.net/jhola?retryWrites=true&w=majority`
  - `JWT_SECRET` — strong secret for signing tokens.
  - `FRONTEND_URL` — URL of the deployed frontend (set after Netlify deploy).

- Frontend (Netlify):
  - `VITE_API_URL` — full URL to backend API (e.g. `https://your-backend.onrender.com`)

A. Deploy Backend to Render

1. Push your repository to GitHub.
2. Go to https://dashboard.render.com and sign in.
3. Click "New" → "Web Service".
4. Connect your GitHub repo, choose the repo and the branch to deploy (e.g., `main`).
5. Configure the service:
   - Name: `chanakya-backend` (or any name)
   - Region: your preferred region
   - Branch: `main` (or your branch)
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node 18` (Render will use package.json)
6. After creating the service, open the service settings → Environment to add variables:
   - `MONGO_URI`=your Mongo URI
   - `JWT_SECRET`=your strong secret
   - `FRONTEND_URL`=https://your-frontend.netlify.app (set this after frontend deploy)
7. Deploy. Render will build and start your backend. Note the service URL (e.g., `https://chanakya-backend.onrender.com`).

B. Deploy Frontend to Netlify

1. Go to https://app.netlify.com and sign in.
2. Click "Add new site" → "Import from Git" and connect your GitHub repo.
3. Choose the repo and branch.
4. In the build settings:
   - Build Command: `npm run build`
   - Publish directory: `dist`
5. In "Advanced" → Environment variables, add `VITE_API_URL` and set it to your backend URL from Render (e.g., `https://chanakya-backend.onrender.com`).
6. Netlify will start a build. After success, your frontend will be live at `https://<your-site>.netlify.app`.
7. Copy the Netlify URL and update your backend's `FRONTEND_URL` environment variable on Render.

C. Post-deploy checks

- Visit the Netlify URL — the app should load and fetch products from the Render backend.
- Test admin login and CRUD flows.

D. Tips & troubleshooting

- If your frontend shows a blank page after deploy, ensure `VITE_API_URL` is set in Netlify and the build used that value.
- If backend fails to start, check Render logs and ensure `JWT_SECRET` and `MONGO_URI` are set.
- For local testing, set `VITE_API_URL=http://localhost:5000` and run frontend with `npm run dev`.

E. Optional: Automation (render.yaml)

You can add a `render.yaml` to the repo to declare services as code. See Render docs: https://render.com/docs/render-manifest for examples.

That's it — tell me if you want me to prepare a `render.yaml` file or generate exact UI screenshots and env values for your repo.
 
F. GitHub Actions automated deploy

The repository contains a workflow `.github/workflows/autodeploy.yml` that will build the frontend, deploy it to Netlify using the Netlify CLI, and trigger a Render deploy for the backend when you push to `main`.

To enable automatic deploys, add the following GitHub repository secrets:

- `NETLIFY_AUTH_TOKEN` — Netlify personal access token with deploy permissions.
- `NETLIFY_SITE_ID` — Netlify site ID for your site (find in Site settings -> Site information).
- `RENDER_API_KEY` — Render API key (Account -> API Keys).
- `RENDER_SERVICE_ID` — Render service id for your backend (Service settings -> Service ID).

Once the secrets are set, pushes to `main` will trigger the workflow. If Render secrets are not configured the workflow will still build and deploy frontend but skip the Render trigger.
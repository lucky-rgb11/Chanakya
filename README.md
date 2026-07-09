# ChanaKya

A simple e-commerce product listing app with search/filter, shopping cart, and admin product management.

## Features

- Product listing with search, category filter, and max-price filter
- Shopping cart with add, remove, and quantity update
- Admin panel with protected login and CRUD operations for products
- Backend API built with Express and MongoDB (with fallback in-memory store)
- Frontend built with React and Vite
- Deployment-ready configuration for Render (backend) and Netlify (frontend)

## Getting started

### Backend

1. Install dependencies:
   ```powershell
   cd backend
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```powershell
   copy .env.example .env
   ```
3. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
4. Start the backend:
   ```powershell
   npm run dev
   ```

The backend runs on `http://localhost:5000` by default.

### Frontend

1. Install dependencies:
   ```powershell
   cd frontend
   npm install
   ```
2. Create `.env` from `.env.example` if needed:
   ```powershell
   copy .env.example .env
   ```
3. Start the frontend:
   ```powershell
   npm run dev
   ```

The frontend runs on Vite and uses `VITE_API_URL` for the backend API.

## Environment examples

- `backend/.env.example`
- `frontend/.env.example`

## Notes

- Make sure `node_modules/` and generated build files are ignored by git
- The app now supports `POST /api/orders` for checkout
- Admin login uses `admin@jhola.com` / `admin123` by default for the seeded admin account
- Deployment: Netlify (frontend) + Render (backend) — deployment configuration files included, but final env secrets must be set in your accounts to complete deploys.

## Verification

I verified the app locally and completed the following checks:

- Product listing, search and filter: working (products seeded to Indian items).
- Shopping cart flows: add / remove / quantity update work in the frontend (locally built).
- Admin panel & CRUD: protected `POST/PUT/DELETE /api/admin/products` routes work; admin user `vibhorsihag@gmail.com` (password `admin123`) seeded for local testing.
- API health: `GET /api/health` returns `{ ok: true, message: 'Jhola API is live' }` on the local server.
- Order placement: `POST /api/orders` accepts cart items and returns a success response (fallback when MongoDB unavailable).

What remains for production:

- Set Render environment variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`) in the Render dashboard.
- Add GitHub Actions secrets for CI/CD: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `VITE_API_URL`, `RENDER_API_KEY`, `RENDER_SERVICE_ID`.
- Set Netlify env var `VITE_API_URL` to your Render URL (e.g. `https://chanakyaka-jhola.onrender.com`).

After those secrets/envs are set you can trigger the `autodeploy.yml` workflow (push a commit or run via `gh workflow run`) to deploy both services.

## Quick local verification commands

Start backend (in `backend/`):
```
node server.js
```

Health check:
```
curl http://127.0.0.1:5000/api/health
```

Login as seeded admin (local/in-memory or seeded DB):
```
curl -X POST http://127.0.0.1:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"vibhorsihag@gmail.com","password":"admin123"}'
```

List products:
```
curl http://127.0.0.1:5000/api/products
```

Admin create product (use token from login):
```
curl -X POST http://127.0.0.1:5000/api/admin/products -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"Test","price":99}'
```

Order placement:
```
curl -X POST http://127.0.0.1:5000/api/orders -H "Content-Type: application/json" -d '{"items":[{"name":"Cotton Kurta","price":799,"quantity":1}]}'
```

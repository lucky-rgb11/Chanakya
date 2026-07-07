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

## Deployment

### Backend (Render)

- Add `render.yaml` to the GitHub repository
- Create a Render web service using the `backend` root
- Set environment variables in Render:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL`

### Frontend (Netlify)

- Connect the GitHub repo to Netlify
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variable `VITE_API_URL` pointing to the deployed backend URL

### GitHub Actions

The repository includes `.github/workflows/autodeploy.yml` to build the frontend and deploy to Netlify, and to optionally trigger Render backend deploys.

## Environment examples

- `backend/.env.example`
- `frontend/.env.example`

## Notes

- Make sure `node_modules/` and generated build files are ignored by git
- The app now supports `POST /api/orders` for checkout
- Admin login uses `admin@jhola.com` / `admin123` by default for the seeded admin account

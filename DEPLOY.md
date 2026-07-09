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
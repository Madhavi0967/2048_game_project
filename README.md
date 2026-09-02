# 2048 Game & Leaderboard

A full-stack 2048 game with smooth tile animations, power-ups, a login/sign-up system, and a MongoDB-backed leaderboard.

## Project Structure

```
2048_game_project/
├── backend/            # Node.js + Express + MongoDB API
│   ├── src/index.ts    # Server & all API routes
│   ├── package.json
│   └── .env            # MONGODB_URI, PORT
└── frontend/           # React + Vite + Tailwind app
    ├── src/
    ├── index.html
    ├── package.json
    └── vite.config.ts  # Proxies /api → backend
```

## Prerequisites

- Node.js (v18 or newer)
- npm

## How to Run

Open **two** Command Prompt / Terminal windows.

### 1. Start the Backend (API + Database)

```
cd backend
npm install
npm run dev
```

The backend starts at **http://localhost:5000**.

You will see a clear message in the terminal:

```
[DATABASE] SUCCESS - Connected to MongoDB.       ← when connected
[DATABASE] FAILED - Could not connect to MongoDB. ← when connection fails
Backend API running at  http://localhost:5000
```

If it says **FAILED**, the app still works using local in-memory storage.

### 2. Start the Frontend (Game UI)

In the second window:

```
cd frontend
npm install
npm run dev
```

The game opens at **http://localhost:5173**.

The frontend automatically sends all `/api` requests to the backend on port 5000, so login, sign-up, and the leaderboard all work together.

## Database Setup (MongoDB)

1. Create a free MongoDB Atlas cluster (https://www.mongodb.com/atlas).
2. Copy your connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`.
3. Paste it into `backend/.env`:

```
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority
PORT=5000
```

4. Restart the backend. You should now see `[DATABASE] SUCCESS - Connected to MongoDB.`

> **Note:** Some home routers / ISPs block the SRV & TXT DNS lookups that
> `mongodb+srv://` URIs need. If that happens, the backend automatically retries
> using public DNS servers (8.8.8.8, 1.1.1.1), so no extra setup is required.

You can check the live database status in the game too: open the **Leaderboard** panel and look at the badge in the top-right corner (`MongoDB Cloud Active` vs `Local / Offline Mode`).

## Production Build

```
cd frontend
npm run build
```

The compiled frontend is output to `frontend/dist`.

## Deploying

This is a two-part app: **backend** (API + database) → **Render**, and **frontend** (React UI) → **Vercel**. This gives you a free, always-on API and a fast CDN-served UI.

### Step 1 — Push your code to GitHub first

Both Render and Vercel deploy from a Git repository, so create a GitHub repo and push the whole project:

```
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

### Step 2 — Deploy the Backend to Render

1. Go to https://render.com and sign up (free).
2. Click **New → Web Service**.
3. Connect your GitHub repo, then set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Under **Environment**, add these variables:
   - `MONGODB_URI` = your MongoDB Atlas string (e.g. `mongodb+srv://Admin:nimda@admin.ec9qryc.mongodb.net/2048_app`)
   - `PORT` = `10000` (Render provides it automatically, you can leave it unset)
5. Click **Create Web Service**. Wait for the first deploy.
6. When it's live, copy the URL — it looks like `https://your-backend.onrender.com`. **Test it** by opening `https://your-backend.onrender.com/api/db-status` — you should see `"isConnected": true`.

> **MongoDB access note:** MongoDB Atlas only allows connections from certain IPs. If Render can't reach it, open your Atlas cluster → **Network Access** → **Add IP Address** → choose **Allow access from anywhere** (`0.0.0.0/0`), or add Render's IP.

### Step 3 — Deploy the Frontend to Vercel

1. Go to https://vercel.com and sign up (free).
2. Click **Add New → Project** and import your GitHub repo.
3. Set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
4. Add a build-time environment variable:
   - `VITE_API_URL` = your Render backend URL, e.g. `https://your-backend.onrender.com`
5. Click **Deploy**.

> **Important:** `VITE_API_URL` is the full URL of the *backend* (no `/api` at the end) and is baked in at build time. If you change it, redeploy Vercel.

### Step 4 — Connect them

In the frontend code, all API calls prepend `VITE_API_URL`. So on Vercel, requests go to `https://your-backend.onrender.com/api/...`. CORS is already enabled in the backend, so login, sign-up, and the leaderboard will work across the two domains automatically.

You're done — open your `https://your-app.vercel.app` URL and play.

## Troubleshooting Deployment

| Problem | Fix |
| ------- | --- |
| Backend shows `Database status: FAILED` | MongoDB Atlas **Network Access** — add `0.0.0.0/0` and confirm `MONGODB_URI` env var is correct. |
| Leaderboard empty / wrong names | Your MongoDB `leaderboard` collection is empty. Play and save a score — it will appear, ranked highest-first. Players with higher scores rank above. |
| Login/signup "Failed to fetch" | Check `VITE_API_URL` on Vercel points to the Render URL, and the Render service is running. |

## API Endpoints

| Method | Endpoint            | Description                        |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/api/db-status`    | MongoDB connection status          |
| GET    | `/api/leaderboard`  | Top scores (optional `boardSize`)  |
| POST   | `/api/leaderboard`  | Save a score                       |
| POST   | `/api/auth/signup`  | Create an account                  |
| POST   | `/api/auth/login`   | Log in to an account               |

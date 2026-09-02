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

## API Endpoints

| Method | Endpoint            | Description                        |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/api/db-status`    | MongoDB connection status          |
| GET    | `/api/leaderboard`  | Top scores (optional `boardSize`)  |
| POST   | `/api/leaderboard`  | Save a score                       |
| POST   | `/api/auth/signup`  | Create an account                  |
| POST   | `/api/auth/login`   | Log in to an account               |

// Base URL of the backend API.
//
// Local development: the Vite dev server proxies /api to the backend, so an
// empty string works (requests go to the same origin).
//
// Production (Vercel): set the VITE_API_URL environment variable at build time
// to your Render backend URL, e.g.  https://your-backend.onrender.com
export const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '';

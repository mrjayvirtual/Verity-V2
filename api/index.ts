/**
 * Vercel Serverless Function — wraps the Express app.
 * Vercel routes all /api/* requests here via vercel.json rewrites.
 *
 * Required environment variables in Vercel dashboard:
 *   Google_Api_key  — Google AI Studio key
 *   SESSION_SECRET  — Express session secret
 *   DATABASE_URL    — PostgreSQL connection string (e.g. Neon, Supabase, Vercel Postgres)
 */
import app from "../artifacts/api-server/src/app";

export default app;

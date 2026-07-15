/**
 * Vercel Serverless Function — wraps the Express app.
 *
 * Vercel's @vercel/node runtime uses esbuild to compile this TypeScript file
 * and bundles all imports (including pnpm workspace packages) automatically.
 *
 * All /api/* requests are routed here via the rewrites in vercel.json.
 *
 * Required environment variables (set in Vercel dashboard):
 *   Google_Api_key  — Google AI Studio key (mixed-case, match exactly)
 *   SESSION_SECRET  — Express session signing secret
 *   DATABASE_URL    — PostgreSQL connection string
 */
import app from "../artifacts/api-server/src/app";

export default app;

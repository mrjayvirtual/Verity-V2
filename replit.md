# Verity V2 — AI Claim Intelligence Platform

A premium AI-powered claim intelligence engine that analyzes the quality of reasoning, credibility of claims, evidence strength, and communication reliability in written text. Built by MRJAYVIRTUAL.

> **Not a fact-checker.** Verity analyzes communication quality and reasoning patterns — not factual truth.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/verity-v2 run dev` — run the Verity V2 frontend (port 23019)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Required Secrets

- `Google_Api_key` — Google AI Studio API key (powers Gemini claim analysis)
- `SESSION_SECRET` — Express session secret
- `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5 with Gemini AI (`@google/generative-ai`)
- AI Model: `gemini-2.0-flash` via Google AI Studio API key
- DB: PostgreSQL + Drizzle ORM (scan history storage)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/db/src/schema/scans.ts` — Drizzle schema for scan history (JSONB result storage)
- `artifacts/api-server/src/routes/analyze.ts` — Gemini AI analysis route (`POST /api/analyze`)
- `artifacts/api-server/src/routes/scans.ts` — Scan history CRUD (`/api/scans`)
- `artifacts/verity-v2/src/` — React frontend (dark theme, animated gauges, claim flags, history)

## Architecture decisions

- **Gemini via direct SDK**: Uses `@google/generative-ai` with `responseMimeType: "application/json"` for reliable structured output. Model: `gemini-2.0-flash`.
- **JSONB for result storage**: Full `AnalysisResult` stored as JSONB in Postgres — avoids schema churn as the AI output schema evolves.
- **Stats computed in-memory**: Scan stats aggregated server-side from DB rows (acceptable for personal-scale use).
- **No fact-checking claims**: Core brand rule — every analysis response includes a `analysisDisclaimer` field enforced server-side.
- **Route ordering**: `/scans/stats` registered before `/scans/:id` in Express to prevent routing conflict.

## Product

Seven AI-generated scores per analysis:
1. Communication Reliability
2. Reasoning Quality  
3. Evidence Strength
4. Confidence Calibration
5. Source Quality
6. Transparency
7. Overall Trust Signal

Plus: claim flags (expandable), writing style estimates, risk level, scan history, and aggregate stats.

## User preferences

- Brand: VERITY | AI Claim Intelligence
- Built by MRJAYVIRTUAL | Creativity Meets Technology
- Contact: mrjayvirtual@proton.me
- LinkedIn: https://www.linkedin.com/in/joshua-ikpendu
- GitHub: https://github.com/mrjayvirtual
- Dark theme only
- No emojis in UI

## Gotchas

- `Google_Api_key` is the secret name (mixed case, not `GOOGLE_API_KEY`) — match exactly in `process.env.Google_Api_key`
- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen` before touching routes
- `/scans/stats` MUST be registered before `/scans/:id` in the Express router

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# Verity V2 — AI Claim Intelligence Platform

> **Not a fact-checker.** Verity analyzes the *quality* of reasoning, communication reliability, evidence strength, and confidence calibration in written text. It does not verify factual truth.

Built by **MRJAYVIRTUAL** · Creativity Meets Technology

---

## What It Does

Paste any piece of writing — a news headline, article excerpt, social post, report, or argument — and Verity scores it across 7 intelligence dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| Communication Reliability | Overall signal trustworthiness |
| Reasoning Quality | Logic structure, fallacies, inference strength |
| Evidence Strength | Specificity and verifiability of supporting claims |
| Confidence Calibration | Whether confidence matches the evidence on hand |
| Source Quality | Named, authoritative, or verifiable references |
| Transparency | Disclosure of limitations, bias, and methodology |
| Overall Trust Signal | Composite weighted score |

Each scan also returns:
- **Claim flags** — specific phrases tagged with category, severity, and reasoning
- **Writing style estimates** — reading level, tone, formality
- **Risk level** — `low` / `medium` / `high` / `critical`
- **Intelligence Summary** — human-readable narrative
- **Scan history** — all past analyses stored and searchable

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| Backend | Express 5 + Node.js 24 + TypeScript |
| AI Engine | Google Gemini (`gemini-3.5-flash` via `@google/generative-ai`) |
| Database | PostgreSQL + Drizzle ORM (JSONB result storage) |
| API Contract | OpenAPI 3.1 → Orval codegen (typed hooks + Zod validators) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
verity-v2/
├── artifacts/
│   ├── api-server/          # Express API (port 8080)
│   │   └── src/routes/
│   │       ├── analyze.ts   # POST /api/analyze — Gemini AI call
│   │       └── scans.ts     # CRUD /api/scans + /api/scans/stats
│   └── verity-v2/           # React frontend
│       └── src/
│           ├── pages/home.tsx
│           └── components/
│               ├── Dashboard.tsx      # Score gauges + radar chart
│               ├── InputSection.tsx   # Textarea + live readability
│               ├── RadarChart.tsx     # Animated hexagonal spider chart
│               ├── TypewriterText.tsx # Animated summary reveal
│               ├── LiveReadability.tsx# Real-time Flesch score
│               ├── BeaconLight.tsx    # Cinematic scanning beam
│               └── PhoenixLogo.tsx    # Brand emblem
├── lib/
│   ├── api-spec/openapi.yaml  # API source of truth
│   ├── api-client-react/      # Orval-generated React Query hooks
│   ├── api-zod/               # Orval-generated Zod validators
│   └── db/src/schema/         # Drizzle schema (scansTable)
└── pnpm-workspace.yaml
```

---

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Google AI Studio API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/mrjayvirtual/Verity-V2.git
cd Verity-V2
pnpm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `Google_Api_key` | Google AI Studio API key (mixed-case — must match exactly) |
| `SESSION_SECRET` | Random string for Express session signing |
| `DATABASE_URL` | PostgreSQL connection string |

> ⚠️ The secret name is `Google_Api_key` (not `GOOGLE_API_KEY`). The server reads `process.env.Google_Api_key` — match it exactly.

### 3. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Run (Development)

In two separate terminals:

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 5173 or configured port)
pnpm --filter @workspace/verity-v2 run dev
```

---

## API Reference

### `POST /api/analyze`

Analyze a piece of text.

**Request body:**
```json
{ "text": "string (50–50000 chars)" }
```

**Response:**
```json
{
  "scores": {
    "communicationReliability": 72,
    "reasoningQuality": 65,
    "evidenceStrength": 40,
    "confidenceCalibration": 58,
    "sourceQuality": 35,
    "transparency": 50,
    "overallTrustSignal": 55
  },
  "flags": [
    {
      "type": "Unsupported statistic",
      "category": "Evidence",
      "severity": "high",
      "snippet": "...",
      "reasoning": "..."
    }
  ],
  "riskLevel": "medium",
  "intelligenceSummary": "...",
  "writingStyle": { "readingLevel": "...", "tone": "...", "formality": "..." },
  "analysisDisclaimer": "This is an analysis of communication quality...",
  "analysedAt": "2026-07-14T00:00:00.000Z",
  "wordCount": 142,
  "sentenceCount": 8
}
```

### `GET /api/scans` — Scan history (paginated)
### `GET /api/scans/stats` — Aggregate stats
### `GET /api/scans/:id` — Single scan
### `DELETE /api/scans/:id` — Delete scan

Full spec: [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml)

---

## AI Model

Verity uses a model cascade on every request, trying in order:

1. `gemini-3.5-flash` ← primary
2. `gemini-2.0-flash`
3. `gemini-2.0-flash-lite`
4. `gemini-2.5-flash`
5. `gemini-2.5-flash-lite`

The v1beta API endpoint is used for all models — `responseMimeType: "application/json"` requires it (unavailable in the v1 stable API).

---

## Regenerate API Client

After editing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates typed React Query hooks in `lib/api-client-react` and Zod validators in `lib/api-zod`.

---

## Architecture Notes

- **JSONB result storage** — Full `AnalysisResult` stored as JSONB in Postgres. Avoids schema churn as AI output evolves.
- **Route ordering** — `/scans/stats` must be registered before `/scans/:id` in Express to prevent the wildcard eating the stats route.
- **No fact-checking claims** — Every response includes `analysisDisclaimer` enforced server-side. Core brand rule.

---

## Contact

**MRJAYVIRTUAL** · Creativity Meets Technology  
mrjayvirtual@proton.me  
[linkedin.com/in/joshua-ikpendu](https://www.linkedin.com/in/joshua-ikpendu)  
[github.com/mrjayvirtual](https://github.com/mrjayvirtual)

---

*Verity does not verify facts. It analyzes how well reasoning is communicated.*

# Verity V2

**AI Claim Intelligence Engine** - Analyze communication quality, reasoning patterns, and evidence signals

## Overview

Verity V2 is a web application that analyzes claims and statements for:
- **Communication Reliability** - Clarity, precision, and language quality
- **Reasoning Quality** - Logical coherence and valid inferences
- **Evidence Strength** - Quality and quantity of supporting evidence
- **Confidence Calibration** - Alignment between expressed confidence and evidence
- **Source Quality** - Named sources, experts, and citations
- **Transparency** - Acknowledgment of assumptions and limitations
- **Overall Trust Signal** - Holistic assessment

**Important:** This tool analyzes *communication quality*, not factual truth.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Backend API:** Express.js + TypeScript
- **AI:** Google Generative AI (Gemini)
- **Database:** PostgreSQL + Drizzle ORM
- **Deployment:** Vercel
- **Monorepo:** pnpm workspaces

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express API server
│   ├── verity-v2/           # React frontend (Vite)
│   └── db/                  # Database schema & migrations
├── packages/
│   ├── api-client-react/    # React hooks for API
│   ├── api-zod/             # API validation schemas
│   └── shared-types/        # Shared TypeScript types
├── api/                     # Vercel serverless handler
└── vercel.json              # Vercel configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (for production)
- Google AI API key (get one at [Google AI Studio](https://aistudio.google.com/apikey))

### Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
pnpm dev
```

### Build

```bash
# Build all packages
pnpm build

# Build specific workspace
pnpm --filter @workspace/verity-v2 build
pnpm --filter @workspace/api-server build
```

### Type Checking

```bash
pnpm typecheck
```

## API Endpoints

### `POST /api/analyze`

Analyze a claim or statement.

**Request:**
```json
{
  "text": "Your claim or statement here"
}
```

**Response:**
```json
{
  "scores": {
    "communicationReliability": 75,
    "reasoningQuality": 68,
    "evidenceStrength": 82,
    "confidenceCalibration": 70,
    "sourceQuality": 65,
    "transparency": 72,
    "overallTrustSignal": 72
  },
  "flags": [...],
  "writingStyle": [...],
  "summary": "...",
  "riskLevel": "medium",
  "wordCount": 150,
  "sentenceCount": 8,
  "readabilityScore": 75
}
```

### `GET /api/healthz`

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### `GET /api/scans`

List recent scans.

### `POST /api/scans`

Create a new scan.

### `GET /api/scans/:id`

Get a specific scan.

### `DELETE /api/scans/:id`

Delete a scan.

### `GET /api/scans/stats`

Get aggregate statistics.

## Environment Variables

See `.env.example` for all required variables:

```bash
# Google AI
Google_Api_key=your_gemini_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/verity

# Session
SESSION_SECRET=your_secret_key

# Node
NODE_ENV=production
```

## Deployment

The app is deployed on Vercel:

**Production:** https://verity-v2.vercel.app

### Vercel Configuration

- **Framework:** None (custom)
- **Build Command:** `pnpm --filter @workspace/verity-v2 run build`
- **Output Directory:** `artifacts/verity-v2/dist/public`
- **API Route:** `api/index.ts` (serverless function)

## Contributing

1. Create a feature branch
2. Make changes
3. Run `pnpm typecheck` to verify types
4. Commit with clear messages
5. Push and create a pull request

## License

MIT

## Support

For issues or questions, please open an GitHub issue.

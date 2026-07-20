# FieldLink — Remote Field Technician Support Portal

A proof-of-concept multi-step repair workflow for field technicians, built with Next.js 15 App Router and a separate Express + WebSocket backend.

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # optional: set NEXT_PUBLIC_WS_URL
npm run dev                         # http://localhost:3000
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add GROQ_API_KEY for live AI expert (optional)
npm run dev                         # http://localhost:3001
```

Both servers must run simultaneously for the real WebSocket expert channel. The frontend falls back to the mock hook automatically if the backend is unreachable.

---

## Architecture

### Why a separate backend?

The assignment explicitly notes that persistent WebSocket connections and heavy video blob processing should not tie up the Next.js server. The Express backend owns exactly two concerns:

1. **Real-time WebSocket expert channel** — a persistent WS connection per technician session. Next.js Route Handlers are stateless HTTP; they cannot hold a long-lived socket. The backend keeps the connection alive across tab switches and network hiccups.
2. **Video upload endpoint** (`POST /api/recordings`) — multer streams the blob to disk without blocking the Next.js process. In production this would pipe directly to S3.

Everything else stays in Next.js.

### Next.js paradigm choices

| Concern | Mechanism | Why |
|---|---|---|
| Page shell, fonts, metadata | Server Component (`layout.tsx`) | Zero client JS for static chrome |
| Job config, prep, activity, analysis pages | `"use client"` pages | All require browser state (localStorage, timers, MediaRecorder, WebSocket) |
| Stage cookie writes | Server Actions (`app/actions.ts`) | UI-driven mutations — `markPrepDone`, `markActivityStarted`, `saveProgress`, `finalizeJob`. No REST boilerplate needed |
| Backend reachability check | Route Handler (`app/api/health/route.ts`) | RESTful boundary — frontend pings it to decide real-WS vs mock fallback. Deliberate Route-Handler-vs-Action choice |
| Route protection | `middleware.ts` + `rftsp_stage` cookie | Runs at the edge before any page renders; blocks direct `/activity` URL without a round-trip |
| Tab components | `next/dynamic` lazy imports + `<Suspense>` | Heavy tabs (webcam, MediaRecorder, chat) are only downloaded when the user reaches them |
| Loading states | `app/loading.tsx` + skeleton fallback in `<Suspense>` | Covers both route transitions and lazy-tab hydration |

### State management

- **localStorage** (continuous) — every keystroke and state change is persisted immediately via `useJobState`. Survives refresh.
- **Server Action snapshot** — called on each tab lock and on job finish. Writes the `rftsp_stage` cookie so middleware can verify progress server-side.
- **Deadline-based timer** — `activityDeadline` is stored as an epoch timestamp, not a countdown. Survives page refresh and tab switches.

### Client vs Server component boundary

Browser-only APIs (`MediaRecorder`, `getUserMedia`, `WebSocket`, `speechSynthesis`, `localStorage`) are isolated in `"use client"` components and hooks. The `typeof window === "undefined"` guard in `lib/jobState.ts` and `hooks/useMockExpertConnection.ts` prevents SSR evaluation. Server Components (`layout.tsx`, `Navbar`) never import these.

### Bonus: Real AI expert

Set `GROQ_API_KEY` in `backend/.env`. The WS handler calls `llama-3.1-8b-instant` via the Groq SDK for each technician message. Falls back to the scripted mock on any API error or missing key. TTS via `window.speechSynthesis` speaks every expert reply aloud.

---

## Project Structure

```
.
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Server Component — shell, fonts, metadata
│   │   ├── loading.tsx         # Next.js loading UI for route transitions
│   │   ├── page.tsx            # Phase 1: Job Configuration
│   │   ├── actions.ts          # Server Actions — stage cookie mutations
│   │   ├── api/health/         # Route Handler — RESTful health/WS-check
│   │   ├── prep/page.tsx       # Phase 2: Pre-deployment Briefing
│   │   ├── activity/page.tsx   # Phase 3: Support Workspace
│   │   └── analysis/page.tsx   # Phase 4: Performance Analysis
│   ├── components/
│   │   ├── tabs/               # Lazy-loaded tab components (ScopingTab, DocumentationTab, QATab)
│   │   ├── ChatPanel.tsx       # Reusable chat UI
│   │   ├── WebcamPreview.tsx   # getUserMedia + live preview
│   │   ├── RecorderControls.tsx# MediaRecorder API
│   │   ├── Timer.tsx           # useCountdown, useDeadlineCountdown, TimerRing
│   │   └── ...
│   ├── hooks/
│   │   ├── useJobState.ts      # localStorage persistence + hydration guard
│   │   └── useMockExpertConnection.ts  # Mock WS hook with TTS
│   ├── lib/jobState.ts         # Types, constants, storage helpers
│   └── middleware.ts           # Edge route guard via rftsp_stage cookie
└── backend/
    ├── src/index.js            # Express + WebSocketServer + Groq + multer
    └── uploads/                # Temporary video blob storage
```

# LoopedIn Vox — overview & deployment

**LoopedIn Vox** is the live-insights layer on top of LoopedIn. As members answer
questions, Vox turns raw answers into synthesized intelligence: emerging themes,
urgent signals, sentiment, demographics, response-health, and cross-question /
cross-org trends. It is built from the [LoopedIn Vox Dashboard Brief].

It is **read-only over LoopedIn data** and lives in this monorepo as an isolated
surface, so it cannot interfere with the member / researcher / admin apps.

## What was added (all additive)

| Area | Files |
| ---- | ----- |
| Data model | `server/prisma/schema.prisma` — 4 new tables: `Theme`, `SynthesisRun`, `UrgentSignal`, `AnswerEnrichment`. The existing `Member/Org/Question/Answer` models are **untouched**; Vox references them by id string, never a relation. |
| Synthesis engine | `server/src/vox/synthesis.ts` — two-model pipeline (cheap embeddings + clustering → Claude final synthesis), swappable & config-gated. |
| Urgent signals | `server/src/vox/detect.ts` — rules-first classifier (+ optional Claude on borderline). |
| Suppression | `server/src/vox/suppression.ts` — the single §6 enforcement function for org-facing output. |
| Mock data | `server/src/vox/mock.ts`, `server/src/vox/seed-vox.ts` — 5 real session topics × synthetic answers, planted triggers, one thin demographic slice. |
| Signal export | `server/src/vox/export.ts` — the §11 Signal feeder seam. |
| API | `server/src/routes/vox.ts` mounted at `/api/vox` (internal / org / export). |
| Frontend | `web/vox.html`, `web/src/vox/*`, `web/src/styles/vox.css` — the dashboard (all six surfaces, Internal⇄Org). |

## The permission boundary (load-bearing)

Two consumers, enforced at the **data-access layer**, not just hidden in the UI:

- **Internal (RBL1)** → maps to admin/staff. Sees every org, cross-org synthesis,
  raw unsuppressed cells, and the urgent-signal queue. Open in this demo (like the
  existing admin routes — gate behind a staff role before launch).
- **Org** → maps to `buyer`. Scoped to its **own** questions only; `refId` is
  always the authenticated org id. Every demographic output passes through the
  suppression function; cross-org synthesis and urgent signals are **unreachable**.

Min cell size is `VOX_MIN_CELL` (default 5); thin and rare-combination cells render
"suppressed for privacy". Race/ethnicity is aggregate-only, never a slicer.

## Run it

Vox is seeded automatically by the normal flow:

```bash
npm run setup        # installs, pushes schema (incl. Vox tables), seeds (incl. Vox)
npm run dev          # API :4000 + web :5173
# open http://localhost:5173/vox.html  (toggle Internal · RBL1  /  Org view)
```

Vox-only reseed: `npm --workspace server run seed:vox`.

### Configuration (env)

| Var | Default | Purpose |
| --- | ------- | ------- |
| `ANTHROPIC_API_KEY` | _unset_ | When set, synthesis uses Claude and the borderline urgent-signal check runs. Unset → deterministic local fallback (free/offline); the demo ships this way. |
| `VOX_SYNTHESIS_MODEL` | `claude-sonnet-4-6` | Final-synthesis model. |
| `VOX_EMBED_PROVIDER` | `local` | Embedding seam for clustering (local fallback by default). |
| `VOX_SYNTHESIS_INTERVAL_HOURS` | `24` | Scheduled cadence — tune without a code change. |
| `VOX_MIN_CELL` | `5` | Org-view suppression floor. |

## Deployment — a **separate** Vercel project (recommended)

The static dashboard runs on the baked demo data in `web/src/vox/data.ts` (no
backend needed), exactly like LoopedIn's own Vercel build. The existing
`npm run build` already emits `web/dist/vox.html`, so **the root `vercel.json` is
left unchanged** — zero interference with the live LoopedIn project.

To put Vox on its own subdomain, create a **second Vercel project from this same
repo**:

1. Vercel → **Add New → Project** → import this repo (a repo can back multiple
   projects).
2. Settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `web/dist`
   - **Rewrite** so the domain root serves the Vox page, plus the same security
     headers as the main project. Add a project-level `vercel.json` (or set these
     in the dashboard):
     ```json
     {
       "rewrites": [{ "source": "/", "destination": "/vox.html" }],
       "headers": [{ "source": "/(.*)", "headers": [
         { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
         { "key": "X-Content-Type-Options", "value": "nosniff" },
         { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
         { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
         { "key": "Content-Security-Policy", "value": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'" }
       ]}]
     }
     ```
3. Assign a domain (e.g. `vox.weloopedin.com`) and its own `SITE_PASSWORD` gate.

This keeps deploys, env, uptime, and the password gate **independent** of LoopedIn.

### Full-stack (live synthesis engine)

For the real engine (Claude synthesis, live detection, the export API), deploy the
server the same way as LoopedIn's Render blueprint — the Express server serves
`/api/vox/*` and the built frontend same-origin. Point `web/src/vox/api.ts` at the
live routes instead of the demo data, set `ANTHROPIC_API_KEY`, and (for a hard
non-interference guarantee on a shared DB) give Vox a **read-only DB role** on the
LoopedIn tables — it writes only its own four derived tables.

## Signal export seam (§11)

LoopedIn Vox is one feeder into **Signal** (RBL1's separate intelligence layer).
Direction is one-way (Vox → Signal). Only synthesized, de-identified,
suppression-cleared artifacts cross the boundary — never raw answers, member rows,
or urgent signals.

- `GET /api/vox/export/themes?scope=cross_org|org|question`
- `GET /api/vox/export/trends?scope=…`

Payload is versioned (`version: "1.0"`). Theme export shape:

```jsonc
{
  "version": "1.0",
  "kind": "themes",
  "generatedAt": "<iso>",
  "themes": [{
    "id": "…", "scope": "cross_org", "label": "…", "summary": "…",
    "weightPct": 34, "answerCount": 23, "sentimentScore": -0.55,
    "demographics": { "< $30k": 12 },     // only cells that cleared the floor
    "representativeQuoteIds": ["R-2825"]  // coded ids only
  }]
}
```

Signal-side ingestion is out of scope for this build — ship the export, stop.

[LoopedIn Vox Dashboard Brief]: ./LoopedIn_Vox_Dashboard_Brief.md

# CLAUDE.md — LoopedIn

Orientation for AI coding agents working in this repo. Read this first, then the
sources of truth below.

## Sources of truth (read before non-trivial work)
- **`README.md`** — technical brief: stack, data flow, full API surface, run/deploy.
- **Master Project Brief** (`LoopedIn — Master Project Brief`, owner Sergio Marrero / RBL1)
  — the definitive **product, UX, economic-model, and guardrail** spec. The design
  handoff package + demo are the definitive UX/UI spec; where this file is silent,
  defer to the brief and the existing prototype in `prototype/`.

## What this is
LoopedIn is a paid community-research network. Three surfaces + a landing page:
- **Member app** (respondent) — answer short questions anonymously, earn **points**. `web/src/member` → `web/member.html`
- **Researcher console** (organizations/"buyers") — compose questions, target, fund with points, read **anonymized** results. `web/src/orgs` → `web/orgs.html`
- **Admin review** — every question is reviewed before going live. `web/src/orgs` (role toggle)
- **Landing** — "two doors" page. `web/index.html`

The loop: **org composes → admin approves → member answers → anonymized responses flow back**.

### Sibling: LoopedIn Vox (live insights)
A **read-only** insights layer on top of LoopedIn's response data: emerging
themes, urgent signals, sentiment, demographics, response-health, and
cross-question/cross-org trends. `web/src/vox` → `web/vox.html`; API at
`server/src/routes/vox.ts` (`/api/vox`) + `server/src/vox/*`. It **only reads**
`Member/Org/Question/Answer` and writes only its own four additive tables
(`Theme/SynthesisRun/UrgentSignal/AnswerEnrichment`) — it must not mutate LoopedIn
data or touch the member/orgs/landing apps. Hard **Internal (RBL1) vs Org**
permission boundary enforced at the data layer (§6 suppression). Deploys as a
**separate Vercel project**. See `docs/vox-deploy.md` and the in-repo brief
`docs/LoopedIn_Vox_Dashboard_Brief.md`.

## Stack & layout
- Frontend: Vite + React + TypeScript (multi-page). Backend: Express + Prisma + SQLite. Auth: JWT.
```
web/      frontend (index/member/orgs .html + src/{member,orgs,landing,styles}, src/api.ts)
server/   Express + Prisma + SQLite (prisma/schema.prisma, src/routes/{member,org,admin}.ts, src/seed.ts)
prototype/ original standalone bundles (reference only)
middleware.ts  Edge password gate
vercel.json    Vercel build + clean-URL rewrites + security headers
render.yaml    full-stack (API+DB) one-click deploy blueprint
```

## Commands
```bash
npm run setup     # install + create & seed DB
npm run dev       # API (:4000) + web (:5173) together; dev proxies /api -> :4000
npm run build     # build frontend -> web/dist
npm run start     # NODE_ENV=production: server serves API + built frontend on :4000
```

## LOAD-BEARING INVARIANTS — do not break these
These are product/legal requirements from the brief, not stylistic preferences:
- **Anonymity:** organizations NEVER see member names or full address. Only coded IDs
  (e.g. `R-2841`), aggregate output, and profile-attribute chips. ZIP is stored for
  matching; only **city-level** is exposed to buyers.
- **Race/ethnicity is collected for aggregate output ONLY — never a targeting filter** on any plan. Intentional, legal/reputational.
- **Economic model:** points shown everywhere; **100 pts = $1.00**. Stored internally as
  **cents (integers)**. Point-per-response ladder is **fixed**: None/50/100/150/200 (no
  free-entry). **Free plan = None only.** Cashout tiers ($5/$25/$50) are "coming soon" — points accrue but **no real money leaves the platform yet**.
- **Every question** (all plans, incl. free no-reward posts) goes through **admin review** before going live.
- **Design system (Rebel One):** Inter only; **orange `#e8530e` is the ONLY accent** —
  never add a second. No icon system (numbered badges + `→` arrow; one lock glyph for
  gated controls allowed). No emoji, gradients, or drop shadows (only the soft orange
  hover shadow). Headlines short, end with a period; nav/buttons/eyebrows UPPERCASE.
  Motion functional only (.2–.3s).

## Current deployment state (June 2026)
- **Live:** `https://www.weloopedin.com` via **Vercel** — `/` landing, **`/member`**, **`/researcher`** (clean URLs via `vercel.json`; `/orgs.html` & `/member.html` 301 → clean paths).
- ⚠️ **The Vercel deploy is FRONTEND-ONLY** (static `web/dist`, demo/offline mode: seed
  data + `localStorage`). The Express/Prisma backend is **not hosted there**. For a real
  full-stack deploy use the **Render** blueprint (`render.yaml`) — API serves the frontend
  same-origin so `/api` works. For scale, switch Prisma SQLite → PostgreSQL.
- **Password gate:** whole site is gated by `middleware.ts` via the **`SITE_PASSWORD`**
  env var (set in Vercel). If the env var is unset, the gate is OFF (won't brick prod).
- **Security headers** live in `vercel.json` (HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP — CSP tested at 0 violations; keep `style-src 'unsafe-inline'` for the apps' inline styles).
- DNS at Squarespace: `A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com`; email locked (SPF/DKIM/DMARC).

## Conventions & gotchas (learned the hard way)
- **Naming:** the buyer side is labeled **"Researcher"** in the UI, but the internal role
  value is still `'buyer'` and the localStorage key is `loopedin-buyer-v1`. Don't rename
  the internal value — it preserves persisted state.
- **Accessibility/mobile overhaul** has been applied to the **researcher console only**
  (`web/src/orgs`). The **member app has NOT had the same pass** yet — it's a known follow-up.
- **Deploys go through `main`** → Vercel auto-builds production; every branch/PR gets a
  preview URL. Work on a branch, PR, merge to `main`.
- **Squash-merge caveat:** this repo squash-merges PRs. If you keep committing to the same
  long-lived branch after a squash merge, `vercel.json` will conflict on the next PR
  (branch history ≠ squashed `main`). Fix: merge `origin/main` into the branch and keep the
  branch's (superset) `vercel.json`. Best practice: reset/rebranch off fresh `main` per change.
- The orgs console keeps a demo **Tweaks panel** (theme/density/voice) and a **Buyer/Admin**
  role switch — these are intentional demo aids.
- Admin routes are intentionally **open** in this demo — gate behind a staff role before real launch.

## Still to build (from the brief)
Backend hosting/persistence, real auth, payments + cashout, identity/lived-experience
verification, voice transcription, full review workflow at scale, member-app a11y pass.
See brief §11 (Engineering scope) and §12 (Open decisions).

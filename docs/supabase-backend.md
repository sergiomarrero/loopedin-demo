# LoopedIn — Supabase backend

The production database for LoopedIn is **Supabase Postgres**:

| | |
|---|---|
| Project | `loopedin` |
| Ref | `sygeaxmjmkwedwkvoopb` |
| Org | Rebel One (`fbeiwgzbocqpnutrsnkm`) |
| Region | us-east-1 |
| Dashboard | https://supabase.com/dashboard/project/sygeaxmjmkwedwkvoopb |

Two consumers, one database:
- **This repo's Express + Prisma server** (full-stack deploys, e.g. Render) —
  plain Prisma over the Postgres connection string.
- **`sergiomarrero/loopedin-research`** (loopedin.rbl1.com) — Next.js route
  handlers via supabase-js with the server-only secret key. That repo owns the
  researcher console going forward.

## State (July 2026)

- Schema applied via migrations `loopedin_initial_schema` +
  `org_member_identity` — the 8 LoopedIn/Vox tables (identical to the SQLite
  dev schema, generated from `server/prisma/schema.postgres.prisma` with
  `prisma migrate diff`) plus `OrgMember` (email → org + role, used by
  loopedin-research's identity layer).
- Fully seeded with the canonical seed output (`server/src/seed.ts` +
  `server/src/vox/seed-vox.ts`): 75 members, 6 orgs, 19 questions, 75 answers,
  32 themes, 11 synthesis runs, 7 urgent signals, 69 enrichments — verified
  row-for-row against a fresh local seed. (Enrichment `embedding` is seeded
  `'[]'`: synthesis recomputes embeddings from answer text and never reads the
  stored column.)
- **RLS is enabled on every table with no policies.** Idempotent to re-push
  and re-seed (seeding uses `ON CONFLICT DO NOTHING` / upserts).

## Two Prisma schemas (keep in sync)

| Schema | Provider | Used for |
|---|---|---|
| `server/prisma/schema.prisma` | sqlite | local dev — `npm run setup` / `npm run dev` keep working offline with zero config |
| `server/prisma/schema.postgres.prisma` | postgresql | production / Supabase |

Same models in both — **if you touch one, mirror the change in the other.**
(Single-schema would force every local dev setup to carry a Postgres URL;
this keeps the zero-config dev loop.) The `OrgMember` table exists only in
Supabase for now (created by loopedin-research's migration); add it to both
schemas here if the Express server ever needs it.

## Point the server at Supabase

```bash
# server/.env — get the exact string from Dashboard → Connect
# (Direct connection, or Session pooler for IPv4-only networks)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.sygeaxmjmkwedwkvoopb.supabase.co:5432/postgres"

cd server
npm run generate:pg   # regenerate the Prisma client from the postgres schema
npm run db:push:pg    # sync schema (no-op when already in sync)
npm run seed          # idempotent
npm run dev           # or: start
```

Render: `render.yaml` is already wired — it builds with
`npm run deploy:build:supabase` and prompts for `DATABASE_URL` on first apply.

## Security posture

- The intended access paths are server-side only: Prisma over the direct
  Postgres connection (`postgres` role owns the tables and bypasses RLS), and
  loopedin-research's supabase-js client with the secret key.
- RLS enabled + zero policies ⇒ Supabase's Data API (PostgREST with the
  anon/publishable key) can read and write **nothing**. This is load-bearing
  for the anonymity invariant: `Member.email/phone` must never be reachable
  from a browser key.
- Keep it that way: do not add RLS policies or browser-side supabase-js
  clients without revisiting the anonymity rules in `CLAUDE.md`.
- Connection string and secret key are server-only secrets. Never
  `NEXT_PUBLIC_`/`VITE_` them.

## weloopedin.com stays disconnected (deliberate)

The Vercel deploy of `weloopedin.com` (landing + `/member`) is **frontend-only
demo mode**: its `/api` calls 404 and every call site falls back to seed data +
localStorage. Do **not** connect it to this database — that deploy is the
public demo, and keeping it stateless is intentional. The researcher console
retired from here (`/researcher` now redirects to loopedin.rbl1.com).

## Housekeeping

- A second, older Supabase project named **"LoopedIn"** (ref
  `kisvijmgaciomuqhntds`, us-west-2) exists in the org but is **INACTIVE**
  (paused, predates this work). It is unused by this repo — delete it from the
  dashboard if it's not wanted, or restore it and migrate if it holds anything
  valuable.
- New-project cost note: the `loopedin` project bills at the org's standard
  $10/month project rate.

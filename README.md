# LoopedIn

> Close the loop. We pay everyday people to answer the questions that shape their
> communities — and we get those answers to the organizations doing the work.

LoopedIn is a paid community-research platform with two sides and a review step
that ties them together:

- **Members (respondents)** — an iOS-styled app where people answer short
  questions about their lives and communities, stay anonymous, and earn points
  (cash & rewards). `web/src/member`
- **Organizations (buyers)** — a console where orgs compose questions, target an
  audience, fund them with points, and read back **anonymized** results.
  `web/src/orgs`
- **Admin review** — every org question is reviewed before it reaches members.
  Approve → it goes **live and into the member feed**. Reject → the org is
  refunded.

This is the full loop: **org composes → admin approves → member answers →
responses flow back to the org**, all backed by a real API and database.

## Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Frontend | Vite + React + TypeScript (multi-page)          |
| Backend  | Express + Prisma + SQLite                       |
| Auth     | JWT (email + phone identity)                    |

The UI was ported faithfully from the original clickable prototypes (kept in
[`prototype/`](./prototype) for reference) into a real, runnable project.

## Project layout

```
web/                 Vite + React + TS frontend
  index.html         Marketing landing (the split "two doors" page)
  member.html        Respondent app entry      -> src/member/app.tsx
  orgs.html          Buyer console entry        -> src/orgs/app.tsx
  src/api.ts         Backend API client
  src/styles/        Design tokens + per-app CSS
server/              Express + Prisma + SQLite API
  prisma/schema.prisma
  src/routes/        member.ts · org.ts · admin.ts
  src/seed.ts        Seed feed catalog, demo org campaigns, sample responses
prototype/           Original standalone prototype bundles (reference only)
```

## Getting started

```bash
# 1. Install everything and create + seed the database
npm run setup

# 2. Run the API (:4000) and the web app (:5173) together
npm run dev
```

Then open:

- http://localhost:5173/ — landing
- http://localhost:5173/member.html — respondent app
- http://localhost:5173/orgs.html — orgs console (toggle **Buyer / Admin** bottom-right)

The dev server proxies `/api` → `http://localhost:4000`.

### Environment

`server/.env` (copied from `server/.env.example`) holds:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
PORT=4000
```

## How the data flows

1. A signed-in org composes a question in **Compose**. If it carries a point
   reward, the cost (`points × target`) is debited from its balance and the
   question is created as `pending`.
2. In **Admin**, the question appears in the review queue. **Approve** sets it
   `live` and tags it for the member feed; **reject** refunds the org.
3. **Members** see live questions, answer them, and earn the reward into their
   wallet. The first answer prompts them to *claim* (save) their earnings with
   an email + phone — which registers them and persists everything.
4. Back in **Responses**, the org reads the anonymized answers (coded id +
   profile attributes only — never names).

## API surface (brief)

```
POST /api/member/register        email + phone -> token
GET  /api/member/me              wallet, answered, history
GET  /api/member/questions       live feed
POST /api/member/answers         record answer, credit reward
PATCH/api/member/profile         save profile

POST /api/org/register           email -> token
GET  /api/org/me                 plan, balance
GET  /api/org/questions          this org's campaigns
POST /api/org/questions          compose -> pending (debits balance)
GET  /api/org/questions/:id/responses   anonymized responses
POST /api/org/charge             add points (USD -> points)
POST /api/org/plan               change plan (Pro grants points)

GET  /api/admin/queue            questions awaiting review
POST /api/admin/questions/:id/review   { action: approve | reject }
```

## Deploy

The app deploys as a **single web service**: in production the API also serves
the built frontend from the same origin, so the app's relative `/api` calls work
with no proxy or CORS setup.

### One-click (Render)

A [`render.yaml`](./render.yaml) blueprint is included.

1. In [Render](https://render.com): **New + → Blueprint**, pick this repo, **Apply**.
2. Open the service URL — landing at `/`, member app at `/member.html`, orgs at
   `/orgs.html`.

Render builds with `npm run deploy:build` (install → build web → push schema →
seed) and starts with `npm run start`. `JWT_SECRET` is generated automatically;
`PORT` is provided by Render.

> **Free-tier note:** the filesystem is ephemeral, so the SQLite database resets
> to the seed data on each deploy/restart. To persist data, move to a paid
> instance and uncomment the `disk` block in `render.yaml` (then point
> `DATABASE_URL` at the mounted path). For higher scale, switch the Prisma
> datasource to PostgreSQL.

### Run the production build locally

```bash
npm run build          # build the frontend into web/dist
npm run db:push        # create the database
npm run seed           # seed it
NODE_ENV=production npm run start   # serves API + frontend on :4000
```

### Other hosts

Any Node host works: build the frontend, then run the server with `NODE_ENV=production`.
Set `DATABASE_URL`, `JWT_SECRET`, and `PORT`. (You can also split frontend/backend
across, e.g., Vercel + Render — then set the web app's API base instead of relying
on same-origin `/api`.)

## Notes

- Points are stored internally as cents (1 cent = 1 point); cash conversion is
  surfaced on the member wallet (100 pts = $1.00).
- The orgs console keeps the prototype's design "Tweaks" panel (theme / density /
  voice) and a Buyer/Admin role switch as built-in demo aids.
- The admin routes are intentionally open in this demo; gate them behind a staff
  role before any real deployment.

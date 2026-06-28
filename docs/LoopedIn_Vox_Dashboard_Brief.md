# LoopedIn Vox — Live Insights Dashboard · Claude Code Build Brief

Product: **LoopedIn Vox** (the live insights tool that turns LoopedIn responses
into synthesized intelligence) · Maker: Rebel One (RBL1) · Owner: Sergio Marrero.
Builds on **LoopedIn** (member ↔ org ↔ admin loop). Links to the **Signal**
dashboard — RBL1's separate, broader intelligence layer that links all market
signal across products; LoopedIn Vox feeds its synthesized output into Signal
(see §11). "Signal" in this brief always refers to that external dashboard, never
to the app being built here. Last updated: June 2026.

> This markdown is the in-repo copy of the original build brief, kept so agents
> can read the spec (see `CLAUDE.md`). Implementation notes live in
> [`vox-deploy.md`](./vox-deploy.md).

## 0. What we are building
LoopedIn Vox is the insights surface that sits on top of LoopedIn's response data.
As members answer questions (by text or voice), it continuously turns raw answers
into synthesized intelligence: emerging themes, urgent signals needing human
attention, sentiment, demographic patterns, response-health, and cross-question /
cross-org trends. It is wired to the real LoopedIn data schema (Member / Org /
Question / Answer) but, for this first build, runs on synthetic mock answers so we
can see the shape before real traffic exists. Two consumers separated by a hard
permission boundary: RBL1-internal (a god's-eye view across every org) and a
single org (scoped to only their own questions). Its synthesized output also feeds
the separate Signal dashboard (§11).

## 1. Priorities (build in this order)
1. **Emerging themes / topic clusters** across answers. (Core. This is the product.)
2. **Outlier / urgent signals** — a response that needs a human now.
3. **Sentiment & emotional intensity** — especially benefits, justice, health.
4. **Demographic patterns** — who is saying what, by income / benefits / lived-experience.
5. **Volume & response-rate health** — which questions are landing.
6. **Cross-question / cross-org trends** over time.

If scope must be cut, cut from the bottom. #1 and #2 are the must-haves.

## 2. The two consumers and the permission boundary
| View | Who | Scope | Re-identification suppression |
| --- | --- | --- | --- |
| Internal (RBL1) | Sergio / RBL1 staff | Every org, every question, cross-org synthesis | None. Raw, unsuppressed data and small cells. |
| Org | A single researcher/org | Only that org's own questions | Enforced. Min cell sizes + rare-combination suppression (§6). |

This boundary is load-bearing and must be enforced at the **data-access layer**,
not just hidden in the UI. An org request must never read another org's answers,
and an org view must never render a suppressed cell. Cross-org synthesis is
internal-only. Internal maps to admin/staff; org maps to buyer. Reuse the existing
JWT auth.

## 3. Data model
Use LoopedIn's existing Prisma entities (Member, Org, Question, Answer, points
ledger). Do not redefine them. Vox adds derived/cache tables: **Theme**,
**SynthesisRun**, **UrgentSignal**, **AnswerEnrichment** (fields per the original
brief). All amounts follow the parent brief (cents internally; 100 pts = $1.00).
Never expose member names, full address, or sub-city geo to an org view.

## 4. The synthesis engine (priority #1)
Runs at three scopes: per-question, per-org cross-question, and cross-org
(internal only). On-demand refresh + a config-adjustable scheduled cadence
(default daily). Each run writes a SynthesisRun row. Two-model pipeline: cheap
embeddings + clustering, then Claude for the human-readable label, summary,
representative anonymous quotes, and weightPct — Claude sees only de-identified
text. Model boundary swappable via config. Output per scope: ranked themes with
percent weighting, an aggregate demographic breakdown per theme, and 1–3
representative anonymous quotes (coded ids only).

## 5. Urgent signals (priority #2)
Two trigger classes only: **safety_crisis** and **fraud_spam**. Run a lightweight
classifier on every incoming answer (rules + a Claude check on borderline cases);
write an UrgentSignal row on a hit. **Action: flag in the dashboard only** — no
member-facing crisis resources, no external/automated notification this build
(noted as a real limitation). Urgent signals are **internal-RBL1-only**; never
shown in the org view.

## 6. Re-identification suppression (org view only)
- **Minimum cell size** (config, default N = 5): never render a demographic
  breakdown/slice unless ≥ N members fall in it; thin cells render "suppressed for
  privacy".
- **Rare-combination suppression**: suppress unusual attribute combinations even
  if each attribute alone clears the floor.
- Race/ethnicity is aggregate-only, never a slicer.
- Internal RBL1 view is exempt. Build suppression as a **single enforcement
  function** the org data layer passes through — not per-component checks.

## 7. The other four surfaces (#3–#6)
- **Sentiment & emotional intensity** — per-answer, cached; distribution per
  question and theme; extra prominence on benefits/justice/health.
- **Demographic patterns** — income, benefits, lived-experience, kids, language,
  education. Org view runs through §6; internal does not.
- **Volume & response-rate health** — collected vs target, fill rate,
  time-to-fill, drop-off, voice-vs-text mix.
- **Cross-question / cross-org trends** — prevalence & sentiment over time;
  cross-org slice internal-only.

## 8. Mock data
~5 sessions × ~20 synthetic answers (~100). Real session topics, synthetic
answers (low-income, lived-experience voices; varied length/sentiment/demographic).
Neutral org descriptors only. Five seed sessions: Correctional Healthcare;
Caregiver for an aging/disabled family member; Navigating child care; English
Language Learner stories (some Spanish); Financial operating systems for small
contractors. Plant 2–3 safety_crisis and 2–3 fraud_spam triggers, and at least one
demographic slice thin enough to trip the §6 floor.

## 9. Build order & non-goals
Order: schema + mock generator → synthesis (per-question, on-demand + daily) →
urgent-signal detection + internal review → org view + suppression → sentiment /
demographics / volume-health → cross-question/cross-org trends. Non-goals:
no member-facing crisis resources / external notification; no real voice
transcription (leave the seam); no identity verification; no payments/cashout —
Vox is read-and-synthesize only.

## 10. Principles (inherited from LoopedIn)
Member identity is anonymous to organizations — no exceptions. De-identify at
synthesis; Claude never sees identifying fields. Race/ethnicity aggregate-visible,
never targetable. Suppression ships with every org-facing surface; internal RBL1
is the only exemption, enforced at the data layer. Treat benefits and
lived-experience with the most care. Cheap model for the heavy lifting; Claude for
the judgment calls.

## 11. Link to the Signal dashboard
Vox → Signal, one-way (push synthesized output out; no read-back this build). Only
synthesized, de-identified artifacts cross: Theme records, aggregate breakdowns
that already clear the §6 floor, trend series. Never raw answers, member-level
rows, or UrgentSignal records. Expose a stable, versioned read API
(`GET /export/themes`, `GET /export/trends`). Signal-side ingestion is out of
scope — ship the export seam and stop.

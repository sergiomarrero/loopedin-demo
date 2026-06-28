// LoopedIn Vox API (brief §2–§7, §11). Two route trees behind one hard
// permission boundary:
//   • /api/vox/internal/*  — RBL1 god's-eye view across every org. Sees raw,
//     unsuppressed cells and the urgent-signal queue. OPEN in this demo, exactly
//     like the existing admin routes (gate behind a staff role before launch).
//   • /api/vox/org/*       — a single org, scoped to ITS OWN questions only.
//     Every demographic output passes through the §6 suppression function; the
//     urgent-signal queue and any cross-org surface are unreachable here.
//   • /api/vox/export/*    — versioned, de-identified Signal export seam (§11).
//
// The boundary is enforced at THIS data layer: an org route forces refId to the
// caller's own org id, never serves scope=cross_org, and never returns signals.

import { Router } from 'express';
import { prisma } from '../db.js';
import { requireOrg } from '../auth.js';
import { enforceCells, type Cell, type View } from '../vox/suppression.js';
import { runSynthesis, type DeidAnswer, type Scope } from '../vox/synthesis.js';
import { exportThemes, exportTrends } from '../vox/export.js';

export const voxRouter = Router();

// ── Shared loaders ──────────────────────────────────────────────────────────

type ScopedAnswer = {
  code: string;
  text: string;
  attrs: string[];
  mode: string;
  sentiment: number;
  intensity: number;
  flaggedTypes: string[];
  questionId: string;
  createdAt: Date;
};

// Load de-identified answers for a scope, joined with their enrichment. Coded
// ids (R-####) are assigned by recency, mirroring org.ts.
async function loadScopeAnswers(scope: Scope, refId: string | null): Promise<ScopedAnswer[]> {
  const where =
    scope === 'question'
      ? { questionId: refId! }
      : scope === 'org'
        ? { question: { orgId: refId! } }
        : { question: { org: { email: { endsWith: '@vox.local' } } } }; // cross_org

  const answers = await prisma.answer.findMany({ where, orderBy: { createdAt: 'desc' } });
  const enrich = await prisma.answerEnrichment.findMany({
    where: { answerId: { in: answers.map((a) => a.id) } },
  });
  const byId = new Map(enrich.map((e) => [e.answerId, e]));
  return answers.map((a, i) => {
    const e = byId.get(a.id);
    return {
      code: 'R-' + (2841 - i),
      text: a.text || '',
      attrs: JSON.parse(a.attrs) as string[],
      mode: a.mode,
      sentiment: e?.sentimentScore ?? 0,
      intensity: e?.emotionalIntensity ?? 0,
      flaggedTypes: e ? (JSON.parse(e.flaggedTypes) as string[]) : [],
      questionId: a.questionId,
      createdAt: a.createdAt,
    };
  });
}

function toDeid(rows: ScopedAnswer[]): DeidAnswer[] {
  return rows.map((r) => ({ codedId: r.code, text: r.text, attrs: r.attrs }));
}

// ── Aggregations (shared by internal + org; view controls suppression) ───────

// Demographic chip frequencies as suppression-aware cells. Single chips clear on
// MIN_CELL; rare multi-attribute combinations are marked so they suppress higher.
function demographics(view: View, rows: ScopedAnswer[]) {
  const single: Record<string, number> = {};
  const combo: Record<string, number> = {};
  for (const r of rows) {
    for (const chip of r.attrs) single[chip] = (single[chip] || 0) + 1;
    // a representative two-attribute combination (lived-experience × income)
    const lived = r.attrs.find((c) => /justice|caregiver|immigrant|ELL|provider|veteran|reentry|youth/i.test(c));
    const income = r.attrs.find((c) => /\$/.test(c));
    if (lived && income) {
      const key = `${lived} + ${income}`;
      combo[key] = (combo[key] || 0) + 1;
    }
  }
  const cells: Cell[] = [
    ...Object.entries(single).map(([key, count]) => ({ key, label: key, count })),
    ...Object.entries(combo).map(([key, count]) => ({ key: `combo:${key}`, label: key, count, combination: true })),
  ];
  return enforceCells(view, cells).sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
}

function sentimentDistribution(rows: ScopedAnswer[]) {
  let pos = 0, neu = 0, neg = 0;
  for (const r of rows) {
    if (r.sentiment > 0.15) pos++;
    else if (r.sentiment < -0.15) neg++;
    else neu++;
  }
  const total = rows.length || 1;
  const avgIntensity = rows.reduce((s, r) => s + r.intensity, 0) / total;
  return { positive: pos, neutral: neu, negative: neg, total: rows.length, avgIntensity: round(avgIntensity) };
}

// Theme prevalence + sentiment over time, weekly buckets.
function trends(rows: ScopedAnswer[]) {
  const byWeek = new Map<string, { count: number; sentiment: number }>();
  for (const r of rows) {
    const d = r.createdAt;
    const week = `${d.getUTCFullYear()}-W${String(Math.ceil((d.getUTCDate()) / 7)).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const cur = byWeek.get(week) || { count: 0, sentiment: 0 };
    cur.count++;
    cur.sentiment += r.sentiment;
    byWeek.set(week, cur);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, v]) => ({ period: week, count: v.count, avgSentiment: round(v.sentiment / v.count) }));
}

async function serializeThemes(scope: Scope, refId: string | null, view: View) {
  const themes = await prisma.theme.findMany({ where: { scope, scopeRefId: refId }, orderBy: { weightPct: 'desc' } });
  return themes.map((t) => {
    const demo = JSON.parse(t.demographics || '{}') as Record<string, number>;
    const cells: Cell[] = Object.entries(demo).map(([key, count]) => ({ key, label: key, count }));
    return {
      id: t.id,
      label: t.label,
      summary: t.summary,
      weightPct: t.weightPct,
      answerCount: t.answerCount,
      sentimentScore: round(t.sentimentScore),
      quotes: JSON.parse(t.representativeQuoteIds || '[]'),
      demographics: enforceCells(view, cells),
    };
  });
}

async function lastSynthesized(scope: Scope, refId: string | null) {
  const run = await prisma.synthesisRun.findFirst({
    where: { scope, scopeRefId: refId, status: 'complete' },
    orderBy: { finishedAt: 'desc' },
  });
  return run?.finishedAt ?? null;
}

const round = (n: number) => Math.round(n * 100) / 100;

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL (RBL1) — open in this demo; raw, unsuppressed; cross-org allowed.
// ════════════════════════════════════════════════════════════════════════════

voxRouter.get('/internal/overview', async (_req, res) => {
  const [questions, answers, themes, signals] = await Promise.all([
    prisma.question.count({ where: { org: { email: { endsWith: '@vox.local' } } } }),
    prisma.answer.count({ where: { question: { org: { email: { endsWith: '@vox.local' } } } } }),
    prisma.theme.count(),
    prisma.urgentSignal.count({ where: { status: 'new' } }),
  ]);
  res.json({ questions, answers, themes, openSignals: signals, lastSynthesized: await lastSynthesized('cross_org', null) });
});

voxRouter.get('/internal/themes', async (req, res) => {
  const scope = (req.query.scope as Scope) || 'cross_org';
  const refId = (req.query.refId as string) || null;
  res.json({ scope, refId, lastSynthesized: await lastSynthesized(scope, refId), themes: await serializeThemes(scope, refId, 'internal') });
});

// Urgent-signal queue — INTERNAL ONLY (brief §5.4). Includes answer text so a
// human can review; never exposed to the org tree.
voxRouter.get('/internal/signals', async (_req, res) => {
  const signals = await prisma.urgentSignal.findMany({ orderBy: [{ status: 'asc' }, { detectedAt: 'desc' }] });
  const answers = await prisma.answer.findMany({ where: { id: { in: signals.map((s) => s.answerId) } }, include: { question: true } });
  const byId = new Map(answers.map((a) => [a.id, a]));
  res.json(signals.map((s, i) => {
    const a = byId.get(s.answerId);
    return {
      id: s.id,
      code: 'R-' + (2841 - i),
      type: s.type,
      severity: s.severity,
      rationale: s.rationale,
      status: s.status,
      session: a?.question.text || '',
      text: a?.text || '',
      detectedAt: s.detectedAt,
    };
  }));
});

voxRouter.post('/internal/signals/:id/review', async (req, res) => {
  const { action } = req.body || {};
  if (!['reviewed', 'dismissed'].includes(action)) return res.status(400).json({ error: 'bad action' });
  const sig = await prisma.urgentSignal.update({
    where: { id: req.params.id },
    data: { status: action, reviewedBy: 'rbl1-staff', reviewedAt: new Date() },
  });
  res.json(sig);
});

voxRouter.get('/internal/sentiment', async (req, res) => {
  const scope = (req.query.scope as Scope) || 'cross_org';
  const refId = (req.query.refId as string) || null;
  res.json(sentimentDistribution(await loadScopeAnswers(scope, refId)));
});

voxRouter.get('/internal/demographics', async (req, res) => {
  const scope = (req.query.scope as Scope) || 'cross_org';
  const refId = (req.query.refId as string) || null;
  res.json(demographics('internal', await loadScopeAnswers(scope, refId)));
});

voxRouter.get('/internal/health', async (_req, res) => {
  const questions = await prisma.question.findMany({ where: { org: { email: { endsWith: '@vox.local' } } } });
  const out = [];
  for (const q of questions) {
    const rows = await loadScopeAnswers('question', q.id);
    const voice = rows.filter((r) => r.mode === 'voice').length;
    out.push({
      id: q.id,
      session: q.text,
      collected: rows.length,
      target: q.target,
      fillRate: q.target ? round(rows.length / q.target) : 0,
      voiceShare: rows.length ? round(voice / rows.length) : 0,
      avgSentiment: rows.length ? round(rows.reduce((s, r) => s + r.sentiment, 0) / rows.length) : 0,
    });
  }
  res.json(out);
});

voxRouter.get('/internal/trends', async (req, res) => {
  const scope = (req.query.scope as Scope) || 'cross_org';
  const refId = (req.query.refId as string) || null;
  res.json(trends(await loadScopeAnswers(scope, refId)));
});

// On-demand synthesis refresh (brief §4.2). Any scope, internal-only.
voxRouter.post('/internal/synthesize', async (req, res) => {
  const scope = (req.body?.scope as Scope) || 'cross_org';
  const refId = (req.body?.refId as string) || null;
  const rows = await loadScopeAnswers(scope, refId);
  const runId = await runSynthesis(scope, refId, toDeid(rows), 'on_demand');
  res.json({ runId, scope, refId, lastSynthesized: await lastSynthesized(scope, refId) });
});

// ════════════════════════════════════════════════════════════════════════════
// ORG — scoped to the caller's own org; suppression enforced; no signals, no
// cross-org. refId is ALWAYS the authenticated org id, never client-supplied.
// ════════════════════════════════════════════════════════════════════════════

voxRouter.get('/org/themes', requireOrg, async (req, res) => {
  const orgId = req.principal!.id;
  res.json({ scope: 'org', lastSynthesized: await lastSynthesized('org', orgId), themes: await serializeThemes('org', orgId, 'org') });
});

voxRouter.get('/org/sentiment', requireOrg, async (req, res) => {
  res.json(sentimentDistribution(await loadScopeAnswers('org', req.principal!.id)));
});

voxRouter.get('/org/demographics', requireOrg, async (req, res) => {
  // The §6 enforcement function — org view suppresses thin/rare cells.
  res.json(demographics('org', await loadScopeAnswers('org', req.principal!.id)));
});

voxRouter.get('/org/health', requireOrg, async (req, res) => {
  const questions = await prisma.question.findMany({ where: { orgId: req.principal!.id } });
  const out = [];
  for (const q of questions) {
    const rows = await loadScopeAnswers('question', q.id);
    const voice = rows.filter((r) => r.mode === 'voice').length;
    out.push({
      id: q.id,
      session: q.text,
      collected: rows.length,
      target: q.target,
      fillRate: q.target ? round(rows.length / q.target) : 0,
      voiceShare: rows.length ? round(voice / rows.length) : 0,
    });
  }
  res.json(out);
});

voxRouter.get('/org/trends', requireOrg, async (req, res) => {
  // Org-scoped only — the cross-org slice is internal-only (brief §2/§7).
  res.json(trends(await loadScopeAnswers('org', req.principal!.id)));
});

voxRouter.post('/org/synthesize', requireOrg, async (req, res) => {
  const orgId = req.principal!.id;
  const rows = await loadScopeAnswers('org', orgId);
  const runId = await runSynthesis('org', orgId, toDeid(rows), 'on_demand');
  res.json({ runId, lastSynthesized: await lastSynthesized('org', orgId) });
});

// ════════════════════════════════════════════════════════════════════════════
// EXPORT — Signal feeder seam (brief §11). De-identified, suppression-passed.
// ════════════════════════════════════════════════════════════════════════════

voxRouter.get('/export/themes', async (req, res) => {
  res.json(await exportThemes(req.query.scope as string | undefined));
});

voxRouter.get('/export/trends', async (req, res) => {
  res.json(await exportTrends(req.query.scope as string | undefined));
});

// Synthesis engine (brief §4) — the Claude-in-the-loop moment.
//
// Two-model, cost-aware pipeline with a swappable boundary (brief §4.3):
//   1. Clustering — cheap embeddings + local clustering (the expensive-at-scale
//      step, kept cheap). Embedding provider is config-swappable; a dependency-
//      free local fallback keeps the demo free/offline.
//   2. Final synthesis — Claude writes each theme's label/summary, picks
//      representative anonymous quotes, and assigns weightPct. Claude only ever
//      sees DE-IDENTIFIED answer text (brief §8/§10).
//
// Runs only when ANTHROPIC_API_KEY is set; otherwise a deterministic local
// summarizer fills in so every surface still renders (seeded themes back the
// static demo). Each run writes a SynthesisRun row so the UI can show
// "last synthesized N ago".

import { prisma } from '../db.js';

// ── Config seams (brief §4.2/§4.3) ──────────────────────────────────────────
export const SYNTHESIS_MODEL = process.env.VOX_SYNTHESIS_MODEL || 'claude-sonnet-4-6';
export const EMBED_PROVIDER = process.env.VOX_EMBED_PROVIDER || 'local';
// Daily by default — there's no traffic yet. Tune via env, no code change (§4.2).
export const SYNTHESIS_INTERVAL_MS =
  (Number(process.env.VOX_SYNTHESIS_INTERVAL_HOURS) || 24) * 3600 * 1000;
const HAS_CLAUDE = !!process.env.ANTHROPIC_API_KEY;

// A de-identified answer — the only shape that enters synthesis. No member id,
// no name, no full address (brief §8: "de-identify at synthesis").
export type DeidAnswer = {
  codedId: string; // e.g. R-2841
  text: string;
  attrs: string[]; // anonymized profile chips (city-level, income band, etc.)
};

export type Scope = 'question' | 'org' | 'cross_org';

// ── Stage 1: embeddings (swappable) ─────────────────────────────────────────
// Local fallback: a hashed bag-of-words vector. Cheap, deterministic, no deps.
// Swap EMBED_PROVIDER + wire a real endpoint here for production quality.
const EMBED_DIM = 128;
function localEmbed(text: string): number[] {
  const v = new Array(EMBED_DIM).fill(0);
  const words = text.toLowerCase().match(/[a-záéíóúñ]+/g) || [];
  for (const w of words) {
    if (w.length < 3) continue;
    let h = 0;
    for (let i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0;
    v[h % EMBED_DIM] += 1;
  }
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

export async function embed(text: string): Promise<number[]> {
  // The seam: when EMBED_PROVIDER names a real endpoint, call it here. Default is
  // the local fallback so the demo needs no external embedding service.
  return localEmbed(text);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // inputs are already unit-normalized
}

// ── Stage 1: clustering (auto-k k-means) ────────────────────────────────────
function cluster(vectors: number[][], maxK = 6): number[] {
  const n = vectors.length;
  if (n === 0) return [];
  const k = Math.max(1, Math.min(maxK, Math.round(Math.sqrt(n / 2))));
  // Deterministic seeding: spread initial centroids across the set.
  let centroids = Array.from({ length: k }, (_, i) => vectors[Math.floor((i * n) / k)]);
  const assign = new Array(n).fill(0);
  for (let iter = 0; iter < 12; iter++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestSim = -Infinity;
      for (let c = 0; c < k; c++) {
        const s = cosine(vectors[i], centroids[c]);
        if (s > bestSim) { bestSim = s; best = c; }
      }
      assign[i] = best;
    }
    centroids = centroids.map((_, c) => {
      const members = vectors.filter((_, i) => assign[i] === c);
      if (!members.length) return centroids[c];
      const mean = new Array(EMBED_DIM).fill(0);
      for (const m of members) for (let d = 0; d < EMBED_DIM; d++) mean[d] += m[d];
      const norm = Math.hypot(...mean) || 1;
      return mean.map((x) => x / norm);
    });
  }
  return assign;
}

// ── Stage 2: final synthesis (Claude, de-identified text only) ──────────────
type ClusterSummary = { label: string; summary: string; quoteIds: string[]; sentiment: number };

async function summarizeWithClaude(answers: DeidAnswer[]): Promise<ClusterSummary | null> {
  if (!HAS_CLAUDE) return null;
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();
    // De-identified payload only: coded id + answer text. No attrs that could
    // re-identify are sent as identity; chips are aggregate-safe descriptors.
    const corpus = answers.map((a) => `[${a.codedId}] ${a.text}`).join('\n');
    const msg = await client.messages.create({
      model: SYNTHESIS_MODEL,
      max_tokens: 600,
      system:
        'You synthesize anonymous community-research answers into one theme. ' +
        'You never receive or infer member identity. Return STRICT JSON: ' +
        '{"label": "<=6 words, ends with a period.", "summary": "1-2 sentences", ' +
        '"quoteIds": ["R-####", ...up to 3], "sentiment": <number -1..1>}.',
      messages: [{ role: 'user', content: `Answers:\n${corpus}\n\nReturn the JSON.` }],
    });
    const block = msg.content.find((b) => b.type === 'text');
    const raw = block && 'text' in block ? block.text : '';
    const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
    const parsed = JSON.parse(json);
    return {
      label: String(parsed.label || '').slice(0, 80),
      summary: String(parsed.summary || ''),
      quoteIds: Array.isArray(parsed.quoteIds) ? parsed.quoteIds.slice(0, 3) : [],
      sentiment: typeof parsed.sentiment === 'number' ? parsed.sentiment : 0,
    };
  } catch (e) {
    console.warn('[vox] Claude synthesis failed, using local fallback:', (e as Error).message);
    return null;
  }
}

// Deterministic, dependency-free fallback so a theme always has a label.
function summarizeLocally(answers: DeidAnswer[]): ClusterSummary {
  const stop = new Set(['the','and','for','that','have','this','with','they','from','what','your','about','would','there','their','when','just','dont','cant','really','because','make','more','some','like','been','than','them']);
  const freq: Record<string, number> = {};
  for (const a of answers) {
    for (const w of (a.text.toLowerCase().match(/[a-z]+/g) || [])) {
      if (w.length < 4 || stop.has(w)) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
  const label = (top.length ? top.join(', ') : 'general feedback') + '.';
  return {
    label: label.charAt(0).toUpperCase() + label.slice(1),
    summary: `${answers.length} answers cluster around ${top.join(', ') || 'shared concerns'}.`,
    quoteIds: answers.slice(0, 3).map((a) => a.codedId),
    sentiment: 0,
  };
}

/**
 * Run synthesis for one scope over de-identified answers. Persists a
 * SynthesisRun and replaces this scope's Theme rows. Returns the run id.
 */
export async function runSynthesis(
  scope: Scope,
  scopeRefId: string | null,
  answers: DeidAnswer[],
  trigger: 'scheduled' | 'on_demand' = 'on_demand',
): Promise<string> {
  const run = await prisma.synthesisRun.create({
    data: { scope, scopeRefId, trigger, model: HAS_CLAUDE ? SYNTHESIS_MODEL : 'local-fallback', answerCountIn: answers.length, status: 'running' },
  });

  try {
    const vectors = await Promise.all(answers.map((a) => embed(a.text)));
    const assign = cluster(vectors);
    const groups = new Map<number, DeidAnswer[]>();
    answers.forEach((a, i) => {
      const g = assign[i] ?? 0;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(a);
    });

    // Replace prior themes for this scope so the UI shows the latest run only.
    await prisma.theme.deleteMany({ where: { scope, scopeRefId } });

    const total = answers.length || 1;
    for (const [, group] of groups) {
      const summary = (await summarizeWithClaude(group)) || summarizeLocally(group);
      await prisma.theme.create({
        data: {
          scope,
          scopeRefId,
          label: summary.label,
          summary: summary.summary,
          weightPct: Math.round((group.length / total) * 100),
          representativeQuoteIds: JSON.stringify(summary.quoteIds),
          answerCount: group.length,
          sentimentScore: summary.sentiment,
          demographics: JSON.stringify(aggregateDemographics(group)),
          synthesisRunId: run.id,
        },
      });
    }

    await prisma.synthesisRun.update({ where: { id: run.id }, data: { status: 'complete', finishedAt: new Date() } });
  } catch (e) {
    await prisma.synthesisRun.update({ where: { id: run.id }, data: { status: 'failed', finishedAt: new Date() } });
    throw e;
  }
  return run.id;
}

// Aggregate the anonymized attribute chips into per-theme counts (brief §4.4).
// Raw counts here; the ORG-view suppression floor is applied at the route layer.
function aggregateDemographics(answers: DeidAnswer[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of answers) for (const chip of a.attrs) counts[chip] = (counts[chip] || 0) + 1;
  return counts;
}

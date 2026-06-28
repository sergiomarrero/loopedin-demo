// Seeds LoopedIn Vox on top of the existing LoopedIn data (brief §8). ADDITIVE:
// it creates neutral-labelled orgs + the five session Questions + ~100 synthetic
// Answers, enriches each (AnswerEnrichment), flags planted urgent signals
// (UrgentSignal), and runs the synthesis engine to populate Theme rows so every
// dashboard surface works offline with zero API cost.
//
// These Questions are created with feed=null so they NEVER enter the member feed,
// and under their own neutral orgs so they never appear in the existing demo org
// console — Vox seeding cannot interfere with the LoopedIn apps.
//
// Run via `npm run seed:vox` (server workspace). Also invoked from seed.ts.

import { prisma } from '../db.js';
import { SESSIONS } from './mock.js';
import { detectSignal } from './detect.js';
import { embed, runSynthesis, type DeidAnswer } from './synthesis.js';

// Tiny lexicon sentiment so enrichment has a real-ish score offline (-1..1).
const POS = ['saved', 'kind', 'love', 'great', 'trust', 'caught up', 'strength', 'better', 'good', 'helped', 'dropped overnight'];
const NEG = ['swollen', 'pain', 'lost', 'scared', 'ashamed', 'exhausted', 'terrified', 'invisible', 'cry', 'penalty', 'killer', 'burned', 'gave up', 'forgot', 'wiped out', 'nothing', 'impossible', 'brutal', 'never', 'hopeless'];
function sentiment(text: string): number {
  const t = text.toLowerCase();
  let s = 0;
  for (const w of POS) if (t.includes(w)) s += 1;
  for (const w of NEG) if (t.includes(w)) s -= 1;
  return Math.max(-1, Math.min(1, s / 3));
}
function intensity(text: string): number {
  const marks = (text.match(/[!?]/g) || []).length;
  const strong = /(can'?t take|anymore|terrified|hopeless|never|every|exhausted|alone)/i.test(text) ? 0.4 : 0;
  return Math.max(0, Math.min(1, 0.3 + marks * 0.1 + strong + Math.min(0.2, text.length / 1200)));
}

export async function seedVox() {
  let coded = 2841; // coded-id counter, mirrors org.ts R-#### scheme
  const codedIds = new Map<string, string>(); // answerId -> R-####

  for (let si = 0; si < SESSIONS.length; si++) {
    const s = SESSIONS[si];

    // Neutral-labelled org for this session (brief §8.2). Stable email by id.
    const org = await prisma.org.upsert({
      where: { email: `${s.id}@vox.local` },
      update: { name: s.orgLabel },
      create: { email: `${s.id}@vox.local`, name: s.orgLabel, plan: 'pro', balancePts: 0 },
    });

    // The session as a Question. feed=null keeps it out of the member feed.
    const q = await prisma.question.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        orgId: org.id,
        text: s.prompt,
        mode: s.mode,
        points: 0,
        target: s.target,
        collected: s.answers.length,
        status: 'live',
        feed: null,
        buyer: s.orgLabel,
        buyerType: 'ORGANIZATION',
        seed: true,
      },
    });

    // Answers + enrichment + urgent-signal detection.
    const deid: DeidAnswer[] = [];
    for (let ai = 0; ai < s.answers.length; ai++) {
      const a = s.answers[ai];
      const email = `${s.id}-m${ai}@vox.local`;
      const member = await prisma.member.upsert({
        where: { email },
        update: {},
        create: { email, cents: 0, profile: JSON.stringify({ attrs: a.attrs, lang: a.lang || 'en' }) },
      });

      // Spread createdAt across ~30 days so trends/volume have a time axis.
      const daysAgo = ((si * s.answers.length + ai) % 30) + 1;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);

      const detection = a.plant
        ? { type: a.plant, severity: a.plant === 'safety_crisis' ? 'high' : 'medium', rationale: 'planted demo trigger' } as const
        : await detectSignal(a.text);

      const answer = await prisma.answer.upsert({
        where: { questionId_memberId: { questionId: q.id, memberId: member.id } },
        update: {},
        create: {
          questionId: q.id,
          memberId: member.id,
          text: a.text,
          mode: a.mode,
          cents: 0,
          attrs: JSON.stringify(a.attrs),
          flagged: !!detection,
          createdAt,
        },
      });

      const code = 'R-' + coded--;
      codedIds.set(answer.id, code);
      deid.push({ codedId: code, text: a.text, attrs: a.attrs });

      await prisma.answerEnrichment.upsert({
        where: { answerId: answer.id },
        update: {},
        create: {
          answerId: answer.id,
          sentimentScore: sentiment(a.text),
          emotionalIntensity: intensity(a.text),
          transcript: a.text, // mock: voice transcript == text (transcription seam, §9)
          embedding: JSON.stringify(await embed(a.text)),
          flaggedTypes: JSON.stringify(detection ? [detection.type] : []),
        },
      });

      if (detection) {
        await prisma.urgentSignal.upsert({
          where: { answerId: answer.id },
          update: {},
          create: {
            answerId: answer.id,
            type: detection.type,
            severity: detection.severity,
            rationale: detection.rationale,
            status: 'new',
            detectedAt: createdAt,
          },
        });
      }
    }

    // Per-question synthesis (brief §4.1). Claude if ANTHROPIC_API_KEY is set,
    // else the deterministic local fallback — themes are written either way.
    await runSynthesis('question', q.id, deid, 'scheduled');
  }

  // Per-org cross-question + cross-org synthesis, from de-identified answers.
  const orgs = await prisma.org.findMany({ where: { email: { endsWith: '@vox.local' } } });
  const allDeid: DeidAnswer[] = [];
  for (const org of orgs) {
    const answers = await prisma.answer.findMany({
      where: { question: { orgId: org.id } },
      orderBy: { createdAt: 'desc' },
    });
    const deid = answers.map((a, i) => ({ codedId: 'R-' + (2841 - i), text: a.text || '', attrs: JSON.parse(a.attrs) as string[] }));
    allDeid.push(...deid);
    await runSynthesis('org', org.id, deid, 'scheduled');
  }
  // Cross-org is internal-RBL1-only (brief §2/§4.1) — the route layer gates it.
  await runSynthesis('cross_org', null, allDeid, 'scheduled');

  const counts = {
    sessions: SESSIONS.length,
    answers: await prisma.answer.count({ where: { question: { org: { email: { endsWith: '@vox.local' } } } } }),
    themes: await prisma.theme.count(),
    signals: await prisma.urgentSignal.count(),
  };
  console.log('Vox seed complete:', counts);
  return counts;
}

// Allow running standalone: `tsx src/vox/seed-vox.ts`.
if (import.meta.url === `file://${process.argv[1]}`) {
  seedVox()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}

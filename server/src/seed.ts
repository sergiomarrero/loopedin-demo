import { prisma } from './db.js';
import { seedVox } from './vox/seed-vox.js';

// ── Member feed questions (from the respondent prototype) ─────────────────────
const PULSE_QUESTIONS = [
  { id: 'q-snap', text: "What's one thing that made applying for SNAP harder than it had to be?", buyer: 'Pew Charitable Trusts', buyerType: 'FOUNDATION', mode: 'voice', cents: 50, trial: false, feed: 'foryou', qualifier: null },
  { id: 'q-childcare', text: 'If childcare were free this week, what would you actually do with the extra time?', buyer: 'Aspen Institute', buyerType: 'FOUNDATION', mode: 'text', cents: 25, trial: false, feed: 'foryou', qualifier: null },
  { id: 'q-pantry', text: 'How did you first find out about your local food pantry?', buyer: 'City of Detroit', buyerType: 'GOVERNMENT', mode: 'text', cents: 20, trial: false, feed: 'foryou', qualifier: null },
  { id: 'q-landlord', text: "What's one thing your landlord could fix this month that would actually matter?", buyer: 'HUD Research', buyerType: 'GOVERNMENT', mode: 'voice', cents: 75, trial: false, feed: 'foryou', qualifier: null },
  { id: 'q-background', text: 'Have you ever been turned down for a job because of a background check? What happened?', buyer: 'UCLA Justice Lab', buyerType: 'RESEARCH', mode: 'voice', cents: 150, trial: true, feed: 'foryou', qualifier: null },
  { id: 'q-medicaid', text: 'If you could change one thing about renewing Medicaid, what would it be?', buyer: 'Kaiser Family Foundation', buyerType: 'FOUNDATION', mode: 'voice', cents: 60, trial: false, feed: 'browse', qualifier: { tag: 'caregiver', label: 'caregiver for a family member' } },
  { id: 'q-caregiver', text: "Caregivers — what's the hardest part of your week?", buyer: 'AARP', buyerType: 'FOUNDATION', mode: 'text', cents: 40, trial: false, feed: 'browse', qualifier: { tag: 'caregiver', label: 'a caregiver' } },
  { id: 'q-reentry', text: 'After getting out, what was the hardest thing about finding housing?', buyer: 'Vera Institute of Justice', buyerType: 'RESEARCH', mode: 'voice', cents: 200, trial: true, feed: 'browse', qualifier: { tag: 'justice-involved', label: 'justice-involved' } },
  { id: 'q-immigrant', text: 'When did you last need a translator to deal with a public office? How did it go?', buyer: 'MacArthur Foundation', buyerType: 'FOUNDATION', mode: 'voice', cents: 60, trial: false, feed: 'browse', qualifier: { tag: 'immigrant', label: 'an immigrant' } },
  { id: 'q-utility', text: "What did you do the last time you couldn't pay a utility bill on time?", buyer: 'Consumer Reports', buyerType: 'RESEARCH', mode: 'text', cents: 30, trial: false, feed: 'browse', qualifier: null },
];

// ── Demo org campaigns (from the buyer console prototype) ─────────────────────
const SEED_QUESTIONS = [
  { id: 'q1', text: 'What would make it easier to find affordable childcare in your area?', mode: 'text', points: 100, target: 200, collected: 142, status: 'live', city: 'Detroit, MI', income: '< $40k', start: 'May 20', end: 'Jun 16' },
  { id: 'q2', text: 'When you needed help with rent, where did you turn first — and did it work?', mode: 'voice', points: 150, target: 150, collected: 150, status: 'closed', city: 'Cleveland, OH', income: '< $30k', start: 'Apr 2', end: 'May 1' },
  { id: 'q3', text: 'What is one thing about the SNAP renewal process you wish someone had told you?', mode: 'text', points: 100, target: 300, collected: 0, status: 'pending', city: 'Newark, NJ', income: '< $40k', start: 'Jun 1', end: 'Jun 30' },
  { id: 'q4', text: "If you could change one thing about your kid's school, what would it be?", mode: 'text', points: 0, target: 100, collected: 0, status: 'draft', city: 'Atlanta, GA', income: 'Any income', start: '—', end: '—' },
];

const SAMPLE_RESPONSES = [
  { text: 'A single calendar that shows which centers actually have open spots. I call ten places and they’re all full or never call back.', attrs: ['Detroit, MI', 'Parent of 2', '< $40k', 'WIC'], flagged: false },
  { text: 'Cost. Even the subsidized ones want money up front before the voucher kicks in, and I don’t have it on the 1st.', attrs: ['Detroit, MI', 'Single parent', '< $30k', 'Medicaid'], flagged: false },
  { text: 'Hours. Everything closes at 5 and my shift ends at 6. Night-shift parents have nothing.', attrs: ['Detroit, MI', 'Parent', '< $40k', 'Works nights'], flagged: false },
  { text: 'Someone who speaks Spanish at the front desk. I do not always understand the forms and I am scared to sign wrong.', attrs: ['Detroit, MI', 'Spanish-speaking', '< $40k', 'Parent of 3'], flagged: false },
  { text: 'Transportation. The good center is 40 minutes by bus each way. By the time I drop off I’m late for work.', attrs: ['Detroit, MI', '< $30k', 'No car', 'Parent'], flagged: true },
  { text: 'Honestly just knowing it’s safe. I toured one place that scared me. I’d pay for trust.', attrs: ['Detroit, MI', 'Parent of 1', '< $40k'], flagged: false },
];

export const DEMO_ORG_EMAIL = 'demo@loopedin.org';

async function main() {
  // Member feed catalog.
  for (const q of PULSE_QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        text: q.text,
        mode: q.mode,
        cents: q.cents,
        feed: q.feed,
        buyer: q.buyer,
        buyerType: q.buyerType,
        trial: q.trial,
        qualifier: q.qualifier ? JSON.stringify(q.qualifier) : null,
        status: 'live',
        seed: true,
      },
    });
  }

  // Demo org + its campaigns.
  const org = await prisma.org.upsert({
    where: { email: DEMO_ORG_EMAIL },
    update: {},
    create: { email: DEMO_ORG_EMAIL, name: 'Your organization', plan: 'pro', balancePts: 4500 },
  });

  for (const q of SEED_QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        orgId: org.id,
        text: q.text,
        mode: q.mode,
        points: q.points,
        cents: q.points,
        target: q.target,
        collected: q.collected,
        status: q.status,
        city: q.city,
        income: q.income,
        startLabel: q.start,
        endLabel: q.end,
        feed: q.status === 'live' ? 'browse' : null,
        buyer: org.name,
        buyerType: 'ORGANIZATION',
        seed: true,
      },
    });
  }

  // Sample anonymized responses on the childcare campaign (q1).
  for (let i = 0; i < SAMPLE_RESPONSES.length; i++) {
    const r = SAMPLE_RESPONSES[i];
    const email = `seed-respondent-${i}@loopedin.local`;
    const m = await prisma.member.upsert({
      where: { email },
      update: {},
      create: { email, cents: 100, profile: '{}' },
    });
    await prisma.answer.upsert({
      where: { questionId_memberId: { questionId: 'q1', memberId: m.id } },
      update: {},
      create: {
        questionId: 'q1',
        memberId: m.id,
        text: r.text,
        mode: 'text',
        cents: 100,
        attrs: JSON.stringify(r.attrs),
        flagged: r.flagged,
        createdAt: new Date(Date.now() - (i + 1) * 2 * 3600 * 1000),
      },
    });
  }

  console.log('Seed complete:', {
    questions: await prisma.question.count(),
    orgs: await prisma.org.count(),
    members: await prisma.member.count(),
    answers: await prisma.answer.count(),
  });

  // LoopedIn Vox insights data (additive — neutral orgs + 5 sessions + ~100
  // synthetic answers + enrichment/signals/themes). Kept out of the member feed.
  await seedVox();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

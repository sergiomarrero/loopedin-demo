import { Router } from 'express';
import { prisma } from '../db.js';
import { signToken, requireOrg } from '../auth.js';

export const orgRouter = Router();

const POINTS_PER_DOLLAR = 100;

function serializeQuestion(q: any) {
  return {
    id: q.id,
    text: q.text,
    mode: q.mode,
    points: q.points,
    target: q.target,
    collected: q.collected,
    status: q.status,
    city: q.city,
    income: q.income,
    start: q.startLabel,
    end: q.endLabel,
  };
}

async function serializeOrg(orgId: string) {
  const o = await prisma.org.findUnique({ where: { id: orgId } });
  if (!o) return null;
  return {
    id: o.id,
    email: o.email,
    name: o.name,
    plan: o.plan,
    balance: o.balancePts,
    autocharge: JSON.parse(o.autocharge),
  };
}

// Register / sign in an org by email (+ name, phone). Upserts by email.
orgRouter.post('/register', async (req, res) => {
  const { email, name, phone } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email required' });
  const org = await prisma.org.upsert({
    where: { email: email.toLowerCase().trim() },
    create: { email: email.toLowerCase().trim(), name: name || undefined, phone: phone ?? null },
    update: { name: name || undefined, phone: phone ?? undefined },
  });
  const token = signToken({ kind: 'org', id: org.id });
  res.json({ token, org: await serializeOrg(org.id) });
});

orgRouter.get('/me', requireOrg, async (req, res) => {
  const data = await serializeOrg(req.principal!.id);
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

orgRouter.get('/questions', requireOrg, async (req, res) => {
  const qs = await prisma.question.findMany({
    where: { orgId: req.principal!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(qs.map(serializeQuestion));
});

// Compose a question -> goes to pending (admin review). Debits balance if it
// carries a point reward.
orgRouter.post('/questions', requireOrg, async (req, res) => {
  const orgId = req.principal!.id;
  const { text, mode, points = 0, target = 0, city, income, start, end } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  const cost = (points || 0) * (target || 0);
  const org = await prisma.org.findUnique({ where: { id: orgId } });
  if (!org) return res.status(404).json({ error: 'org not found' });
  if (cost > org.balancePts) {
    return res.status(402).json({ error: 'insufficient balance', need: cost - org.balancePts });
  }

  const q = await prisma.question.create({
    data: {
      orgId,
      text,
      mode: mode || 'text',
      points,
      target,
      // a point reward to the member is paid per response; mirror cents = points
      cents: points,
      city: city ?? null,
      income: income ?? null,
      startLabel: start ?? null,
      endLabel: end ?? null,
      status: 'pending',
      // pending questions are not shown in the member feed until approved
      feed: null,
      buyer: org.name,
      buyerType: 'ORGANIZATION',
    },
  });

  if (cost > 0) {
    await prisma.org.update({ where: { id: orgId }, data: { balancePts: { decrement: cost } } });
  }

  res.json({ question: serializeQuestion(q), org: await serializeOrg(orgId) });
});

// Anonymized responses for one of the org's questions + light aggregates.
orgRouter.get('/questions/:id/responses', requireOrg, async (req, res) => {
  const q = await prisma.question.findFirst({
    where: { id: req.params.id, orgId: req.principal!.id },
    include: { answers: { orderBy: { createdAt: 'desc' } } },
  });
  if (!q) return res.status(404).json({ error: 'not found' });

  const responses = q.answers.map((a, i) => ({
    id: 'R-' + (2841 - i),
    text: a.text || '',
    attrs: JSON.parse(a.attrs),
    when: timeAgo(a.createdAt),
    flagged: a.flagged,
  }));

  res.json({ question: serializeQuestion(q), responses });
});

// Charge up points balance (USD -> points).
orgRouter.post('/charge', requireOrg, async (req, res) => {
  const { usd, pts } = req.body || {};
  const addPts = typeof pts === 'number' ? pts : Math.round((usd || 0) * POINTS_PER_DOLLAR);
  if (!addPts || addPts <= 0) return res.status(400).json({ error: 'amount required' });
  await prisma.org.update({ where: { id: req.principal!.id }, data: { balancePts: { increment: addPts } } });
  res.json(await serializeOrg(req.principal!.id));
});

// Change plan; upgrading to Pro grants the monthly points allotment.
orgRouter.post('/plan', requireOrg, async (req, res) => {
  const { plan } = req.body || {};
  if (!['free', 'pro', 'enterprise'].includes(plan)) return res.status(400).json({ error: 'bad plan' });
  const org = await prisma.org.findUnique({ where: { id: req.principal!.id } });
  if (!org) return res.status(404).json({ error: 'not found' });
  const data: any = { plan };
  let granted = 0;
  if (plan === 'pro' && org.plan !== 'pro') {
    granted = 800; // PLANS.pro.monthlyPoints
    data.balancePts = { increment: granted };
  }
  await prisma.org.update({ where: { id: req.principal!.id }, data });
  res.json({ org: await serializeOrg(req.principal!.id), granted });
});

orgRouter.patch('/autocharge', requireOrg, async (req, res) => {
  const { on, threshold, topup } = req.body || {};
  await prisma.org.update({
    where: { id: req.principal!.id },
    data: { autocharge: JSON.stringify({ on: !!on, threshold, topup }) },
  });
  res.json(await serializeOrg(req.principal!.id));
});

function timeAgo(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

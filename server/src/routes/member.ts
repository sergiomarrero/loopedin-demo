import { Router } from 'express';
import { prisma } from '../db.js';
import { signToken, requireMember } from '../auth.js';

export const memberRouter = Router();

// Serialize a member (+ answers) into the shape the respondent app expects.
async function serializeMember(memberId: string) {
  const m = await prisma.member.findUnique({
    where: { id: memberId },
    include: { answers: { orderBy: { createdAt: 'desc' } } },
  });
  if (!m) return null;
  const answered: Record<string, boolean> = {};
  const history = m.answers.map((a) => {
    answered[a.questionId] = true;
    return { qid: a.questionId, cents: a.cents, mode: a.mode, ts: a.createdAt.getTime() };
  });
  return {
    id: m.id,
    email: m.email,
    phone: m.phone,
    claimed: true,
    cents: m.cents,
    pendingCents: m.pendingCents,
    streak: m.streak,
    profile: JSON.parse(m.profile),
    qualifiedFor: JSON.parse(m.qualifiedFor),
    answered,
    history,
    hasAnsweredOnce: history.length > 0,
  };
}

// Register / claim identity (email + phone). Upserts by email.
memberRouter.post('/register', async (req, res) => {
  const { email, phone } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email required' });
  const member = await prisma.member.upsert({
    where: { email: email.toLowerCase().trim() },
    create: { email: email.toLowerCase().trim(), phone: phone ?? null },
    update: { phone: phone ?? undefined },
  });
  const token = signToken({ kind: 'member', id: member.id });
  res.json({ token, member: await serializeMember(member.id) });
});

memberRouter.get('/me', requireMember, async (req, res) => {
  const data = await serializeMember(req.principal!.id);
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

// The member feed — live questions tagged for a feed.
memberRouter.get('/questions', requireMember, async (_req, res) => {
  const qs = await prisma.question.findMany({
    where: { status: 'live', feed: { not: null } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(
    qs.map((q) => ({
      id: q.id,
      text: q.text,
      buyer: q.buyer,
      buyerType: q.buyerType,
      mode: q.mode,
      cents: q.cents,
      trial: q.trial,
      feed: q.feed,
      qualifier: q.qualifier ? JSON.parse(q.qualifier) : null,
    })),
  );
});

// Record an answer, credit the reward, advance the question's collected count.
memberRouter.post('/answers', requireMember, async (req, res) => {
  const memberId = req.principal!.id;
  const { questionId, text, mode, attrs } = req.body || {};
  if (!questionId) return res.status(400).json({ error: 'questionId required' });

  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) return res.status(404).json({ error: 'question not found' });

  const existing = await prisma.answer.findUnique({
    where: { questionId_memberId: { questionId, memberId } },
  });
  if (existing) return res.status(409).json({ error: 'already answered' });

  const reward = q.cents || q.points || 0;

  const [answer] = await prisma.$transaction([
    prisma.answer.create({
      data: {
        questionId,
        memberId,
        text: text ?? null,
        mode: mode || q.mode,
        cents: reward,
        attrs: JSON.stringify(attrs || []),
      },
    }),
    prisma.question.update({
      where: { id: questionId },
      data: { collected: { increment: 1 } },
    }),
    prisma.member.update({
      where: { id: memberId },
      data: { cents: { increment: reward }, pendingCents: { increment: reward } },
    }),
  ]);

  res.json({ answer: { id: answer.id, cents: reward }, member: await serializeMember(memberId) });
});

// Persist profile + qualified tags.
memberRouter.patch('/profile', requireMember, async (req, res) => {
  const { profile, qualifiedFor, streak } = req.body || {};
  const data: any = {};
  if (profile !== undefined) data.profile = JSON.stringify(profile);
  if (qualifiedFor !== undefined) data.qualifiedFor = JSON.stringify(qualifiedFor);
  if (typeof streak === 'number') data.streak = streak;
  await prisma.member.update({ where: { id: req.principal!.id }, data });
  res.json(await serializeMember(req.principal!.id));
});

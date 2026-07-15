import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { signToken, requireMember } from '../auth.js';
import { preferredChannel, sendMessage } from '../messaging/router.js';
import { templates } from '../messaging/templates.js';

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

// ── Phone + one-time-code login (for members who signed up over messaging) ──
// The OTP is stored on the phone's ConversationState (hashed) with a 10-minute
// expiry; the code is delivered over the member's preferred channel.

function normalizePhone(raw: string): string | null {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // US default
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 8 && String(raw).trim().startsWith('+')) return `+${digits}`;
  return null;
}

const hashOtp = (code: string) => crypto.createHash('sha256').update(code).digest('hex');

memberRouter.post('/otp/request', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) return res.status(400).json({ error: 'valid phone required' });
  const member = await prisma.member.findUnique({ where: { phone } });
  // Do not reveal whether a phone exists — always claim success.
  if (member) {
    const code = String(crypto.randomInt(100000, 1000000));
    const st = await prisma.conversationState.upsert({
      where: { phone },
      create: { phone, memberId: member.id },
      update: {},
    });
    const ctx = (() => { try { return JSON.parse(st.context || '{}'); } catch { return {}; } })();
    ctx.otp = { hash: hashOtp(code), exp: Date.now() + 10 * 60 * 1000, tries: 0 };
    await prisma.conversationState.update({ where: { phone }, data: { context: JSON.stringify(ctx) } });
    await sendMessage(phone, await preferredChannel(phone), templates.otp(code));
  }
  res.json({ ok: true });
});

memberRouter.post('/otp/verify', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const code = String(req.body?.code || '').trim();
  if (!phone || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'phone and 6-digit code required' });
  const st = await prisma.conversationState.findUnique({ where: { phone } });
  const ctx = (() => { try { return JSON.parse(st?.context || '{}'); } catch { return {}; } })();
  const otp = ctx.otp;
  const fail = () => res.status(401).json({ error: 'invalid or expired code' });
  if (!st || !otp?.hash || Date.now() > otp.exp || (otp.tries || 0) >= 5) return fail();
  if (hashOtp(code) !== otp.hash) {
    ctx.otp.tries = (otp.tries || 0) + 1;
    await prisma.conversationState.update({ where: { phone }, data: { context: JSON.stringify(ctx) } });
    return fail();
  }
  delete ctx.otp; // single use
  await prisma.conversationState.update({ where: { phone }, data: { context: JSON.stringify(ctx) } });
  const member = await prisma.member.findUnique({ where: { phone } });
  if (!member) return fail();
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

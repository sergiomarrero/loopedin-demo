import { Router } from 'express';
import { prisma } from '../db.js';

export const adminRouter = Router();

// NOTE: In this demo the admin console is open. A production deployment would
// gate these routes behind a staff role / separate credential.

// The review queue — every question awaiting approval.
adminRouter.get('/queue', async (_req, res) => {
  const qs = await prisma.question.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: { org: true },
  });
  res.json(
    qs.map((q) => ({
      id: q.id,
      org: q.org?.name || 'Unknown org',
      plan: 'free',
      text: q.text,
      mode: q.mode,
      points: q.points,
      target: q.target,
      city: q.city,
      income: q.income,
      start: q.startLabel,
      end: q.endLabel,
      submitted: timeAgo(q.createdAt),
      cost: q.points * q.target,
    })),
  );
});

// Approve -> goes live and enters the member feed. Reject -> refunds the org.
adminRouter.post('/questions/:id/review', async (req, res) => {
  const { action } = req.body || {};
  const q = await prisma.question.findUnique({ where: { id: req.params.id } });
  if (!q) return res.status(404).json({ error: 'not found' });

  if (action === 'approve') {
    await prisma.question.update({
      where: { id: q.id },
      data: { status: 'live', feed: 'browse' },
    });
  } else if (action === 'reject') {
    const refund = q.points * q.target;
    await prisma.question.update({ where: { id: q.id }, data: { status: 'rejected' } });
    if (refund > 0 && q.orgId) {
      await prisma.org.update({ where: { id: q.orgId }, data: { balancePts: { increment: refund } } });
    }
  } else {
    return res.status(400).json({ error: 'action must be approve | reject' });
  }
  res.json({ ok: true });
});

function timeAgo(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

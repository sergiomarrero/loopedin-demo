// Scheduler — unsolicited outbound: question fan-out on admin approval and the
// daily profile drip. Hard rules (brief §5.2, §8):
//   • max MESSAGING_DAILY_CAP unsolicited outbound per member per day (default 1)
//   • never message an opted-out number
//   • respect targeting, answered state, and qualifier requirements
//
// "Unsolicited" sends are tagged with a ':push' templateKey suffix so the cap
// query can tell them apart from replies inside an active conversation.

import { prisma } from '../db.js';
import { templates } from './templates.js';
import { adapterFor, preferredChannel, sendMessage } from './router.js';
import { isProfileQualified, nextDripField, nextQuestionFor } from './engine.js';
import type { OutboundMessage } from './types.js';

const DAILY_CAP = () => Math.max(1, Number(process.env.MESSAGING_DAILY_CAP || 1));

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function unsolicitedCountToday(memberId: string): Promise<number> {
  return prisma.messageLog.count({
    where: {
      memberId,
      direction: 'outbound',
      createdAt: { gte: startOfToday() },
      templateKey: { endsWith: ':push' },
    },
  });
}

function asPush(msg: OutboundMessage): OutboundMessage {
  return { ...msg, templateKey: `${msg.templateKey}:push` };
}

// Members reachable over messaging: phone-verified, not opted out, idle (never
// interrupt an active flow with a push).
async function reachableMembers() {
  const states = await prisma.conversationState.findMany({
    where: { optedOut: false, memberId: { not: null }, flow: 'idle' },
  });
  return states;
}

// Fan an approved question out to eligible members. Called fire-and-forget
// from the admin approve route.
export async function fanOutQuestion(questionId: string): Promise<{ sent: number }> {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q || q.status !== 'live' || !q.feed) return { sent: 0 };

  let sent = 0;
  for (const st of await reachableMembers()) {
    const memberId = st.memberId!;
    if ((await unsolicitedCountToday(memberId)) >= DAILY_CAP()) continue;

    // Reuse the engine's eligibility walk, but only push THIS question — if
    // the member's next-best question is a different one, the drip/inbound
    // path will get to it.
    const next = await nextQuestionFor(memberId, {});
    if (!next || next.q.id !== q.id) continue;

    const channel = await preferredChannel(st.phone);
    const caps = adapterFor(channel).capabilities;

    if (next.needsQualifier) {
      await prisma.conversationState.update({
        where: { phone: st.phone },
        data: { flow: 'qualifier', step: null, context: JSON.stringify({ qid: q.id, tag: next.qualifier.tag, label: next.qualifier.label }) },
      });
      await sendMessage(st.phone, channel, asPush(templates.qualifier(next.qualifier.label)));
    } else {
      const review = q.review ? JSON.parse(q.review) : null;
      if (review?.media?.length && !caps.media) {
        await sendMessage(st.phone, channel, asPush({ ...templates.reviewDeepLink(q), questionId: q.id }));
      } else if (review?.reactions?.length) {
        await prisma.conversationState.update({
          where: { phone: st.phone },
          data: { flow: 'answering', step: 'reaction', context: JSON.stringify({ qid: q.id, reactions: review.reactions }) },
        });
        await sendMessage(st.phone, channel, asPush({ ...templates.reviewQuestion(q, review.reactions), questionId: q.id }));
      } else {
        await prisma.conversationState.update({
          where: { phone: st.phone },
          data: { flow: 'answering', step: null, context: JSON.stringify({ qid: q.id }) },
        });
        await sendMessage(st.phone, channel, asPush({ ...templates.question(q), questionId: q.id }));
      }
    }
    sent++;
  }
  return { sent };
}

// Daily profile drip: one profile question per idle member under the cap.
export async function runProfileDrip(): Promise<{ sent: number }> {
  let sent = 0;
  for (const st of await reachableMembers()) {
    const memberId = st.memberId!;
    if ((await unsolicitedCountToday(memberId)) >= DAILY_CAP()) continue;

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) continue;
    const profile = JSON.parse(member.profile || '{}');
    if (isProfileQualified(profile)) {
      // Core fields done — keep dripping the long tail at most once/day too.
    }
    let skipped: Record<string, boolean> = {};
    try { skipped = JSON.parse(st.context || '{}').dripSkipped || {}; } catch { /* ignore */ }
    const field = nextDripField(profile, skipped);
    if (!field) continue;

    const channel = await preferredChannel(st.phone);
    await prisma.conversationState.update({
      where: { phone: st.phone },
      data: { flow: 'profile_drip', step: null, context: JSON.stringify({ dripSkipped: skipped, profileField: field.key }) },
    });
    await sendMessage(st.phone, channel, asPush(templates.profileQuestion(field.prompt, field.options, field.multi)));
    sent++;
  }
  return { sent };
}

// Hourly tick — cheap: the daily cap makes repeat runs no-ops.
export function startScheduler() {
  const everyMs = 60 * 60 * 1000;
  setInterval(() => {
    runProfileDrip().catch((e) => console.error('profile drip failed', e));
  }, everyMs).unref?.();
  console.log('messaging scheduler started (hourly drip tick)');
}

// The conversation engine — channel-agnostic state machine. ALL business logic
// lives here; adapters only translate transport. Flows (brief §5):
//
//   idle | signup | answering | qualifier | profile_drip
//
// Every inbound resolves: (a) load ConversationState by phone, (b) global
// keywords first, (c) route to the active flow, (d) caller logs to MessageLog,
// (e) reply. Members created over messaging are phoneVerified — points post
// directly to `cents`, never `pendingCents` (no claim/escrow step).

import { prisma } from '../db.js';
import { templates, APP_URL } from './templates.js';
import type { Channel, ChannelCapabilities, InboundMessage, OutboundMessage } from './types.js';

// ── Profile drip catalog (mirrors the member app's enums) ───────────────────
const INCOME_BRACKETS = [
  '$20k – $30k', '$30k – $40k', '$40k – $50k', '$50k – $60k', '$60k – $70k',
  '$70k – $80k', '$80k – $90k', '$90k – $100k', '$100k+',
];
const FAMILY_STATUS = ['Yes, I have kids', 'No kids'];
const EDUCATION_LEVELS = [
  'Less than high school', 'High school / GED', 'Trade or vocational', 'Some college',
  "Associate's degree", "Bachelor's degree", "Master's degree", 'Doctorate / PhD',
];
const LANGUAGES = [
  'English', 'Spanish', 'Mandarin', 'Cantonese', 'Arabic', 'Russian', 'French',
  'Haitian Creole', 'Bengali', 'Korean', 'Vietnamese', 'Tagalog', 'Portuguese',
  'Polish', 'Urdu', 'American Sign Language', 'Other',
];
const PUBLIC_BENEFITS = [
  'SNAP / food stamps', 'Medicaid', 'WIC', 'Section 8 / housing voucher',
  'SSI / SSDI', 'TANF / cash assistance', 'Energy assistance (HEAP)', 'None of these',
];

// Order matters: highest-value targeting fields first (income/zip/family gate
// Browse questions, exactly like the app's isProfileQualified).
export interface DripField {
  key: string;
  prompt: string;
  options: string[] | null; // null => free-text numeric
  multi: boolean;
  hint: string; // re-prompt copy when the reply doesn't parse
  parseFree?: (body: string) => { value: any; nice: string } | null;
}

export const DRIP_FIELDS: DripField[] = [
  {
    key: 'income', prompt: 'which best describes your annual household income?',
    options: INCOME_BRACKETS, multi: false,
    hint: `Reply with a number between 1 and ${INCOME_BRACKETS.length}.`,
  },
  {
    key: 'zip', prompt: "what's your 5-digit ZIP code? (Only your city is ever shown to organizations.)",
    options: null, multi: false,
    hint: 'Reply with a 5-digit ZIP code, like 48201.',
    parseFree: (b) => (/^\d{5}$/.test(b.trim()) ? { value: b.trim(), nice: `ZIP ${b.trim()}` } : null),
  },
  {
    key: 'family', prompt: 'do you have kids?',
    options: FAMILY_STATUS, multi: false,
    hint: `Reply 1 or 2.`,
  },
  {
    key: 'birthYear', prompt: 'what year were you born? (4 digits — we only ever share an age range.)',
    options: null, multi: false,
    hint: 'Reply with a 4-digit year, like 1975.',
    parseFree: (b) => {
      const y = parseInt(b.trim(), 10);
      const now = new Date().getFullYear();
      if (!/^\d{4}$/.test(b.trim()) || y < now - 120 || y > now) return null;
      if (now - y < 18) return null; // 18+ only; treated as invalid input
      return { value: y, nice: `born ${y}` };
    },
  },
  {
    key: 'education', prompt: 'what is the highest education you completed?',
    options: EDUCATION_LEVELS, multi: false,
    hint: `Reply with a number between 1 and ${EDUCATION_LEVELS.length}.`,
  },
  {
    key: 'languages', prompt: 'which languages do you speak?',
    options: LANGUAGES, multi: true,
    hint: `Reply with numbers between 1 and ${LANGUAGES.length}, comma-separated (e.g. 1,2).`,
  },
  {
    key: 'benefits', prompt: 'do you use any of these public benefits?',
    options: PUBLIC_BENEFITS, multi: true,
    hint: `Reply with numbers between 1 and ${PUBLIC_BENEFITS.length}, comma-separated (e.g. 1,2).`,
  },
];

// A member must never get stuck: after this many unparseable replies in any
// structured step, the engine gives up on that step gracefully and moves on.
const MAX_RETRIES = 2;

// Mirrors the app: buyers filter on these three, so they unlock Browse.
export function isProfileQualified(profile: any): boolean {
  return Boolean(profile?.income && profile?.zip && profile?.family);
}

// ── Small helpers ────────────────────────────────────────────────────────────

type Ctx = Record<string, any>;

async function loadState(phone: string, channel: Channel) {
  let st = await prisma.conversationState.findUnique({ where: { phone } });
  if (!st) {
    st = await prisma.conversationState.create({ data: { phone, channel, flow: 'idle' } });
  }
  return st;
}

async function saveState(
  phone: string,
  patch: { flow?: string; step?: string | null; context?: Ctx; channel?: Channel; memberId?: string; optedOut?: boolean },
) {
  const data: any = { ...patch, lastInboundAt: new Date() };
  if (patch.context !== undefined) data.context = JSON.stringify(patch.context);
  return prisma.conversationState.update({ where: { phone }, data });
}

function parseCtx(st: { context: string }): Ctx {
  try { return JSON.parse(st.context || '{}'); } catch { return {}; }
}

function parseJson(s: string | null | undefined, fallback: any) {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

async function getMember(memberId: string | null | undefined) {
  if (!memberId) return null;
  return prisma.member.findUnique({ where: { id: memberId } });
}

// Next question this member should get. For You first (highest reward), then
// Browse (which may require a qualifier gate). Skips answered, deep-linked,
// and tags the member said NO to.
export async function nextQuestionFor(memberId: string, ctx: Ctx) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { answers: { select: { questionId: true } } },
  });
  if (!member) return null;
  const answered = new Set(member.answers.map((a) => a.questionId));
  const qualifiedFor = parseJson(member.qualifiedFor, {});
  const profile = parseJson(member.profile, {});
  const deepLinked: Record<string, boolean> = ctx.deepLinked || {};

  const qs = await prisma.question.findMany({
    where: { status: 'live', feed: { not: null } },
    orderBy: [{ cents: 'desc' }, { createdAt: 'asc' }],
  });

  for (const feed of ['foryou', 'browse']) {
    for (const q of qs) {
      if (q.feed !== feed) continue;
      if (answered.has(q.id) || deepLinked[q.id]) continue;
      if (feed === 'browse' && !isProfileQualified(profile)) continue;
      const qual = parseJson(q.qualifier, null);
      if (qual?.tag && qualifiedFor[qual.tag] === false) continue; // said NO before
      return { q, needsQualifier: Boolean(qual?.tag && qualifiedFor[qual.tag] !== true), qualifier: qual };
    }
  }
  return null;
}

// Build the outbound message(s) + state mutation for serving a question.
// Returns replies and applies flow/context to the pending state patch.
export async function serveQuestion(
  phone: string,
  memberId: string,
  ctx: Ctx,
  caps: ChannelCapabilities,
): Promise<OutboundMessage[]> {
  const next = await nextQuestionFor(memberId, ctx);
  if (!next) {
    await saveState(phone, { flow: 'idle', step: null, context: {} });
    return [templates.noQuestions()];
  }
  const { q, needsQualifier, qualifier } = next;

  if (needsQualifier) {
    await saveState(phone, { flow: 'qualifier', step: null, context: { ...ctx, qid: q.id, tag: qualifier.tag, label: qualifier.label } });
    return [templates.qualifier(qualifier.label)];
  }

  const review = parseJson(q.review, null);
  if (review?.media?.length && !caps.media) {
    // Media-heavy review question: SMS can't do it justice — deep link instead
    // and remember not to re-offer over this channel.
    const deepLinked = { ...(ctx.deepLinked || {}), [q.id]: true };
    await saveState(phone, { flow: 'idle', step: null, context: { ...ctx, deepLinked } });
    return [{ ...templates.reviewDeepLink(q), questionId: q.id }];
  }
  if (review?.reactions?.length) {
    await saveState(phone, { flow: 'answering', step: 'reaction', context: { ...ctx, qid: q.id, reactions: review.reactions } });
    return [{ ...templates.reviewQuestion(q, review.reactions), questionId: q.id }];
  }

  await saveState(phone, { flow: 'answering', step: null, context: { ...ctx, qid: q.id } });
  return [{ ...templates.question(q), questionId: q.id }];
}

// Record an answer + credit points. Phone-verified members are past "claim":
// credit `cents` only (no escrow). Naive streak: +1 on the first answer of a day.
async function recordAnswer(memberId: string, q: any, text: string, channel: Channel, reaction?: string | null) {
  const reward = q.cents || q.points || 0;
  const attrs: any[] = reaction ? [{ k: 'reaction', v: reaction }] : [];

  const last = await prisma.answer.findFirst({ where: { memberId }, orderBy: { createdAt: 'desc' } });
  const today = new Date().toDateString();
  const streakBump = !last || last.createdAt.toDateString() !== today ? 1 : 0;

  await prisma.$transaction([
    prisma.answer.create({
      data: { questionId: q.id, memberId, text, mode: 'text', channel, cents: reward, attrs: JSON.stringify(attrs) },
    }),
    prisma.question.update({ where: { id: q.id }, data: { collected: { increment: 1 } } }),
    prisma.member.update({
      where: { id: memberId },
      data: { cents: { increment: reward }, streak: { increment: streakBump } },
    }),
  ]);

  const m = await prisma.member.findUnique({ where: { id: memberId } });
  return { reward, balance: m?.cents ?? 0 };
}

// Pick the next unanswered drip field for this member (never re-ask a filled
// field), or null when the profile is complete for drip purposes.
export function nextDripField(profile: any, skipped: Record<string, boolean> = {}): DripField | null {
  for (const f of DRIP_FIELDS) {
    const v = profile?.[f.key];
    const filled = Array.isArray(v) ? v.length > 0 : Boolean(v);
    if (!filled && !skipped[f.key]) return f;
  }
  return null;
}

function askDrip(field: DripField): OutboundMessage {
  return templates.profileQuestion(field.prompt, field.options, field.multi);
}

// ── Global keyword sets (CTIA) ───────────────────────────────────────────────
const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);
const START_WORDS = new Set(['START', 'UNSTOP', 'JOIN', 'YES JOIN']);
const HELP_WORDS = new Set(['HELP', 'INFO']);

// ── The engine ───────────────────────────────────────────────────────────────

export async function handleInbound(inbound: InboundMessage, caps: ChannelCapabilities): Promise<OutboundMessage[]> {
  const phone = inbound.from;
  const body = (inbound.body || '').trim();
  const keyword = body.toUpperCase().replace(/[.!]/g, '').trim();

  const st = await loadState(phone, inbound.channel);
  const ctx = parseCtx(st);
  // A member texting from WhatsApp upgrades their preferred channel.
  if (st.channel !== inbound.channel) await saveState(phone, { channel: inbound.channel, context: ctx });

  // (b) Global keywords — always first, any state.
  if (STOP_WORDS.has(keyword)) {
    await saveState(phone, { optedOut: true, flow: 'idle', step: null, context: {} });
    return [templates.stopConfirm()]; // single confirmation, then silence forever
  }
  if (HELP_WORDS.has(keyword)) {
    return [templates.help()];
  }

  if (st.optedOut && !START_WORDS.has(keyword)) {
    return []; // legal requirement: nothing after STOP except START/HELP
  }

  const member = await getMember(st.memberId);

  if (keyword === 'BALANCE') {
    if (!member) return [templates.unknownNumber()];
    return [templates.balance(member.cents, member.streak)];
  }

  if (START_WORDS.has(keyword)) {
    if (st.optedOut) await saveState(phone, { optedOut: false, context: ctx });
    if (!member) {
      await saveState(phone, { flow: 'signup', step: 'alias', context: {} });
      return [templates.welcome()];
    }
    const alias = parseJson(member.profile, {}).alias || null;
    const replies = [templates.welcomeBack(alias)];
    replies.push(...(await serveQuestion(phone, member.id, ctx, caps)));
    return replies;
  }

  // (c) Route to the active flow.
  switch (st.flow) {
    case 'signup': {
      if (st.step === 'alias') {
        const alias = body.slice(0, 40).replace(/[\r\n]+/g, ' ').trim();
        if (!alias) return [templates.welcome()];
        const digits = phone.replace(/\D/g, '');
        const m = await prisma.member.upsert({
          where: { phone },
          create: {
            email: `sms-${digits}@members.weloopedin.com`,
            phone,
            phoneVerified: true,
            signupChannel: inbound.channel,
            streak: 0,
            profile: JSON.stringify({ alias }),
          },
          update: { phoneVerified: true, signupChannel: inbound.channel },
        });
        await saveState(phone, { memberId: m.id, flow: 'idle', step: null, context: {} });
        const replies = [templates.signupDone(alias)];
        replies.push(...(await serveQuestion(phone, m.id, {}, caps)));
        return replies;
      }
      // Unknown signup step — restart.
      await saveState(phone, { flow: 'signup', step: 'alias', context: {} });
      return [templates.welcome()];
    }

    case 'answering': {
      if (!member || !ctx.qid) break; // fall through to idle handling
      const q = await prisma.question.findUnique({ where: { id: ctx.qid } });
      if (!q) { await saveState(phone, { flow: 'idle', step: null, context: {} }); break; }

      // Review question, step 1: numbered reaction. Unparseable replies re-ask
      // once; after that we accept the text as the answer itself (never trap).
      if (st.step === 'reaction') {
        const n = parseInt(keyword, 10);
        const reactions: string[] = ctx.reactions || [];
        if (!Number.isInteger(n) || n < 1 || n > reactions.length) {
          const retries = (ctx.retries || 0) + 1;
          if (retries < MAX_RETRIES && body.length < 20) {
            await saveState(phone, { flow: 'answering', step: 'reaction', context: { ...ctx, retries } });
            return [templates.reviewQuestion(q, reactions)];
          }
          // Long reply or repeated miss: treat it as the answer, no reaction.
          await saveState(phone, { flow: 'answering', step: null, context: { ...ctx, retries: 0 } });
          // fall through to free-text handling below via recursion-free path:
          if (body.length >= 3) {
            const { reward, balance } = await recordAnswer(member.id, q, body, inbound.channel, null);
            await saveState(phone, { flow: 'idle', step: null, context: { deepLinked: ctx.deepLinked || {}, dripSkipped: ctx.dripSkipped || {} } });
            return [{ ...templates.answerConfirm(reward, balance), questionId: q.id }];
          }
          return [templates.answerTooShort()];
        }
        const reaction = reactions[n - 1];
        await saveState(phone, { flow: 'answering', step: 'why', context: { ...ctx, reaction, retries: 0 } });
        return [templates.reviewWhy(reaction)];
      }

      // Free-text answer (classic, or review step 2 "why").
      if (body.length < 3) return [templates.answerTooShort()];
      const { reward, balance } = await recordAnswer(member.id, q, body, inbound.channel, ctx.reaction || null);
      const replies: OutboundMessage[] = [{ ...templates.answerConfirm(reward, balance), questionId: q.id }];

      // Piggyback one profile-drip question on the confirmation (brief §5.3) —
      // it rides an existing conversation, so the daily cap doesn't apply.
      const fresh = await prisma.member.findUnique({ where: { id: member.id } });
      const profile = parseJson(fresh!.profile, {});
      const drip = nextDripField(profile, ctx.dripSkipped || {});
      if (drip) {
        await saveState(phone, {
          flow: 'profile_drip', step: null,
          context: { deepLinked: ctx.deepLinked || {}, dripSkipped: ctx.dripSkipped || {}, profileField: drip.key },
        });
        replies.push(askDrip(drip));
      } else {
        await saveState(phone, { flow: 'idle', step: null, context: { deepLinked: ctx.deepLinked || {}, dripSkipped: ctx.dripSkipped || {} } });
      }
      return replies;
    }

    case 'qualifier': {
      if (!member || !ctx.tag) break;
      const yes = /^(YES|Y|YEAH|YEP|SI|SÍ)$/i.test(keyword);
      const no = /^(NO|N|NOPE)$/i.test(keyword);
      if (!yes && !no) {
        const retries = (ctx.retries || 0) + 1;
        if (retries < MAX_RETRIES) {
          await saveState(phone, { flow: 'qualifier', step: null, context: { ...ctx, retries } });
          return [templates.qualifier(ctx.label || 'in this group')];
        }
        // Repeated misses: abandon the gate (don't mark the tag either way,
        // don't re-offer this question this session) and move on.
        const cleaned = {
          deepLinked: { ...(ctx.deepLinked || {}), ...(ctx.qid ? { [ctx.qid]: true } : {}) },
          dripSkipped: ctx.dripSkipped || {},
        };
        return serveQuestion(phone, member.id, cleaned, caps);
      }

      const qualifiedFor = parseJson(member.qualifiedFor, {});
      qualifiedFor[ctx.tag] = yes;
      await prisma.member.update({ where: { id: member.id }, data: { qualifiedFor: JSON.stringify(qualifiedFor) } });

      if (yes && ctx.qid) {
        const q = await prisma.question.findUnique({ where: { id: ctx.qid } });
        if (q) {
          await saveState(phone, { flow: 'answering', step: null, context: { ...ctx, tag: undefined, label: undefined } });
          return [{ ...templates.question(q), questionId: q.id }];
        }
      }
      // NO (or the question vanished): confirm and offer whatever's next.
      const cleaned = { deepLinked: ctx.deepLinked || {}, dripSkipped: ctx.dripSkipped || {} };
      const replies = [templates.qualifierNo()];
      replies.push(...(await serveQuestion(phone, member.id, cleaned, caps)));
      return replies;
    }

    case 'profile_drip': {
      if (!member || !ctx.profileField) break;
      const field = DRIP_FIELDS.find((f) => f.key === ctx.profileField);
      if (!field) { await saveState(phone, { flow: 'idle', step: null, context: {} }); break; }

      const baseCtx = { deepLinked: ctx.deepLinked || {}, dripSkipped: ctx.dripSkipped || {} };

      if (keyword === 'SKIP') {
        baseCtx.dripSkipped[field.key] = true;
        await saveState(phone, { flow: 'idle', step: null, context: baseCtx });
        return [templates.profileSkipped()];
      }

      // Unparseable replies re-prompt with the field's hint; after MAX_RETRIES
      // the field is auto-skipped so nobody is ever stuck in a drip loop.
      const badInput = async () => {
        const retries = (ctx.retries || 0) + 1;
        if (retries < MAX_RETRIES) {
          await saveState(phone, { flow: 'profile_drip', step: null, context: { ...ctx, retries } });
          return [templates.profileBadInput(field.hint)];
        }
        baseCtx.dripSkipped[field.key] = true;
        await saveState(phone, { flow: 'idle', step: null, context: baseCtx });
        return [templates.profileSkipped()];
      };

      let value: any = null;
      let nice = '';
      if (field.options) {
        const max = field.options.length;
        if (field.multi) {
          const ns = keyword.split(/[,\s]+/).map((s) => parseInt(s, 10)).filter((n) => Number.isInteger(n) && n >= 1 && n <= max);
          if (!ns.length) return badInput();
          value = [...new Set(ns)].map((n) => field.options![n - 1]);
          nice = value.join(', ');
        } else {
          const n = parseInt(keyword, 10);
          if (!Number.isInteger(n) || n < 1 || n > max) return badInput();
          value = field.options[n - 1];
          nice = value;
        }
      } else if (field.parseFree) {
        const parsed = field.parseFree(body);
        if (!parsed) return badInput();
        value = parsed.value;
        nice = parsed.nice;
      }

      const profile = parseJson(member.profile, {});
      profile[field.key] = value;
      await prisma.member.update({ where: { id: member.id }, data: { profile: JSON.stringify(profile) } });
      await saveState(phone, { flow: 'idle', step: null, context: baseCtx });
      return [templates.profileSaved(nice)];
    }
  }

  // (idle / fallthrough) Unknown number → invite. Known member texting out of
  // the blue → treat it as intent: offer the next eligible question.
  if (!member) {
    await saveState(phone, { flow: 'idle', step: null, context: ctx });
    return [templates.unknownNumber()];
  }
  return serveQuestion(phone, member.id, { deepLinked: ctx.deepLinked || {}, dripSkipped: ctx.dripSkipped || {} }, caps);
}

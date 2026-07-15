// All outbound copy lives here — one place to edit, per-channel variants when
// WhatsApp needs pre-approved template wording. Keep SMS bodies short (<320
// chars ≈ 2 segments) and always assume plain text + numbered options.
//
// Compliance: the first outbound to any number MUST carry the opt-out line
// (toll-free/CTIA requirement). STOP/HELP handling is in the engine.

import type { OutboundMessage } from './types.js';

const OPT_OUT_LINE = 'Msg&data rates may apply. Reply STOP to opt out, HELP for help.';

export const SUPPORT_CONTACT = process.env.MESSAGING_SUPPORT_EMAIL || 'hello@weloopedin.com';
export const APP_URL = process.env.PUBLIC_APP_URL || 'https://www.weloopedin.com';

function t(templateKey: string, body: string, extra: Partial<OutboundMessage> = {}): OutboundMessage {
  return { templateKey, body, ...extra };
}

export const templates = {
  // ── Signup ────────────────────────────────────────────────────────────────
  welcome: () =>
    t(
      'welcome',
      `Welcome to LoopedIn. Answer short questions from orgs that want to hear from people like you — anonymously — and earn points you can turn into rewards. ${OPT_OUT_LINE}\n\nFirst: what should we call you? Reply with a first name or nickname.`,
    ),

  welcomeBack: (alias: string | null) =>
    t(
      'welcome_back',
      alias
        ? `Welcome back${alias ? `, ${alias}` : ''}. Reply with your answer anytime, or text BALANCE for your points.`
        : `Welcome back. Reply with your answer anytime, or text BALANCE for your points.`,
    ),

  signupDone: (alias: string) =>
    t(
      'signup_done',
      `Thanks, ${alias}. You're in — your answers are anonymous to the organizations asking. Here's your first question:`,
    ),

  // ── Questions ─────────────────────────────────────────────────────────────
  question: (q: { text: string; cents: number }) =>
    t(
      'question',
      q.cents > 0
        ? `Earn ${q.cents} pts: ${q.text}\nReply with your answer.`
        : `${q.text}\nReply with your answer.`,
    ),

  reviewQuestion: (q: { text: string; cents: number }, reactions: string[]) =>
    t(
      'review_question',
      `Earn ${q.cents} pts: ${q.text}\n` +
        reactions.map((r, i) => `${i + 1}) ${r}`).join('  ') +
        `\nReply with a number, then tell us why.`,
      { options: reactions },
    ),

  reviewDeepLink: (q: { text: string; cents: number }) =>
    t(
      'review_deep_link',
      `Earn ${q.cents} pts: ${q.text}\nThis one has photos/video to look at: ${APP_URL}/member`,
    ),

  reviewWhy: (reaction: string) =>
    t('review_why', `Got it — "${reaction}". Tell us why in a sentence or two.`),

  answerConfirm: (earned: number, balance: number) =>
    t(
      'answer_confirm',
      earned > 0 ? `Got it. +${earned} pts. Balance: ${balance} pts.` : `Got it — thanks for your answer.`,
    ),

  noQuestions: () =>
    t('no_questions', `You're all caught up — no new questions right now. We'll text you when there's a new one.`),

  answerTooShort: () =>
    t('answer_too_short', `Could you say a bit more? Even one full sentence helps the people listening.`),

  // ── Qualifier gate ────────────────────────────────────────────────────────
  qualifier: (label: string) =>
    t('qualifier', `Quick check — this question is for people who are ${label}. Is that you? Reply YES or NO.`, {
      options: ['YES', 'NO'],
    }),

  qualifierNo: () =>
    t('qualifier_no', `No problem — we'll match you with other questions instead.`),

  // ── Profile drip ──────────────────────────────────────────────────────────
  profileQuestion: (prompt: string, options: string[] | null, multi: boolean) =>
    t(
      'profile_question',
      options
        ? `Quick one: ${prompt}\n` +
          options.map((o, i) => `${i + 1}) ${o}`).join('\n') +
          (multi ? `\nReply with numbers, comma-separated (e.g. 1,3).` : `\nReply with a number.`)
        : `Quick one: ${prompt}`,
      { options: options || undefined },
    ),

  profileSaved: (nice: string) => t('profile_saved', `Saved — ${nice}. Fuller profiles unlock higher-paying questions.`),

  profileBadInput: (hint: string) => t('profile_bad_input', `${hint} Or reply SKIP.`),

  profileSkipped: () => t('profile_skipped', `Skipped. We'll ask something else another time.`),

  // ── Global keywords ───────────────────────────────────────────────────────
  stopConfirm: () =>
    t('stop_confirm', `You're unsubscribed from LoopedIn and will get no more messages. Reply START anytime to rejoin.`),

  help: () =>
    t(
      'help',
      `LoopedIn: answer questions, earn points. Commands: BALANCE (your points), START (get questions), STOP (unsubscribe). Support: ${SUPPORT_CONTACT}`,
    ),

  balance: (balance: number, streak: number) =>
    t('balance', `You have ${balance} pts${streak > 0 ? ` and a ${streak}-day streak` : ''}. 100 pts = $1 in rewards (cashout coming soon). See it all: ${APP_URL}/member`),

  unknownNumber: () =>
    t(
      'unknown_number',
      `This is LoopedIn — get paid for your answers, anonymously. Reply JOIN to start. ${OPT_OUT_LINE}`,
    ),

  genericNudge: () =>
    t('generic_nudge', `Reply JOIN to get started, BALANCE for points, or HELP for help.`),

  // ── OTP (member-app phone login) ─────────────────────────────────────────
  otp: (code: string) =>
    t('otp', `Your LoopedIn login code is ${code}. It expires in 10 minutes. Never share this code.`),
};

export type TemplateKey = keyof typeof templates;

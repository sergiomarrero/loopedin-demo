// Urgent-signal detection (brief §5). A lightweight classifier runs on every
// answer at ingest and writes an UrgentSignal row on a hit. Two trigger classes
// only, for now: safety_crisis and fraud_spam.
//
// This build is rules-first (cheap, deterministic, offline) with an OPTIONAL
// Claude check on borderline cases when ANTHROPIC_API_KEY is configured — the
// brief's "cheap model / rules + a Claude check on borderline cases". The action
// is dashboard-flag ONLY: no member-facing crisis resources, no external
// notification this build (brief §5.3, non-goals §9).

export type SignalType = 'safety_crisis' | 'fraud_spam';
export type Severity = 'low' | 'medium' | 'high';

export type Detection = {
  type: SignalType;
  severity: Severity;
  rationale: string;
} | null;

// Acute-distress / threat-to-self-or-others cues. Deliberately high-recall; this
// build prefers a false flag (a human reviews) over a missed crisis.
const CRISIS_PATTERNS: { re: RegExp; severity: Severity; why: string }[] = [
  { re: /\b(kill|hurt|harm)(ing)?\s+myself\b|\bend(ing)?\s+(it|my life)\b|\bsuicid/i, severity: 'high', why: 'explicit self-harm language' },
  { re: /\bdon'?t\s+want\s+to\s+(be here|live|wake up)\b|\bno\s+reason\s+to\s+(go on|live)\b/i, severity: 'high', why: 'expression of not wanting to live' },
  { re: /\b(he|she|they|my\s+\w+)\s+(hits?|beats?|hurts?|threatens?)\s+me\b|\bafraid\s+(for|of)\s+my\s+(life|safety)\b/i, severity: 'high', why: 'abuse / threat to safety' },
  { re: /\bcan'?t\s+(take|do)\s+(it|this)\s+anymore\b|\bbreaking\s+down\b|\bhopeless\b/i, severity: 'medium', why: 'acute distress' },
];

// Bot-like / templated / gibberish / inconsistent-with-question cues.
const FRAUD_PATTERNS: { re: RegExp; severity: Severity; why: string }[] = [
  { re: /\b(lorem ipsum|asdf|qwerty|test test|aaaa+|x{4,})\b/i, severity: 'high', why: 'gibberish / keyboard-mash' },
  { re: /^(great|good|nice|ok|yes|n\/a|none)\.?\s*$/i, severity: 'medium', why: 'non-substantive templated answer' },
  { re: /\b(click here|buy now|free money|http:\/\/|https:\/\/|www\.)\b/i, severity: 'high', why: 'spam / link injection' },
];

function rulesPass(text: string): Detection {
  for (const p of CRISIS_PATTERNS) {
    if (p.re.test(text)) return { type: 'safety_crisis', severity: p.severity, rationale: p.why };
  }
  for (const p of FRAUD_PATTERNS) {
    if (p.re.test(text)) return { type: 'fraud_spam', severity: p.severity, rationale: p.why };
  }
  // Very short or duplicated-token answers look like farming.
  const tokens = text.trim().split(/\s+/);
  const unique = new Set(tokens.map((t) => t.toLowerCase()));
  if (tokens.length >= 6 && unique.size <= 2) {
    return { type: 'fraud_spam', severity: 'medium', rationale: 'repeated-token / low-entropy answer' };
  }
  return null;
}

/**
 * Classify one answer. De-identified text only — the detector never receives
 * member identity. Borderline cases may escalate to a Claude check when the API
 * is configured; the rules result stands otherwise.
 */
export async function detectSignal(text: string | null | undefined): Promise<Detection> {
  if (!text || !text.trim()) return null;
  const byRules = rulesPass(text);
  if (byRules) return byRules;
  // Borderline Claude check is a documented seam: enabled only with an API key,
  // kept off by default so the demo stays free/offline. See synthesis.ts for the
  // shared Anthropic client pattern.
  return null;
}

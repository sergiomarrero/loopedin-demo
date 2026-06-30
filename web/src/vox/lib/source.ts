// Data-source seam for the top filter (feature #3 — "server-side search ready").
//
// TODAY this filters the baked QUESTIONS array in the browser: zero backend,
// zero operating cost. The point of routing the filter through ONE function is
// that when a real Vox backend exists, only the body below changes — swap it for
// a debounced `fetch('/api/vox/questions?org=…&topic=…&q=…&limit=…')`. Every call
// site and type stays identical, so the UI scales to thousands of questions
// without ever shipping them all to the client.

import { QUESTIONS, ORGS, type Session } from '../data';

// Option shape shared by every combobox (org / question / topic).
export type Opt = { value: string; label: string; sub?: string };

export type QuestionFilters = {
  orgs?: string[];      // empty / undefined = any organization
  verticals?: string[]; // topic facet (Session.vertical)
  modes?: string[];     // 'voice' | 'text'
  search?: string;      // free-text — where server-side search plugs in
};

const hit = (s: string, q: string) => s.toLowerCase().includes(q.toLowerCase());

// Distinct topics across every question — drives the Topic facet.
export const VERTICALS: string[] = Array.from(new Set(QUESTIONS.map((q) => q.vertical))).sort();

// All filterable organizations (re-exported so callers have one import surface).
export const ALL_ORGS: string[] = ORGS;

/**
 * Resolve the set of questions matching the current facet selection. This is the
 * cascade: pick an org / topic / format and the question list narrows to match.
 * `search` is supported here so the same function backs type-ahead once results
 * come from the server instead of memory.
 */
export function queryQuestions(f: QuestionFilters = {}): Session[] {
  let out = QUESTIONS;
  if (f.orgs && f.orgs.length) out = out.filter((q) => f.orgs!.includes(q.orgLabel));
  if (f.verticals && f.verticals.length) out = out.filter((q) => f.verticals!.includes(q.vertical));
  if (f.modes && f.modes.length) out = out.filter((q) => f.modes!.includes(q.mode));
  const s = f.search && f.search.trim();
  if (s) out = out.filter((q) => hit(q.title, s) || hit(q.orgLabel, s));
  return out;
}

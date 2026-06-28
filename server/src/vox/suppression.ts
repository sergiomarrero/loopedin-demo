// Re-identification suppression — the load-bearing org-view guardrail (brief §6).
//
// Even with names removed, ZIP + age + benefit + lived-experience + kids can
// fingerprint one real person. EVERY org-facing demographic output must pass
// through `enforceCells` so a thin or rare cell can never leak. The internal
// RBL1 view is the only exemption (brief §2).
//
// This is the single source of truth. The frontend keeps a mirror
// (web/src/vox/lib/suppression.ts) for the static demo, but the server enforces
// here so an org API response can never carry a sub-floor count.

export type View = 'internal' | 'org';

// Minimum members in a cell before it may be rendered. Config-driven so it can be
// tuned without a code change (brief §6).
export const MIN_CELL = Number(process.env.VOX_MIN_CELL) || 5;

export type Cell = {
  key: string; // e.g. "income:<$30k" or "lived:justice-involved+kids:2"
  label: string;
  count: number;
  // marks a multi-attribute combination so rare combos can be suppressed even
  // when each attribute alone clears the floor.
  combination?: boolean;
  value?: number; // optional metric (e.g. sentiment) carried alongside the count
};

export type EnforcedCell =
  | (Cell & { suppressed: false })
  | { key: string; label: string; suppressed: true; reason: 'min_cell' | 'rare_combination' };

// Race/ethnicity is aggregate-visible but NEVER a slicer (parent brief §4/§8/§13).
// Any cell whose key targets race/ethnicity as a filter is dropped outright.
const RACE_SLICER = /^(race|ethnicity)\s*:/i;

/**
 * The one function every org-facing breakdown passes through. Internal view is
 * returned untouched (sees raw, small cells); org view suppresses thin cells,
 * rare combinations, and any race/ethnicity slicer.
 */
export function enforceCells(view: View, cells: Cell[]): EnforcedCell[] {
  if (view === 'internal') {
    return cells.map((c) => ({ ...c, suppressed: false as const }));
  }
  return cells
    .filter((c) => !RACE_SLICER.test(c.key)) // race/ethnicity is never a slicer in org view
    .map((c): EnforcedCell => {
      if (c.count < MIN_CELL) {
        return { key: c.key, label: c.label, suppressed: true, reason: 'min_cell' };
      }
      // Rare multi-attribute combinations are suppressed even above the floor.
      if (c.combination && c.count < MIN_CELL * 2) {
        return { key: c.key, label: c.label, suppressed: true, reason: 'rare_combination' };
      }
      return { ...c, suppressed: false };
    });
}

/** True if a single aggregate count may be shown to an org view. */
export function cellVisible(view: View, count: number): boolean {
  return view === 'internal' || count >= MIN_CELL;
}

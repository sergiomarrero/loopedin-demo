// Re-identification suppression — CLIENT MIRROR of server/src/vox/suppression.ts
// (brief §6). The server is the source of truth; this mirror lets the static
// Vercel demo (which has no backend) enforce the same org-view floor so a thin
// or rare cell never renders. Keep the two in sync.

export type View = 'internal' | 'org';

export const MIN_CELL = 5; // default floor; server reads VOX_MIN_CELL

export type Cell = { key: string; label: string; count: number; combination?: boolean };
export type EnforcedCell =
  | (Cell & { suppressed: false })
  | { key: string; label: string; suppressed: true; reason: 'min_cell' | 'rare_combination' };

const RACE_SLICER = /^(race|ethnicity)\s*:/i;

// The single function every org-facing breakdown passes through. Internal view
// is returned raw; org view suppresses thin cells, rare combos, race slicers.
export function enforceCells(view: View, cells: Cell[]): EnforcedCell[] {
  if (view === 'internal') return cells.map((c) => ({ ...c, suppressed: false as const }));
  return cells
    .filter((c) => !RACE_SLICER.test(c.key))
    .map((c): EnforcedCell => {
      if (c.count < MIN_CELL) return { key: c.key, label: c.label, suppressed: true, reason: 'min_cell' };
      if (c.combination && c.count < MIN_CELL * 2)
        return { key: c.key, label: c.label, suppressed: true, reason: 'rare_combination' };
      return { ...c, suppressed: false };
    });
}

// Turn a chip->count map into suppression-aware cells, sorted by count desc.
export function cellsFromCounts(view: View, counts: Record<string, number>): EnforcedCell[] {
  const cells: Cell[] = Object.entries(counts).map(([key, count]) => ({ key, label: key, count }));
  return enforceCells(view, cells).sort((a, b) => {
    const ca = 'count' in a ? a.count : -1;
    const cb = 'count' in b ? b.count : -1;
    return cb - ca;
  });
}

// Signal export seam (brief §11). LoopedIn Vox is one feeder into Signal, RBL1's
// separate intelligence layer. Direction is ONE-WAY (Vox -> Signal): we push
// synthesized, already-de-identified artifacts and never read back this build.
//
// What may cross the boundary: Theme records, aggregate breakdowns that already
// clear the §6 cell floor, and trend series. NEVER raw answers, member-level
// rows, or UrgentSignal records (those stay internal to Vox, brief §5.4).
//
// The payload is versioned so Signal isn't coupled to Vox' internal schema.

import { prisma } from '../db.js';
import { enforceCells, type Cell } from './suppression.js';

export const EXPORT_VERSION = '1.0';

// Themes for export. Default-safe: demographic breakdowns are run through the
// ORG-view suppression floor even for internal callers, because anything bound
// for Signal could surface outside RBL1 (brief §11, last paragraph).
export async function exportThemes(scope?: string) {
  const themes = await prisma.theme.findMany({
    where: scope ? { scope } : {},
    orderBy: { weightPct: 'desc' },
  });
  return {
    version: EXPORT_VERSION,
    kind: 'themes' as const,
    generatedAt: new Date().toISOString(),
    themes: themes.map((t) => {
      const demo = JSON.parse(t.demographics || '{}') as Record<string, number>;
      const cells: Cell[] = Object.entries(demo).map(([key, count]) => ({ key, label: key, count }));
      const safe = enforceCells('org', cells).filter((c) => !c.suppressed);
      return {
        id: t.id,
        scope: t.scope,
        label: t.label,
        summary: t.summary,
        weightPct: t.weightPct,
        answerCount: t.answerCount,
        sentimentScore: t.sentimentScore,
        // only suppression-cleared aggregate cells cross the boundary
        demographics: Object.fromEntries(safe.map((c: any) => [c.key, c.count])),
        representativeQuoteIds: JSON.parse(t.representativeQuoteIds || '[]'),
      };
    }),
  };
}

// Trend series for export: theme prevalence + sentiment over time, by scope.
export async function exportTrends(scope?: string) {
  const runs = await prisma.synthesisRun.findMany({
    where: scope ? { scope } : {},
    orderBy: { startedAt: 'asc' },
  });
  return {
    version: EXPORT_VERSION,
    kind: 'trends' as const,
    generatedAt: new Date().toISOString(),
    runs: runs.map((r) => ({
      scope: r.scope,
      scopeRefId: r.scopeRefId,
      at: r.startedAt.toISOString(),
      answerCountIn: r.answerCountIn,
      status: r.status,
    })),
  };
}

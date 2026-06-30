// LoopedIn Vox dashboard (brief §1–§7). Static/offline demo: drives every surface
// from the baked dataset in data.ts (mirrors how LoopedIn's own Vercel build runs
// on seed data). The Internal⇄Org toggle is a demo aid; the REAL boundary is the
// data layer — org scope only ever reads its own session, demographics pass
// through the §6 suppression mirror, and urgent signals / cross-org are
// unreachable from the org view (brief §2/§5.4/§6).

import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SESSIONS, CROSS_ORG, SIGNALS, LAST_SYNTHESIZED, QUESTIONS, ORGS, type Theme, type Sentiment, type TrendPoint, type Signal, type Session } from './data';
import { cellsFromCounts, type View, type EnforcedCell } from './lib/suppression';

// 'admin' is the urgent-signal review queue — internal RBL1 only, moved to #6.
type Surface = 'themes' | 'sentiment' | 'demographics' | 'health' | 'trends' | 'admin';
const NAV: { key: Surface; label: string; internalOnly?: boolean }[] = [
  { key: 'themes', label: 'Emerging themes' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'demographics', label: 'Demographics' },
  { key: 'health', label: 'Response health' },
  { key: 'trends', label: 'Trends over time' },
  { key: 'admin', label: 'Admin', internalOnly: true },
];

// The org view simulates one signed-in org, locked to its own questions.
const ORG_VIEW_ORG = SESSIONS[0].orgLabel; // 'Health Research Org'

function pct(n: number) { return `${Math.round(n * 100)}%`; }
function sentimentLabel(s: number) { return s > 0.15 ? 'Positive' : s < -0.15 ? 'Negative' : 'Mixed'; }
function trunc(s: string, n: number) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// ── Slicing: fold a set of questions into one view (themes/sentiment/…). The
// filter bar drives WHICH questions; this turns them into the surfaces' data. ──
type Slice = { title: string; themes: Theme[]; sentiment: Sentiment; trends: TrendPoint[]; demographics: Record<string, number> };

function sumDemographics(qs: Session[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of qs) for (const [k, v] of Object.entries(q.demographics)) out[k] = (out[k] || 0) + v;
  return out;
}
function sumSentiment(qs: Session[]): Sentiment {
  const s = qs.reduce((a, q) => ({ positive: a.positive + q.sentiment.positive, neutral: a.neutral + q.sentiment.neutral, negative: a.negative + q.sentiment.negative, avgIntensity: a.avgIntensity + q.sentiment.avgIntensity }), { positive: 0, neutral: 0, negative: 0, avgIntensity: 0 });
  return { ...s, avgIntensity: qs.length ? s.avgIntensity / qs.length : 0 };
}
function sumTrends(qs: Session[]): TrendPoint[] {
  const byPeriod = new Map<string, { count: number; sent: number; n: number }>();
  for (const q of qs) for (const t of q.trends) {
    const cur = byPeriod.get(t.period) || { count: 0, sent: 0, n: 0 };
    cur.count += t.count; cur.sent += t.avgSentiment; cur.n += 1; byPeriod.set(t.period, cur);
  }
  return [...byPeriod.entries()].map(([period, v]) => ({ period, count: v.count, avgSentiment: Math.round((v.sent / v.n) * 100) / 100 }));
}
function aggregate(qs: Session[], title: string): Slice {
  if (qs.length === 1) { const q = qs[0]; return { title: q.title, themes: q.themes, sentiment: q.sentiment, trends: q.trends, demographics: q.demographics }; }
  return { title, themes: qs.flatMap((q) => q.themes).sort((a, b) => b.weightPct - a.weightPct), sentiment: sumSentiment(qs), trends: sumTrends(qs), demographics: sumDemographics(qs) };
}

function App() {
  const [view, setView] = useState<View>('internal');
  const [surface, setSurface] = useState<Surface>('themes');
  const [orgFilter, setOrgFilter] = useState<string>('all'); // 'all' | orgLabel
  const [qFilter, setQFilter] = useState<string>('all');     // 'all' | question id
  const [signals, setSignals] = useState<Signal[]>(SIGNALS);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(LAST_SYNTHESIZED);

  const isOrg = view === 'org';
  // Org view is locked to one organization; internal can pick any org (or all).
  const org = isOrg ? ORG_VIEW_ORG : orgFilter;
  const orgQuestions = useMemo(() => (org === 'all' ? QUESTIONS : QUESTIONS.filter((x) => x.orgLabel === org)), [org]);
  const activeQuestions = useMemo(() => (qFilter === 'all' ? orgQuestions : QUESTIONS.filter((x) => x.id === qFilter)), [qFilter, orgQuestions]);

  // The pre-authored cross-org synthesis is the internal "everything" view;
  // any narrower filter re-slices the questions live.
  const isCross = !isOrg && org === 'all' && qFilter === 'all';
  const slice: Slice = isCross
    ? { title: 'All organizations', themes: CROSS_ORG.themes, sentiment: CROSS_ORG.sentiment, trends: CROSS_ORG.trends, demographics: sumDemographics(QUESTIONS) }
    : aggregate(activeQuestions, org === 'all' ? 'All organizations' : org);

  const visibleNav = isOrg ? NAV.filter((n) => !n.internalOnly) : NAV; // org view hides Admin entirely
  const activeNav = NAV.find((n) => n.key === surface) ?? NAV[0];

  function switchView(v: View) {
    setView(v);
    if (v === 'org') {
      setOrgFilter('all'); setQFilter('all');
      if (NAV.find((n) => n.key === surface)?.internalOnly) setSurface('themes'); // bounce off Admin
    }
  }
  function refresh() {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSynced('just now'); }, 900);
  }
  function reviewSignal(code: string, status: 'reviewed' | 'dismissed') {
    setSignals((cur) => cur.map((s) => (s.code === code ? { ...s, status } : s)));
  }

  const summary = qFilter !== 'all'
    ? `1 question · ${slice.themes.length} themes`
    : isCross
      ? `${QUESTIONS.length} questions · cross-org synthesis`
      : `${orgQuestions.length} question${orgQuestions.length === 1 ? '' : 's'}${org === 'all' ? '' : ` · ${org}`}`;

  return (
    <div className="app">
      <header className="appbar">
        <div className="brand">
          <span className="monogram" aria-hidden>R</span>
          <span className="lockup">
            <span className="wordmark">Vox<span className="dot">.</span></span>
            <span className="tagline">Rebel One · LoopedIn Vox</span>
          </span>
        </div>
        <div className="appbar-spacer" />
        <span className="synced"><span className="pulse" aria-hidden />Last synthesized <b>{synced}</b></span>
        <button className="btn ghost" onClick={refresh} disabled={syncing}>{syncing ? 'Synthesizing…' : 'Refresh'}</button>
        <div className="viewtoggle" role="tablist" aria-label="View">
          <button className={!isOrg ? 'on' : ''} onClick={() => switchView('internal')}>Internal · RBL1</button>
          <button className={isOrg ? 'on' : ''} onClick={() => switchView('org')}>Org view</button>
        </div>
      </header>

      <div className="shell">
        <nav className="nav" aria-label="Surfaces">
          {visibleNav.map((n, i) => (
            <button key={n.key} className={surface === n.key ? 'on' : ''} onClick={() => setSurface(n.key)} aria-current={surface === n.key}>
              <span className="num">{i + 1}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <main className="main">
          <FilterBar
            isOrg={isOrg}
            org={org}
            setOrg={(o) => { setOrgFilter(o); setQFilter('all'); }}
            q={qFilter}
            setQ={setQFilter}
            orgs={isOrg ? [ORG_VIEW_ORG] : ORGS}
            questions={orgQuestions}
            summary={summary}
          />

          <div className="page-head">
            <span className="eyebrow">{isOrg ? 'Org view' : 'Internal · RBL1'} · Live insights</span>
            <h1>{activeNav.label}</h1>
            <p>{describe(surface, isOrg)}</p>
          </div>

          {isOrg && (
            <div className="banner">
              <b>Org view — {ORG_VIEW_ORG}.</b> Scoped to your own questions only. Demographic cells below the privacy floor are hidden, and cross-organization synthesis and the Admin / urgent-signal queue are not available here.
            </div>
          )}

          {surface === 'themes' && <Themes themes={slice.themes} scopeTitle={slice.title} crossOrg={isCross} />}
          {surface === 'sentiment' && <SentimentView s={slice.sentiment} themes={slice.themes} />}
          {surface === 'demographics' && <Demographics view={view} counts={slice.demographics} />}
          {surface === 'health' && <Health rows={activeQuestions} />}
          {surface === 'trends' && <Trends trends={slice.trends} crossOrg={isCross} isOrg={isOrg} />}
          {surface === 'admin' && !isOrg && <Signals signals={signals} onReview={reviewSignal} />}
        </main>
      </div>
      <footer className="foot">LoopedIn Vox · synthetic demo data · synthesis de-identifies every answer before a model sees it.</footer>
    </div>
  );
}

function FilterBar({ isOrg, org, setOrg, q, setQ, orgs, questions, summary }: { isOrg: boolean; org: string; setOrg: (o: string) => void; q: string; setQ: (q: string) => void; orgs: string[]; questions: Session[]; summary: string }) {
  return (
    <div className="filterbar">
      <span className="fb-title">Filter</span>
      <label className="fb-field">
        <span>Organization</span>
        <select value={org} onChange={(e) => setOrg(e.target.value)} disabled={isOrg} aria-label="Filter by organization">
          {!isOrg && <option value="all">All organizations</option>}
          {orgs.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label className="fb-field">
        <span>Question</span>
        <select value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter by question">
          <option value="all">All questions</option>
          {questions.map((x) => <option key={x.id} value={x.id}>{trunc(x.title, 64)}</option>)}
        </select>
      </label>
      <span className="fb-summary">{summary}</span>
    </div>
  );
}

function describe(s: Surface, isOrg: boolean): string {
  const m: Record<Surface, string> = {
    themes: isOrg ? 'Synthesized themes across your own responses, with representative anonymous quotes.' : 'Synthesized topic clusters, ranked by share of answers. Use the filter above to slice by organization or question.',
    sentiment: 'Sentiment distribution and emotional intensity, with extra attention on benefits, justice, and health topics.',
    demographics: isOrg ? 'Who is saying what. Cells below the privacy floor are suppressed so no respondent can be re-identified.' : 'Who is saying what, by income, benefits, lived experience and language. Internal view sees raw cells.',
    health: 'Which questions are landing: responses vs. target, fill rate, and the voice-to-text mix.',
    trends: 'Theme prevalence and sentiment over time.',
    admin: 'Internal review queue — answers the classifier flagged for a human (safety crises, fraud / spam). Internal RBL1 only.',
  };
  return m[s];
}

function WeightBar({ pctValue }: { pctValue: number }) {
  return <div className="bar" aria-hidden><span style={{ width: `${pctValue}%` }} /></div>;
}

function Themes({ themes, scopeTitle, crossOrg }: { themes: Theme[]; scopeTitle: string; crossOrg: boolean }) {
  return (
    <>
      {crossOrg && <div className="banner"><b>Internal only.</b> Cross-organization synthesis links signal across every org and is never reachable from an org session.</div>}
      <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{scopeTitle} · {themes.length} themes</div>
      {themes.map((t, i) => (
        <div className="card" key={i}>
          <div className="card-head">
            <span className="num" style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 999, background: 'var(--chip)', fontSize: 12, fontWeight: 800, color: 'var(--muted)', flex: 'none' }}>{i + 1}</span>
            <h3>{t.label}</h3>
            <span className="weight">{t.weightPct}%</span>
            <span className="muted" style={{ fontSize: 12 }}>· {t.answerCount} answers · {sentimentLabel(t.sentiment)}</span>
          </div>
          <WeightBar pctValue={t.weightPct} />
          <p className="summary">{t.summary}</p>
          {t.quotes.map((q, j) => (
            <div className="quote" key={j}>
              <p>“{q.text}”</p>
              <div className="meta"><span className="code">{q.code}</span>{q.attrs.map((a, k) => <span className="attr" key={k}>{a}</span>)}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function Signals({ signals, onReview }: { signals: Signal[]; onReview: (code: string, s: 'reviewed' | 'dismissed') => void }) {
  const open = signals.filter((s) => s.status === 'new');
  return (
    <>
      <div className="grid cols-3" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="n">{open.length}</div><div className="l">Open signals</div></div>
        <div className="stat"><div className="n">{signals.filter((s) => s.type === 'safety_crisis').length}</div><div className="l">Safety crisis</div></div>
        <div className="stat"><div className="n">{signals.filter((s) => s.type === 'fraud_spam').length}</div><div className="l">Fraud / spam</div></div>
      </div>
      <div className="banner">Dashboard-flag only this build: no automated member outreach or external notification yet — a known limitation to close before real traffic.</div>
      {signals.map((s) => (
        <div className={`signal ${s.type === 'safety_crisis' ? 'crisis' : ''} ${s.status !== 'new' ? 'done' : ''}`} key={s.code}>
          <div className="sig-head">
            <span className={`tagpill ${s.type === 'safety_crisis' ? 'crisis' : 'fraud'}`}>{s.type === 'safety_crisis' ? 'Safety crisis' : 'Fraud / spam'}</span>
            <span className="sev">{s.severity}</span>
            <span className="code">{s.code}</span>
            <span className="muted" style={{ fontSize: 12 }}>· {s.session}</span>
            {s.status !== 'new' && <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{s.status}</span>}
          </div>
          <p>“{s.text}”</p>
          <div className="why">Why flagged: {s.rationale}</div>
          {s.status === 'new' && (
            <div className="sig-actions">
              <button onClick={() => onReview(s.code, 'reviewed')}>Mark reviewed</button>
              <button onClick={() => onReview(s.code, 'dismissed')}>Dismiss</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SentimentView({ s, themes }: { s: Sentiment; themes: Theme[] }) {
  const total = s.positive + s.neutral + s.negative || 1;
  return (
    <>
      <div className="card">
        <div className="card-head"><h3>Distribution</h3><span className="muted" style={{ fontSize: 12 }}>· {total} answers</span></div>
        <div className="meter-row"><span className="k">Positive</span><div className="bar"><span style={{ width: pct(s.positive / total), background: 'var(--good)' }} /></div><span className="v">{s.positive}</span></div>
        <div className="meter-row"><span className="k">Mixed / neutral</span><div className="bar"><span style={{ width: pct(s.neutral / total), background: 'var(--muted)' }} /></div><span className="v">{s.neutral}</span></div>
        <div className="meter-row"><span className="k">Negative</span><div className="bar"><span style={{ width: pct(s.negative / total), background: 'var(--warn)' }} /></div><span className="v">{s.negative}</span></div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Average emotional intensity <b style={{ color: 'var(--txt)' }}>{pct(s.avgIntensity)}</b>. Benefits, justice and health topics carry the highest intensity and are weighted for attention.</p>
      </div>
      <div className="card">
        <div className="card-head"><h3>By theme</h3></div>
        {themes.map((t, i) => (
          <div className="meter-row" key={i}>
            <span className="k">{t.label}</span>
            <div className="bar"><span style={{ width: pct((t.sentiment + 1) / 2), background: t.sentiment < -0.15 ? 'var(--warn)' : t.sentiment > 0.15 ? 'var(--good)' : 'var(--muted)' }} /></div>
            <span className="v">{sentimentLabel(t.sentiment)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Demographics({ view, counts }: { view: View; counts: Record<string, number> }) {
  const cells: EnforcedCell[] = useMemo(() => cellsFromCounts(view, counts), [view, counts]);
  const max = Math.max(1, ...cells.map((c) => ('count' in c ? c.count : 0)));
  const suppressed = cells.filter((c) => c.suppressed).length;
  return (
    <div className="card">
      <div className="card-head"><h3>Who is answering</h3>{view === 'org' && suppressed > 0 && <span className="muted" style={{ fontSize: 12 }}>· {suppressed} cells suppressed for privacy</span>}</div>
      <div className="cells">
        {cells.map((c) => c.suppressed ? (
          <div className="cell suppressed" key={c.key}>
            <span className="lab">{c.label}</span>
            <span className="suppressed-tag" style={{ gridColumn: '2 / span 2' }}><span className="lock" /> suppressed</span>
          </div>
        ) : (
          <div className="cell" key={c.key}>
            <span className="lab">{c.label}</span>
            <div className="bar"><span style={{ width: pct(c.count / max) }} /></div>
            <span className="ct">{c.count}</span>
          </div>
        ))}
      </div>
      {view === 'internal' && <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>Internal RBL1 view — raw cells, including thin ones. Race/ethnicity appears only in aggregate output that clears the floor and is never a targeting filter.</p>}
    </div>
  );
}

function Health({ rows }: { rows: typeof SESSIONS }) {
  return (
    <div className="card">
      <div className="htable-wrap">
        <table className="htable">
          <thead><tr><th>Session</th><th>Collected</th><th>Fill rate</th><th>Voice</th><th>Time to fill</th><th>Drop-off</th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="s">{s.title}</td>
                <td>{s.collected} / {s.target}</td>
                <td>{pct(s.health.fillRate)}</td>
                <td>{pct(s.health.voiceShare)}</td>
                <td>{s.health.timeToFillDays}d</td>
                <td>{pct(s.health.dropOff)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Trends({ trends, crossOrg, isOrg }: { trends: TrendPoint[]; crossOrg: boolean; isOrg: boolean }) {
  const maxCount = Math.max(1, ...trends.map((t) => t.count));
  return (
    <>
      {crossOrg && <div className="banner"><b>Internal only.</b> The cross-organization trend slice is not available in the org view.</div>}
      <div className="card">
        <div className="card-head"><h3>{crossOrg ? 'All organizations' : isOrg ? 'Your responses' : 'This session'} — volume & sentiment</h3></div>
        <div className="spark">
          {trends.map((t, i) => (
            <div className="col" key={i}>
              <div className={`colbar ${t.avgSentiment < -0.15 ? 'neg' : ''}`} style={{ height: `${(t.count / maxCount) * 90}px` }} title={`${t.count} answers · ${sentimentLabel(t.avgSentiment)}`} />
              <span className="cl">{t.period}</span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Bars show weekly volume; orange tint marks net-negative sentiment for the period.</p>
      </div>
    </>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);

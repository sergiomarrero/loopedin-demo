// LoopedIn Vox dashboard (brief §1–§7). Static/offline demo: drives every surface
// from the baked dataset in data.ts (mirrors how LoopedIn's own Vercel build runs
// on seed data). The Internal⇄Org toggle is a demo aid; the REAL boundary is the
// data layer — org scope only ever reads its own session, demographics pass
// through the §6 suppression mirror, and urgent signals / cross-org are
// unreachable from the org view (brief §2/§5.4/§6).

import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SESSIONS, CROSS_ORG, SIGNALS, LAST_SYNTHESIZED, type Theme, type Sentiment, type TrendPoint, type Signal } from './data';
import { cellsFromCounts, type View, type EnforcedCell } from './lib/suppression';

type Surface = 'themes' | 'signals' | 'sentiment' | 'demographics' | 'health' | 'trends';
const NAV: { key: Surface; label: string; internalOnly?: boolean }[] = [
  { key: 'themes', label: 'Emerging themes' },
  { key: 'signals', label: 'Urgent signals', internalOnly: true },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'demographics', label: 'Demographics' },
  { key: 'health', label: 'Response health' },
  { key: 'trends', label: 'Trends over time' },
];

// In the org view we simulate a single signed-in org: the Correctional session's
// "Health Research Org". It has the clearest thin-cell suppression AND urgent
// signals that must stay hidden from the org — a sharp boundary demo.
const ORG_SESSION = SESSIONS[0];

function pct(n: number) { return `${Math.round(n * 100)}%`; }
function sentimentLabel(s: number) { return s > 0.15 ? 'Positive' : s < -0.15 ? 'Negative' : 'Mixed'; }

function App() {
  const [view, setView] = useState<View>('internal');
  const [surface, setSurface] = useState<Surface>('themes');
  // Internal can pick cross-org or any session; org is locked to its own session.
  const [scopeId, setScopeId] = useState<string>('cross_org');
  const [signals, setSignals] = useState<Signal[]>(SIGNALS);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(LAST_SYNTHESIZED);

  const isOrg = view === 'org';
  const effectiveScope = isOrg ? ORG_SESSION.id : scopeId;
  const session = SESSIONS.find((s) => s.id === effectiveScope) || null;

  const activeNav = NAV.find((n) => n.key === surface)!;

  const themes: Theme[] = isOrg
    ? ORG_SESSION.themes
    : scopeId === 'cross_org' ? CROSS_ORG.themes : (session?.themes ?? []);
  const sentiment: Sentiment = isOrg
    ? ORG_SESSION.sentiment
    : scopeId === 'cross_org' ? CROSS_ORG.sentiment : (session?.sentiment ?? CROSS_ORG.sentiment);
  const trends: TrendPoint[] = isOrg
    ? ORG_SESSION.trends
    : scopeId === 'cross_org' ? CROSS_ORG.trends : (session?.trends ?? []);
  const rawDemographics: Record<string, number> = isOrg
    ? ORG_SESSION.demographics
    : scopeId === 'cross_org'
      ? SESSIONS.reduce<Record<string, number>>((acc, s) => { for (const [k, v] of Object.entries(s.demographics)) acc[k] = (acc[k] || 0) + v; return acc; }, {})
      : (session?.demographics ?? {});

  function refresh() {
    setSyncing(true);
    // On-demand synthesis (brief §4.2). Backend path: POST /api/vox/.../synthesize.
    setTimeout(() => { setSyncing(false); setSynced('just now'); }, 900);
  }
  function reviewSignal(code: string, status: 'reviewed' | 'dismissed') {
    setSignals((cur) => cur.map((s) => (s.code === code ? { ...s, status } : s)));
  }

  const scopeTitle = isOrg
    ? ORG_SESSION.title
    : scopeId === 'cross_org' ? 'All organizations' : (session?.title ?? '');

  return (
    <div className="app">
      <header className="appbar">
        <div className="brand"><span>LoopedIn <span className="vox">Vox</span></span><span className="tag">Live Insights</span></div>
        <div className="appbar-spacer" />
        <span className="synced">Last synthesized <b>{synced}</b></span>
        <button className="btn ghost" onClick={refresh} disabled={syncing}>{syncing ? 'Synthesizing…' : 'Refresh'}</button>
        <div className="viewtoggle" role="tablist" aria-label="View">
          <button className={!isOrg ? 'on' : ''} onClick={() => setView('internal')}>Internal · RBL1</button>
          <button className={isOrg ? 'on' : ''} onClick={() => setView('org')}>Org view</button>
        </div>
      </header>

      <div className="shell">
        <nav className="nav" aria-label="Surfaces">
          {NAV.map((n, i) => {
            const gated = isOrg && n.internalOnly;
            return (
              <button key={n.key} className={surface === n.key ? 'on' : ''} onClick={() => setSurface(n.key)} aria-current={surface === n.key}>
                <span className="num">{i + 1}</span>
                <span>{n.label}</span>
                {gated && <span className="gate lock" aria-label="internal only" />}
              </button>
            );
          })}
        </nav>

        <main className="main">
          <div className="page-head">
            <h1>{activeNav.label}</h1>
            <p>{describe(surface, isOrg)}</p>
          </div>

          {isOrg ? (
            <div className="banner">
              <b>Org view — {ORG_SESSION.orgLabel}.</b> Scoped to your own questions only. Demographic cells below the privacy floor are hidden, and cross-organization synthesis and the urgent-signal queue are not available here.
            </div>
          ) : (
            <div className="scope-row" role="tablist" aria-label="Scope">
              <button className={`chip-toggle ${scopeId === 'cross_org' ? 'on' : ''}`} onClick={() => setScopeId('cross_org')}>Cross-org synthesis</button>
              {SESSIONS.map((s) => (
                <button key={s.id} className={`chip-toggle ${scopeId === s.id ? 'on' : ''}`} onClick={() => setScopeId(s.id)}>{s.title}</button>
              ))}
            </div>
          )}

          {surface === 'themes' && <Themes themes={themes} scopeTitle={scopeTitle} crossOrg={!isOrg && scopeId === 'cross_org'} />}
          {surface === 'signals' && (isOrg ? <Gated /> : <Signals signals={signals} onReview={reviewSignal} />)}
          {surface === 'sentiment' && <SentimentView s={sentiment} themes={themes} />}
          {surface === 'demographics' && <Demographics view={view} counts={rawDemographics} />}
          {surface === 'health' && <Health rows={isOrg ? [ORG_SESSION] : SESSIONS} />}
          {surface === 'trends' && <Trends trends={trends} crossOrg={!isOrg && scopeId === 'cross_org'} isOrg={isOrg} />}
        </main>
      </div>
      <footer className="foot">LoopedIn Vox · synthetic demo data · synthesis de-identifies every answer before a model sees it.</footer>
    </div>
  );
}

function describe(s: Surface, isOrg: boolean): string {
  const m: Record<Surface, string> = {
    themes: isOrg ? 'Synthesized themes across your own responses, with representative anonymous quotes.' : 'Synthesized topic clusters, ranked by share of answers. Switch scope to read one session or the cross-organization synthesis.',
    signals: 'Answers the classifier flagged as needing a human — safety crises and fraud/spam. Internal RBL1 review only.',
    sentiment: 'Sentiment distribution and emotional intensity, with extra attention on benefits, justice, and health topics.',
    demographics: isOrg ? 'Who is saying what. Cells below the privacy floor are suppressed so no respondent can be re-identified.' : 'Who is saying what, by income, benefits, lived experience and language. Internal view sees raw cells.',
    health: 'Which questions are landing: responses vs. target, fill rate, and the voice-to-text mix.',
    trends: 'Theme prevalence and sentiment over time.',
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
            <span className="num" style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 999, background: 'var(--vchip)', fontSize: 12, fontWeight: 800, color: 'var(--vmuted)', flex: 'none' }}>{i + 1}</span>
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
        <div className="meter-row"><span className="k">Positive</span><div className="bar"><span style={{ width: pct(s.positive / total), background: 'var(--vgood)' }} /></div><span className="v">{s.positive}</span></div>
        <div className="meter-row"><span className="k">Mixed / neutral</span><div className="bar"><span style={{ width: pct(s.neutral / total), background: 'var(--vwarn)' }} /></div><span className="v">{s.neutral}</span></div>
        <div className="meter-row"><span className="k">Negative</span><div className="bar"><span style={{ width: pct(s.negative / total), background: 'var(--vbad)' }} /></div><span className="v">{s.negative}</span></div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Average emotional intensity <b style={{ color: 'var(--vtxt)' }}>{pct(s.avgIntensity)}</b>. Benefits, justice and health topics carry the highest intensity and are weighted for attention.</p>
      </div>
      <div className="card">
        <div className="card-head"><h3>By theme</h3></div>
        {themes.map((t, i) => (
          <div className="meter-row" key={i}>
            <span className="k">{t.label}</span>
            <div className="bar"><span style={{ width: pct((t.sentiment + 1) / 2), background: t.sentiment < -0.15 ? 'var(--vbad)' : t.sentiment > 0.15 ? 'var(--vgood)' : 'var(--vwarn)' }} /></div>
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

function Gated() {
  return (
    <div className="card gated">
      <div className="lock" />
      <h3>Internal review only</h3>
      <p>Urgent signals — including any respondent who may be in crisis — stay inside RBL1. Surfacing them to an organization raises privacy and duty-of-care questions that aren’t resolved in this build, so the org view never receives them.</p>
    </div>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);

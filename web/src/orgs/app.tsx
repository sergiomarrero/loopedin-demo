/* eslint-disable */
// @ts-nocheck
// Ported faithfully from the LoopedIn prototype bundle (single-module port).
import React from 'react';
import ReactDOM from 'react-dom/client';


// ===== source: b96dd088 =====
// LoopedIn buyer console — mock data + model helpers.
// Points: 100 pts = $1.00. Point-per-response tiers are fixed: 0/50/100/150/200.
// Plans: free | pro. Free = no point rewards, text only, no targeting/summaries.

const POINT_TIERS = [0, 50, 100, 150, 200];
const POINTS_PER_DOLLAR = 100;

// Charge-up quick amounts (USD). Minimum charge-up is $50.
const CHARGE_AMOUNTS = [50, 100, 250, 500];
const AUTOCHARGE_THRESHOLDS = [25, 50, 100];

// Targeting that's free vs Pro-gated.
const FREE_FILTERS = ['location', 'income'];

// City-level locations (no ZIP for now).
const CITIES = [
  'Detroit, MI', 'Cleveland, OH', 'Newark, NJ', 'Atlanta, GA',
  'Fresno, CA', 'El Paso, TX', 'Birmingham, AL', 'Buffalo, NY',
  'Memphis, TN', 'Milwaukee, WI', 'Albuquerque, NM', 'Baltimore, MD',
];
const INCOME_BANDS = ['< $20k', '< $30k', '< $40k', '< $50k', 'Any income'];

// Pro-only demographic filters (mirror the respondent profile schema).
const PRO_FILTERS = [
  { id: 'kids',       label: 'Has kids' },
  { id: 'benefits',   label: 'Public benefits' },
  { id: 'age',        label: 'Age range' },
  { id: 'gender',     label: 'Gender' },
  { id: 'languages',  label: 'Languages' },
  { id: 'education',  label: 'Education' },
  { id: 'lived',      label: 'Lived experience' },
  { id: 'interviews', label: 'Open to 1-on-1 interviews' },
];

// Plans.
const PLANS = {
  free: {
    id: 'free', name: 'Free', price: '$0', cadence: '',
    blurb: 'Get a feel for LoopedIn. Post no-reward questions, reviewed before they go out.',
    feats: [
      { t: 'Email + phone to get started', ok: true },
      { t: 'Post questions with no point reward', ok: true },
      { t: 'Every post goes through review', ok: true },
      { t: 'See your response counts', ok: true },
      { t: 'Text responses only', ok: false },
      { t: 'Demographic targeting', ok: false },
      { t: 'Result summaries & breakdowns', ok: false },
    ],
  },
  pro: {
    id: 'pro', name: 'Pro', price: '$69', cadence: '/mo',
    yearly: '$599/yr', highlight: true,
    monthlyPoints: 800, yearlyPoints: 12000,
    blurb: 'Everything you need to hear from the right people, at scale.',
    feats: [
      { t: 'Unlimited posts', ok: true },
      { t: '800 points / month included', ok: true },
      { t: 'Select demographic filters', ok: true },
      { t: 'Voice responses + attach an image', ok: true },
      { t: 'Set point rewards (50–200)', ok: true },
      { t: 'Full result summaries & breakdowns', ok: true },
      { t: 'Priority review', ok: true },
    ],
  },
  enterprise: {
    id: 'enterprise', name: 'Enterprise', price: 'Custom', cadence: '',
    blurb: 'Seats for your team, custom audiences, and exports.',
    contact: 'sergio@rbl1.com',
    feats: [
      { t: 'Everything in Pro', ok: true },
      { t: 'Seats for your whole team', ok: true },
      { t: 'Custom audiences & data exports', ok: true },
    ],
  },
};

// Seed campaigns (the buyer's own questions).
const SEED_QUESTIONS = [
  {
    id: 'q1',
    text: 'What would make it easier to find affordable childcare in your area?',
    mode: 'text', points: 100, target: 200, collected: 142,
    status: 'live', city: 'Detroit, MI', income: '< $40k',
    start: 'May 20', end: 'Jun 16',
  },
  {
    id: 'q2',
    text: 'When you needed help with rent, where did you turn first — and did it work?',
    mode: 'voice', points: 150, target: 150, collected: 150,
    status: 'closed', city: 'Cleveland, OH', income: '< $30k',
    start: 'Apr 2', end: 'May 1',
  },
  {
    id: 'q3',
    text: 'What is one thing about the SNAP renewal process you wish someone had told you?',
    mode: 'text', points: 100, target: 300, collected: 0,
    status: 'pending', city: 'Newark, NJ', income: '< $40k',
    start: 'Jun 1', end: 'Jun 30',
  },
  {
    id: 'q4',
    text: 'If you could change one thing about your kid’s school, what would it be?',
    mode: 'text', points: 0, target: 100, collected: 0,
    status: 'draft', city: 'Atlanta, GA', income: 'Any income',
    start: '—', end: '—',
  },
];

// Sample individual responses (anonymous — coded IDs, profile attrs only, NO names).
const SAMPLE_RESPONSES = [
  { id: 'R-2841', text: 'A single calendar that shows which centers actually have open spots. I call ten places and they’re all full or never call back.', attrs: ['Detroit, MI', 'Parent of 2', '< $40k', 'WIC'], when: '2h ago', flagged: false },
  { id: 'R-2840', text: 'Cost. Even the subsidized ones want money up front before the voucher kicks in, and I don’t have it on the 1st.', attrs: ['Detroit, MI', 'Single parent', '< $30k', 'Medicaid'], when: '3h ago', flagged: false },
  { id: 'R-2838', text: 'Hours. Everything closes at 5 and my shift ends at 6. Night-shift parents have nothing.', attrs: ['Detroit, MI', 'Parent', '< $40k', 'Works nights'], when: '5h ago', flagged: false },
  { id: 'R-2835', text: 'Someone who speaks Spanish at the front desk. I do not always understand the forms and I am scared to sign wrong.', attrs: ['Detroit, MI', 'Spanish-speaking', '< $40k', 'Parent of 3'], when: '6h ago', flagged: false },
  { id: 'R-2830', text: 'Transportation. The good center is 40 minutes by bus each way. By the time I drop off I’m late for work.', attrs: ['Detroit, MI', '< $30k', 'No car', 'Parent'], when: '8h ago', flagged: true },
  { id: 'R-2829', text: 'Honestly just knowing it’s safe. I toured one place that scared me. I’d pay for trust.', attrs: ['Detroit, MI', 'Parent of 1', '< $40k'], when: '9h ago', flagged: false },
];

// Aggregate demographic breakdowns for the responses summary (no names).
const AGG_BREAKDOWN = {
  'Has kids':         [{ label: 'Parents', pct: 88 }, { label: 'No kids', pct: 12 }],
  'Income':           [{ label: '< $30k', pct: 54 }, { label: '$30–40k', pct: 38 }, { label: 'Other', pct: 8 }],
  'On public benefits': [{ label: 'WIC / SNAP', pct: 61 }, { label: 'Medicaid', pct: 44 }, { label: 'None listed', pct: 27 }],
  'Language':         [{ label: 'English', pct: 66 }, { label: 'Spanish', pct: 34 }],
};

// Themes the (Pro) summary surfaces from responses.
const AGG_THEMES = [
  { t: 'Availability & waitlists', pct: 38, note: 'No real-time view of open spots' },
  { t: 'Up-front cost', pct: 27, note: 'Voucher gap before subsidy starts' },
  { t: 'Hours don’t fit shift work', pct: 19, note: 'Nights & weekends uncovered' },
  { t: 'Language & trust', pct: 16, note: 'Spanish support, safety' },
];

// ── helpers ──────────────────────────────────────────────────
function pts(n) { return `${n.toLocaleString()} pts`; }
function ptsToUsd(n) { return `$${(n / POINTS_PER_DOLLAR).toFixed(2)}`; }
function usdToPts(d) { return d * POINTS_PER_DOLLAR; }
function questionCost(q) { return q.points * q.target; }

// Voice — expressive copy personalities. Each reshapes the console's tone.
const VOICE_COPY = {
  bold: {
    composeEyebrow: 'New question',
    composeTitle: 'Ask your community.',
    composeSub: 'Draft it, choose who answers, then charge up to send it for review.',
    dashEyebrow: 'Dashboard',
    dashTitle: 'Your questions.',
    billingTitle: 'Plan & billing.',
    newBtn: 'New question',
  },
  plain: {
    composeEyebrow: 'New question',
    composeTitle: 'Create a question',
    composeSub: 'Write your question, choose who should answer, then add points to launch.',
    dashEyebrow: 'Overview',
    dashTitle: 'Your questions',
    billingTitle: 'Plan & billing',
    newBtn: 'New question',
  },
  civic: {
    composeEyebrow: 'New inquiry',
    composeTitle: 'Pose a question to residents.',
    composeSub: 'Compose your question, define the audience, and submit it for review.',
    dashEyebrow: 'Program',
    dashTitle: 'Your engagements.',
    billingTitle: 'Subscription & funding.',
    newBtn: 'New inquiry',
  },
};




// ===== source: 2eee54bf =====
// LoopedIn buyer console — shared UI atoms (Rebel One styling).
// No icons (numbered badges + arrow glyphs only), orange-only accent.

// Numbered badge — icon substitute.
function NumBadge({ n, tone = 'orange', size = 32 }) {
  return (
    <span className={`num-badge ${tone}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>{n}</span>
  );
}

function Eyebrow({ children }) { return <span className="h-eyebrow">{children}</span>; }

function Btn({ children, kind = 'primary', sm, block, disabled, onClick, style }) {
  const cls = `btn btn-${kind}${sm ? ' btn-sm' : ''}${block ? ' btn-block' : ''}`;
  return <button className={cls} disabled={disabled} onClick={onClick} style={style}>{children}</button>;
}

function Card({ children, gray, hover, className = '', style, onClick }) {
  const cls = `card${gray ? ' card-gray' : ''}${hover ? ' card-hover' : ''} ${className}`;
  return <div className={cls} style={style} onClick={onClick}>{children}</div>;
}

function Field({ label, hint, children }) {
  return (
    <label className="col" style={{ gap: 0 }}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="faint" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>{hint}</span>}
    </label>
  );
}

// Status eyebrow.
function Status({ s }) {
  const map = {
    draft: ['status-draft', 'Draft'],
    pending: ['status-pending', 'Pending review'],
    live: ['status-live', 'Live'],
    closed: ['status-closed', 'Closed'],
  };
  const [cls, label] = map[s] || map.draft;
  return (
    <span className={`status ${cls}`}>
      {s === 'live' && <span className="dot" style={{ background: '#fff' }} />}
      {label}
    </span>
  );
}

// Three-step status flow strip.
function StatusFlow({ at = 'draft' }) {
  const steps = [['draft', 'Draft'], ['pending', 'Pending review'], ['live', 'Live']];
  const idx = steps.findIndex(s => s[0] === at);
  return (
    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s[0]}>
          <span style={{
            fontSize: 11.5, fontWeight: i === idx ? 800 : 600, letterSpacing: 0.6, textTransform: 'uppercase',
            color: i === idx ? 'var(--ink)' : 'var(--text-faint)',
            border: `1px solid ${i === idx ? 'var(--ink)' : 'var(--border-2)'}`,
            background: i <= idx ? 'var(--surface-gray)' : 'var(--surface)',
            borderRadius: 999, padding: '3px 11px',
          }}>{s[1]}</span>
          {i < steps.length - 1 && <span style={{ color: 'var(--border-2)' }}>→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function ProTag() { return <span className="pro-tag">Pro</span>; }

// Lock glyph — the one outline-style exception, used only for gated controls.
function Lock({ size = 13, c = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// Segmented control.
function Segmented({ options, value, onChange, disabledFn }) {
  return (
    <div className="seg">
      {options.map(o => {
        const v = typeof o === 'object' ? o.value : o;
        const label = typeof o === 'object' ? o.label : o;
        const dis = disabledFn ? disabledFn(v) : false;
        return (
          <div key={v}
            className={`seg-opt${value === v ? ' on' : ''}${dis ? ' disabled' : ''}`}
            onClick={() => !dis && onChange(v)}>
            {label}
          </div>
        );
      })}
    </div>
  );
}

// Aggregate horizontal bar list (no names).
function Breakdown({ rows, ink }) {
  return (
    <div className="col" style={{ gap: 10 }}>
      {rows.map((r, i) => (
        <div key={i} className="row" style={{ gap: 12 }}>
          <span className="muted" style={{ fontSize: 13, width: 110, flexShrink: 0 }}>{r.label}</span>
          <div className="bar-track" style={{ flex: 1 }}>
            <div className={`bar-fill${ink ? ' ink' : ''}`} style={{ width: `${r.pct}%` }} />
          </div>
          <span className="faint tnum" style={{ fontSize: 12, width: 38, textAlign: 'right' }}>{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// Modal sheet.
function Sheet({ title, sub, onClose, children, footer, wide }) {
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" style={wide ? { maxWidth: 560 } : undefined} onClick={e => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div className="h-title" style={{ fontSize: 22 }}>{title}</div>
            {sub && <div className="h-sub" style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{
            border: 0, background: 'var(--surface-gray)', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ marginTop: 18 }}>{children}</div>
        {footer && <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

// Simple toggle switch.
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 46, height: 27, borderRadius: 999, border: 0, cursor: 'pointer', flexShrink: 0,
      background: on ? 'var(--brand-orange)' : '#dcdcdc', position: 'relative', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: '50%',
        background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.18)', transition: 'left .2s',
      }} />
    </button>
  );
}

// Empty / locked upsell strip.
function ProLock({ title, body, onUpgrade }) {
  return (
    <Card gray style={{ textAlign: 'center', padding: '36px 28px' }}>
      <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
        <span className="num-badge orange" style={{ width: 40, height: 40 }}><Lock size={18} c="#fff" /></span>
      </div>
      <div className="h-title" style={{ fontSize: 20 }}>{title}</div>
      <div className="h-sub" style={{ maxWidth: 420, margin: '8px auto 18px' }}>{body}</div>
      <Btn kind="primary" onClick={onUpgrade}>Upgrade to Pro</Btn>
    </Card>
  );
}

// Inline meta item (small dotted label) — shared across screens.
function Meta({ label }) {
  return <span className="faint" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-2)' }} />{label}
  </span>;
}




// ===== source: a46e8e0e =====

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}




// ===== source: 30d7736d =====
// Compose screen — direction A (single scroll).
// Write → target → see live reach → charge up → submit for review.

function ComposeScreen({ plan, balance, onSubmit, onCharge, onUpgrade, toast, reviewer = 'LoopedIn Team', voice }) {
  const { useState } = React;
  const V = voice || VOICE_COPY.bold;
  const isPro = plan === 'pro';
  const [text, setText] = useState('');
  const [mode, setMode] = useState('text');
  const [points, setPoints] = useState(isPro ? 100 : 0);
  const [responses, setResponses] = useState(200);
  const [city, setCity] = useState('Detroit, MI');
  const [income, setIncome] = useState('< $40k');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [proFilters, setProFilters] = useState({});
  const [picker, setPicker] = useState(null); // {field,title,options,value,set}

  // Free plan can only post no-reward, text-only questions.
  React.useEffect(() => { if (!isPro) { setPoints(0); setMode('text'); } }, [isPro]);

  const cost = points * responses;
  const funded = cost <= balance;
  const shortBy = Math.max(0, cost - balance);

  // Live audience estimate — shrinks as targeting narrows (illustrative model).
  const audience = React.useMemo(() => {
    let base = 18500;
    if (city) base *= 0.62;
    if (income === '< $20k') base *= 0.3;
    else if (income === '< $30k') base *= 0.5;
    else if (income === '< $40k') base *= 0.72;
    else if (income === '< $50k') base *= 0.85;
    Object.keys(proFilters).forEach(k => { if (proFilters[k]) base *= 0.55; });
    return Math.max(40, Math.round(base / 10) * 10);
  }, [city, income, proFilters]);

  const canSubmit = text.trim().length > 8 && responses > 0 && funded;

  const submit = () => {
    onSubmit({
      text: text.trim(), mode, points, target: responses,
      city, income, start: start || 'On approval', end: end || '+30 days',
    });
    toast('Question submitted for review.');
  };

  const openPicker = (field, title, options, value, set) =>
    setPicker({ field, title, options, value, set });

  return (
    <div className="page">
      <div className="page-inner page-narrow">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
          <div>
            <Eyebrow>{V.composeEyebrow}</Eyebrow>
            <h1 className="h-title" style={{ marginTop: 14 }}>{V.composeTitle}</h1>
          </div>
          <div style={{ marginTop: 6 }}><StatusFlow at="draft" /></div>
        </div>
        <p className="h-sub" style={{ marginBottom: 28 }}>
          {V.composeSub}
        </p>

        {/* 1 — Question */}
        <Card style={{ marginBottom: 18 }}>
          <div className="section-label"><NumBadge n={1} size={26} /> Your question</div>
          <div className="col" style={{ gap: 16 }}>
            <Field hint="Keep it open and plain. One clear question gets the best answers.">
              <textarea className="textarea" value={text} maxLength={180}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. What would make it easier to find affordable childcare in your area?" />
            </Field>

            <ImageUploadRow isPro={isPro} onUpgrade={onUpgrade} />

            <Field label="Response type">
              <Segmented
                options={[{ value: 'text', label: 'Text' }, { value: 'voice', label: 'Voice' }, { value: 'both', label: 'Text + Voice' }]}
                value={mode} onChange={setMode}
                disabledFn={v => !isPro && v !== 'text'} />
              {!isPro && <span className="faint" style={{ fontSize: 12, marginTop: 7, display: 'inline-flex', gap: 6, alignItems: 'center' }}><Lock size={12} /> Voice responses need Pro.</span>}
            </Field>

            <Field label="Points per response">
              <Segmented
                options={POINT_TIERS.map(p => ({ value: p, label: p === 0 ? 'None' : String(p) }))}
                value={points} onChange={setPoints}
                disabledFn={v => !isPro && v !== 0} />
              {!isPro
                ? <span className="faint" style={{ fontSize: 12, marginTop: 7, display: 'inline-flex', gap: 6, alignItems: 'center' }}><Lock size={12} /> Free posts carry no reward. Upgrade to add points.</span>
                : <span className="faint" style={{ fontSize: 12, marginTop: 7 }}>100 pts = $1.00 paid to each respondent.</span>}
            </Field>

            <div className="grid-2">
              <Field label="Number of responses">
                <input className="input tnum" type="number" min="1" value={responses}
                  onChange={e => setResponses(Math.max(0, parseInt(e.target.value || '0', 10)))} />
              </Field>
              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Starts"><input className="input" value={start} onChange={e => setStart(e.target.value)} placeholder="Jun 2" /></Field>
                <Field label="Ends (expires)"><input className="input" value={end} onChange={e => setEnd(e.target.value)} placeholder="Jun 16" /></Field>
              </div>
            </div>
          </div>
        </Card>

        {/* 2 — Targeting */}
        <Card style={{ marginBottom: 18 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}><NumBadge n={2} size={26} /> Who should answer?</div>
            <span className="faint" style={{ fontSize: 12 }}>City-level</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <AttrRow k="Location" v={city} set onClick={() => openPicker('city', 'Location', CITIES, city, true)} />
            <AttrRow k="Income" v={income} set onClick={() => openPicker('income', 'Household income', INCOME_BANDS, income, true)} />
            {PRO_FILTERS.map(f => (
              <AttrRow key={f.id} k={f.label}
                locked={!isPro}
                set={isPro && proFilters[f.id]}
                v={isPro ? (proFilters[f.id] ? 'Selected' : 'Any') : null}
                onClick={() => {
                  if (!isPro) { onUpgrade(); return; }
                  setProFilters(p => ({ ...p, [f.id]: !p[f.id] }));
                }} />
            ))}
          </div>
          {!isPro && (
            <div className="row" style={{ gap: 8, marginTop: 14, alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 13 }}>Target by demographics with</span>
              <button className="btn btn-outline btn-sm" onClick={onUpgrade}>Pro →</button>
            </div>
          )}
        </Card>

        {/* Live audience */}
        <Card style={{ marginBottom: 18, borderColor: 'var(--brand-orange-border)', background: 'var(--brand-orange-tint)' }}>
          <div className="row" style={{ alignItems: 'center', gap: 18 }}>
            <div style={{ flex: 1 }}>
              <div className="faint" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--brand-orange)' }}>Potential responders</div>
              <div className="stat-num" style={{ fontSize: 46, marginTop: 4 }}>~{audience.toLocaleString()}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>match {city} · {income}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="faint" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>You're collecting</div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{responses.toLocaleString()}</div>
              <div className="faint" style={{ fontSize: 12 }}>of them</div>
            </div>
          </div>
        </Card>

        {/* Launch / charge-up */}
        <div className="launch-bar">
          <div className="row" style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Lock size={14} c={funded ? 'var(--ink)' : 'var(--brand-orange)'} />
            <span style={{ fontWeight: 800, fontSize: 15, color: funded ? 'var(--ink)' : 'var(--brand-orange)', letterSpacing: -0.2 }}>
              {points === 0 ? 'Free post — ready when you are' : (funded ? 'Balance covers this post' : 'Charge up to post')}
            </span>
          </div>

          {points > 0 && (
            <div className="col" style={{ gap: 6, padding: '12px 0', borderTop: '1px dashed var(--border-2)', borderBottom: '1px dashed var(--border-2)', marginBottom: 12 }}>
              <CostRow k={`${responses.toLocaleString()} responses × ${points} pts`} v={pts(cost)} />
              <CostRow k="Your balance" v={pts(balance)} dim />
              {!funded && <CostRow k="Short by" v={pts(shortBy)} warn />}
            </div>
          )}

          <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 14px' }}>
            {funded
              ? `Drafts save anytime. Submitting sends it to ${reviewer} for review before it reaches the community.`
              : 'You can save a draft now. To submit, charge up enough points to cover the responses you want.'}
          </p>

          <div className="row" style={{ gap: 10 }}>
            <Btn kind="outline" onClick={() => toast('Draft saved.')} style={{ flex: 1 }}>Save draft</Btn>
            {funded
              ? <Btn kind="primary" disabled={!canSubmit} onClick={submit} style={{ flex: 1.5 }}>Submit for review →</Btn>
              : <Btn kind="primary" onClick={() => onCharge(shortBy)} style={{ flex: 1.5 }}>Charge up to post →</Btn>}
          </div>
        </div>
      </div>

      {picker && (
        <Sheet title={picker.title} onClose={() => setPicker(null)}>
          <div className="col" style={{ gap: 6 }}>
            {picker.options.map(o => {
              const on = picker.field === 'city' ? city === o : income === o;
              return (
                <button key={o} onClick={() => {
                  if (picker.field === 'city') setCity(o); else setIncome(o);
                  setPicker(null);
                }} style={{
                  textAlign: 'left', cursor: 'pointer',
                  border: `1px solid ${on ? 'var(--brand-orange)' : 'var(--border-2)'}`,
                  background: on ? 'var(--brand-orange-tint)' : 'var(--surface)',
                  color: on ? 'var(--brand-orange)' : 'var(--ink)',
                  borderRadius: 'var(--radius-button)', padding: '13px 14px',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: on ? 700 : 500,
                }}>{o}</button>
              );
            })}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function AttrRow({ k, v, set, locked, onClick }) {
  return (
    <div className={`attr-row${locked ? ' locked' : ''}`} onClick={onClick}>
      <span className="k">{locked && <Lock size={13} c="var(--text-faint)" />}{k}</span>
      {locked
        ? <ProTag />
        : <span className={`v${set ? ' set' : ''}`}>{v} <span style={{ color: 'var(--text-faint)' }}>›</span></span>}
    </div>
  );
}

function CostRow({ k, v, dim, warn }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: dim ? 'var(--text-faint)' : (warn ? 'var(--brand-orange)' : 'var(--text-muted)') }}>{k}</span>
      <span className="tnum" style={{ color: warn ? 'var(--brand-orange)' : 'var(--ink)', fontWeight: warn ? 700 : 500 }}>{v}</span>
    </div>
  );
}

function ImageUploadRow({ isPro, onUpgrade }) {
  return (
    <div style={{
      border: `1px ${isPro ? 'solid' : 'dashed'} ${isPro ? 'var(--border-2)' : 'var(--border-2)'}`,
      borderRadius: 'var(--radius-button)', padding: 14, display: 'flex', alignItems: 'center', gap: 12,
      background: isPro ? 'var(--surface)' : 'var(--surface-gray)', cursor: isPro ? 'pointer' : 'not-allowed',
    }} onClick={() => !isPro && onUpgrade()}>
      <span className="num-badge" style={{ width: 38, height: 38, background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text-faint)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: isPro ? 'var(--ink)' : 'var(--text-faint)', display: 'inline-flex', gap: 7, alignItems: 'center' }}>
          {!isPro && <Lock size={12} />} Add an image for respondents
        </div>
        <div className="faint" style={{ fontSize: 12, marginTop: 1 }}>Show a photo or chart alongside your question</div>
      </div>
      {!isPro && <ProTag />}
    </div>
  );
}




// ===== source: 8a124eab =====
// Dashboard — overview of questions, spend, and responses.

function DashboardScreen({ plan, balance, questions, navigate, openResponses, onCharge, reviewer = 'LoopedIn Team', voice }) {
  const V = voice || VOICE_COPY.bold;
  const isPro = plan === 'pro';
  const live = questions.filter(q => q.status === 'live');
  const pending = questions.filter(q => q.status === 'pending');
  const totalResponses = questions.reduce((s, q) => s + q.collected, 0);
  const spent = questions.reduce((s, q) => s + q.points * q.collected, 0);

  return (
    <div className="page">
      <div className="page-inner">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <Eyebrow>{V.dashEyebrow}</Eyebrow>
            <h1 className="h-title" style={{ marginTop: 14 }}>{V.dashTitle}</h1>
          </div>
          <Btn kind="primary" onClick={() => navigate('compose')}>{V.newBtn}</Btn>
        </div>

        {/* stat strip */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <StatCard num={live.length} label="Live now" />
          <StatCard num={totalResponses.toLocaleString()} label="Responses collected" />
          <StatCard num={isPro ? pts(spent) : '—'} label="Points spent" locked={!isPro} onLocked={() => navigate('billing')} />
        </div>

        {pending.length > 0 && (
          <Card style={{ marginBottom: 24, borderColor: 'var(--brand-orange-border)', background: 'var(--brand-orange-tint)' }}>
            <div className="row" style={{ gap: 12, alignItems: 'center' }}>
              <NumBadge n={pending.length} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 15 }}>
                  {pending.length} question{pending.length > 1 ? 's' : ''} in review
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {reviewer} checks every question before it reaches the community. This usually takes a few hours.
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="section-label">All questions</div>
        <div className="col" style={{ gap: 14 }}>
          {questions.map(q => (
            <QuestionRow key={q.id} q={q} isPro={isPro}
              onClick={() => q.collected > 0 ? openResponses(q.id) : navigate('compose')} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ num, label, locked, onLocked }) {
  return (
    <Card hover style={{ cursor: locked ? 'pointer' : 'default' }} onClick={locked ? onLocked : undefined}>
      <div className={`stat-num${locked ? ' ink' : ''}`}>{num}</div>
      <div className="muted" style={{ fontSize: 13, marginTop: 8, fontWeight: 600, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        {locked && <Lock size={12} />}{label}
      </div>
      {locked && <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>Upgrade to see spend</div>}
    </Card>
  );
}

function QuestionRow({ q, isPro, onClick }) {
  const progress = q.target ? Math.min(100, Math.round((q.collected / q.target) * 100)) : 0;
  return (
    <Card hover onClick={onClick} style={{ cursor: 'pointer', padding: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
        <Status s={q.status} />
        <span className="faint" style={{ fontSize: 12 }}>{q.start} → {q.end}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, letterSpacing: -0.2 }}>{q.text}</div>
      <div className="row" style={{ gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
        <Meta label={q.city} />
        <Meta label={q.income} />
        <Meta label={q.mode === 'voice' ? 'Voice' : q.mode === 'both' ? 'Text + Voice' : 'Text'} />
        <Meta label={q.points === 0 ? 'No reward' : `${q.points} pts each`} />
      </div>
      {(q.status === 'live' || q.status === 'closed') && (
        <div style={{ marginTop: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
            <span className="muted tnum">{q.collected.toLocaleString()} / {q.target.toLocaleString()} responses</span>
            <span className="faint tnum">{progress}%</span>
          </div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
    </Card>
  );
}

function Meta_unused() { return null; }




// ===== source: 2d4a275c =====
// Responses inbox — aggregate summary ⇄ individual responses.
// No names ever. On Free, summaries are locked — only the count shows.

function ResponsesScreen({ plan, questions, qid, navigate, onUpgrade }) {
  const { useState } = React;
  const isPro = plan === 'pro';
  const q = questions.find(x => x.id === qid) || questions.find(x => x.collected > 0) || questions[0];
  const [view, setView] = useState('summary');

  return (
    <div className="page">
      <div className="page-inner">
        <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginBottom: 8 }} onClick={() => navigate('dashboard')}>← All questions</button>

        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 620 }}>
            <Status s={q.status} />
            <h1 className="h-title" style={{ fontSize: 26, marginTop: 12 }}>{q.text}</h1>
            <div className="row" style={{ gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
              <Meta label={q.city} /><Meta label={q.income} />
              <Meta label={q.points === 0 ? 'No reward' : `${q.points} pts each`} />
              <Meta label={`${q.start} → ${q.end}`} />
            </div>
          </div>
          <Card style={{ textAlign: 'center', minWidth: 150, padding: 18 }}>
            <div className="stat-num">{q.collected.toLocaleString()}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>of {q.target.toLocaleString()} responses</div>
          </Card>
        </div>

        {/* view toggle */}
        <div className="row" style={{ gap: 6, margin: '28px 0 20px', borderBottom: '1px solid var(--border)' }}>
          {[['summary', 'Summary'], ['individual', 'Responses']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: 'none', border: 0, cursor: 'pointer', padding: '10px 4px', marginRight: 18,
              fontSize: 14, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
              color: view === v ? 'var(--ink)' : 'var(--text-faint)',
              borderBottom: view === v ? '2px solid var(--brand-orange)' : '2px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {!isPro ? (
          <ProLock
            title="See what your community said."
            body="Free shows you how many people responded. Upgrade to Pro to read individual answers, hear voice, and get an aggregate breakdown — never any names."
            onUpgrade={onUpgrade} />
        ) : view === 'summary' ? (
          <SummaryView q={q} />
        ) : (
          <IndividualView q={q} />
        )}
      </div>
    </div>
  );
}

function SummaryView({ q }) {
  return (
    <div className="split">
      <div className="main col" style={{ gap: 18 }}>
        <Card>
          <div className="section-label">Top themes</div>
          <div className="col" style={{ gap: 16 }}>
            {AGG_THEMES.map((t, i) => (
              <div key={i}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{t.t}</span>
                  <span className="tnum faint" style={{ fontSize: 13 }}>{t.pct}%</span>
                </div>
                <div className="bar-track" style={{ marginBottom: 5 }}><div className="bar-fill" style={{ width: `${t.pct * 2.2}%` }} /></div>
                <div className="muted" style={{ fontSize: 13 }}>{t.note}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card gray>
          <div className="section-label">Representative quote</div>
          <blockquote style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)', fontWeight: 500 }}>
            "A single calendar that shows which centers actually have open spots. I call ten places and they're all full."
          </blockquote>
          <div className="faint" style={{ fontSize: 12, marginTop: 10 }}>Anonymous · Detroit, MI · Parent · &lt; $40k</div>
        </Card>
      </div>

      <div className="rail col" style={{ gap: 18 }}>
        <Card>
          <div className="section-label" style={{ marginBottom: 16 }}>Who answered</div>
          <div className="col" style={{ gap: 18 }}>
            {Object.entries(AGG_BREAKDOWN).map(([title, rows]) => (
              <div key={title}>
                <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <Breakdown rows={rows} ink />
              </div>
            ))}
          </div>
          <div className="faint" style={{ fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
            Aggregate only. Individual identities are never shared.
          </div>
        </Card>
        <Btn kind="outline" block onClick={() => {}}>Export summary (CSV)</Btn>
      </div>
    </div>
  );
}

function IndividualView({ q }) {
  const { useState } = React;
  const [flagged, setFlagged] = useState({});
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span className="muted" style={{ fontSize: 13 }}>Showing {SAMPLE_RESPONSES.length} of {q.collected.toLocaleString()} · newest first · <strong style={{ color: 'var(--ink)' }}>no names</strong></span>
        <div className="row" style={{ gap: 8 }}>
          <span className="chip">All</span>
          <span className="chip">Flagged</span>
        </div>
      </div>
      {SAMPLE_RESPONSES.map(r => {
        const isFlag = flagged[r.id] ?? r.flagged;
        return (
          <Card key={r.id} hover style={{ padding: 20 }}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <span className="faint tnum" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{r.id}</span>
              <span className="faint" style={{ fontSize: 12 }}>{r.when}</span>
            </div>
            {q.mode !== 'text' && <VoiceBar />}
            <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)' }}>{r.text}</div>
            <div className="row" style={{ gap: 6, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {r.attrs.map((a, i) => (
                <span key={i} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-gray)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 10px' }}>{a}</span>
              ))}
              <span style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm" onClick={() => setFlagged(f => ({ ...f, [r.id]: !isFlag }))}
                style={{ color: isFlag ? 'var(--brand-orange)' : 'var(--text-faint)' }}>
                {isFlag ? '★ Flagged' : '☆ Flag'}
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function VoiceBar() {
  return (
    <div className="row" style={{ gap: 10, padding: '10px 12px', background: 'var(--surface-gray)', borderRadius: 'var(--radius-button)', marginBottom: 12, alignItems: 'center' }}>
      <span className="num-badge dark" style={{ width: 30, height: 30, fontSize: 11 }}>▶</span>
      <div className="row" style={{ gap: 2, flex: 1, alignItems: 'center', height: 24 }}>
        {[8, 16, 11, 20, 14, 22, 9, 18, 13, 24, 10, 17, 7, 19, 12, 21, 8, 15].map((h, i) => (
          <span key={i} style={{ width: 3, height: h, background: 'var(--border-2)', borderRadius: 2 }} />
        ))}
      </div>
      <span className="faint tnum" style={{ fontSize: 12 }}>0:38</span>
    </div>
  );
}




// ===== source: e5d559c5 =====
// Billing & subscription — plans, points charge-up (min $50), auto-charge.

function BillingScreen({ plan, balance, onSetPlan, onCharge, autocharge, onSetAutocharge, voice }) {
  const { useState } = React;
  const V = voice || { billingTitle: 'Plan & billing.' };
  const [cadence, setCadence] = useState('monthly');
  const [chargeAmt, setChargeAmt] = useState(100);
  const validCharge = Number.isInteger(chargeAmt) && chargeAmt >= 1;

  return (
    <div className="page">
      <div className="page-inner">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <Eyebrow>Plan & billing</Eyebrow>
            <h1 className="h-title" style={{ marginTop: 14 }}>{V.billingTitle}</h1>
          </div>
          <div className="row" style={{ gap: 4, border: '1px solid var(--border-2)', borderRadius: 999, padding: 4, background: 'var(--surface)' }}>
            {[['monthly', 'Monthly'], ['yearly', 'Yearly · save 30%']].map(([v, l]) => (
              <button key={v} onClick={() => setCadence(v)} style={{
                border: 0, cursor: 'pointer', borderRadius: 999, padding: '6px 14px',
                fontSize: 13, fontWeight: 700,
                background: cadence === v ? 'var(--ink)' : 'transparent',
                color: cadence === v ? '#fff' : 'var(--text-muted)',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Plan tiers */}
        <div className="grid-3" style={{ marginBottom: 36, alignItems: 'stretch' }}>
          {['free', 'pro', 'enterprise'].map(id => (
            <PlanCard key={id} p={PLANS[id]} cadence={cadence} current={plan === id}
              onChoose={() => {
                if (id === 'enterprise') { window.location.href = `mailto:${PLANS.enterprise.contact}?subject=LoopedIn Enterprise`; return; }
                onSetPlan(id);
              }} />
          ))}
        </div>

        {/* Points balance + charge up */}
        <Card style={{ marginBottom: 18 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'baseline' }}>
            <div className="section-label" style={{ margin: 0 }}>Points balance</div>
            <span className="faint" style={{ fontSize: 12 }}>100 pts = $1.00</span>
          </div>
          <div className="split" style={{ gap: 32, alignItems: 'center' }}>
            <div className="main" style={{ minWidth: 0 }}>
              <div className="stat-num" style={{ fontSize: 44 }}>{balance.toLocaleString()} pts</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>≈ {ptsToUsd(balance)} available to spend on rewards</div>
            </div>
            <div className="rail" style={{ position: 'static', width: 360 }}>
              <div className="field-label">Charge up</div>
              <div className="input row" style={{ alignItems: 'center', gap: 6, padding: '0 14px', marginBottom: 12 }}>
                <span className="faint" style={{ fontSize: 16, fontWeight: 700 }}>$</span>
                <input type="number" min="1" step="1" value={Number.isNaN(chargeAmt) ? '' : chargeAmt}
                  onChange={e => { const n = parseInt(e.target.value, 10); setChargeAmt(Number.isNaN(n) ? NaN : Math.max(0, n)); }}
                  placeholder="Enter an amount"
                  style={{ border: 0, outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: 'var(--ink)', width: '100%', padding: '11px 0' }} />
              </div>
              {validCharge && (
                <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                  You'll get <strong style={{ color: 'var(--brand-orange)' }}>{usdToPts(chargeAmt).toLocaleString()} pts</strong>.
                </div>
              )}
              <div className="row" style={{ gap: 10, alignItems: 'stretch' }}>
                <div className="input row" style={{ alignItems: 'center', gap: 8, flex: 1 }}>
                  <span className="faint" style={{ fontSize: 13 }}>VISA</span>
                  <span className="tnum" style={{ color: 'var(--ink)' }}>•••• 4242</span>
                </div>
                <Btn kind="primary" disabled={!validCharge} onClick={() => onCharge(usdToPts(chargeAmt))}>
                  {validCharge ? `Charge $${chargeAmt.toLocaleString()}` : 'Enter amount'}
                </Btn>
              </div>
            </div>
          </div>
        </Card>

        {/* Auto-charge */}
        <Card gray>
          <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
            <Toggle on={autocharge.on} onChange={v => onSetAutocharge({ ...autocharge, on: v })} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Auto-charge my card</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3, marginBottom: autocharge.on ? 16 : 0, lineHeight: 1.5 }}>
                Keep campaigns running — top up automatically when your balance gets low.
              </div>
              {autocharge.on && (
                <div className="row" style={{ gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div>
                    <div className="field-label">When balance drops below</div>
                    <div className="row" style={{ gap: 8 }}>
                      {AUTOCHARGE_THRESHOLDS.map(t => (
                        <span key={t} className={`chip${autocharge.threshold === t ? ' on' : ''}`} onClick={() => onSetAutocharge({ ...autocharge, threshold: t })}>${t}</span>
                      ))}
                    </div>
                  </div>
                  <span className="muted" style={{ fontSize: 14, paddingBottom: 7 }}>→ top up to ${autocharge.topup}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PlanCard({ p, cadence, current, onChoose }) {
  const price = p.id === 'pro' && cadence === 'yearly' ? '$599' : p.price;
  const cad = p.id === 'pro' ? (cadence === 'yearly' ? '/yr' : '/mo') : p.cadence;
  const includedPts = p.id === 'pro' ? (cadence === 'yearly' ? p.yearlyPoints : p.monthlyPoints) : 0;
  return (
    <div className="card" style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      borderColor: p.highlight ? 'var(--brand-orange)' : 'var(--border)',
      background: p.highlight ? 'var(--brand-orange-tint)' : (p.contact ? 'var(--surface-gray)' : 'var(--surface)'),
    }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{p.name}</span>
        {p.highlight && <span className="status status-pending">Recommended</span>}
        {current && <span className="status status-live">Current</span>}
      </div>
      <div>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--ink)', letterSpacing: -1 }}>{price}</span>
        <span className="faint" style={{ fontSize: 14 }}> {cad}</span>
        {p.id === 'pro' && cadence === 'monthly' && <span className="faint" style={{ fontSize: 13 }}> · or $599/yr</span>}
      </div>
      {includedPts > 0 && (
        <div className="row" style={{ gap: 7, alignItems: 'center' }}>
          <span className="pro-tag">Includes</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
            {includedPts.toLocaleString()} pts {cadence === 'yearly' ? '/ year' : '/ month'}
          </span>
        </div>
      )}
      <div className="muted" style={{ fontSize: 13, lineHeight: 1.5, minHeight: 38 }}>{p.blurb}</div>
      <div className="col" style={{ gap: 8, margin: '4px 0 8px' }}>
        {p.feats.map((f, i) => (
          <div key={i} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: f.ok ? 'var(--brand-orange)' : 'var(--text-disabled)', fontWeight: 800, flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>{f.ok ? '✓' : '✕'}</span>
            <span style={{ fontSize: 13.5, color: f.ok ? 'var(--text)' : 'var(--text-faint)', lineHeight: 1.4 }}>{f.t}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto' }}>
        {current
          ? <Btn kind="outline" block disabled>Current plan</Btn>
          : <Btn kind={p.highlight ? 'primary' : 'outline'} block onClick={onChoose}>
              {p.contact ? 'Contact us' : (p.id === 'free' ? 'Downgrade' : 'Upgrade to Pro')}
            </Btn>}
        {p.contact && <div className="faint" style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>{p.contact}</div>}
      </div>
    </div>
  );
}




// ===== source: e15f708f =====
// Admin review queue — internal LoopedIn view.
// Every submitted question lands here before it reaches the community.

const ADMIN_SEED = [
  {
    id: 'a1', org: 'Brightside Foundation', plan: 'pro',
    text: 'What is one thing about the SNAP renewal process you wish someone had told you?',
    mode: 'text', points: 100, target: 300, city: 'Newark, NJ', income: '< $40k',
    start: 'Jun 1', end: 'Jun 30', submitted: '2h ago', cost: 30000,
  },
  {
    id: 'a2', org: 'City of Fresno · Studio', plan: 'pro',
    text: 'Tell us about a time public transit let you down. What happened?',
    mode: 'both', points: 150, target: 200, city: 'Fresno, CA', income: 'Any income',
    start: 'Jun 3', end: 'Jun 24', submitted: '5h ago', cost: 30000,
  },
  {
    id: 'a3', org: 'Maple Community Fund', plan: 'free',
    text: 'If you could change one thing about your kid’s school, what would it be?',
    mode: 'text', points: 0, target: 100, city: 'Atlanta, GA', income: 'Any income',
    start: 'On approval', end: '+30 days', submitted: '1d ago', cost: 0,
  },
];

function AdminScreen({ submitted }) {
  const { useState } = React;
  const queue = [...submitted, ...ADMIN_SEED];
  const [decisions, setDecisions] = useState({});
  const [reviewing, setReviewing] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending | approved | all

  const pending = queue.filter(q => !decisions[q.id]);
  const approved = queue.filter(q => decisions[q.id] === 'approved');
  const visible = queue.filter(q => {
    if (filter === 'pending') return !decisions[q.id];
    if (filter === 'approved') return decisions[q.id] === 'approved';
    return true;
  });

  const FILTERS = [
    ['pending', 'Needs review', pending.length],
    ['approved', 'Approved', approved.length],
    ['all', 'All', queue.length],
  ];

  return (
    <div className="page">
      <div className="page-inner">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <Eyebrow>Admin · Review queue</Eyebrow>
            <h1 className="h-title" style={{ marginTop: 14 }}>Questions to review.</h1>
            <p className="h-sub">Approve or send back before questions reach the community.</p>
          </div>
          <Card style={{ textAlign: 'center', minWidth: 130, padding: 16 }}>
            <div className="stat-num">{pending.length}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>awaiting review</div>
          </Card>
        </div>

        {/* Filter toolbar */}
        <div className="row" style={{ gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(([id, label, n]) => (
            <button key={id} onClick={() => setFilter(id)} className={`chip${filter === id ? ' on' : ''}`}>
              {label}
              <span className="tnum" style={{
                marginLeft: 2, fontWeight: 800,
                opacity: filter === id ? 0.9 : 0.5,
              }}>{n}</span>
            </button>
          ))}
        </div>

        <div className="col" style={{ gap: 14 }}>
          {visible.length === 0 && (
            <Card gray style={{ textAlign: 'center', padding: '36px 28px' }}>
              <div className="h-title" style={{ fontSize: 18 }}>Nothing here.</div>
              <div className="h-sub">
                {filter === 'pending' ? 'No questions are waiting for review.' : 'No approved questions yet.'}
              </div>
            </Card>
          )}
          {visible.map(q => {
            const d = decisions[q.id];
            return (
              <Card key={q.id} style={{ padding: 22, opacity: d ? 0.6 : 1, borderColor: d === 'approved' ? 'var(--ink)' : (d === 'returned' ? 'var(--brand-orange-border)' : 'var(--border)') }}>
                <div className="row" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 14 }}>{q.org}</span>
                    <span className={`plan-badge ${q.plan}`}>{q.plan}</span>
                  </div>
                  <span className="faint" style={{ fontSize: 12 }}>Submitted {q.submitted}</span>
                </div>

                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, letterSpacing: -0.2 }}>{q.text}</div>

                <div className="row" style={{ gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
                  <Meta label={q.city} /><Meta label={q.income} />
                  <Meta label={q.mode === 'voice' ? 'Voice' : q.mode === 'both' ? 'Text + Voice' : 'Text'} />
                  <Meta label={q.points === 0 ? 'No reward' : `${q.points} pts × ${q.target}`} />
                  <Meta label={`${q.start} → ${q.end}`} />
                  {q.points > 0 && <Meta label={`Funded ${pts(q.cost)}`} />}
                </div>

                <hr className="divider" style={{ margin: '18px 0' }} />

                {d ? (
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span className={`status ${d === 'approved' ? 'status-live' : 'status-pending'}`}>
                      {d === 'approved' ? 'Approved · now live' : 'Returned to buyer'}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDecisions(s => { const n = { ...s }; delete n[q.id]; return n; })}>Undo</button>
                  </div>
                ) : (
                  <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <Btn kind="dark" sm onClick={() => setDecisions(s => ({ ...s, [q.id]: 'approved' }))}>Approve & publish</Btn>
                    <Btn kind="outline" sm onClick={() => setReviewing(q)}>Send back…</Btn>
                    <span style={{ flex: 1 }} />
                    <button className="btn btn-ghost btn-sm" onClick={() => setReviewing(q)}>View detail</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {reviewing && (
        <Sheet title="Send back to buyer"
          sub={reviewing.org}
          onClose={() => setReviewing(null)}
          footer={[
            <Btn key="c" kind="outline" onClick={() => setReviewing(null)} style={{ flex: 1 }}>Cancel</Btn>,
            <Btn key="s" kind="primary" onClick={() => { setDecisions(s => ({ ...s, [reviewing.id]: 'returned' })); setReviewing(null); }} style={{ flex: 1.4 }}>Return with note</Btn>,
          ]}>
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>"{reviewing.text}"</div>
          <Field label="Reason (sent to the buyer)">
            <textarea className="textarea" placeholder="e.g. Please rephrase to avoid leading the respondent, then resubmit." defaultValue="" />
          </Field>
          <div className="col" style={{ gap: 6, marginTop: 12 }}>
            {['Leading / biased wording', 'Could identify individuals', 'Out of scope for community'].map(r => (
              <span key={r} className="chip" style={{ alignSelf: 'flex-start' }}>{r}</span>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}




// ===== source: a2e05e35 =====
// LoopedIn for Orgs — buyer console orchestrator.

const { useState: useS, useEffect: useE } = React;
const STORE = 'loopedin-buyer-v1';

const DEFAULT = {
  role: 'buyer',          // buyer | admin
  screen: 'compose',
  qid: null,
  plan: 'free',           // free | pro
  balance: 4500,          // points on hand
  autocharge: { on: false, threshold: 50, topup: 100 },
};

function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(STORE) || '{}') }; }
  catch { return { ...DEFAULT }; }
}

function App() {
  const [st, setSt] = useS(load);
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "editorial",
    "density": "comfortable",
    "voice": "bold"
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [questions, setQuestions] = useS(SEED_QUESTIONS);
  const [submittedToAdmin, setSubmitted] = useS([]);
  const [toastMsg, setToastMsg] = useS(null);
  const [charge, setCharge] = useS(null); // {need} | {} → open charge sheet

  // Persist the lightweight account state (not the seed data).
  useE(() => {
    const { role, screen, qid, plan, balance, autocharge } = st;
    localStorage.setItem(STORE, JSON.stringify({ role, screen, qid, plan, balance, autocharge }));
  }, [st]);

  // Apply the expressive tweaks. Theme reskins every surface; density resets the
  // spatial rhythm; voice swaps copy personality (threaded into screens below).
  // Orange stays the only accent per the Rebel One system — themes shift mood,
  // not the brand color.
  useE(() => {
    const THEMES = {
      editorial: {
        page: '#f8f8f8',
        vars: {
          '--chrome-bg': 'rgba(255,255,255,0.95)',
          '--surface': '#ffffff', '--surface-gray': '#f8f8f8', '--surface-footer': '#fafafa',
          '--ink': '#111', '--ink-soft': '#333', '--text': '#555', '--text-muted': '#777',
          '--text-faint': '#999', '--text-disabled': '#bbb', '--border': '#eee', '--border-2': '#e2e2e2',
          '--brand-orange-tint': '#fff1e8', '--brand-orange-border': '#f7c8a8',
        },
      },
      ink: {
        page: '#0b0c0e',
        vars: {
          '--chrome-bg': 'rgba(23,24,28,0.95)',
          '--surface': '#17181c', '--surface-gray': '#1f2025', '--surface-footer': '#17181c',
          '--ink': '#f4f4f5', '--ink-soft': '#dcdce0', '--text': '#b6b7bd', '--text-muted': '#94959c',
          '--text-faint': '#74757c', '--text-disabled': '#54555c', '--border': '#2a2b30', '--border-2': '#34353c',
          '--brand-orange-tint': '#2a1a12', '--brand-orange-border': '#5a3a24',
        },
      },
      warm: {
        page: '#f0e6d8',
        vars: {
          '--chrome-bg': 'rgba(255,253,249,0.95)',
          '--surface': '#fffdf9', '--surface-gray': '#f6efe6', '--surface-footer': '#f6efe6',
          '--ink': '#2a2018', '--ink-soft': '#3d3026', '--text': '#6b5d4f', '--text-muted': '#8a7a68',
          '--text-faint': '#a99883', '--text-disabled': '#c8bba8', '--border': '#ece2d4', '--border-2': '#e0d4c2',
          '--brand-orange-tint': '#fdeede', '--brand-orange-border': '#f4cba6',
        },
      },
    };
    const theme = THEMES[t.theme] || THEMES.editorial;
    const r = document.documentElement.style;
    Object.entries(theme.vars).forEach(([k, v]) => r.setProperty(k, v));
    document.body.style.background = theme.page;
    document.documentElement.setAttribute('data-density', t.density);
  }, [t.theme, t.density]);

  const V = VOICE_COPY[t.voice] || VOICE_COPY.bold;

  const set = (patch) => setSt(s => ({ ...s, ...patch }));
  const navigate = (screen) => set({ screen });
  const toast = (m) => { setToastMsg(m); clearTimeout(window.__lt); window.__lt = setTimeout(() => setToastMsg(null), 2400); };

  const chargeUp = (ptsAmt) => {
    set({ balance: st.balance + ptsAmt });
    toast(`Charged up ${ptsAmt.toLocaleString()} pts.`);
  };

  const submitQuestion = (draft) => {
    const q = {
      id: 'q' + Date.now(), ...draft, collected: 0, status: 'pending',
    };
    setQuestions(qs => [q, ...qs]);
    setSubmitted(s => [{
      id: q.id, org: 'Your organization', plan: st.plan,
      text: q.text, mode: q.mode, points: q.points, target: q.target,
      city: q.city, income: q.income, start: q.start, end: q.end,
      submitted: 'just now', cost: q.points * q.target,
    }, ...s]);
    if (q.points > 0) set({ balance: st.balance - q.points * q.target, screen: 'dashboard' });
    else set({ screen: 'dashboard' });
  };

  const openResponses = (qid) => set({ screen: 'responses', qid });
  const onUpgrade = () => set({ screen: 'billing' });

  const NAV = [
    ['dashboard', 'Dashboard'],
    ['compose', 'Compose'],
    ['responses', 'Responses'],
    ['billing', 'Billing'],
  ];

  let body;
  if (st.role === 'admin') {
    body = <AdminScreen submitted={submittedToAdmin} />;
  } else if (st.screen === 'compose') {
    body = <ComposeScreen plan={st.plan} balance={st.balance}
      onSubmit={submitQuestion} onCharge={(need) => setCharge({ need })} onUpgrade={onUpgrade} toast={toast}
      voice={V} />;
  } else if (st.screen === 'dashboard') {
    body = <DashboardScreen plan={st.plan} balance={st.balance} questions={questions}
      navigate={navigate} openResponses={openResponses} onCharge={() => setCharge({})} voice={V} />;
  } else if (st.screen === 'responses') {
    body = <ResponsesScreen plan={st.plan} questions={questions} qid={st.qid} navigate={navigate} onUpgrade={onUpgrade} />;
  } else if (st.screen === 'billing') {
    body = <BillingScreen plan={st.plan} balance={st.balance}
      onSetPlan={(p) => {
        if (p === 'pro' && st.plan !== 'pro') {
          const grant = PLANS.pro.monthlyPoints;
          set({ plan: p, balance: st.balance + grant });
          toast(`Welcome to Pro — ${grant.toLocaleString()} pts added.`);
        } else {
          set({ plan: p });
          toast(p === 'pro' ? 'Welcome to Pro.' : 'Switched to Free.');
        }
      }}
      onCharge={chargeUp}
      autocharge={st.autocharge} onSetAutocharge={(a) => set({ autocharge: a })} voice={V} />;
  }

  return (
    <div className="app">
      {st.role === 'buyer' && (
        <header className="appbar">
          <div className="appbar-brand" onClick={() => navigate('dashboard')}>
            <span className="num-badge dark" style={{ width: 30, height: 30, borderRadius: 8, fontSize: 15 }}>L</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--ink)', letterSpacing: -0.3 }}>LoopedIn</span>
            <span className="sub">for orgs</span>
          </div>
          <nav className="appbar-nav">
            {NAV.map(([id, label]) => {
              const pendingCount = id === 'dashboard' ? questions.filter(q => q.status === 'pending').length : 0;
              return (
                <button key={id} className={st.screen === id ? 'active' : ''} onClick={() => navigate(id)}>
                  {label}{pendingCount > 0 && <span className="pip">{pendingCount}</span>}
                </button>
              );
            })}
          </nav>
          <div className="appbar-right">
            <span className={`plan-badge ${st.plan}`}>{st.plan === 'pro' ? 'Pro' : 'Free'}</span>
            <div className="balance">
              <span className="lbl">Balance</span>
              <span className="val tnum">{st.balance.toLocaleString()} pts</span>
              <button className="charge" onClick={() => navigate('billing')}>+ Charge up</button>
            </div>
          </div>
        </header>
      )}

      {body}

      {/* Mobile bottom tabs */}
      {st.role === 'buyer' && (
        <nav className="tabbar">
          {NAV.map(([id, label]) => (
            <button key={id} className={st.screen === id ? 'active' : ''} onClick={() => navigate(id)}>
              <span className="tnum-badge">{label[0]}</span>{label}
            </button>
          ))}
        </nav>
      )}

      {/* Prototype role switch */}
      <div className="proto-switch">
        <button className={st.role === 'buyer' ? 'on' : ''} onClick={() => set({ role: 'buyer' })}>Buyer</button>
        <button className={st.role === 'admin' ? 'on' : ''} onClick={() => set({ role: 'admin' })}>Admin</button>
      </div>

      <TweaksPanel>
        <TweakSection label="Theme">
          <div style={{ fontSize: 11, color: 'rgba(41,38,27,.5)', lineHeight: 1.4, padding: '2px 0 4px' }}>Reskins every surface. Orange stays the accent.</div>
        </TweakSection>
        <TweakRadio label="Mood" value={t.theme}
          options={['editorial', 'ink', 'warm']}
          onChange={(v) => setTweak('theme', v)} />
        <TweakSection label="Density">
          <div style={{ fontSize: 11, color: 'rgba(41,38,27,.5)', lineHeight: 1.4, padding: '2px 0 4px' }}>Resets the spatial rhythm across the app.</div>
        </TweakSection>
        <TweakRadio label="Spacing" value={t.density}
          options={['compact', 'comfortable', 'spacious']}
          onChange={(v) => setTweak('density', v)} />
        <TweakSection label="Voice">
          <div style={{ fontSize: 11, color: 'rgba(41,38,27,.5)', lineHeight: 1.4, padding: '2px 0 4px' }}>Swaps the copy personality.</div>
        </TweakSection>
        <TweakRadio label="Tone" value={t.voice}
          options={['bold', 'plain', 'civic']}
          onChange={(v) => setTweak('voice', v)} />
      </TweaksPanel>

      {/* Charge-up sheet */}
      {charge && (
        <ChargeSheet need={charge.need} balance={st.balance}
          onClose={() => setCharge(null)}
          onConfirm={(ptsAmt) => { chargeUp(ptsAmt); setCharge(null); }} />
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 95,
          background: 'var(--ink)', color: '#fff', padding: '12px 20px', borderRadius: 999,
          fontSize: 14, fontWeight: 600, boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
        }}>{toastMsg}</div>
      )}
    </div>
  );
}

// Charge-up confirm sheet — quick amounts or any whole-dollar amount (min $50).
function ChargeSheet({ need, balance, onClose, onConfirm }) {
  const MIN = 50;
  const suggested = need ? Math.max(MIN, Math.ceil(need / POINTS_PER_DOLLAR / 50) * 50) : 100;
  const [amt, setAmt] = useS(suggested);
  const valid = Number.isInteger(amt) && amt >= MIN;
  return (
    <Sheet title="Charge up your account"
      sub={need ? `You need ${need.toLocaleString()} more pts to post this question.` : 'Add points to reward respondents.'}
      onClose={onClose}
      footer={[
        <Btn key="c" kind="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>,
        <Btn key="s" kind="primary" disabled={!valid} onClick={() => onConfirm(usdToPts(amt))} style={{ flex: 1.5 }}>
          {valid ? `Charge $${amt.toLocaleString()} →` : `Min $${MIN}`}
        </Btn>,
      ]}>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[50, 100, 250, 500].map(a => (
          <span key={a} className={`chip${amt === a ? ' on' : ''}`} onClick={() => setAmt(a)}>${a}</span>
        ))}
      </div>
      <Field label="Or enter any amount">
        <div className="input row" style={{ alignItems: 'center', gap: 6, padding: '0 14px' }}>
          <span className="faint" style={{ fontSize: 18, fontWeight: 700 }}>$</span>
          <input type="number" min={MIN} step="1" value={Number.isNaN(amt) ? '' : amt}
            onChange={e => { const n = parseInt(e.target.value, 10); setAmt(Number.isNaN(n) ? NaN : Math.max(0, n)); }}
            style={{ border: 0, outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 18, fontWeight: 700, color: 'var(--ink)', width: '100%', padding: '12px 0' }} />
        </div>
      </Field>
      {!valid && <div style={{ fontSize: 12, marginTop: 7, color: 'var(--brand-orange)' }}>Minimum charge-up is ${MIN}.</div>}

      <div className="card card-gray" style={{ padding: 16, marginTop: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
          <span className="muted">Balance now</span><span className="tnum">{balance.toLocaleString()} pts</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
          <span className="muted">Adding</span><span className="tnum" style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>+{(valid ? usdToPts(amt) : 0).toLocaleString()} pts</span>
        </div>
        <hr className="divider" style={{ margin: '10px 0' }} />
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
          <span>New balance</span><span className="tnum">{(balance + (valid ? usdToPts(amt) : 0)).toLocaleString()} pts</span>
        </div>
      </div>
      <div className="faint" style={{ fontSize: 12, marginTop: 12 }}>Charged to VISA •••• 4242 · 100 pts = $1.00 · minimum $50.</div>
    </Sheet>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

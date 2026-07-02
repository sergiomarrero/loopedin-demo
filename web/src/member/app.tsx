/* eslint-disable */
// @ts-nocheck
// Ported faithfully from the LoopedIn prototype bundle (single-module port).
import React from 'react';
import ReactDOM from 'react-dom/client';
import { memberApi, getToken, setToken } from '../api';


// ===== source: 3781690f =====

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', gap: 154, alignItems: 'center', justifyContent: 'center',
      padding: '21px 24px 19px', boxSizing: 'border-box',
      position: 'relative', zIndex: 20, width: '100%',
    }}>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 1.5 }}>
        <span style={{
          fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590,
          fontSize: 17, lineHeight: '22px', color: c,
        }}>{time}</span>
      </div>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 1, paddingRight: 1 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c}/>
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c}/>
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c}/>
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c}/>
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={c}/>
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({ children, dark = false, style = {} }) {
  return (
    <div style={{
      height: 44, minWidth: 44, borderRadius: 9999,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: dark
        ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)'
        : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {/* blur + tint */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 9999,
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)',
      }} />
      {/* shine */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 9999,
        boxShadow: dark
          ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)'
          : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
        border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({ title = 'Title', dark = false, trailingIcon = true }) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = (content) => (
    <IOSGlassPill dark={dark}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    </IOSGlassPill>
  );
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      paddingTop: 62, paddingBottom: 10, position: 'relative', zIndex: 5,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        {/* back chevron */}
        {pillIcon(
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" style={{ marginLeft: -1 }}>
            <path d="M10 2L2 10l8 8" stroke={muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {/* trailing ellipsis */}
        {trailingIcon && pillIcon(
          <svg width="22" height="6" viewBox="0 0 22 6">
            <circle cx="3" cy="3" r="2.5" fill={muted}/>
            <circle cx="11" cy="3" r="2.5" fill={muted}/>
            <circle cx="19" cy="3" r="2.5" fill={muted}/>
          </svg>
        )}
      </div>
      {/* large title */}
      <div style={{
        padding: '0 16px',
        fontFamily: '-apple-system, system-ui',
        fontSize: 34, fontWeight: 700, lineHeight: '41px',
        color: text, letterSpacing: 0.4,
      }}>{title}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({ title, detail, icon, chevron = true, isLast = false, dark = false }) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', minHeight: 52,
      padding: '0 16px', position: 'relative',
      fontFamily: '-apple-system, system-ui', fontSize: 17,
      letterSpacing: -0.43,
    }}>
      {icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 7, background: icon,
          marginRight: 12, flexShrink: 0,
        }} />
      )}
      <div style={{ flex: 1, color: text }}>{title}</div>
      {detail && <span style={{ color: sec, marginRight: 6 }}>{detail}</span>}
      {chevron && (
        <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}>
          <path d="M1 1l6 6-6 6" stroke={ter} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {!isLast && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          left: icon ? 58 : 16, height: 0.5, background: sep,
        }} />
      )}
    </div>
  );
}

function IOSList({ header, children, dark = false }) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return (
    <div>
      {header && (
        <div style={{
          fontFamily: '-apple-system, system-ui', fontSize: 13,
          color: hc, textTransform: 'uppercase',
          padding: '8px 36px 6px', letterSpacing: -0.08,
        }}>{header}</div>
      )}
      <div style={{
        background: bg, borderRadius: 26,
        margin: '0 16px', overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children, width = 402, height = 874, dark = false,
  title, keyboard = false,
}) {
  return (
    <div style={{
      width, height, borderRadius: 48, overflow: 'hidden',
      position: 'relative', background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }} />
      {/* status bar (absolute) — opaque/blurred so scrolled content doesn't show through behind it */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: dark ? 'rgba(0,0,0,0.6)' : 'rgba(250,250,246,0.82)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}>
        <IOSStatusBar dark={dark} />
      </div>
      {/* nav + content */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {title !== undefined && <IOSNavBar title={title} dark={dark} />}
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
        {keyboard && <IOSKeyboard dark={dark} />}
      </div>
      {/* home indicator — always on top */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none',
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100,
          background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({ dark = false }) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: <svg width="19" height="17" viewBox="0 0 19 17"><path d="M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z" fill={glyph}/></svg>,
    del: <svg width="23" height="17" viewBox="0 0 23 17"><path d="M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z" fill="none" stroke={glyph} strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 5l7 7M17 5l-7 7" stroke={glyph} strokeWidth="1.6" strokeLinecap="round"/></svg>,
    ret: <svg width="20" height="14" viewBox="0 0 20 14"><path d="M18 1v6H4m0 0l4-4M4 7l4 4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };

  const key = (content, { w, flex, ret, fs = 25, k } = {}) => (
    <div key={k} style={{
      height: 42, borderRadius: 8.5,
      flex: flex ? 1 : undefined, width: w, minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs, fontWeight: 458, color: ret ? '#fff' : glyph,
    }}>{content}</div>
  );

  const row = (keys, pad = 0) => (
    <div style={{ display: 'flex', gap: 6.5, justifyContent: 'center', padding: `0 ${pad}px` }}>
      {keys.map(l => key(l, { flex: true, k: l }))}
    </div>
  );

  return (
    <div style={{
      position: 'relative', zIndex: 15, borderRadius: 27, overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: dark
        ? '0 -2px 20px rgba(0,0,0,0.09)'
        : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)',
    }}>
      {/* liquid glass bg — same recipe as nav pills */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 27,
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 27,
        boxShadow: dark
          ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)'
          : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
        border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
        pointerEvents: 'none',
      }} />

      {/* autocorrect bar */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'center',
        padding: '8px 22px 13px', width: '100%', boxSizing: 'border-box',
        position: 'relative',
      }}>
        {['"The"', 'the', 'to'].map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: 1, height: 25, background: '#ccc', opacity: 0.3 }} />}
            <div style={{
              flex: 1, textAlign: 'center',
              fontFamily: '-apple-system, system-ui', fontSize: 17,
              color: sugg, letterSpacing: -0.43, lineHeight: '22px',
            }}>{w}</div>
          </React.Fragment>
        ))}
      </div>

      {/* key layout */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 13,
        padding: '0 6.5px', width: '100%', boxSizing: 'border-box',
        position: 'relative',
      }}>
        {row(['q','w','e','r','t','y','u','i','o','p'])}
        {row(['a','s','d','f','g','h','j','k','l'], 20)}
        <div style={{ display: 'flex', gap: 14.25, alignItems: 'center' }}>
          {key(icons.shift, { w: 45, k: 'shift' })}
          <div style={{ display: 'flex', gap: 6.5, flex: 1 }}>
            {['z','x','c','v','b','n','m'].map(l => key(l, { flex: true, k: l }))}
          </div>
          {key(icons.del, { w: 45, k: 'del' })}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {key('ABC', { w: 92.25, fs: 18, k: 'abc' })}
          {key('', { flex: true, k: 'space' })}
          {key(icons.ret, { w: 92.25, ret: true, k: 'ret' })}
        </div>
      </div>

      {/* bottom spacer (emoji+mic area, icons omitted) */}
      <div style={{ height: 56, width: '100%', position: 'relative' }} />
    </div>
  );
}




// ===== source: 5f9ee394 =====
// Mock data + helpers for Pulse respondent app.
// Money model: amounts are stored as CENTS (integers) and displayed as POINTS
// (1 cent = 1 point) via centsFmt. Conversion to real cash shown on wallet.

function centsFmt(c) {
  // Displayed as points (1 cent = 1 point internally). Cash conversion is shown
  // on the wallet screen; everywhere else we surface the points value.
  return `${c} pts`;
}

// Real-dollar formatter used only where literal cash needs to be shown
// (cashout tier labels, wallet conversion line).
function dollarsFmt(c) {
  const dollars = Math.floor(c / 100);
  const cents = c % 100;
  return `$${dollars}.${cents.toString().padStart(2, '0')}`;
}

const PULSE_QUESTIONS = [
  // ---------- For You ----------
  {
    id: 'q-snap',
    text: "What's one thing that made applying for SNAP harder than it had to be?",
    buyer: "Pew Charitable Trusts",
    buyerType: "FOUNDATION",
    mode: "voice", // 'text' | 'voice' (voice means text+voice)
    cents: 50,
    trial: false,
    feed: 'foryou',
    qualifier: null,
  },
  {
    id: 'q-childcare',
    text: "If childcare were free this week, what would you actually do with the extra time?",
    buyer: "Aspen Institute",
    buyerType: "FOUNDATION",
    mode: "text",
    cents: 25,
    trial: false,
    feed: 'foryou',
    qualifier: null,
  },
  {
    id: 'q-pantry',
    text: "How did you first find out about your local food pantry?",
    buyer: "City of Detroit",
    buyerType: "GOVERNMENT",
    mode: "text",
    cents: 20,
    trial: false,
    feed: 'foryou',
    qualifier: null,
  },
  {
    id: 'q-landlord',
    text: "What's one thing your landlord could fix this month that would actually matter?",
    buyer: "HUD Research",
    buyerType: "GOVERNMENT",
    mode: "voice",
    cents: 75,
    trial: false,
    feed: 'foryou',
    qualifier: null,
  },
  {
    id: 'q-background',
    text: "Have you ever been turned down for a job because of a background check? What happened?",
    buyer: "UCLA Justice Lab",
    buyerType: "RESEARCH",
    mode: "voice",
    cents: 150,
    trial: true,
    feed: 'foryou',
    qualifier: null,
  },

  // ---------- Browse All (opt-in; some target a tag) ----------
  {
    id: 'q-medicaid',
    text: "If you could change one thing about renewing Medicaid, what would it be?",
    buyer: "Kaiser Family Foundation",
    buyerType: "FOUNDATION",
    mode: "voice",
    cents: 60,
    trial: false,
    feed: 'browse',
    qualifier: { tag: 'caregiver', label: 'caregiver for a family member' },
  },
  {
    id: 'q-caregiver',
    text: "Caregivers — what's the hardest part of your week?",
    buyer: "AARP",
    buyerType: "FOUNDATION",
    mode: "text",
    cents: 40,
    trial: false,
    feed: 'browse',
    qualifier: { tag: 'caregiver', label: 'a caregiver' },
  },
  {
    id: 'q-reentry',
    text: "After getting out, what was the hardest thing about finding housing?",
    buyer: "Vera Institute of Justice",
    buyerType: "RESEARCH",
    mode: "voice",
    cents: 200,
    trial: true,
    feed: 'browse',
    qualifier: { tag: 'justice-involved', label: 'justice-involved' },
  },
  {
    id: 'q-immigrant',
    text: "When did you last need a translator to deal with a public office? How did it go?",
    buyer: "MacArthur Foundation",
    buyerType: "FOUNDATION",
    mode: "voice",
    cents: 60,
    trial: false,
    feed: 'browse',
    qualifier: { tag: 'immigrant', label: 'an immigrant' },
  },
  {
    id: 'q-utility',
    text: "What did you do the last time you couldn't pay a utility bill on time?",
    buyer: "Consumer Reports",
    buyerType: "RESEARCH",
    mode: "text",
    cents: 30,
    trial: false,
    feed: 'browse',
    qualifier: null,
  },
];

// ---------- Profile schema ----------
const INCOME_BRACKETS = [
  "$20k – $30k",
  "$30k – $40k",
  "$40k – $50k",
  "$50k – $60k",
  "$60k – $70k",
  "$70k – $80k",
  "$80k – $90k",
  "$90k – $100k",
  "$100k+",
];

const FAMILY_STATUS = [
  "Yes, I have kids",
  "No kids",
];

const RACE = [
  "Black or African American",
  "Hispanic or Latino",
  "White",
  "Asian",
  "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander",
  "Middle Eastern or North African",
  "Other",
];

const GENDER = [
  "Woman", "Man", "Non-binary",
  "Self-describe", "Prefer not to say",
];

const EDUCATION_LEVELS = [
  "Less than high school",
  "High school / GED",
  "Trade or vocational",
  "Some college",
  "Associate's degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate / PhD",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "Mandarin",
  "Cantonese",
  "Arabic",
  "Russian",
  "French",
  "Haitian Creole",
  "Bengali",
  "Korean",
  "Vietnamese",
  "Tagalog",
  "Portuguese",
  "Polish",
  "Urdu",
  "American Sign Language",
  "Other",
];

const PUBLIC_BENEFITS = [
  "Affordable Connectivity Program (ACP)",
  "Affordable Housing",
  "Earned Income Tax Credit (EITC)",
  "Heating and Cooling Assistance (HEAP)",
  "HIV/AIDS Services Administration (HASA)",
  "Medicaid",
  "NYCHA",
  "Paid Family Leave",
  "SNAP, EBT",
  "Temporary Aid to Needy Families (TANF)",
  "WIC (Women, Infants & Children)",
  "SSI (Social Security Income)",
  "SSDI (Social Security Disability Insurance)",
];

// Lived-experience tags. `verify: true` = high-value, requires doc verification.
// `primary: true` = shown by default in profile; others appear under "Show more".
const LIVED_TAGS = [
  { id: 'housing-insecure', label: 'Housing insecure',       verify: false, primary: true  },
  { id: 'justice-involved', label: 'Justice-involved',       verify: true,  primary: true  },
  { id: 'immigrant',        label: 'Immigrant',              verify: false, primary: true  },
  { id: 'caregiver',        label: 'Caregiver',              verify: false, primary: true  },
  { id: 'snap',             label: 'Use SNAP / food stamps', verify: false, primary: true  },
  { id: 'medicaid',         label: 'Use Medicaid',           verify: false, primary: true  },
  { id: 'wic',              label: 'Use WIC',                verify: false, primary: false },
  { id: 'section-8',        label: 'Use Section 8 housing',  verify: true,  primary: false },
  { id: 'veteran',          label: 'Veteran',                verify: true,  primary: true  },
  { id: 'disability',       label: 'Live with a disability', verify: true,  primary: false },
  { id: 'student',          label: 'Student',                verify: false, primary: false },
  { id: 'unemployed',       label: 'Currently unemployed',   verify: false, primary: false },
  { id: 'gig-worker',       label: 'Gig / contract worker',  verify: false, primary: false },
  { id: 'rural',            label: 'Live in a rural area',   verify: false, primary: false },
  { id: 'lgbtq',            label: 'LGBTQ+',                 verify: false, primary: false },
  { id: 'first-gen',        label: 'First-gen college',      verify: false, primary: false },
  { id: 'single-parent',    label: 'Single parent',          verify: false, primary: false },
  { id: 'recovery',         label: 'In recovery',            verify: false, primary: false },
  { id: 'foster',           label: 'Foster system',          verify: true,  primary: false },
  { id: 'tribal',           label: 'Tribal community',       verify: true,  primary: false },
  { id: 'farmer',           label: 'Farmer / agricultural',  verify: false, primary: false },
  { id: 'mental-health',    label: 'Mental health condition',verify: true,  primary: false },
  { id: 'unbanked',         label: 'Unbanked / underbanked', verify: false, primary: false },
  { id: 'senior',           label: 'Senior (65+)',           verify: false, primary: false },
];

// ---------- Cashout thresholds (real payouts coming soon) ----------
const TIERS = [
  { cents: 500,  label: "Cash out at $5",  status: "coming soon" },
  { cents: 2500, label: "Cash out at $25", status: "coming soon" },
  { cents: 5000, label: "Cash out at $50", status: "coming soon" },
];

// ---------- Badges ----------
const BADGES = [
  { id: 'first',   label: "First Answer",  desc: "Answered your first question.",     unlocked: true,  num: 1 },
  { id: 'voice',   label: "Voice Pioneer", desc: "Recorded your first voice answer.", unlocked: true,  num: 2 },
  { id: 'streak3', label: "3-Day Streak",  desc: "Answered 3 days in a row.",         unlocked: true,  num: 3 },
  { id: 'ten',    label: "10 Answers",    desc: "Reach 10 answered questions.",      unlocked: false, num: 4, progress: 0.6 },
  { id: 'streak7', label: "7-Day Streak",  desc: "Answer 7 days in a row.",           unlocked: false, num: 5 },
  { id: 'verified',label: "Verified Voice",desc: "Verify one lived-experience tag.",  unlocked: false, num: 6, badge: 'coming soon' },
];

// ---------- Helpers ----------
function findQuestion(id) {
  return PULSE_QUESTIONS.find(q => q.id === id);
}

// Today + last 7 days of streak history (mock).
const STREAK_HISTORY = [
  { day: "M", answered: true },
  { day: "T", answered: true },
  { day: "W", answered: true },
  { day: "T", answered: false },
  { day: "F", answered: true },
  { day: "S", answered: true },
  { day: "S", answered: true, today: true },
];




// ===== source: 4eafac61 =====
// Pulse shared UI atoms.
// PALETTE — Rebel One design system: orange (#E8530E) is the ONLY accent.
//   The member app was originally built on money-green primary + a second warm
//   orange accent; that violates the brief's load-bearing "one accent" rule, so
//   the whole app now runs on the single brand orange. The GREEN_* / ACCENT_*
//   constant NAMES are kept (they're referenced throughout) but all now resolve
//   to the one orange family — think of GREEN_* as "primary/accent".
//   Surface: warm off-white so the app still reads friendly, not corporate-white.
//   Ink    : neutral near-blacks (no green cast). DANGER stays a functional red.
//   No second accent, no neon, no gradients. Big type, generous spacing.
// Icons: minimal outline glyphs only where mobile UX requires them (tab bar, mic, back).

// Single brand accent (primary). Names retained for the many call sites.
const GREEN        = '#E8530E'; // brand orange — primary accent
const GREEN_DARK   = '#D14A0B'; // orange hover / pressed
const GREEN_TINT   = '#FFF1E8'; // orange tint (pill / soft fill)
const GREEN_TINT_2 = '#FFE4D2'; // deeper orange tint
const GREEN_BORDER = '#F7C8A8'; // orange border
const ACCENT       = '#E8530E'; // collapsed into the one accent (was a 2nd orange)
const ACCENT_DARK  = '#D14A0B';
const ACCENT_TINT  = '#FFF1E8';
const ACCENT_BORDER= '#F7C8A8';
const INK          = '#111111'; // neutral inks — no green cast
const INK_2        = '#333333';
const INK_3        = '#555555';
const INK_4        = '#777777';
const INK_5        = '#BBBBBB';
const SURFACE      = '#FFFFFF';
const SURFACE_WARM = '#FAFAF8'; // near-neutral warm off-white
const SURFACE_TINT = '#F4F3F0';
const BORDER       = '#E6E4DE';
const BORDER_2     = '#D6D3CB';
const DANGER       = '#B23B2E'; // functional error state (not a brand accent)
const DANGER_TINT  = '#FBEAE7';

// ---------- Eyebrow chip (small uppercase tag) ----------
function Eyebrow({ children, tone = 'green', style = {} }) {
  const tones = {
    green:  { bg: GREEN_TINT,   fg: GREEN_DARK, bd: GREEN_BORDER },
    accent: { bg: ACCENT_TINT,  fg: ACCENT_DARK, bd: ACCENT_BORDER },
    gray:   { bg: SURFACE_TINT, fg: INK_3, bd: BORDER },
    ink:    { bg: INK,          fg: '#fff', bd: INK },
    line:   { bg: 'transparent',fg: INK_3, bd: BORDER_2 },
    danger: { bg: DANGER_TINT,  fg: DANGER, bd: '#F0C9C2' },
  };
  const t = tones[tone] || tones.green;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: t.bg, color: t.fg,
      border: `1px solid ${t.bd}`, borderRadius: 999,
      padding: '4px 9px',
      fontSize: 10, fontWeight: 700, letterSpacing: 0.9,
      textTransform: 'uppercase', lineHeight: 1,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// ---------- Money label (the hero "+$0.50" stamp) ----------
function MoneyStamp({ cents, size = 'lg', kind = 'pill' }) {
  if (kind === 'pill') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'baseline',
        background: GREEN, color: '#fff',
        padding: size === 'lg' ? '6px 12px' : '4px 9px',
        borderRadius: 999,
        fontWeight: 800,
        fontSize: size === 'lg' ? 18 : 14,
        letterSpacing: -0.5,
        lineHeight: 1,
      }}>{centsFmt(cents)}</div>
    );
  }
  // 'plain' — just text
  return (
    <span style={{
      color: GREEN, fontWeight: 800,
      fontSize: size === 'lg' ? 28 : 16,
      letterSpacing: -0.6, lineHeight: 1,
    }}>{centsFmt(cents)}</span>
  );
}

// ---------- Primary button ----------
function PButton({ children, onClick, kind = 'primary', size = 'lg', disabled, style = {}, type = 'button' }) {
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: 0, borderRadius: 14,
    padding: size === 'lg' ? '17px 22px' : size === 'sm' ? '10px 14px' : '13px 18px',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: size === 'lg' ? 16 : size === 'sm' ? 13 : 14,
    letterSpacing: -0.2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background .2s, transform .15s, color .2s, border-color .2s, box-shadow .2s',
    width: '100%',
    minHeight: size === 'lg' ? 58 : size === 'sm' ? 40 : 48,
    boxSizing: 'border-box',
  };
  let look;
  if (kind === 'primary') {
    look = {
      background: disabled ? '#D8D6CB' : (hover ? GREEN_DARK : GREEN),
      color: '#fff',
      transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: disabled ? 'none' : (hover ? '0 6px 18px rgba(46,125,95,0.22)' : '0 2px 6px rgba(46,125,95,0.12)'),
    };
  } else if (kind === 'outline') {
    look = {
      background: hover ? INK : SURFACE,
      color: hover ? '#fff' : INK,
      border: `1.5px solid ${hover ? INK : BORDER_2}`,
    };
  } else if (kind === 'ghost') {
    look = {
      background: hover ? SURFACE_TINT : 'transparent',
      color: INK_2,
    };
  } else if (kind === 'accent') {
    look = {
      background: hover ? ACCENT_DARK : ACCENT,
      color: '#fff',
      transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
    };
  } else if (kind === 'danger') {
    look = {
      background: hover ? DANGER : DANGER_TINT,
      color: hover ? '#fff' : DANGER,
    };
  }
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...look, ...style }}
    >{children}</button>
  );
}

// ---------- Card ----------
function PCard({ children, onClick, interactive = false, style = {}, surface = 'white' }) {
  const [hover, setHover] = React.useState(false);
  const bg = surface === 'white' ? SURFACE : surface === 'tint' ? SURFACE_TINT : SURFACE_WARM;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: bg,
        border: `1px solid ${interactive && hover ? GREEN_BORDER : BORDER}`,
        borderRadius: 16,
        boxShadow: interactive && hover ? '0 10px 28px rgba(46,125,95,0.08)' : 'none',
        transition: 'border-color .25s, box-shadow .25s, transform .15s',
        cursor: onClick ? 'pointer' : 'default',
        transform: interactive && hover ? 'translateY(-1px)' : 'translateY(0)',
        boxSizing: 'border-box',
        ...style,
      }}>
      {children}
    </div>
  );
}

// ---------- Numeral badge ----------
function NumBadge({ n, tone = 'ink', size = 36 }) {
  const isInk = tone === 'ink';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: isInk ? INK : GREEN,
      color: '#fff',
      fontWeight: 800,
      fontSize: size > 44 ? 20 : 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{n}</div>
  );
}

// ---------- Outline icons ----------
const I = {
  feed: (p)    => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7h18M3 12h18M3 17h12"/></svg>,
  wallet: (p)  => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M3 10h18M17 14h2"/></svg>,
  streak: (p)  => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3c1 3.5 5 5 5 9a5 5 0 11-10 0c0-1.5.7-2.6 1.5-3.2C9 10 9 11.5 9.5 12.5 9.5 9.5 11 6 12 3z"/></svg>,
  profile: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/></svg>,
  mic: (p)     => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>,
  back: (p)    => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 5l-7 7 7 7"/></svg>,
  close: (p)   => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  lock: (p)    => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>,
  check: (p)   => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  shield: (p)  => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>,
};

// ---------- Top bar ----------
function TopBar({ title, leading, trailing, subtitle, background = SURFACE_WARM }) {
  return (
    <div style={{
      padding: '58px 18px 16px',
      display: 'flex', flexDirection: 'column',
      gap: subtitle ? 6 : 0,
      background,
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 38,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: INK_3, minHeight: 38 }}>
          {leading}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {trailing}
        </div>
      </div>
      {title && (
        <div style={{
          fontSize: 30, fontWeight: 800,
          color: INK,
          letterSpacing: -0.8,
          marginTop: 10,
          lineHeight: 1.1,
        }}>{title}</div>
      )}
      {subtitle && (
        <div style={{ fontSize: 14, color: INK_3, marginTop: 2, lineHeight: 1.5 }}>{subtitle}</div>
      )}
    </div>
  );
}

// ---------- Pill back button ----------
function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: SURFACE, border: `1px solid ${BORDER}`,
      height: 40, padding: label ? '0 14px 0 10px' : '0', width: label ? 'auto' : 40,
      borderRadius: 999,
      cursor: 'pointer',
      color: INK,
      justifyContent: 'center',
      fontSize: 13, fontWeight: 600,
    }}>
      <I.back />
      {label && <span>{label}</span>}
    </button>
  );
}

// ---------- Tab bar ----------
function TabBar({ active, onChange, anonymous }) {
  const tabs = [
    { id: 'feed',    label: 'Answer',  Icon: I.feed },
    { id: 'wallet',  label: 'Wallet',  Icon: I.wallet },
    { id: 'streaks', label: 'Streak',  Icon: I.streak },
    { id: 'profile', label: 'You',     Icon: I.profile, dot: anonymous },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 26,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderTop: `1px solid ${BORDER}`,
      zIndex: 30,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 4px 0',
      }}>
        {tabs.map(t => {
          const on = active === t.id;
          return (
            <button key={t.id}
              onClick={() => onChange(t.id)}
              style={{
                background: 'transparent', border: 0, padding: '8px 4px 6px',
                minHeight: 56,
                color: on ? GREEN : INK_4,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                cursor: 'pointer',
                position: 'relative',
              }}>
              <t.Icon style={{ width: 24, height: 24 }} />
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
              }}>{t.label}</span>
              {t.dot && (
                <span style={{
                  position: 'absolute', top: 6, right: 'calc(50% - 18px)',
                  width: 8, height: 8, borderRadius: '50%',
                  background: ACCENT,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Question card ----------
function QuestionCard({ q, onAnswer, showQualifier = false, locked = false }) {
  const isVoice = q.mode === 'voice';
  return (
    <PCard interactive={!locked} onClick={onAnswer} style={{
      padding: 18, position: 'relative',
      opacity: locked ? 0.55 : 1,
      cursor: locked ? 'pointer' : 'pointer',
    }}>
      {locked && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(17,17,17,0.06)',
          color: INK_3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I.lock />
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 12, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <Eyebrow tone="gray">{q.buyerType}</Eyebrow>
          {q.trial && <Eyebrow tone="accent">Trial</Eyebrow>}
          {showQualifier && q.qualifier && (
            <Eyebrow tone="line">{q.qualifier.label}</Eyebrow>
          )}
        </div>
        {!locked && <MoneyStamp cents={q.cents} size="lg" kind="pill" />}
      </div>
      <div style={{
        fontSize: 18, lineHeight: 1.4, color: INK,
        fontWeight: 500,
        textWrap: 'pretty',
        letterSpacing: -0.2,
      }}>{q.text}</div>
      <div style={{
        marginTop: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: `1px solid ${BORDER}`,
        gap: 12,
      }}>
        <div style={{ fontSize: 12, color: INK_3, lineHeight: 1.5 }}>
          Paid by <span style={{ color: INK, fontWeight: 600 }}>{q.buyer}</span>
        </div>
        <Eyebrow tone={isVoice ? 'green' : 'gray'}>{isVoice ? 'Text + Voice' : 'Text'}</Eyebrow>
      </div>
    </PCard>
  );
}

// ---------- Points/money earned celebration ----------
function PointsCelebration({ cents, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200,
      animation: 'screen-flash 1.4s ease',
    }}>
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: 90, height: 90, borderRadius: '50%',
        border: `3px solid ${GREEN}`,
        transform: 'translate(-50%, -50%)',
        animation: 'confetti-ring 1.1s ease forwards',
      }} />
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: 90, height: 90, borderRadius: '50%',
        border: `2px solid ${GREEN_BORDER}`,
        transform: 'translate(-50%, -50%)',
        animation: 'confetti-ring 1.1s ease 0.15s forwards',
      }} />
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        animation: 'points-rise 1.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        color: GREEN,
        fontWeight: 900,
        fontSize: 56,
        letterSpacing: -1.5,
        textShadow: '0 6px 24px rgba(46,125,95,0.25)',
        whiteSpace: 'nowrap',
      }}>+{centsFmt(cents)}</div>
    </div>
  );
}

// ---------- RBL1 wordmark (small attribution footer) ----------
function RBL1Mark({ size = 11 }) {
  return (
    <a
      href="https://www.rbl1.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 0,
        fontSize: size, fontWeight: 800, letterSpacing: 0.5,
        color: '#1A1C3A',
        fontFamily: 'inherit',
        textDecoration: 'none',
      }}
    >
      RBL<span style={{ color: '#E8530E' }}>1</span>
    </a>
  );
}

// ---------- Progress ring ----------
function ProgressRing({ size = 120, stroke = 8, progress = 0, color = GREEN, trackColor = SURFACE_TINT, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{children}</div>
    </div>
  );
}

// ---------- Trust strip (used on landing + claim) ----------
function TrustStrip({ items, dense = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: dense ? 8 : 12,
    }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: GREEN_TINT, color: GREEN_DARK,
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1,
          }}><I.check style={{ width: 13, height: 13 }} /></div>
          <div style={{ fontSize: 14, color: INK_2, lineHeight: 1.45 }}>{t}</div>
        </div>
      ))}
    </div>
  );
}

// Aliases — keep older token names working
const SURFACE_GRAY = SURFACE_TINT;
const INK_6        = INK_5;




// ===== source: 84e79222 =====
// Feed screen — "For You" / "Browse All" tabs + question cards.

function FeedScreen({ state, navigate, openAnswer }) {
  const [tab, setTab] = React.useState('foryou');
  const list = PULSE_QUESTIONS.filter(q => tab === 'foryou' ? q.feed === 'foryou' : q.feed === 'browse');
  const visible = list.filter(q => !state.answered[q.id]);
  const todayCents = state.todayCents || 0;
  const profileReady = isProfileQualified(state);
  const browseLocked = tab === 'browse' && !profileReady;

  return (
    <div style={{ paddingBottom: 110, background: SURFACE_WARM, minHeight: '100%' }}>
      <TopBar
        background={SURFACE_WARM}
        leading={
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: GREEN, color: '#fff', fontWeight: 900,
              fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: -0.5,
            }}>L</div>
            <span style={{ fontWeight: 800, color: INK, fontSize: 17, letterSpacing: -0.3 }}>LoopedIn</span>
          </div>
        }
        trailing={
          state.streak > 0 ? (
            <button
              onClick={() => navigate('streaks')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: ACCENT_TINT, border: `1px solid ${ACCENT_BORDER}`,
                color: ACCENT_DARK, padding: '7px 12px', borderRadius: 999,
                fontSize: 12, fontWeight: 800, letterSpacing: 0.2,
                cursor: 'pointer',
                minHeight: 36,
              }}>
              <span style={{ fontSize: 15, fontWeight: 900 }}>{state.streak}</span>
              <span>day streak</span>
            </button>
          ) : null
        }
      />

      {/* Today's earnings hero — small but reassuring */}
      <div style={{ padding: '0 18px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 12, marginBottom: 4,
        }}>
          <div>
            <div style={{
              fontSize: 28, fontWeight: 800, color: INK,
              letterSpacing: -0.8, lineHeight: 1.1,
            }}>
              {todayCents > 0 ? `You earned ${centsFmt(todayCents)} today.` : "Get paid for your answers."}
            </div>
            <div style={{ fontSize: 14, color: INK_3, marginTop: 8, lineHeight: 1.5 }}>
              {visible.length > 0
                ? `${visible.length} ${visible.length === 1 ? 'question' : 'questions'} for you · about 15 seconds each`
                : "You've answered everything for today."}
            </div>
          </div>
        </div>
      </div>

      {/* Tab segmented control — sticks just below the status bar, not behind it */}
      <div style={{
        display: 'flex', gap: 8, padding: '18px 18px 14px',
        position: 'sticky', top: 62, zIndex: 4,
        background: SURFACE_WARM,
      }}>
        <SegTab active={tab === 'foryou'} onClick={() => setTab('foryou')}
          label="For You"
          count={PULSE_QUESTIONS.filter(q => q.feed === 'foryou' && !state.answered[q.id]).length} />
        <SegTab active={tab === 'browse'} onClick={() => setTab('browse')}
          label="Browse All"
          count={PULSE_QUESTIONS.filter(q => q.feed === 'browse' && !state.answered[q.id]).length} />
      </div>

      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {browseLocked && (
          <div style={{
            padding: '18px 18px',
            background: SURFACE, border: `1px solid ${BORDER_2}`, borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: ACCENT_TINT, color: ACCENT_DARK, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I.lock />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>
                Finish your profile to unlock Browse.
              </div>
              <div style={{ fontSize: 12, color: INK_4, marginTop: 4, lineHeight: 1.5 }}>
                These questions target specific lived experiences. We need a bit about you first.
              </div>
            </div>
            <button onClick={() => navigate('profile')} style={{
              background: GREEN, color: '#fff', border: 0,
              padding: '9px 14px', borderRadius: 999,
              fontWeight: 800, fontSize: 11, letterSpacing: 0.8,
              textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0,
            }}>Set up</button>
          </div>
        )}

        {tab === 'browse' && !browseLocked && (
          <div style={{
            padding: '14px 16px', background: GREEN_TINT,
            border: `1px solid ${GREEN_BORDER}`, borderRadius: 14,
            fontSize: 13, color: INK_2, lineHeight: 1.5,
          }}>
            <strong style={{ color: GREEN_DARK }}>Heads up.</strong> Browse questions target specific lived experiences. If you answer one, we'll ask if it applies — honest answers keep results trustworthy.
          </div>
        )}

        {visible.length === 0 && !browseLocked && (
          <PCard style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: INK, marginBottom: 8, letterSpacing: -0.3 }}>You're all caught up.</div>
            <div style={{ color: INK_3, fontSize: 14, lineHeight: 1.5 }}>
              New questions show up every day. Come back tomorrow to keep your streak going.
            </div>
          </PCard>
        )}

        {visible.map(q => (
          <QuestionCard
            key={q.id}
            q={q}
            showQualifier={tab === 'browse'}
            locked={browseLocked}
            onAnswer={browseLocked ? () => navigate('profile') : () => openAnswer(q.id)}
          />
        ))}

        {/* Bottom reassurance footer */}
        <div style={{
          marginTop: 8, padding: '16px 4px 4px',
          fontSize: 11, color: INK_4,
          textAlign: 'center', lineHeight: 1.5,
        }}>
          Your identity is anonymous. We never sell your name.<br/>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            Made by <RBL1Mark size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}

function SegTab({ active, onClick, label, count }) {
  return (
    <button onClick={onClick} style={{
      flex: 1,
      background: active ? INK : SURFACE,
      color: active ? '#fff' : INK_2,
      border: `1px solid ${active ? INK : BORDER}`,
      padding: '12px 14px',
      borderRadius: 12,
      cursor: 'pointer',
      fontWeight: 700, fontSize: 13, letterSpacing: -0.1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'background .2s, color .2s, border-color .2s',
      minHeight: 46,
    }}>
      {label}
      <span style={{
        background: active ? 'rgba(255,255,255,0.18)' : SURFACE_TINT,
        color: active ? '#fff' : INK_3,
        borderRadius: 999,
        fontSize: 11, padding: '2px 8px',
        fontWeight: 700, letterSpacing: 0,
        minWidth: 18, textAlign: 'center',
      }}>{count}</span>
    </button>
  );
}




// ===== source: e6fd5188 =====
// Answer screen — text input + voice recording.

function AnswerScreen({ qid, state, back, onSubmit }) {
  const q = findQuestion(qid);
  if (!q) {
    return <div style={{ padding: 80 }}>Question not found.</div>;
  }

  const [mode, setMode] = React.useState(q.mode === 'voice' ? 'choose' : 'text'); // 'choose' | 'text' | 'voice'
  const [text, setText] = React.useState('');
  const [recState, setRecState] = React.useState('idle'); // 'idle' | 'recording' | 'recorded'
  const [recTime, setRecTime] = React.useState(0);

  // record timer
  React.useEffect(() => {
    if (recState !== 'recording') return;
    const t = setInterval(() => setRecTime(r => r + 1), 1000);
    return () => clearInterval(t);
  }, [recState]);

  // Qualifier prompt — show if it's a Browse question with a qualifier and user hasn't confirmed
  const needsQualifier = q.qualifier && !state.tags.includes(q.qualifier.tag);
  const [qualConfirmed, setQualConfirmed] = React.useState(!needsQualifier);
  const [qualAnswer, setQualAnswer] = React.useState(null); // 'yes' | 'no'

  const charsLeft = 280 - text.length;
  const canSubmitText = text.trim().length >= 3 && qualConfirmed;
  const canSubmitVoice = recState === 'recorded' && qualConfirmed;
  const canSubmit = mode === 'text' ? canSubmitText : canSubmitVoice;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      qid: q.id,
      cents: q.cents,
      mode,
      text: mode === 'text' ? text.trim() : null,
      addTag: qualAnswer === 'yes' ? q.qualifier?.tag : null,
    });
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      background: SURFACE_WARM,
    }}>
      <TopBar
        background={SURFACE_WARM}
        leading={<BackButton onClick={back} />}
        trailing={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eyebrow tone="gray">{q.buyerType}</Eyebrow>
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 4,
              background: GREEN, color: '#fff',
              padding: '4px 9px', borderRadius: 999,
              fontWeight: 800, fontSize: 14, letterSpacing: -0.4, lineHeight: 1,
            }}>
              {q.cents}
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                opacity: 0.9, textTransform: 'uppercase',
              }}>pts</span>
            </div>
          </div>
        }
      />

      <div style={{ padding: '8px 18px 24px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {q.trial && <Eyebrow tone="accent">Trial · paid by LoopedIn</Eyebrow>}
          <Eyebrow tone="line">About 15 seconds</Eyebrow>
        </div>
        <div style={{
          fontSize: 24, lineHeight: 1.3, color: INK,
          fontWeight: 700, letterSpacing: -0.5,
          textWrap: 'pretty',
        }}>{q.text}</div>
        <div style={{ fontSize: 13, color: INK_3, marginTop: 12, lineHeight: 1.5 }}>
          Paid by <span style={{ color: INK_2, fontWeight: 600 }}>{q.buyer}</span>. Your answer is anonymous.
        </div>
      </div>

      {/* Qualifier prompt */}
      {needsQualifier && qualAnswer === null && (
        <div style={{ padding: '0 18px 16px' }}>
          <PCard style={{ padding: 16, background: GREEN_TINT, borderColor: GREEN_BORDER }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: GREEN_DARK, letterSpacing: 1, marginBottom: 6 }}>
              QUICK CHECK
            </div>
            <div style={{ fontSize: 15, color: INK, marginBottom: 12, lineHeight: 1.45, fontWeight: 500 }}>
              This question is for people who identify as <strong>{q.qualifier.label}</strong>. Does that describe you?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <PButton size="sm" kind="primary"
                onClick={() => { setQualAnswer('yes'); setQualConfirmed(true); }}>
                Yes, that's me
              </PButton>
              <PButton size="sm" kind="outline"
                onClick={() => { setQualAnswer('no'); setQualConfirmed(true); }}>
                No
              </PButton>
            </div>
          </PCard>
        </div>
      )}

      {qualAnswer === 'no' && (
        <div style={{ padding: '0 18px 16px' }}>
          <PCard style={{ padding: 16, background: ACCENT_TINT, borderColor: ACCENT_BORDER }}>
            <div style={{ fontSize: 14, color: INK_2, lineHeight: 1.5 }}>
              No worries — you can still answer, but we'll mark it as <strong>general perspective</strong> instead of a verified match.
            </div>
          </PCard>
        </div>
      )}

      {/* Mode chooser (for voice-enabled questions) */}
      {q.mode === 'voice' && mode === 'choose' && (
        <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ModeChoice onClick={() => setMode('voice')}
            title="Record voice"
            sub="Faster — about 15 seconds."
            tag="Recommended" />
          <ModeChoice onClick={() => setMode('text')}
            title="Type your answer"
            sub="Use the keyboard." />
        </div>
      )}

      {/* TEXT mode */}
      {mode === 'text' && (
        <div style={{ padding: '0 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {q.mode === 'voice' && (
            <button onClick={() => setMode('voice')} style={{
              background: 'transparent', border: 0, color: GREEN_DARK,
              fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 10,
              cursor: 'pointer', textAlign: 'left',
            }}>← Use voice instead</button>
          )}
          <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: 16, position: 'relative',
            minHeight: 160, flex: 1, display: 'flex', flexDirection: 'column',
          }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, 280))}
              placeholder="Type a short, honest answer. No wrong answers."
              autoFocus
              style={{
                width: '100%', border: 0, outline: 'none',
                background: 'transparent', resize: 'none',
                fontFamily: 'inherit', fontSize: 17, color: INK,
                lineHeight: 1.5, flex: 1, minHeight: 100,
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'flex-end',
              fontSize: 11, color: charsLeft < 30 ? ACCENT_DARK : INK_4,
              marginTop: 8, fontWeight: 600, letterSpacing: 0.2,
            }}>
              {charsLeft} characters left
            </div>
          </div>
        </div>
      )}

      {/* VOICE mode */}
      {mode === 'voice' && (
        <div style={{ padding: '0 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setMode('text')} style={{
            background: 'transparent', border: 0, color: GREEN_DARK,
            fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16,
            cursor: 'pointer', textAlign: 'left',
          }}>← Type instead</button>

          <VoiceRecorder
            recState={recState}
            recTime={recTime}
            onStart={() => { setRecState('recording'); setRecTime(0); }}
            onStop={() => setRecState('recorded')}
            onRestart={() => { setRecState('idle'); setRecTime(0); }}
          />
        </div>
      )}

      {/* Submit footer */}
      <div style={{
        padding: '14px 18px 24px',
        borderTop: `1px solid ${BORDER}`,
        background: SURFACE,
        position: 'sticky', bottom: 0, zIndex: 5,
      }}>
        <PButton onClick={handleSubmit} disabled={!canSubmit}>
          {canSubmit
            ? `Submit & Earn ${q.cents} pts`
            : (mode === 'text' ? 'Add a short answer' : 'Record your answer')}
        </PButton>
        <div style={{
          fontSize: 11, color: INK_4, textAlign: 'center', marginTop: 10, lineHeight: 1.5,
        }}>
          Paid to your LoopedIn wallet · You can leave anytime.
        </div>
      </div>
    </div>
  );
}

function ModeChoice({ title, sub, tag, onClick }) {
  return (
    <PCard interactive onClick={onClick} style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>{title}</div>
          <div style={{ fontSize: 13, color: INK_3, marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {tag && <Eyebrow tone="green">{tag}</Eyebrow>}
          <div style={{
            color: INK_4, fontSize: 20, fontWeight: 600,
          }}>→</div>
        </div>
      </div>
    </PCard>
  );
}

// ---------- Voice recorder (visual only — animated bars) ----------
function VoiceRecorder({ recState, recTime, onStart, onStop, onRestart }) {
  const fmtTime = (s) => `0:${s.toString().padStart(2, '0')}`;
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '12px 0 8px',
      gap: 22,
    }}>
      {/* Waveform display */}
      <Waveform active={recState === 'recording'} done={recState === 'recorded'} />

      {/* Time */}
      <div style={{
        fontSize: 28, fontWeight: 800, color: INK,
        fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
      }}>
        {fmtTime(recState === 'recording' ? recTime : (recState === 'recorded' ? recTime : 0))}
      </div>

      {/* Big mic / stop button */}
      <RecordButton state={recState} onStart={onStart} onStop={onStop} />

      <div style={{ fontSize: 13, color: INK_3, textAlign: 'center', padding: '0 20px', lineHeight: 1.5 }}>
        {recState === 'idle'      && 'Tap to start recording. Aim for about 15 seconds.'}
        {recState === 'recording' && 'Listening… speak naturally. Tap to stop.'}
        {recState === 'recorded'  && (
          <span>
            <span style={{ color: GREEN_DARK, fontWeight: 700 }}>Recording saved.</span>{' '}
            <button onClick={onRestart} style={{ background: 'transparent', border: 0, color: INK_2, textDecoration: 'underline', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Re-record</button>
          </span>
        )}
      </div>
    </div>
  );
}

function Waveform({ active, done }) {
  // 28 bars with seeded random heights
  const heights = React.useMemo(
    () => Array.from({ length: 32 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.6 + 0.5)) * 0.75),
    []
  );
  return (
    <div style={{
      width: 240, height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 4,
    }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 4,
          height: `${h * 100}%`,
          borderRadius: 2,
          background: done ? GREEN : active ? GREEN : INK_5,
          transformOrigin: 'center',
          animation: active ? `wave-bar 0.${4 + (i % 5)}s ease-in-out ${i * 30}ms infinite` : 'none',
          opacity: done ? 1 : active ? 1 : 0.7,
        }} />
      ))}
    </div>
  );
}

function RecordButton({ state, onStart, onStop }) {
  const isRec = state === 'recording';
  const isDone = state === 'recorded';
  return (
    <button
      onClick={isRec ? onStop : isDone ? null : onStart}
      style={{
        width: 96, height: 96, borderRadius: '50%',
        background: isDone ? GREEN : isRec ? DANGER : GREEN,
        color: '#fff', border: 'none', cursor: isDone ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isRec
          ? '0 0 0 12px rgba(178,59,46,0.12), 0 0 0 24px rgba(178,59,46,0.06)'
          : '0 8px 24px rgba(46,125,95,0.25)',
        transition: 'background .2s, box-shadow .2s',
      }}>
      {isDone
        ? <I.check style={{ width: 36, height: 36 }} />
        : isRec
          ? <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 6 }} />
          : <I.mic style={{ width: 38, height: 38 }} />}
    </button>
  );
}




// ===== source: 3bf62a43 =====
// Claim screen — appears after first answer, prompts for email + phone to SAVE money.

function ClaimScreen({ state, onClaim, onSkip }) {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [touchedSkip, setTouchedSkip] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const phoneFmt = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4)   return d;
    if (d.length < 7)   return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = phone.replace(/\D/g, '').length === 10;
  const canSave = emailOk && phoneOk;

  const handleSkip = () => {
    if (!touchedSkip) {
      setTouchedSkip(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onSkip();
  };

  return (
    <div style={{
      minHeight: '100%',
      background: SURFACE_WARM,
      display: 'flex', flexDirection: 'column',
    }}>
      <TopBar
        background={SURFACE_WARM}
        leading={
          <button onClick={handleSkip} style={{
            background: 'transparent', border: 0,
            color: INK_3, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', padding: 0, minHeight: 36,
          }}>Skip</button>
        }
        trailing={
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4,
            background: GREEN, color: '#fff',
            padding: '4px 9px', borderRadius: 999,
            fontWeight: 800, fontSize: 14, letterSpacing: -0.4, lineHeight: 1,
          }}>
            {state.cents}
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
              opacity: 0.9, textTransform: 'uppercase',
            }}>pts</span>
          </div>
        }
      />

      <div style={{ padding: '8px 22px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: GREEN_DARK, letterSpacing: 1, marginBottom: 8 }}>
          NICE WORK
        </div>
        <div style={{
          fontSize: 30, fontWeight: 800, color: INK,
          letterSpacing: -0.8, lineHeight: 1.1,
        }}>
          You just earned {state.cents} points.
        </div>
        <div style={{ fontSize: 15, color: INK_3, marginTop: 10, lineHeight: 1.5 }}>
          Save your wallet so you don't lose it. Convert points to cash. Just an email and phone — that's it.
        </div>

        {/* Lost-money warning — visible when user tries to skip once */}
        {touchedSkip && (
          <div className={shake ? 'pulse-shake' : ''} style={{
            marginTop: 14, padding: '12px 14px',
            background: DANGER_TINT, border: `1px solid #F0C9C2`,
            borderRadius: 12, color: DANGER, fontSize: 13, lineHeight: 1.5,
            fontWeight: 500,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{ marginTop: 1, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/>
              </svg>
            </div>
            <div>
              <strong>Your {state.cents} points will be lost if you leave without saving.</strong> Tap Skip again to leave anyway.
            </div>
          </div>
        )}

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Email" hint="So we can reach you about your wallet.">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              autoCapitalize="off"
              style={inputStyle}
            />
          </Field>
          <Field label="Phone number" hint="We'll text only about your activity.">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(phoneFmt(e.target.value))}
              placeholder="(555) 555-5555"
              inputMode="tel"
              style={inputStyle}
            />
          </Field>
        </div>

        <div style={{ marginTop: 22 }}>
          <PButton onClick={() => onClaim({ email, phone })} disabled={!canSave}>
            {canSave ? `Save my ${state.cents} points` : 'Save my wallet'}
          </PButton>
        </div>

        <div style={{ marginTop: 18, padding: '14px 16px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14 }}>
          <TrustStrip items={[
            "We never sell your name, email, or phone.",
            "You stay anonymous to question buyers.",
            "Delete your account anytime.",
          ]} dense />
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: INK_4 }}>
          Made by <RBL1Mark size={12} /> · <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy</span>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  border: `1px solid ${BORDER_2}`,
  background: SURFACE,
  borderRadius: 12,
  padding: '14px 16px',
  fontFamily: 'inherit', fontSize: 17,
  color: INK,
  outline: 'none',
  boxSizing: 'border-box',
  letterSpacing: -0.2,
};

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: INK_2, letterSpacing: -0.1 }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: INK_4, lineHeight: 1.5 }}>{hint}</span>}
    </label>
  );
}




// ===== source: 19d19bd0 =====
// Wallet + Profile screens

function WalletScreen({ state, navigate }) {
  // "Next tier" target with a graceful fallback if everything is unlocked.
  const nextTier = TIERS.find(t => t.cents > state.cents) || TIERS[TIERS.length - 1];
  const prevTierCents = (() => {
    const idx = TIERS.findIndex(t => t.cents > state.cents);
    if (idx <= 0) return 0;
    return TIERS[idx - 1].cents;
  })();
  const progress = nextTier
    ? Math.max(0, Math.min(1, (state.cents - prevTierCents) / (nextTier.cents - prevTierCents)))
    : 1;
  const toNext = Math.max(0, nextTier.cents - state.cents);

  return (
    <div style={{ paddingBottom: 110 }}>
      <TopBar
        leading={<div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>Wallet</div>}
        trailing={
          state.claimed
            ? <Eyebrow tone="green">Saved</Eyebrow>
            : <Eyebrow tone="line">In escrow</Eyebrow>
        }
      />

      {/* Hero ring */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 22,
        padding: '12px 20px 4px',
      }}>
        <ProgressRing size={132} stroke={9} progress={progress}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 32, fontWeight: 900, color: INK,
              letterSpacing: -1, lineHeight: 1,
            }}>{state.cents}</div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1.4,
              color: GREEN, textTransform: 'uppercase', marginTop: 4,
            }}>Points</div>
          </div>
        </ProgressRing>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: INK_4, textTransform: 'uppercase' }}>
            Next reward
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: INK, marginTop: 4, letterSpacing: -0.4, lineHeight: 1.15 }}>
            {nextTier.label}
          </div>
          <div style={{ fontSize: 13, color: INK_3, marginTop: 4 }}>
            {toNext} pts to go
          </div>
        </div>
      </div>

      {/* Points ↔ dollars conversion strip */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '10px 14px',
          background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`,
          borderRadius: 12, color: GREEN_DARK,
          fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
        }}>
          <span style={{ fontWeight: 800 }}>100 pts</span>
          <span style={{ opacity: 0.6 }}>=</span>
          <span style={{ fontWeight: 800 }}>$1.00</span>
          <span style={{ opacity: 0.55, fontWeight: 500 }}>· cash out at the tiers below</span>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!state.claimed && (
          <PCard style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: '#fff8f3', border: `1px solid ${GREEN_BORDER}` }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: GREEN, color: '#fff', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 18,
            }}>!</div>
            <div style={{ flex: 1, fontSize: 12, color: INK_2, lineHeight: 1.5 }}>
              <strong>Save your earnings.</strong> Add an email + phone so they stick.
            </div>
            <button onClick={() => navigate('claim')} style={{
              background: GREEN, color: '#fff', border: 0,
              padding: '8px 12px', borderRadius: 999,
              fontWeight: 700, fontSize: 11, letterSpacing: 0.8,
              textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0,
            }}>Save</button>
          </PCard>
        )}
      </div>

      <SectionTitle>Reward tiers</SectionTitle>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TIERS.map((t, i) => {
          const unlocked = state.cents >= t.cents;
          return (
            <PCard key={t.label} style={{
              padding: 16, display: 'flex', alignItems: 'center', gap: 14,
              opacity: 1,
            }}>
              <NumBadge n={i + 1} tone={unlocked ? 'green' : 'ink'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.cents} pts
                  {!unlocked && <span style={{ color: INK_5 }}><I.lock /></span>}
                </div>
                <div style={{ fontSize: 12, color: INK_4, marginTop: 2 }}>
                  Cash out for {dollarsFmt(t.cents)} · <span style={{ fontStyle: 'italic' }}>coming soon</span>
                </div>
              </div>
              {unlocked
                ? <Eyebrow tone="green">Unlocked</Eyebrow>
                : <Eyebrow tone="gray">{t.cents - state.cents >= 0 ? `${t.cents - state.cents} pts to go` : 'Soon'}</Eyebrow>
              }
            </PCard>
          );
        })}
        <div style={{
          padding: 14, background: SURFACE_GRAY,
          border: `1px solid ${BORDER}`, borderRadius: 10,
          fontSize: 12, color: INK_4, lineHeight: 1.55,
        }}>
          <strong style={{ color: INK_2 }}>Heads up.</strong> LoopedIn is new. Earnings are held safely in your wallet — actual cash-out is coming soon. We'll let you know the moment it's live.
        </div>
      </div>

      <SectionTitle>Recent activity</SectionTitle>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {state.history.length === 0 && (
          <PCard style={{ padding: 16, fontSize: 13, color: INK_4 }}>
            Your answers will show up here.
          </PCard>
        )}
        {state.history.map((h, i) => {
          const q = findQuestion(h.qid);
          return (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '14px 0',
              borderBottom: i === state.history.length - 1 ? 'none' : `1px solid ${BORDER}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: INK, fontWeight: 500, lineHeight: 1.4, textWrap: 'pretty' }}>{q?.text}</div>
                <div style={{ fontSize: 11, color: INK_5, marginTop: 4, letterSpacing: 0.3 }}>
                  {h.mode === 'voice' ? 'Voice' : 'Text'} · {q?.buyer}
                </div>
              </div>
              <div style={{ color: GREEN, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                +{centsFmt(h.cents)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      padding: '24px 20px 10px',
      fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
      color: INK_4, textTransform: 'uppercase',
    }}>{children}</div>
  );
}

// -------------------------------------------------------------------
// PROFILE / QUALIFIERS

function ProfileScreen({ state, navigate, onUpdate }) {
  const p = state.profile;
  const completion = computeCompletion(p);
  const [addressOpen, setAddressOpen] = React.useState(false);
  const [yearOpen, setYearOpen] = React.useState(false);
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [showAllTags, setShowAllTags] = React.useState(false);

  // Display value for the address row.
  const addressDisplay = (() => {
    const a = p.address;
    if (!a || !a.zip) return null;
    const parts = [a.city, a.state].filter(Boolean).join(', ');
    return parts ? `${parts} ${a.zip}` : a.zip;
  })();

  // Compact summary string for an array-valued field.
  const fmtMulti = (arr) => {
    if (!arr || arr.length === 0) return null;
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(', ');
    return `${arr[0]} +${arr.length - 1} more`;
  };

  const raceDisplay = fmtMulti(Array.isArray(p.race) ? p.race : (p.race ? [p.race] : []));
  const languagesDisplay = fmtMulti(p.languages);
  const benefitsDisplay = fmtMulti(p.benefits);
  const notesDisplay = p.notes && p.notes.trim()
    ? (p.notes.length > 36 ? p.notes.slice(0, 36).trim() + '…' : p.notes)
    : null;

  // Lived-experience tag list — primary by default, with a "show more" reveal.
  const visibleTags = LIVED_TAGS.filter(t => showAllTags || t.primary || p.tags.includes(t.id));
  const hiddenCount = LIVED_TAGS.length - visibleTags.length;

  return (
    <div style={{ paddingBottom: 110 }}>
      <TopBar
        leading={<div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>Profile</div>}
        trailing={<Eyebrow tone="gray">Anonymous</Eyebrow>}
      />

      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: -0.4, textWrap: 'balance' }}>
          More about you = better questions.
        </div>
        <div style={{ fontSize: 13, color: INK_4, marginTop: 8, lineHeight: 1.55 }}>
          Everything below is optional. We only use it to match you to questions you're paid more to answer. You can change or delete any of it.
        </div>

        {/* Completion */}
        <div style={{
          marginTop: 16, padding: 14,
          background: SURFACE_GRAY, border: `1px solid ${BORDER}`,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <ProgressRing size={56} stroke={5} progress={completion}>
            <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{Math.round(completion * 100)}%</div>
          </ProgressRing>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Profile {Math.round(completion * 100)}% complete</div>
            <div style={{ fontSize: 11, color: INK_4, marginTop: 2 }}>
              Earns an average of <strong style={{ color: GREEN }}>+30 pts</strong> more per question.
            </div>
          </div>
        </div>
      </div>

      <SectionTitle>Basics</SectionTitle>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ProfileRow
          label="Birth year"
          value={p.birthYear || "Add"}
          dim={!p.birthYear}
          onClick={() => setYearOpen(true)}
        />
        <ProfileRow
          label="Income bracket"
          value={p.income || "Add"}
          dim={!p.income}
          onClick={() => onUpdate({ openPicker: { field: 'income', options: INCOME_BRACKETS, title: 'Annual household income' }})}
        />
        <ProfileRow
          label="Address"
          value={addressDisplay || "Add"}
          dim={!addressDisplay}
          onClick={() => setAddressOpen(true)}
        />
        <ProfileRow
          label="Family status"
          value={p.family || "Add"}
          dim={!p.family}
          onClick={() => onUpdate({ openPicker: { field: 'family', options: FAMILY_STATUS, title: 'Do you have kids?' }})}
        />
        <ProfileRow
          label="Race / ethnicity"
          value={raceDisplay || "Add"}
          dim={!raceDisplay}
          onClick={() => onUpdate({ openPicker: { field: 'race', options: RACE, title: 'Race or ethnicity', multi: true }})}
        />
        <ProfileRow
          label="Gender"
          value={p.gender || "Add"}
          dim={!p.gender}
          onClick={() => onUpdate({ openPicker: { field: 'gender', options: GENDER, title: 'Gender' }})}
        />
        <ProfileRow
          label="Education"
          value={p.education || "Add"}
          dim={!p.education}
          onClick={() => onUpdate({ openPicker: { field: 'education', options: EDUCATION_LEVELS, title: 'Highest education completed' }})}
        />
        <ProfileRow
          label="Languages"
          value={languagesDisplay || "Add"}
          dim={!languagesDisplay}
          onClick={() => onUpdate({ openPicker: { field: 'languages', options: LANGUAGES, title: 'Languages you speak', multi: true }})}
        />
      </div>

      <SectionTitle>Public benefits</SectionTitle>
      <div style={{ padding: '0 20px 6px', fontSize: 12, color: INK_4, lineHeight: 1.5, marginTop: -6, marginBottom: 8 }}>
        Any programs you're currently enrolled in. Optional — used only to match you to relevant questions.
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ProfileRow
          label="Benefits enrolled in"
          value={benefitsDisplay || "Add"}
          dim={!benefitsDisplay}
          onClick={() => onUpdate({ openPicker: { field: 'benefits', options: PUBLIC_BENEFITS, title: 'Public benefits', multi: true }})}
        />
      </div>

      <SectionTitle>Direct outreach</SectionTitle>
      <div style={{ padding: '0 20px 6px', fontSize: 12, color: INK_4, lineHeight: 1.5, marginTop: -6, marginBottom: 8 }}>
        Optional. Higher-paying buyers sometimes pay for a 30–60 minute one-on-one interview.
      </div>
      <div style={{ padding: '0 20px' }}>
        <ToggleRow
          label="Open to 1-on-1 interviews"
          sub="We'll only reach out for paid interviews you can decline anytime."
          value={!!p.openToInterviews}
          onChange={(v) => onUpdate({ profile: { ...p, openToInterviews: v } })}
        />
      </div>

      <SectionTitle>Lived experience</SectionTitle>
      <div style={{ padding: '0 20px 6px', fontSize: 12, color: INK_4, lineHeight: 1.5, marginTop: -6, marginBottom: 8 }}>
        Tap any tag that applies. Some unlock higher-paying questions when verified.
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {visibleTags.map(t => {
          const on = p.tags.includes(t.id);
          const verified = (p.verifiedTags || []).includes(t.id);
          return (
            <button key={t.id}
              onClick={() => {
                const next = on ? p.tags.filter(x => x !== t.id) : [...p.tags, t.id];
                onUpdate({ profile: { ...p, tags: next } });
              }}
              style={{
                border: `1px solid ${on ? GREEN : BORDER}`,
                background: on ? GREEN_TINT : '#fff',
                color: on ? GREEN : INK_2,
                padding: '10px 12px',
                borderRadius: 10,
                fontWeight: 600, fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .15s',
                minHeight: 40,
              }}>
              {on && <I.check />}
              <span>{t.label}</span>
              {t.verify && (
                <span style={{
                  fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase',
                  fontWeight: 700,
                  color: verified ? GREEN : INK_4,
                  background: verified ? GREEN_TINT : '#f0f0f0',
                  border: `1px solid ${verified ? GREEN_BORDER : '#e3e3e3'}`,
                  padding: '2px 5px', borderRadius: 4,
                }}>
                  {verified ? 'Verified' : 'Verify +'}
                </span>
              )}
            </button>
          );
        })}
        {(hiddenCount > 0 || showAllTags) && (
          <button
            onClick={() => setShowAllTags(v => !v)}
            style={{
              border: `1px dashed ${BORDER_2}`,
              background: 'transparent',
              color: INK_2,
              padding: '10px 12px',
              borderRadius: 10,
              fontWeight: 700, fontSize: 13, letterSpacing: -0.1,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 40,
            }}>
            {showAllTags ? 'Show fewer' : `Show ${hiddenCount} more →`}
          </button>
        )}
      </div>

      {/* High-value verify CTA */}
      <div style={{ padding: '20px 20px 0' }}>
        <PCard style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Eyebrow tone="green">Coming soon</Eyebrow>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>
            Verify with a document to unlock high-value questions.
          </div>
          <div style={{ fontSize: 12, color: INK_4, marginTop: 6, lineHeight: 1.5 }}>
            We'll let you upload one document (an ID, a benefits letter, anything) to verify tags like
            "veteran" or "Section 8". Verified tags earn 2–3× more per answer.
          </div>
          <div style={{ marginTop: 12 }}>
            <PButton kind="outline" size="sm" disabled>Notify me when ready</PButton>
          </div>
        </PCard>
      </div>

      <SectionTitle>Account</SectionTitle>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ProfileRow
          label="Anything else"
          value={notesDisplay || "Add a note"}
          dim={!notesDisplay}
          onClick={() => setNotesOpen(true)}
        />
        <ProfileRow
          label="Email"
          value={state.email || "Not saved yet"}
          dim={!state.email}
          onClick={state.email ? null : () => navigate('claim')}
          cta={state.email ? null : "Save earnings →"}
        />
        <ProfileRow
          label="Phone"
          value={state.phone || "Not saved yet"}
          dim={!state.phone}
          onClick={state.phone ? null : () => navigate('claim')}
          cta={state.phone ? null : "Save earnings →"}
        />
      </div>

      {/* Brand footer */}
      <div style={{
        textAlign: 'center', padding: '32px 20px 0',
        fontSize: 11, color: INK_5, letterSpacing: 0.3,
      }}>
        Made by <RBL1Mark size={11} /> · For builders + their communities.
      </div>

      {addressOpen && (
        <AddressSheet
          value={p.address}
          onSave={(addr) => {
            // Store full address AND surface zip at the top level for filtering.
            onUpdate({ profile: { ...p, address: addr, zip: addr.zip } });
            setAddressOpen(false);
          }}
          onClose={() => setAddressOpen(false)}
        />
      )}
      {yearOpen && (
        <BirthYearSheet
          value={p.birthYear}
          onSave={(y) => { onUpdate({ profile: { ...p, birthYear: y } }); setYearOpen(false); }}
          onClose={() => setYearOpen(false)}
        />
      )}
      {notesOpen && (
        <NotesSheet
          value={p.notes}
          onSave={(t) => { onUpdate({ profile: { ...p, notes: t } }); setNotesOpen(false); }}
          onClose={() => setNotesOpen(false)}
        />
      )}
    </div>
  );
}

// Switch-style row — used for boolean preferences (e.g. 1-on-1 interview opt-in).
function ToggleRow({ label, sub, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: '100%', textAlign: 'left',
      background: '#fff', border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: '14px 14px',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: 'inherit',
      minHeight: 44,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: INK_4, marginTop: 4, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      <div style={{
        width: 44, height: 26, borderRadius: 999,
        background: value ? GREEN : '#e5e5e5',
        position: 'relative', flexShrink: 0,
        transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
          transition: 'left .2s',
        }} />
      </div>
    </button>
  );
}

function ProfileRow({ label, value, onClick, cta, dim }) {
  return (
    <button onClick={onClick || undefined} style={{
      width: '100%', textAlign: 'left',
      background: '#fff', border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: '14px 14px',
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'inherit',
      minHeight: 44,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: INK_4, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 14, color: dim ? INK_5 : INK, marginTop: 2, fontWeight: 500 }}>{value}</div>
      </div>
      {cta && <span style={{ color: GREEN, fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>{cta}</span>}
      {onClick && !cta && <span style={{ color: INK_5, fontSize: 18 }}>→</span>}
    </button>
  );
}

function computeCompletion(p) {
  // A field counts as "filled" if it has any truthy value; arrays count when non-empty.
  const has = (v) => Array.isArray(v) ? v.length > 0 : Boolean(v);
  const fields = [
    p.birthYear, p.income, p.zip, p.family,
    p.race, p.gender, p.education, p.languages,
  ];
  const filled = fields.filter(has).length;
  const tagBonus = Math.min(p.tags.length, 3) / 3; // up to 3 tags counts
  return (filled / fields.length) * 0.7 + tagBonus * 0.3;
}

// Did the user fill out the minimum profile needed to unlock browse-all questions?
// We require the few fields used by buyers to filter audiences.
function isProfileQualified(state) {
  const p = state.profile || {};
  return Boolean(p.income && p.zip && p.family);
}

// Generic option picker sheet — single (radio) or multi-select.
function PickerSheet({ title, options, value, onPick, onClose, multi = false }) {
  // Track multi-select state locally so we don't re-render the whole app on every tap.
  const [draft, setDraft] = React.useState(() => Array.isArray(value) ? value : (value ? [value] : []));
  const isSelected = (opt) => multi ? draft.includes(opt) : value === opt;
  const toggle = (opt) => {
    if (multi) {
      setDraft(d => d.includes(opt) ? d.filter(x => x !== opt) : [...d, opt]);
    } else {
      onPick(opt);
    }
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(17,17,17,0.4)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fade-in .2s ease',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        width: '100%',
        padding: '20px 20px 24px',
        animation: 'sheet-in .25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        maxHeight: '82%',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 40, height: 4, background: '#e3e3e3', borderRadius: 2,
          margin: '0 auto 14px',
        }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, gap: 12,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3 }}>{title}</div>
          {multi && (
            <span style={{ fontSize: 11, fontWeight: 700, color: INK_4, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Choose all that apply
            </span>
          )}
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          overflowY: 'auto', flex: 1, paddingBottom: 8, minHeight: 0,
        }}>
          {options.map(opt => {
            const on = isSelected(opt);
            return (
              <button key={opt} onClick={() => toggle(opt)} style={{
                textAlign: 'left',
                border: `1px solid ${on ? GREEN : BORDER}`,
                background: on ? GREEN_TINT : '#fff',
                color: on ? GREEN : INK,
                padding: '13px 14px',
                borderRadius: 10,
                fontFamily: 'inherit', fontSize: 14, fontWeight: on ? 700 : 500,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                minHeight: 44, flexShrink: 0,
              }}>
                <span>{opt}</span>
                {on && <I.check />}
              </button>
            );
          })}
        </div>
        {multi && (
          <div style={{ paddingTop: 14, display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, background: '#fff', border: `1px solid ${BORDER_2}`,
              color: INK_2, padding: '14px', borderRadius: 12,
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}>Cancel</button>
            <PButton onClick={() => onPick(draft)} style={{ flex: 2 }}>
              Save{draft.length > 0 ? ` (${draft.length})` : ''}
            </PButton>
          </div>
        )}
      </div>
    </div>
  );
}

// Address entry sheet — collects full address but our DB only filters on ZIP.
function AddressSheet({ value, onSave, onClose }) {
  const init = value || { street: '', unit: '', city: '', state: '', zip: '' };
  const [a, setA] = React.useState(init);
  const zipOk = /^\d{5}$/.test(a.zip);
  const canSave = zipOk && a.street.trim() && a.city.trim() && a.state.trim();

  const field = (key, label, props = {}) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: INK_4, textTransform: 'uppercase' }}>{label}</span>
      <input
        value={a[key]}
        onChange={e => setA(s => ({ ...s, [key]: e.target.value }))}
        style={{
          border: `1px solid ${BORDER_2}`, background: '#fff',
          borderRadius: 10, padding: '11px 12px',
          fontFamily: 'inherit', fontSize: 15, color: INK,
          outline: 'none', boxSizing: 'border-box',
        }}
        {...props}
      />
    </label>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(17,17,17,0.4)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fade-in .2s ease',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        width: '100%',
        padding: '20px 20px 28px',
        animation: 'sheet-in .25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        maxHeight: '88%', overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 40, height: 4, background: '#e3e3e3', borderRadius: 2,
          margin: '0 auto 14px',
        }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3 }}>Your address</div>
        <div style={{ fontSize: 12, color: INK_4, marginTop: 4, lineHeight: 1.5 }}>
          Only your ZIP is shared with buyers — used to match you to questions in your region.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {field('street', 'Street', { placeholder: '123 Main St', autoComplete: 'address-line1' })}
          {field('unit', 'Apt / Unit (optional)', { placeholder: 'Apt 4B', autoComplete: 'address-line2' })}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            {field('city', 'City', { placeholder: 'Detroit', autoComplete: 'address-level2' })}
            {field('state', 'State', { placeholder: 'MI', autoComplete: 'address-level1', maxLength: 2,
              onChange: e => setA(s => ({ ...s, state: e.target.value.toUpperCase().slice(0, 2) })) })}
          </div>
          {field('zip', 'ZIP code', {
            placeholder: '48201', inputMode: 'numeric', maxLength: 5,
            onChange: e => setA(s => ({ ...s, zip: e.target.value.replace(/\D/g, '').slice(0, 5) })),
          })}
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, background: '#fff', border: `1px solid ${BORDER_2}`,
            color: INK_2, padding: '14px', borderRadius: 12,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
          }}>Cancel</button>
          <PButton onClick={() => onSave(a)} disabled={!canSave} style={{ flex: 2 }}>
            Save address
          </PButton>
        </div>
      </div>
    </div>
  );
}

// Birth-year input — 4-digit numeric entry with an 18+ age gate.
function BirthYearSheet({ value, onSave, onClose }) {
  const currentYear = new Date().getFullYear();
  const [text, setText] = React.useState(value ? String(value) : '');

  const parsed = parseInt(text, 10);
  const isComplete = /^\d{4}$/.test(text);
  const inRange = isComplete && parsed >= currentYear - 120 && parsed <= currentYear;
  const age = isComplete && inRange ? currentYear - parsed : null;
  const underAge = age !== null && age < 18;
  const canSave = isComplete && inRange && !underAge;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(17,17,17,0.4)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fade-in .2s ease',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        width: '100%',
        padding: '20px 20px 24px',
        animation: 'sheet-in .25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 40, height: 4, background: '#e3e3e3', borderRadius: 2,
          margin: '0 auto 14px',
        }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3 }}>Birth year</div>
        <div style={{ fontSize: 12, color: INK_4, marginTop: 4, lineHeight: 1.5, marginBottom: 16 }}>
          We share your age range with buyers, not your exact birth year. You must be 18+ to use LoopedIn.
        </div>
        <input
          value={text}
          onChange={e => setText(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="YYYY"
          inputMode="numeric"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1.5px solid ${underAge ? DANGER : (canSave ? GREEN : BORDER_2)}`,
            background: '#fff',
            borderRadius: 12, padding: '16px 18px',
            fontFamily: 'inherit', fontSize: 28, fontWeight: 700, color: INK,
            outline: 'none', letterSpacing: 2,
            fontVariantNumeric: 'tabular-nums', textAlign: 'center',
          }}
        />

        {/* Live age preview */}
        <div style={{
          minHeight: 22, marginTop: 10, fontSize: 13, lineHeight: 1.4,
          color: underAge ? DANGER : (canSave ? GREEN_DARK : INK_4),
          fontWeight: 600, textAlign: 'center',
        }}>
          {!isComplete && 'Enter your 4-digit birth year.'}
          {isComplete && !inRange && 'That doesn’t look like a valid year.'}
          {canSave && `You’ll be ${age} this year.`}
          {underAge && `You’re ${age} — you must be 18+ to use LoopedIn.`}
        </div>

        {underAge && (
          <div style={{
            marginTop: 12, padding: '12px 14px',
            background: DANGER_TINT, border: `1px solid #F0C9C2`,
            borderRadius: 12, color: DANGER, fontSize: 12, lineHeight: 1.5,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{ marginTop: 1, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/>
              </svg>
            </div>
            <div>
              <strong>You can’t use LoopedIn yet.</strong> Come back when you turn 18 — we’ll keep a place for your voice.
            </div>
          </div>
        )}

        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, background: '#fff', border: `1px solid ${BORDER_2}`,
            color: INK_2, padding: '14px', borderRadius: 12,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
          }}>Cancel</button>
          <PButton onClick={() => onSave(parsed)} disabled={!canSave} style={{ flex: 2 }}>
            Save
          </PButton>
        </div>
      </div>
    </div>
  );
}

// Freeform notes sheet — anything else the user wants buyers to know.
function NotesSheet({ value, onSave, onClose }) {
  const [text, setText] = React.useState(value || '');
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(17,17,17,0.4)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fade-in .2s ease',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        width: '100%',
        padding: '20px 20px 24px',
        animation: 'sheet-in .25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 40, height: 4, background: '#e3e3e3', borderRadius: 2,
          margin: '0 auto 14px',
        }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3 }}>Anything else</div>
        <div style={{ fontSize: 12, color: INK_4, marginTop: 4, lineHeight: 1.5, marginBottom: 14 }}>
          Optional. Anything about you that helps buyers ask better questions — your work, your community, something you care about.
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, 500))}
          placeholder="e.g. I'm a single mom in Detroit working two part-time jobs."
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1px solid ${BORDER_2}`, background: '#fff',
            borderRadius: 12, padding: '12px 14px',
            fontFamily: 'inherit', fontSize: 15, lineHeight: 1.5, color: INK,
            outline: 'none', resize: 'vertical', minHeight: 130,
          }}
        />
        <div style={{
          fontSize: 11, color: INK_5, marginTop: 6, fontWeight: 600,
          textAlign: 'right', letterSpacing: 0.2,
        }}>{500 - text.length} characters left</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, background: '#fff', border: `1px solid ${BORDER_2}`,
            color: INK_2, padding: '14px', borderRadius: 12,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
          }}>Cancel</button>
          <PButton onClick={() => onSave(text.trim())} style={{ flex: 2 }}>
            Save note
          </PButton>
        </div>
      </div>
    </div>
  );
}




// ===== source: 7e84584c =====
// Streaks + badges screen

function StreaksScreen({ state, navigate }) {
  const ringProgress = Math.min(1, state.streak / 7);

  return (
    <div style={{ paddingBottom: 110 }}>
      <TopBar
        leading={<div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>Streaks & Badges</div>}
      />

      {/* Hero flame card */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          background: '#111', color: '#fff',
          borderRadius: 16, padding: '22px 20px',
          display: 'flex', alignItems: 'center', gap: 18,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* glow */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-15%',
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,83,14,0.5) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <ProgressRing size={104} stroke={7} progress={ringProgress} color={GREEN} trackColor="#2a2a2a">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: -1 }}>{state.streak}</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.4, color: '#bbb', textTransform: 'uppercase', marginTop: 3 }}>Day Streak</div>
            </div>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#ff9d6c', textTransform: 'uppercase' }}>
              {state.streak >= 7 ? 'Streak master' : 'Keep going'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, letterSpacing: -0.3, lineHeight: 1.2, textWrap: 'balance' }}>
              {state.streak >= 7 ? "A full week. Strong." : `${7 - state.streak} more days to a full week.`}
            </div>
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 6, lineHeight: 1.45 }}>
              Answer one question a day to keep your streak alive.
            </div>
          </div>
        </div>
      </div>

      {/* Day dots */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6, padding: '14px 4px',
          border: `1px solid ${BORDER}`, borderRadius: 12,
          background: SURFACE_GRAY,
        }}>
          {STREAK_HISTORY.map((d, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                color: d.today ? GREEN : INK_4,
              }}>{d.day}</div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: d.answered ? GREEN : '#fff',
                border: `2px solid ${d.answered ? GREEN : (d.today ? GREEN : '#e3e3e3')}`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
              }}>
                {d.answered ? <I.check /> : (d.today ? <span style={{ color: GREEN, fontSize: 9, letterSpacing: 0.6 }}>NOW</span> : null)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Badges</SectionTitle>
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {BADGES.map(b => (
          <div key={b.id} style={{
            background: b.unlocked ? '#fff' : SURFACE_GRAY,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 14,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            opacity: b.unlocked ? 1 : 0.85,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: b.unlocked ? GREEN : '#e3e3e3',
              color: '#fff', fontWeight: 800,
              fontSize: 17,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {b.num}
              {!b.unlocked && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', border: `1px solid ${BORDER}`,
                  color: INK_4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <I.lock />
                </div>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>
              {b.label}
            </div>
            <div style={{ fontSize: 11, color: INK_4, lineHeight: 1.45, minHeight: 28 }}>
              {b.desc}
            </div>
            {b.progress !== undefined && !b.unlocked && (
              <div style={{ width: '100%', height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                <div style={{ width: `${b.progress * 100}%`, height: '100%', background: GREEN }} />
              </div>
            )}
            {b.badge && (
              <Eyebrow tone="gray" style={{ marginTop: 2 }}>{b.badge}</Eyebrow>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}




// ===== source: 2f345295 =====
// Onboarding — the "first question" anonymous entry.
// Story-style card stack: swipe through, answer one to start.

// Local pts pill — onboarding hides cash values behind a points abstraction.
function PointsStamp({ points }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 4,
      background: GREEN, color: '#fff',
      padding: '6px 12px',
      borderRadius: 999,
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: -0.4,
      lineHeight: 1,
    }}>
      {points}
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
        opacity: 0.9, textTransform: 'uppercase',
      }}>pts</span>
    </div>
  );
}

function OnboardingScreen({ navigate, onPickFirst }) {
  const featured = PULSE_QUESTIONS.filter(q => q.feed === 'foryou').slice(0, 3);
  const [topIdx, setTopIdx] = React.useState(0);
  const [exiting, setExiting] = React.useState(null); // 'left' | 'right' | null

  function pass() {
    setExiting('left');
    setTimeout(() => {
      setTopIdx(i => (i + 1) % featured.length);
      setExiting(null);
    }, 280);
  }
  function answer() {
    setExiting('right');
    setTimeout(() => onPickFirst(featured[topIdx].id), 200);
  }

  const top = featured[topIdx];
  const next = featured[(topIdx + 1) % featured.length];
  const next2 = featured[(topIdx + 2) % featured.length];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: SURFACE_WARM,
    }}>
      <TopBar
        leading={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: GREEN, color: '#fff', fontWeight: 900,
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: -0.5,
            }}>L</div>
            <span style={{ fontWeight: 800, color: INK, fontSize: 16, letterSpacing: -0.3 }}>LoopedIn</span>
          </div>
        }
        trailing={<Eyebrow tone="line">Anonymous</Eyebrow>}
      />

      <div style={{ padding: '0 22px 8px' }}>
        <div style={{
          fontSize: 30, fontWeight: 800, color: INK,
          letterSpacing: -0.8, lineHeight: 1.1, textWrap: 'balance',
        }}>
          Answer a question.<br/>
          Share your voice.<br/>
          <span style={{ color: GREEN }}>Earn cash &amp; rewards.</span>
        </div>
        <div style={{ fontSize: 14, color: INK_3, marginTop: 10, lineHeight: 1.55 }}>
          About 15 seconds. Type or talk. No signup to start — we'll ask if you want to save your earnings after.
        </div>
      </div>

      {/* Card stack */}
      <div style={{
        position: 'relative',
        margin: '16px 22px 8px',
        flex: 1,
        minHeight: 300,
      }}>
        <StackCard q={next2} depth={2} />
        <StackCard q={next}  depth={1} />
        <StackCard q={top}   depth={0} exiting={exiting} />
      </div>

      {/* Action buttons */}
      <div style={{
        padding: '8px 22px 28px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={pass} style={{
            flex: 1, minHeight: 58,
            background: SURFACE, border: `1.5px solid ${BORDER_2}`,
            color: INK_2, borderRadius: 14,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 14, letterSpacing: -0.1,
            cursor: 'pointer',
          }}>Skip</button>
          <PButton onClick={answer} style={{ flex: 2 }}>
            Answer & Earn {top?.cents || 0} pts
          </PButton>
        </div>
        <div style={{
          textAlign: 'center', fontSize: 12, color: INK_4, letterSpacing: 0.1,
          paddingTop: 2,
        }}>
          Made by <RBL1Mark size={11} /> · Your identity is anonymous.
        </div>
      </div>
    </div>
  );
}

function StackCard({ q, depth, exiting }) {
  if (!q) return null;
  const scale = 1 - depth * 0.04;
  const ty = depth * 10;
  const z = 10 - depth;
  const op = depth === 0 ? 1 : (depth === 1 ? 0.7 : 0.4);

  let animation = 'none';
  if (depth === 0 && exiting === 'left')  animation = 'card-exit-left .3s ease forwards';
  if (depth === 0 && exiting === 'right') animation = 'card-exit-right .25s ease forwards';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateY(${ty}px) scale(${scale})`,
      opacity: op,
      zIndex: z,
      pointerEvents: depth === 0 ? 'auto' : 'none',
      animation: depth === 0 ? animation : 'none',
    }}>
      <div style={{
        background: depth === 0 ? SURFACE : SURFACE_TINT,
        border: `1px solid ${depth === 0 ? BORDER_2 : BORDER}`,
        borderRadius: 18,
        padding: 22,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        boxShadow: depth === 0 ? '0 12px 36px rgba(26,42,32,0.06)' : 'none',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Eyebrow tone="gray">{q.buyerType}</Eyebrow>
            {q.trial && <Eyebrow tone="accent">Trial</Eyebrow>}
          </div>
          <PointsStamp points={q.cents} />
        </div>
        <div style={{
          fontSize: 22, fontWeight: 700, color: INK,
          letterSpacing: -0.4, lineHeight: 1.3, textWrap: 'balance',
          flex: 1,
        }}>{q.text}</div>
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 14, borderTop: `1px solid ${BORDER}`,
        }}>
          <div style={{ fontSize: 12, color: INK_3 }}>
            Paid by <span style={{ color: INK, fontWeight: 600 }}>{q.buyer}</span>
          </div>
          <Eyebrow tone={q.mode === 'voice' ? 'green' : 'gray'}>
            {q.mode === 'voice' ? 'Text + Voice' : 'Text'}
          </Eyebrow>
        </div>
      </div>
    </div>
  );
}




// ===== source: 25602658 =====
// Pulse — orchestrator. Owns app state, screen routing, modals, points animation.

const STORAGE_KEY = 'pulse-respondent-state-v1';

const INITIAL_STATE = {
  screen: 'onboarding',       // onboarding | feed | answer | claim | wallet | profile | streaks
  qid: null,                  // active question id when on 'answer'

  // Identity (only after claiming)
  email: null,
  phone: null,
  claimed: false,             // has the user saved their points / identity?

  // Wallet (cents)
  cents: 0,
  pendingCents: 0,            // cents in escrow until the user claims
  history: [],                // [{qid, cents, mode, ts}]
  answered: {},               // { [qid]: true }

  // First-answer flow
  hasAnsweredOnce: false,
  lastAnsweredId: null,

  // Profile
  profile: {
    income: null, zip: null, family: null, race: [], gender: null,
    address: null,        // { street, unit, city, state, zip }
    education: null,
    languages: [],        // multi
    benefits: [],         // multi (public benefits)
    birthYear: null,
    notes: '',            // freeform "anything else"
    openToInterviews: false,
    tags: [], verifiedTags: [],
  },

  // Tags the user confirmed for browse questions
  qualifiedFor: {},

  // Engagement
  streak: 7,                  // start the demo with a streak so the streak screen has content
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch (e) { return INITIAL_STATE; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function PulseApp() {
  const [state, setState] = React.useState(loadState);

  // Celebration overlay (points earned)
  const [celebration, setCelebration] = React.useState(null); // {points} | null

  // Picker sheet (profile field picker)
  const [picker, setPicker] = React.useState(null); // { field, options, title } | null

  React.useEffect(() => { saveState(state); }, [state]);

  function navigate(target) {
    if (typeof target === 'string') {
      setState(s => ({ ...s, screen: target, qid: null }));
    } else {
      setState(s => ({ ...s, ...target }));
    }
  }

  function onAnswered({ qid, cents, mode, text, addTag, qualifies, tag }) {
    // Persist the answer if the member has claimed (has a token). Pre-claim
    // answers are held client-side and replayed to the server on claim.
    if (getToken('member')) {
      memberApi.answer(qid, text ?? null, mode).catch(() => {});
    }
    const usedTag = addTag || tag;
    const newAnswered = { ...state.answered, [qid]: true };
    const newQualified = usedTag && qualifies
      ? { ...state.qualifiedFor, [usedTag]: true }
      : state.qualifiedFor;
    const history = [{ qid, cents, mode, ts: Date.now() }, ...state.history];
    const firstAnswer = !state.hasAnsweredOnce;

    setState(s => ({
      ...s,
      answered: newAnswered,
      qualifiedFor: newQualified,
      history,
      hasAnsweredOnce: true,
      lastAnsweredId: qid,
      lastAnsweredFromFeed: true,
      pendingCents: s.pendingCents + cents,
      cents: s.cents + cents,
    }));

    setCelebration({ cents });
    setTimeout(() => {
      setCelebration(null);
      // First answer → claim screen. Otherwise → back to feed.
      setState(s => ({
        ...s,
        screen: firstAnswer ? 'claim' : 'feed',
        qid: null,
      }));
    }, 1300);
  }

  async function onClaim({ email, phone }) {
    // Optimistically move to the wallet, then register with the backend and
    // replay any answers earned before claiming.
    setState(s => ({ ...s, email, phone, claimed: true, pendingCents: 0, screen: 'wallet' }));
    try {
      const { token } = await memberApi.register(email, phone);
      setToken('member', token);
      // Replay locally-recorded answers (server dedupes / ignores conflicts).
      const earned = [...(state.history || [])].reverse();
      for (const h of earned) {
        await memberApi.answer(h.qid, h.text ?? null, h.mode).catch(() => {});
      }
      if (state.profile) {
        await memberApi.saveProfile(state.profile, state.qualifiedFor, state.streak).catch(() => {});
      }
      const me = await memberApi.me();
      setState(s => ({
        ...s,
        cents: me.cents,
        pendingCents: 0,
        answered: { ...s.answered, ...me.answered },
      }));
    } catch (e) {
      /* offline — keep local state */
    }
  }
  function onSkipClaim() {
    setState(s => ({ ...s, screen: 'feed' }));
  }

  function updateProfile(patch) {
    if (patch.openPicker) {
      setPicker(patch.openPicker);
      return;
    }
    setState(s => ({ ...s, ...patch }));
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setToken('member', null);
    setState({ ...INITIAL_STATE });
  }

  // On load: if the member has claimed before, hydrate wallet + answers from the
  // backend, and pull the live question catalog (so approved org questions show).
  React.useEffect(() => {
    if (!getToken('member')) return;
    (async () => {
      try {
        const me = await memberApi.me();
        setState(s => ({
          ...s,
          email: me.email,
          phone: me.phone,
          claimed: true,
          cents: me.cents,
          pendingCents: me.pendingCents,
          streak: me.streak ?? s.streak,
          profile: { ...s.profile, ...(me.profile || {}) },
          qualifiedFor: { ...s.qualifiedFor, ...(me.qualifiedFor || {}) },
          answered: { ...s.answered, ...me.answered },
          history: me.history && me.history.length ? me.history : s.history,
          hasAnsweredOnce: s.hasAnsweredOnce || me.hasAnsweredOnce,
        }));
        const qs = await memberApi.questions();
        let added = false;
        for (const q of qs) {
          if (!PULSE_QUESTIONS.some(p => p.id === q.id)) {
            PULSE_QUESTIONS.push(q);
            added = true;
          }
        }
        if (added) setState(s => ({ ...s })); // bump to re-render the feed
      } catch (e) {
        setToken('member', null); // stale/expired token
      }
    })();
  }, []);

  // Decide whether to show the bottom tab bar
  const showTabBar = ['feed', 'wallet', 'profile', 'streaks'].includes(state.screen);
  const activeTab = state.screen;

  // Decide screen
  let body;
  switch (state.screen) {
    case 'onboarding':
      body = <OnboardingScreen
        navigate={navigate}
        onPickFirst={(qid) => setState(s => ({ ...s, screen: 'answer', qid }))}
      />;
      break;
    case 'feed':
      body = <FeedScreen
        state={state}
        navigate={navigate}
        openAnswer={(qid) => setState(s => ({ ...s, screen: 'answer', qid }))}
      />;
      break;
    case 'answer':
      body = <AnswerScreen
        state={state}
        qid={state.qid}
        back={() => navigate(state.hasAnsweredOnce ? 'feed' : 'onboarding')}
        onSubmit={onAnswered}
      />;
      break;
    case 'claim':
      body = <ClaimScreen state={state} navigate={navigate} onClaim={onClaim} onSkip={onSkipClaim} />;
      break;
    case 'wallet':
      body = <WalletScreen state={state} navigate={navigate} />;
      break;
    case 'profile':
      body = <ProfileScreen state={state} navigate={navigate} onUpdate={updateProfile} />;
      break;
    case 'streaks':
      body = <StreaksScreen state={state} navigate={navigate} />;
      break;
    default:
      body = <FeedScreen state={state} navigate={navigate} />;
  }

  return (
    <React.Fragment>
      <IOSDevice width={402} height={874}>
        <div style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: INK,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Scrollable screen body */}
          <div style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: state.screen === 'answer' || state.screen === 'claim' || state.screen === 'onboarding' ? 'hidden' : 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            display: state.screen === 'answer' || state.screen === 'claim' || state.screen === 'onboarding' ? 'flex' : 'block',
            flexDirection: 'column',
          }}>
            {body}
          </div>

          {showTabBar && (
            <TabBar
              active={activeTab}
              anonymous={!state.claimed}
              onChange={(t) => navigate(t)}
            />
          )}
          {celebration && (
            <PointsCelebration cents={celebration.cents} onDone={() => setCelebration(null)} />
          )}
          {picker && (
            <PickerSheet
              title={picker.title}
              options={picker.options}
              multi={picker.multi}
              value={state.profile[picker.field]}
              onPick={(v) => {
                setState(s => ({ ...s, profile: { ...s.profile, [picker.field]: v } }));
                setPicker(null);
              }}
              onClose={() => setPicker(null)}
            />
          )}
        </div>
      </IOSDevice>

      <DemoMenu screen={state.screen} onJump={(s) => {
        if (s === 'answer') {
          // Pick first unanswered question
          const q = PULSE_QUESTIONS.find(q => !state.answered[q.id]) || PULSE_QUESTIONS[0];
          setState(prev => ({ ...prev, screen: 'answer', qid: q.id }));
        } else if (s === 'claim') {
          setState(prev => ({ ...prev, screen: 'claim', pendingCents: Math.max(prev.pendingCents || 0, 50), cents: Math.max(prev.cents || 0, 50) }));
        } else {
          navigate(s);
        }
      }} onReset={resetAll} />
    </React.Fragment>
  );
}

function DemoMenu({ screen, onJump, onReset }) {
  const items = [
    { id: 'onboarding', label: '1. Onboarding' },
    { id: 'answer',     label: '2. Answer (text/voice)' },
    { id: 'claim',      label: '3. Save earnings' },
    { id: 'feed',       label: '4. Feed' },
    { id: 'wallet',     label: '5. Wallet' },
    { id: 'profile',    label: '6. Profile' },
    { id: 'streaks',    label: '7. Streaks' },
  ];
  return (
    <div className="demo-menu">
      <h4>Jump to screen</h4>
      {items.map(it => (
        <button key={it.id}
          className={screen === it.id ? 'active' : ''}
          onClick={() => onJump(it.id)}>
          {it.label}
        </button>
      ))}
      <button className="reset" onClick={onReset}>↺ Reset state</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<PulseApp />);

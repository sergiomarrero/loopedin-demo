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
// On a REAL phone the simulated frame is absurd (a phone inside your phone),
// so the device chrome — bezel, dynamic island, fake status bar, fake home
// indicator — only renders on larger screens. On small screens the app goes
// full-bleed and defers to the actual device: real status bar (safe-area
// inset), real home indicator. The desktop demo presentation is unchanged.
// Lets fixed chrome (the tab bar) react to scroll direction: hide on
// scroll-down, pop back on scroll-up or near the top — the native-app pattern.
const ScrollChromeContext = React.createContext(false);

function useIsRealPhone() {
  const QUERY = '(max-width: 520px)';
  const [isPhone, setIsPhone] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setIsPhone(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isPhone;
}

function IOSDevice({
  children, width = 402, height = 874, dark = false,
  title, keyboard = false, activeScreen,
}) {
  const fullBleed = useIsRealPhone();
  // Scroll-direction tracking for auto-hiding chrome (tab bar). Native
  // listener on the scroll container — passive, so it never blocks scrolling.
  const [chromeHidden, setChromeHidden] = React.useState(false);
  const scrollRef = React.useRef(null);
  // Always reveal the tab bar when the screen changes: chromeHidden is shared
  // across screens, so without this a hide from scrolling one (long) screen
  // would persist onto the next — leaving a short, unscrollable screen with no
  // way to bring the menu back.
  React.useEffect(() => { setChromeHidden(false); }, [activeScreen]);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // capture: true — scroll events don't bubble, but capture-phase listeners
    // on an ancestor still see them, so this works for WHICHEVER descendant
    // actually scrolls (each screen owns its own scroll area).
    let lastY = 0;
    const onScroll = (e) => {
      const t = e.target;
      if (!t || typeof t.scrollTop !== 'number') return;
      // A picker list or a textarea scrolling is not the page scrolling.
      if (t.closest && t.closest('[data-sheet], textarea')) return;
      const y = t.scrollTop;
      const dy = y - lastY;
      if (y < 80 || dy < -8) setChromeHidden(false);
      else if (dy > 8) setChromeHidden(true);
      lastY = y;
    };
    el.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => el.removeEventListener('scroll', onScroll, { capture: true });
  }, []);
  return (
    <div style={{
      width: fullBleed ? '100vw' : width,
      height: fullBleed ? undefined : height,
      borderRadius: fullBleed ? 0 : 48, overflow: 'hidden',
      position: 'relative', background: dark ? '#000' : '#F2F2F7',
      boxShadow: fullBleed ? 'none' : '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }} className={fullBleed ? 'li-device-full' : undefined}>
      {/* dynamic island — simulated bezel only */}
      {!fullBleed && (
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
        }} />
      )}
      {/* status bar (absolute) — opaque/blurred so scrolled content doesn't show through
          behind it. Full-bleed keeps only a safe-area-tall backdrop under the REAL notch. */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: dark ? 'rgba(0,0,0,0.6)' : 'rgba(250,250,246,0.82)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}>
        {fullBleed
          ? <div style={{ height: 'env(safe-area-inset-top)' }} />
          : <IOSStatusBar dark={dark} />}
      </div>
      {/* nav + content */}
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        paddingTop: fullBleed ? 'env(safe-area-inset-top)' : 0,
        // Bottom inset is intentionally NOT reserved here: each bottom element
        // (answer submit bar, tab bar) pads its own safe area, so reserving it
        // again would leave a device-coloured gray strip below the footer.
        paddingBottom: 0,
        boxSizing: 'border-box',
      }}>
        {title !== undefined && <IOSNavBar title={title} dark={dark} />}
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain' }}>
          <ScrollChromeContext.Provider value={chromeHidden}>{children}</ScrollChromeContext.Provider>
        </div>
        {keyboard && <IOSKeyboard dark={dark} />}
      </div>
      {/* home indicator — simulated bezel only (the real phone draws its own) */}
      {!fullBleed && (
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
      )}
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
  // Product reviews lead the feed: look at real media, react, then say why.
  {
    id: 'q-review-juice',
    text: "Would you grab this at the store? Tell us why or why not.",
    buyer: "Harvest Foods Co.",
    buyerType: "BRAND",
    mode: "voice",
    cents: 100,
    trial: false,
    feed: 'foryou',
    qualifier: null,
    review: {
      media: [
        { type: 'video', src: '/review/juice-promo.mp4', webm: '/review/juice-promo.webm', alt: 'Harvest Sips promo video' },
        { type: 'image', src: '/review/juice-front.svg', alt: 'Harvest Sips bottle, front' },
        { type: 'image', src: '/review/juice-label.svg', alt: 'Nutrition label' },
      ],
      reactions: ["I'd buy it", "Not for me", "Too pricey"],
    },
  },
  {
    id: 'q-review-app',
    text: "This is a new app for managing your benefits. What's confusing or missing?",
    buyer: "Detroit Benefits Lab",
    buyerType: "RESEARCH",
    mode: "voice",
    cents: 150,
    trial: false,
    feed: 'foryou',
    qualifier: null,
    review: {
      media: [
        { type: 'image', src: '/review/app-home.svg', alt: 'BenefitTrack app home screen', bg: '#FFFFFF' },
      ],
      reactions: ["Easy to use", "Confusing", "Incomplete"],
    },
  },
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
// PALETTE — Rebel One design system. Orange #E8530E is the ONLY accent (brief,
// load-bearing): no second hue. Built for trust + warmth + low-income community
// readability.
//   Primary: brand orange (#E8530E) — CTAs, money stamps, points, key moments.
//   Accent : same orange — streak/celebration emphasis differs by tint, not hue.
//   Surface: warm cream (#FBF8F4) so the app reads friendly, not corporate-white.
//   Ink    : warm near-black (#1C1B19), warm-mid (#6B635E), warm-light (#9A938D).
//   No blue, no green, no second accent, no neon, no gradients. Big type, generous spacing.
// Icons: minimal outline glyphs only where mobile UX requires them (tab bar, mic, back).

const PRIMARY        = '#E8530E';
const PRIMARY_DARK   = '#D14A0B';
const PRIMARY_TINT   = '#FFF1E8';
const PRIMARY_TINT_2 = '#FDE3D1';
const PRIMARY_BORDER = '#F7C8A8';
const ACCENT       = '#E8530E';
const ACCENT_DARK  = '#D14A0B';
const ACCENT_TINT  = '#FFF1E8';
const ACCENT_BORDER= '#F7C8A8';
const INK          = '#1C1B19';
const INK_2        = '#2E2A27';
// Muted scale darkened for readability (visually-impaired / low-contrast users):
// INK_3 body copy ~9:1, INK_4 hints ~5.6:1 (passes WCAG AA), INK_5 subtle ~3.6:1.
const INK_3        = '#4A443F';
const INK_4        = '#6B635E';
const INK_5        = '#8A837D';
const SURFACE      = '#FFFFFF';
const SURFACE_WARM = '#FBF8F4';
const SURFACE_TINT = '#F5F0EA';
const BORDER       = '#ECE6DE';
const BORDER_2     = '#DBD3C9';
const DANGER       = '#B23B2E';
const DANGER_TINT  = '#FBEAE7';

// ---------- Eyebrow chip (small uppercase tag) ----------
function Eyebrow({ children, tone = 'green', style = {} }) {
  const tones = {
    green:  { bg: PRIMARY_TINT,   fg: PRIMARY_DARK, bd: PRIMARY_BORDER },
    accent: { bg: ACCENT_TINT,  fg: ACCENT_DARK, bd: ACCENT_BORDER },
    gray:   { bg: SURFACE_TINT, fg: INK_3, bd: BORDER },
    ink:    { bg: INK,          fg: '#fff', bd: INK },
    line:   { bg: 'transparent',fg: INK_3, bd: BORDER_2 },
    danger: { bg: DANGER_TINT,  fg: DANGER, bd: '#F0C9C2' },
    // On dark (ink) surfaces — Flow mode and the Flow card.
    glass:  { bg: 'rgba(255,255,255,0.14)', fg: '#fff', bd: 'rgba(255,255,255,0.22)' },
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
        background: PRIMARY, color: '#fff',
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
      color: PRIMARY, fontWeight: 800,
      fontSize: size === 'lg' ? 28 : 16,
      letterSpacing: -0.6, lineHeight: 1,
    }}>{centsFmt(cents)}</span>
  );
}

// ---------- Primary button ----------
// iOS emulates mouseenter after a tap and never sends mouseleave, so hover
// styling would stick. Only devices with a real pointer get hover states.
const CAN_HOVER = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(hover: hover)').matches;

function PButton({ children, onClick, kind = 'primary', size = 'lg', disabled, style = {}, type = 'button' }) {
  const [hover, setHoverRaw] = React.useState(false);
  const setHover = (v) => CAN_HOVER && setHoverRaw(v);
  // Pressed feedback: quick scale-down while the finger is on the button, plus
  // a haptic tick where the platform supports it (Android; iOS ignores it).
  const [pressed, setPressed] = React.useState(false);
  const press = () => {
    if (disabled) return;
    setPressed(true);
    try { navigator.vibrate && navigator.vibrate(8); } catch { /* no haptics */ }
  };
  const release = () => setPressed(false);
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
      background: disabled ? '#D8D6CB' : (hover ? PRIMARY_DARK : PRIMARY),
      color: '#fff',
      transform: pressed && !disabled ? 'scale(0.97)' : (hover && !disabled ? 'translateY(-1px)' : 'translateY(0)'),
      boxShadow: disabled ? 'none' : (hover ? '0 6px 18px rgba(232,83,14,0.22)' : '0 2px 6px rgba(232,83,14,0.12)'),
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
      transform: pressed && !disabled ? 'scale(0.97)' : (hover && !disabled ? 'translateY(-1px)' : 'translateY(0)'),
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
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={() => { release(); setHover(false); }}
      onPointerCancel={release}
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
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      onMouseEnter={() => CAN_HOVER && interactive && setHover(true)}
      onMouseLeave={() => CAN_HOVER && interactive && setHover(false)}
      style={{
        background: bg,
        border: `1px solid ${interactive && hover ? PRIMARY_BORDER : BORDER}`,
        borderRadius: 16,
        boxShadow: interactive && hover ? '0 10px 28px rgba(232,83,14,0.08)' : 'none',
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
      background: isInk ? INK : PRIMARY,
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
function TopBar({ title, leading, trailing, subtitle, background = SURFACE_WARM, sticky = false }) {
  return (
    <div style={{
      // --li-top-pad: 58px inside the demo frame (clears the fake status bar),
      // 12px on real phones (the device pads the safe area itself). member.css.
      padding: 'var(--li-top-pad, 58px) 18px 16px',
      display: 'flex', flexDirection: 'column',
      gap: subtitle ? 6 : 0,
      background,
      // sticky: the brand header persists while the content scrolls beneath it.
      position: sticky ? 'sticky' : 'relative',
      top: sticky ? 0 : undefined,
      zIndex: sticky ? 6 : 2,
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
  const fullBleed = useIsRealPhone();
  const hidden = React.useContext(ScrollChromeContext);
  const tabs = [
    { id: 'feed',    label: 'Answer',  Icon: I.feed },
    { id: 'wallet',  label: 'Wallet',  Icon: I.wallet },
    { id: 'streaks', label: 'Streak',  Icon: I.streak },
    { id: 'profile', label: 'You',     Icon: I.profile, dot: anonymous },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      // Real phones: clear the actual home indicator; demo frame: fake one (26px).
      paddingBottom: fullBleed ? 'max(env(safe-area-inset-bottom), 10px)' : 26,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderTop: `1px solid ${BORDER}`,
      zIndex: 30,
      // Native pattern: slide away on scroll-down, pop back on scroll-up.
      transform: hidden ? 'translateY(110%)' : 'translateY(0)',
      transition: 'transform .25s ease',
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
                color: on ? PRIMARY : INK_4,
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
  // Review questions show their media as the card hero (first image; the full
  // story/video experience opens on tap).
  const thumb = q.review?.media?.find(m => m.type === 'image') || null;
  return (
    <PCard interactive={!locked} onClick={onAnswer} style={{
      padding: 18, position: 'relative',
      opacity: locked ? 0.55 : 1,
      cursor: locked ? 'pointer' : 'pointer',
    }}>
      {thumb && (
        <div style={{
          margin: '-18px -18px 14px', position: 'relative',
          borderRadius: '16px 16px 0 0', overflow: 'hidden',
          height: 170, background: SURFACE_TINT,
        }}>
          <img src={thumb.src} alt={thumb.alt || ''} style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block',
          }} />
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: INK, color: '#fff', borderRadius: 999,
            padding: '5px 11px', fontSize: 10, fontWeight: 800,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>Product review</span>
          {q.review.media.some(m => m.type === 'video') && (
            <span style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(17,17,17,0.72)', color: '#fff', borderRadius: 999,
              padding: '5px 11px', fontSize: 10, fontWeight: 800,
              letterSpacing: 1, textTransform: 'uppercase',
            }}>Video</span>
          )}
        </div>
      )}
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
  // Count the points up (like-counter feel) instead of flashing the total.
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    const dur = 550;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      setShown(Math.round(cents * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cents]);
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200,
      animation: 'screen-flash 1.4s ease',
    }}>
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: 90, height: 90, borderRadius: '50%',
        border: `3px solid ${PRIMARY}`,
        transform: 'translate(-50%, -50%)',
        animation: 'confetti-ring 1.1s ease forwards',
      }} />
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        width: 90, height: 90, borderRadius: '50%',
        border: `2px solid ${PRIMARY_BORDER}`,
        transform: 'translate(-50%, -50%)',
        animation: 'confetti-ring 1.1s ease 0.15s forwards',
      }} />
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        animation: 'points-rise 1.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        color: PRIMARY,
        fontWeight: 900,
        fontSize: 56,
        letterSpacing: -1.5,
        textShadow: '0 6px 24px rgba(232,83,14,0.25)',
        whiteSpace: 'nowrap',
      }}>+{centsFmt(shown)}</div>
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
        color: INK,
        fontFamily: 'inherit',
        textDecoration: 'none',
      }}
    >
      RBL<span style={{ color: '#E8530E' }}>1</span>
    </a>
  );
}

// ---------- Progress ring ----------
function ProgressRing({ size = 120, stroke = 8, progress = 0, color = PRIMARY, trackColor = SURFACE_TINT, children }) {
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
            background: PRIMARY_TINT, color: PRIMARY_DARK,
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
    <div style={{ paddingBottom: 'calc(118px + env(safe-area-inset-bottom))', background: SURFACE_WARM, minHeight: '100%' }}>
      <TopBar
        background={SURFACE_WARM}
        sticky
        leading={
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: PRIMARY, color: '#fff', fontWeight: 900,
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
        // Sits flush under the sticky brand header (height differs demo vs phone).
        position: 'sticky', top: 'var(--li-tabs-top, 112px)', zIndex: 4,
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
              background: PRIMARY, color: '#fff', border: 0,
              padding: '9px 14px', borderRadius: 999,
              fontWeight: 800, fontSize: 11, letterSpacing: 0.8,
              textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0,
            }}>Set up</button>
          </div>
        )}

        {tab === 'browse' && !browseLocked && (
          <div style={{
            padding: '14px 16px', background: PRIMARY_TINT,
            border: `1px solid ${PRIMARY_BORDER}`, borderRadius: 14,
            fontSize: 13, color: INK_2, lineHeight: 1.5,
          }}>
            <strong style={{ color: PRIMARY_DARK }}>Heads up.</strong> Browse questions target specific lived experiences. If you answer one, we'll ask if it applies — honest answers keep results trustworthy.
          </div>
        )}

        {/* Flow mode — hands-free, reels-style answering (behind __LOOPEDIN_FLOW__). */}
        {FLOW_ENABLED && tab === 'foryou' && visible.length > 0 && (
          <FlowCard count={visible.length} onStart={() => navigate('flow')} />
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

  const [mode, setMode] = React.useState(q?.mode === 'voice' ? 'choose' : 'text'); // 'choose' | 'text' | 'voice'
  const [text, setText] = React.useState('');
  const [recState, setRecState] = React.useState('idle'); // 'idle' | 'recording' | 'recorded'
  const [recTime, setRecTime] = React.useState(0);
  const [recordedUrl, setRecordedUrl] = React.useState(null);
  const [recError, setRecError] = React.useState(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const streamRef = React.useRef(null);

  // record timer
  React.useEffect(() => {
    if (recState !== 'recording') return;
    const t = setInterval(() => setRecTime(r => r + 1), 1000);
    return () => clearInterval(t);
  }, [recState]);

  // Real in-browser recording via MediaRecorder. Audio stays on-device (demo:
  // no upload / transcription backend yet), but records + plays back for real.
  const startRecording = async () => {
    setRecError(null);
    if (recordedUrl) { URL.revokeObjectURL(recordedUrl); setRecordedUrl(null); }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const { mr, blobFromChunks } = makeAudioRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        setRecordedUrl(URL.createObjectURL(blobFromChunks(chunksRef.current)));
        (streamRef.current?.getTracks() || []).forEach(t => t.stop());
        streamRef.current = null;
      };
      recorderRef.current = mr;
      mr.start();
      setRecTime(0);
      setRecState('recording');
    } catch (err) {
      setRecError('We couldn’t reach your microphone. Check the mic permission, or type your answer instead.');
      setRecState('idle');
    }
  };
  const stopRecording = () => {
    const mr = recorderRef.current;
    if (mr && mr.state !== 'inactive') mr.stop();
    setRecState('recorded');
  };
  const resetRecording = () => {
    if (recordedUrl) { URL.revokeObjectURL(recordedUrl); setRecordedUrl(null); }
    setRecState('idle'); setRecTime(0);
  };
  // Stop the mic + free the clip if the screen unmounts mid-recording.
  const recordedUrlRef = React.useRef(null);
  recordedUrlRef.current = recordedUrl;
  React.useEffect(() => () => {
    const mr = recorderRef.current;
    if (mr && mr.state !== 'inactive') { try { mr.stop(); } catch {} }
    (streamRef.current?.getTracks() || []).forEach(t => t.stop());
    if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current);
  }, []);

  // Qualifier prompt — show if it's a Browse question with a qualifier and user hasn't confirmed
  const needsQualifier = !!(q && q.qualifier && !(state.qualifiedFor || {})[q.qualifier.tag]);
  const [qualConfirmed, setQualConfirmed] = React.useState(!needsQualifier);
  const [qualAnswer, setQualAnswer] = React.useState(null); // 'yes' | 'no'

  // Keyboard avoidance only on a real phone. Inside the framed demo (laptop,
  // iPad) the on-screen keyboard belongs to the page, not the phone frame —
  // pushing the footer up by its height would crush the answer box.
  const { kb } = useKeyboardInset();
  const kbPad = useIsRealPhone() && kb > 60 ? kb : 0;
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
      qualifies: qualAnswer === 'yes',
    });
  };

  // iOS-style edge swipe-back: a rightward drag that starts within 28px of the
  // left edge follows the finger; past 90px it commits to back(). Mostly-
  // vertical gestures cancel so normal scrolling never fights it.
  const [dragX, setDragX] = React.useState(0);
  const drag = React.useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    drag.current = t.clientX <= 28 ? { x0: t.clientX, y0: t.clientY, on: true } : null;
  };
  const onTouchMove = (e) => {
    const d = drag.current;
    if (!d || !d.on) return;
    const t = e.touches[0];
    const dx = t.clientX - d.x0;
    const dy = Math.abs(t.clientY - d.y0);
    if (dy > 70 && dx < 40) { d.on = false; setDragX(0); return; } // it's a scroll
    if (dx > 0) setDragX(dx);
  };
  const onTouchEnd = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.on && dragX > 90) back();
    setDragX(0);
  };

  // After every hook, so a question that appears later (server catalog
  // hydration) doesn't change the hook count between renders.
  if (!q) {
    return <div style={{ padding: 80 }}>Question not found.</div>;
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
      // Fill the device exactly: the middle section scrolls, the submit bar is
      // a real bottom bar. (It was position:sticky before, which overlaid the
      // recorder's mic button whenever the content ran taller than the screen.)
      height: '100%',
      display: 'flex', flexDirection: 'column',
      background: SURFACE_WARM,
      transform: dragX ? `translateX(${dragX}px)` : 'translateX(0)',
      transition: dragX ? 'none' : 'transform .2s ease',
    }}>
    {/* Pinned header — sits ABOVE the scroll area so it never scrolls away. */}
    <TopBar
      background={SURFACE_WARM}
      leading={<BackButton onClick={back} />}
      trailing={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eyebrow tone="gray">{q.buyerType}</Eyebrow>
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4,
            background: PRIMARY, color: '#fff',
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
    <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
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
          <PCard style={{ padding: 16, background: PRIMARY_TINT, borderColor: PRIMARY_BORDER }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY_DARK, letterSpacing: 1, marginBottom: 6 }}>
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
              background: 'transparent', border: 0, color: PRIMARY_DARK,
              fontSize: 13, fontWeight: 600, padding: '10px 0', marginBottom: 2, minHeight: 40,
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
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
            background: 'transparent', border: 0, color: PRIMARY_DARK,
            fontSize: 13, fontWeight: 600, padding: '10px 0', marginBottom: 6, minHeight: 40,
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          }}>← Type instead</button>

          <VoiceRecorder
            recState={recState}
            recTime={recTime}
            recordedUrl={recordedUrl}
            error={recError}
            onStart={startRecording}
            onStop={stopRecording}
            onRestart={resetRecording}
          />
        </div>
      )}

    </div>

      {/* Submit footer — fixed bottom bar of the flex column, never overlaps.
          Rises with the keyboard so Submit is never hidden behind it. */}
      <div style={{
        padding: '14px 18px calc(16px + env(safe-area-inset-bottom))',
        marginBottom: kbPad,
        transition: 'margin-bottom .2s ease',
        borderTop: `1px solid ${BORDER}`,
        background: SURFACE,
        zIndex: 5,
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
function VoiceRecorder({ recState, recTime, recordedUrl, error, onStart, onStop, onRestart }) {
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
            <span style={{ color: PRIMARY_DARK, fontWeight: 700 }}>Recording saved.</span>{' '}
            <button onClick={onRestart} style={{ background: 'transparent', border: 0, color: INK_2, textDecoration: 'underline', cursor: 'pointer', fontSize: 13, padding: '10px 6px', minHeight: 40, fontFamily: 'inherit' }}>Re-record</button>
          </span>
        )}
      </div>

      {/* Playback of the real recording */}
      {recState === 'recorded' && recordedUrl && (
        <audio
          src={recordedUrl}
          controls
          style={{ width: '100%', maxWidth: 280, height: 40 }}
        />
      )}

      {/* Mic error (permission denied / unsupported) */}
      {error && (
        <div style={{
          fontSize: 13, color: DANGER, textAlign: 'center', lineHeight: 1.5,
          padding: '0 20px', fontWeight: 500,
        }}>{error}</div>
      )}
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
          background: done ? PRIMARY : active ? PRIMARY : INK_5,
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
        background: isDone ? PRIMARY : isRec ? DANGER : PRIMARY,
        color: '#fff', border: 'none', cursor: isDone ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isRec
          ? '0 0 0 12px rgba(178,59,46,0.12), 0 0 0 24px rgba(178,59,46,0.06)'
          : '0 8px 24px rgba(232,83,14,0.25)',
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

// Pick a container the CURRENT browser can both record AND play back.
// (iOS Safari records audio/mp4; labelling that blob audio/webm makes the
// <audio> player show "Error".) Falls back to the recorder's own reported
// mimeType, and only then to an untyped blob.
function makeAudioRecorder(stream) {
  const preferred = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']
    .find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
  const mr = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
  const blobFromChunks = (chunks) =>
    mr.mimeType ? new Blob(chunks, { type: mr.mimeType }) : new Blob(chunks);
  return { mr, blobFromChunks };
}




// ===== Product review — full-screen story flow =====
// The Instagram/TikTok grammar applied to research: media fills the screen
// (segment bars for multi-image, muted autoplay for video), one tap on a
// reaction chip, then say why — hold-to-talk voice note (WhatsApp-style) or a
// short text. Swipe up to skip to the next question.
function ReviewScreen({ qid, state, back, onSubmit, onSkipNext }) {
  const q = findQuestion(qid);
  const media = q?.review?.media || [];
  const reactions = q?.review?.reactions || [];
  const [idx, setIdx] = React.useState(0);
  const [reaction, setReaction] = React.useState(null);
  const [mode, setMode] = React.useState('voice'); // 'voice' | 'text'
  const [text, setText] = React.useState('');
  const [sound, setSound] = React.useState(false);
  const { kb } = useKeyboardInset();
  const kbPad = useIsRealPhone() && kb > 60 ? kb : 0; // see AnswerScreen
  const videoRef = React.useRef(null);
  // Kick autoplay explicitly: React sets `muted` as a property after mount,
  // which some browsers don't count for the muted-autoplay allowance.
  React.useEffect(() => {
    const v = videoRef.current;
    if (v) { v.muted = !sound; v.play().catch(() => {}); }
  }, [idx, sound]);

  // --- hold-to-talk recorder (press = record, release = done) ---
  const [recState, setRecState] = React.useState('idle'); // idle|recording|recorded
  const [recTime, setRecTime] = React.useState(0);
  const [recordedUrl, setRecordedUrl] = React.useState(null);
  const [recHint, setRecHint] = React.useState(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const streamRef = React.useRef(null);
  const holdT0 = React.useRef(0);

  React.useEffect(() => {
    if (recState !== 'recording') return;
    const t = setInterval(() => setRecTime(r => r + 1), 1000);
    return () => clearInterval(t);
  }, [recState]);

  // True while the finger is down. getUserMedia is async, so a quick tap can
  // release before the recorder exists — without this the mic would start
  // afterwards and keep recording with nothing to stop it.
  const holdingRef = React.useRef(false);
  const holdStart = async (e) => {
    if (recState === 'recorded') return;
    e.preventDefault();
    setRecHint(null);
    holdingRef.current = true;
    if (recordedUrl) { URL.revokeObjectURL(recordedUrl); setRecordedUrl(null); }
    // Never stack recorders: close anything a previous hold left behind.
    const prev = recorderRef.current;
    if (prev && prev.state !== 'inactive') { try { prev.onstop = null; prev.stop(); } catch { /* ignore */ } }
    (streamRef.current?.getTracks() || []).forEach(t => t.stop());
    streamRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!holdingRef.current) { // released before the mic came up — a tap
        stream.getTracks().forEach(t => t.stop());
        setRecHint('Hold the button while you talk, release when you’re done.');
        return;
      }
      streamRef.current = stream;
      const { mr, blobFromChunks } = makeAudioRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunksRef.current.push(ev.data); };
      recorderRef.current = mr;
      recorderRef.current.blobFromChunks = blobFromChunks;
      holdT0.current = Date.now();
      mr.start();
      setRecTime(0);
      setRecState('recording');
    } catch {
      setRecHint('We couldn’t reach your microphone — check the permission, or type instead.');
    }
  };
  const holdEnd = () => {
    holdingRef.current = false;
    const mr = recorderRef.current;
    if (!mr || mr.state === 'inactive') return;
    const heldMs = Date.now() - holdT0.current;
    mr.onstop = () => {
      (streamRef.current?.getTracks() || []).forEach(t => t.stop());
      streamRef.current = null;
      if (heldMs < 500) { // a tap, not a hold — teach the gesture
        setRecState('idle'); setRecTime(0);
        setRecHint('Hold the button while you talk, release when you’re done.');
        return;
      }
      setRecordedUrl(URL.createObjectURL(mr.blobFromChunks(chunksRef.current)));
      setRecState('recorded');
    };
    mr.stop();
  };
  const resetRec = () => {
    if (recordedUrl) { URL.revokeObjectURL(recordedUrl); setRecordedUrl(null); }
    setRecState('idle'); setRecTime(0); setRecHint(null);
  };
  const recordedUrlRef = React.useRef(null);
  recordedUrlRef.current = recordedUrl;
  React.useEffect(() => () => { // teardown on unmount
    const mr = recorderRef.current;
    if (mr && mr.state !== 'inactive') { try { mr.stop(); } catch {} }
    (streamRef.current?.getTracks() || []).forEach(t => t.stop());
    if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current);
  }, []);

  // --- swipe up = skip to next question (only while viewing, not recording) ---
  const swipe = React.useRef(null);
  const onTouchStart = (e) => {
    // Scrolling the textarea or scrubbing the audio player is not a swipe.
    if (e.target && e.target.closest && e.target.closest('textarea, audio, input, button')) { swipe.current = null; return; }
    const t = e.touches[0];
    swipe.current = { x0: t.clientX, y0: t.clientY };
  };
  const onTouchEnd = (e) => {
    const s = swipe.current; swipe.current = null;
    if (!s || recState === 'recording') return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x0, dy = t.clientY - s.y0;
    if (dy < -80 && Math.abs(dy) > Math.abs(dx) * 1.5) onSkipNext();
    else if (dx > 90 && s.x0 <= 28) back(); // edge swipe-back
  };

  if (!q || media.length === 0) return <div style={{ padding: 80 }}>Question not found.</div>;
  const m = media[idx];

  // Tap left third = previous segment, elsewhere = next (IG stories).
  const onMediaTap = (e) => {
    // Autoplay can be blocked (Low Power Mode) — the first tap plays instead of flipping.
    const v = videoRef.current;
    if (v && v.paused) { v.play().catch(() => {}); return; }
    if (media.length < 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - r.left) / r.width;
    if (frac < 0.33) setIdx(i => Math.max(0, i - 1));
    else setIdx(i => Math.min(media.length - 1, i + 1));
  };

  const canSubmit = !!reaction && (mode === 'text' ? text.trim().length >= 3 : recState === 'recorded');
  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      qid: q.id, cents: q.cents,
      mode: mode === 'text' ? 'text' : 'voice',
      text: mode === 'text' ? text.trim() : null,
      reaction,
    });
  };

  const chip = (label) => {
    const on = reaction === label;
    return (
      <button key={label} onClick={() => setReaction(on ? null : label)} style={{
        // Sized so a 3-chip set fits one row on a 390px phone — a wrapped chip
        // stretching full-width reads as broken.
        flex: '1 1 0', minWidth: 0, minHeight: 46, padding: '10px 8px',
        background: on ? PRIMARY : 'rgba(255,255,255,0.10)',
        color: '#fff', border: `1.5px solid ${on ? PRIMARY : 'rgba(255,255,255,0.28)'}`,
        borderRadius: 999, fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
        letterSpacing: -0.2, cursor: 'pointer', transition: 'background .2s, border-color .2s',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{label}</button>
    );
  };

  return (
    <div
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: '#111', color: '#fff', position: 'relative',
        userSelect: 'none', WebkitUserSelect: 'none',
      }}>
      {/* Top chrome: segment bars + back + points */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 6, padding: '10px 14px 0' }}>
        {media.length > 1 && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {media.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= idx ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'background .2s',
              }} />
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={back} aria-label="Back" style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(17,17,17,0.55)', color: '#fff', border: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 20,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'rgba(17,17,17,0.55)', color: '#fff', borderRadius: 999,
              padding: '6px 11px', fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
            }}>{q.buyerType}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 4,
              background: PRIMARY, color: '#fff', padding: '6px 11px', borderRadius: 999,
              fontWeight: 800, fontSize: 14, letterSpacing: -0.4, lineHeight: 1,
            }}>
              {q.cents}<span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.2, opacity: 0.9, textTransform: 'uppercase' }}>pts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Media */}
      {/* Media is 9:16 — shown whole (contain) on a matching cream ground, so a
          phone's slightly squarer media area never crops the product shot's
          title or the label copy at the edges. */}
      <div onClick={onMediaTap} style={{ flex: 1, position: 'relative', minHeight: 0, background: m.bg || '#F4EDE3' }}>
        {m.type === 'video' ? (
          <video
            key={m.src}
            ref={videoRef}
            autoPlay muted={!sound} loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          >
            {/* mp4 (H.264) for Safari/iOS; WebM fallback for codec-free Chromium builds. */}
            <source src={m.src} type="video/mp4" />
            {m.webm && <source src={m.webm} type="video/webm" />}
          </video>
        ) : (
          <img key={m.src} src={m.src} alt={m.alt || ''} draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        )}
        {m.type === 'video' && (
          <button
            onClick={(e) => { e.stopPropagation(); setSound(s => !s); }}
            style={{
              position: 'absolute', bottom: 14, right: 14,
              background: 'rgba(17,17,17,0.72)', color: '#fff', border: 0,
              borderRadius: 999, padding: '8px 14px', fontSize: 11, fontWeight: 800,
              letterSpacing: 0.8, textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'inherit',
            }}>{sound ? 'Sound on' : 'Tap for sound'}</button>
        )}
        {media.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: 'rgba(17,17,17,0.55)', color: 'rgba(255,255,255,0.85)',
            borderRadius: 999, padding: '6px 11px', fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
          }}>{idx + 1} / {media.length} · tap to flip</div>
        )}
      </div>

      {/* Bottom panel: question → react → say why. Rises with the keyboard
          while typing so the composer and Submit stay visible. */}
      <div style={{
        flexShrink: 0, padding: '16px 18px calc(16px + env(safe-area-inset-bottom))',
        background: '#111', borderTop: '1px solid rgba(255,255,255,0.08)',
        marginBottom: kbPad,
        transition: 'margin-bottom .2s ease',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35, letterSpacing: -0.3, textWrap: 'pretty' }}>
          {q.text}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.4 }}>
          Paid by <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{q.buyer}</span> · anonymous · swipe up to skip
        </div>

        {/* Reaction chips — one even row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {reactions.map(chip)}
        </div>

        {/* Composer appears once they've reacted */}
        {reaction && (
          <div style={{ marginTop: 14 }}>
            {mode === 'voice' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {recState !== 'recorded' ? (
                  <React.Fragment>
                    <button
                      onPointerDown={holdStart}
                      onPointerUp={holdEnd}
                      onPointerLeave={holdEnd}
                      onPointerCancel={holdEnd}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{
                        width: 84, height: 84, borderRadius: '50%',
                        background: recState === 'recording' ? DANGER : PRIMARY,
                        color: '#fff', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: recState === 'recording' ? 'scale(1.12)' : 'scale(1)',
                        transition: 'transform .2s, background .2s',
                        touchAction: 'none',
                      }}>
                      <I.mic style={{ width: 34, height: 34 }} />
                    </button>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', minHeight: 18, textAlign: 'center' }}>
                      {recState === 'recording'
                        ? `Recording… 0:${recTime.toString().padStart(2, '0')} — release when done`
                        : (recHint || 'Hold to talk — tell us why.')}
                    </div>
                    <button onClick={() => setMode('text')} style={{
                      background: 'transparent', border: 0, color: 'rgba(255,255,255,0.6)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                      fontFamily: 'inherit', padding: '10px 12px', minHeight: 40,
                    }}>Type instead</button>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <audio src={recordedUrl} controls style={{ width: '100%', height: 40 }} />
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                      <button onClick={resetRec} style={{
                        flex: 1, background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.28)',
                        color: '#fff', padding: 14, borderRadius: 12, fontFamily: 'inherit',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}>Re-record</button>
                      <PButton onClick={submit} style={{ flex: 2 }}>Submit & Earn {q.cents} pts</PButton>
                    </div>
                  </React.Fragment>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 280))}
                  placeholder="Tell us why in a sentence or two."
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box', minHeight: 76,
                    background: 'rgba(255,255,255,0.08)', color: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.24)', borderRadius: 12,
                    padding: '12px 14px', fontFamily: 'inherit', fontSize: 16, lineHeight: 1.45,
                    outline: 'none', resize: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={() => setMode('voice')} style={{
                    background: 'transparent', border: 0, color: 'rgba(255,255,255,0.6)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                    fontFamily: 'inherit', padding: '10px 12px', minHeight: 40, flexShrink: 0,
                  }}>Use voice</button>
                  <PButton onClick={submit} disabled={!canSubmit} style={{ flex: 1 }}>
                    Submit & Earn {q.cents} pts
                  </PButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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
            background: PRIMARY, color: '#fff',
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

      <div style={{ padding: '8px 22px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: PRIMARY_DARK, letterSpacing: 1, marginBottom: 8 }}>
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
              <strong>Your {state.cents} points live only on this phone until you save them.</strong> Tap Skip again to continue anyway.
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
    <div style={{ paddingBottom: 'calc(118px + env(safe-area-inset-bottom))' }}>
      <TopBar
        sticky
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
              color: PRIMARY, textTransform: 'uppercase', marginTop: 4,
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
          background: PRIMARY_TINT, border: `1px solid ${PRIMARY_BORDER}`,
          borderRadius: 12, color: PRIMARY_DARK,
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
          <PCard style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: '#fff8f3', border: `1px solid ${PRIMARY_BORDER}` }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: PRIMARY, color: '#fff', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 18,
            }}>!</div>
            <div style={{ flex: 1, fontSize: 12, color: INK_2, lineHeight: 1.5 }}>
              <strong>Save your earnings.</strong> Add an email + phone so they stick.
            </div>
            <button onClick={() => navigate('claim')} style={{
              background: PRIMARY, color: '#fff', border: 0,
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
                  {dollarsFmt(t.cents)} cash-out · <span style={{ fontStyle: 'italic' }}>coming soon</span>
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
              <div style={{ color: PRIMARY, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
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
  const [showAllTags, setShowAllTags] = React.useState(false);
  // The input sheets (birth year / address / notes) render at the APP level
  // (via onUpdate({openSheet})) — like the option picker — so they stack above
  // the tab bar. On iOS, -webkit-overflow-scrolling on the screen wrapper
  // creates a stacking context, so nothing rendered inside a screen can ever
  // paint over the tab bar, no matter its z-index.
  // Document verification (demo): pick a photo/PDF on-device to verify a tag.
  // Nothing is uploaded — there's no review backend yet — but it marks the tag
  // Verified locally so the flow is fully demoable.
  const fileInputRef = React.useRef(null);
  const pendingTagRef = React.useRef(null);
  const openVerify = (tagId) => { pendingTagRef.current = tagId || null; fileInputRef.current?.click(); };
  const onVerifyFile = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const verifiable = LIVED_TAGS.filter(t => t.verify).map(t => t.id);
    const verified = [...(p.verifiedTags || [])];
    let tags = [...(p.tags || [])];
    const mark = (id) => { if (!verified.includes(id)) verified.push(id); if (!tags.includes(id)) tags.push(id); };
    if (pendingTagRef.current) mark(pendingTagRef.current);
    else tags.filter(id => verifiable.includes(id)).forEach(mark); // card upload: verify selected verifiable tags
    pendingTagRef.current = null;
    onUpdate({ profile: { ...p, tags, verifiedTags: verified, docOnFile: true } });
  };

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
  // 'senior' is excluded: it's auto-derived from the birth year, not hand-tapped.
  const manualTags = LIVED_TAGS.filter(t => t.id !== 'senior');
  const visibleTags = manualTags.filter(t => showAllTags || t.primary || p.tags.includes(t.id));
  const hiddenCount = manualTags.length - visibleTags.length;

  return (
    <div style={{ paddingBottom: 'calc(118px + env(safe-area-inset-bottom))' }}>
      <TopBar
        sticky
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
              Earns an average of <strong style={{ color: PRIMARY }}>+30 pts</strong> more per question.
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
          onClick={() => onUpdate({ openSheet: 'year' })}
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
          onClick={() => onUpdate({ openSheet: 'address' })}
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
                border: `1px solid ${on ? PRIMARY : BORDER}`,
                background: on ? PRIMARY_TINT : '#fff',
                color: on ? PRIMARY : INK_2,
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
                <span
                  role={verified ? undefined : 'button'}
                  onClick={verified ? undefined : (e) => { e.stopPropagation(); openVerify(t.id); }}
                  style={{
                    fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase',
                    fontWeight: 700,
                    color: verified ? PRIMARY : INK_4,
                    background: verified ? PRIMARY_TINT : '#f0f0f0',
                    border: `1px solid ${verified ? PRIMARY_BORDER : '#e3e3e3'}`,
                    padding: '2px 5px', borderRadius: 4,
                    cursor: verified ? 'default' : 'pointer',
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
            <Eyebrow tone="accent">{p.docOnFile ? 'Document on file' : 'Verify'}</Eyebrow>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>
            Verify with a document to unlock high-value questions.
          </div>
          <div style={{ fontSize: 12, color: INK_4, marginTop: 6, lineHeight: 1.5 }}>
            Upload one document (an ID, a benefits letter, anything) to verify tags like
            "veteran" or "Section 8". Verified tags earn 2–3× more per answer. Your document stays
            on your device in this demo — nothing is uploaded.
          </div>
          <div style={{ marginTop: 12 }}>
            <PButton kind="outline" size="sm" onClick={() => openVerify(null)}>
              {p.docOnFile ? 'Upload another document' : 'Upload a document'}
            </PButton>
          </div>
        </PCard>
      </div>

      {/* Hidden picker shared by the per-tag "Verify +" chips and the card above. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        style={{ display: 'none' }}
        onChange={onVerifyFile}
      />

      <SectionTitle>Account</SectionTitle>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ProfileRow
          label="Anything else"
          value={notesDisplay || "Add a note"}
          dim={!notesDisplay}
          onClick={() => onUpdate({ openSheet: 'notes' })}
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
        background: value ? PRIMARY : '#e5e5e5',
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
      {cta && <span style={{ color: PRIMARY, fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>{cta}</span>}
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
// Keyboard-aware sheets. When the soft keyboard opens, the visual viewport
// shrinks but our fixed 100dvh app does not — a bottom-anchored sheet's inputs
// and buttons hide behind the keyboard. Track the visual viewport box so
// sheets can reposition themselves.
function useKeyboardInset() {
  const [box, setBox] = React.useState({ kb: 0, top: 0, height: 0 });
  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setBox({
      kb: Math.max(0, window.innerHeight - vv.height - vv.offsetTop),
      top: vv.offsetTop,
      height: vv.height,
    });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, []);
  return box;
}

// Shared sheet scaffold: dim overlay + white panel + grab handle.
// Bottom-anchored normally. While the keyboard is open, the panel pins to the
// TOP of the visual viewport instead — iOS Safari scrolls/shrinks the visible
// area unpredictably around a fixed-position layout, and top-pinning is the
// only placement that guarantees the input AND the action buttons stay
// visible above the keyboard.
function SheetOverlay({ onClose, children }) {
  const { kb, top, height } = useKeyboardInset();
  const kbOpen = kb > 60;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(17,17,17,0.4)',
      display: 'flex', alignItems: kbOpen ? 'flex-start' : 'flex-end',
      animation: 'fade-in .2s ease',
      paddingBottom: kbOpen ? 0 : kb,
      transition: 'padding-bottom .2s ease',
    }} onClick={onClose} data-sheet>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderRadius: kbOpen ? '0 0 20px 20px' : '20px 20px 0 0',
        width: '100%',
        padding: '20px 20px 24px',
        animation: 'sheet-in .25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        marginTop: kbOpen ? top : 0,
        maxHeight: kbOpen ? Math.max(220, height - 12) : '82%',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 40, height: 4, background: '#e3e3e3', borderRadius: 2,
          margin: '0 auto 14px', flexShrink: 0,
        }} />
        {children}
      </div>
    </div>
  );
}

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
    <SheetOverlay onClose={onClose}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, gap: 12, flexShrink: 0,
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
                border: `1px solid ${on ? PRIMARY : BORDER}`,
                background: on ? PRIMARY_TINT : '#fff',
                color: on ? PRIMARY : INK,
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
    </SheetOverlay>
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
          fontFamily: 'inherit', fontSize: 16, color: INK,
          outline: 'none', boxSizing: 'border-box',
        }}
        {...props}
      />
    </label>
  );

  return (
    <SheetOverlay onClose={onClose}>
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3, flexShrink: 0 }}>Your address</div>
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
    </SheetOverlay>
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
    <SheetOverlay onClose={onClose}>
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3, flexShrink: 0 }}>Birth year</div>
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
            border: `1.5px solid ${underAge ? DANGER : (canSave ? PRIMARY : BORDER_2)}`,
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
          color: underAge ? DANGER : (canSave ? PRIMARY_DARK : INK_4),
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
    </SheetOverlay>
  );
}

// Freeform notes sheet — anything else the user wants buyers to know.
function NotesSheet({ value, onSave, onClose }) {
  const [text, setText] = React.useState(value || '');
  return (
    <SheetOverlay onClose={onClose}>
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: -0.3, flexShrink: 0 }}>Anything else</div>
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
            // 16px minimum — anything smaller makes iOS Safari zoom the page
            // in on focus and stay zoomed after, cropping the whole app.
            fontFamily: 'inherit', fontSize: 16, lineHeight: 1.5, color: INK,
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
    </SheetOverlay>
  );
}




// ===== source: 7e84584c =====
// Streaks + badges screen

function StreaksScreen({ state, navigate }) {
  const ringProgress = Math.min(1, state.streak / 7);

  return (
    <div style={{ paddingBottom: 'calc(118px + env(safe-area-inset-bottom))' }}>
      <TopBar
        sticky
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
          <ProgressRing size={104} stroke={7} progress={ringProgress} color={PRIMARY} trackColor="#2a2a2a">
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
                color: d.today ? PRIMARY : INK_4,
              }}>{d.day}</div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: d.answered ? PRIMARY : '#fff',
                border: `2px solid ${d.answered ? PRIMARY : (d.today ? PRIMARY : '#e3e3e3')}`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
              }}>
                {d.answered ? <I.check /> : (d.today ? <span style={{ color: PRIMARY, fontSize: 9, letterSpacing: 0.6 }}>NOW</span> : null)}
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
              background: b.unlocked ? PRIMARY : '#e3e3e3',
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
                <div style={{ width: `${b.progress * 100}%`, height: '100%', background: PRIMARY }} />
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
      background: PRIMARY, color: '#fff',
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

function OnboardingScreen({ navigate, onPickFirst, state }) {
  // Unanswered For You questions only (fall back to the full set so a member
  // who has answered everything still sees the story, not an empty deck).
  const featured = React.useMemo(() => {
    const open = PULSE_QUESTIONS.filter(q => q.feed === 'foryou' && !state.answered[q.id]);
    return (open.length ? open : PULSE_QUESTIONS.filter(q => q.feed === 'foryou')).slice(0, 3);
  }, []);
  const [topIdx, setTopIdx] = React.useState(0);
  const [dragX, setDragX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const startRef = React.useRef(null);
  const busyRef = React.useRef(false);
  const THRESH = 96; // px past which a release commits the swipe

  // Commit a swipe: 'left' flies the card off and reveals the next question
  // (skip / browse the deck); 'right' opens the answer flow for this card.
  function commit(dir) {
    if (busyRef.current || !featured.length) return;
    busyRef.current = true;
    setDragging(false);
    setDragX(dir === 'left' ? -640 : 640); // fly out (transition is on now)
    setTimeout(() => {
      if (dir === 'right') {
        onPickFirst(featured[topIdx].id);
      } else {
        setTopIdx(i => (i + 1) % featured.length);
        setDragX(0); // new card is freshly keyed → mounts centered, no slide-in
      }
      busyRef.current = false;
    }, 230);
  }

  // Robust drag: on press, listen for move/up on WINDOW (so the gesture keeps
  // tracking even if the finger leaves the card) and read the delta straight
  // off the event — no pointer-capture, no stale state.
  const onDown = (e) => {
    if (busyRef.current) return;
    if (e.cancelable) e.preventDefault(); // no text selection / native drag
    const sx = e.clientX;
    startRef.current = { x: sx };
    setDragging(true);
    const move = (ev) => {
      if (!startRef.current) return;
      setDragX(ev.clientX - startRef.current.x);
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const dx = startRef.current ? ev.clientX - startRef.current.x : 0;
      startRef.current = null;
      setDragging(false);
      if (dx <= -THRESH) commit('left');
      else if (dx >= THRESH) commit('right');
      else if (Math.abs(dx) < 6) {          // a tap (not a drag) → open to answer
        setDragX(0);
        if (!busyRef.current) onPickFirst(featured[topIdx].id);
      }
      else setDragX(0); // small drag → snap back (transition on)
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  const handlers = { onPointerDown: onDown };

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
              background: PRIMARY, color: '#fff', fontWeight: 900,
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
          <span style={{ color: PRIMARY }}>Earn cash &amp; rewards.</span>
        </div>
        <div style={{ fontSize: 14, color: INK_3, marginTop: 10, lineHeight: 1.55 }}>
          About 15 seconds. Type or talk. No signup to start — we'll ask if you want to save your earnings after.
        </div>
      </div>

      {/* Swipeable card deck — drag the top card: left to skip, right to answer.
          Full-bleed left-to-right: the deck takes the whole width so the card
          you're flicking through is the widest thing on screen. The headline
          and buttons keep their 22px gutters. */}
      <div style={{
        position: 'relative',
        margin: '16px 0 6px',
        flex: 1,
        minHeight: 210, // short phones (SE) still fit the buttons below
      }}>
        <StackCard q={next2} depth={2} />
        <StackCard q={next}  depth={1} />
        <StackCard key={topIdx} q={top} depth={0}
          dragX={dragX} dragging={dragging} handlers={handlers} />
      </div>

      {/* Swipe hint — only while at rest, so users discover the gesture. */}
      <div style={{
        textAlign: 'center', fontSize: 12, color: INK_4, letterSpacing: 0.2,
        minHeight: 16, transition: 'opacity .2s',
        opacity: dragX === 0 && !dragging ? 1 : 0,
      }}>
        Tap the card to answer · swipe to browse
      </div>

      {/* Action buttons (mirror the swipe directions: Skip = left, Answer = right) */}
      <div style={{
        padding: '8px 22px 28px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => commit('left')} style={{
            flex: 1, minHeight: 58,
            background: SURFACE, border: `1.5px solid ${BORDER_2}`,
            color: INK_2, borderRadius: 14,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 14, letterSpacing: -0.1,
            cursor: 'pointer',
          }}>Skip</button>
          <PButton onClick={() => commit('right')} style={{ flex: 2 }}>
            Answer & Earn {top?.cents || 0} pts
          </PButton>
        </div>
        {FLOW_ENABLED && (
          <button onClick={() => navigate('flow')} style={{
            background: 'transparent', border: 0, padding: '2px 0 0',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: PRIMARY_DARK,
            letterSpacing: -0.1, cursor: 'pointer', textAlign: 'center',
          }}>Prefer to just talk? Try Flow mode →</button>
        )}
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

function StackCard({ q, depth, dragX = 0, dragging = false, handlers }) {
  if (!q) return null;
  const isTop = depth === 0;
  const scale = 1 - depth * 0.04;
  const ty = depth * 10;
  const z = 10 - depth;
  const op = isTop ? 1 : (depth === 1 ? 0.7 : 0.4);

  // The top card follows the finger (translate + slight rotate); resting cards
  // sit scaled/offset behind it. Transition is off only while actively dragging
  // so the card tracks 1:1, then eases on release / fly-out.
  const transform = isTop
    ? `translateX(${dragX}px) rotate(${(dragX * 0.03).toFixed(2)}deg)`
    : `translateY(${ty}px) scale(${scale})`;
  const strength = Math.min(1, Math.abs(dragX) / 96);

  return (
    <div {...(isTop ? handlers : {})} style={{
      position: 'absolute', inset: 0,
      transform,
      transition: (isTop && dragging) ? 'none' : 'transform .25s ease, opacity .25s',
      opacity: op,
      zIndex: z,
      pointerEvents: isTop ? 'auto' : 'none',
      touchAction: isTop ? 'none' : 'auto', // top card owns the gesture (deck doesn't scroll)
      userSelect: 'none', WebkitUserSelect: 'none',
      cursor: isTop ? 'grab' : 'default',
    }}>
      <div style={{
        position: 'relative',
        background: isTop ? SURFACE : SURFACE_TINT,
        border: `1px solid ${isTop ? BORDER_2 : BORDER}`,
        borderRadius: 18,
        padding: 22,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        boxShadow: isTop ? '0 12px 36px rgba(28,27,25,0.06)' : 'none',
        overflow: 'hidden',
      }}>
        {!isTop ? null : (<React.Fragment>
        {/* Directional swipe cues — appear as the card is dragged. */}
        {isTop && dragX > 8 && (
          <span style={{
            position: 'absolute', top: 16, left: 16, zIndex: 2,
            background: PRIMARY, color: '#fff', borderRadius: 999,
            padding: '5px 11px', fontSize: 11, fontWeight: 800, letterSpacing: 1,
            textTransform: 'uppercase', opacity: strength,
          }}>Answer →</span>
        )}
        {isTop && dragX < -8 && (
          <span style={{
            position: 'absolute', top: 16, right: 16, zIndex: 2,
            background: SURFACE_TINT, color: INK_3, border: `1px solid ${BORDER_2}`,
            borderRadius: 999, padding: '5px 11px', fontSize: 11, fontWeight: 800,
            letterSpacing: 1, textTransform: 'uppercase', opacity: strength,
          }}>Skip</span>
        )}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Eyebrow tone="gray">{q.buyerType}</Eyebrow>
            {q.trial && <Eyebrow tone="accent">Trial</Eyebrow>}
            {q.review && <Eyebrow tone="accent">Product review</Eyebrow>}
          </div>
          <PointsStamp points={q.cents} />
        </div>
        {/* Review questions: media hero above the question text. */}
        {q.review?.media?.length > 0 && (
          <div style={{
            margin: '0 0 14px', borderRadius: 12, overflow: 'hidden',
            // Up to 130px, but gives way first on short phones (SE) so the
            // question text is never pushed off the card.
            flex: '0 1 130px', minHeight: 48, background: SURFACE_TINT,
          }}>
            <img
              src={(q.review.media.find(m => m.type === 'image') || q.review.media[0]).src}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', pointerEvents: 'none' }}
            />
          </div>
        )}
        <div style={{
          fontSize: q.review ? 19 : 22, fontWeight: 700, color: INK,
          letterSpacing: -0.4, lineHeight: 1.3, textWrap: 'balance',
          flex: '1 0 auto',
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
        </React.Fragment>)}
      </div>
    </div>
  );
}




// ===== Flow mode — reels-style, hands-free answering =====
// The Instagram Reels / YouTube Shorts grammar applied to answering: one
// question fills the screen, the mic is already listening when it appears, and
// a flick up sends what you said and pulls in the next one. No submit button,
// no mode chooser — talk, flick, repeat. Tap to pause, flick down to go back.
//

// Flow mode is on in every build; /flow is just an entry that opens on the feed.
const FLOW_ENABLED = true;

// Live captions come from the Web Speech API where the browser has it (Safari on
// iPhone/iPad, Chrome). Elsewhere we fall back to a plain MediaRecorder capture
// so the answer is still recorded — the UI just says "recording" instead of
// showing the words. Audio stays on-device (demo: no upload yet).
function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

// One capture session at a time — the pager restarts it per question.
//   status: idle | listening | paused | denied | error
//   captions: true when words are coming from speech recognition
function useFlowCapture() {
  const [status, setStatus] = React.useState('idle');
  const [captions, setCaptions] = React.useState(() => !!getSpeechRecognition());
  const [finalText, setFinalText] = React.useState('');
  const [interimText, setInterimText] = React.useState('');
  const [seconds, setSeconds] = React.useState(0);

  const recRef = React.useRef(null);      // current SpeechRecognition instance
  const baseRef = React.useRef('');       // words banked from instances that already ended
  const mrRef = React.useRef(null);       // MediaRecorder fallback
  const streamRef = React.useRef(null);
  const activeRef = React.useRef(false);  // should we be capturing right now?
  const pausedRef = React.useRef(false);
  const captionsRef = React.useRef(captions);
  const snapRef = React.useRef({ final: '', interim: '' });
  const secRef = React.useRef(0);

  React.useEffect(() => {
    if (status !== 'listening') return;
    const t = setInterval(() => { secRef.current += 1; setSeconds(secRef.current); }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const setTexts = (fin, inter) => {
    snapRef.current = { final: fin, interim: inter };
    setFinalText(fin);
    setInterimText(inter);
  };
  const heardSoFar = () =>
    (snapRef.current.final + ' ' + snapRef.current.interim).replace(/\s+/g, ' ').trim();

  function teardownRecognizer() {
    const r = recRef.current;
    recRef.current = null;
    if (r) {
      r.onresult = null; r.onend = null; r.onerror = null;
      try { r.abort(); } catch { /* already stopped */ }
    }
  }
  function teardownRecorder() {
    const mr = mrRef.current;
    mrRef.current = null;
    if (mr && mr.state !== 'inactive') { try { mr.stop(); } catch { /* already stopped */ } }
    (streamRef.current?.getTracks() || []).forEach(t => t.stop());
    streamRef.current = null;
  }

  const genRef = React.useRef(0); // bumps on every start()/stop(); stale mic promises bail out
  async function startRecorder() {
    const gen = genRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!activeRef.current || gen !== genRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      const { mr } = makeAudioRecorder(stream);
      mrRef.current = mr;
      mr.start();
      if (pausedRef.current) { try { mr.pause(); } catch { /* ignore */ } setStatus('paused'); }
      else setStatus('listening');
    } catch (err) {
      setStatus(err && err.name === 'NotAllowedError' ? 'denied' : 'error');
    }
  }

  function startRecognizer() {
    const SR = getSpeechRecognition();
    const r = new SR();
    r.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      // Rebuild from the full result list every time — simpler and more robust
      // than tracking resultIndex across browsers.
      let fin = '', inter = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const t = res[0] ? res[0].transcript : '';
        if (res.isFinal) fin += t + ' '; else inter += t;
      }
      setTexts((baseRef.current + fin).replace(/\s+/g, ' ').trimStart(), inter.trim());
    };
    r.onerror = (e) => {
      const code = e && e.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        activeRef.current = false;
        teardownRecognizer();
        setStatus('denied');
      } else if (code === 'network' || code === 'audio-capture') {
        // No captions on this device/connection — keep the answer as audio.
        teardownRecognizer();
        captionsRef.current = false;
        setCaptions(false);
        if (activeRef.current) startRecorder();
      }
      // 'no-speech' / 'aborted' are followed by onend, which restarts us.
    };
    r.onend = () => {
      if (recRef.current !== r) return; // superseded by a newer instance
      // Recognizers stop themselves after a pause. Bank what this one heard
      // and start a fresh one so we keep listening until the member flicks.
      baseRef.current = heardSoFar() ? heardSoFar() + ' ' : '';
      setTexts(baseRef.current.trimEnd(), '');
      recRef.current = null;
      if (activeRef.current && !pausedRef.current) {
        setTimeout(() => {
          if (activeRef.current && !pausedRef.current && !recRef.current) startRecognizer();
        }, 120);
      }
    };
    recRef.current = r;
    try {
      r.start();
      setStatus('listening');
    } catch {
      // "already started" race right after an abort — try once more shortly.
      setTimeout(() => {
        if (activeRef.current && recRef.current === r) {
          try { r.start(); setStatus('listening'); } catch { setStatus('error'); }
        }
      }, 250);
    }
  }

  function start() {
    genRef.current += 1;
    activeRef.current = true;
    pausedRef.current = false;
    baseRef.current = '';
    secRef.current = 0;
    setSeconds(0);
    setTexts('', '');
    teardownRecognizer();
    teardownRecorder();
    if (captionsRef.current && getSpeechRecognition()) startRecognizer();
    else startRecorder();
  }
  // Stop and hand back everything captured for this question.
  function stop() {
    const out = { text: heardSoFar(), seconds: secRef.current };
    genRef.current += 1;
    activeRef.current = false;
    pausedRef.current = false;
    teardownRecognizer();
    teardownRecorder();
    setStatus('idle');
    return out;
  }
  function pause() {
    if (!activeRef.current) return;
    pausedRef.current = true; // honoured even if the mic is still coming up
    if (status !== 'listening') return;
    if (mrRef.current) {
      try { mrRef.current.pause(); } catch { /* ignore */ }
    } else {
      baseRef.current = heardSoFar() ? heardSoFar() + ' ' : '';
      setTexts(baseRef.current.trimEnd(), '');
      teardownRecognizer();
    }
    setStatus('paused');
  }
  function resume() {
    if (!activeRef.current) return;
    pausedRef.current = false;
    if (mrRef.current) {
      try { mrRef.current.resume(); } catch { /* ignore */ }
      setStatus('listening');
    } else if (captionsRef.current && getSpeechRecognition()) {
      startRecognizer();
    } else {
      startRecorder();
    }
  }
  function retry() {
    start();
  }

  React.useEffect(() => () => { activeRef.current = false; teardownRecognizer(); teardownRecorder(); }, []);

  return { status, captions, finalText, interimText, seconds, start, stop, pause, resume, retry };
}

const FLOW_FLICK = 88; // px of vertical drag past which a release commits

function fmtClock(s) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function FlowScreen({ state, onAnswer, onExit }) {
  // Snapshot the deck at entry so answering doesn't reshuffle the slides
  // underneath the member.
  const queue = React.useMemo(
    () => PULSE_QUESTIONS.filter(q => q.feed === 'foryou' && !state.answered[q.id]),
    [],
  );
  const wasFirst = React.useRef(!state.hasAnsweredOnce);
  const total = queue.length;

  const [live, setLive] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const [results, setResults] = React.useState({}); // idx → { kind: 'answered' | 'skipped', text, cents }
  const [dragY, setDragY] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [typed, setTyped] = React.useState('');
  const [toast, setToast] = React.useState(null); // { cents, key }
  const capture = useFlowCapture();
  const busyRef = React.useRef(false);

  const atEnd = idx >= total;
  const q = queue[idx];
  const current = results[idx];
  const answeredCount = Object.values(results).filter(r => r.kind === 'answered').length;
  const skippedCount = Object.values(results).filter(r => r.kind === 'skipped').length;
  const earned = Object.values(results).reduce((a, r) => a + (r.kind === 'answered' ? r.cents : 0), 0);

  // What a release would do right now — shown as the drag cue and used on commit.
  const pendingText = typing ? typed.trim() : (capture.finalText + ' ' + capture.interimText).trim();
  const hasAnswer = !atEnd && current?.kind !== 'answered' &&
    (pendingText.length >= 2 || (!capture.captions && capture.seconds >= 2));

  function begin() {
    setLive(true);
    if (total > 0) capture.start(); // inside the tap — the mic prompt needs the gesture
  }

  function exit() {
    capture.stop();
    onExit({ earned, wasFirst: wasFirst.current });
  }

  // Leaving a slide commits it: said something → answered (points); silent → skipped.
  function leaveCurrent() {
    if (atEnd || current?.kind === 'answered') return;
    const cap = capture.stop();
    const text = typing ? typed.trim() : cap.text;
    const has = text.length >= 2 || (!capture.captions && cap.seconds >= 2);
    if (has) {
      setResults(x => ({ ...x, [idx]: { kind: 'answered', text, cents: q.cents } }));
      onAnswer({ qid: q.id, cents: q.cents, mode: typing ? 'text' : 'voice', text: text || null });
      setToast({ cents: q.cents, key: Date.now() });
      try { navigator.vibrate && navigator.vibrate(12); } catch { /* no haptics */ }
    } else {
      setResults(x => ({ ...x, [idx]: { kind: 'skipped', text: '', cents: 0 } }));
    }
  }

  function goTo(next) {
    if (busyRef.current) return;
    if (next < 0 || next > total) { setDragY(0); return; }
    busyRef.current = true;
    leaveCurrent();
    setIdx(next);
    setDragY(0);
    setTyping(false);
    setTyped('');
    // Skipped questions re-arm when revisited; answered ones are read-only.
    if (next < total && results[next]?.kind !== 'answered') capture.start();
    setTimeout(() => { busyRef.current = false; }, 320);
  }
  const goNext = () => goTo(idx + 1);
  const goPrev = () => goTo(idx - 1);

  // Tap = pause / resume, like tapping a reel pauses the video.
  function onTap() {
    if (atEnd || current?.kind === 'answered' || typing) return;
    if (capture.status === 'listening') capture.pause();
    else if (capture.status === 'paused') capture.resume();
    else if (capture.status === 'error' || capture.status === 'denied') capture.retry();
  }

  // Drag follows the finger 1:1; release past the threshold (or a quick flick)
  // commits. Listeners go on WINDOW so the gesture survives the finger leaving
  // the slide — same pattern as the onboarding deck.
  const ptr = React.useRef(null);
  const onPointerDown = (e) => {
    if (!live || busyRef.current) return;
    if (e.target.closest && e.target.closest('button, textarea, a, [data-nodrag]')) return;
    if (e.cancelable) e.preventDefault();
    const now = performance.now();
    ptr.current = { x0: e.clientX, y0: e.clientY, samples: [[now, e.clientY]] };
    setDragging(true);
    const move = (ev) => {
      const p = ptr.current;
      if (!p) return;
      const dy = ev.clientY - p.y0;
      p.samples.push([performance.now(), ev.clientY]);
      if (p.samples.length > 6) p.samples.shift();
      const edge = (dy > 0 && idx === 0) || (dy < 0 && atEnd);
      setDragY(edge ? dy * 0.3 : dy); // rubber-band at either end
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const p = ptr.current;
      ptr.current = null;
      setDragging(false);
      if (!p) return;
      const dy = ev.clientY - p.y0, dx = ev.clientX - p.x0;
      const [t1, y1] = p.samples[0];
      const v = (ev.clientY - y1) / Math.max(1, performance.now() - t1); // px per ms
      if (Math.abs(dy) < 6 && Math.abs(dx) < 6) { setDragY(0); onTap(); return; }
      if (dy < -FLOW_FLICK || (v < -0.5 && dy < -24)) goNext();
      else if (dy > FLOW_FLICK || (v > 0.5 && dy > 24)) goPrev();
      else setDragY(0);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  // Trackpad / mouse wheel (laptop demo) — accumulate, trigger once, then lock
  // out until the gesture settles.
  const wheel = React.useRef({ sum: 0, t: 0, lock: 0 });
  const onWheel = (e) => {
    if (!live) return;
    const w = wheel.current;
    const now = performance.now();
    if (now < w.lock) return;
    if (now - w.t > 300) w.sum = 0;
    w.t = now;
    w.sum += e.deltaY;
    // 60px: one mouse-wheel notch (Chrome reports 100, or 50 on a 2× display)
    // is enough; a trackpad swipe gets there in a few events and the lockout
    // stops its inertia tail from advancing twice.
    if (w.sum > 60) { w.sum = 0; w.lock = now + 900; goNext(); }
    else if (w.sum < -60) { w.sum = 0; w.lock = now + 900; goPrev(); }
  };

  // Keyboard (laptop demo): ↓ next, ↑ previous, space pause, esc exit.
  React.useEffect(() => {
    if (!live) return;
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goPrev(); }
      else if (e.key === ' ') { e.preventDefault(); onTap(); }
      else if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!live) {
    return <FlowIntro count={total} onStart={begin} onExit={() => onExit({ earned: 0, wasFirst: false })} />;
  }

  // Render the active slide and its neighbours only; they sit stacked
  // vertically and the whole stack follows the drag.
  const window_ = [];
  for (let i = Math.max(0, idx - 1); i <= Math.min(total, idx + 1); i++) window_.push(i);
  const slideStyle = (i) => ({
    position: 'absolute', inset: 0,
    transform: `translateY(calc(${(i - idx) * 100}% + ${dragY}px))`,
    transition: dragging ? 'none' : 'transform .28s cubic-bezier(.2,.8,.2,1)',
    willChange: 'transform',
  });

  const dragUp = dragY < -8, dragDown = dragY > 8;
  const cueStrength = Math.min(1, Math.abs(dragY) / FLOW_FLICK);
  const cue = dragUp
    ? (atEnd ? null : current?.kind === 'answered' ? 'Next' : hasAnswer ? `Send · +${q.cents} pts` : 'Skip')
    : dragDown ? (idx === 0 ? null : 'Previous') : null;

  return (
    <div
      onPointerDown={onPointerDown}
      onWheel={onWheel}
      style={{
        position: 'relative', height: '100%', overflow: 'hidden',
        background: INK, color: '#fff',
        touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
        cursor: dragging ? 'grabbing' : 'default',
      }}>
      {window_.map(i => (
        <div key={i} style={slideStyle(i)}>
          {i < total ? (
            <FlowSlide
              q={queue[i]}
              active={i === idx}
              result={results[i]}
              capture={i === idx ? capture : null}
              typing={i === idx && typing}
              typed={typed}
              onTyped={setTyped}
              onTypeInstead={() => { capture.pause(); setTyping(true); }}
              onTalkInstead={() => { setTyping(false); capture.resume(); }}
              onRetry={capture.retry}
              onNext={goNext}
            />
          ) : (
            <FlowEndCard earned={earned} answered={answeredCount} skipped={skippedCount} onDone={exit} />
          )}
        </div>
      ))}

      {/* Fixed chrome — doesn't move with the drag: progress rail, exit, position, points. */}
      <div data-nodrag style={{
        position: 'absolute', left: 0, right: 0, top: 0, zIndex: 5,
        padding: 'var(--li-top-pad, 58px) 16px 0',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {queue.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < idx || results[i]?.kind === 'answered'
                ? PRIMARY
                : i === idx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
              transition: 'background .2s',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={exit} aria-label="Exit flow mode" style={{
            pointerEvents: 'auto',
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}><I.close /></button>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
            {atEnd ? 'Done' : `${idx + 1} of ${total}`}
          </div>
          <div style={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>
            {!atEnd && <PointsStamp points={q.cents} />}
          </div>
        </div>
      </div>

      {/* Points toast — small and out of the way, the next question is already listening. */}
      {toast && (
        <div key={toast.key} style={{
          position: 'absolute', left: '50%', top: 'calc(var(--li-top-pad, 58px) + 66px)', zIndex: 6,
          transform: 'translateX(-50%)',
          background: PRIMARY, color: '#fff', borderRadius: 999,
          padding: '8px 14px', fontSize: 13, fontWeight: 800, letterSpacing: 0.4,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          animation: 'flow-toast 1.5s ease forwards',
        }}>+{toast.cents} pts · Sent</div>
      )}

      {/* Directional cue while dragging. */}
      {cue && (
        <div style={{
          position: 'absolute', left: '50%', zIndex: 6,
          [dragUp ? 'bottom' : 'top']: dragUp ? 'calc(28px + env(safe-area-inset-bottom))' : 'calc(var(--li-top-pad, 58px) + 70px)',
          transform: 'translateX(-50%)',
          background: cue.startsWith('Send') ? PRIMARY : 'rgba(255,255,255,0.16)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', borderRadius: 999, padding: '9px 16px',
          fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          opacity: cueStrength, pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>{cue}</div>
      )}
    </div>
  );
}

function FlowIntro({ count, onStart, onExit }) {
  const mins = Math.max(1, Math.round((count * 20) / 60));
  const steps = [
    ['A question comes up.', 'The mic is already listening — no button to find.'],
    ['Say your answer out loud.', 'You see the words as you talk. Tap to pause.'],
    ['Flick up to send it.', 'The next one slides in. Flick without talking to skip.'],
  ];
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: INK, color: '#fff',
      padding: 'calc(var(--li-top-pad, 58px) + 8px) 22px calc(22px + env(safe-area-inset-bottom))',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Eyebrow tone="glass">Flow mode</Eyebrow>
        <button onClick={onExit} aria-label="Close" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><I.close /></button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1.08, textWrap: 'balance' }}>
          Just talk.<br/>Flick up for<br/>the next one.
        </div>
        {count > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map(([t, s], i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: PRIMARY, color: '#fff', fontWeight: 800, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{t}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', marginTop: 3, lineHeight: 1.45 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
            You've answered everything for today. New questions show up every day.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {count > 0 ? (
          <React.Fragment>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.2 }}>
              {count} {count === 1 ? 'question' : 'questions'} · about {mins} min · anonymous · we'll ask for the mic once
            </div>
            <PButton onClick={onStart}>Start listening →</PButton>
          </React.Fragment>
        ) : (
          <PButton onClick={onExit}>Back to feed</PButton>
        )}
      </div>
    </div>
  );
}

// A pulsing 5-bar meter — "we're listening" at a glance.
function FlowMeter({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 18 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 3, height: 18, borderRadius: 2, background: PRIMARY,
          transformOrigin: 'center',
          transform: active ? undefined : 'scaleY(0.3)',
          animation: active ? `wave-bar 0.${5 + (i % 3)}s ease-in-out ${i * 90}ms infinite` : 'none',
          opacity: active ? 1 : 0.5,
        }} />
      ))}
    </div>
  );
}

function FlowSlide({ q, active, result, capture, typing, typed, onTyped, onTypeInstead, onTalkInstead, onRetry, onNext }) {
  const hero = q.review?.media?.length
    ? (q.review.media.find(m => m.type === 'image') || q.review.media[0])
    : null;
  const heroSrc = hero && hero.type === 'image' ? hero.src : null;
  const answered = result?.kind === 'answered';
  const status = capture ? capture.status : 'idle';
  const listening = status === 'listening';

  // Keep the newest words in view.
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [capture?.finalText, capture?.interimText]);

  let statusLine;
  if (answered) statusLine = null;
  else if (!capture) statusLine = null;
  else if (typing) statusLine = <span>Typing · <button onClick={onTalkInstead} style={flowLinkStyle}>talk instead</button></span>;
  else if (status === 'listening') statusLine = <span>{capture.captions ? 'Listening' : 'Recording'} · {fmtClock(capture.seconds)}</span>;
  else if (status === 'paused') statusLine = <span>Paused · tap to resume</span>;
  else if (status === 'denied') statusLine = <span style={{ color: '#FFB4A6' }}>Mic blocked — allow it in Settings, or type below.</span>;
  else if (status === 'error') statusLine = <span style={{ color: '#FFB4A6' }}>Couldn't reach the mic. <button onClick={onRetry} style={flowLinkStyle}>Try again</button></span>;
  else statusLine = <span>Starting…</span>;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: INK, color: '#fff',
    }}>
      {heroSrc && (
        <React.Fragment>
          <img src={heroSrc} alt="" draggable={false} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            opacity: 0.2, pointerEvents: 'none',
          }} />
          {/* Flat scrim (no gradients per the design rules) — kept heavy so the
              question and the live captions always win over the product shot. */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,27,25,0.62)' }} />
        </React.Fragment>
      )}

      <div style={{
        position: 'relative', height: '100%', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        padding: 'calc(var(--li-top-pad, 58px) + 70px) 22px calc(20px + env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <Eyebrow tone="glass">{q.buyerType}</Eyebrow>
          {q.review && <Eyebrow tone="glass">Product review</Eyebrow>}
          {q.trial && <Eyebrow tone="glass">Trial · paid by LoopedIn</Eyebrow>}
        </div>
        <div style={{
          fontSize: q.review ? 23 : 26, fontWeight: 800, letterSpacing: -0.6,
          lineHeight: 1.2, textWrap: 'balance',
        }}>{q.text}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', marginTop: 10, lineHeight: 1.5 }}>
          Paid by <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{q.buyer}</span> · anonymous
        </div>

        {/* Transcript — the words fill in from the bottom as you talk. */}
        <div ref={scrollRef} style={{
          flex: 1, minHeight: 0, marginTop: 18, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          {answered ? (
            <div>
              {result.text && (
                <div style={{ fontSize: 19, lineHeight: 1.4, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.2 }}>
                  {result.text}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: PRIMARY, color: '#fff', borderRadius: 999,
                  padding: '6px 12px', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
                }}><I.check style={{ width: 14, height: 14 }} /> Sent · +{result.cents} pts</span>
              </div>
            </div>
          ) : typing ? (
            <textarea
              data-nodrag
              value={typed}
              onChange={e => onTyped(e.target.value.slice(0, 280))}
              placeholder="Type a short, honest answer."
              autoFocus
              style={{
                width: '100%', minHeight: 120, boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 14, padding: 14, color: '#fff', outline: 'none', resize: 'none',
                fontFamily: 'inherit', fontSize: 17, lineHeight: 1.5,
              }}
            />
          ) : capture && (capture.finalText || capture.interimText) ? (
            <div style={{ fontSize: 21, lineHeight: 1.4, letterSpacing: -0.3, textWrap: 'pretty' }}>
              <span style={{ color: '#fff' }}>{capture.finalText}</span>
              {capture.interimText && (
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{capture.finalText ? ' ' : ''}{capture.interimText}</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 19, lineHeight: 1.4, color: 'rgba(255,255,255,0.4)', letterSpacing: -0.2 }}>
              {!capture ? '' : capture.captions ? 'Say your answer — your words show up here.' : 'Say your answer. Live captions aren\'t available on this device, so we\'re recording your voice.'}
            </div>
          )}
        </div>

        {/* Status row + next control. */}
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {!answered && <FlowMeter active={listening && !typing} />}
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.78)', fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{answered ? 'Answered' : statusLine}</div>
          </div>
          {active && (
            <button onClick={onNext} style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 999, padding: '10px 14px',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 800, letterSpacing: 1,
              textTransform: 'uppercase', cursor: 'pointer', minHeight: 40,
            }}>
              {answered ? 'Next' : 'Flick up'}
              <span style={{ display: 'inline-block', animation: 'flow-bob 1.2s ease-in-out infinite' }}>↑</span>
            </button>
          )}
        </div>
        {!answered && capture && !typing && (status === 'listening' || status === 'paused' || status === 'denied' || status === 'error') && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            Flick up when you're done · flick up without talking to skip ·{' '}
            <button onClick={onTypeInstead} style={flowLinkStyle}>type instead</button>
          </div>
        )}
      </div>
    </div>
  );
}

const flowLinkStyle = {
  background: 'transparent', border: 0, padding: '8px 2px', margin: '-8px -2px',
  color: 'inherit', font: 'inherit', textTransform: 'none', letterSpacing: 'inherit',
  textDecoration: 'underline', cursor: 'pointer',
};

function FlowEndCard({ earned, answered, skipped, onDone }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: INK, color: '#fff',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      padding: 'calc(var(--li-top-pad, 58px) + 70px) 22px calc(22px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1.08 }}>
          You're all caught up.
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: PRIMARY, letterSpacing: -1.5, lineHeight: 1 }}>+{earned}</span>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: PRIMARY }}>pts</span>
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
          {answered} {answered === 1 ? 'answer' : 'answers'} sent{skipped ? ` · ${skipped} skipped` : ''}. Paid to your LoopedIn wallet. New questions show up every day.
        </div>
      </div>
      <PButton onClick={onDone}>Back to feed</PButton>
    </div>
  );
}

// Feed entry point for Flow mode.
function FlowCard({ count, onStart }) {
  const mins = Math.max(1, Math.round((count * 20) / 60));
  return (
    <div style={{
      background: INK, color: '#fff', borderRadius: 16,
      padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15 }}>
        Just talk. Flick up for the next one.
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
        The mic is already listening when a question comes up. Say your answer, flick up, and the next one's there — hands-free.
      </div>
      <PButton onClick={onStart} style={{ marginTop: 2 }}>Flow mode →</PButton>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', letterSpacing: 0.2 }}>
        {count} {count === 1 ? 'question' : 'questions'} · about {mins} min · anonymous
      </div>
    </div>
  );
}


// ===== source: 25602658 =====
// Pulse — orchestrator. Owns app state, screen routing, modals, points animation.

// The standalone offline demo (/demo) keeps its own state, so presenting never
// disturbs — and is never disturbed by — the real member app on the same origin.
const STORAGE_KEY =
  typeof window !== 'undefined' && (window as any).__LOOPEDIN_FLOW__
    ? 'pulse-flow-state-v1'
    : typeof window !== 'undefined' && (window as any).__LOOPEDIN_DEMO__
      ? 'pulse-demo-state-v1'
      : 'pulse-respondent-state-v1';

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

  // Pull-to-refresh (phones). The app pins <body> and scrolls each screen in
  // its own container, which defeats Safari's native pull-to-refresh — so we
  // do it ourselves: drag down from the top of any screen to reload. That
  // also pulls the newest build past the service worker's cache. Gesture
  // surfaces (the onboarding deck, Flow mode) own their drags and are skipped.
  const screenRef = React.useRef(null);
  const [pull, setPull] = React.useState(0);          // indicator offset, px
  const [refreshing, setRefreshing] = React.useState(false);
  const pullRef = React.useRef({ y0: 0, armed: false, pulling: false, px: 0 });
  const PULL_THRESH = 72;
  React.useEffect(() => {
    const el = screenRef.current;
    const isReview = state.screen === 'answer' && !!findQuestion(state.qid)?.review;
    if (!el || ['onboarding', 'flow'].includes(state.screen) || isReview) return;
    // Only arm when every scroller between the finger and the screen is at the top.
    const atTop = (target) => {
      let n = target;
      while (n && n !== el.parentNode) {
        if (n.scrollTop > 0) return false;
        n = n.parentNode;
      }
      return true;
    };
    const onStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.target;
      const onControl = !!(t && t.closest && t.closest('textarea, input, audio, video, select'));
      pullRef.current = { y0: e.touches[0].clientY, x0: e.touches[0].clientX, armed: !onControl && atTop(t), pulling: false, px: 0 };
    };
    const onMove = (e) => {
      const p = pullRef.current;
      if (!p.armed) return;
      const dy = e.touches[0].clientY - p.y0;
      const dx = Math.abs(e.touches[0].clientX - p.x0);
      // Classify once: a sideways or upward move is a scroll/swipe, never a
      // pull — and after that this touch never re-arms (the browser has
      // already committed to scrolling).
      if (!p.pulling) {
        if (dy < 0 || dx > 10 || (dx > dy && dx > 4)) { p.armed = false; return; }
        if (dy < 12) return; // slop: don't claim the gesture yet
      }
      if (!atTop(e.target)) {
        if (p.pulling) { p.pulling = false; p.px = 0; setPull(0); }
        p.armed = false;
        return;
      }
      p.pulling = true;
      if (e.cancelable) e.preventDefault(); // no rubber-band under the indicator
      p.px = Math.min(110, dy * 0.5);
      setPull(p.px);
    };
    const onEnd = () => {
      const p = pullRef.current;
      if (p.pulling && p.px >= PULL_THRESH) {
        setRefreshing(true);
        setPull(PULL_THRESH);
        setTimeout(() => window.location.reload(), 120);
      } else {
        setPull(0);
      }
      p.armed = false; p.pulling = false; p.px = 0;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [state.screen, state.qid]);

  // Picker sheet (profile field picker)
  const [picker, setPicker] = React.useState(null); // { field, options, title } | null
  const [sheet, setSheet] = React.useState(null);   // 'year' | 'address' | 'notes' | null

  React.useEffect(() => { saveState(state); }, [state]);

  function navigate(target) {
    if (typeof target === 'string') {
      setState(s => ({ ...s, screen: target, qid: null }));
    } else {
      setState(s => ({ ...s, ...target }));
    }
  }

  // Book an answer into state: mark it answered, credit the points, log it.
  // Shared by the classic answer screens and Flow mode.
  function reduceAnswer(s, { qid, cents, mode, text, addTag, qualifies, tag, reaction }) {
    if (s.answered[qid]) return s; // already booked — a double tap must not pay twice
    const usedTag = addTag || tag;
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...s,
      todayDate: today,
      todayCents: (s.todayDate === today ? (s.todayCents || 0) : 0) + cents,
      answered: { ...s.answered, [qid]: true },
      qualifiedFor: usedTag && qualifies ? { ...s.qualifiedFor, [usedTag]: true } : s.qualifiedFor,
      history: [{ qid, cents, mode, text: text ?? null, reaction: reaction || null, ts: Date.now() }, ...s.history],
      hasAnsweredOnce: true,
      lastAnsweredId: qid,
      lastAnsweredFromFeed: true,
      pendingCents: s.pendingCents + cents,
      cents: s.cents + cents,
    };
  }

  // A reaction chip (product reviews) travels with the text so the server
  // sees it too: "I'd buy it — the label looks premium".
  function serverText(payload) {
    const parts = [payload.reaction, payload.text].filter(Boolean);
    return parts.length ? parts.join(' — ') : null;
  }

  const celebrationTimer = React.useRef(null);
  function onAnswered(payload) {
    const { qid, cents, mode } = payload;
    if (state.answered[qid] || celebrationTimer.current) return; // double tap
    // Persist the answer if the member has claimed (has a token). Pre-claim
    // answers are held client-side and replayed to the server on claim.
    if (getToken('member')) {
      memberApi.answer(qid, serverText(payload), mode).catch(() => {});
    }
    const firstAnswer = !state.hasAnsweredOnce;

    setState(s => reduceAnswer(s, payload));

    setCelebration({ cents });
    celebrationTimer.current = setTimeout(() => {
      celebrationTimer.current = null;
      setCelebration(null);
      // First answer → save-your-earnings. Otherwise back to the feed, where
      // the next question is waiting at the top. (Auto-jumping straight into
      // the next question's media read as a glitch — Flow mode is the place
      // for the continuous feed.) Only move if the member is still on this
      // question — a Back tap during the celebration wins.
      setState(s => (s.screen === 'answer' && s.qid === qid)
        ? { ...s, screen: firstAnswer ? 'claim' : 'feed', qid: null }
        : s);
    }, 1300);
  }
  React.useEffect(() => () => { if (celebrationTimer.current) clearTimeout(celebrationTimer.current); }, []);

  // Flow mode books answers without the celebration overlay or a screen
  // change — the next question is already on screen and listening.
  function onFlowAnswered(payload) {
    if (getToken('member')) {
      memberApi.answer(payload.qid, serverText(payload), payload.mode).catch(() => {});
    }
    setState(s => reduceAnswer(s, payload));
  }
  // Leaving Flow mode mirrors the classic flow's first-answer rule: the first
  // points ever earned lead to the save-your-earnings screen.
  function onFlowExit({ earned, wasFirst }) {
    setState(s => ({
      ...s,
      screen: earned > 0 && wasFirst && !s.claimed ? 'claim' : 'feed',
      qid: null,
    }));
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
        await memberApi.answer(h.qid, serverText(h), h.mode).catch(() => {});
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
    if (patch.openSheet) {
      setSheet(patch.openSheet);
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
        // Only a rejected token logs the member out; a flaky network must not.
        if (e && (e.status === 401 || e.status === 403)) setToken('member', null);
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
        state={state}
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
    case 'answer': {
      // Review questions (media + reactions) open the full-screen story flow;
      // classic questions keep the standard answer screen.
      const activeQ = findQuestion(state.qid);
      const backTo = () => navigate(state.hasAnsweredOnce ? 'feed' : 'onboarding');
      body = activeQ?.review ? (
        <ReviewScreen
          state={state}
          qid={state.qid}
          back={backTo}
          onSubmit={onAnswered}
          onSkipNext={() => {
            const next = PULSE_QUESTIONS.find(x =>
              x.feed === 'foryou' && !state.answered[x.id] && x.id !== state.qid);
            if (next) setState(s => ({ ...s, qid: next.id }));
            else navigate(state.hasAnsweredOnce ? 'feed' : 'onboarding');
          }}
        />
      ) : (
        <AnswerScreen
          state={state}
          qid={state.qid}
          back={backTo}
          onSubmit={onAnswered}
        />
      );
      break;
    }
    case 'flow':
      body = <FlowScreen state={state} onAnswer={onFlowAnswered} onExit={onFlowExit} />;
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
      <IOSDevice
        width={402} height={874} activeScreen={state.screen}
        dark={state.screen === 'flow' || (state.screen === 'answer' && !!findQuestion(state.qid)?.review)}
      >
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
          {/* Scrollable screen body — keyed per screen so switches replay the
              li-screen-in transition (member.css) and start scrolled to top.
              (Deliberately NOT a skeleton state: screens are instant local
              data, so a loader would only add fake delay.) */}
          <div key={`${state.screen}:${state.qid || ''}`} ref={screenRef} className="li-screen" style={{
            flex: '1 1 auto',
            minHeight: 0,
            // 'answer' and 'onboarding' are fixed to the viewport (own internal
            // scroll / no scroll). 'claim' is a tall form that must scroll — it
            // owns no inner scroller, so let this wrapper scroll it. Everything
            // else (feed/wallet/streaks/profile) scrolls here too.
            overflowY: ['answer', 'onboarding', 'flow'].includes(state.screen) ? 'hidden' : 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            display: ['answer', 'onboarding', 'flow'].includes(state.screen) ? 'flex' : 'block',
            flexDirection: 'column',
          }}>
            {body}
          </div>

          {/* Pull-to-refresh indicator — rides down with the finger, flips at the threshold. */}
          {pull > 0 && (
            <div aria-hidden style={{
              position: 'absolute', left: '50%', top: 'var(--li-top-pad, 58px)', zIndex: 40,
              transform: `translate(-50%, ${pull - 44}px)`,
              transition: refreshing ? 'transform .2s ease' : 'none',
              display: 'flex', alignItems: 'center', gap: 8,
              background: SURFACE, border: `1px solid ${BORDER_2}`, borderRadius: 999,
              padding: '7px 12px 7px 9px', pointerEvents: 'none',
              opacity: Math.min(1, pull / 40),
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', background: PRIMARY, color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, lineHeight: 1,
                transform: pull >= PULL_THRESH ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform .2s ease',
              }}>↓</span>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: INK_2 }}>
                {refreshing ? 'Refreshing' : pull >= PULL_THRESH ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          )}

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
          {/* Input sheets live here (siblings of the tab bar) — see ProfileScreen note. */}
          {sheet === 'year' && (
            <BirthYearSheet
              value={state.profile.birthYear}
              onSave={(y) => {
                // Age-derived tags are automatic, not hand-tapped: keep the
                // "Senior (65+)" tag in sync with the entered birth year.
                const age = new Date().getFullYear() - y;
                setState(s => {
                  const tags = (s.profile.tags || []).filter(x => x !== 'senior');
                  if (age >= 65) tags.push('senior');
                  return { ...s, profile: { ...s.profile, birthYear: y, tags } };
                });
                setSheet(null);
              }}
              onClose={() => setSheet(null)}
            />
          )}
          {sheet === 'address' && (
            <AddressSheet
              value={state.profile.address}
              onSave={(addr) => {
                // Store full address AND surface zip at the top level for filtering.
                setState(s => ({ ...s, profile: { ...s.profile, address: addr, zip: addr.zip } }));
                setSheet(null);
              }}
              onClose={() => setSheet(null)}
            />
          )}
          {sheet === 'notes' && (
            <NotesSheet
              value={state.profile.notes}
              onSave={(t) => {
                setState(s => ({ ...s, profile: { ...s.profile, notes: t } }));
                setSheet(null);
              }}
              onClose={() => setSheet(null)}
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
    ...(FLOW_ENABLED ? [{ id: 'flow', label: '8. Flow mode (just talk)' }] : []),
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

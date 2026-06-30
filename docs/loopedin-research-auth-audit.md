# LoopedIn Research — WorkOS gate: security audit + ready-to-use auth files

**Status: handoff reference.** `loopedin-research` (the standalone, login-gated
Next.js App Router home for the Vox tool at `loopedin.rbl1.com`) is **not yet a
repo**. This document carries the audited, corrected auth layer so it isn't lost
between sessions. **Delete this file once the real repo exists and these files
have been copied in.**

It lives in `loopedin-demo` only because that's the repo a follow-up session can
read. None of it is wired into the LoopedIn build (it's plain reference under
`docs/`), so it does not affect `weloopedin.com`.

---

## What this is

A WorkOS **direct-gate** (no AuthKit middleware), same pattern as Signal. The
root layout server-verifies the sealed `wos-session` cookie on every request;
the cookie is set on `domain=.rbl1.com` with the **same name + `WORKOS_COOKIE_PASSWORD`
as Signal**, so a user already signed in on `signal.rbl1.com` is authenticated
here with no second login.

## Security audit result (11 points)

| # | Item | Result |
|---|------|--------|
| 1 | Gate never 500s on a bad cookie | ✅ already correct — `getUser()` try/catches `loadSealedSession()`+`authenticate()` (covers the unseal throw *and* a JWKS/JWT throw) → returns `null` → redirect to sign-in |
| 2 | `/callback` never 500s on a bad code | ✅ already correct — `authenticateWithCode()` is try/caught → redirect home |
| 3 | Fail **closed** in production | 🔧 **FIXED** — added `isAuthConfigured()`; in prod, missing env → "unavailable" notice, never content (preview/dev render openly) |
| 4 | Service-role key server-only | ✅ N/A — no Supabase anywhere; no `SERVICE_ROLE` key in any file/env/`NEXT_PUBLIC_` |
| 5 | Every data path behind the gate | ✅ only route handler is `/callback` (auth); dashboard is static baked data behind the layout gate; no unauthenticated data endpoint |
| 6 | Authorization off server identity | 🔧 **FIXED** — `/denied` redirect looped (it re-enters the gate); now renders inline. Check itself was already server-side off the verified email |
| 7 | No legacy Supabase-Auth login | ✅ no `/login`, no sign-in form, no `supabase.auth.*` |
| 8 | Cookie config matches Signal | ✅ `wos-session`, sealed, `httpOnly`+`secure`+`sameSite=lax`, `domain=.rbl1.com`, `path=/` |
| 9 | No open redirects | 🔧 **FIXED** — `state.startsWith('/')` allowed `//evil.com` / `/\evil.com` (resolve to a foreign host). Now same-origin-resolution checked |
| 10 | `NEXT_PUBLIC_` audit | ✅ only `NEXT_PUBLIC_WORKOS_REDIRECT_URI` (a non-secret URL) is public |
| 11 | Security headers incl. CSP | 🔧 **FIXED** — added CSP; tightened `X-Frame-Options` to `DENY` |

### The 4 bugs fixed (detail)

1. **Open redirect (#9).** `dest = state.startsWith('/') ? state : '/'` — but
   `'//evil.com'.startsWith('/')` is `true` and `new URL('//evil.com', origin)`
   resolves to `https://evil.com`. A crafted `state` round-tripped through WorkOS
   would send the user off-site. Fixed by resolving `state` against our origin
   and accepting only same-origin targets (verified: `//evil.com`, `/\evil.com`,
   `https://evil.com`, `javascript:` all → `/`).
2. **No fail-closed in prod (#3).** No check that auth was configured; missing
   env in prod → broken redirect / possible 500. Added `isAuthConfigured()` and
   a production fail-closed branch in the layout.
3. **Authorization redirect loop (#6).** `redirect('/denied')` from the root
   layout loops forever (`/denied` re-enters the same gate). Now renders the
   denial inline.
4. **Missing CSP (#11).** Added `Content-Security-Policy`; set `X-Frame-Options:
   DENY` to match `frame-ancestors 'none'`. CSP uses `'unsafe-inline'` for
   script/style (Next emits inline hydration scripts; Vox uses inline style
   attributes) — a nonce-based CSP via middleware is the stricter follow-up.

### Expected behavior
- **Unauthenticated request → 307** to the WorkOS hosted AuthKit URL.
- **Already signed in on `signal.rbl1.com` → straight in**, no second login —
  **provided Signal uses the identical cookie name (`wos-session`) and
  `WORKOS_COOKIE_PASSWORD`, and the cookie domain is `.rbl1.com` on both.** This
  is the one external dependency to confirm.

---

## Bootstrap steps (in the new `loopedin-research` session)

1. Create the files below verbatim.
2. **Port the Vox UI** from `loopedin-demo/web/src/vox/` into `app/vox/`:
   - Copy `data.ts`, `lib/suppression.ts`, `lib/source.ts`, and `styles/vox.css`
     → `app/vox/` (css as `app/vox/vox.css`).
   - Turn `app.tsx` into `app/vox/VoxDashboard.tsx`: add `'use client'` at the
     top, **remove** the bottom `createRoot(...).render(...)` block, and
     `export default function VoxDashboard()` returning the existing `<App/>` JSX
     (or rename `App` → `VoxDashboard`).
3. `npm install` then `npm run build` — must pass.
4. Vercel: new project, framework **Next.js**, env vars from `.env.example`
   (real values = Signal's), add domain `loopedin.rbl1.com` (CNAME), register
   `https://loopedin.rbl1.com/callback` as a WorkOS redirect URI.
5. Only after it's verified working: remove/redirect the public `/vox.html` in
   `loopedin-demo` (separate change).

---

## Corrected files

### `lib/auth.js`
```js
// rbl1 WorkOS direct-gate (same pattern as Signal). No authkit middleware.
// Server-verifies the sealed session cookie on EVERY request via
// session.authenticate(). The cookie is set on .rbl1.com with the SAME name +
// cookiePassword as Signal, so a user already logged in on signal.rbl1.com is
// authenticated here with no second login.

import { WorkOS } from '@workos-inc/node';
import { cookies } from 'next/headers';

export const workos = new WorkOS(process.env.WORKOS_API_KEY, {
  clientId: process.env.WORKOS_CLIENT_ID,
});

// MUST match Signal's cookie name exactly for cross-subdomain SSO to share.
// `wos-session` is the WorkOS/AuthKit default — confirm Signal uses the same.
export const SESSION_COOKIE = 'wos-session';
const cookiePassword = process.env.WORKOS_COOKIE_PASSWORD;

// True only when every WorkOS env var the gate needs is present. Used to fail
// CLOSED in production (app/layout.js) instead of serving protected content
// unauthenticated when auth is misconfigured.
export function isAuthConfigured() {
  return Boolean(
    process.env.WORKOS_API_KEY &&
    process.env.WORKOS_CLIENT_ID &&
    process.env.WORKOS_COOKIE_PASSWORD &&
    process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  );
}

// Hosted AuthKit login URL we send unauthenticated users to.
export function getSignInUrl(state = '/') {
  return workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId: process.env.WORKOS_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    state,
  });
}

// Read + cryptographically verify the session on the server, every request.
// Returns the user object or null. NEVER trusts the cookie without
// authenticate(); a corrupt/foreign/rotated cookie throws inside unsealData (or
// authenticate's JWKS/JWT check can throw) — we swallow it and return null so
// the caller redirects to a fresh sign-in instead of 500ing.
export async function getUser() {
  const sealed = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sealed) return null;
  try {
    const session = workos.userManagement.loadSealedSession({
      sessionData: sealed,
      cookiePassword,
    });
    const r = await session.authenticate();
    if (r.authenticated) return r.user;
    return null;
  } catch {
    return null;
  }
}

// Optional: restrict to the rbl1 org domain even if WorkOS allows others.
// Keyed off the WorkOS-verified user.email (server-side) — never a client value.
export function isAllowed(user) {
  const allow = process.env.ALLOWED_EMAIL_DOMAIN; // e.g. "rbl1.com"
  if (!allow) return true;
  return typeof user?.email === 'string' && user.email.toLowerCase().endsWith('@' + allow);
}
```

### `app/layout.js`
```js
// Root layout = the gate. Server component: verifies the session on every page
// render. No session → redirect to WorkOS hosted login. Route handlers
// (/callback) and static assets (/_next, /public) are not wrapped by the layout,
// so they are naturally exempt — exactly the routes we want open.

import './vox/vox.css';
import { redirect } from 'next/navigation';
import { isAuthConfigured, getUser, getSignInUrl, isAllowed } from '../lib/auth.js';

export const metadata = {
  title: 'LoopedIn Vox — Rebel One',
  description: 'Live community-research insights. Internal Rebel One (RBL1) tool.',
  robots: { index: false, follow: false }, // internal tool
};

// Always render fresh — never cache a gated page.
export const dynamic = 'force-dynamic';

function Shell({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Self-contained notice (no external CSS dependency) for the fail-closed and
// not-authorized states. Rendered INLINE — never redirect to a gated route.
function Notice({ title, body }) {
  return (
    <Shell>
      <div style={{ minHeight: '100vh', background: '#0e1116', color: '#e6edf3', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <main style={{ maxWidth: 520, margin: '0 auto', padding: '15vh 24px 0' }}>
          <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>{title}</h1>
          <p style={{ color: '#9aa7b4', lineHeight: 1.55, margin: 0 }}>{body}</p>
        </main>
      </div>
    </Shell>
  );
}

export default async function RootLayout({ children }) {
  // Fail CLOSED in production if auth isn't configured — never serve protected
  // content unauthenticated. Preview/dev may render openly for review.
  if (!isAuthConfigured()) {
    if (process.env.VERCEL_ENV === 'production') {
      return <Notice title="Temporarily unavailable" body="This tool isn’t available right now. Please try again later." />;
    }
    return <Shell>{children}</Shell>; // preview / local dev: open for review
  }

  const user = await getUser();
  if (!user) redirect(getSignInUrl('/'));

  // Authorization, keyed off the WorkOS-verified email (server-side). Render the
  // denial INLINE — redirecting to a gated route (e.g. /denied) would re-enter
  // this layout, fail the same check, and loop forever.
  if (!isAllowed(user)) {
    return <Notice title="Access restricted" body="Your account isn’t authorized for this tool. Contact Rebel One if you believe this is a mistake." />;
  }

  return <Shell>{children}</Shell>;
}
```

### `app/callback/route.js`
```js
// WorkOS callback — the ONLY route exempt from the gate. Exchanges the auth code
// for a sealed session and sets it as an httpOnly + secure cookie on .rbl1.com
// so it is shared across every *.rbl1.com tool (Signal, LoopedIn, …).

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { workos, SESSION_COOKIE } from '../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/';
  if (!code) return NextResponse.redirect(new URL('/', origin));

  try {
    const { sealedSession } = await workos.userManagement.authenticateWithCode({
      clientId: process.env.WORKOS_CLIENT_ID,
      code,
      session: { sealSession: true, cookiePassword: process.env.WORKOS_COOKIE_PASSWORD },
    });

    (await cookies()).set(SESSION_COOKIE, sealedSession, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      domain: process.env.WORKOS_COOKIE_DOMAIN || '.rbl1.com',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Open-redirect guard: resolve `state` against our own origin and accept it
    // only if it stays same-origin. Rejects protocol-relative ("//evil.com"),
    // backslash ("/\\evil.com"), and absolute ("https://evil.com") targets that
    // new URL() would otherwise send the user to off-site.
    let dest = '/';
    try {
      const u = new URL(state, origin);
      if (u.origin === origin) dest = u.pathname + u.search;
    } catch { /* malformed state → fall back to '/' */ }
    return NextResponse.redirect(new URL(dest, origin));
  } catch (e) {
    console.error('WorkOS callback failed:', e);
    return NextResponse.redirect(new URL('/?auth_error=1', origin));
  }
}
```

### `app/page.js`
```js
// Home ("/") = the Vox dashboard. The gate already ran in layout.js, so reaching
// here means the request is authenticated. We just render the ported Vox UI
// (an unchanged client component) full-screen.

import VoxDashboard from './vox/VoxDashboard';

export default function Page() {
  return <VoxDashboard />;
}
```

### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.workos.com; form-action 'self' https://api.workos.com" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

### `package.json`
```json
{
  "name": "loopedin-research",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@workos-inc/node": "^7.43.0",
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2"
  }
}
```

### `next.config.mjs`
```js
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
export default nextConfig;
```

### `.env.example`
```
# Same WorkOS environment as Signal — these must MATCH Signal's values exactly
# for single-sign-on to share across *.rbl1.com.
WORKOS_API_KEY=sk_...                 # same as Signal (SERVER-ONLY, never NEXT_PUBLIC)
WORKOS_CLIENT_ID=client_...           # same as Signal
WORKOS_COOKIE_PASSWORD=...            # same as Signal (≥32 chars; must be identical)
WORKOS_COOKIE_DOMAIN=.rbl1.com        # shares the session cookie across subdomains
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://loopedin.rbl1.com/callback

# Optional: lock sign-in to the rbl1 org domain even if WorkOS allows others.
ALLOWED_EMAIL_DOMAIN=rbl1.com
```

### `.gitignore`
```
/node_modules
/.next
/out
.env
.env*.local
.DS_Store
*.log
```

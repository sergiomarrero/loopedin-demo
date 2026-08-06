// Edge Middleware — gate the whole site behind a shared password.
//
// UX matches rbl1.com/studio.html: a branded, centered "Private Preview" card
// with a password field and an Unlock button — not the browser's raw Basic-Auth
// popup this used to show.
//
// Enforcement is SERVER-SIDE (unlike the studio page, which decrypts a blob in
// the browser): nothing behind the gate reaches the client until the password is
// correct, so this is the stronger of the two.
//
// PASSWORD
//   • SITE_PASSWORD (Vercel → Settings → Environment Variables) always wins.
//   • With no env var set it falls back to the shared demo password, stored here
//     only as a SHA-256 digest so the literal string isn't sitting in a PUBLIC
//     repo. That is obfuscation, NOT secrecy — a short passphrase is trivially
//     recovered from its hash. Set SITE_PASSWORD for real protection.
//   • The gate is never silently OFF: with no env var the fallback still applies.

export const config = {
  // Gate everything except Vercel internals and the font the gate itself uses.
  matcher: ['/((?!_vercel/|inter\\.woff2).*)'],
};

// sha256('betterfuture') — see PASSWORD note above.
const FALLBACK_PASSWORD_SHA256 = 'd39e53e9d14e9b08e814ceec69f86118685ee80ca2ce5630b3401ecf0376ae81';

const COOKIE = 'loopedin_access';
const COOKIE_SALT = '::loopedin-gate-v1';
const SUBMIT_PATH = '/__access';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Length-equal comparison of two hex digests (avoids trivial early-exit timing).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// The expected password digest: the env var if configured, else the fallback.
async function expectedPasswordHash(): Promise<string> {
  const configured = process.env.SITE_PASSWORD;
  return configured ? await sha256(configured) : FALLBACK_PASSWORD_SHA256;
}

// The cookie carries a digest derived from the password, so a session can't be
// forged just by guessing the cookie's name.
async function sessionToken(): Promise<string> {
  return sha256((await expectedPasswordHash()) + COOKIE_SALT);
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const token = await sessionToken();

  // ── Unlock submission ────────────────────────────────────────────────────
  if (url.pathname === SUBMIT_PATH) {
    if (req.method !== 'POST') {
      return new Response(null, { status: 303, headers: { location: new URL('/', url.origin).toString() } });
    }

    let supplied = '';
    let next = '/';
    try {
      const form = await req.formData();
      supplied = String(form.get('password') ?? '');
      const raw = String(form.get('next') ?? '/');
      if (raw.startsWith('/') && !raw.startsWith('//')) next = raw; // same-site only
    } catch {
      /* malformed body → treated as a wrong password */
    }

    if (safeEqual(await sha256(supplied), await expectedPasswordHash())) {
      return new Response(null, {
        status: 303,
        headers: {
          location: new URL(next, url.origin).toString(),
          'set-cookie': `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    // Wrong password — re-render the gate with an error. (The studio page sends
    // you to rbl1.com instead; here the gate covers "/" itself, so redirecting
    // would loop.)
    return gatePage({ error: true, next });
  }

  // ── Already unlocked ─────────────────────────────────────────────────────
  if (safeEqual(readCookie(req, COOKIE) ?? '', token)) return;

  // ── Locked ───────────────────────────────────────────────────────────────
  return gatePage({ error: false, next: url.pathname + url.search });
}

// The gate page is fully self-contained: every other asset is behind the gate,
// and the site CSP allows inline <style> but NOT inline <script> — so this is
// styled inline and works with zero JavaScript (a plain form POST).
function gatePage({ error, next }: { error: boolean; next: string }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>LoopedIn — Private Preview</title>
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/inter.woff2') format('woff2');
    font-weight: 100 900;
    font-display: swap;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: #FBF8F4;
    color: #1C1B19;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  main { width: 100%; max-width: 440px; text-align: center; }
  .mark {
    width: 44px; height: 44px; border-radius: 14px;
    background: #E8530E; color: #fff;
    font-weight: 900; font-size: 24px; letter-spacing: -0.5px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
  }
  .eyebrow {
    display: inline-block;
    background: #FFF1E8; color: #D14A0B;
    border: 1px solid #F7C8A8; border-radius: 999px;
    padding: 5px 12px;
    font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
    margin-bottom: 18px;
  }
  h1 { font-size: 34px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; margin: 0 0 12px; }
  p.tagline { font-size: 15px; line-height: 1.55; color: #4A443F; margin: 0 0 26px; }
  form { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  input {
    flex: 1; min-width: 210px;
    padding: 15px 18px;
    font-family: inherit; font-size: 16px; color: #1C1B19;
    background: #fff; border: 1px solid #E0D6C4; border-radius: 12px;
    outline: none;
  }
  input:focus { border-color: #E8530E; box-shadow: 0 0 0 3px rgba(232,83,14,0.14); }
  button {
    padding: 15px 30px;
    font-family: inherit; font-size: 14px; font-weight: 800;
    letter-spacing: 0.6px; text-transform: uppercase;
    color: #fff; background: #E8530E;
    border: 0; border-radius: 12px; cursor: pointer;
    transition: background .2s;
  }
  button:hover { background: #D14A0B; }
  .error { margin: 16px 0 0; font-size: 13px; font-weight: 600; color: #B23B2E; }
  .foot { margin-top: 30px; font-size: 11px; color: #8A837D; letter-spacing: 0.3px; }
  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
</style>
</head>
<body>
<main>
  <div class="mark" aria-hidden="true">L</div>
  <span class="eyebrow">Private Preview</span>
  <h1>LoopedIn.</h1>
  <p class="tagline">A preview of what we&rsquo;re building. Enter the password to continue.</p>
  <form method="POST" action="${SUBMIT_PATH}" autocomplete="off">
    <label class="sr-only" for="gate-password">Password</label>
    <input id="gate-password" name="password" type="password" placeholder="Password"
           autocomplete="current-password" autofocus required>
    <input type="hidden" name="next" value="${escapeAttr(next)}">
    <button type="submit">Unlock</button>
  </form>
  ${error ? '<p class="error" role="alert">That password isn&rsquo;t right. Try again.</p>' : ''}
  <p class="foot">Made by RBL1</p>
</main>
</body>
</html>`;

  return new Response(html, {
    status: error ? 401 : 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, must-revalidate',
      // Lets the member app's service worker recognise the gate and refuse to
      // cache it. Without this it could store this page as the offline app
      // shell and strand you at a password prompt in airplane mode.
      'x-loopedin-gate': '1',
    },
  });
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

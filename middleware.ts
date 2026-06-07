// Edge Middleware — gate the whole site behind a shared password (HTTP Basic Auth).
//
// The password is read from the SITE_PASSWORD environment variable, which you set
// in the Vercel dashboard (Project → Settings → Environment Variables). That keeps
// the password OUT of this public repo.
//
// Behaviour:
//   • SITE_PASSWORD unset  → gate disabled, site served normally (won't brick prod).
//   • SITE_PASSWORD set    → every page requires the password before loading.

export const config = {
  // Run on every request except Vercel's internal paths.
  matcher: ['/((?!_vercel/).*)'],
};

export default function middleware(req: Request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return; // gate disabled until SITE_PASSWORD is configured

  const header = req.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try { decoded = atob(encoded); } catch { /* malformed header */ }
    // Basic auth sends "username:password" — we only check the password part,
    // so the username can be anything (or blank).
    const supplied = decoded.slice(decoded.indexOf(':') + 1);
    if (supplied === password) return; // correct → allow through
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="LoopedIn — enter access password", charset="UTF-8"',
      'content-type': 'text/plain',
    },
  });
}

// Thin API client for the LoopedIn backend. Tokens are kept in localStorage so
// a returning member/org stays signed in. In dev, Vite proxies /api -> :4000.

const BASE = '/api';

function tokenKey(kind: 'member' | 'org') {
  return `loopedin-${kind}-token`;
}

export function getToken(kind: 'member' | 'org'): string | null {
  try {
    return localStorage.getItem(tokenKey(kind));
  } catch {
    return null;
  }
}

export function setToken(kind: 'member' | 'org', token: string | null) {
  try {
    if (token) localStorage.setItem(tokenKey(kind), token);
    else localStorage.removeItem(tokenKey(kind));
  } catch {
    /* ignore */
  }
}

async function request<T = any>(
  kind: 'member' | 'org' | null,
  method: string,
  path: string,
  body?: any,
): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (kind) {
    const t = getToken(kind);
    if (t) headers.authorization = `Bearer ${t}`;
  }
  // Admin routes are staff-gated server-side (ADMIN_API_TOKEN). Staff paste
  // their token into localStorage once; demo/dev servers stay open without it.
  if (path.startsWith('/admin')) {
    try {
      const admin = localStorage.getItem('loopedin-admin-token');
      if (admin) headers['x-admin-token'] = admin;
    } catch {
      /* ignore */
    }
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail: any = {};
    try {
      detail = await res.json();
    } catch {
      /* ignore */
    }
    const err: any = new Error(detail.error || `${res.status} ${res.statusText}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  return res.json();
}

// ── Member ────────────────────────────────────────────────────────────────
export const memberApi = {
  register: (email: string, phone?: string) =>
    request('member', 'POST', '/member/register', { email, phone }),
  me: () => request('member', 'GET', '/member/me'),
  questions: () => request('member', 'GET', '/member/questions'),
  answer: (questionId: string, text: string | null, mode: string, attrs?: any[]) =>
    request('member', 'POST', '/member/answers', { questionId, text, mode, attrs }),
  saveProfile: (profile: any, qualifiedFor?: any, streak?: number) =>
    request('member', 'PATCH', '/member/profile', { profile, qualifiedFor, streak }),
  // Phone + one-time-code login for members who signed up over SMS/WhatsApp.
  otpRequest: (phone: string) => request(null, 'POST', '/member/otp/request', { phone }),
  otpVerify: (phone: string, code: string) =>
    request(null, 'POST', '/member/otp/verify', { phone, code }),
};

// ── Org ───────────────────────────────────────────────────────────────────
export const orgApi = {
  register: (email: string, name?: string, phone?: string) =>
    request('org', 'POST', '/org/register', { email, name, phone }),
  me: () => request('org', 'GET', '/org/me'),
  questions: () => request('org', 'GET', '/org/questions'),
  compose: (draft: any) => request('org', 'POST', '/org/questions', draft),
  responses: (id: string) => request('org', 'GET', `/org/questions/${id}/responses`),
  charge: (pts: number) => request('org', 'POST', '/org/charge', { pts }),
  setPlan: (plan: string) => request('org', 'POST', '/org/plan', { plan }),
  setAutocharge: (a: any) => request('org', 'PATCH', '/org/autocharge', a),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  queue: () => request(null, 'GET', '/admin/queue'),
  review: (id: string, action: 'approve' | 'reject') =>
    request(null, 'POST', `/admin/questions/${id}/review`, { action }),
};

export const DEMO_ORG_EMAIL = 'demo@loopedin.org';

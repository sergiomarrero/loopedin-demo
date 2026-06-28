// Vox API client seam. The static Vercel build runs purely on data.ts (demo
// mode, no backend — exactly like LoopedIn's own static deploy). When Vox is
// deployed full-stack (the Render path), point the dashboard at these helpers to
// read the live synthesis engine instead. Org calls reuse the existing LoopedIn
// org token (localStorage key `loopedin-org-token`); internal routes are open in
// this demo, matching the admin routes.

const BASE = '/api/vox';

function orgToken(): string | null {
  try { return localStorage.getItem('loopedin-org-token'); } catch { return null; }
}

async function get<T = any>(path: string, auth = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (auth) { const t = orgToken(); if (t) headers.authorization = `Bearer ${t}`; }
  const res = await fetch(BASE + path, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Internal (RBL1) — open in the demo, like admin routes.
export const voxInternal = {
  overview: () => get('/internal/overview'),
  themes: (scope = 'cross_org', refId?: string) => get(`/internal/themes?scope=${scope}${refId ? `&refId=${refId}` : ''}`),
  signals: () => get('/internal/signals'),
  sentiment: (scope = 'cross_org', refId?: string) => get(`/internal/sentiment?scope=${scope}${refId ? `&refId=${refId}` : ''}`),
  demographics: (scope = 'cross_org', refId?: string) => get(`/internal/demographics?scope=${scope}${refId ? `&refId=${refId}` : ''}`),
  health: () => get('/internal/health'),
  trends: (scope = 'cross_org', refId?: string) => get(`/internal/trends?scope=${scope}${refId ? `&refId=${refId}` : ''}`),
};

// Org — scoped + suppressed server-side. refId is the authenticated org; never
// passed from the client.
export const voxOrg = {
  themes: () => get('/org/themes', true),
  sentiment: () => get('/org/sentiment', true),
  demographics: () => get('/org/demographics', true),
  health: () => get('/org/health', true),
  trends: () => get('/org/trends', true),
};

// Signal export seam (read-only, de-identified, suppression-passed).
export const voxExport = {
  themes: (scope?: string) => get(`/export/themes${scope ? `?scope=${scope}` : ''}`),
  trends: (scope?: string) => get(`/export/trends${scope ? `?scope=${scope}` : ''}`),
};

// Whether a Vox backend is reachable (vs. static demo mode).
export async function backendAvailable(): Promise<boolean> {
  try { await get('/internal/overview'); return true; } catch { return false; }
}

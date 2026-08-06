// Entry point for the STANDALONE OFFLINE INSIGHTS DEMO at /insights.
//
// Same Vox dashboard code as the live insights tool — but deliberately
// insulated from it, exactly like the member demo at /demo:
//
//   • HERMETIC. __LOOPEDIN_DEMO__ makes the shared API client reject every
//     request without touching the network. The dashboard already renders from
//     its baked dataset (src/vox/data.ts), so this build is offline BY DESIGN
//     and cannot be broken by a backend deploy, an outage, or the live tool at
//     loopedin.rbl1.com/insights changing.
//   • SEPARATE PWA IDENTITY. Its own manifest, home-screen name and service
//     worker cache, so it installs on the iPad as a third independent app
//     alongside the member demo and the real member app.
//
// The flag is set before ./app is imported so it is in place before any module
// reads it.

(window as any).__LOOPEDIN_DEMO__ = true;

import '../styles/vox.css';

// Offline support: this worker caches the insights shell under its own cache.
//
// Scope is deliberately "/insights", NOT "/". Only one worker can own a scope,
// so registering at the root would evict the other apps' workers and whichever
// was installed last would silently break the others' offline mode.
//
// Best-effort — a failure here must never stop the dashboard from rendering.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-insights.js', { scope: '/insights' }).catch(() => {
      /* unsupported / blocked / private mode — dashboard still works online */
    });
  });
}

// The Vox dashboard self-renders into #root on import.
import './app';

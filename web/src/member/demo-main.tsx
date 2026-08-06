// Entry point for the STANDALONE OFFLINE DEMO at /demo.
//
// Same app code as the real member app — but deliberately insulated from it:
//
//   • HERMETIC. __LOOPEDIN_DEMO__ makes src/api.ts reject every request without
//     touching the network, so this build cannot be broken by a backend deploy,
//     an outage, or the real app moving to live data. It is offline by design,
//     not offline by accident.
//   • SEPARATE STATE. app.tsx keys localStorage off the same flag, so demoing
//     never disturbs (and is never disturbed by) the real app on this origin.
//   • SEPARATE PWA IDENTITY. Its own manifest, home-screen name and service
//     worker cache, so installing the demo and installing the real app are two
//     independent apps on the iPad.
//
// The flag MUST be set before ./app is imported — that module reads it at
// module scope to pick its storage key.

(window as any).__LOOPEDIN_DEMO__ = true;

import '../styles/tokens.css';
import '../styles/member.css';

// Always open the demo at the start of the story, so every presentation begins
// the same way regardless of how the last one ended.
(function () {
  try {
    const raw = localStorage.getItem('pulse-demo-state-v1');
    if (raw) {
      const s = JSON.parse(raw);
      s.screen = 'onboarding';
      s.qid = null;
      localStorage.setItem('pulse-demo-state-v1', JSON.stringify(s));
    }
  } catch {
    /* ignore */
  }
})();

// Offline support: this worker caches the demo shell under its own cache name.
//
// Scope is deliberately "/demo", NOT "/". Only one worker can own a given
// scope, so registering this at the root would evict the real member app's
// worker (and vice versa) and whichever app was installed second would silently
// break the other's offline mode. Narrower scope wins for /demo* while the real
// app keeps the root — the two coexist on one iPad as separate installs.
//
// Best-effort — a failure here must never stop the demo from rendering.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-demo.js', { scope: '/demo' }).catch(() => {
      /* unsupported / blocked / private mode — demo still works online */
    });
  });
}

// The app module self-renders into #app on import.
import('./app').then(() => {
  // Inject a collapse toggle into the "Jump to screen" demo menu.
  function addToggle() {
    const menu = document.querySelector('#app .demo-menu');
    if (!menu || menu.querySelector('.dm-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'dm-toggle';
    btn.title = 'Collapse menu';
    btn.textContent = '−';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const collapsed = menu.classList.toggle('dm-collapsed');
      btn.textContent = collapsed ? '+' : '−';
      btn.title = collapsed ? 'Expand menu' : 'Collapse menu';
    });
    menu.insertBefore(btn, menu.firstChild);
  }
  const obs = new MutationObserver(() => {
    if (document.querySelector('#app .demo-menu')) addToggle();
  });
  obs.observe(document.body, { childList: true, subtree: true });
  addToggle();
});

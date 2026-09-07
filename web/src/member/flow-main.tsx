// Entry point for the FLOW MODE DEMO at /flow.
//
// The member app plus one extra, selectable mode — "Flow": reels-style,
// hands-free answering. One question fills the screen, the mic is already
// listening when it appears, and a flick up sends the answer and pulls in the
// next question. The mode only exists in this build (app.tsx gates it on
// __LOOPEDIN_FLOW__), so the live member app and the offline demo are
// untouched until it's approved.
//
// Like /demo, this build is hermetic (__LOOPEDIN_DEMO__: the API client rejects
// every request without touching the network) and keeps its own localStorage
// state, so trying it never disturbs the other apps on this origin.
//
// Both flags MUST be set before ./app is imported — that module reads them at
// module scope.

(window as any).__LOOPEDIN_DEMO__ = true;
(window as any).__LOOPEDIN_FLOW__ = true;

import '../styles/tokens.css';
import '../styles/member.css';

// Open on the feed, where the Flow card is — the point of this build is the
// mode, not the onboarding story. Wallet/answers carry over between visits.
(function () {
  try {
    const raw = localStorage.getItem('pulse-flow-state-v1');
    if (raw) {
      const s = JSON.parse(raw);
      s.screen = 'feed';
      s.qid = null;
      localStorage.setItem('pulse-flow-state-v1', JSON.stringify(s));
    } else {
      localStorage.setItem('pulse-flow-state-v1', JSON.stringify({ screen: 'feed' }));
    }
  } catch {
    /* ignore */
  }
})();

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

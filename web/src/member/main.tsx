import '../styles/tokens.css';
import '../styles/member.css';

// On each load, drop the respondent back to the onboarding screen (demo behavior
// carried over from the prototype) — keeps wallet/answers but resets the route.
(function () {
  const k = 'pulse-respondent-state-v1';
  try {
    const r = localStorage.getItem(k);
    if (r) {
      const s = JSON.parse(r);
      s.screen = 'onboarding';
      s.qid = null;
      localStorage.setItem(k, JSON.stringify(s));
    }
  } catch (e) {
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

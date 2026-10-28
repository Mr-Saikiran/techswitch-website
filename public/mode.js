// Light and dark: follows the system until the visitor picks one, then remembers it.
(() => {
  const root = document.documentElement;
  const btn = document.querySelector('[data-mode-toggle]');
  if (!btn) return;
  const dark = () => (root.dataset.mode || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  const sync = () => { btn.setAttribute('aria-pressed', dark()); btn.textContent = dark() ? 'light' : 'dark'; btn.setAttribute('aria-label', dark() ? 'Switch to light mode' : 'Switch to dark mode'); };
  btn.hidden = false;
  btn.addEventListener('click', () => {
    root.dataset.mode = dark() ? 'light' : 'dark';
    try { localStorage.setItem('mode', root.dataset.mode); } catch {}
    sync();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  sync();
})();

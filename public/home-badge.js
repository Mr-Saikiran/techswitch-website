// A small TechSwitch mark, fixed bottom left, linking home. Sub-apps on techswitch.in
// (/cvtuner, /equity, /oursociety) add it with one line and keep their own navigation:
//   <script src="/home-badge.js" defer></script>
// It lives in a shadow root, so the app's styles and the badge's never touch.
// data-position="bottom-right" (or top-left, top-right) moves it off an app's own controls.
(() => {
  if (window.__techswitchBadge || window.top !== window) return;
  window.__techswitchBadge = true;
  const corner = ((document.currentScript && document.currentScript.dataset.position) || 'bottom-left').split('-');
  const [y, x] = [corner[0] === 'top' ? 'top' : 'bottom', corner[1] === 'right' ? 'right' : 'left'];

  const mount = () => {
    if (document.getElementById('techswitch-home')) return;
    const host = document.createElement('div');
    host.id = 'techswitch-home';
    host.dataset.x = x;
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { --ink: oklch(18% 0.02 300); --paper: oklch(97% 0.01 300); --rule: oklch(70% 0.08 295); --focus: oklch(50% 0.25 290);
          all: initial; position: fixed; z-index: 2147483000;
          ${x}: max(12px, env(safe-area-inset-${x})); ${y}: max(12px, env(safe-area-inset-${y})); }
        :host([data-x="right"]) span { left: auto; right: 52px; transform: translate(4px, -50%); }
        a { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 999px;
          background: var(--paper); color: var(--ink); box-shadow: inset 0 0 0 1.5px var(--rule), 0 2px 8px oklch(18% 0.02 300 / 0.18);
          font: 500 14px/1 "Outfit", ui-sans-serif, system-ui, sans-serif; text-decoration: none;
          transition: transform 120ms cubic-bezier(0.16, 1, 0.3, 1); }
        img { width: 30px; height: 30px; display: block; }
        span { position: absolute; left: 52px; top: 50%; padding: 8px 12px; border-radius: 999px; background: var(--ink); color: var(--paper);
          white-space: nowrap; pointer-events: none; opacity: 0; transform: translate(-4px, -50%);
          transition: opacity 120ms linear, transform 220ms cubic-bezier(0.16, 1, 0.3, 1); }
        a:hover span, a:focus-visible span { opacity: 1; transform: translate(0, -50%); }
        a:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
        a:active { transform: translateY(1px); }
        @media (prefers-reduced-motion: reduce) { a, span { transition: none; } a:active { transform: none; } }
        @media print { :host { display: none; } }
      </style>
      <a href="/" aria-label="TechSwitch home"><img src="/img/techswitch-mark.svg" alt=""><span>techswitch</span></a>`;
    document.body.appendChild(host);
    if (y === 'bottom') {
      // lift the badge above an app's own fixed bottom bar (a mobile tab bar, a status strip)
      const lift = () => {
        host.style.bottom = '';
        const me = host.getBoundingClientRect();
        let top = innerHeight;
        for (const el of document.body.querySelectorAll('*')) {
          if (el === host || getComputedStyle(el).position !== 'fixed') continue;
          const r = el.getBoundingClientRect();
          if (r.height && r.bottom >= innerHeight - 40 && r.top < me.bottom && r.left < me.right && r.right > me.left && r.height < innerHeight / 3) top = Math.min(top, r.top);
        }
        if (top < innerHeight) host.style.bottom = `${innerHeight - top + 12}px`;
      };
      let t;
      lift();
      addEventListener('resize', () => { clearTimeout(t); t = setTimeout(lift, 150); });
      setTimeout(lift, 1500);
    }
  };

  // after hydration, so React-rendered apps never see an unexpected node
  if (document.readyState === 'complete') mount();
  else window.addEventListener('load', () => setTimeout(mount, 0), { once: true });
})();

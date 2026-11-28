// Injected into every recorded page: a visible cursor (screencasts have none) with a press ripple.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const install = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div');
    c.id = '__cur';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '26'); svg.setAttribute('height', '26'); svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M5 2.5 L5 19.5 L9.3 15.4 L12.2 21.8 L15 20.6 L12.1 14.3 L18 14.3 Z');
    path.setAttribute('fill', '#0A0A0A'); path.setAttribute('stroke', '#fff'); path.setAttribute('stroke-width', '1.6'); path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    const ring = document.createElement('span');
    c.append(svg, ring);
    Object.assign(c.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-6px,-3px)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.25))' });
    Object.assign(ring.style, { position: 'absolute', left: '-10px', top: '-11px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(10,10,10,.18)', transform: 'scale(0)', opacity: '0' });
    document.documentElement.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => {
      ring.style.transition = 'none'; ring.style.transform = 'scale(.4)'; ring.style.opacity = '1';
      requestAnimationFrame(() => { ring.style.transition = 'transform 320ms cubic-bezier(.16,1,.3,1), opacity 420ms ease'; ring.style.transform = 'scale(1)'; ring.style.opacity = '0'; });
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();

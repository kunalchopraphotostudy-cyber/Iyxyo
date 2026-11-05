import gsap from 'gsap';
import { createHeadphoneScene, COLOURWAYS } from './headphone.js';

const canvas = document.getElementById('stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scene = null;
try {
  scene = createHeadphoneScene(canvas);
} catch (err) {
  console.warn('WebGL unavailable, falling back to static page', err);
  document.body.classList.add('no-webgl');
}

/* ---------- Scroll choreography ---------- */
const $ = (s) => document.querySelector(s);
const sections = {
  hero: $('[data-stage="hero"]'),
  inside: $('[data-stage="inside"]'),
  features: $('[data-stage="features"]'),
  colours: $('[data-stage="colours"]'),
  specs: $('[data-stage="specs"]'),
  preorder: $('[data-stage="preorder"]'),
};

const narrow = () => window.innerWidth / window.innerHeight < 1.1;
const top = (el) => el.getBoundingClientRect().top + window.scrollY;
const vh = () => window.innerHeight;

// Pose = where the model sits for a given scroll position. Keyframes are
// interpolated with smoothstep between consecutive scroll offsets.
function poses() {
  const n = narrow();
  const insideTop = top(sections.inside);
  const pinLen = sections.inside.offsetHeight - vh();
  return [
    { at: 0, x: n ? 0.1 : 2.8, y: n ? -2.55 : -0.35, s: n ? 0.46 : 0.8, rx: 0.14, ry: -0.6, rz: 0.12, ex: 0, op: 1 },
    { at: insideTop - vh() * 0.4, x: n ? 0.1 : 2.8, y: n ? -2.55 : -0.35, s: n ? 0.46 : 0.8, rx: 0.14, ry: -0.6, rz: 0.12, ex: 0, op: 1 },
    { at: insideTop, x: n ? 0 : 0.4, y: n ? -1.2 : -0.9, s: n ? 0.56 : 0.84, rx: 0.18, ry: -0.95, rz: 0, ex: 0, op: 1 },
    { at: insideTop + pinLen * 0.78, x: n ? -0.3 : -0.2, y: n ? -1.2 : -0.95, s: n ? 0.5 : 0.78, rx: 0.22, ry: -0.72, rz: 0, ex: 1, op: 1 },
    { at: insideTop + pinLen, x: n ? -0.3 : -0.2, y: n ? -1.2 : -0.95, s: n ? 0.5 : 0.78, rx: 0.22, ry: -0.62, rz: 0, ex: 1, op: 1 },
    { at: top(sections.features) - vh() * 0.35, x: 0, y: 0.6, s: 0.8, rx: 0.3, ry: -1.4, rz: 0.1, ex: 0, op: 0 },
    { at: top(sections.colours) - vh() * 0.7, x: n ? 0 : 2.2, y: n ? -2.4 : -0.2, s: n ? 0.7 : 1, rx: 0.1, ry: -1.1, rz: 0.05, ex: 0, op: 0 },
    { at: top(sections.colours) - vh() * 0.1, x: n ? 0 : 2.2, y: n ? -2.4 : -0.2, s: n ? 0.7 : 1, rx: 0.1, ry: -0.35, rz: 0.05, ex: 0, op: 1 },
    { at: top(sections.specs) - vh() * 0.75, x: n ? 0 : 2.2, y: n ? -2.4 : -0.2, s: n ? 0.7 : 1, rx: 0.1, ry: -0.35, rz: 0.05, ex: 0, op: 1 },
    { at: top(sections.specs) - vh() * 0.2, x: n ? 0 : 2.2, y: 1.6, s: 0.7, rx: -0.2, ry: 0.2, rz: 0.1, ex: 0, op: 0 },
    { at: top(sections.preorder) - vh() * 0.6, x: n ? 1.6 : 4.6, y: -1.2, s: 0.7, rx: 0.3, ry: 0.5, rz: -0.15, ex: 0, op: 0 },
    { at: top(sections.preorder) - vh() * 0.1, x: n ? 1.6 : 4.6, y: -1.2, s: 0.7, rx: 0.3, ry: 0.5, rz: -0.15, ex: 0.08, op: 1 },
  ];
}

let keyframes = poses();
const KEYS = ['x', 'y', 's', 'rx', 'ry', 'rz', 'ex', 'op'];
const smooth = (t) => t * t * (3 - 2 * t);

function sample(scroll) {
  const kf = keyframes;
  if (scroll <= kf[0].at) return { ...kf[0] };
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i];
    const b = kf[i + 1];
    if (scroll >= a.at && scroll < b.at) {
      const t = smooth((scroll - a.at) / (b.at - a.at));
      const out = {};
      for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
      return out;
    }
  }
  return { ...kf[kf.length - 1] };
}

const current = sample(window.scrollY);
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
});

/* ---------- Labels ---------- */
const labelEls = [...document.querySelectorAll('.label')];
const labelLayout = {
  shell: { angle: -24, len: 110, ax: '0%' },
  battery: { angle: 32, len: 120, ax: '0%' },
  driver: { angle: -70, len: 130, ax: '-50%' },
  grille: { angle: 48, len: 110, ax: '0%' },
  cushion: { angle: 150, len: 120, ax: '-100%' },
  band: { angle: -22, len: 110, ax: '0%' },
};
const AX_FACTOR = { '0%': 0, '-50%': -0.5, '-100%': -1 };
const AX_FLIP = { '0%': '-100%', '-50%': '-50%', '-100%': '0%' };

for (const el of labelEls) {
  el.card = el.querySelector('.label__card');
  el.line = el.querySelector('.label__line');
}

const progressBar = $('.inside__progress-bar');

// Position a label at its projected anchor; mirror the leader line when the
// card would leave the viewport (mostly on narrow screens).
function placeLabel(el, p) {
  const l = labelLayout[el.dataset.part];
  const len = narrow() ? Math.round(l.len * 0.7) : l.len;
  const w = el.card.offsetWidth;
  const vw = window.innerWidth;
  const margin = 12;
  const candidate = (angle, ax) => {
    const rad = (angle * Math.PI) / 180;
    const cx = Math.cos(rad) * len;
    const cy = Math.sin(rad) * len;
    const left = p.x + cx + AX_FACTOR[ax] * w;
    return { angle, ax, cx, cy, fits: left >= margin && left + w <= vw - margin };
  };
  let c = candidate(l.angle, l.ax);
  if (!c.fits) {
    const flipped = candidate(180 - l.angle, AX_FLIP[l.ax]);
    if (flipped.fits) c = flipped;
  }
  if (!c.fits) {
    // Neither side fits: drop a vertical leader and slide the centred card into view.
    const angle = l.angle < 0 ? -90 : 90;
    const left = Math.min(Math.max(p.x - w / 2, margin), vw - margin - w);
    c = { angle, ax: '-50%', cx: left + w / 2 - p.x, cy: angle < 0 ? -len : len, fits: true };
  }
  el.style.setProperty('--angle', `${c.angle}deg`);
  el.style.setProperty('--cx', `${c.cx.toFixed(1)}px`);
  el.style.setProperty('--cy', `${c.cy.toFixed(1)}px`);
  el.style.setProperty('--ax', c.ax);
  el.line.style.width = `${len}px`;
  el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
}

function updateLabels(explode) {
  if (!scene) return;
  // Narrow screens show only the most recent label to avoid pile-ups.
  let latest = null;
  if (narrow()) {
    for (const el of labelEls) {
      if (explode >= Number(el.dataset.at)) latest = el;
    }
  }
  for (const el of labelEls) {
    const on = latest ? el === latest : explode >= Number(el.dataset.at);
    el.classList.toggle('is-on', on);
    if (!on) continue;
    const p = scene.project(el.dataset.part);
    if (p) placeLabel(el, p);
  }
}

/* ---------- Frame loop ---------- */
let needsResize = true;
window.addEventListener('resize', () => {
  needsResize = true;
  keyframes = poses();
});
window.addEventListener('load', () => {
  keyframes = poses();
});

let lastScroll = -1;
const t0 = performance.now();
let last = t0;

function frame(now) {
  requestAnimationFrame(frame);
  if (!scene) return;
  if (document.hidden) return;

  if (needsResize) {
    scene.resize();
    needsResize = false;
  }

  const t = (now - t0) / 1000;
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  const scroll = window.scrollY;
  const target = sample(scroll);
  // Frame-rate independent exponential smoothing
  const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 7);
  for (const key of KEYS) current[key] += (target[key] - current[key]) * k;

  const km = 1 - Math.exp(-dt * 3.5);
  mouse.x += (mouse.tx - mouse.x) * km;
  mouse.y += (mouse.ty - mouse.y) * km;

  const idle = reduceMotion ? 0 : 1;
  const floatY = Math.sin(t * 0.9) * 0.07 * idle * (1 - current.ex);
  const wobble = Math.sin(t * 0.6) * 0.05 * idle * (1 - current.ex);

  const root = scene.root;
  root.position.set(current.x, current.y + floatY, 0);
  root.rotation.set(
    current.rx + mouse.y * 0.08 * idle,
    current.ry + wobble + mouse.x * 0.16 * idle,
    current.rz
  );
  root.scale.setScalar(current.s);
  scene.setExplode(current.ex);
  canvas.style.opacity = current.op.toFixed(3);

  if (progressBar) {
    progressBar.style.transform = `scaleY(${current.ex.toFixed(3)})`;
  }

  if (current.op > 0.01 || lastScroll !== scroll) {
    scene.render();
    updateLabels(current.ex);
  }
  lastScroll = scroll;
}
requestAnimationFrame(frame);

/* ---------- Reveal on scroll ---------- */
const revealIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    }
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
);
document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  // stagger siblings within the same parent
  const idx = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')).indexOf(el);
  el.style.setProperty('--i', idx);
  revealIO.observe(el);
});

/* ---------- Counters ---------- */
const countIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end,
        duration: reduceMotion ? 0 : 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v));
          if (suffix) {
            const small = document.createElement('small');
            small.textContent = suffix;
            el.appendChild(small);
          }
        },
      });
      countIO.unobserve(el);
    }
  },
  { threshold: 0.6 }
);
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

/* ---------- Colourways ---------- */
const swatches = [...document.querySelectorAll('.swatch')];
const colourName = $('#colourName');

function applyColourway(key) {
  const c = COLOURWAYS[key];
  if (!c) return;
  colourName.textContent = c.name;
  swatches.forEach((s) => {
    const active = s.dataset.colour === key;
    s.classList.toggle('is-active', active);
    s.setAttribute('aria-checked', String(active));
  });
  if (!scene) return;
  const { shellMat, bandMat, cushionMat, accentMat } = scene.materials;
  const tween = (color, hex) => {
    const to = { r: 0, g: 0, b: 0 };
    const tmp = color.clone().set(hex);
    to.r = tmp.r;
    to.g = tmp.g;
    to.b = tmp.b;
    gsap.to(color, { ...to, duration: 0.9, ease: 'power2.inOut' });
  };
  tween(shellMat.color, c.shell);
  tween(bandMat.color, c.band);
  tween(cushionMat.color, c.cushion);
  tween(accentMat.color, c.accent);
  tween(accentMat.emissive, c.accent);
}
swatches.forEach((s) => s.addEventListener('click', () => applyColourway(s.dataset.colour)));
window.PRISM = { scene, applyColourway, gsap };

/* ---------- Card hover glow ---------- */
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ---------- Active nav link ---------- */
const navLinks = [...document.querySelectorAll('.nav__links a')];
const navIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const id = `#${e.target.id}`;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    }
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
['inside', 'features', 'colours', 'specs'].forEach((id) => navIO.observe(document.getElementById(id)));

import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { createHeadphoneScene, COLOURWAYS, PART_SPECS } from './headphone.js';

const canvas = document.getElementById('stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scene = null;
try {
  scene = createHeadphoneScene(canvas);
} catch (err) {
  console.warn('WebGL unavailable, falling back to static page', err);
  document.body.classList.add('no-webgl');
}

const $ = (s) => document.querySelector(s);
const sections = {
  hero: $('[data-stage="hero"]'),
  inside: $('[data-stage="inside"]'),
  soundlab: $('[data-stage="soundlab"]'),
  features: $('[data-stage="features"]'),
  colours: $('[data-stage="colours"]'),
  specs: $('[data-stage="specs"]'),
  preorder: $('[data-stage="preorder"]'),
};

const narrow = () => window.innerWidth / window.innerHeight < 1.08;
const top = (el) => el.getBoundingClientRect().top + window.scrollY;
const vh = () => window.innerHeight;

function poses() {
  const n = narrow();
  const insideTop = top(sections.inside);
  const pinLen = Math.max(400, sections.inside.offsetHeight - vh());
  const soundTop = top(sections.soundlab);
  return [
    { at: 0, x: n ? 0.08 : 1.9, y: n ? -1.85 : -0.22, s: n ? 0.54 : 0.88, rx: 0.14, ry: -0.56, rz: 0.08, ex: 0, op: 1 },
    { at: insideTop - vh() * 0.35, x: n ? 0.08 : 1.9, y: n ? -1.85 : -0.22, s: n ? 0.54 : 0.88, rx: 0.14, ry: -0.56, rz: 0.08, ex: 0, op: 1 },
    { at: insideTop, x: n ? 0.0 : 1.25, y: n ? -1.35 : -0.18, s: n ? 0.54 : 0.92, rx: 0.16, ry: -1.02, rz: 0.0, ex: 0.05, op: 1 },
    { at: insideTop + pinLen * 0.72, x: n ? -0.15 : 0.95, y: n ? -1.35 : -0.22, s: n ? 0.5 : 0.86, rx: 0.2, ry: -0.78, rz: 0.0, ex: 1, op: 1 },
    { at: insideTop + pinLen, x: n ? -0.15 : 0.95, y: n ? -1.35 : -0.22, s: n ? 0.5 : 0.86, rx: 0.2, ry: -0.68, rz: 0.0, ex: 1, op: 1 },
    { at: soundTop, x: n ? 0 : 2.15, y: n ? -1.75 : -0.15, s: n ? 0.52 : 0.88, rx: 0.15, ry: -0.85, rz: 0.05, ex: 0.28, op: 0.85 },
    { at: top(sections.features) - vh() * 0.2, x: 0, y: 0.5, s: 0.78, rx: 0.26, ry: -1.35, rz: 0.08, ex: 0, op: 0.16 },
    { at: top(sections.colours) - vh() * 0.55, x: n ? 0 : 1.95, y: n ? -1.8 : -0.1, s: n ? 0.56 : 0.96, rx: 0.12, ry: -0.9, rz: 0.05, ex: 0, op: 0.25 },
    { at: top(sections.colours) - vh() * 0.05, x: n ? 0 : 1.95, y: n ? -1.8 : -0.1, s: n ? 0.56 : 0.98, rx: 0.12, ry: -0.45, rz: 0.05, ex: 0, op: 1 },
    { at: top(sections.specs) - vh() * 0.65, x: n ? 0 : 1.95, y: n ? -1.8 : -0.1, s: n ? 0.56 : 0.98, rx: 0.12, ry: -0.45, rz: 0.05, ex: 0, op: 1 },
    { at: top(sections.specs) - vh() * 0.1, x: n ? 0 : 2.1, y: 1.2, s: 0.72, rx: -0.18, ry: 0.25, rz: 0.08, ex: 0, op: 0.14 },
    { at: top(sections.preorder) - vh() * 0.45, x: n ? 1.2 : 3.25, y: -0.55, s: 0.78, rx: 0.24, ry: -0.55, rz: -0.1, ex: 0.12, op: 0.92 },
  ];
}

let keyframes = poses();
const KEYS = ['x', 'y', 's', 'rx', 'ry', 'rz', 'ex', 'op'];
const smooth = (t) => t * t * (3 - 2 * t);

function sample(scroll) {
  const kf = poses();
  if (scroll <= kf[0].at) return { ...kf[0] };
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i];
    const b = kf[i + 1];
    if (scroll >= a.at && scroll < b.at) {
      const t = smooth((scroll - a.at) / Math.max(1, b.at - a.at));
      const out = {};
      for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
      return out;
    }
  }
  return { ...kf[kf.length - 1] };
}

const current = sample(window.scrollY);

// ---------- Mouse parallax + Drag-to-Orbit ----------
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
let orbitYaw = 0;
let orbitPitch = 0;
let dragging = false;
let dragLastX = 0;
let dragLastY = 0;

window.addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  if (dragging) {
    const dx = e.clientX - dragLastX;
    const dy = e.clientY - dragLastY;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
    orbitYaw += dx * 0.008;
    orbitPitch = Math.max(-0.5, Math.min(0.5, orbitPitch + dy * 0.006));
  }
});

window.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button, a, input, .inside__head, .soundlab__stage')) return;
  dragging = true;
  dragLastX = e.clientX;
  dragLastY = e.clientY;
});
window.addEventListener('pointerup', () => {
  dragging = false;
});

// ---------- Manual Disassembly Override & Part Inspector ----------
let manualExplode = null;
let selectedPart = 'cushion';
let xrayActive = false;

const explodeRange = $('#explodeRange');
const explodePct = $('#explodePct');
const partButtons = [...document.querySelectorAll('[data-part-select]')];
const dockButtons = [...document.querySelectorAll('.dock__btn')];
const xrayToggle = $('#xrayToggle');

function updateInspectorUI(partKey) {
  const spec = PART_SPECS[partKey];
  if (!spec) return;
  selectedPart = partKey;
  $('#inspCode').textContent = `LAYER ${spec.code} / 07`;
  $('#inspMetric').textContent = spec.metric;
  $('#inspTitle').textContent = spec.title;
  $('#inspSub').textContent = spec.subtitle;
  $('#inspDetail').textContent = spec.detail;
  partButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.partSelect === partKey);
  });
  document.querySelectorAll('.label').forEach((lbl) => {
    lbl.classList.toggle('is-focus', lbl.dataset.part === partKey);
  });
  if (scene) scene.setHighlightedPart(partKey);
}

partButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.partSelect;
    manualExplode = 1;
    if (explodeRange) explodeRange.value = '100';
    if (explodePct) explodePct.textContent = '100%';
    updateInspectorUI(key);
  });
});

if (explodeRange) {
  explodeRange.addEventListener('input', (e) => {
    const v = Number(e.target.value) / 100;
    manualExplode = v;
    if (explodePct) explodePct.textContent = `${Math.round(v * 100)}%`;
  });
}

// Reset manual explode override when scrolling outside the inside section
window.addEventListener(
  'scroll',
  () => {
    const insideTop = top(sections.inside);
    const insideEnd = insideTop + sections.inside.offsetHeight;
    if (window.scrollY < insideTop - vh() * 0.5 || window.scrollY > insideEnd) {
      manualExplode = null;
    }
  },
  { passive: true }
);

function setXrayMode(on) {
  xrayActive = on;
  if (scene) scene.setXray(on ? 1 : 0);
  if (xrayToggle) {
    xrayToggle.classList.toggle('is-active', on);
    xrayToggle.setAttribute('aria-pressed', String(on));
  }
  dockButtons.forEach((b) => {
    if (b.dataset.action === 'xray') b.classList.toggle('is-active', on);
  });
}

if (xrayToggle) {
  xrayToggle.addEventListener('click', () => setXrayMode(!xrayActive));
}

const heroExplodeBtn = $('#heroExplodeBtn');
if (heroExplodeBtn) {
  heroExplodeBtn.addEventListener('click', () => {
    manualExplode = manualExplode && manualExplode > 0.5 ? 0 : 1;
    heroExplodeBtn.textContent = manualExplode > 0.5 ? 'Reassemble Headphone' : 'Instant 3D Teardown';
    syncDockState();
  });
}

function syncDockState() {
  const ex = manualExplode !== null ? manualExplode : current.ex;
  dockButtons.forEach((b) => {
    if (b.dataset.action === 'assembled') b.classList.toggle('is-active', ex < 0.35 && !xrayActive);
    if (b.dataset.action === 'explode') b.classList.toggle('is-active', ex >= 0.35);
    if (b.dataset.action === 'xray') b.classList.toggle('is-active', xrayActive);
  });
}

dockButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'assembled') {
      manualExplode = 0;
      setXrayMode(false);
    } else if (action === 'explode') {
      manualExplode = 1;
    } else if (action === 'xray') {
      setXrayMode(!xrayActive);
    }
    syncDockState();
  });
});

// ---------- 3D Projected Callout Labels ----------
const labelEls = [...document.querySelectorAll('.label')];
const labelLayout = {
  cushion: { angle: -102, len: 96, ax: '-35%' },
  baffle: { angle: 104, len: 96, ax: '-35%' },
  driver: { angle: -64, len: 112, ax: '-20%' },
  pcb: { angle: 75, len: 105, ax: '-50%' },
  battery: { angle: -42, len: 104, ax: '0%' },
  chamber: { angle: 38, len: 104, ax: '0%' },
  shell: { angle: -18, len: 98, ax: '0%' },
};
const AX_FACTOR = { '0%': 0, '-50%': -0.5, '-100%': -1 };
const AX_FLIP = { '0%': '-100%', '-50%': '-50%', '-100%': '0%' };

for (const el of labelEls) {
  el.card = el.querySelector('.label__card');
  el.line = el.querySelector('.label__line');
}

function placeLabel(el, p) {
  const l = labelLayout[el.dataset.part];
  if (!l) return;
  const len = narrow() ? Math.round(l.len * 0.68) : l.len;
  const w = el.card.offsetWidth || 180;
  const vw = window.innerWidth;
  const minLeft = narrow() ? 14 : Math.min(525, vw * 0.38);
  const margin = 14;
  const candidate = (angle, ax) => {
    const rad = (angle * Math.PI) / 180;
    const cx = Math.cos(rad) * len;
    const cy = Math.sin(rad) * len;
    const left = p.x + cx + AX_FACTOR[ax] * w;
    return { angle, ax, cx, cy, fits: left >= minLeft && left + w <= vw - margin };
  };
  let c = candidate(l.angle, l.ax);
  if (!c.fits) {
    const flipped = candidate(180 - l.angle, AX_FLIP[l.ax]);
    if (flipped.fits) c = flipped;
  }
  if (!c.fits) {
    const angle = l.angle < 0 ? -90 : 90;
    const left = Math.min(Math.max(p.x - w / 2, minLeft), vw - margin - w);
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
  const insideRect = sections.inside.getBoundingClientRect();
  const inAnatomyView = insideRect.top <= vh() * 0.45 && insideRect.bottom >= vh() * 0.45;
  const showLabels = inAnatomyView && explode >= 0.12;

  let latest = null;
  for (const el of labelEls) {
    if (explode >= Number(el.dataset.at)) latest = el;
  }

  for (const el of labelEls) {
    const on = showLabels && (narrow() ? el === latest : explode >= Number(el.dataset.at));
    el.classList.toggle('is-on', Boolean(on));
    if (!on) continue;
    const p = scene.project(el.dataset.part);
    if (p) placeLabel(el, p);
  }
}

// ---------- Sound Lab 96 kHz Spectrum Visualizer ----------
const eqCanvas = document.getElementById('eqCanvas');
const eqCtx = eqCanvas ? eqCanvas.getContext('2d') : null;
let soundMode = 'anc';

const MODE_META = {
  anc: {
    title: '8-Mic Hybrid Anti-Phase Cancellation',
    badge: '-48.2 dB NOISE FLOOR',
    wave: 0.85,
  },
  spatial: {
    title: '360° Gyroscopic Head-Tracked Soundfield',
    badge: '12-OBJECT SPATIAL MATRIX',
    wave: 1.0,
  },
  lossless: {
    title: 'Bit-Perfect 24-Bit / 96 kHz Reference Curve',
    badge: '0.008% THD ULTRA-LINEAR',
    wave: 0.65,
  },
};

document.querySelectorAll('[data-mode]').forEach((btn) => {
  btn.addEventListener('click', () => {
    soundMode = btn.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('is-active', b === btn));
    const m = MODE_META[soundMode];
    if (m) {
      $('#oscModeTitle').textContent = m.title;
      $('#oscBadgeDb').textContent = m.badge;
      if (scene) scene.setWaveIntensity(m.wave);
    }
  });
});

function drawSpectrum(time) {
  if (!eqCtx || !eqCanvas) return;
  const w = eqCanvas.width;
  const h = eqCanvas.height;
  eqCtx.clearRect(0, 0, w, h);

  // Subtle dB grid lines
  eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  eqCtx.lineWidth = 1;
  for (let y = 40; y < h; y += 50) {
    eqCtx.beginPath();
    eqCtx.moveTo(0, y);
    eqCtx.lineTo(w, y);
    eqCtx.stroke();
  }

  // Frequency bars
  const bars = 48;
  const barW = w / bars;
  for (let i = 0; i < bars; i++) {
    const u = i / bars;
    let amp = 0.35 + 0.28 * Math.sin(u * 9 + time * 2.8) + 0.18 * Math.cos(u * 17 - time * 1.9);
    if (soundMode === 'anc') {
      amp *= 0.32 + 0.55 * Math.pow(u, 1.4);
    } else if (soundMode === 'spatial') {
      amp *= 0.65 + 0.35 * Math.sin(u * Math.PI * 2 + time * 2);
    } else {
      amp = 0.58 + 0.14 * Math.sin(u * 6 + time * 1.6);
    }
    const bh = Math.max(10, Math.min(h - 24, amp * (h - 30)));
    const grad = eqCtx.createLinearGradient(0, h, 0, h - bh);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
    grad.addColorStop(0.6, 'rgba(34, 227, 255, 0.75)');
    grad.addColorStop(1, 'rgba(200, 255, 61, 0.95)');
    eqCtx.fillStyle = grad;
    eqCtx.fillRect(i * barW + 3, h - bh, barW - 6, bh);
  }

  // Anti-phase cancellation wave overlay
  eqCtx.beginPath();
  for (let x = 0; x <= w; x += 6) {
    const u = x / w;
    const y =
      h * 0.45 +
      Math.sin(u * 12 + time * 3.4) * (soundMode === 'anc' ? 14 : 34) +
      Math.cos(u * 25 - time * 2.2) * 10;
    if (x === 0) eqCtx.moveTo(x, y);
    else eqCtx.lineTo(x, y);
  }
  eqCtx.strokeStyle = '#ff2d9a';
  eqCtx.lineWidth = 2.5;
  eqCtx.stroke();
}

// ---------- Colourway Switching (Instant & Reliable) ----------
const allSwatches = [...document.querySelectorAll('[data-colour]')];
const colourName = $('#colourName');
const colourTagline = $('#colourTagline');

function applyColourway(key) {
  const c = COLOURWAYS[key];
  if (!c) return;
  if (colourName) colourName.textContent = c.name;
  if (colourTagline) colourTagline.textContent = c.tagline;

  allSwatches.forEach((s) => {
    const active = s.dataset.colour === key;
    s.classList.toggle('is-active', active);
    if (s.hasAttribute('aria-checked')) s.setAttribute('aria-checked', String(active));
  });

  if (!scene) return;
  const { shellMat, shellRimMat, bandMat, canopyMat, cushionMat, accentMat } = scene.materials;
  shellMat.color.set(c.shell);
  shellRimMat.color.set(c.shellRim);
  bandMat.color.set(c.band);
  canopyMat.color.set(c.canopy);
  cushionMat.color.set(c.cushion);
  accentMat.color.set(c.accent);
  accentMat.emissive.set(c.accent);

  if (scene.lights) {
    scene.lights.rimMagenta.color.set(c.rimLightA);
    scene.lights.rimCyan.color.set(c.rimLightB);
  }
  scene.render();
}

allSwatches.forEach((s) => s.addEventListener('click', () => applyColourway(s.dataset.colour)));

// ---------- Pre-order Form ----------
const preorderForm = document.getElementById('preorderForm');
if (preorderForm) {
  preorderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    preorderForm.classList.add('is-done');
  });
}

// ---------- Main Render Loop ----------
let needsResize = true;
window.addEventListener('resize', () => {
  needsResize = true;
  keyframes = poses();
});
window.addEventListener('load', () => {
  keyframes = poses();
});

const t0 = performance.now();
let last = t0;

function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) return;

  const t = (now - t0) / 1000;
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  drawSpectrum(t);

  if (!scene) return;
  if (needsResize) {
    scene.resize();
    needsResize = false;
  }

  const scroll = window.scrollY;
  const target = sample(scroll);
  if (manualExplode !== null) {
    target.ex = manualExplode;
  }
  if (target.ex > 0.05 && !narrow()) {
    const e = target.ex;
    target.x = target.x * (1 - e) + 0.24 * e;
    target.y = target.y * (1 - e) + -0.26 * e;
    target.s = target.s * (1 - e) + 0.72 * e;
    target.ry = target.ry * (1 - e) + -0.78 * e;
  }

  // Fast exponential smoothing so even low-FPS software renderers settle immediately
  const jump = Math.abs(target.ex - current.ex) > 0.35 || Math.abs(target.x - current.x) > 0.6;
  const k = reduceMotion || jump || dt > 0.06 ? 1 : 1 - Math.exp(-dt * 16);
  for (const key of KEYS) current[key] += (target[key] - current[key]) * k;

  const km = 1 - Math.exp(-dt * 6);
  mouse.x += (mouse.tx - mouse.x) * km;
  mouse.y += (mouse.ty - mouse.y) * km;
  if (!dragging) {
    orbitYaw *= Math.exp(-dt * 1.5);
    orbitPitch *= Math.exp(-dt * 1.5);
  }

  const idle = reduceMotion ? 0 : 1;
  const floatY = Math.sin(t * 1.1) * 0.06 * idle * (1 - current.ex * 0.6);
  const wobble = Math.sin(t * 0.7) * 0.05 * idle * (1 - current.ex * 0.6);

  const root = scene.root;
  root.position.set(current.x, current.y + floatY, 0);
  root.rotation.set(
    current.rx + orbitPitch + mouse.y * 0.09 * idle,
    current.ry + orbitYaw + wobble + mouse.x * 0.18 * idle,
    current.rz
  );
  root.scale.setScalar(current.s);

  scene.setExplode(current.ex);
  scene.stepWaves(t);
  canvas.style.opacity = current.op.toFixed(3);

  if (explodeRange && explodePct) {
    const pct = Math.round(current.ex * 100);
    explodeRange.value = String(pct);
    explodePct.textContent = `${pct}%`;
  }

  scene.render();
  updateLabels(current.ex);
  syncDockState();
}

requestAnimationFrame(frame);

// Expose API for testing & inspection
window.PRISM = {
  scene,
  applyColourway,
  setExplode: (v) => {
    manualExplode = v;
  },
  setXrayMode,
  updateInspectorUI,
};

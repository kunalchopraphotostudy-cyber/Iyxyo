import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const COLOURWAYS = {
  ultraviolet: {
    name: 'Ultraviolet',
    tagline: 'Deep-space anodized violet · Iridescent titanium rails · Electric magenta core',
    shell: '#6d3bf2',
    shellRim: '#b794ff',
    band: '#d8d0ff',
    canopy: '#1f1838',
    cushion: '#1b1530',
    accent: '#ff2d9a',
    glow: '#8b5cf6',
    rimLightA: '#ff2d9a',
    rimLightB: '#22e3ff',
  },
  magma: {
    name: 'Solar Magma',
    tagline: 'Crimson-orange bead-blasted aluminum · Champagne titanium · Molten amber core',
    shell: '#f42c52',
    shellRim: '#ff9b6a',
    band: '#ffe3d1',
    canopy: '#2c1219',
    cushion: '#261117',
    accent: '#ff8a1f',
    glow: '#ff3b5c',
    rimLightA: '#ff2d55',
    rimLightB: '#ffae00',
  },
  glacier: {
    name: 'Cryo Glacier',
    tagline: 'Arctic cyan anodized shell · Mirror-polished silver steel · Sub-zero aqua core',
    shell: '#0ea5e9',
    shellRim: '#88f7ff',
    band: '#e8faff',
    canopy: '#0e2231',
    cushion: '#0d1e2b',
    accent: '#22e3ff',
    glow: '#00d4ff',
    rimLightA: '#00f0ff',
    rimLightB: '#6366f1',
  },
  acid: {
    name: 'Hyper Acid',
    tagline: 'Volt-lime anodized aluminum · Satin gunmetal rails · Bio-emerald core',
    shell: '#a3e635',
    shellRim: '#eaff8f',
    band: '#e6f7d4',
    canopy: '#162110',
    cushion: '#152010',
    accent: '#c8ff3d',
    glow: '#84cc16',
    rimLightA: '#c8ff3d',
    rimLightB: '#00f5d4',
  },
  obsidian: {
    name: 'Titanium Obsidian',
    tagline: 'Stealth DLC space-black aluminum · Raw grade-5 titanium · Ultraviolet core',
    shell: '#1e1f29',
    shellRim: '#71758a',
    band: '#b5b8c8',
    canopy: '#101117',
    cushion: '#111218',
    accent: '#22e3ff',
    glow: '#6366f1',
    rimLightA: '#8b5cf6',
    rimLightB: '#22e3ff',
  },
};

export const PART_SPECS = {
  cushion: {
    code: '01',
    title: 'Magnetic Acoustic Knit Cushion',
    subtitle: 'Viscoelastic memory foam · Micro-woven breathable mesh',
    metric: '360° Seal',
    detail: 'Attaches via 8 neodymium alignment magnets with custom L/R acoustic scrim.',
  },
  baffle: {
    code: '02',
    title: 'CNC Baffle & Optical Sensor Plate',
    subtitle: 'Grade-5 titanium chassis · Dual IR ear-detection array',
    metric: '±0.005 mm',
    detail: '12 micro-Torx fasteners isolate driver resonance from the outer enclosure.',
  },
  driver: {
    code: '03',
    title: '45 mm Graphene Ring-Magnet Driver',
    subtitle: 'Dual N52 neodymium motor · Pure copper voice coil',
    metric: '0.008% THD',
    detail: 'Modeled after studio reference monitors for ultra-linear 4 Hz – 48 kHz response.',
  },
  pcb: {
    code: '04',
    title: 'PRISM S1 Dual-Core Audio Silicon',
    subtitle: '10-core neural audio engine · 96,000 ops/sec per earcup',
    metric: '96 kHz / 24-bit',
    detail: 'Runs real-time adaptive EQ, head-tracked spatial audio, and 8-mic ANC cancellation.',
  },
  battery: {
    code: '05',
    title: 'Toroidal Silicon-Anode Battery Cell',
    subtitle: 'High-density contoured pack · USB-C PD fast charge',
    metric: '60 hrs ANC',
    detail: '5 minutes of charge delivers 5 hours of lossless wireless playback.',
  },
  chamber: {
    code: '06',
    title: 'Vortex Acoustic Rear Labyrinth',
    subtitle: 'Harmonic standing-wave diffuser · Rear feedback mic',
    metric: '-48 dB ANC',
    detail: 'Eliminates back-wave coloration while venting sub-bass pressure cleanly.',
  },
  shell: {
    code: '07',
    title: 'Anodized Unibody Cup & Digital Crown',
    subtitle: 'Deep-drawn 6061-T6 aluminum · Optical rotary encoder',
    metric: '348 g Total',
    detail: 'Bead-blasted satin finish with diamond-cut chamfer and tactile volume crown.',
  },
};

const CUP_X = 1.62;
const CUP_Y = -0.36;
const CUP_CANT = 0.17;
const STADIUM_Y = 1.27;
const STADIUM_Z = 0.96;

function makeScrimTexture(letter) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#08080f';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#181826';
  const step = 6;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      ctx.fillRect(x + ((y / step) % 2) * 2, y, 2.5, 2.5);
    }
  }

  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 125);
  g.addColorStop(0, 'rgba(255,255,255,0.03)');
  g.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.font = '700 112px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(245, 243, 255, 0.24)';
  ctx.fillText(letter, 128, 132);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeKnitBump() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const odd = ((x + y) / 4) % 2 === 0;
      ctx.fillStyle = odd ? '#d8d8d8' : '#343434';
      ctx.fillRect(x, y, 3, 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  return tex;
}

function makePCBTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  for (let r = 90; r < 235; r += 14) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0.2, Math.PI * 1.75);
    ctx.stroke();
  }

  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x1 = 256 + Math.cos(a) * 85;
    const y1 = 256 + Math.sin(a) * 85;
    const x2 = 256 + Math.cos(a) * 230;
    const y2 = 256 + Math.sin(a) * 230;
    ctx.strokeStyle = i % 3 === 0 ? '#22e3ff' : '#e0a938';
    ctx.lineWidth = i % 3 === 0 ? 1.5 : 2.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(x2, y2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#161822';
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.fillRect(186, 186, 140, 140);
  ctx.strokeRect(186, 186, 140, 140);

  ctx.fillStyle = '#f5f3ff';
  ctx.font = '700 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PRISM S1', 256, 250);
  ctx.fillStyle = '#22e3ff';
  ctx.font = '600 15px monospace';
  ctx.fillText('NEURAL DSP', 256, 278);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBaffleTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#181922';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let r = 40; r < 250; r += 3) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = '#050509';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(a);
    ctx.fillRect(92, -6, 86, 12);
    ctx.restore();
  }

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = 256 + Math.cos(a) * 222;
    const y = 256 + Math.sin(a) * 222;
    ctx.fillStyle = '#8e92a4';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#12131a';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createHeadphoneScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.05;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.15, 11.2);
  camera.lookAt(0, 0.05, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(4.5, 7.5, 6.5);
  scene.add(key);

  const fillFront = new THREE.DirectionalLight(0xdbeafe, 0.95);
  fillFront.position.set(-5, 1.5, 7);
  scene.add(fillFront);

  const rimMagenta = new THREE.PointLight(0xff2d9a, 72, 28, 1.5);
  rimMagenta.position.set(-6.5, 3.2, -3.5);
  scene.add(rimMagenta);

  const rimCyan = new THREE.PointLight(0x22e3ff, 65, 28, 1.5);
  rimCyan.position.set(6.5, -3.5, 4.2);
  scene.add(rimCyan);

  const rimTop = new THREE.SpotLight(0xc8ff3d, 38, 22, Math.PI / 4, 0.6, 1.4);
  rimTop.position.set(0, 7.5, -2);
  scene.add(rimTop);

  const knitBump = makeKnitBump();
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: COLOURWAYS.ultraviolet.shell,
    metalness: 0.68,
    roughness: 0.24,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
    reflectivity: 0.9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });
  const shellRimMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.shellRim,
    metalness: 0.92,
    roughness: 0.14,
  });
  const bandMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.band,
    metalness: 0.94,
    roughness: 0.18,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.canopy,
    roughness: 0.88,
    metalness: 0.05,
    bumpMap: knitBump,
    bumpScale: 0.035,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.cushion,
    roughness: 0.86,
    metalness: 0.04,
    bumpMap: knitBump,
    bumpScale: 0.045,
  });
  const baffleMat = new THREE.MeshStandardMaterial({
    map: makeBaffleTexture(),
    metalness: 0.78,
    roughness: 0.32,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x4b4e5e,
    metalness: 0.95,
    roughness: 0.22,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe4e6f0,
    metalness: 1.0,
    roughness: 0.08,
  });
  const diaphragmMat = new THREE.MeshPhysicalMaterial({
    color: 0x12131c,
    metalness: 0.55,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    iridescence: 1.0,
    iridescenceIOR: 1.65,
    iridescenceThicknessMinimum: 140,
    iridescenceThicknessMaximum: 460,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xe8843c,
    metalness: 0.96,
    roughness: 0.2,
    emissive: 0x3a1200,
    emissiveIntensity: 0.4,
  });
  const batteryMat = new THREE.MeshStandardMaterial({
    color: 0x171822,
    metalness: 0.45,
    roughness: 0.42,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.accent,
    emissive: COLOURWAYS.ultraviolet.accent,
    emissiveIntensity: 1.8,
    roughness: 0.25,
  });
  const pcbMat = new THREE.MeshStandardMaterial({
    map: makePCBTexture(),
    metalness: 0.45,
    roughness: 0.35,
  });
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x22e3ff,
    wireframe: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const root = new THREE.Group();
  scene.add(root);

  const exploders = [];
  const partMeshes = {};
  const register = (obj, offset, partKey) => {
    obj.userData.rest = obj.position.clone();
    obj.userData.offset = offset;
    obj.userData.partKey = partKey || null;
    exploders.push(obj);
    if (partKey) {
      if (!partMeshes[partKey]) partMeshes[partKey] = [];
      partMeshes[partKey].push(obj);
    }
  };
  const anchors = {};

  // ---------- Sculpted Split-Rail Headband & Breathable Canopy ----------
  const headGroup = new THREE.Group();
  root.add(headGroup);

  const makeArchPoints = (zOffset, yInset = 0) => {
    const pts = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const u = (i / steps) * 2 - 1;
      const angle = u * (Math.PI * 0.47);
      const x = Math.sin(angle) * 1.72;
      const y = 0.72 + Math.cos(angle) * (1.86 - yInset);
      const z = zOffset * Math.cos(u * Math.PI * 0.42);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  };

  for (const zOff of [-0.26, 0.26]) {
    const railGeo = new THREE.TubeGeometry(makeArchPoints(zOff), 64, 0.055, 16, false);
    const rail = new THREE.Mesh(railGeo, bandMat);
    headGroup.add(rail);
  }

  const canopyPts = [];
  for (let i = 0; i <= 32; i++) {
    const u = ((i / 32) * 2 - 1) * 0.58;
    const angle = u * (Math.PI * 0.47);
    const x = Math.sin(angle) * 1.72;
    const y = 0.70 + Math.cos(angle) * 1.84;
    canopyPts.push(new THREE.Vector3(x, y, 0));
  }
  const canopyGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(canopyPts), 48, 0.042, 16, false);
  canopyGeo.scale(1, 1, 5.2);
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  headGroup.add(canopyMesh);

  for (const dir of [-1, 1]) {
    const sideGroup = new THREE.Group();
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.52, 24), chromeMat);
    piston.position.set(1.66 * dir, 0.78, 0);
    piston.rotation.z = -0.14 * dir;
    sideGroup.add(piston);

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.082, 0.34, 24), bandMat);
    cuff.position.set(1.62 * dir, 0.98, 0);
    cuff.rotation.z = -0.18 * dir;
    sideGroup.add(cuff);

    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 24), steelMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(1.64 * dir, 0.54, 0);
    sideGroup.add(hinge);

    headGroup.add(sideGroup);
  }
  register(headGroup, new THREE.Vector3(0, 0.38, 0), null);

  // ---------- Sculpted Stadium Earcup Profile ----------
  const shellProfile = [
    [0.0, 0.62],
    [0.44, 0.62],
    [0.70, 0.59],
    [0.84, 0.52],
    [0.92, 0.38],
    [0.96, 0.20],
    [0.96, 0.0],
    [0.92, 0.0],
    [0.89, 0.04],
    [0.89, 0.36],
    [0.78, 0.48],
    [0.52, 0.54],
    [0.0, 0.54],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const shellGeo = new THREE.LatheGeometry(shellProfile, 96);

  const buildCup = (dir) => {
    const cup = new THREE.Group();
    cup.position.set(CUP_X * dir, CUP_Y, 0);
    cup.rotation.z = -CUP_CANT * dir;
    root.add(cup);

    const axisRot = (-Math.PI / 2) * dir;

    // 07 · Outer Anodized Unibody Shell + Knurled Digital Crown + ANC Button
    const shellGroup = new THREE.Group();
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = axisRot;
    shell.scale.set(STADIUM_Y, 1, STADIUM_Z);
    shellGroup.add(shell);

    const shellWire = new THREE.Mesh(shellGeo, wireMat);
    shellWire.rotation.z = axisRot;
    shellWire.scale.set(STADIUM_Y * 1.003, 1.003, STADIUM_Z * 1.003);
    shellGroup.add(shellWire);

    const chamfer = new THREE.Mesh(new THREE.TorusGeometry(0.935, 0.018, 16, 96), shellRimMat);
    chamfer.rotation.y = (Math.PI / 2) * dir;
    chamfer.scale.set(STADIUM_Z, STADIUM_Y, 1);
    chamfer.position.x = 0.06 * dir;
    shellGroup.add(chamfer);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.015, 12, 96), accentMat);
    halo.rotation.y = (Math.PI / 2) * dir;
    halo.scale.set(STADIUM_Z, STADIUM_Y, 1);
    halo.position.x = 0.36 * dir;
    shellGroup.add(halo);

    if (dir > 0) {
      const crownGroup = new THREE.Group();
      crownGroup.position.set(0.24 * dir, 1.18, 0.22);
      crownGroup.rotation.z = -0.18;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 24), chromeMat);
      crownGroup.add(stem);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.11, 36), bandMat);
      crown.position.y = 0.08;
      crownGroup.add(crown);
      const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.014, 10, 36), accentMat);
      crownRing.rotation.x = Math.PI / 2;
      crownRing.position.y = 0.13;
      crownGroup.add(crownRing);
      shellGroup.add(crownGroup);

      const ancBtn = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 8, 16), bandMat);
      ancBtn.rotation.x = Math.PI / 2;
      ancBtn.position.set(0.24 * dir, 1.15, -0.25);
      shellGroup.add(ancBtn);
    }

    const usbPort = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.11, 8, 16), steelMat);
    usbPort.rotation.x = Math.PI / 2;
    usbPort.position.set(0.22 * dir, -1.19, 0);
    shellGroup.add(usbPort);

    shellGroup.position.x = -0.14 * dir;
    cup.add(shellGroup);
    register(shellGroup, new THREE.Vector3(1.78 * dir, 0, 0), dir > 0 ? 'shell' : null);

    // 06 · Vortex Acoustic Rear Labyrinth Damper
    const chamberGroup = new THREE.Group();
    const chamberRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.065, 16, 72), shellRimMat);
    chamberRing.rotation.y = (Math.PI / 2) * dir;
    chamberRing.scale.set(STADIUM_Z, STADIUM_Y, 1);
    chamberGroup.add(chamberRing);
    const rearSpider = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 32), steelMat);
    rearSpider.rotation.z = axisRot;
    rearSpider.scale.set(STADIUM_Y, 1, STADIUM_Z);
    chamberGroup.add(rearSpider);
    chamberGroup.position.x = 0.12 * dir;
    cup.add(chamberGroup);
    register(chamberGroup, new THREE.Vector3(1.62 * dir, 0, 0), dir > 0 ? 'chamber' : null);

    // 05 · Toroidal Silicon-Anode Battery Cell
    const battGroup = new THREE.Group();
    const batt = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.11, 18, 72), batteryMat);
    batt.rotation.y = (Math.PI / 2) * dir;
    batt.scale.set(STADIUM_Z, STADIUM_Y, 1.25);
    battGroup.add(batt);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.018, 10, 72), accentMat);
    stripe.rotation.y = (Math.PI / 2) * dir;
    stripe.scale.set(STADIUM_Z, STADIUM_Y, 1);
    stripe.position.x = 0.05 * dir;
    battGroup.add(stripe);
    battGroup.position.x = 0.04 * dir;
    cup.add(battGroup);
    register(battGroup, new THREE.Vector3(1.02 * dir, 0, 0), dir > 0 ? 'battery' : null);

    // 04 · PRISM S1 Dual-Core Audio Silicon PCB
    const pcbGroup = new THREE.Group();
    const pcb = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.035, 64), pcbMat);
    pcb.rotation.z = axisRot;
    pcb.scale.set(STADIUM_Y * 0.94, 1, STADIUM_Z * 0.94);
    pcbGroup.add(pcb);
    const pcbGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.014, 10, 64), copperMat);
    pcbGoldRim.rotation.y = (Math.PI / 2) * dir;
    pcbGoldRim.scale.set(STADIUM_Z * 0.94, STADIUM_Y * 0.94, 1);
    pcbGroup.add(pcbGoldRim);
    pcbGroup.position.x = -0.02 * dir;
    cup.add(pcbGroup);
    register(pcbGroup, new THREE.Vector3(0.45 * dir, 0, 0), dir > 0 ? 'pcb' : null);

    // 03 · 45 mm Graphene Ring-Magnet Driver
    const driver = new THREE.Group();
    const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.18, 64), chromeMat);
    magnet.rotation.z = axisRot;
    magnet.position.x = 0.1 * dir;
    driver.add(magnet);
    const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.62, 0.055, 64), steelMat);
    frame.rotation.z = axisRot;
    frame.position.x = -0.02 * dir;
    driver.add(frame);
    const surround = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.055, 16, 72), batteryMat);
    surround.rotation.y = (Math.PI / 2) * dir;
    surround.position.x = -0.05 * dir;
    driver.add(surround);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.38),
      diaphragmMat
    );
    dome.rotation.z = (Math.PI / 2) * dir;
    dome.position.x = 0.2 * dir;
    driver.add(dome);
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 48, 1, true), copperMat);
    coil.rotation.z = axisRot;
    coil.position.x = 0.02 * dir;
    driver.add(coil);
    driver.position.x = -0.08 * dir;
    cup.add(driver);
    register(driver, new THREE.Vector3(-0.18 * dir, 0, 0), dir > 0 ? 'driver' : null);

    // 02 · CNC Baffle & Optical Sensor Plate
    const baffleGroup = new THREE.Group();
    const baffle = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.045, 72), baffleMat);
    baffle.rotation.z = axisRot;
    baffle.scale.set(STADIUM_Y, 1, STADIUM_Z);
    baffleGroup.add(baffle);
    baffleGroup.position.x = -0.15 * dir;
    cup.add(baffleGroup);
    register(baffleGroup, new THREE.Vector3(-0.82 * dir, 0, 0), dir > 0 ? 'baffle' : null);

    // 01 · Magnetic Acoustic Knit Cushion + Inner L/R Scrim
    const cushionGroup = new THREE.Group();
    const bolster = new THREE.Mesh(new THREE.TorusGeometry(0.71, 0.24, 28, 96), cushionMat);
    bolster.rotation.y = (Math.PI / 2) * dir;
    bolster.scale.set(STADIUM_Z, STADIUM_Y, 0.92);
    cushionGroup.add(bolster);

    const scrimMat = new THREE.MeshStandardMaterial({
      map: makeScrimTexture(dir > 0 ? 'R' : 'L'),
      roughness: 0.9,
      metalness: 0.05,
    });
    const scrim = new THREE.Mesh(new THREE.CircleGeometry(0.68, 64), scrimMat);
    scrim.rotation.y = (-Math.PI / 2) * dir;
    scrim.scale.set(STADIUM_Z, STADIUM_Y, 1);
    scrim.position.x = 0.04 * dir;
    cushionGroup.add(scrim);

    const magClip = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.016, 12, 80), shellRimMat);
    magClip.rotation.y = (Math.PI / 2) * dir;
    magClip.scale.set(STADIUM_Z, STADIUM_Y, 1);
    magClip.position.x = 0.17 * dir;
    cushionGroup.add(magClip);

    cushionGroup.position.x = -0.32 * dir;
    cup.add(cushionGroup);
    register(cushionGroup, new THREE.Vector3(-1.05 * dir, 0, 0), dir > 0 ? 'cushion' : null);

    if (dir > 0) {
      const railGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.1, 0, 0),
        new THREE.Vector3(2.9, 0, 0),
      ]);
      const railMat = new THREE.LineBasicMaterial({
        color: 0x22e3ff,
        transparent: true,
        opacity: 0,
      });
      const guideLine = new THREE.Line(railGeo, railMat);
      cup.add(guideLine);
      cup.userData.guideMat = railMat;

      const waves = [];
      for (let i = 0; i < 4; i++) {
        const wMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x22e3ff : 0xff2d9a,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const wMesh = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.45, 64), wMat);
        wMesh.rotation.y = Math.PI / 2;
        wMesh.scale.set(STADIUM_Z, STADIUM_Y, 1);
        cup.add(wMesh);
        waves.push({ mesh: wMesh, mat: wMat, phase: i * 0.25 });
      }
      cup.userData.waves = waves;

      anchors.cushion = { obj: cushionGroup, local: new THREE.Vector3(0, 0.85, 0.35) };
      anchors.baffle = { obj: baffleGroup, local: new THREE.Vector3(0, -0.88, 0.35) };
      anchors.driver = { obj: driver, local: new THREE.Vector3(0, 0.62, 0.35) };
      anchors.pcb = { obj: pcbGroup, local: new THREE.Vector3(0, -0.72, 0.32) };
      anchors.battery = { obj: battGroup, local: new THREE.Vector3(0, 0.76, 0.32) };
      anchors.chamber = { obj: chamberGroup, local: new THREE.Vector3(0, -0.78, 0.32) };
      anchors.shell = { obj: shellGroup, local: new THREE.Vector3(0.42, 0.88, 0.35) };
    }
    return cup;
  };

  const rightCup = buildCup(1);
  const leftCup = buildCup(-1);

  const tmp = new THREE.Vector3();
  let currentExplode = 0;
  let waveIntensity = 0;
  let highlightedPart = null;

  function setExplode(t) {
    currentExplode = t;
    for (const o of exploders) {
      const isLeftPart = o.parent === leftCup;
      const factor = isLeftPart ? t * 0.22 : t;
      o.position.copy(o.userData.rest).addScaledVector(o.userData.offset, factor);
    }
    if (rightCup.userData.guideMat) {
      rightCup.userData.guideMat.opacity = Math.min(1, Math.max(0, (t - 0.08) * 1.4)) * 0.55;
    }
  }

  function setXray(amount) {
    shellMat.opacity = 1 - amount * 0.76;
    shellMat.needsUpdate = true;
    wireMat.opacity = amount * 0.55;
  }

  function setWaveIntensity(v) {
    waveIntensity = v;
  }

  function setHighlightedPart(partKey) {
    highlightedPart = partKey;
  }

  function stepWaves(time) {
    const waves = rightCup.userData.waves || [];
    const active = Math.max(waveIntensity, currentExplode * 0.65);
    for (const w of waves) {
      if (active <= 0.02) {
        w.mat.opacity = 0;
        continue;
      }
      const p = (time * 0.65 + w.phase) % 1;
      w.mesh.position.x = -0.15 - p * 2.2;
      const s = 0.75 + p * 0.85;
      w.mesh.scale.set(STADIUM_Z * s, STADIUM_Y * s, 1);
      w.mat.opacity = Math.sin(p * Math.PI) * 0.42 * active;
    }

    if (highlightedPart && partMeshes[highlightedPart]) {
      const pulse = 1 + Math.sin(time * 5) * 0.04;
      for (const k of Object.keys(partMeshes)) {
        const s = k === highlightedPart ? pulse : 1;
        for (const obj of partMeshes[k]) obj.scale.setScalar(s);
      }
    } else {
      for (const k of Object.keys(partMeshes)) {
        for (const obj of partMeshes[k]) obj.scale.setScalar(1);
      }
    }
  }

  function project(name) {
    const a = anchors[name];
    if (!a) return null;
    tmp.copy(a.local);
    a.obj.localToWorld(tmp);
    tmp.project(camera);
    return {
      x: (tmp.x * 0.5 + 0.5) * canvas.clientWidth,
      y: (-tmp.y * 0.5 + 0.5) * canvas.clientHeight,
      visible: tmp.z < 1,
    };
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render() {
    renderer.render(scene, camera);
  }

  return {
    root,
    camera,
    renderer,
    lights: { rimMagenta, rimCyan, rimTop },
    materials: { shellMat, shellRimMat, bandMat, canopyMat, cushionMat, accentMat },
    setExplode,
    setXray,
    setWaveIntensity,
    setHighlightedPart,
    stepWaves,
    project,
    resize,
    render,
  };
}

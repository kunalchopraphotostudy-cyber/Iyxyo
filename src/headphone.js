import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const COLOURWAYS = {
  ultraviolet: { shell: '#6d3df0', band: '#c4b5ff', accent: '#c084fc', cushion: '#1a1530', name: 'Ultraviolet' },
  magma: { shell: '#ff2d6f', band: '#ffd1b8', accent: '#ff8a3d', cushion: '#2a1218', name: 'Magma' },
  glacier: { shell: '#17c3f2', band: '#e2fbff', accent: '#7af9ff', cushion: '#0f2230', name: 'Glacier' },
  acid: { shell: '#b8ff2e', band: '#eaffc2', accent: '#5ef0a0', cushion: '#161f0e', name: 'Acid' },
  obsidian: { shell: '#1b1b26', band: '#a3a3b4', accent: '#8b5cf6', cushion: '#111118', name: 'Obsidian' },
};

const CUP_X = 2.3;

// Dot-grid texture for the acoustic grille.
function makeGrilleTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#2a2a3a';
  const step = 16;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const ox = (y / step) % 2 ? step / 2 : 0;
      ctx.beginPath();
      ctx.arc(x + ox, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Fine noise bump for the knit cushions.
function makeKnitBump() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 135;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

export function createHeadphoneScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.3, 12.5);
  camera.lookAt(0, 0.2, 0);

  // Lights: neutral key plus saturated rims for the vibrant look.
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rimMagenta = new THREE.PointLight(0xff2d9a, 60, 30, 1.6);
  rimMagenta.position.set(-7, 3, -3);
  scene.add(rimMagenta);
  const rimCyan = new THREE.PointLight(0x22e3ff, 50, 30, 1.6);
  rimCyan.position.set(7, -4, 4);
  scene.add(rimCyan);
  const fillLime = new THREE.PointLight(0xc8ff3d, 18, 25, 1.8);
  fillLime.position.set(0, -6, 3);
  scene.add(fillLime);

  // Materials
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: COLOURWAYS.ultraviolet.shell,
    metalness: 0.5,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
  });
  const bandMat = new THREE.MeshStandardMaterial({ color: COLOURWAYS.ultraviolet.band, metalness: 1, roughness: 0.28 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x15121f, roughness: 0.95, metalness: 0 });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.cushion,
    roughness: 0.92,
    metalness: 0,
    bumpMap: makeKnitBump(),
    bumpScale: 0.6,
  });
  const grilleMat = new THREE.MeshStandardMaterial({ map: makeGrilleTexture(), metalness: 0.7, roughness: 0.45 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x3b3b48, metalness: 0.95, roughness: 0.32 });
  const diaphragmMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a12,
    metalness: 0.4,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 1,
    iridescenceIOR: 1.7,
    iridescenceThicknessMinimum: 120,
    iridescenceThicknessMaximum: 480,
  });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xd9823a, metalness: 1, roughness: 0.3 });
  const batteryMat = new THREE.MeshStandardMaterial({ color: 0x1b1b24, metalness: 0.25, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: COLOURWAYS.ultraviolet.accent,
    emissive: COLOURWAYS.ultraviolet.accent,
    emissiveIntensity: 2.4,
    roughness: 0.3,
  });
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0e3a3a, metalness: 0.3, roughness: 0.5 });

  const root = new THREE.Group();
  scene.add(root);

  // Parts that explode: each has a rest position and an offset applied at explode = 1.
  const exploders = [];
  const register = (obj, offset) => {
    obj.userData.rest = obj.position.clone();
    obj.userData.offset = offset;
    exploders.push(obj);
  };
  const anchors = {};

  // ---------- Headband ----------
  const bandR = 3.0;
  const theta0 = Math.acos(2.7 / bandR);
  const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.11, 18, 120, Math.PI - 2 * theta0), bandMat);
  band.rotation.z = theta0;
  band.scale.z = 2.3;
  const bandGroup = new THREE.Group();
  bandGroup.add(band);
  bandGroup.scale.y = 1.3;
  bandGroup.position.y = 0;
  root.add(bandGroup);
  register(bandGroup, new THREE.Vector3(0, 1.05, 0));
  anchors.band = { obj: bandGroup, local: new THREE.Vector3(2.0, 2.35, 0.15) };

  const pad = new THREE.Mesh(new THREE.TorusGeometry(bandR - 0.17, 0.11, 14, 80, Math.PI * 0.42), padMat);
  pad.rotation.z = Math.PI * 0.29;
  pad.scale.z = 2.6;
  const padGroup = new THREE.Group();
  padGroup.add(pad);
  padGroup.scale.y = 1.3;
  root.add(padGroup);
  register(padGroup, new THREE.Vector3(0, 0.45, 0));

  // ---------- Cups ----------
  const shellProfile = [
    [0, 0.46], [0.36, 0.46], [0.6, 0.44], [0.76, 0.39], [0.86, 0.3], [0.91, 0.18], [0.93, 0.06], [0.93, 0],
    [0.86, 0], [0.86, 0.26], [0.78, 0.34], [0.58, 0.38], [0, 0.4],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const shellGeo = new THREE.LatheGeometry(shellProfile, 96);

  const buildCup = (dir) => {
    const cup = new THREE.Group();
    cup.position.x = CUP_X * dir;
    root.add(cup);
    const axisRot = (-Math.PI / 2) * dir; // maps local +Y of cylinders/lathes to outward X

    // Outer shell + dial + LED ring
    const shellGroup = new THREE.Group();
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = axisRot;
    shellGroup.add(shell);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.06, 48), bandMat);
    dial.rotation.z = axisRot;
    dial.position.x = 0.48 * dir;
    shellGroup.add(dial);
    const dialCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 48), steelMat);
    dialCap.rotation.z = axisRot;
    dialCap.position.x = 0.52 * dir;
    shellGroup.add(dialCap);
    const led = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.02, 8, 96), accentMat);
    led.rotation.y = (Math.PI / 2) * dir;
    led.position.x = 0.02 * dir;
    shellGroup.add(led);
    shellGroup.position.x = 0.15 * dir;
    cup.add(shellGroup);
    register(shellGroup, new THREE.Vector3(1.35 * dir, 0, 0));

    // Ring battery + PCB
    const battGroup = new THREE.Group();
    const batt = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 12, 72), batteryMat);
    batt.rotation.y = (Math.PI / 2) * dir;
    batt.scale.x = 1.4;
    battGroup.add(batt);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.022, 8, 72), accentMat);
    stripe.rotation.y = (Math.PI / 2) * dir;
    stripe.position.x = 0.1 * dir;
    battGroup.add(stripe);
    const pcb = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.03, 64), pcbMat);
    pcb.rotation.z = axisRot;
    pcb.position.x = -0.1 * dir;
    battGroup.add(pcb);
    battGroup.position.x = 0.36 * dir;
    cup.add(battGroup);
    register(battGroup, new THREE.Vector3(0.6 * dir, 0, 0));

    // Driver: magnet, surround, diaphragm dome, voice coil
    const driver = new THREE.Group();
    const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 64), steelMat);
    magnet.rotation.z = axisRot;
    magnet.position.x = 0.1 * dir;
    driver.add(magnet);
    const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 64), steelMat);
    frame.rotation.z = axisRot;
    frame.position.x = -0.03 * dir;
    driver.add(frame);
    const surround = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 12, 72), batteryMat);
    surround.rotation.y = (Math.PI / 2) * dir;
    surround.position.x = -0.06 * dir;
    driver.add(surround);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.38), diaphragmMat);
    dome.rotation.z = (Math.PI / 2) * dir; // dome pole points inward (toward ear)
    dome.position.x = 0.22 * dir;
    driver.add(dome);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 64), copperMat);
    coil.rotation.y = (Math.PI / 2) * dir;
    coil.position.x = -0.12 * dir;
    driver.add(coil);
    driver.position.x = 0.02 * dir;
    cup.add(driver);
    register(driver, new THREE.Vector3(0, 0, 0));

    // Acoustic grille
    const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.06, 72), grilleMat);
    grille.rotation.z = axisRot;
    grille.position.x = -0.22 * dir;
    cup.add(grille);
    register(grille, new THREE.Vector3(-0.55 * dir, 0, 0));

    // Cushion
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.27, 24, 96), cushionMat);
    cushion.rotation.y = (Math.PI / 2) * dir;
    cushion.scale.x = 0.8;
    cushion.position.x = -0.46 * dir;
    cup.add(cushion);
    register(cushion, new THREE.Vector3(-1.2 * dir, 0, 0));

    // Arm + pivot (world-ish coords, relative to cup)
    const arm = new THREE.Group();
    const slider = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.85, 0.36), bandMat);
    slider.position.set(0.4 * dir, 1.35, 0);
    arm.add(slider);
    const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 24), steelMat);
    pivot.position.set(0.4 * dir, 0.96, 0);
    arm.add(pivot);
    cup.add(arm);
    register(arm, new THREE.Vector3(0.35 * dir, 0.55, 0));

    if (dir > 0) {
      anchors.shell = { obj: shellGroup, local: new THREE.Vector3(0.5, 0.55, 0.4) };
      anchors.battery = { obj: battGroup, local: new THREE.Vector3(0, -0.55, 0.3) };
      anchors.driver = { obj: driver, local: new THREE.Vector3(0, 0.4, 0.35) };
      anchors.grille = { obj: grille, local: new THREE.Vector3(0, -0.6, 0.5) };
      anchors.cushion = { obj: cushion, local: new THREE.Vector3(0, -0.8, 0.45) };
    }
    return cup;
  };

  buildCup(1);
  buildCup(-1);

  // Soft contact glow under the headphones
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(139,92,246,0.55)');
    g.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  glow.position.z = -2.5;
  root.add(glow);

  // ---------- API ----------
  const tmp = new THREE.Vector3();

  function setExplode(t) {
    for (const o of exploders) {
      o.position.copy(o.userData.rest).addScaledVector(o.userData.offset, t);
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
    materials: { shellMat, bandMat, cushionMat, accentMat },
    setExplode,
    project,
    resize,
    render,
  };
}

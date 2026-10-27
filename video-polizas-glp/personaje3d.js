// Operario 3D (Three.js r149, UMD). Se dibuja en un canvas transparente que se superpone
// a la ilustración SVG, alineado al rectángulo #inspBox del mundo (1 m = U unidades SVG).
THREE.ColorManagement.legacyMode = false;   // colores hex en sRGB
const CHAR3D = (() => {
  const U = 261;                                  // unidades SVG por metro (1,80 m ≈ 470 u)
  const BOX = { x: -170, y: -510, w: 400, h: 525 };   // rectángulo del personaje en coordenadas del mundo (pies en y=0)
  const canvas = document.createElement('canvas');
  canvas.id = 'char3d';
  Object.assign(canvas.style, { position: 'absolute', left: 0, top: 0, pointerEvents: 'none', transformOrigin: '0 0' });
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(BOX.x / U, (BOX.x + BOX.w) / U, -BOX.y / U, -(BOX.y + BOX.h) / U, 0.1, 50);
  cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0);

  // luces: clave cálida, relleno de cielo y contraluz frío
  scene.add(new THREE.HemisphereLight(0xe8f1ff, 0x8a7f74, 0.75));
  const key = new THREE.DirectionalLight(0xfff1de, 1.55);
  key.position.set(2.2, 4, 3.4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -1.5; key.shadow.camera.right = 1.5; key.shadow.camera.top = 2.2; key.shadow.camera.bottom = -0.5; key.shadow.radius = 4; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd7ff, 0.9); rim.position.set(-3, 2.5, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-1.5, 1, 4); scene.add(fill);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.22 }));
  catcher.rotation.x = -Math.PI / 2; catcher.receiveShadow = true; scene.add(catcher);

  // materiales
  const M = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.62, metalness: 0 }, o));
  const mat = {
    skin: M(0xe2a57c, { roughness: 0.55 }), skinD: M(0xc9875f), lips: M(0xb4614e, { roughness: 0.5 }), hair: M(0x2a1a12, { roughness: 0.8 }),
    white: M(0xfbfbfb, { roughness: 0.25 }), iris: M(0x5a3520, { roughness: 0.3 }), pupil: M(0x0d0806, { roughness: 0.2 }), brow: M(0x2a1a12),
    shirt: M(0x1f4fa8, { roughness: 0.75 }), shirtD: M(0x183f86, { roughness: 0.75 }), vest: M(0xff7a00, { roughness: 0.55 }),
    refl: M(0xe9eef5, { roughness: 0.25, metalness: 0.35 }), pants: M(0x26375f, { roughness: 0.8 }), boot: M(0x3a2a1f, { roughness: 0.55 }),
    sole: M(0x15100c, { roughness: 0.9 }), glove: M(0xf2c14e, { roughness: 0.7 }), helmet: new THREE.MeshPhysicalMaterial({ color: 0xffc21c, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    helmetD: M(0xd99a00, { roughness: 0.35 }), frame: M(0x1b2a4f, { roughness: 0.3 }), lens: new THREE.MeshPhysicalMaterial({ color: 0xbfefff, transparent: true, opacity: 0.28, roughness: 0.05, side: THREE.DoubleSide }),
    belt: M(0x1b1b22, { roughness: 0.5 }), metal: M(0xc7d3ea, { roughness: 0.25, metalness: 0.8 }), dark: M(0x1b2a4f, { roughness: 0.45 }), orange: M(0xff7a00, { roughness: 0.5 }),
    green: M(0x12b76a), card: M(0xffffff, { roughness: 0.4 }), blue: M(0x0047bb),
  };
  const mesh = (geo, m, parent, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
  };
  const S = (r, w = 32, h = 24) => new THREE.SphereGeometry(r, w, h);
  const CAP = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20);
  const CYL = (r1, r2, h, open = false, t0 = 0, tl = Math.PI * 2) => new THREE.CylinderGeometry(r1, r2, h, 40, 1, open, t0, tl);
  const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const tube = (pts, r, m, parent) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 40, r, 10, false), m, parent);
  const arc = (rad, y, a0, a1, n = 16, zs = 1, zo = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (n - 1); return [rad * Math.sin(a), y, rad * Math.cos(a) * zs + zo]; });

  const root = grp(scene);
  const body = grp(root, 0, -0.03, 0);          // todo el cuerpo (respiración/balanceo)
  const ZS = 0.64;                 // profundidad relativa del torso (sección elíptica)

  // ---------- piernas ----------
  const legs = [];
  [-1, 1].forEach(s => {
    const hip = grp(body, s * 0.095, 0.95, 0);
    mesh(CAP(0.08, 0.3), mat.pants, hip, 0, -0.2, 0);
    mesh(new THREE.BoxGeometry(0.05, 0.1, 0.03), mat.pants, hip, s * 0.075, -0.22, 0.02).rotation.z = s * 0.05;   // bolsillo cargo
    const knee = grp(hip, 0, -0.42, 0);
    mesh(S(0.072), mat.pants, knee, 0, 0, 0, 1, 1.1, 1);
    mesh(CAP(0.07, 0.32), mat.pants, knee, 0, -0.18, 0);
    mesh(CYL(0.074, 0.074, 0.032, true), mat.refl, knee, 0, -0.27, 0);
    const ankle = grp(knee, 0, -0.39, 0);
    const boot = mesh(CAP(0.062, 0.13), mat.boot, ankle, 0, -0.06, 0.04, 1.12, 1, 0.78); boot.rotation.x = Math.PI / 2;
    const so = mesh(CAP(0.064, 0.15), mat.sole, ankle, 0, -0.1, 0.045, 1.14, 1, 0.3); so.rotation.x = Math.PI / 2;
    mesh(CYL(0.068, 0.07, 0.08), mat.boot, ankle, 0, -0.01, 0);
    legs.push({ hip, knee });
  });
  // pelvis y cinturón
  { const hipG = new THREE.LatheGeometry([[0, 0.855], [0.1, 0.862], [0.158, 0.89], [0.172, 0.94], [0.172, 1.0]].map(([r, y]) => new THREE.Vector2(r, y)), 48); const h = mesh(hipG, mat.pants, body); h.scale.z = ZS + 0.06; }
  mesh(CYL(0.175, 0.173, 0.05), mat.belt, body, 0, 1.0, 0, 1, 1, ZS + 0.02);
  mesh(new THREE.BoxGeometry(0.05, 0.04, 0.015), mat.metal, body, 0, 1.0, 0.176 * ZS + 0.004);

  // ---------- torso ----------
  const chest = grp(body, 0, 0, 0);
  const lathe = (pts, m, t0 = 0, tl = Math.PI * 2) => { const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64, t0, tl); const o = mesh(g, m, chest); o.scale.z = ZS; return o; };
  const TOR = [[0.0, 0.98], [0.158, 0.985], [0.162, 1.06], [0.182, 1.18], [0.203, 1.3], [0.207, 1.37], [0.19, 1.43], [0.15, 1.475], [0.08, 1.5], [0.058, 1.53]];
  lathe(TOR, mat.shirt);
  const gap = 0.36;   // abertura frontal del chaleco
  const VEST = [[0.174, 1.0], [0.177, 1.06], [0.196, 1.18], [0.216, 1.3], [0.22, 1.37], [0.204, 1.43], [0.165, 1.472]];
  const vc = document.createElement('canvas'); vc.width = 1024; vc.height = 512;
  const vg = vc.getContext('2d'); vg.fillStyle = '#FF7A00'; vg.fillRect(0, 0, 1024, 512);
  const phiL = Math.PI * 2 - gap, uOf = phi => (phi - gap / 2) / phiL * 1024;
  const vOf = y => (1 - (y - 1.0) / (1.472 - 1.0)) * 512;      // la textura se mapea de abajo (1.0) a arriba (1.472)
  const band = (y0, y1) => { vg.fillStyle = '#E9EEF5'; vg.fillRect(0, vOf(y1), 1024, vOf(y0) - vOf(y1)); vg.fillStyle = '#B7C2D3'; vg.fillRect(0, (vOf(y1) + vOf(y0)) / 2 - 2, 1024, 4); };
  band(1.1, 1.14); band(1.2, 1.24);
  [0.58, Math.PI * 2 - 0.58, Math.PI - 0.55, Math.PI + 0.55].forEach(phi => { const u = uOf(phi); vg.fillStyle = '#E9EEF5'; vg.fillRect(u - 12, 0, 24, vOf(1.1)); vg.fillStyle = '#B7C2D3'; vg.fillRect(u - 2, 0, 4, vOf(1.1)); });
  vg.fillStyle = '#E06300'; vg.fillRect(0, 0, 1024, 10); vg.fillRect(0, 502, 1024, 10);
  const vtex = new THREE.CanvasTexture(vc); vtex.encoding = THREE.sRGBEncoding; vtex.anisotropy = 4;
  lathe(VEST, M(0xffffff, { map: vtex, roughness: 0.55 }), gap / 2, Math.PI * 2 - gap);
  const surf = (x, y, r) => Math.sqrt(Math.max(0, r * r - x * x)) * ZS + 0.006;
  // cremallera, bolsillo con lapicero, fotocheck, radio y cuello de camisa
  tube([[0, 0.99, 0.176 * ZS + 0.002], [0, 1.25, 0.206 * ZS + 0.002], [0, 1.44, 0.17 * ZS]], 0.0035, mat.metal, chest);
  mesh(new THREE.BoxGeometry(0.07, 0.07, 0.012), mat.vest, chest, 0.09, 1.3, surf(0.09, 1.3, 0.218) + 0.002).rotation.y = 0.45;
  mesh(CYL(0.006, 0.006, 0.07), mat.blue, chest, 0.105, 1.34, surf(0.105, 1.34, 0.218) + 0.008);
  mesh(new THREE.BoxGeometry(0.06, 0.08, 0.006), mat.card, chest, -0.1, 1.27, surf(0.1, 1.27, 0.218) + 0.006).rotation.y = -0.5;
  mesh(new THREE.BoxGeometry(0.026, 0.03, 0.007), mat.blue, chest, -0.108, 1.28, surf(0.108, 1.28, 0.218) + 0.009).rotation.y = -0.5;
  mesh(new THREE.BoxGeometry(0.04, 0.075, 0.03), mat.belt, chest, -0.15, 1.39, surf(0.15, 1.39, 0.215) - 0.01).rotation.y = -0.7;
  mesh(CYL(0.005, 0.005, 0.08), mat.belt, chest, -0.15, 1.46, surf(0.15, 1.39, 0.215) - 0.01);
  [-1, 1].forEach(s => { const c = mesh(new THREE.ConeGeometry(0.035, 0.07, 3), mat.shirtD, chest, s * 0.035, 1.47, 0.07); c.rotation.set(Math.PI * 0.62, 0, s * 0.5); });

  // ---------- brazos ----------
  const mkArm = (s) => {
    const sh = grp(chest, s * 0.188, 1.405, 0);
    mesh(S(0.064), mat.shirt, sh, 0, -0.005, 0, 1, 1, 0.95);
    mesh(CAP(0.054, 0.2), mat.shirt, sh, 0, -0.14, 0);
    const el = grp(sh, 0, -0.28, 0);
    mesh(S(0.05), mat.shirt, el, 0, 0, 0);
    mesh(CAP(0.047, 0.18), mat.shirt, el, 0, -0.12, 0);
    mesh(CYL(0.05, 0.047, 0.045), mat.glove, el, 0, -0.235, 0);
    const wr = grp(el, 0, -0.26, 0);
    mesh(S(0.046), mat.glove, wr, 0, -0.045, 0, 0.82, 1.15, 0.62);
    const th = mesh(CAP(0.016, 0.035), mat.glove, wr, s * -0.032, -0.035, 0.018); th.rotation.z = s * 0.6;
    const idx = mesh(CAP(0.012, 0.05), mat.glove, wr, s * 0.004, -0.11, 0.012); idx.visible = false;
    return { sh, el, wr, idx };
  };
  const armR = mkArm(-1);   // brazo derecho del personaje (señala)
  const armL = mkArm(1);    // brazo izquierdo (sostiene la tablet)
  // lapicero en la mano derecha
  const pen = mesh(CYL(0.006, 0.006, 0.12), mat.dark, armR.wr, 0.0, -0.06, 0.03); pen.rotation.x = 1.2;

  // tablet con pantalla dibujada
  const tc = document.createElement('canvas'); tc.width = 256; tc.height = 352;
  const g2 = tc.getContext('2d');
  g2.fillStyle = '#0B66D6'; g2.fillRect(0, 0, 256, 352);
  g2.fillStyle = 'rgba(6,19,47,.55)'; g2.fillRect(0, 0, 256, 46); g2.fillStyle = '#fff'; g2.fillRect(18, 18, 110, 11);
  for (let k = 0; k < 5; k++) {
    const y = 72 + k * 48;
    g2.fillStyle = k < 4 ? '#12B76A' : 'rgba(255,255,255,.5)'; g2.fillRect(18, y, 30, 30);
    if (k < 4) { g2.strokeStyle = '#fff'; g2.lineWidth = 5; g2.beginPath(); g2.moveTo(24, y + 15); g2.lineTo(31, y + 22); g2.lineTo(43, y + 8); g2.stroke(); }
    g2.fillStyle = 'rgba(255,255,255,.85)'; g2.fillRect(60, y + 9, 160 - k * 18, 12);
  }
  g2.fillStyle = '#FFB81C'; g2.fillRect(18, 316, 220, 14);
  const ttex = new THREE.CanvasTexture(tc); ttex.encoding = THREE.sRGBEncoding;
  const tab = grp(armL.wr, 0, -0.06, 0.06);
  mesh(new THREE.BoxGeometry(0.21, 0.285, 0.02), mat.dark, tab);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.04, 0.04, 0.026), mat.orange, tab, a * 0.095, b * 0.13, 0));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.25), new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false }));
  screen.position.z = 0.0115; tab.add(screen);
  tab.rotation.set(-0.9,2.9,0.2);

  // ---------- cuello y cabeza ----------
  // Cráneo elipsoidal: centro (0,.125,0), semiejes (.0945,.1176,.103). surfZ da la superficie frontal.
  const SK = { y: 0.125, ax: 0.0945, ay: 0.1176, az: 0.103 };
  const surfZ = (x, y) => SK.az * Math.sqrt(Math.max(0, 1 - (x / SK.ax) ** 2 - ((y - SK.y) / SK.ay) ** 2));
  const neck = grp(chest, 0, 1.5, 0.0);
  mesh(CYL(0.054, 0.06, 0.11), mat.skinD, neck, 0, 0.0, -0.006);
  const head = grp(neck, 0, 0.03, 0.004); head.scale.setScalar(1.12);
  // cabeza en una sola malla: esfera deformada (mandíbula que se estrecha y mentón adelantado)
  const hg = new THREE.SphereGeometry(1, 96, 72), hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    let x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    if (y < 0) {
      const k = -y;
      x *= 1 - 0.2 * Math.pow(k, 1.4);                                   // mandíbula más estrecha
      z *= 1 - 0.12 * k;
      if (z > 0) z += 0.06 * Math.pow(k, 2) * Math.max(0, 1 - Math.abs(x) * 1.8);   // mentón
      y *= 1 + 0.12 * Math.pow(k, 2);                                     // rostro algo más largo
    } else {
      z *= 1 - 0.05 * y;                                                  // frente apenas inclinada
    }
    if (z > 0 && Math.abs(y + 0.05) < 0.35) z += 0.035 * (1 - Math.abs(x) * 1.6) * Math.max(0, 1 - Math.abs(y + 0.05) / 0.35);  // plano facial
    hp.setXYZ(i, x * SK.ax, y * SK.ay * 1.0, z * SK.az);
  }
  hg.computeVertexNormals();
  mesh(hg, mat.skin, head, 0, SK.y, 0);
  // cabello: nuca, laterales y patillas
  mesh(S(0.106, 48, 36), mat.hair, head, 0, 0.15, -0.02, 0.93, 0.95, 0.96);
  [-1, 1].forEach(s => mesh(CAP(0.007, 0.03), mat.hair, head, s * 0.086, 0.122, 0.03));
  // orejas
  [-1, 1].forEach(s => { mesh(S(0.028), mat.skin, head, s * 0.093, 0.112, -0.004, 0.42, 1.0, 0.7); mesh(S(0.015), mat.skinD, head, s * 0.1, 0.112, -0.002, 0.3, 0.7, 0.5); });
  // ojos sobre la superficie
  const lids = [];
  [-1, 1].forEach(s => {
    const ex = s * 0.035, ey = 0.132, ez = surfZ(ex, ey) + 0.003;
    const e = grp(head, ex, ey, ez - 0.012);
    mesh(S(0.019, 32, 24), mat.white, e, 0, 0, 0, 1.05, 0.78, 0.75);
    mesh(S(0.0108), mat.iris, e, s * -0.001, -0.001, 0.0112, 1, 1, 0.45);
    mesh(S(0.0055), mat.pupil, e, s * -0.001, -0.001, 0.0145, 1, 1, 0.35);
    mesh(S(0.0024), mat.white, e, 0.0035, 0.0035, 0.016);
    // párpado superior (visible en reposo como línea) y parpadeo
    const lid = mesh(new THREE.SphereGeometry(0.0205, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat.skin, e, 0, 0.0, 0.0005, 1.08, 0.42, 0.8); lids.push(lid);
    mesh(new THREE.TorusGeometry(0.019, 0.0016, 6, 24, Math.PI), mat.brow, e, 0, 0.0035, 0.004, 1.05, 0.75, 1);
    const by = 0.178, br = mesh(CAP(0.0048, 0.03), mat.brow, head, s * 0.036, by, surfZ(s * 0.036, by) + 0.004); br.rotation.z = Math.PI / 2 + s * -0.12; br.rotation.y = s * 0.3;
  });
  // nariz
  mesh(CAP(0.0105, 0.032), mat.skin, head, 0, 0.112, surfZ(0, 0.112) - 0.004).rotation.x = -0.32;
  mesh(S(0.017), mat.skin, head, 0, 0.097, surfZ(0, 0.097) + 0.004, 0.85, 0.9, 0.95);
  [-1, 1].forEach(s => mesh(S(0.0085), mat.skin, head, s * 0.013, 0.093, surfZ(s * 0.013, 0.093) - 0.002, 1, 0.8, 0.8));
  // boca y labio inferior
  const mz = 0.018 + 0.08 * 0.9 + 0.002;
  const mouth = mesh(new THREE.TorusGeometry(0.021, 0.0038, 10, 24, Math.PI * 0.55), mat.lips, head, 0, 0.072, mz - 0.006);
  mouth.rotation.z = -Math.PI / 2 - Math.PI * 0.275; mouth.rotation.x = -0.2;
  mesh(S(0.011), mat.skinD, head, 0, 0.052, mz - 0.006, 1.3, 0.4, 0.5);
  // lentes de seguridad envolventes (por delante de los ojos)
  const LR = 0.122, LZ = 0.0, LY = 0.133;
  mesh(CYL(LR, LR, 0.04, true, -0.85, 1.7), mat.lens, head, 0, LY, LZ);
  tube(arc(LR + 0.001, LY + 0.021, -0.86, 0.86, 22, 1, LZ), 0.0038, mat.frame, head);
  tube(arc(LR + 0.001, LY - 0.02, -0.86, -0.13, 10, 1, LZ), 0.0026, mat.frame, head);
  tube(arc(LR + 0.001, LY - 0.02, 0.13, 0.86, 10, 1, LZ), 0.0026, mat.frame, head);
  [-1, 1].forEach(s => tube([[s * LR * Math.sin(0.86), LY + 0.016, LR * Math.cos(0.86)], [s * 0.098, LY + 0.01, 0.02], [s * 0.1, LY, -0.03]], 0.003, mat.frame, head));
  // casco: domo, cresta, visera y sticker, apoyado sobre la frente
  const hel = grp(head, 0, 0.19, -0.006);
  const HR = 0.12, HS = [1, 0.88, 1.1];
  mesh(new THREE.SphereGeometry(HR, 56, 28, 0, Math.PI * 2, 0, Math.PI / 2), mat.helmet, hel, 0, 0, 0, ...HS).material.side = THREE.DoubleSide;
  const ridge = mesh(new THREE.TorusGeometry(HR, 0.008, 10, 48, Math.PI), mat.helmetD, hel, 0, 0, 0, HS[2], HS[1], 1); ridge.rotation.y = Math.PI / 2;
  mesh(new THREE.LatheGeometry([new THREE.Vector2(HR - 0.004, 0.004), new THREE.Vector2(HR + 0.02, -0.004), new THREE.Vector2(HR + 0.032, -0.01), new THREE.Vector2(HR + 0.032, -0.017), new THREE.Vector2(HR - 0.004, -0.006)], 64), mat.helmetD, hel, 0, 0, 0.012, 1, 1, 1.16);
  const d = new THREE.Vector3(0.62, 0.45, 0.64).normalize();
  const stk = grp(hel, HR * d.x, HR * HS[1] * d.y, HR * HS[2] * d.z);
  stk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(d.x / HS[0], d.y / HS[1], d.z / HS[2]).normalize());
  mesh(CYL(0.02, 0.02, 0.003), mat.card, stk, 0, 0, 0.001).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.024, 0.007, 0.003), mat.green, stk, 0, 0, 0.004); mesh(new THREE.BoxGeometry(0.007, 0.024, 0.003), mat.green, stk, 0, 0, 0.004);

  // orientación general: 3/4 hacia la derecha de la pantalla
  root.rotation.y = 0.55;

  // ---------- pose y animación ----------
  function pose(t, st) {
    const br = Math.sin(t * 1.8);
    body.position.y = -0.03 + br * 0.004;
    chest.scale.set(1 + br * 0.006, 1, 1 + br * 0.008);
    root.rotation.y = 0.55 + Math.sin(t * 0.31) * 0.05 - (st.point || 0) * 0.25;
    // cabeza: deriva suave + asentir + mirar
    neck.rotation.set(0.05 + Math.sin(t * 0.9) * 0.03 + (st.nod || 0) * Math.sin(t * 7) * 0.12 - (st.look || 0) * 0.22 + 0.12,
      Math.sin(t * 0.37) * 0.12 - (st.point || 0) * 0.45, Math.sin(t * 0.53) * 0.03);
    // brazo izquierdo: sostiene la tablet frente al pecho
    armL.sh.rotation.set(-0.42 + Math.sin(t * 1.2) * 0.03, 0, 0.16);
    armL.el.rotation.set(-1.45 + Math.sin(t * 1.4) * 0.03, 0.15, 0);
    armL.wr.rotation.set(0.2, -0.35, -0.2);
    // brazo derecho: reposo con lapicero ↔ señalar
    const p = st.point || 0;
    const tap = Math.max(0, Math.sin(t * 5.5)) * (Math.sin(t * 0.7) > 0 ? 1 : 0) * (1 - p);
    armR.sh.rotation.set(-0.12 - tap * 0.05 + p * -1.25, 0, -0.08 - p * 0.75 + Math.sin(t * 1.1) * 0.02);
    armR.el.rotation.set(-0.35 - tap * 0.15 + p * 0.25, 0, 0);
    armR.wr.rotation.set(0, 0, 0);
    armR.idx.visible = p > 0.6; pen.visible = p < 0.6;
    // parpadeo
    const blink = (t % 3.7) < 0.13 || (t % 11.3) < 0.1;
    lids.forEach(l => { l.rotation.x = blink ? 0.0 : -1.25; l.scale.y = blink ? 0.9 : 0.42; });
    legs.forEach((l, i) => { l.hip.rotation.x = Math.sin(t * 0.8 + i) * 0.01; });
  }

  // ---------- render alineado al mundo SVG ----------
  let box = null, host = null, lastW = 0, lastH = 0;
  function attach(worldHost, anchor) { host = worldHost; box = anchor; host.appendChild(canvas); }
  function render(t, st) {
    if (!box) return;
    const wv = getComputedStyle(host);
    const r = box.getBoundingClientRect(), hr = host.getBoundingClientRect();
    const visible = wv.visibility !== 'hidden' && r.right > hr.left && r.left < hr.right && r.bottom > hr.top && r.top < hr.bottom && r.height > 4;
    canvas.style.display = visible ? 'block' : 'none';
    if (!visible) return;
    const pr = Math.min(1.5, 1800 / r.height);
    const W = Math.max(2, Math.round(r.width * pr)), H = Math.max(2, Math.round(r.height * pr));
    if (W !== lastW || H !== lastH) { renderer.setSize(W, H, false); lastW = W; lastH = H; }
    canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
    canvas.style.left = (r.left - hr.left) + 'px'; canvas.style.top = (r.top - hr.top) + 'px';
    pose(t, st);
    renderer.render(scene, cam);
  }
  return { attach, render, BOX, U, pose, renderer, scene, cam };
})();

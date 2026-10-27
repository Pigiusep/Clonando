// Técnico Solgas 3D (Three.js r149, UMD), basado en el personaje de referencia:
// peruano, rostro redondo y sonriente, contextura robusta, uniforme azul con canesú naranja + EPP.
// Se dibuja en un canvas transparente alineado al rectángulo #inspBox del mundo SVG (1 m = U unidades).
THREE.ColorManagement.legacyMode = false;   // colores hex en sRGB
const CHAR3D = (() => {
  const U = 268;
  const BOX = { x: -170, y: -510, w: 400, h: 525 };
  const canvas = document.createElement('canvas');
  canvas.id = 'char3d';
  Object.assign(canvas.style, { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' });
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(BOX.x / U, (BOX.x + BOX.w) / U, -BOX.y / U, -(BOX.y + BOX.h) / U, 0.1, 50);
  cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x8a7a6c, 0.8));
  const key = new THREE.DirectionalLight(0xfff0dc, 1.6);
  key.position.set(2.2, 4, 3.4); key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 2.1, bottom: -0.4 });
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd7ff, 0.95); rim.position.set(-3, 2.5, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xfff6ee, 0.4); fill.position.set(-1.5, 1, 4); scene.add(fill);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.22 }));
  catcher.rotation.x = -Math.PI / 2; catcher.receiveShadow = true; scene.add(catcher);

  // ---------- materiales ----------
  const M = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.62, metalness: 0 }, o));
  const mat = {
    skin: M(0xb9784f, { roughness: 0.5 }), skinD: M(0x9c6140, { roughness: 0.55 }), skinL: M(0xc98a60, { roughness: 0.5 }),
    lips: M(0x8e4a3a, { roughness: 0.45 }), mouthIn: M(0x4a1a16, { roughness: 0.6 }), teeth: M(0xfaf7f0, { roughness: 0.25 }), tongue: M(0xc2645a),
    hair: M(0x141010, { roughness: 0.75 }), white: M(0xfcfcfa, { roughness: 0.2 }), iris: M(0x3b2416, { roughness: 0.25 }), pupil: M(0x080504, { roughness: 0.2 }),
    brow: M(0x161010, { roughness: 0.8 }),
    suit: M(0x2347a8, { roughness: 0.78 }), suitD: M(0x1c3a8c, { roughness: 0.78 }), navy: M(0x18234a, { roughness: 0.85 }), yoke: M(0xe8600a, { roughness: 0.72 }),
    refl: M(0xe6ebf2, { roughness: 0.22, metalness: 0.4 }), boot: M(0x18181c, { roughness: 0.45 }), sole: M(0x0c0c0e, { roughness: 0.9 }),
    helmet: new THREE.MeshPhysicalMaterial({ color: 0xf7f8fa, roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15, side: THREE.DoubleSide }),
    helmetD: M(0xd9dee8, { roughness: 0.35 }), frame: M(0x1b2a4f, { roughness: 0.3 }),
    lens: new THREE.MeshPhysicalMaterial({ color: 0xcff3ff, transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide }),
    belt: M(0x1b1b22, { roughness: 0.5 }), metal: M(0xc7d3ea, { roughness: 0.25, metalness: 0.8 }), dark: M(0x1b2a4f, { roughness: 0.45 }),
    orange: M(0xff7a00, { roughness: 0.5 }), card: M(0xffffff, { roughness: 0.4 }), blue: M(0x0047bb), green: M(0x12b76a),
  };
  const mesh = (geo, m, parent, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
  };
  const S = (r, w = 40, h = 30) => new THREE.SphereGeometry(r, w, h);
  const CAP = (r, l) => new THREE.CapsuleGeometry(r, l, 10, 24);
  const CYL = (r1, r2, h, open = false, t0 = 0, tl = Math.PI * 2) => new THREE.CylinderGeometry(r1, r2, h, 48, 1, open, t0, tl);
  const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const tube = (pts, r, m, parent) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 10, false), m, parent);
  const arc = (rad, y, a0, a1, n = 16, zo = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (n - 1); return [rad * Math.sin(a), y, rad * Math.cos(a) + zo]; });
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
  // perfil de torno remuestreado a pasos uniformes en y (para que la textura se mapee lineal en altura)
  const profile = (pts, n = 40) => { const out = []; const y0 = pts[0][1], y1 = pts[pts.length - 1][1];
    for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; let k = 0; while (k < pts.length - 2 && pts[k + 1][1] < y) k++;
      const [ra, ya] = pts[k], [rb, yb] = pts[k + 1], f = (y - ya) / (yb - ya || 1); out.push(new THREE.Vector2(ra + (rb - ra) * f, y)); } return out; };

  const root = grp(scene);
  const body = grp(root);
  const ZS = 0.68;

  // ---------- piernas (contextura robusta) ----------
  const legs = [];
  [-1, 1].forEach(s => {
    const hip = grp(body, s * 0.1, 0.86, 0);
    mesh(CAP(0.092, 0.24), mat.suit, hip, 0, -0.18, 0);
    const knee = grp(hip, 0, -0.38, 0);
    mesh(S(0.085), mat.suit, knee, 0, 0, 0.004, 1, 1.05, 1);
    mesh(CAP(0.082, 0.26), mat.suit, knee, 0, -0.17, 0);
    mesh(CYL(0.086, 0.086, 0.034, true), mat.refl, knee, 0, -0.24, 0);
    mesh(CYL(0.087, 0.084, 0.05, true), mat.suitD, knee, 0, -0.33, 0);         // basta del pantalón
    const ankle = grp(knee, 0, -0.38, 0);
    // botín de seguridad negro
    mesh(CYL(0.072, 0.078, 0.07), mat.boot, ankle, 0, 0.005, 0);
    const boot = mesh(CAP(0.07, 0.14), mat.boot, ankle, 0, -0.045, 0.045, 1.15, 1, 0.75); boot.rotation.x = Math.PI / 2;
    const so = mesh(CAP(0.072, 0.16), mat.sole, ankle, 0, -0.085, 0.048, 1.18, 1, 0.28); so.rotation.x = Math.PI / 2;
    [0, 1, 2].forEach(k => mesh(CAP(0.004, 0.05), mat.metal, ankle, 0, 0.0 - k * 0.018, 0.07 + k * 0.012).rotation.z = Math.PI / 2);
    legs.push({ hip, knee });
  });
  mesh(new THREE.LatheGeometry(profile([[0, 0.74], [0.12, 0.75], [0.185, 0.79], [0.205, 0.85], [0.205, 0.92]], 16), 56), mat.suit, body).scale.z = ZS + 0.06;
  // cinturón del mameluco con pasadores y portaherramientas
  mesh(CYL(0.218, 0.218, 0.05), mat.suitD, body, 0, 0.92, 0, 1, 1, ZS + 0.03); mesh(new THREE.BoxGeometry(0.05, 0.04, 0.012), mat.metal, body, 0, 0.92, 0.218 * (ZS + 0.03) + 0.004);
  const hol = grp(body, -0.2, 0.86, 0.06); hol.rotation.y = -1.1;
  mesh(new THREE.BoxGeometry(0.06, 0.11, 0.03), mat.belt, hol);
  mesh(CYL(0.008, 0.008, 0.07), mat.metal, hol, 0.012, 0.08, 0); mesh(CYL(0.012, 0.012, 0.03), mat.orange, hol, -0.012, 0.07, 0);

  // ---------- torso: mameluco azul con canesú naranja ----------
  const chest = grp(body);
  const TY0 = 0.9, TY1 = 1.47;
  const TOR = profile([[0.0, TY0], [0.205, TY0 + 0.002], [0.212, 0.98], [0.222, 1.08], [0.232, 1.2], [0.235, 1.29], [0.218, 1.36], [0.17, 1.415], [0.09, 1.445], [0.065, TY1]], 48);
  const suitTex = tex(1024, 1024, (g, w, h) => {
    const vOf = y => (1 - (y - TY0) / (TY1 - TY0)) * h;
    g.fillStyle = '#2347A8'; g.fillRect(0, 0, w, h);
    // canesú naranja (hombros y parte alta del pecho/espalda)
    g.fillStyle = '#E8600A'; g.fillRect(0, 0, w, vOf(1.29));
    g.fillStyle = '#16307a'; g.fillRect(0, vOf(1.29) - 3, w, 7);
    // cremallera central (u=0 y u=1 = frente)
    g.fillStyle = '#9AA7BE'; g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
    // texto SOLGAS en el pecho izquierdo del personaje (u≈0.07) y en la espalda
    const word = (u, y, size) => { g.save(); g.fillStyle = '#FFFFFF'; g.font = `800 ${size}px "M", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.beginPath(); g.arc(u * w - size * 2.1, vOf(y), size * 0.42, 0, 6.283); g.fill(); g.fillStyle = '#2347A8'; g.fillRect(u * w - size * 2.1 - size * 0.42, vOf(y) - 2, size * 0.84, 4);
      g.fillStyle = '#FFFFFF'; g.fillText('SOLGAS', u * w, vOf(y)); g.restore(); };
    word(0.085, 1.215, 30); word(0.5, 1.2, 46);
    // costuras
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; [0.25, 0.75].forEach(u => { g.beginPath(); g.moveTo(u * w, vOf(1.29)); g.lineTo(u * w, h); g.stroke(); });
  });
  const torso = mesh(new THREE.LatheGeometry(TOR, 72), M(0xffffff, { map: suitTex, roughness: 0.75 }), chest); torso.scale.z = ZS;
  const surf = (x, y, r) => Math.sqrt(Math.max(0, r * r - x * x)) * ZS;
  // cuello mao azul
  mesh(CYL(0.074, 0.08, 0.032, true), mat.suit, chest, 0, 1.462, 0.0, 1, 1, 0.92);
  mesh(new THREE.TorusGeometry(0.075, 0.007, 8, 40), mat.suitD, chest, 0, 1.478, 0, 1, 0.92, 1).rotation.x = Math.PI / 2;
  // fotocheck, radio y lapicero
  const badge = grp(chest, -0.11, 1.2, surf(0.11, 1.2, 0.232) + 0.008); badge.rotation.y = -0.45;
  mesh(new THREE.BoxGeometry(0.055, 0.075, 0.005), mat.card, badge); mesh(new THREE.BoxGeometry(0.022, 0.026, 0.006), mat.blue, badge, -0.01, 0.012, 0.001);
  mesh(new THREE.BoxGeometry(0.03, 0.006, 0.006), mat.orange, badge, 0, -0.022, 0.001);
  const radio = grp(chest, -0.16, 1.33, surf(0.16, 1.33, 0.235) - 0.004); radio.rotation.y = -0.65;
  mesh(new THREE.BoxGeometry(0.042, 0.08, 0.028), mat.belt, radio); mesh(CYL(0.005, 0.005, 0.07), mat.belt, radio, 0.01, 0.07, 0);
  mesh(S(0.004), mat.green, radio, -0.01, 0.025, 0.015);

  // ---------- brazos y manos ----------
  const mkHand = (parent, s) => {
    const h = grp(parent, 0, -0.03, 0);
    mesh(S(0.046), mat.skin, h, 0, -0.035, 0, 0.95, 1.05, 0.58);
    const fingers = [];
    for (let k = 0; k < 4; k++) {
      const f = grp(h, s * (0.03 - k * 0.02), -0.075, 0.004);
      mesh(CAP(0.0115, 0.032), mat.skin, f, 0, -0.022, 0);
      fingers.push(f);
    }
    const th = grp(h, s * -0.04, -0.03, 0.016); th.rotation.z = s * 0.7;
    mesh(CAP(0.0145, 0.034), mat.skin, th, 0, -0.024, 0);
    return { h, fingers, th };
  };
  const mkArm = (s) => {
    const sh = grp(chest, s * 0.215, 1.33, 0);
    mesh(S(0.074), mat.yoke, sh, 0, 0.0, 0, 1, 1, 0.92);
    mesh(CAP(0.066, 0.16), mat.suit, sh, 0, -0.13, 0);
    const el = grp(sh, 0, -0.27, 0);
    mesh(S(0.061), mat.suit, el);
    mesh(CAP(0.058, 0.15), mat.suit, el, 0, -0.11, 0);
    mesh(CYL(0.06, 0.06, 0.028, true), mat.refl, el, 0, -0.1, 0);
    mesh(CYL(0.052, 0.049, 0.05), mat.navy, el, 0, -0.205, 0);            // puño tejido
    const wr = grp(el, 0, -0.235, 0);
    return { sh, el, wr, hand: mkHand(wr, s) };
  };
  const armR = mkArm(-1);   // derecho del personaje: señala / pulgar arriba
  const armL = mkArm(1);    // izquierdo: tablet
  const curl = (hand, amount, idxOut = 0, thumbUp = 0) => {
    hand.fingers.forEach((f, i) => { f.rotation.x = (i === 0 ? amount * (1 - idxOut) : amount) * 1.6; });
    const sg = hand === armR.hand ? -1 : 1;
    hand.th.rotation.x = -thumbUp * 1.57; hand.th.rotation.z = sg * 0.7 * (1 - thumbUp);
  };

  // tablet con checklist en pantalla
  const ttex = tex(256, 352, (g) => {
    g.fillStyle = '#0B66D6'; g.fillRect(0, 0, 256, 352);
    g.fillStyle = 'rgba(6,19,47,.55)'; g.fillRect(0, 0, 256, 46); g.fillStyle = '#fff'; g.fillRect(18, 18, 110, 11);
    for (let k = 0; k < 5; k++) { const y = 72 + k * 48;
      g.fillStyle = k < 4 ? '#12B76A' : 'rgba(255,255,255,.5)'; g.fillRect(18, y, 30, 30);
      if (k < 4) { g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(24, y + 15); g.lineTo(31, y + 22); g.lineTo(43, y + 8); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(60, y + 9, 160 - k * 18, 12); }
    g.fillStyle = '#FFB81C'; g.fillRect(18, 316, 220, 14);
  });
  const tab = grp(armL.wr, 0, -0.07, 0.06);
  mesh(new THREE.BoxGeometry(0.21, 0.285, 0.02), mat.dark, tab);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.04, 0.04, 0.026), mat.orange, tab, a * 0.095, b * 0.13, 0));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.25), new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false }));
  screen.position.z = 0.0115; tab.add(screen);
  tab.rotation.set(-0.9, 2.9, 0.2);

  // ---------- cabeza (rostro redondo, sonrisa amplia) ----------
  const SK = { y: 0.125, ax: 0.1, ay: 0.118, az: 0.106 };
  const neck = grp(chest, 0, 1.47, 0);
  mesh(CYL(0.062, 0.068, 0.09), mat.skinD, neck, 0, 0.0, -0.004);
  const head = grp(neck, 0, -0.012, 0.008); head.scale.setScalar(1.2);
  const hg = new THREE.SphereGeometry(1, 112, 84), hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    let x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    if (y < 0) { const k = -y;
      x *= 1 - 0.1 * Math.pow(k, 1.8);                                                    // mandíbula ancha y redonda
      z *= 1 - 0.1 * k;
      if (z > 0) z += 0.05 * Math.pow(k, 2) * Math.max(0, 1 - Math.abs(x) * 1.6);       // mentón suave
      y *= 1 + 0.08 * Math.pow(k, 2);
    } else z *= 1 - 0.04 * y;
    // mejillas llenas (integradas en la misma malla)
    const cb = Math.max(0, 1 - Math.hypot((Math.abs(x) - 0.55) / 0.35, (y + 0.28) / 0.3));
    if (z > 0) { x *= 1 + 0.07 * cb; z += 0.06 * cb; }
    if (z > 0 && Math.abs(y + 0.05) < 0.4) z += 0.03 * (1 - Math.abs(x) * 1.5) * Math.max(0, 1 - Math.abs(y + 0.05) / 0.4);
    hp.setXYZ(i, x * SK.ax, y * SK.ay, z * SK.az);
  }
  hg.computeVertexNormals();
  const skull = mesh(hg, mat.skin, head, 0, SK.y, 0);
  const ray = new THREE.Raycaster();
  const surfZ = (x, y) => {    // superficie frontal real de la malla (raycast desde delante)
    skull.updateMatrixWorld(true); head.updateMatrixWorld(true);
    ray.set(new THREE.Vector3(x, y - SK.y, 1), new THREE.Vector3(0, 0, -1));
    const g = new THREE.Mesh(hg); const hit = ray.intersectObject(g, false)[0];
    return hit ? hit.point.z : 0.09;
  };
  // cabello negro corto
  mesh(S(0.112, 48, 36), mat.hair, head, 0, 0.152, -0.022, 0.95, 0.94, 0.95);
  [-1, 1].forEach(s => mesh(CAP(0.009, 0.026), mat.hair, head, s * 0.094, 0.13, 0.026));
  // orejas
  [-1, 1].forEach(s => { mesh(S(0.031), mat.skin, head, s * 0.099, 0.11, -0.006, 0.45, 1.0, 0.75); mesh(S(0.017), mat.skinD, head, s * 0.106, 0.11, -0.004, 0.3, 0.7, 0.5); });
  // ojos grandes y expresivos
  const lids = [];
  [-1, 1].forEach(s => {
    const ex = s * 0.039, ey = 0.136, ez = surfZ(ex, ey);
    const e = grp(head, ex, ey, ez - 0.012);
    mesh(S(0.022, 36, 28), mat.white, e, 0, 0, 0, 1.08, 0.88, 0.72);
    mesh(S(0.0135), mat.iris, e, s * -0.0015, -0.0005, 0.0115, 1, 1, 0.45);
    mesh(S(0.0068), mat.pupil, e, s * -0.0015, -0.0005, 0.015, 1, 1, 0.35);
    mesh(S(0.0032), mat.white, e, 0.0045, 0.0045, 0.0172);
    mesh(S(0.0016), mat.white, e, -0.004, -0.004, 0.0168);
    const lid = mesh(new THREE.SphereGeometry(0.0235, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), mat.skin, e, 0, 0, 0.0004, 1.1, 0.5, 0.82); lids.push(lid);
    mesh(new THREE.TorusGeometry(0.0222, 0.0019, 6, 28, Math.PI), mat.brow, e, 0, 0.004, 0.0035, 1.06, 0.8, 1);
    mesh(new THREE.TorusGeometry(0.02, 0.0012, 6, 24, Math.PI * 0.8), mat.skinD, e, 0, -0.005, 0.003, 1.0, 0.55, 1).rotation.z = Math.PI * 1.1;   // pliegue inferior (sonrisa)
    // cejas gruesas con arco
    const by = 0.178, bz = surfZ(s * 0.04, by) + 0.004;
    const b1 = mesh(CAP(0.0078, 0.026), mat.brow, head, s * 0.03, by, bz); b1.rotation.z = Math.PI / 2 + s * 0.1;
    const b2 = mesh(CAP(0.0068, 0.02), mat.brow, head, s * 0.054, by - 0.004, bz - 0.006); b2.rotation.z = Math.PI / 2 + s * -0.45; b2.rotation.y = s * 0.4;
  });
  // nariz ancha
  const nz = surfZ(0, 0.098);
  mesh(CAP(0.012, 0.03), mat.skin, head, 0, 0.118, surfZ(0, 0.118) - 0.002).rotation.x = -0.3;
  mesh(S(0.019), mat.skin, head, 0, 0.097, nz + 0.004, 1.1, 0.88, 0.88);
  [-1, 1].forEach(s => { mesh(S(0.0105), mat.skin, head, s * 0.018, 0.091, nz - 0.003, 1, 0.85, 0.8); mesh(S(0.0045), mat.skinD, head, s * 0.01, 0.086, nz + 0.003, 1.2, 0.6, 0.6); });
  // sonrisa abierta con dientes
  const my = 0.058, mz = surfZ(0, my);
  const mouthG = grp(head, 0, my, mz - 0.012);
  mesh(new THREE.SphereGeometry(0.034, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat.mouthIn, mouthG, 0, 0.004, 0, 1.3, 0.62, 0.42);
  mesh(new THREE.SphereGeometry(0.034, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat.tongue, mouthG, 0, -0.006, -0.004, 0.8, 0.3, 0.38);
  mesh(new THREE.SphereGeometry(0.034, 40, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.2), mat.teeth, mouthG, 0, 0.0035, 0.001, 1.22, 0.9, 0.5);
  const lip = mesh(new THREE.TorusGeometry(0.036, 0.0042, 10, 32, Math.PI), mat.lips, mouthG, 0, 0.004, 0.006, 1.24, 0.62, 0.6); lip.rotation.z = Math.PI;
  mesh(CAP(0.0026, 0.072), mat.lips, mouthG, 0, 0.0052, 0.0068, 1, 1, 0.7).rotation.z = Math.PI / 2;
  // lentes de seguridad envolventes
  const LR = 0.128, LY = 0.143, LZ = 0.0;
  mesh(CYL(LR, LR, 0.038, true, -0.85, 1.7), mat.lens, head, 0, LY, LZ);
  tube(arc(LR + 0.001, LY + 0.02, -0.86, 0.86, 22, LZ), 0.0036, mat.frame, head);
  tube(arc(LR + 0.001, LY - 0.019, -0.86, -0.14, 10, LZ), 0.0024, mat.frame, head);
  tube(arc(LR + 0.001, LY - 0.019, 0.14, 0.86, 10, LZ), 0.0024, mat.frame, head);
  [-1, 1].forEach(s => tube([[s * LR * Math.sin(0.86), LY + 0.018, LR * Math.cos(0.86)], [s * 0.104, LY + 0.012, 0.02], [s * 0.106, LY + 0.002, -0.03]], 0.003, mat.frame, head));
  // casco blanco con cresta, visera y franja Solgas
  const hel = grp(head, 0, 0.198, -0.008);
  const HR = 0.124, HS = [1, 0.88, 1.1];
  mesh(new THREE.SphereGeometry(HR, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), mat.helmet, hel, 0, 0, 0, ...HS);
  mesh(new THREE.TorusGeometry(HR, 0.0085, 10, 56, Math.PI), mat.helmetD, hel, 0, 0, 0, HS[2], HS[1], 1).rotation.y = Math.PI / 2;
  mesh(new THREE.LatheGeometry([new THREE.Vector2(HR - 0.004, 0.004), new THREE.Vector2(HR + 0.02, -0.004), new THREE.Vector2(HR + 0.033, -0.01), new THREE.Vector2(HR + 0.033, -0.017), new THREE.Vector2(HR - 0.004, -0.006)], 72), mat.helmetD, hel, 0, 0, 0.012, 1, 1, 1.16);
  mesh(new THREE.SphereGeometry(HR * 1.002, 64, 8, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.05), mat.blue, hel, 0, 0, 0, ...HS);
  mesh(new THREE.SphereGeometry(HR * 1.003, 64, 4, 0, Math.PI * 2, Math.PI * 0.43, Math.PI * 0.02), mat.orange, hel, 0, 0, 0, ...HS);

  root.rotation.y = 0.5;

  // ---------- pose y animación ----------
  function pose(t, st) {
    const br = Math.sin(t * 1.8);
    body.position.y = br * 0.004;
    chest.scale.set(1 + br * 0.005, 1, 1 + br * 0.008);
    const p = st.point || 0, th = st.thumb || 0;
    root.rotation.y = 0.5 + Math.sin(t * 0.31) * 0.05 - p * 0.25 - th * 0.3;
    neck.rotation.set(0.04 + Math.sin(t * 0.9) * 0.03 + (st.nod || 0) * Math.sin(t * 7) * 0.12 - (st.look || 0) * 0.2,
      Math.sin(t * 0.37) * 0.12 - p * 0.45 - th * 0.25, Math.sin(t * 0.53) * 0.03 + th * 0.06);
    // tablet
    armL.sh.rotation.set(-0.42 + Math.sin(t * 1.2) * 0.03, 0, 0.2);
    armL.el.rotation.set(-1.45 + Math.sin(t * 1.4) * 0.03, 0.15, 0);
    armL.wr.rotation.set(0.2, -0.35, -0.2);
    curl(armL.hand, 0.7, 0, 0);
    // brazo derecho: reposo / señalar / pulgar arriba
    const rest = 1 - Math.min(1, p + th);
    armR.sh.rotation.set(-0.08 * rest + p * -1.3 + th * -0.95, 0, -0.1 * rest - p * 0.7 + th * -0.15 + Math.sin(t * 1.1) * 0.02);
    armR.el.rotation.set(-0.25 * rest + p * 0.2 + th * -1.25, 0, th * 0.2);
    armR.wr.rotation.set(0, th * 1.6, 0);
    curl(armR.hand, 0.35 * rest + p + th, p, th);
    // parpadeo
    const blink = (t % 3.7) < 0.13 || (t % 11.3) < 0.1;
    lids.forEach(l => { l.rotation.x = blink ? 0.0 : -1.2; l.scale.y = blink ? 0.95 : 0.5; });
    legs.forEach((l, i) => { l.hip.rotation.x = Math.sin(t * 0.8 + i) * 0.01; });
  }

  // ---------- render alineado al mundo SVG ----------
  let box = null, host = null, lastW = 0, lastH = 0;
  function attach(worldHost, anchor) { host = worldHost; box = anchor; host.appendChild(canvas); }
  function render(t, st) {
    if (!box) return;
    const r = box.getBoundingClientRect(), hr = host.getBoundingClientRect();
    const visible = getComputedStyle(host).visibility !== 'hidden' && r.right > hr.left && r.left < hr.right && r.bottom > hr.top && r.top < hr.bottom && r.height > 4;
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

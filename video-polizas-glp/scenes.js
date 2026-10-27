// Coreografía de las escenas, sincronizada con timeline.json (voz).
const G = 880;
const cam = WORLD;
// coloca el punto del mundo (wx,wy) en la posición de pantalla (sx,sy) con zoom z
function frame(t, wx, wy, z, sx = 960, sy = 540, d = 1.4, ease) {
  cam.shot(t, wx - (sx - 960) / z, wy - (sy - 540) / z, z, d, ease);
}
function frameCut(t, wx, wy, z, sx = 960, sy = 540) { cam.cut(t, wx - (sx - 960) / z, wy - (sy - 540) / z, z); }
const vid = (t, d = 0.6) => { tl.to('#world', { autoAlpha: 1, duration: d }, t); dim(t, 0, d); };
const gfx = (t, d = 0.6) => { tl.to('#world', { autoAlpha: 0, duration: d }, t); dim(t, 0, d); };
const beam = (t, v) => tl.to(WORLD.st, { beam: v, duration: 0.5 }, t);
function scrim(c, side, t, t2) {
  const bgs = { left: 'linear-gradient(90deg,rgba(var(--scrim),.92) 0%,rgba(var(--scrim),.75) 40%,rgba(var(--scrim),0) 70%)', right: 'linear-gradient(270deg,rgba(var(--scrim),.92) 0%,rgba(var(--scrim),.75) 40%,rgba(var(--scrim),0) 70%)', top: 'linear-gradient(180deg,rgba(var(--scrim),.9) 0%,rgba(var(--scrim),.6) 30%,rgba(var(--scrim),0) 55%)', bottom: 'linear-gradient(0deg,rgba(var(--scrim),.9) 0%,rgba(var(--scrim),.6) 30%,rgba(var(--scrim),0) 55%)' };
  const d = at(c, 0, 0, '', '', { width: '1920px', height: '1080px', background: bgs[side] });
  c.insertBefore(d, c.firstChild);
  hide(d); tl.to(d, { autoAlpha: 1, duration: 0.5 }, t); tl.to(d, { autoAlpha: 0, duration: 0.5 }, t2);
  return d;
}
function chapHide(t) { tl.to('#chap', { autoAlpha: 0, duration: 0.3 }, t); }
function begin(id, num, tag, title) {
  const c = scene(id), t0 = SCN[id].start;
  chapHide(t0 - 0.3);
  wipe(t0 + 0.45);
  sceneTitle(c, t0 + 0.55, num, tag, title);
  return c;
}

tl.to('#prog i', { scaleX: 1, duration: TL.total, ease: 'none' }, 0);

// =============== INTRO ===============
(() => {
  const c = scene('intro');
  tl.set(c, { visibility: 'visible' }, 0);
  frameCut(0, 1500, 560, 0.42);
  cam.shot(0, 2300, 600, 0.5, 6, 'none');
  dim(0, 0.75, 0.01);
  const pill = at(c, 140, 300, 'Capacitación · Consumidor directo de GLP', 'pill');
  slide(pill, 0.4, { x: -80 });
  const k = kt(c, 140, 370, '*PÓLIZAS* DE / RESPONSABILIDAD CIVIL / _EXTRACONTRACTUAL_', 110, { w: 1700 });
  ktIn(k, 0.6, { st: 0.09 });
  const bar = at(c, 140, 760, '', '', { width: '620px', height: '12px', background: 'linear-gradient(90deg,var(--orange),var(--yellow))', transformOrigin: 'left' });
  gsap.set(bar, { scaleX: 0 }); tl.to(bar, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 1.4);
  const sub = at(c, 140, 800, 'Aspectos clave para revisar la póliza y prevenir observaciones', '', { fontFamily: 'I', fontWeight: 600, fontSize: '34px', color: 'var(--sub)' });
  slide(sub, 1.8, { y: 30 });
  flash(0.6, 0.25);
  ktOut(k, 5.0); out([pill, bar, sub], 5.0);
  wipe(5.8);
})();

// =============== ESCENA 1: INTRODUCCIÓN ===============
(() => {
  const c = scene('e1');
  const t0 = SCN.e1.start;
  dim(t0 + 0.2, 0, 0.01);
  // paneo por la instalación con etiquetas
  frameCut(t0 + 0.2, 700, 600, 0.9);
  cam.shot(S('e1a'), 2700, 600, 0.9, E('e1a') - S('e1a') + 0.4, 'sine.inOut');
  const lt = at(c, 80, 'auto', '<div class="a">Consumidor directo de GLP</div><div class="b">Instalación industrial</div>', 'lower');
  slide(lt, S('e1a') + 0.1, { x: -120 }); out(lt, S('e1a') + 4.2);
  const dt = (E('e1a') - S('e1a'));
  showCallout('tk', 910, 520, 'Tanque estacionario de GLP', S('e1a') + 0.3, 3.4, 1);
  showCallout('tb', 1560, 640, 'Tuberías', S('e1a') + dt * 0.3, 3.0, -1, '#19D3FF');
  showCallout('vp', 1780, 520, 'Vaporizador', S('e1a') + dt * 0.42, 3.0, 1);
  showCallout('rg', 2250, 560, 'Sistema de regulación', S('e1a') + dt * 0.6, 3.0, 1, '#19D3FF');
  showCallout('eq', 3000, 470, 'Equipos de consumo', S('e1a') + dt * 0.8, 3.0, -1);
  // póliza: no sólo un documento vigente
  const pol = at(c, 1200, 120, `<div style="display:flex;gap:22px;align-items:center">${ic('doc', 70, 'var(--orange)')}<div><div style="font-family:M;font-weight:900;font-size:36px;line-height:1.1">Póliza de Responsabilidad<br>Civil Extracontractual</div></div></div>`, 'card', { padding: '26px 34px', width: '640px' });
  slide(pol, W('e1a', 'póliza'), { y: -60 });
  const vig = at(c, 1560, 270, 'VIGENTE', 'pill', { background: 'var(--green)', color: '#fff' });
  pop(vig, W('e1a', 'documento vigente'));
  const nob = at(c, 1250, 285, '¿Suficiente?', '', { fontFamily: 'M', fontWeight: 900, fontSize: '40px', color: 'var(--num)' });
  pop(nob, W('e1a', 'documento vigente', 0.6));
  out([pol, vig, nob], E('e1a') + 0.2);

  // protección de Solgas: zoom al profesional
  frame(S('e1b') - 0.4, 1960, 620, 1.35, 1450, 560, 1.2, 'expo.inOut');
  beam(S('e1b'), 1); scrim(c, 'left', S('e1b') - 0.4, E('e1b'));
  const sh = at(c, 110, 170, ic('shield', 130, 'var(--cyan)'), '');
  pop(sh, S('e1b') + 0.1, { rot: -30 });
  const k1 = kt(c, 270, 175, 'Protección para *Solgas*', 66, { w: 900 }); ktIn(k1, S('e1b') + 0.25);
  const k2 = kt(c, 272, 260, 'frente a consecuencias _económicas_ de accidentes', 36, { w: 820 }); ktIn(k2, W('e1b', 'consecuencias'), { st: 0.04 });
  const c1 = chip(c, 110, 430, 'factory', 'Instalaciones', 'c');
  const c2 = chip(c, 110, 560, 'people', 'Terceros', 'o');
  const c3 = chip(c, 110, 690, 'leaf', 'Medio ambiente', 'g');
  slide(c1, W('e1b', 'instalaciones', -0.2), { x: -200 });
  slide(c2, W('e1b', 'terceros', -0.2), { x: -200 });
  slide(c3, W('e1b', 'medio ambiente', -0.2), { x: -200 });
  out([sh, c1, c2, c3], E('e1b') + 0.1); ktOut(k1, E('e1b')); ktOut(k2, E('e1b'));
  beam(E('e1b'), 0);

  // qué revisaremos
  gfx(S('e1c') - 0.3);
  const q = kt(c, 140, 150, 'En esta _capacitación_ revisaremos:', 72, { w: 1600 }); ktIn(q, S('e1c'));
  const items = [
    ['01', 'Aspectos principales', 'para revisar la póliza', 'principales aspectos', 'var(--cyan)'],
    ['02', 'Detectar inconsistencias', 'en el documento', 'inconsistencias', 'var(--orange)'],
    ['03', 'Prevenir observaciones', 'Autorización y/o supervisión', 'observaciones', 'var(--num)'],
  ];
  items.forEach(([n, a, b, w, col], i) => {
    const card = at(c, 140 + i * 560, 360, `<div style="font-family:M;font-weight:900;font-size:110px;color:${col};line-height:1">${n}</div>
      <div style="font-family:M;font-weight:800;font-size:40px;margin-top:16px;line-height:1.1">${a}</div>
      <div style="font-size:28px;color:var(--sub);margin-top:12px">${b}</div>`, 'card', { width: '520px', height: '400px', padding: '40px', borderColor: col });
    slide(card, W('e1c', w, -0.3), { y: 140, rot: 4 });
    tl.to(card, { y: -12, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, W('e1c', w, 0.6));
  });
  const lupa = at(c, 1500, 120, ic('search', 120, 'var(--fg)'), '');
  pop(lupa, S('e1c') + 0.5);
  tl.to(lupa, { x: -1200, y: 600, duration: 4, ease: 'sine.inOut' }, W('e1c', 'detectar'));
  tl.to(lupa, { x: -200, y: 200, duration: 2.5, ease: 'sine.inOut' }, W('e1c', 'detectar', 4));
  out(lupa, E('e1c'));
})();

// =============== ESCENA 2: MARCO NORMATIVO ===============
(() => {
  const c = begin('e2', '02', 'Marco normativo aplicable', 'Marco normativo *aplicable*');
  const t0 = SCN.e2.start;
  vid(t0 + 2.3);
  frameCut(t0 + 0.4, 910, 600, 1.0, 1350, 560);
  cam.shot(t0 + 0.5, 910 - 390 / 1.15, 620, 1.15, E('e2a') - t0, 'sine.inOut');
  // carátula del reglamento
  const rg = at(c, 120, 170, `<div style="height:16px;background:var(--orange)"></div>
    <div style="padding:46px 48px">
      <div style="font-family:M;font-weight:800;font-size:22px;letter-spacing:.2em;color:#8A93A8">REPÚBLICA DEL PERÚ</div>
      <div style="font-family:M;font-weight:900;font-size:46px;line-height:1.1;margin-top:20px">Reglamento para la Comercialización de GLP</div>
      <div style="height:6px;width:140px;background:var(--blue);margin:28px 0"></div>
      <div style="font-family:M;font-weight:800;font-size:34px;color:var(--blue)">D.S. N.º 01-94-EM</div>
      <div style="font-size:24px;color:#5B6B8C;margin-top:8px">y sus modificatorias</div>
    </div>`, 'doc', { width: '700px', height: '560px' });
  flip(rg, S('e2a') - 0.2);
  const a31 = at(c, 160, 760, 'ART. 31', 'pill', { fontSize: '34px' });
  const a32 = at(c, 360, 760, 'ART. 32', 'pill', { fontSize: '34px', background: 'var(--cyan)' });
  pop(a31, W('e2a', '31')); pop(a32, W('e2a', '32', 0.3));
  const mod = at(c, 560, 770, '+ modificatorias', '', { fontFamily: 'M', fontWeight: 800, fontSize: '30px', color: 'var(--num)' });
  slide(mod, W('e2a', 'modificatorias', -0.3), { x: -40 });
  tl.to(rg, { rotation: -2, y: 10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, S('e2a') + 1);
  out([rg, a31, a32, mod], E('e2a') + 0.2, { x: -300 });

  // artículo 31 como imagen
  gfx(S('e2b') - 0.4);
  const art = at(c, 210, 1100, `<h4>D.S. N.º 01-94-EM · REGLAMENTO PARA LA COMERCIALIZACIÓN DE GLP</h4>
    <p><b>Artículo 31.-</b> Los Operadores de Instalaciones para GLP deben <span class="hlx h1">mantener vigente una póliza de seguro de responsabilidad civil extracontractual</span> que <span class="hlx h2">cubre los daños a terceros, en sus bienes y personas</span>, por siniestros que puedan ocurrir en sus instalaciones o medios de transporte, según corresponda, expedida por una compañía de seguros establecida legalmente en el país, sin perjuicio de otras políticas que tenga el propietario u Operador para cubrir sus instalaciones y/o activos, robo, etc.</p>
    <p><span class="hlx r h3">Está prohibido y se encuentra sujeto a sanción, abastecer GLP a Operadores de Instalaciones para GLP cuya instalación no esté cubierta por la póliza mencionada.</span> De ocurrir un siniestro en una Instalación de GLP y ésta no tuviera el seguro obligatorio vigente, la empresa que expidió o despachó el GLP será <span class="hlx r h4">solidariamente responsable por daños a terceros</span>, hasta por un monto equivalente al del seguro que la instalación siniestrada debería haber tenido vigente.</p>
    <p style="color:#8A93A8">(…)</p>`, 'art', { width: '1500px' });
  gsap.set(art, { rotation: 3 });
  tl.to(art, { top: '150px', rotation: 0, duration: 1.0, ease: 'expo.out' }, S('e2b') - 0.3);
  mk(art.querySelector('.h1'), W('e2b', 'obligación'), 1.2);
  mk(art.querySelector('.h2'), W('e2b', 'daños a terceros', -0.4), 1.0);
  tl.to(art, { scale: 0.78, x: -180, y: -70, duration: 0.9, ease: 'expo.inOut' }, W('e2b', 'daños a terceros', 0.4));
  const chs = [chip(c, 1430, 300, 'people', 'Terceros', 'o'), chip(c, 1430, 430, 'house', 'Sus bienes', 'c'), chip(c, 1430, 560, 'leaf', 'Medio ambiente', 'g')];
  slide(chs[0], W('e2b', 'terceros', 0.2), { x: 200 });
  slide(chs[1], W('e2b', 'bienes'), { x: 200 });
  slide(chs[2], W('e2b', 'medio ambiente'), { x: 200 });
  out(chs, E('e2b') + 0.1, { x: 200 });
  tl.to(art, { scale: 0.9, x: 0, y: -40, duration: 0.9, ease: 'expo.inOut' }, S('e2c') - 0.4);
  mk(art.querySelector('.h3'), S('e2c'), 1.6);
  const pr = at(c, 1250, 820, `${ic('alert', 56, 'var(--navy)')}<span>PROHIBIDO ABASTECER</span>`, 'chip', { background: 'var(--red)', color: '#fff', fontSize: '36px', padding: '18px 34px' });
  pop(pr, W('e2c', 'prohibidos'));
  shake(W('e2c', 'prohibidos', 0.4), 8);

  // camión cisterna detenido: instalación sin póliza
  tl.to(art, { autoAlpha: 0, y: -600, duration: 0.6, ease: 'power3.in' }, W('e2c', 'instalación', 0.2));
  out(pr, W('e2c', 'instalación', 0.2));
  vid(W('e2c', 'instalación', 0.3), 0.4);
  frameCut(W('e2c', 'instalación', 0.3), 500, 640, 0.8, 900, 560);
  const truck = WORLD.el('truck');
  tl.fromTo(truck, { attr: { transform: 'translate(-1300 0)' } }, { attr: { transform: 'translate(-420 0)' }, duration: 2.0, ease: 'power3.out', immediateRender: false }, W('e2c', 'instalación', 0.3));
  const noPol = at(c, 1150, 170, `<div style="display:flex;align-items:center;gap:20px">${ic('x', 70, 'var(--red)')}<div style="font-family:M;font-weight:900;font-size:44px;line-height:1.05">Instalación sin<br><span style="color:var(--red)">póliza vigente</span></div></div>`, 'card', { padding: '26px 36px', borderColor: 'var(--red)' });
  slide(noPol, W('e2c', 'póliza vigente', -0.2), { x: 160 });
  const stop = at(c, 690, 420, ic('truck', 120, '#fff'), '', { width: '200px', height: '200px', borderRadius: '50%', background: 'var(--red)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 14px rgba(255,61,90,.35)' });
  pop(stop, W('e2c', 'póliza vigente', 0.4));
  tl.to(stop, { scale: 1.08, duration: 0.5, yoyo: true, repeat: 5, ease: 'sine.inOut' }, W('e2c', 'póliza vigente', 1));

  // responsabilidad solidaria
  out([noPol, stop], S('e2d') + 0.2);
  dim(S('e2d') + 0.1, 1, 0.5);
  tl.to('#world', { autoAlpha: 0.12, duration: 0.5 }, S('e2d') + 0.1);
  const k = kt(c, 0, 170, 'Responsabilidad *solidaria*', 92, { w: 1920, align: 'center' });
  ktIn(k, W('e2d', 'solidariamente', -0.5));
  const bx1 = at(c, 300, 430, `${ic('truck', 90, 'var(--cyan)')}<div style="font-family:M;font-weight:900;font-size:44px;margin-top:10px">SOLGAS</div><div style="font-size:24px;color:var(--sub)">quien abastece</div>`, 'card', { width: '440px', padding: '34px', textAlign: 'center' });
  const bx2 = at(c, 1180, 430, `${ic('factory', 90, 'var(--orange)')}<div style="font-family:M;font-weight:900;font-size:44px;margin-top:10px">INSTALACIÓN</div><div style="font-size:24px;color:var(--sub)">siniestrada sin póliza</div>`, 'card', { width: '440px', padding: '34px', textAlign: 'center' });
  slide(bx1, W('e2d', 'solidariamente', -0.3), { x: -300 });
  slide(bx2, W('e2d', 'solidariamente', -0.3), { x: 300 });
  const lk = at(c, 860, 520, ic('link', 200, 'var(--red)'), '');
  pop(lk, W('e2d', 'solidariamente', 0.3), { rot: 180 });
  shake(W('e2d', 'solidariamente', 0.5), 12); flash(W('e2d', 'solidariamente', 0.5), 0.3);
  const dm = at(c, 0, 790, 'por daños a <b style="color:var(--orange)">terceros</b> derivados de siniestros', '', { width: '1920px', textAlign: 'center', fontFamily: 'M', fontWeight: 700, fontSize: '40px' });
  slide(dm, W('e2d', 'daños a terceros'), { y: 40 });
})();

// =============== ESCENA 3: MONTOS MÍNIMOS ===============
(() => {
  const c = begin('e3', '03', 'Montos mínimos de pólizas', 'Montos *mínimos* de las pólizas');
  const t0 = SCN.e3.start;
  gfx(t0 + 0.3, 0.3);
  const art = at(c, 90, 150, `<h4>D.S. N.º 01-94-EM</h4>
    <p><b>Artículo 32.-</b> Los montos mínimos de los seguros de responsabilidad civil extracontractual, expresados en Unidad Impositiva Tributaria (UIT) para un consumidor directo de GLP son:</p>
    <p style="margin-bottom:6px"><i>Consumidores Directos de GLP y Redes de Distribución de GLP con capacidad de almacenamiento autorizada:</i></p>
    <table><tr class="r1"><td>Hasta 1.000 galones</td><td>100 UIT</td></tr><tr class="r2"><td>Hasta 10.000 galones</td><td>200 UIT</td></tr><tr class="r3"><td>Mayor a 10.000 gls</td><td>300 UIT</td></tr></table>
    <p><span class="hlx h5">Para el caso de Consumidores Directos de GLP con sistemas de despacho para uso automotor, el monto es de 300 UIT, independientemente de la capacidad de almacenamiento del tanque.</span></p>
    <p style="color:#8A93A8">(…)</p>`, 'art', { width: '860px', fontSize: '23px', padding: '36px 42px' });
  flip(art, S('e3a') - 0.4, { ry: 70, x: -200 });
  // gráfico de barras
  const ch = at(c, 1020, 150, '', '', { width: '820px', height: '780px' });
  const base = at(ch, 0, 640, '', '', { width: '820px', height: '4px', background: 'rgba(255,255,255,.5)' });
  slide(base, S('e3a') + 0.4, { x: 200 });
  const data = [['Hasta', '1,000 gal', 100, 'var(--cyan)', 0.45], ['Hasta', '10,000 gal', 200, 'var(--blue)', 0.7], ['Mayor a', '10,000 gal', 300, 'var(--orange)', 1]];
  const bars = data.map(([a, b, v, col, sz], i) => {
    const x = 40 + i * 270, h = v * 1.6;
    const bar = at(ch, x, 640 - h, '', '', { width: '200px', height: h + 'px', background: col, borderRadius: '14px 14px 0 0', transformOrigin: 'bottom' });
    const num = at(ch, x, 640 - h - 92, `<span class="n">0</span><small style="font-size:30px"> UIT</small>`, 'M', { width: '200px', textAlign: 'center', fontWeight: 900, fontSize: '58px' });
    const tk = at(ch, x + 100 - 60 * sz, 660, `<svg viewBox="0 0 120 50" width="${120 * sz}" height="${50 * sz}"><rect x="2" y="2" width="116" height="46" rx="23" fill="#fff" stroke="#93A6C9" stroke-width="3"/><rect x="2" y="20" width="116" height="6" fill="#FF7A1A"/></svg>`, '');
    const lb = at(ch, x - 20, 710, `${a}<br><b style="font-family:M;font-size:30px;color:var(--fg)">${b}</b>`, '', { width: '240px', textAlign: 'center', fontSize: '24px', color: 'var(--sub)' });
    const t = W('e3a', 'capacidad', -0.6) + i * 0.45;
    gsap.set(bar, { scaleY: 0 });
    tl.to(bar, { scaleY: 1, duration: 0.9, ease: 'expo.out' }, t);
    slide(num, t + 0.1, { y: h * 0.6 }); counter(num.querySelector('.n'), t + 0.1, 0, v, 0.9);
    pop(tk, t); slide(lb, t + 0.1, { y: 30 });
    tl.to(art.querySelector('.r' + (i + 1)), { backgroundColor: '#FFE9A8', duration: 0.3 }, t);
    return { bar, num, tk, lb };
  });
  // mínimo y máximo
  const mn = at(ch, 30, 120, 'MÍNIMO', 'pill', { background: 'var(--cyan)' });
  const mx = at(ch, 600, 60, 'MÁXIMO', 'pill');
  pop(mn, W('e3b', '100 UIT')); pop(mx, W('e3b', '300 UIT'));
  tl.to(bars[0].bar, { boxShadow: '0 0 60px #19D3FF', duration: 0.3, yoyo: true, repeat: 3 }, W('e3b', '100 UIT'));
  tl.to(bars[2].bar, { boxShadow: '0 0 60px #FF7A1A', duration: 0.3, yoyo: true, repeat: 3 }, W('e3b', '300 UIT'));
  // uso automotor
  const t3 = S('e3c');
  tl.to(ch, { autoAlpha: 0, x: 200, duration: 0.5, ease: 'power2.in' }, t3 - 0.2);
  mk(art.querySelector('.h5'), t3 + 0.2, 2.2);
  const au = at(c, 1020, 160, '', '', { width: '820px', height: '760px' });
  const pump = at(au, 40, 40, `${ic('pump', 170, 'var(--orange)')}`, '');
  const ttl = at(au, 240, 60, 'Despacho para<br><span style="color:var(--orange)">uso automotor</span>', 'kt M', { fontSize: '56px', fontWeight: 900 });
  pop(pump, W('e3c', 'despacho', -0.3), { rot: -20 }); slide(ttl, W('e3c', 'despacho', -0.2), { x: 80 });
  const big = at(au, 40, 300, '<span class="n">0</span> <span style="font-size:70px">UIT</span>', 'M', { fontWeight: 900, fontSize: '200px', color: 'var(--num)', lineHeight: 1 });
  pop(big, W('e3c', 'el monto', -0.2)); counter(big.querySelector('.n'), W('e3c', 'el monto', -0.2), 0, 300, 1.0);
  shake(W('e3c', 'el monto', 0.8), 8);
  [0.45, 0.7, 1].forEach((sz, i) => {
    const tk = at(au, 40 + i * 260, 600, `<svg viewBox="0 0 120 50" width="${200 * sz}" height="${84 * sz}"><rect x="2" y="2" width="116" height="46" rx="23" fill="#fff" stroke="#93A6C9" stroke-width="3"/><rect x="2" y="20" width="116" height="6" fill="#FF7A1A"/></svg><div style="font-family:M;font-weight:900;font-size:30px;color:var(--num);margin-top:8px">= 300 UIT</div>`, '');
    pop(tk, W('e3c', 'independientemente') + i * 0.25);
  });
  const ind = at(au, 40, 500, 'Independiente de la capacidad del tanque', 'pill', { background: 'var(--white)', fontSize: '24px' });
  slide(ind, W('e3c', 'independientemente', 0.3), { x: -60 });
})();

// =============== ESCENA 4: IDENTIFICACIÓN DEL ASEGURADO ===============
(() => {
  const c = begin('e4', '04', 'Identificación del asegurado', 'Identificación del *asegurado* y de la _actividad_');
  const t0 = SCN.e4.start;
  vid(t0 + 2.2);
  frameCut(t0 + 0.4, 1960, 620, 1.3, 520, 580);
  cam.shot(t0 + 0.5, 1960 - (520 - 960) / 1.5, 600, 1.5, E('e4a') - t0, 'sine.inOut');
  beam(S('e4a'), 1); scrim(c, 'right', S('e4a') - 0.6, E('e4a'));
  const k = kt(c, 980, 300, 'Identificación del *asegurado* / y de la _actividad_', 78, { w: 880 });
  ktIn(k, S('e4a') + 0.1);
  const ic1 = at(c, 980, 180, ic('search', 90, 'var(--num)'), ''); pop(ic1, S('e4a'));
  ktOut(k, E('e4a')); out(ic1, E('e4a')); beam(E('e4a'), 0);

  // comparación de documentos (correcto)
  gfx(S('e4b') - 0.4);
  const RS = 'INDUSTRIAS ANDINAS DEL SUR S.A.C.', RUC = '20601234567', ACT = 'Consumidor directo de GLP';
  const dS = doc(c, 70, 280, 560, 'Consulta RUC', 'SUNAT', [['Razón social', RS, 'rs'], ['RUC', RUC, 'ruc'], ['Estado', 'ACTIVO', 'es']], { icon: 'search' });
  const dP = doc(c, 680, 280, 560, 'Póliza de seguro', 'Responsabilidad Civil Extracontractual', [['Asegurado', RS, 'rs'], ['RUC', RUC, 'ruc'], ['Riesgo asegurado / actividad', ACT, 'act']], { icon: 'shield', hd: '#C2410C' });
  const dR = doc(c, 1290, 280, 560, 'Registro de Hidrocarburos', 'Formulario de solicitud', [['Titular', RS, 'rs'], ['RUC', RUC, 'ruc'], ['Actividad', ACT, 'act']], { icon: 'doc', hd: '#1F6BFF' });
  [dS, dP, dR].forEach(d => d.querySelectorAll('.v').forEach(v => v.style.fontSize = '22px'));
  slide(dS, S('e4b') - 0.1, { y: 200, rot: -6 });
  slide(dP, W('e4b', 'póliza', -0.1), { y: 200, rot: 5 });
  slide(dR, W('e4b', 'Registro de Hidrocarburos', -0.6), { y: 200, rot: -4 });
  mk(dP.mk('rs'), W('e4b', 'Razón Social')); mk(dP.mk('ruc'), W('e4b', 'RUC,'));
  mk(dS.mk('rs'), W('e4b', 'consulta RUC')); mk(dS.mk('ruc'), W('e4b', 'consulta RUC', 0.3));
  mk(dR.mk('rs'), W('e4b', 'titular')); mk(dR.mk('ruc'), W('e4b', 'titular', 0.3));
  // líneas de correspondencia
  const L = svgLayer(c);
  const ys = [{ k: 'rs', y: 410 }, { k: 'ruc', y: 490 }];
  const lines = [];
  ys.forEach(({ y }, i) => {
    [[630, 680], [1240, 1290]].forEach(([x1, x2], j) => {
      const p = svgEl(L, 'path', { d: `M${x1 - 14} ${y} H${x2 + 14}`, fill: 'none', stroke: '#14C77B', 'stroke-width': 8, 'stroke-linecap': 'round' });
      draw(p, W('e4c', 'correspondencia') + i * 0.3 + j * 0.15, 0.6);
      lines.push(p);
    });
  });
  const corr = at(c, 0, 180, '<span class="pill" style="position:relative;background:var(--green);color:#fff">Correspondencia seguro ⇄ registro</span>', '', { width: '1920px', textAlign: 'center' });
  pop(corr, W('e4c', 'correspondencia'));
  // checks
  const okMarks = [
    mark(c, 1180, 370, true, W('e4d', 'razón social'), 70), mark(c, 1180, 452, true, W('e4d', 'datos de identificación'), 70),
  ];
  const ver1 = at(c, 810, 820, 'CORRECTO', 'verdict ok'); pop(ver1, W('e4d', 'coincidan'));
  // actividad
  tl.to(ver1, { autoAlpha: 0, duration: 0.3 }, S('e4e'));
  mk(dP.mk('act'), W('e4e', 'riesgo asegurado')); mk(dR.mk('act'), W('e4e', 'actividad de hidrocarburos'));
  tl.to([dP.row('act'), dR.row('act')], { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, W('e4e', 'actividad de hidrocarburos'));
  const actTag = at(c, 0, 900, `<span class="chip" style="position:relative;display:inline-flex"><span class="ic">${ic('bolt', 36)}</span>Actividad: Consumidor directo de GLP</span>`, '', { width: '1920px', textAlign: 'center' });
  pop(actTag, W('e4f', 'se denomina'));
  const p3 = svgEl(L, 'path', { d: 'M1226 575 H1304', fill: 'none', stroke: '#14C77B', 'stroke-width': 8, 'stroke-linecap': 'round' });
  draw(p3, W('e4f', 'misma'), 0.5); lines.push(p3);
  okMarks.push(mark(c, 1180, 535, true, W('e4f', 'misma', 0.3), 70));
  out(actTag, E('e4f'));

  // comparativo incorrecto
  const t4 = S('e4g');
  tl.to([...lines, ...okMarks, corr], { autoAlpha: 0, duration: 0.3 }, t4 - 0.2);
  tl.to(dP, { rotationY: 90, transformPerspective: 1400, duration: 0.35, ease: 'power2.in' }, t4);
  const dB = doc(c, 680, 280, 560, 'Póliza de seguro', 'Responsabilidad Civil Extracontractual', [['Asegurado', 'INDUSTRIAS ANDINA DEL SUR S.A.', 'rs'], ['RUC', '20601234576', 'ruc'], ['Riesgo asegurado / actividad', 'Comercialización de combustibles', 'act']], { icon: 'shield', hd: '#C2410C' });
  dB.querySelectorAll('.v').forEach(v => v.style.fontSize = '22px');
  dB.querySelectorAll('.mk').forEach(m => m.classList.add('r'));
  hide(dB, { rotationY: -90, transformPerspective: 1400 });
  tl.to(dB, { autoAlpha: 1, rotationY: 0, duration: 0.45, ease: 'power2.out' }, t4 + 0.35);
  tl.set(dP, { autoAlpha: 0 }, t4 + 0.35);
  ['rs', 'ruc', 'act'].forEach((k, i) => mk(dB.mk(k), W('e4g', ['Razón Social', 'RUC', 'actividad'][i]), 0.4));
  [370, 452, 535].forEach((y, i) => mark(c, 1180, y, false, W('e4g', 'forma inexacta') + i * 0.2, 70));
  const bad = at(c, 0, 170, '<span class="verdict no" style="position:relative">INCORRECTO</span>', '', { width: '1920px', textAlign: 'center' });
  pop(bad, W('e4g', 'forma inexacta', 0.3)); shake(W('e4g', 'forma inexacta', 0.5), 10);
  const cA = chip(c, 330, 900, 'alert', 'Observaciones a la autorización', 'r');
  const cB = chip(c, 1000, 900, 'bolt', 'Limitaciones ante una emergencia', 'r');
  slide(cA, W('e4g', 'observaciones'), { y: 140 }); slide(cB, W('e4g', 'emergencia', -0.4), { y: 140 });
})();

// =============== ESCENA 5: VIGENCIA, UBICACIÓN Y ALCANCE ===============
(() => {
  const c = begin('e5', '05', 'Vigencia, ubicación y alcance', 'Vigencia, *ubicación* y _alcance_ de la cobertura');
  const t0 = SCN.e5.start;
  gfx(t0 + 0.3, 0.3);
  // calendario de vigencia
  const cal = at(c, 110, 200, '', 'card', { width: '820px', height: '640px', padding: '36px' });
  cal.innerHTML = `<div style="display:flex;align-items:center;gap:18px">${ic('cal', 64, 'var(--cyan)')}<div class="M" style="font-weight:900;font-size:44px">Vigencia de la póliza</div></div>
    <div style="display:flex;gap:30px;margin-top:30px">
      <div><div style="color:var(--sub);font-size:22px">DESDE</div><div class="M" style="font-weight:900;font-size:40px">15/03/2026</div></div>
      <div><div style="color:var(--sub);font-size:22px">HASTA</div><div class="M" style="font-weight:900;font-size:40px">15/03/2027</div></div></div>
    <div class="grid" style="display:grid;grid-template-columns:repeat(12,1fr);gap:8px;margin-top:40px"></div>`;
  const grid = cal.querySelector('.grid');
  const meses = ['MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC', 'ENE', 'FEB'];
  const cells = meses.map(m => { const d = document.createElement('div'); d.textContent = m; Object.assign(d.style, { height: '120px', borderRadius: '10px', background: 'rgba(25,211,255,.18)', display: 'grid', placeItems: 'end center', paddingBottom: '10px', fontFamily: 'M', fontWeight: 800, fontSize: '18px' }); grid.appendChild(d); return d; });
  slide(cal, S('e5a') - 0.6, { x: -200 });
  gsap.set(cells, { scaleY: 0, transformOrigin: 'bottom' });
  tl.to(cells, { scaleY: 1, stagger: 0.05, duration: 0.4, ease: 'back.out(2)' }, S('e5a') - 0.2);
  tl.to(cells, { backgroundColor: 'rgba(20,199,123,.75)', stagger: 0.05, duration: 0.2 }, S('e5a') + 0.6);
  const hoy = at(cal, 36 + 7 * 61, 225, '<div style="width:6px;height:150px;background:var(--yellow);margin:auto"></div><div class="M" style="font-weight:900;color:var(--num);font-size:22px;text-align:center">HOY</div>', '', { width: '60px' });
  pop(hoy, S('e5a') + 1.4);
  const vg = mark(cal, 680, 30, true, S('e5a') + 1.8, 90);
  const k = kt(c, 1010, 290, '_Ubicación_ del riesgo', 76, { w: 840 }); ktIn(k, W('e5a', 'ubicación'));
  const k2 = kt(c, 1010, 420, '*Alcance* de la cobertura', 76, { w: 840 }); ktIn(k2, W('e5a', 'alcance'));
  tl.to([cal, k, k2], { autoAlpha: 0, y: -80, duration: 0.45, ease: 'power3.in' }, E('e5a') + 0.1);

  // plano de la instalación
  const t1 = S('e5b');
  const plan = svgLayer(at(c, 0, 0, '', '', { width: '1920px', height: '1080px' }));
  const pg = svgEl(plan, 'g', { transform: 'translate(80 150)' });
  const LT = THEME_NAME === 'claro';
  pg.innerHTML = `<rect width="900" height="760" rx="20" fill="${LT ? '#EAF1FC' : '#0b2a6b'}" stroke="${LT ? '#93A6C9' : '#19D3FF'}" stroke-opacity=".6" stroke-width="3"/>
    ${Array.from({ length: 18 }, (_, i) => `<path d="M${i * 50} 0 V760" stroke="#19D3FF" stroke-opacity=".08"/>`).join('')}
    ${Array.from({ length: 16 }, (_, i) => `<path d="M0 ${i * 50} H900" stroke="#19D3FF" stroke-opacity=".08"/>`).join('')}
    <path class="st" d="M0 230 H900 M0 560 H900 M300 0 V760 M640 0 V760" stroke="${LT ? '#C3D3EC' : '#5f8de0'}" stroke-width="34" fill="none"/>
    <text x="20" y="215" font-family="M" font-weight="800" font-size="22" fill="${LT ? '#0047BB' : '#9cc1ff'}">AV. LOS INDUSTRIALES</text>
    <g class="plt"><rect x="340" y="270" width="260" height="250" rx="8" fill="${LT ? '#FFFFFF' : '#13306E'}" stroke="#FF7A00" stroke-width="4" stroke-dasharray="14 8"/>
    <rect x="370" y="300" width="160" height="60" rx="30" fill="#fff" stroke="#93A6C9" stroke-width="3"/><rect x="370" y="327" width="160" height="6" fill="#FF7A1A"/>
    <rect x="550" y="300" width="30" height="80" fill="#9fb2d3"/><rect x="370" y="410" width="120" height="80" rx="10" fill="#4d7bd1"/>
    <path d="M530 330 H565 V340 M565 380 V450 H490" stroke="#19D3FF" stroke-width="6" fill="none"/>
    <text x="470" y="505" font-family="M" font-weight="800" font-size="18" fill="#FF7A00" text-anchor="middle">INSTALACIÓN GLP</text></g>
    <g class="pinA" transform="translate(470 250)"><path d="M0 0 C0 0 -36 -40 -36 -66 C-36 -86 -20 -102 0 -102 C20 -102 36 -86 36 -66 C36 -40 0 0 0 0Z" fill="#14C77B"/><circle cy="-66" r="13" fill="#fff"/></g>
    <g class="pinB" transform="translate(800 690)"><path d="M0 0 C0 0 -36 -40 -36 -66 C-36 -86 -20 -102 0 -102 C20 -102 36 -86 36 -66 C36 -40 0 0 0 0Z" fill="#FF3D5A"/><circle cy="-66" r="13" fill="#fff"/></g>`;
  hide(pg, { scale: 0.7, transformOrigin: '530px 530px' });
  tl.to(pg, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, t1 - 0.3);
  const pinA = pg.querySelector('.pinA'), pinB = pg.querySelector('.pinB');
  gsap.set([pinA, pinB], { autoAlpha: 0, y: -300 });
  tl.to(pinA, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'bounce.out' }, W('e5b', 'ubicación de riesgo'));
  const aP = doc(c, 1060, 170, 780, 'Póliza', 'Ubicación del riesgo', [['Dirección', 'Av. Los Industriales 1250, Lurín, Lima', 'd']], { icon: 'shield', hd: '#C2410C' });
  const aR = doc(c, 1060, 420, 780, 'Solicitud Registro de Hidrocarburos', 'Dirección de la instalación', [['Dirección', 'Av. Los Industriales 1250, Lurín, Lima', 'd']], { icon: 'doc', hd: '#1F6BFF' });
  slide(aP, W('e5b', 'póliza', -0.3), { x: 300 }); slide(aR, W('e5b', 'dirección', -0.3), { x: 300 });
  mk(aP.mk('d'), W('e5b', 'coincidir', -0.5)); mk(aR.mk('d'), W('e5b', 'coincidir'));
  const okA = mark(c, 1740, 660, true, W('e5b', 'dirección', 0.3), 90);
  const vOK = at(c, 1060, 680, 'CORRECTO', 'verdict ok'); pop(vOK, W('e5b', 'dirección', 0.4));
  // incorrecto
  const tI = W('e5b', 'descrita', 0.2);
  out([vOK, okA], tI);
  tl.set(aP.tx('d'), { textContent: 'Av. Los Industriales 1520, Lurín, Lima' }, tI);
  tl.set(aP.mk('d'), { backgroundColor: '#FFB3BF' }, tI);
  tl.fromTo(aP, { x: 0 }, { keyframes: [{ x: -16 }, { x: 14 }, { x: -8 }, { x: 0 }], duration: 0.35, immediateRender: false }, tI);
  tl.to(pinB, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'bounce.out' }, tI);
  mark(c, 1740, 660, false, tI + 0.2, 90);
  const vNo = at(c, 1060, 680, 'INCORRECTO', 'verdict no'); pop(vNo, tI + 0.3);
  // varias instalaciones
  const t2 = S('e5c');
  tl.to([aP, aR, vNo], { autoAlpha: 0, x: 300, duration: 0.4, ease: 'power2.in' }, t2 - 0.2);
  tl.set(c.querySelectorAll('.mark'), { autoAlpha: 0 }, t2 - 0.2);
  tl.to(pinB, { autoAlpha: 0, duration: 0.2 }, t2 - 0.2);
  const multi = [[150, 120, 'Instalación 1'], [760, 120, 'Instalación 2'], [150, 680, 'Instalación 3']];
  multi.forEach(([x, y, l], i) => {
    const g = svgEl(pg, 'g', { transform: `translate(${x} ${y})` });
    g.innerHTML = `<path d="M0 0 C0 0 -30 -34 -30 -56 C-30 -73 -17 -86 0 -86 C17 -86 30 -73 30 -56 C30 -34 0 0 0 0Z" fill="#FFC93C"/><circle cy="-56" r="11" fill="#0B1F4D"/><rect x="36" y="-80" width="170" height="40" rx="8" fill="#fff"/><text x="121" y="-52" font-family="M" font-weight="800" font-size="20" fill="#0B1F4D" text-anchor="middle">${l}</text>`;
    hide(g, { y: -200 }); tl.to(g, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'bounce.out' }, W('e5c', 'más de una', -0.4) + i * 0.3);
  });
  const mk3 = kt(c, 1060, 300, 'Más de una _instalación_ = mayor *relevancia*', 72, { w: 800 });
  ktIn(mk3, W('e5c', 'más de una'));
  tl.to([plan.parentNode, mk3], { autoAlpha: 0, duration: 0.4 }, E('e5c') + 0.1);

  // alcance de la cobertura: esquema del tanque conectado a los equipos
  const t3 = S('e5d');
  vid(t3 - 0.4);
  frameCut(t3 - 0.4, 1900, 560, 0.5);
  cam.shot(t3 - 0.3, 1900, 500, 0.62, E('e5d') - t3 + 0.3, 'sine.inOut');
  const sch = at(c, 0, 120, 'Riesgos exigidos por la normativa', 'pill', { left: '50%', marginLeft: '-260px' });
  slide(sch, t3, { y: -60 }); scrim(c, 'top', t3 - 0.3, S('e5e'));
  const pc = [chip(c, 150, 210, 'people', 'Daños a terceros', 'o'), chip(c, 720, 210, 'house', 'A sus bienes', 'c'), chip(c, 1220, 210, 'leaf', 'Al medio ambiente', 'g')];
  slide(pc[0], W('e5d', 'daños a terceros', -0.2), { y: -100 });
  slide(pc[1], W('e5d', 'bienes', -0.2), { y: -100 });
  slide(pc[2], W('e5d', 'medio ambiente', -0.2), { y: -100 });

  // exclusiones
  const t4 = S('e5e');
  gfx(t4 - 0.3);
  tl.to(pc, { y: -40, scale: 0.85, duration: 0.5 }, t4 - 0.3);
  tl.to(sch, { autoAlpha: 0, duration: 0.3 }, t4 - 0.3);
  const ex = at(c, 360, 340, `<div class="hd">${ic('alert', 40, 'var(--num)')}<div>Póliza · Exclusiones y limitaciones<small>Condiciones generales y particulares</small></div></div>
    <div class="bd" style="font-size:24px;line-height:1.5">
      <div class="row"><div class="v"><span class="mk"></span>1. Daños causados intencionalmente por el asegurado.</div></div>
      <div class="row"><div class="v"><span class="mk"></span>2. Multas o sanciones administrativas.</div></div>
      <div class="row bad"><div class="v"><span class="mk r"></span>3. Daños por contaminación al medio ambiente.</div></div>
      <div class="row"><div class="v"><span class="mk"></span>4. Guerra, terrorismo y conmoción civil.</div></div></div>`, 'doc', { width: '1200px' });
  ex.querySelectorAll('.v').forEach(v => { v.style.fontFamily = 'I'; v.style.fontWeight = 500; v.style.fontSize = '25px'; });
  slide(ex, t4, { y: 300 });
  const lupa = at(c, 380, 520, ic('search', 140, 'var(--orange)'), '');
  pop(lupa, t4 + 0.4);
  tl.to(lupa, { x: 900, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t4 + 0.8);
  tl.to(lupa, { y: 120, duration: 0.6, ease: 'power2.inOut' }, W('e5e', 'exclusiones', -0.4));
  mk(ex.querySelector('.bad .mk'), W('e5e', 'exclusiones'), 0.7);
  const xx = mark(c, 1580, 560, false, W('e5e', 'exclusiones', 0.6));
  tl.to(pc[2], { backgroundColor: '#FFB3BF', duration: 0.2 }, W('e5e', 'exclusiones', 0.6));
  tl.fromTo(pc[2], { rotation: 0 }, { keyframes: [{ rotation: -6 }, { rotation: 5 }, { rotation: 0 }], duration: 0.4, immediateRender: false }, W('e5e', 'exclusiones', 0.6));
  const res = at(c, 360, 900, 'Restringido en exclusiones = sin cobertura efectiva', 'pill', { background: 'var(--red)', color: '#fff' });
  slide(res, W('e5e', 'limitaciones'), { y: 60 });

  // la póliza por sí sola no garantiza
  const t5 = S('e5f');
  tl.to([ex, lupa, xx, res, ...pc], { autoAlpha: 0, scale: 0.9, duration: 0.4, ease: 'power2.in' }, t5 - 0.3);
  const A = kt(c, 0, 330, 'Tener la *póliza*', 100, { w: 1920, align: 'center' });
  const B = kt(c, 0, 620, 'no garantiza estar _cubierto_', 100, { w: 1920, align: 'center' });
  ktIn(A, t5); ktIn(B, W('e5f', 'no garantiza', -0.2));
  const ne = at(c, 880, 470, '<svg width="160" height="140" viewBox="0 0 160 140"><path class="l1" d="M20 50 H140 M20 90 H140" stroke="#FFC93C" stroke-width="16" stroke-linecap="round"/><path class="l2" d="M110 10 L50 130" stroke="#FF3D5A" stroke-width="16" stroke-linecap="round"/></svg>', '');
  gsap.set(ne, { autoAlpha: 1 });
  draw(ne.querySelector('.l1'), W('e5f', 'no garantiza', -0.4), 0.5); draw(ne.querySelector('.l2'), W('e5f', 'no garantiza'), 0.35);
  const sub = at(c, 0, 780, 'en los términos exigidos por la normativa', '', { width: '1920px', textAlign: 'center', fontSize: '38px', fontWeight: 600, color: 'var(--sub)' });
  slide(sub, W('e5f', 'términos exigidos', -0.4), { y: 40 });
})();

// =============== ESCENA 6: MONTO ASEGURADO ===============
(() => {
  const c = begin('e6', '06', 'Monto asegurado', 'Monto asegurado y *suficiencia* de la cobertura');
  const t0 = SCN.e6.start;
  gfx(t0 + 0.3, 0.3);
  const k = kt(c, 0, 380, 'Monto _asegurado_', 130, { w: 1920, align: 'center' });
  ktIn(k, S('e6a') - 0.2);
  for (let i = 0; i < 6; i++) {
    const cn = at(c, 300 + i * 240, 640, ic('coin', 90, i % 2 ? 'var(--num)' : 'var(--orange)'), '');
    pop(cn, S('e6a') + 0.2 + i * 0.08); out(cn, E('e6a') + 0.1, { y: 200 });
  }
  ktOut(k, E('e6a'));

  // tabla obligatoria
  const t1 = S('e6b');
  const tab = at(c, 260, 160, `<div class="M" style="font-weight:800;font-size:30px;line-height:1.3;padding:34px 44px;background:var(--navy2);color:#fff">Consumidores Directos de GLP y Redes de Distribución de GLP con capacidad de almacenamiento autorizada:</div>
    ${[['Hasta 1.000 galones', '100 UIT'], ['Hasta 10.000 galones', '200 UIT'], ['Mayor a 10.000 gls', '300 UIT']].map(([a, b], i) => `<div class="tr r${i}" style="display:flex;justify-content:space-between;align-items:center;padding:24px 44px;border-top:2px solid #E3E8F2;font-family:M;font-weight:700;font-size:36px"><span>${a}</span><span style="font-weight:900;color:var(--blue)">${b}</span></div>`).join('')}`, 'doc', { width: '1400px' });
  slide(tab, t1 - 0.3, { y: 200 });
  const trs = tab.querySelectorAll('.tr');
  gsap.set(trs, { autoAlpha: 0, x: -80 });
  tl.to(trs, { autoAlpha: 1, x: 0, stagger: 0.25, duration: 0.5 }, t1 + 0.2);
  tl.to(trs[0], { backgroundColor: '#D7F6FF', duration: 0.3 }, W('e6b', '100 UIT'));
  tl.to(trs[2], { backgroundColor: '#FFE3CC', duration: 0.3 }, W('e6b', '300 UIT'));
  // caso correcto / incorrecto
  const t2 = S('e6c');
  gsap.set(tab, { transformOrigin: 'left top' });
  tl.to(tab, { scale: 0.5, x: -150, y: -20, duration: 0.8, ease: 'expo.inOut' }, t2 - 0.3);
  tl.to(trs, { backgroundColor: '#ffffff', duration: 0.2 }, t2 - 0.3);
  const tk = at(c, 110, 560, `<svg viewBox="0 0 240 110" width="380" height="174"><rect x="4" y="4" width="232" height="90" rx="45" fill="#fff" stroke="#93A6C9" stroke-width="4"/><rect x="4" y="44" width="232" height="10" fill="#FF7A1A"/><text x="120" y="40" font-family="M" font-weight="900" font-size="26" fill="#0B1F4D" text-anchor="middle">GLP</text></svg>
    <div class="M" style="font-weight:900;font-size:44px;margin-top:6px">5,000 galones</div><div style="font-size:24px;color:var(--sub)">Capacidad de almacenamiento</div>`, '');
  slide(tk, S('e6c') - 0.1, { x: -200 });
  tl.to(trs[1], { backgroundColor: '#FFE9A8', duration: 0.3 }, W('e6c', 'monto requerido'));
  const req = at(c, 560, 640, `<div style="font-size:26px;color:var(--sub)">Requerido</div><div class="M" style="font-weight:900;font-size:76px;color:var(--num)">200 UIT</div>`, '');
  pop(req, W('e6c', 'monto requerido', -0.2));
  const arr = at(c, 960, 680, '<svg width="160" height="60"><path d="M0 30 H140 M115 8 L145 30 L115 52" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/></svg>', '');
  slide(arr, W('e6c', 'monto requerido', 0.4), { x: -60 });
  const pol = doc(c, 1170, 470, 640, 'Póliza RCE', 'Monto asegurado', [['Suma asegurada', '200 UIT', 'm']], { icon: 'shield', hd: '#C2410C' });
  pol.querySelector('.v').style.fontSize = '64px';
  slide(pol, W('e6c', 'monto asegurado', -0.4), { x: 300 });
  mk(pol.mk('m'), W('e6c', 'corresponda'));
  const okM = mark(c, 1700, 600, true, W('e6c', 'corresponda', 0.4));
  const vok = at(c, 1260, 820, 'CORRECTO', 'verdict ok'); pop(vok, W('e6c', 'corresponda', 0.5));
  const tBad = E('e6c') - 1.2;
  out([okM, vok], tBad);
  tl.set(pol.tx('m'), { textContent: '100 UIT' }, tBad);
  tl.set(pol.mk('m'), { backgroundColor: '#FFB3BF' }, tBad);
  tl.fromTo(pol, { x: 0 }, { keyframes: [{ x: -16 }, { x: 14 }, { x: -8 }, { x: 0 }], duration: 0.35, immediateRender: false }, tBad);
  const xm = mark(c, 1700, 600, false, tBad + 0.15);
  const vno = at(c, 1260, 820, 'INCORRECTO', 'verdict no'); pop(vno, tBad + 0.25);

  // múltiples instalaciones
  const t3 = S('e6d');
  tl.to([tab, tk, req, arr, pol, xm, vno], { autoAlpha: 0, y: 80, duration: 0.4, ease: 'power2.in' }, t3 + 0.5);
  vid(t3 + 0.6);
  frameCut(t3 + 0.6, 2600, 560, 0.42);
  cam.shot(t3 + 0.7, 3300, 600, 0.75, 3.4, 'sine.inOut');
  const terc = at(c, 1250, 140, `${ic('people', 50, 'var(--orange)')}<span style="margin-left:14px">Terceros expuestos</span>`, 'chip');
  slide(terc, t3 + 0.4, { x: 200 }); out(terc, t3 + 3.6);
  const inst = at(c, 0, 0, '', '', { width: '1920px', height: '1080px' });
  const ins = [0, 1, 2].map(i => {
    const b = at(inst, 150 + i * 330, 160, `${ic('factory', 70, 'var(--cyan)')}<div class="M" style="font-weight:900;font-size:32px;margin-top:8px">Instalación ${i + 1}</div><div style="color:var(--num);font-family:M;font-weight:800;font-size:28px">200 UIT</div>`, 'card', { width: '290px', padding: '26px', textAlign: 'center' });
    slide(b, W('e6d', 'múltiples', -0.2) + i * 0.2 + 3.2, { y: -120 });
    return b;
  });
  dim(W('e6d', 'múltiples', 3), 1);
  const meter = at(inst, 150, 560, `<div style="font-size:26px;color:var(--sub);margin-bottom:12px">Límite asegurado de la póliza vs. lo que debe cubrir</div>
    <div style="position:relative;width:1300px;height:90px;background:rgba(255,255,255,.12);border-radius:16px;overflow:hidden">
    <div class="fill" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:var(--red);transform-origin:left;transform:scaleX(0)"></div>
    <div class="fill2" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:var(--green);transform-origin:left;transform:scaleX(0)"></div>
    <div class="lbl M" style="position:absolute;left:30px;top:18px;font-weight:900;font-size:44px">200 UIT</div>
    <div class="M" style="position:absolute;right:30px;top:18px;font-weight:900;font-size:44px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.35)">600 UIT</div></div>`, '');
  slide(meter, W('e6d', 'suficiente', -0.6), { x: -100 });
  tl.to(meter.querySelector('.fill'), { scaleX: 0.333, duration: 0.8, ease: 'expo.out' }, W('e6d', 'suficiente', -0.3));
  const q = at(inst, 1480, 570, '¿Suficiente?', 'M', { fontWeight: 900, fontSize: '50px', color: 'var(--red)' });
  pop(q, W('e6d', 'suficiente'));
  // soluciones
  const opA = at(inst, 150, 760, `<span class="pill" style="position:relative;background:var(--green);color:#fff">Opción A</span><div class="M" style="font-weight:800;font-size:34px;margin-top:14px;width:600px">Monto que cubra todas las instalaciones</div>`, '');
  slide(opA, W('e6e', 'cubra todas', -0.4), { y: 80 });
  tl.to(meter.querySelector('.fill2'), { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, W('e6e', 'cubra todas'));
  tl.to(q, { autoAlpha: 0, duration: 0.2 }, W('e6e', 'cubra todas'));
  const okq = mark(inst, 1490, 560, true, W('e6e', 'cubra todas', 1.2), 100);
  const opB = at(inst, 900, 760, `<div style="display:flex;gap:22px;align-items:center"><div class="rf">${ic('refresh', 110, 'var(--cyan)')}</div><div><span class="pill" style="position:relative;background:var(--cyan)">Opción B</span><div class="M" style="font-weight:800;font-size:32px;margin-top:12px;width:620px">Cláusula de restitución automática de la suma asegurada</div></div></div>`, '');
  slide(opB, W('e6e', 'cláusula', -0.3), { y: 80 });
  tl.to(opB.querySelector('.rf'), { rotation: 720, duration: 3, ease: 'power2.inOut' }, W('e6e', 'restitución'));
  // caso observado
  const t5 = S('e6f');
  tl.to([meter, opA, opB, okq, ...ins], { autoAlpha: 0, y: -60, duration: 0.4, ease: 'power2.in' }, t5 - 0.3);
  gfx(t5 - 0.2);
  const cs = doc(c, 460, 220, 1000, 'Caso descrito por Osinergmin', 'Póliza presentada', [['Monto asegurado', 'Mínimo requerido para 1 instalación', 'a'], ['Instalaciones / actividades comprendidas', 'Instalación 1 · Instalación 2 · Instalación 3', 'b']], { icon: 'doc', hd: '#13306E' });
  cs.querySelectorAll('.v').forEach(v => v.style.fontSize = '34px'); cs.querySelectorAll('.l').forEach(v => v.style.fontSize = '20px');
  slide(cs, t5, { y: 200, rot: -3 });
  mk(cs.mk('a'), W('e6f', 'mínimo requerido')); mk(cs.mk('b'), W('e6f', 'múltiples'));
  const so = stamp(c, 1080, 560, 'OBSERVADA', 'var(--red)', W('e6f', 'observada'));
  // conclusión
  const t6 = S('e6g');
  tl.to([cs, so], { autoAlpha: 0, x: -400, duration: 0.45, ease: 'power3.in' }, t6 - 0.3);
  const n1 = kt(c, 140, 230, 'No basta con identificar una *cifra*', 84, { w: 1640 }); ktIn(n1, t6);
  const g1 = chip(c, 140, 520, 'check', 'Suficiencia del monto', 'g');
  const g2 = chip(c, 140, 660, 'check', 'Condiciones que regulan su disponibilidad', 'g');
  slide(g1, W('e6g', 'suficiencia', -0.3), { x: -200 }); slide(g2, W('e6g', 'condiciones', -0.3), { x: -200 });
  const big = at(c, 1450, 480, ic('coin', 300, 'var(--num)'), ''); pop(big, W('e6g', 'cifra'), { rot: -40 });
  tl.to(big, { rotation: 10, y: -20, duration: 2, yoyo: true, repeat: 2, ease: 'sine.inOut' }, W('e6g', 'cifra', 0.6));
})();

// =============== ESCENA 7: CONDICIONES Y EXCLUSIONES ===============
(() => {
  const c = begin('e7', '07', 'Condiciones contractuales y exclusiones', 'Condiciones *contractuales* y _exclusiones_');
  const t0 = SCN.e7.start;
  gfx(t0 + 0.3, 0.3);
  // primer plano de cláusulas
  const clauses = [
    ['CLÁUSULA 4 · EXCLUSIONES', 'ex'], ['CLÁUSULA 7 · CONDICIONES ESPECIALES', 'ce'], ['CLÁUSULA 9 · MANTENIMIENTO DE LA COBERTURA', 'mc'],
    ['CLÁUSULA 11 · LÍMITE POR EVENTO Y AGREGADO ANUAL', 'li'], ['CLÁUSULA 12 · RESTITUCIÓN DE LA SUMA ASEGURADA', 're'], ['CLÁUSULA 15 · OBLIGACIONES DEL ASEGURADO', 'ob'],
  ];
  const page = at(c, 860, 120, `<div style="padding:40px 50px">${clauses.map(([h, k]) => `<div class="cl cl-${k}" style="position:relative;margin-bottom:26px;padding:10px 16px;border-radius:10px">
    <div class="M" style="font-weight:800;font-size:22px;color:#0B1F4D;letter-spacing:.04em">${h}</div>
    <div class="line" style="width:96%"></div><div class="line" style="width:88%"></div><div class="line" style="width:70%"></div></div>`).join('')}</div>`, 'doc', { width: '920px', height: '1300px' });
  hide(page, { rotationX: 25, rotationY: -18, transformPerspective: 1600, y: 300, scale: 1.1 });
  tl.to(page, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'expo.out' }, S('e7a') - 0.4);
  tl.to(page, { y: -220, rotationX: 10, duration: E('e7c') - S('e7a'), ease: 'sine.inOut' }, S('e7a'));
  const k = kt(c, 110, 300, 'Condiciones / *contractuales*', 92, { w: 700 }); ktIn(k, S('e7a'));
  const sb = at(c, 110, 540, 'Etapa indispensable de la evaluación del seguro', '', { width: '680px', fontSize: '34px', fontWeight: 600, color: 'var(--sub)' });
  slide(sb, W('e7a', 'indispensable', -0.3), { y: 30 });
  // Osinergmin: cláusulas especiales
  ktOut(k, S('e7b') - 0.2); out(sb, S('e7b') - 0.2);
  const os = at(c, 110, 220, 'Presentación Osinergmin', 'pill', { background: 'var(--cyan)' });
  slide(os, S('e7b'), { x: -100 });
  const ce = page.querySelector('.cl-ce');
  tl.to(ce, { backgroundColor: '#FFE9A8', scale: 1.04, duration: 0.4 }, W('e7b', 'cláusulas especiales'));
  const r1 = chip(c, 110, 330, 'x', 'Restringen la cobertura', 'r');
  const r2 = chip(c, 110, 460, 'alert', 'Condicionan su efectividad', 'o');
  slide(r1, W('e7b', 'restringen', -0.2), { x: -200 }); slide(r2, W('e7b', 'condicionan', -0.2), { x: -200 });
  const r3 = at(c, 110, 600, '…al cumplimiento de ciertas obligaciones', '', { fontSize: '30px', color: 'var(--sub)', fontWeight: 600, width: '700px' });
  slide(r3, W('e7b', 'obligaciones', -0.6), { y: 30 });
  tl.to(page.querySelector('.cl-ob'), { backgroundColor: '#FFE9A8', duration: 0.4 }, W('e7b', 'obligaciones', -0.4));
  // operación: mundo
  const t2 = S('e7c');
  tl.to([page, os, r1, r2, r3], { autoAlpha: 0, duration: 0.4 }, t2 - 0.3);
  vid(t2 - 0.3);
  frameCut(t2 - 0.3, 2950, 560, 0.85, 1250, 560);
  cam.shot(t2 - 0.2, 2650, 560, 1.05, E('e7c') - t2, 'sine.inOut');
  scrim(c, 'bottom', W('e7c', 'revisar', -0.8), E('e7c'));
  const lt = at(c, 80, 'auto', '<div class="a">Durante las operaciones</div><div class="b">Revisar condiciones que afecten la cobertura</div>', 'lower');
  slide(lt, W('e7c', 'revisar', -0.6), { x: -150 });
  out(lt, E('e7c'));
  // 4 focos de la evaluación
  const t3 = S('e7d');
  gfx(t3 - 0.3);
  tl.set(page, { y: 0, rotationX: 6, rotationY: -10 }, t3 - 0.3);
  tl.to(page, { autoAlpha: 1, duration: 0.5 }, t3 - 0.2);
  tl.set(page.querySelectorAll('.cl'), { backgroundColor: 'rgba(0,0,0,0)', scale: 1 }, t3 - 0.3);
  const foc = [['ex', 'Exclusiones', 'exclusiones', 'x', 'r'], ['mc', 'Mantenimiento de la cobertura', 'mantenimiento', 'refresh', 'c'], ['li', 'Límites por evento y agregado', 'límites', 'list', 'o'], ['re', 'Restitución de la suma asegurada', 'restitución', 'coin', 'g']];
  const fchips = foc.map(([kk, l, w, icn, cl], i) => {
    const ch = chip(c, 90, 210 + i * 150, icn, l, cl);
    slide(ch, W('e7d', w, -0.3), { x: -250 });
    tl.to(page.querySelector('.cl-' + kk), { backgroundColor: '#FFE9A8', duration: 0.3 }, W('e7d', w, -0.1));
    tl.to(page.querySelector('.cl-' + kk), { backgroundColor: 'rgba(255,233,168,.35)', duration: 0.3 }, W('e7d', w, 1.4));
    return ch;
  });
  // compatibilidad con la normativa
  const t4 = S('e7e');
  tl.to([page, ...fchips], { autoAlpha: 0, duration: 0.4 }, t4 - 0.3);
  const bA = at(c, 220, 330, `${ic('doc', 90, 'var(--orange)')}<div class="M" style="font-weight:900;font-size:40px;margin-top:12px">Condiciones<br>contractuales</div>`, 'card', { width: '520px', padding: '40px', textAlign: 'center' });
  const bB = at(c, 1180, 330, `${ic('shield', 90, 'var(--cyan)')}<div class="M" style="font-weight:900;font-size:40px;margin-top:12px">Exigencias<br>normativas</div>`, 'card', { width: '520px', padding: '40px', textAlign: 'center' });
  slide(bA, t4, { x: -300 }); slide(bB, W('e7e', 'exigencias', -0.5), { x: 300 });
  const gr = at(c, 860, 400, ic('gear', 200, 'var(--num)'), '');
  pop(gr, W('e7e', 'incompatibles', -0.4));
  tl.to(gr, { rotation: 360, duration: 3, ease: 'none' }, W('e7e', 'incompatibles', -0.4));
  const cmp = at(c, 0, 760, '<span class="verdict ok" style="position:relative;margin-right:40px">✓ COMPATIBLES</span><span class="verdict no" style="position:relative">✗ INCOMPATIBLES</span>', '', { width: '1920px', textAlign: 'center' });
  pop(cmp, W('e7e', 'incompatibles'));
  // objetivo
  const t5 = S('e7f');
  tl.to([bA, bB, gr, cmp], { autoAlpha: 0, scale: 0.8, duration: 0.4 }, t5 - 0.3);
  const shd = at(c, 160, 260, ic('shield', 380, 'var(--green)'), '');
  pop(shd, t5, { rot: -20 });
  const q1 = at(c, 700, 300, `<div style="display:flex;gap:22px;align-items:center">${ic('check', 70, 'var(--green)')}<div class="M" style="font-weight:800;font-size:40px">¿La protección contratada satisface los requisitos?</div></div>`, '', { width: '1080px' });
  const q2 = at(c, 700, 520, `<div style="display:flex;gap:22px;align-items:center">${ic('alert', 70, 'var(--orange)')}<div class="M" style="font-weight:800;font-size:40px">¿Existen restricciones que comprometan su efectividad?</div></div>`, '', { width: '1080px' });
  slide(q1, W('e7f', 'satisface', -0.6), { x: 200 }); slide(q2, W('e7f', 'restricciones', -0.5), { x: 200 });
  // texto completo vs carátula
  const t6 = S('e7g');
  tl.to([shd, q1, q2], { autoAlpha: 0, duration: 0.4 }, t6 - 0.3);
  const full = at(c, 260, 220, '', '', { width: '560px', height: '600px' });
  for (let i = 0; i < 5; i++) {
    const p = at(full, i * 22, i * 22, '<div class="line"></div><div class="line" style="width:80%"></div><div class="line"></div><div class="line" style="width:60%"></div>', 'doc', { width: '440px', height: '540px', padding: '40px' });
    slide(p, t6 + i * 0.08, { y: 200, rot: -10 + i * 3 });
  }
  const fl = at(c, 230, 840, 'Texto contractual completo', 'pill', { background: 'var(--green)', color: '#fff', fontSize: '30px' });
  slide(fl, W('e7g', 'completo', -0.4), { y: 40 });
  mark(c, 700, 180, true, W('e7g', 'completo'), 110);
  const cert = at(c, 1180, 300, `<div class="M" style="font-weight:900;font-size:30px;color:#0B1F4D;text-align:center;margin-bottom:24px">CERTIFICADO / CARÁTULA</div><div class="line"></div><div class="line" style="width:70%"></div>`, 'doc', { width: '440px', height: '380px', padding: '40px' });
  slide(cert, W('e7g', 'certificado', -0.4), { x: 200, rot: 8 });
  const cl = at(c, 1150, 840, 'Solo certificado o carátula', 'pill', { background: 'var(--red)', color: '#fff', fontSize: '30px' });
  slide(cl, W('e7g', 'certificado'), { y: 40 });
  mark(c, 1560, 240, false, W('e7g', 'carátula'), 110);
})();

// =============== ESCENA 8: DOCUMENTACIÓN ===============
(() => {
  const c = begin('e8', '08', 'Documentación y prevención de observaciones', 'Documentación y *prevención* de observaciones');
  const t0 = SCN.e8.start;
  vid(t0 + 2.2);
  frameCut(t0 + 0.4, 1960, 600, 1.2, 1350, 560);
  cam.shot(t0 + 0.5, 1960 - 390 / 1.45, 590, 1.45, E('e8a') - t0, 'sine.inOut');
  beam(S('e8a'), 1); scrim(c, 'left', S('e8a') - 0.6, E('e8a'));
  const k = kt(c, 110, 260, 'Gestión / _documental_', 96, { w: 800 }); ktIn(k, S('e8a'));
  const c1 = chip(c, 110, 520, 'check', 'Menos inconsistencias', 'g');
  const c2 = chip(c, 110, 650, 'search', 'Evaluación más ágil', 'c');
  slide(c1, W('e8a', 'reducir', -0.2), { x: -200 }); slide(c2, W('e8a', 'facilitar', -0.2), { x: -200 });
  ktOut(k, E('e8a')); out([c1, c2], E('e8a')); beam(E('e8a'), 0);
  // TUPA
  const t1 = S('e8b');
  gfx(t1 - 0.4);
  const tupa = doc(c, 560, 170, 800, 'Requisitos TUPA', 'Trámites de Registro de Hidrocarburos', [['Requisito', 'Formulario de solicitud', 'f'], ['Requisito', 'Copia de la póliza de seguro', 'p'], ['Requisito', 'Demás documentos aplicables', 'o']], { icon: 'list', hd: '#13306E' });
  slide(tupa, t1 - 0.2, { y: 200, rot: 4 });
  mk(tupa.mk('p'), W('e8b', 'copia de la póliza'));
  mark(c, 1250, 400, true, W('e8b', 'copia de la póliza', 0.6), 76);
  const tp = at(c, 560, 740, 'Forma parte de los requisitos documentales', 'pill', { background: 'var(--green)', color: '#fff' });
  slide(tp, W('e8b', 'requisitos documentales', -0.3), { y: 50 });
  // expediente anterior
  const t2 = S('e8c');
  tl.to([tupa, tp], { autoAlpha: 0, x: -500, duration: 0.45, ease: 'power3.in' }, t2 - 0.3);
  tl.set(c.querySelectorAll('.mark'), { autoAlpha: 0 }, t2 - 0.3);
  const fo = at(c, 220, 240, `${ic('folder', 260, 'var(--num)')}<div class="M" style="font-weight:900;font-size:36px;text-align:center">Expediente anterior</div><div style="text-align:center;font-family:M;font-weight:800;font-size:30px;color:var(--cyan)">N.º 2025-XXXXXX</div>`, '', { width: '420px', textAlign: 'center' });
  slide(fo, t2, { x: -200 });
  const po = at(c, 370, 280, ic('doc', 110, 'var(--orange)'), '');
  pop(po, W('e8c', 'póliza ya obra', -0.2)); tl.to(po, { y: 70, scale: 0.6, duration: 0.6, ease: 'power2.in' }, W('e8c', 'póliza ya obra', 0.6));
  const ar = at(c, 720, 380, '<svg width="300" height="80"><path d="M0 40 H270 M240 12 L280 40 L240 68" stroke="currentColor" stroke-width="10" fill="none" stroke-linecap="round"/></svg>', '');
  slide(ar, W('e8c', 'referencia', -0.3), { x: -100 });
  const nt = doc(c, 1100, 230, 700, 'Nuevo trámite', 'Registro de Hidrocarburos', [['Póliza de seguro', 'Ver expediente N.º 2025-XXXXXX', 'r']], { icon: 'doc', hd: '#1F6BFF' });
  slide(nt, W('e8c', 'referencia'), { x: 250 });
  mk(nt.mk('r'), W('e8c', 'número'));
  const cr = at(c, 1100, 520, 'Conforme al criterio descrito en el material', 'pill', { background: 'var(--white)', fontSize: '22px' });
  slide(cr, W('e8c', 'criterio', -0.3), { y: 40 });
  // certificados ≠ póliza
  const t3 = S('e8d');
  tl.to([fo, po, ar, nt, cr], { autoAlpha: 0, y: -100, duration: 0.4, ease: 'power2.in' }, t3 - 0.3);
  const cc = at(c, 250, 250, `<div class="M" style="font-weight:900;font-size:34px;color:#0B1F4D;text-align:center">CERTIFICADO /<br>CONSTANCIA DE SEGURO</div><div class="line" style="margin-top:30px"></div><div class="line" style="width:70%"></div>`, 'doc', { width: '480px', height: '440px', padding: '40px' });
  const pp = at(c, 1190, 250, `<div class="M" style="font-weight:900;font-size:34px;color:#0B1F4D;text-align:center">PÓLIZA DE SEGURO<br>RCE</div>${'<div class="line"></div>'.repeat(9)}`, 'doc', { width: '480px', height: '440px', padding: '40px' });
  slide(cc, t3, { x: -300, rot: -8 }); slide(pp, t3 + 0.2, { x: 300, rot: 8 });
  const neq = at(c, 830, 330, '<div class="M" style="font-weight:900;font-size:220px;color:var(--red);line-height:1">≠</div>', '', { width: '260px', textAlign: 'center' });
  pop(neq, W('e8d', 'no sustituyen'));
  const ns = at(c, 0, 760, '<span class="pill" style="position:relative;background:var(--red);color:#fff">No sustituye automáticamente a la póliza</span>', '', { width: '1920px', textAlign: 'center' });
  slide(ns, W('e8d', 'no sustituyen', 0.3), { y: 60 });
  tl.to(neq, { autoAlpha: 0, scale: 0.4, duration: 0.3 }, W('e8d', 'Sin embargo'));
  tl.to(ns, { autoAlpha: 0, duration: 0.3 }, W('e8d', 'Sin embargo'));
  const plus = at(c, 830, 330, '<div class="M" style="font-weight:900;font-size:220px;color:var(--green);line-height:1">+</div>', '', { width: '260px', textAlign: 'center' });
  pop(plus, W('e8d', 'adicional', -0.3));
  const ad = at(c, 0, 760, '<span class="pill" style="position:relative;background:var(--green);color:#fff">Puede presentarse de manera adicional</span>', '', { width: '1920px', textAlign: 'center' });
  slide(ad, W('e8d', 'adicional'), { y: 60 });
  // carpeta ordenada
  const t4 = S('e8e');
  tl.to([cc, pp, plus, ad], { autoAlpha: 0, scale: 0.7, duration: 0.4 }, t4 - 0.3);
  const fd = at(c, 760, 380, ic('folder', 400, 'var(--num)'), '');
  pop(fd, t4);
  [['Póliza', 'póliza'], ['Adendas', 'adendas'], ['Documentos complementarios', 'complementarios']].forEach(([l, w], i) => {
    const f = at(c, 200 + i * 520, 170, `${ic('doc', 50, 'var(--orange)')}<span style="margin-left:12px">${l}</span>`, 'chip');
    slide(f, W('e8e', w, -0.3), { y: -150 });
    tl.to(f, { x: 860 - (200 + i * 520) - 120, y: 330, scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, W('e8e', w, 1.0));
    tl.to(fd, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1 }, W('e8e', w, 1.6));
  });
  const ord = at(c, 0, 860, 'Gestión ordenada', 'M', { width: '1920px', textAlign: 'center', fontWeight: 900, fontSize: '56px' });
  slide(ord, W('e8e', 'gestión ordenada', 0.2), { y: 40 });
  // contraste con el Registro de Hidrocarburos
  const t5 = S('e8f');
  tl.to([fd, ord], { autoAlpha: 0, duration: 0.4 }, t5 - 0.3);
  const hA = at(c, 360, 160, `${ic('folder', 60, 'var(--num)')}<div class="M" style="font-weight:900;font-size:36px">Documentación</div>`, 'card', { width: '480px', padding: '24px', textAlign: 'center' });
  const hB = at(c, 1080, 160, `${ic('doc', 60, 'var(--cyan)')}<div class="M" style="font-weight:900;font-size:36px">Registro de Hidrocarburos</div>`, 'card', { width: '480px', padding: '24px', textAlign: 'center' });
  slide(hA, t5, { x: -300 }); slide(hB, W('e8f', 'Registro', -0.5), { x: 300 });
  const sw = at(c, 880, 200, '<div class="M" style="font-weight:900;font-size:90px;color:var(--orange)">⇄</div>', '', { width: '160px', textAlign: 'center' });
  pop(sw, W('e8f', 'contrastar'));
  tl.to(sw, { rotationY: 360, duration: 1.4, ease: 'power2.inOut' }, W('e8f', 'contrastar', 0.3));
  [['Titular', 'titular'], ['Actividad', 'la actividad'], ['Ubicación', 'ubicación'], ['Monto asegurado', 'monto asegurado']].forEach(([l, w], i) => {
    const r = at(c, 360, 400 + i * 135, `<span class="M" style="font-weight:800;font-size:38px">${l}</span>`, 'card', { width: '1200px', padding: '24px 40px' });
    slide(r, W('e8g', w, -0.6), { x: -120 });
    mark(c, 1460, 410 + i * 135, true, W('e8g', w, 0.1), 74);
  });
})();

// =============== ESCENA 9: CONCLUSIONES ===============
(() => {
  const c = begin('e9', '09', 'Conclusiones', '*Conclusiones* y mensaje final');
  const t0 = SCN.e9.start;
  vid(t0 + 2.2);
  frameCut(t0 + 0.4, 1200, 560, 0.55);
  cam.shot(t0 + 0.5, 2300, 560, 0.62, E('e9a') - t0, 'sine.inOut');
  beam(S('e9a'), 1); scrim(c, 'top', S('e9a') - 0.6, E('e9a'));
  const k = kt(c, 110, 150, 'Cumplimiento _normativo_', 88, { w: 1500 }); ktIn(k, S('e9a'));
  const sb = at(c, 112, 270, 'Actividades de hidrocarburos', 'pill'); slide(sb, W('e9a', 'hidrocarburos', -0.5), { x: -80 });
  ktOut(k, E('e9a')); out(sb, E('e9a'));
  // puntos de control
  const t1 = S('e9b');
  dim(t1 - 0.3, 1);
  tl.to('#world', { autoAlpha: 0.5, duration: 0.5 }, t1 - 0.3);
  const ttl = kt(c, 110, 130, 'Puntos de *control*', 70, { w: 1500 }); ktIn(ttl, t1 - 0.2);
  const items = [
    ['Titular asegurado', 'e9b', 'titular asegurado'], ['Vigencia de la póliza', 'e9b', 'vigencia'], ['Actividad y ubicación del riesgo', 'e9b', 'correspondencia'],
    ['Alcance de las coberturas', 'e9b', 'alcance'], ['Suficiencia del monto asegurado', 'e9b', 'suficiencia'],
    ['Condiciones especiales', 'e9c', 'condiciones especiales'], ['Exclusiones', 'e9c', 'exclusiones'], ['Cláusulas que limitan o condicionan', 'e9c', 'cláusulas'],
    ['Documentación ordenada y coherente con el Registro de Hidrocarburos', 'e9d', 'documentación'],
  ];
  const rows = items.map(([l, id, w], i) => {
    const col = i < 5 ? 0 : 1, row = i < 5 ? i : i - 5;
    const x = col ? 1000 : 110, y = 260 + row * 118;
    const wd = i === 8 ? '820px' : '820px';
    const r = at(c, x, y, `<div style="display:flex;align-items:center;gap:20px"><div class="bx" style="width:58px;height:58px;border-radius:12px;border:4px solid var(--cyan);flex:none"></div><span class="M" style="font-weight:800;font-size:${i === 8 ? 28 : 34}px">${l}</span></div>`, '', { width: wd });
    slide(r, W(id, w, -0.4), { x: -80 });
    mark(c, x - 7, y - 7 + (i === 8 ? 0 : 0), true, W(id, w, 0.1), 72);
    return r;
  });
  // revisión preventiva
  const t2 = S('e9e');
  tl.to([ttl, ...rows], { autoAlpha: 0, x: -100, duration: 0.4, stagger: 0.02, ease: 'power2.in' }, t2 - 0.4);
  tl.set(c.querySelectorAll('.mark'), { autoAlpha: 0 }, t2);
  const rp = kt(c, 0, 170, 'Revisión *preventiva*', 92, { w: 1920, align: 'center' }); ktIn(rp, t2);
  [['search', 'Identificar', 'inconsistencias', 'identificar', 'var(--cyan)'], ['refresh', 'Corregir', 'oportunamente', 'correcciones', 'var(--orange)'], ['shield', 'Cumplir', 'obligaciones aplicables', 'fortalecer', 'var(--green)']].forEach(([icn, a, b, w, col], i) => {
    const s = at(c, 200 + i * 560, 400, `${ic(icn, 120, col)}<div class="M" style="font-weight:900;font-size:52px;margin-top:16px">${a}</div><div style="font-size:28px;color:var(--sub)">${b}</div>`, 'card', { width: '440px', padding: '44px', textAlign: 'center', borderColor: col });
    slide(s, W('e9e', w, -0.4), { y: 160, rot: 6 });
    if (i < 2) { const a2 = at(c, 660 + i * 560, 540, '<svg width="80" height="60"><path d="M0 30 H60 M40 8 L66 30 L40 52" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/></svg>', ''); pop(a2, W('e9e', w, 0.4)); out(a2, E('e9e') + 0.1); }
    out(s, E('e9e') + 0.1, { y: -100 });
  });
  ktOut(rp, E('e9e'));
  // beneficios
  const t3 = S('e9f');
  vid(t3 - 0.3);
  tl.to('#world', { autoAlpha: 1, duration: 0.5 }, t3 - 0.3);
  frameCut(t3 - 0.3, 2200, 520, 0.45);
  cam.shot(t3 - 0.2, 2200, 560, 0.55, E('e9f') - t3, 'sine.inOut');
  scrim(c, 'top', t3 - 0.3, S('e9g'));
  const b1 = chip(c, 110, 160, 'factory', 'Operación responsable', 'c');
  const b2 = chip(c, 700, 160, 'people', 'Protección de terceros', 'o');
  const b3 = chip(c, 1300, 160, 'shield', 'Gestión de riesgos', 'g');
  slide(b1, W('e9f', 'operación responsable', -0.3), { y: -120 }); slide(b2, W('e9f', 'protección de terceros', -0.3), { y: -120 }); slide(b3, W('e9f', 'administración', -0.3), { y: -120 });
  // mensaje final
  const t4 = S('e9g');
  tl.to([b1, b2, b3], { autoAlpha: 0, y: -80, duration: 0.4 }, t4 - 0.3);
  dim(t4 - 0.3, 1);
  const q = kt(c, 0, 300, 'La prevención comienza / con el *conocimiento*', 100, { w: 1920, align: 'center' }); ktIn(q, t4, { st: 0.08 });
  const q2 = at(c, 0, 600, 'y se fortalece con una gestión rigurosa<br>de los riesgos y de las coberturas contratadas', '', { width: '1920px', textAlign: 'center', fontSize: '42px', fontWeight: 600, color: 'var(--sub)', lineHeight: 1.35 });
  slide(q2, W('e9g', 'fortalece', -0.4), { y: 50 });
  const bar = at(c, 760, 820, '', '', { width: '400px', height: '10px', background: 'linear-gradient(90deg,var(--orange),var(--yellow))' });
  gsap.set(bar, { scaleX: 0 }); tl.to(bar, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, W('e9g', 'fortalece'));
  ktOut(q, E('e9g') + 0.6); out([q2, bar], E('e9g') + 0.6);
})();

// =============== CIERRE ===============
(() => {
  const c = scene('outro');
  const t0 = SCN.outro.start;
  chapHide(t0);
  tl.to('#world', { autoAlpha: 0, duration: 0.6 }, t0);
  const pill = at(c, 0, 330, '<span class="pill" style="position:relative">Capacitación · Consumidor directo de GLP</span>', '', { width: '1920px', textAlign: 'center' });
  const k = kt(c, 0, 410, 'Pólizas de Responsabilidad / Civil _Extracontractual_', 92, { w: 1920, align: 'center' });
  slide(pill, t0 + 0.4, { y: -40 }); ktIn(k, t0 + 0.6);
  const ln = at(c, 760, 680, '', '', { width: '400px', height: '10px', background: 'linear-gradient(90deg,var(--cyan),var(--blue))' });
  gsap.set(ln, { scaleX: 0 }); tl.to(ln, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, t0 + 1.2);
  tl.to('#stage', { opacity: 0, duration: 1.0 }, TL.total - 1.0);
})();

// ---------- render ----------
window.DURATION = TL.total;
window.renderAt = t => {
  tl.time(t, false);
  for (const f of tickers) f(t);
};
window.renderAt(0);
document.fonts.ready.then(() => { window.READY = true; });

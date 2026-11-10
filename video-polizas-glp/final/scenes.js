// Escenas del video final. Cada bloque sigue la locución frase por frase (ids e1a…e9g del guion).
const F4 = '../fotos/foto4.jpg', F5 = '../fotos/foto5.jpg', F6 = '../fotos/foto6.jpg';
const B = (a, z) => [a, z];
const fin = id => E(id) + 0.35;

// ===================== INTRO + 01 INTRODUCCIÓN =====================
photo(B(SC.intro[0], SC.e1[1]), F6);
(() => {
  const c = scene('intro');
  const pill = pillAt(c, 150, 300, 'Capacitación · Consumidor directo de GLP', 0.5, { bg: 'var(--orT)' });
  const t1 = words(c, 150, 380, 'Pólizas de Responsabilidad / Civil *Extracontractual*', 108, { w: 1600 }); wordsIn(t1, 0.8);
  const sub = el(c, 'Aspectos clave para revisar la póliza y prevenir observaciones', 'left:154px;top:640px;font-size:36px;font-weight:600;color:var(--mut)');
  rise(sub, 1.6, { y: 40 });
  out([pill, t1, sub], SC.intro[1] - 0.5);
})();
(() => {
  const c = scene('e1', '01', 'Introducción');
  let g = beat(c, S('e1a') - 0.3, fin('e1b'));
  const doc = card(g, 1180, 210, 560, 640, `<div class="dh" style="background:var(--blT)">${ic9('poliza')}<div><b>Póliza RCE</b><small>Responsabilidad Civil Extracontractual</small></div></div>
    <div class="rows">${['Asegurado', 'Vigencia', 'Coberturas', 'Monto asegurado'].map(l => `<div class="row"><div class="l">${l}</div><div style="height:14px;width:${240 + l.length * 8}px;background:#E4E9F2;border-radius:7px;margin-top:10px"></div></div>`).join('')}</div>`);
  rise(doc, W('e1a', 'póliza', -0.4), { x: 300, y: 0, r: 8 });
  const k1 = head(g, S('e1a') + 0.3, 'La póliza es / más que un / *documento vigente*', { y: 300, s: 86, w: 980 });
  stamp(g, 1420, 740, 'VIGENTE', 'var(--ok)', W('e1a', 'documento vigente'), -10);
  out(k1, E('e1a'));
  head(g, S('e1b') + 0.1, 'Protección / para *Solgas*', { y: 190, s: 86, w: 1000 });
  para(g, 154, 400, 900, 'frente a las consecuencias económicas de accidentes que afecten a:', W('e1b', 'consecuencias', -0.4), { s: 34, fw: 700 });
  [['instalaciones', 'Instalaciones', 'instalaciones'], ['terceros', 'Terceros', 'terceros'], ['ambiente', 'Medio ambiente', 'medio ambiente']].forEach(([n, l, w], i) =>
    badge(g, 170 + i * 330, 540, 210, n, W('e1b', w, -0.3), l, { lw: 310 }));
  // e1c: lo que revisaremos
  g = beat(c, S('e1c') - 0.2, fin('e1c'));
  head(g, S('e1c'), 'En esta capacitación *revisaremos*', { y: 160 });
  [['supervision', 'Aspectos principales', 'para revisar la póliza', 'principales aspectos'], ['alerta', 'Detectar inconsistencias', 'que puedan generar observaciones', 'inconsistencias'], ['autorizacion', 'Prevenir observaciones', 'en el trámite de autorización y/o supervisión', 'trámite']].forEach(([n, a, b, w], i) => {
    const k = card(g, 150 + i * 545, 330, 500, 520, `<div style="position:absolute;left:40px;top:40px;width:150px;height:150px">${ic9(n)}</div>
      <div class="t" style="position:absolute;left:40px;top:230px;width:420px;font-size:44px;line-height:1.05">${a}</div>
      <div style="position:absolute;left:42px;top:350px;width:420px;font-size:28px;font-weight:600;color:var(--mut);line-height:1.3">${b}</div>
      <div class="t" style="position:absolute;right:34px;top:34px;font-size:64px;color:transparent;-webkit-text-stroke:3px var(--or)">0${i + 1}</div>`);
    rise(k, W('e1c', w, -0.5), { y: 160, r: i % 2 ? 3 : -3 });
  });
})();

// ===================== 02 MARCO NORMATIVO =====================
(() => {
  const c = scene('e2', '02', 'Marco normativo', r => photo(r, F5, 'soft', '70% center'));
  wipe(SC.e2[0]);
  chapter(c, SC.e2[0] + 0.25, '02', 'Marco normativo *aplicable*', 'D.S. N.º 01-94-EM y sus modificatorias');
  // e2a
  let g = beat(c, S('e2a') - 0.2, fin('e2a'));
  head(g, S('e2a'), 'Pólizas exigidas por el / *Reglamento para la comercialización de GLP*', { s: 60 });
  const k = dcard(g, 150, 340, 900, 470, 'Decreto Supremo N.º 01-94-EM', 'Reglamento para la comercialización de GLP', 'normativa', 'var(--blT)', W('e2a', 'Reglamento', -0.6));
  k.querySelector('.rows').innerHTML = `<div style="display:flex;gap:26px;margin-top:40px"><div class="a31 k" style="position:relative;width:360px;height:180px;background:var(--yeT);display:grid;place-items:center"><div class="t" style="font-size:70px">Art. 31</div></div><div class="a32 k" style="position:relative;width:360px;height:180px;background:var(--orT);display:grid;place-items:center"><div class="t" style="font-size:70px">Art. 32</div></div></div>`;
  pop(k.querySelector('.a31'), W('e2a', '31'), { s: 0.2 }); pop(k.querySelector('.a32'), W('e2a', '32'), { s: 0.2 });
  pillAt(g, 640, 770, '+ modificatorias', W('e2a', 'modificatorias', -0.2), { bg: 'var(--orT)' });
  // e2b: artículo 31 como imagen (texto del Word)
  g = beat(c, S('e2b') - 0.2, fin('e2b'));
  const a31 = card(g, 150, 140, 1060, 680, `<div class="dh" style="background:var(--yeT)">${ic9('normativa')}<div><b>Artículo 31.-</b><small>D.S. N.º 01-94-EM</small></div></div>
    <div class="art" style="padding:26px 40px;font-size:31px">${MARK('Los Operadores de Instalaciones para GLP deben mantener vigente una <m>póliza de seguro de responsabilidad civil extracontractual</m> que cubre los <m>daños a terceros, en sus bienes y personas</m>, por siniestros que puedan ocurrir en sus instalaciones o medios de transporte, según corresponda, expedida por una compañía de seguros establecida legalmente en el país, sin perjuicio de otras políticas que tenga el propietario u Operador para cubrir sus instalaciones y/o activos, robo, etc.')}</div>`);
  rise(a31, S('e2b') - 0.1, { y: 160, r: -2 });
  const m31 = a31.querySelectorAll('.mk2'); hl2(m31[0], W('e2b', 'póliza de seguros')); hl2(m31[1], W('e2b', 'daños a terceros'));
  head(g, W('e2b', 'obligación', -0.5), 'Cobertura de / *daños a*:', { x: 1290, y: 160, s: 54, w: 520 });
  [['terceros', 'Terceros', 'daños a terceros'], ['bienes', 'Sus bienes', 'sus bienes'], ['ambiente', 'Medio ambiente', 'medio ambiente']].forEach(([n, l, w], i) =>
    badge(g, 1290, 330 + i * 200, 150, n, W('e2b', w, -0.2), l, { side: 1, lw: 300 }));
  // e2c + e2d: prohibición de abastecer y responsabilidad solidaria
  g = beat(c, S('e2c') - 0.2, fin('e2d'));
  const a31b = card(g, 150, 140, 1060, 560, `<div class="dh" style="background:var(--yeT)">${ic9('normativa')}<div><b>Artículo 31.- (continúa)</b><small>D.S. N.º 01-94-EM</small></div></div>
    <div class="art" style="padding:26px 40px;font-size:29px">${MARK('<m>Está prohibido y se encuentra sujeto a sanción, abastecer GLP</m> a Operadores de Instalaciones para GLP cuya instalación no esté cubierta por la póliza mencionada. De ocurrir un siniestro en una Instalación de GLP y ésta no tuviera el seguro obligatorio vigente, la empresa que expidió o despachó el GLP será <m>solidariamente responsable por daños a terceros</m>, hasta por un monto equivalente al del seguro que la instalación siniestrada debería haber tenido vigente.')}</div>`);
  rise(a31b, S('e2c') - 0.1, { y: 160, r: 2 });
  const mb = a31b.querySelectorAll('.mk2'); hl2(mb[0], W('e2c', 'prohibidos')); hl2(mb[1], W('e2d', 'solidariamente'));
  badge(g, 1340, 170, 170, 'prohibido', W('e2c', 'abastecer', -0.3), 'Sin póliza vigente, / no se abastece'.replace(' / ', '<br>'), { lw: 400 });
  stamp(g, 1300, 450, 'PROHIBIDO ABASTECER', 'var(--no)', W('e2c', 'póliza vigente'), -6);
  const sol = dcard(g, 1260, 580, 520, 330, 'Responsabilidad solidaria', 'por daños a terceros', 'terceros', 'var(--orT)', W('e2d', 'solidariamente', -0.3), { x: 160, y: 0 });
  sol.querySelector('.rows').innerHTML = '<div style="font-size:27px;font-weight:600;color:var(--mut);line-height:1.35;margin-top:18px">Si se abastece a una instalación sin póliza vigente y ocurre un siniestro.</div>';
})();

// ===================== 03 MONTOS MÍNIMOS =====================
const TABLA = [['Hasta 1.000 galones', 100, 'var(--blT)'], ['Hasta 10.000 galones', 200, 'var(--bl2)'], ['Mayor a 10.000 galones', 300, 'var(--or)']];
function tablaUIT(g, x, y, w, t0, gap = 0.35) {
  const k = card(g, x, y, w, 120 + TABLA.length * 96, `<div style="padding:22px 34px 8px;font-size:22px;font-weight:700;color:var(--mut);line-height:1.3">Consumidores Directos de GLP y Redes de Distribución de GLP con capacidad de almacenamiento autorizada:</div>`);
  const cells = TABLA.map(([l, v, col], i) => {
    const r = el(k, `<div style="font-size:31px;font-weight:800">${l}</div><div style="display:flex;align-items:center;gap:14px"><span style="width:26px;height:26px;border-radius:8px;border:3px solid var(--nv);background:${col}"></span><span class="t" style="font-size:52px"><span class="n">0</span><span style="font-size:26px"> UIT</span></span></div>`,
      `left:34px;right:34px;top:${110 + i * 96}px;height:86px;display:flex;justify-content:space-between;align-items:center;border-top:3px solid #E6EBF3`);
    rise(r, t0 + i * gap, { x: -60, y: 0, r: 0 }); counterTo(r.querySelector('.n'), v, t0 + i * gap + 0.1);
    return r;
  });
  rise(k, t0 - 0.5, { y: 120, r: -2 });
  return { k, cells };
}
(() => {
  const c = scene('e3', '03', 'Montos mínimos', r => photo(r, F4, 'soft', '70% center'));
  wipe(SC.e3[0]);
  chapter(c, SC.e3[0] + 0.25, '03', 'Montos *mínimos* de las pólizas', 'Artículo 32 · D.S. N.º 01-94-EM');
  let g = beat(c, S('e3a') - 0.2, fin('e3b'));
  const a32 = card(g, 150, 120, 1000, 280, `<div class="dh" style="background:var(--orT)">${ic9('normativa')}<div><b>Artículo 32.-</b><small>D.S. N.º 01-94-EM</small></div></div>
    <div class="art" style="padding:20px 36px">${MARK('Los <m>montos mínimos</m> de los seguros de responsabilidad civil extracontractual, expresados en Unidad Impositiva Tributaria (UIT) para un consumidor directo de GLP son:')}</div>`);
  rise(a32, S('e3a') - 0.1, { y: 120, r: -2 }); hl2(a32.querySelector('.mk2'), W('e3a', 'monto mínimo'));
  const tb = tablaUIT(g, 150, 440, 1000, W('e3a', 'capacidad', -0.4));
  const mn = pillAt(g, 1240, 470, 'MÍNIMO 100 UIT', W('e3b', '100 UIT'), { bg: 'var(--cyT)', s: 34 });
  const mx = pillAt(g, 1240, 760, 'MÁXIMO 300 UIT', W('e3b', '300 UIT'), { bg: 'var(--orT)', s: 34 });
  tl.to(tb.cells[0], { backgroundColor: 'rgba(211,240,250,.9)', duration: 0.3 }, W('e3b', '100 UIT')); tl.to(tb.cells[2], { backgroundColor: 'rgba(255,226,199,.9)', duration: 0.3 }, W('e3b', '300 UIT'));
  // e3c: uso automotor
  g = beat(c, S('e3c') - 0.2, fin('e3c'));
  head(g, S('e3c'), 'Despacho para / *uso automotor*', { y: 140, s: 80, w: 1000 });
  badge(g, 150, 400, 230, 'automotor', W('e3c', 'despacho', -0.2));
  const big = card(g, 440, 380, 620, 270, `<div style="position:absolute;left:44px;top:30px;font-size:26px;font-weight:800;color:var(--mut)">Monto mínimo</div><div class="t" style="position:absolute;left:40px;top:86px;font-size:140px"><span class="n">0</span><span style="font-size:56px"> UIT</span></div>`, 'background:var(--yeT)');
  rise(big, W('e3c', 'el monto', -0.4), { x: 200, y: 0 }); counterTo(big.querySelector('.n'), 300, W('e3c', 'el monto'));
  pillAt(g, 150, 700, 'Independiente de la capacidad de almacenamiento del tanque', W('e3c', 'independientemente', -0.2));
  para(g, 154, 800, 1000, '“Para el caso de Consumidores Directos de GLP con sistemas de despacho para uso automotor, el monto es de 300 UIT, independientemente de la capacidad de almacenamiento del tanque.” · Art. 32', S('e3c') + 1.2, { s: 24, fw: 500 });
})();

// ===================== 04 IDENTIFICACIÓN DEL ASEGURADO =====================
(() => {
  const c = scene('e4', '04', 'Identificación del asegurado', r => texture(r));
  wipe(SC.e4[0]);
  chapter(c, SC.e4[0] + 0.25, '04', 'Identificación del *asegurado*', 'y de la actividad a desarrollar');
  let g = beat(c, S('e4a') - 0.2, fin('e4a'));
  head(g, S('e4a'), 'Uno de los *primeros aspectos* / a verificar', { a: 'center', x: 0, w: 1920, y: 170, s: 70 });
  badge(g, 520, 430, 240, 'ruc', W('e4a', 'identificación del asegurado', -0.3), 'Identificación del asegurado', { lw: 420 });
  badge(g, 1160, 430, 240, 'tanque', W('e4a', 'actividad', -0.3), 'Actividad a desarrollar', { lw: 420 });
  // e4b … e4f: comparación de los tres documentos
  g = beat(c, S('e4b') - 0.3, fin('e4f'));
  const RS = 'INDUSTRIAS ANDINAS S.A.C.', RUC = '20601234567', ACT = 'Consumidor directo de GLP';
  const dS = dcard(g, 130, 250, 520, 470, 'Consulta RUC', 'SUNAT', 'ruc', 'var(--cyT)', S('e4b') - 0.2, { r: -6 });
  const mS = rows(dS, [['Razón social', RS], ['RUC', RUC], ['Estado', 'ACTIVO']]);
  const dP = dcard(g, 700, 250, 520, 470, 'Póliza de seguro', 'Responsabilidad Civil Extracontractual', 'poliza', 'var(--orT)', W('e4b', 'póliza', -0.2), { r: 5 });
  const mP = rows(dP, [['Razón social', RS], ['RUC', RUC], ['Actividad asegurada', ACT]]);
  const dR = dcard(g, 1270, 250, 520, 470, '<span style="font-size:23px">Registro de Hidrocarburos</span>', 'Solicitud · titular', 'registro', 'var(--blT)', W('e4b', 'Registro de Hidrocarburos', -0.6), { r: -4 });
  const mR = rows(dR, [['Razón social', RS], ['RUC', RUC], ['Actividad', ACT]]);
  hl(mP[0], W('e4b', 'Razón Social')); hl(mP[1], W('e4b', 'RUC,'));
  hl(mS[0], W('e4b', 'consulta RUC')); hl(mS[1], W('e4b', 'consulta RUC', 0.3));
  hl(mR[0], W('e4b', 'titular')); hl(mR[1], W('e4b', 'titular', 0.3));
  const corr = pillAt(g, 620, 150, 'Correspondencia: seguro ⇄ registro', W('e4c', 'correspondencia', -0.3), { bg: 'var(--ok)', c: '#fff' });
  mark(g, 1180, 365, true, W('e4c', 'información del seguro')); mark(g, 1180, 460, true, W('e4c', 'información registral'));
  mark(g, 610, 365, true, W('e4c', 'información del seguro', 0.2)); mark(g, 610, 460, true, W('e4c', 'información registral', 0.2));
  // e4d: el responsable de la revisión comprueba
  const p4d = pillAt(g, 300, 790, `<span style="display:inline-grid;place-items:center;width:52px;height:52px;vertical-align:middle;margin-right:14px">${ic9('supervision')}</span>El responsable de la revisión comprueba que la razón social y el RUC coincidan`, W('e4d', 'responsable', -0.3), { s: 28 });
  out(p4d, E('e4d') + 0.2); out(corr, E('e4d') + 0.2);
  // e4e: el riesgo asegurado corresponde a la actividad
  hl(mP[2], W('e4e', 'riesgo asegurado')); hl(mR[2], W('e4e', 'actividad de hidrocarburos'));
  const p4e = pillAt(g, 420, 790, 'Riesgo asegurado = actividad de hidrocarburos de la empresa', W('e4e', 'riesgo asegurado', -0.2), { s: 30 });
  out(p4e, E('e4e') + 0.2);
  // e4f: "Consumidor directo de GLP" y la misma actividad del formulario
  pillAt(g, 620, 150, 'Actividad: “Consumidor directo de GLP”', W('e4f', 'Consumidor directo', -0.4), { bg: 'var(--or)', s: 34 });
  arrow(g, 1100, 650, 1340, 650, W('e4f', 'la misma', -0.2));
  pillAt(g, 470, 790, 'Misma actividad que el formulario de solicitud de registro', W('e4f', 'la misma'), { bg: 'var(--ok)', c: '#fff', s: 30 });
  mark(g, 1180, 560, true, W('e4f', 'formulario'));
  // e4g: versión incorrecta
  g = beat(c, S('e4g') - 0.3, fin('e4g'));
  const dS2 = dcard(g, 130, 250, 520, 470, 'Consulta RUC', 'SUNAT', 'ruc', 'var(--cyT)', null); rows(dS2, [['Razón social', RS], ['RUC', RUC], ['Estado', 'ACTIVO']]);
  const dR2 = dcard(g, 1270, 250, 520, 470, '<span style="font-size:23px">Registro de Hidrocarburos</span>', 'Solicitud · titular', 'registro', 'var(--blT)', null); rows(dR2, [['Razón social', RS], ['RUC', RUC], ['Actividad', ACT]]);
  const dB = dcard(g, 700, 250, 520, 470, 'Póliza de seguro', 'Responsabilidad Civil Extracontractual', 'poliza', 'var(--orT)', null);
  const mB = rows(dB, [['Razón social', 'INDUSTRIAS ANDINA S.A.'], ['RUC', '20601234576'], ['Actividad asegurada', 'Comercialización de combustibles']]);
  mB.forEach(m => m.classList.add('r'));
  hide(dB, { rotationY: -90, transformPerspective: 1600 }); tl.to(dB, { autoAlpha: 1, rotationY: 0, duration: 0.5, ease: 'back.out(1.6)' }, S('e4g'));
  ['Razón Social', 'RUC', 'actividad'].forEach((w, i) => { hl(mB[i], W('e4g', w)); mark(g, 1180, [365, 460, 560][i], false, W('e4g', 'forma inexacta') + i * 0.2); });
  stamp(g, 810, 150, 'INCORRECTO', 'var(--no)', W('e4g', 'forma inexacta', 0.3), -4);
  const al = `<span style="display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--no);margin-right:14px;vertical-align:middle">${ic('alert', '#fff', 2.6).replace('<svg', '<svg width="26" height="26"')}</span>`;
  pillAt(g, 250, 790, al + 'Observaciones para la autorización', W('e4g', 'observaciones'));
  pillAt(g, 1000, 790, al + 'Limitaciones ante una emergencia', W('e4g', 'emergencia', -0.4));
})();

// ===================== 05 VIGENCIA, UBICACIÓN Y ALCANCE =====================
(() => {
  const c = scene('e5', '05', 'Ubicación y alcance', r => photo(r, F6, 'full'));
  wipe(SC.e5[0]);
  chapter(c, SC.e5[0] + 0.25, '05', 'Vigencia, ubicación y / *alcance* de la cobertura', '');
  let g = beat(c, S('e5a') - 0.2, fin('e5a'));
  head(g, S('e5a'), 'Resulta *sustancial* verificar', { a: 'center', x: 0, w: 1920, y: 190, s: 72 });
  badge(g, 520, 400, 240, 'ubicacion', W('e5a', 'ubicación del riesgo', -0.3), 'Ubicación del riesgo', { lw: 420 });
  badge(g, 1160, 400, 240, 'escudo', W('e5a', 'alcance', -0.3), 'Alcance de la cobertura', { lw: 420 });
  // e5b + e5c: la dirección debe coincidir; más de una instalación
  g = beat(c, S('e5b') - 0.2, fin('e5c'));
  head(g, S('e5b'), '1. La *ubicación del riesgo* debe coincidir', { s: 58 });
  const DIR = 'Av. Los Industriales 1250, Lurín, Lima';
  const kP = dcard(g, 150, 300, 700, 420, 'Póliza de seguro', 'Responsabilidad Civil Extracontractual', 'poliza', 'var(--orT)', W('e5b', 'consignada en la póliza', -0.6), { r: -3 });
  const mP = rows(kP, [['Ubicación del riesgo', DIR], ['Vigencia', '15/03/2026 – 15/03/2027'], ['Asegurado', 'INDUSTRIAS ANDINAS S.A.C.']]);
  const kR = dcard(g, 1070, 300, 700, 420, 'Registro de Hidrocarburos', 'Solicitud de registro', 'registro', 'var(--blT)', W('e5b', 'solicitud de registro', -0.6), { r: 3 });
  const mR = rows(kR, [['Dirección de la instalación de GLP', DIR], ['Actividad', 'Consumidor directo de GLP'], ['Titular', 'INDUSTRIAS ANDINAS S.A.C.']]);
  hl(mP[0], W('e5b', 'ubicación de riesgo')); hl(mR[0], W('e5b', 'dirección de la instalación'));
  badge(g, 895, 370, 130, 'ubicacion', W('e5b', 'coincidir'));
  mark(g, 922, 520, true, W('e5b', 'solicitud de registro', 0.3));
  // e5c
  const multi = card(g, 150, 760, 1620, 220, '', 'background:var(--yeT)');
  rise(multi, W('e5c', 'más relevante', -0.4), { y: 80, r: 0 });
  el(multi, `<div class="t" style="font-size:38px">Más relevante cuando la póliza asegura más de una instalación y/o actividad</div>`, 'left:40px;top:26px;width:1540px');
  ['Instalación 1 · Lurín', 'Instalación 2 · Ate', 'Instalación 3 · Callao'].forEach((l, i) => pillAt(multi, 40 + i * 420, 110, `<span style="display:inline-block;width:40px;height:40px;vertical-align:-10px;margin-right:10px">${ic9('ubicacion')}</span>${l}`, W('e5c', 'más de una', i * 0.25), { s: 28 }));
  // e5d: cobertura exigida
  g = beat(c, S('e5d') - 0.2, fin('e5d'));
  head(g, S('e5d'), '2. La cobertura debe comprender / los *riesgos exigidos* por la normativa', { s: 58 });
  [['terceros', 'Daños a terceros', 'daños a terceros'], ['bienes', 'A sus bienes', 'sus bienes'], ['ambiente', 'Al medio ambiente', 'medio ambiente']].forEach(([n, l, w], i) =>
    badge(g, 300 + i * 500, 420, 240, n, W('e5d', w, -0.3), l, { lw: 420, ls: 36 }));
  // e5e: exclusiones y limitaciones
  g = beat(c, S('e5e') - 0.2, fin('e5e'));
  head(g, S('e5e'), 'Que estos *3 aspectos* no estén restringidos', { s: 58 });
  const kx = dcard(g, 150, 290, 1100, 600, 'Exclusiones y/o limitaciones', 'Sección de la póliza', 'clausula', 'var(--yeT)', S('e5e') + 0.3);
  checkItem(kx, 44, 170, 'Daños a terceros · no restringido', W('e5e', 'restringidos'), { w: 1000 });
  checkItem(kx, 44, 290, 'Daños a sus bienes · no restringido', W('e5e', 'restringidos', 0.5), { w: 1000 });
  checkItem(kx, 44, 410, 'Daños al medio ambiente · excluido', W('e5e', 'exclusiones'), { w: 1000, ok: false });
  stamp(g, 1320, 690, 'REVISAR EXCLUSIONES', 'var(--no)', W('e5e', 'limitaciones'), -6);
  pillAt(g, 1300, 330, 'Ejemplo de póliza observada', W('e5e', 'exclusiones', 0.2), { bg: '#fff', s: 26 });
  // e5f: la póliza no garantiza por sí sola
  g = beat(c, S('e5f') - 0.2, fin('e5f'));
  badge(g, 840, 150, 240, 'escudo', S('e5f'));
  head(g, S('e5f') + 0.2, 'Tener la póliza *no garantiza*, por sí sola, / que todos los riesgos estén cubiertos', { a: 'center', x: 0, w: 1920, y: 470, s: 64 });
  para(g, 260, 700, 1400, 'en los términos exigidos por la normativa', W('e5f', 'términos exigidos', -0.6), { a: 'center', s: 36 });
})();

// ===================== 06 MONTO ASEGURADO Y SUFICIENCIA =====================
(() => {
  const c = scene('e6', '06', 'Monto asegurado', r => photo(r, F5, 'soft', '70% center'));
  wipe(SC.e6[0]);
  chapter(c, SC.e6[0] + 0.25, '06', 'Monto asegurado y / *suficiencia* de la cobertura', '');
  let g = beat(c, S('e6a') - 0.2, fin('e6b'));
  head(g, S('e6a'), 'Otro aspecto fundamental: / el *monto asegurado*', { s: 70, w: 1100 });
  badge(g, 1250, 150, 210, 'monto', S('e6a') + 0.5);
  tablaUIT(g, 150, 390, 1000, S('e6b') + 0.2);
  pillAt(g, 1240, 470, 'Desde 100 UIT', W('e6b', '100 UIT'), { bg: 'var(--cyT)', s: 34 });
  pillAt(g, 1240, 760, 'Hasta 300 UIT', W('e6b', '300 UIT'), { bg: 'var(--orT)', s: 34 });
  // e6c: monto según la capacidad (correcto / incorrecto)
  g = beat(c, S('e6c') - 0.2, fin('e6c'));
  head(g, S('e6c'), 'El monto debe corresponder a la / *capacidad del tanque*', { s: 58 });
  const kt = dcard(g, 150, 330, 470, 400, 'Instalación', 'Capacidad autorizada', 'tanque', 'var(--blT)', S('e6c') + 0.5);
  kt.querySelector('.rows').innerHTML = `<div class="t" style="font-size:72px;margin-top:30px">5.000 <span style="font-size:32px">galones</span></div><div style="font-size:26px;font-weight:700;color:var(--mut);margin-top:20px">Hasta 10.000 galones → requiere 200 UIT</div>`;
  const ok1 = dcard(g, 700, 300, 520, 330, 'Póliza A', 'Monto asegurado', 'poliza', 'var(--orT)', W('e6c', 'corresponda', -0.4));
  ok1.querySelector('.rows').innerHTML = `<div class="t" style="font-size:96px;margin-top:20px">200 <span style="font-size:40px">UIT</span></div>`;
  stamp(g, 760, 660, 'CORRECTO', 'var(--ok)', W('e6c', 'monto requerido'), -4);
  const no1 = dcard(g, 1270, 300, 520, 330, 'Póliza B', 'Monto asegurado', 'poliza', 'var(--orT)', W('e6c', 'monto requerido', 0.3));
  no1.querySelector('.rows').innerHTML = `<div class="t" style="font-size:96px;margin-top:20px;color:var(--no)">100 <span style="font-size:40px">UIT</span></div>`;
  stamp(g, 1320, 660, 'INSUFICIENTE', 'var(--no)', W('e6c', 'capacidad de almacenamiento'), -4);
  // e6d + e6e: múltiples instalaciones
  g = beat(c, S('e6d') - 0.2, fin('e6e'));
  head(g, S('e6d'), 'Cuando la póliza comprende / *múltiples instalaciones*', { s: 58 });
  [0, 1, 2].forEach(i => badge(g, 160, 330 + i * 190, 150, 'instalaciones', W('e6d', 'múltiples', i * 0.25), `Instalación ${i + 1}`, { side: 1, lw: 280, ls: 30 }));
  const lim = dcard(g, 670, 380, 520, 330, 'Una sola póliza', 'Límite asegurado', 'poliza', 'var(--orT)', W('e6d', 'límite asegurado', -0.5));
  lim.querySelector('.rows').innerHTML = `<div class="t" style="font-size:96px;margin-top:16px">200 <span style="font-size:40px">UIT</span></div>`;
  [0, 1, 2].forEach(i => arrow(g, 560, 405 + i * 190, 650, 545, W('e6d', 'límite asegurado', -0.3 + i * 0.1)));
  const suf = pillAt(g, 720, 745, '¿Es suficiente?', W('e6d', 'suficiente'), { bg: 'var(--yeT)', s: 36 });
  out(suf, S('e6e'));
  // e6e: dos alternativas
  const op1 = dcard(g, 1240, 250, 540, 300, 'Opción 1', 'Monto asegurado', 'monto', 'var(--cyT)', W('e6e', 'monto asegurado', -0.3), { x: 120, y: 0 });
  op1.querySelector('.rows').innerHTML = '<div style="font-size:28px;font-weight:800;line-height:1.3;margin-top:18px">Que cubra todas las instalaciones y/o actividades aseguradas</div>';
  pillAt(g, 1468, 565, 'o', W('e6e', 'o también', -0.1), { bg: 'var(--or)', s: 34 });
  const op2 = dcard(g, 1240, 640, 540, 300, 'Opción 2', 'Cláusula', 'clausula', 'var(--yeT)', W('e6e', 'cláusula', -0.3), { x: 120, y: 0 });
  op2.querySelector('.rows').innerHTML = '<div style="font-size:28px;font-weight:800;line-height:1.3;margin-top:18px">Restitución automática de la suma asegurada, cuando corresponda</div>';
  // e6f: caso observado
  g = beat(c, S('e6f') - 0.2, fin('e6f'));
  pillAt(g, 150, 150, 'Caso descrito en la presentación de Osinergmin', S('e6f'), { bg: 'var(--blT)', s: 28 });
  head(g, S('e6f') + 0.2, 'Mínimo de *una* instalación / para *varias* instalaciones', { y: 240, s: 64, w: 1100 });
  const kc = dcard(g, 150, 470, 900, 400, 'Póliza', 'Monto asegurado: mínimo requerido para 1 instalación', 'poliza', 'var(--orT)', W('e6f', 'mínimo requerido', -0.4));
  kc.querySelector('.rows').innerHTML = `<div style="display:flex;gap:20px;margin-top:30px">${[1, 2, 3].map(i => `<div class="k" style="position:relative;width:240px;height:150px;border-radius:22px;box-shadow:6px 6px 0 var(--nv);display:grid;place-items:center;font-size:26px;font-weight:800"><div style="width:70px;height:70px">${ic9('instalaciones')}</div>Instalación ${i}</div>`).join('')}</div>`;
  stamp(g, 1180, 560, 'OBSERVADA', 'var(--no)', W('e6f', 'resulta observada'), -8);
  // e6g: no basta la cifra
  g = beat(c, S('e6g') - 0.2, fin('e6g'));
  head(g, S('e6g'), 'No basta con *identificar una cifra*', { s: 64 });
  checkItem(g, 170, 330, 'Solo leer el monto del documento', W('e6g', 'identificar una cifra'), { ok: false, s: 40, w: 1500 });
  checkItem(g, 170, 470, 'Comprobar su suficiencia', W('e6g', 'suficiencia'), { s: 40, w: 1500 });
  checkItem(g, 170, 610, 'Revisar las condiciones que regulan su disponibilidad', W('e6g', 'condiciones'), { s: 40, w: 1500 });
})();

// ===================== 07 CONDICIONES CONTRACTUALES Y EXCLUSIONES =====================
(() => {
  const c = scene('e7', '07', 'Condiciones contractuales', r => texture(r));
  wipe(SC.e7[0]);
  chapter(c, SC.e7[0] + 0.25, '07', 'Condiciones *contractuales* / y exclusiones', '');
  let g = beat(c, S('e7a') - 0.2, fin('e7b'));
  head(g, S('e7a'), 'Leer las condiciones: / una etapa *indispensable*', { s: 64, w: 900 });
  const kc = card(g, 1020, 140, 760, 800, `<div class="dh" style="background:var(--blT)">${ic9('clausula')}<div><b>Condiciones de la póliza</b><small>Texto contractual</small></div></div>`);
  rise(kc, S('e7a') + 0.4, { x: 200, y: 0, r: 4 });
  const CL = ['Cláusula 1 · Objeto del seguro', 'Cláusula 2 · Coberturas', 'Cláusula 3 · Suma asegurada', 'Cláusula especial · Condiciones de mantenimiento', 'Cláusula 5 · Exclusiones'];
  CL.forEach((t, i) => {
    const r = el(kc, `<div style="font-size:26px;font-weight:800">${t}</div><div class="ln" style="position:relative;width:${560 - (i % 2) * 120}px;margin-top:12px"></div><div class="ln" style="position:relative;width:${480 - (i % 3) * 60}px;margin-top:10px"></div>`, `left:40px;top:${130 + i * 128}px;width:680px;padding:10px 14px;border-radius:14px`);
    r.classList.add('cl' + i); rise(r, S('e7a') + 0.8 + i * 0.15, { y: 30, r: 0 });
  });
  const scan = el(kc, '', 'left:20px;top:120px;width:720px;height:120px;border-radius:16px;border:4px solid var(--or);background:rgba(255,122,0,.08)');
  hide(scan); tl.to(scan, { autoAlpha: 1, duration: 0.2 }, S('e7a') + 1.6); tl.to(scan, { y: 512, duration: 2.6, ease: 'power1.inOut' }, S('e7a') + 1.8);
  // e7b
  tl.to(kc.querySelector('.cl3'), { backgroundColor: 'rgba(255,237,184,1)', duration: 0.3 }, W('e7b', 'cláusulas especiales'));
  pillAt(g, 150, 470, 'Presentación de Osinergmin', S('e7b'), { bg: 'var(--blT)', s: 28 });
  const al = `<span style="display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--no);margin-right:14px;vertical-align:middle">${ic('alert', '#fff', 2.6).replace('<svg', '<svg width="26" height="26"')}</span>`;
  pillAt(g, 150, 570, al + 'Restringen la cobertura', W('e7b', 'restringen'), { s: 32 });
  pillAt(g, 150, 670, al + 'Condicionan su efectividad', W('e7b', 'condicionan'), { s: 32 });
  para(g, 154, 780, 800, 'al cumplimiento de ciertas obligaciones', W('e7b', 'cumplimiento', -0.3), { s: 30 });
  // e7c + e7d: qué revisar
  g = beat(c, S('e7c') - 0.2, fin('e7d'));
  head(g, S('e7c'), 'Revisar las condiciones que puedan afectar / la cobertura *durante las operaciones*', { s: 56 });
  const b7 = badge(g, 150, 360, 280, 'tanque', S('e7c') + 0.5, 'Consumidor directo de GLP', { lw: 420 });
  const p7a = pillAt(g, 560, 420, 'Condiciones que pueden afectar la cobertura', W('e7c', 'condiciones', -0.2), { s: 34 });
  const p7b = pillAt(g, 560, 540, 'Durante el desarrollo de las operaciones', W('e7c', 'desarrollo', -0.2), { s: 34, bg: 'var(--yeT)' });
  out([b7, b7.nextSibling, p7a, p7b], S('e7d') - 0.4);
  const kl = dcard(g, 150, 330, 1100, 610, 'Puntos a revisar', 'Evaluación de las condiciones contractuales', 'supervision', 'var(--yeT)', S('e7d') - 0.1);
  [['Exclusiones', 'exclusiones'], ['Condiciones de mantenimiento de la cobertura', 'mantenimiento'], ['Límites por evento y agregado', 'límites'], ['Restitución de la suma asegurada', 'restitución']].forEach(([t, w], i) =>
    checkItem(kl, 44, 150 + i * 110, t, W('e7d', w), { w: 1000 }));
  badge(g, 1400, 380, 260, 'escudo', S('e7d') + 0.2, 'Cobertura vigente durante las operaciones', { lw: 420 });
  // e7e: compatibilidad con la normativa
  g = beat(c, S('e7e') - 0.2, fin('e7e'));
  head(g, S('e7e'), 'Condiciones *compatibles* con la normativa', { a: 'center', x: 0, w: 1920, y: 160, s: 64 });
  const kA = dcard(g, 150, 380, 560, 320, 'Condiciones contractuales', 'de la póliza', 'clausula', 'var(--orT)', W('e7e', 'condiciones contractuales', -0.4), { x: -120, y: 0 });
  kA.querySelector('.rows').innerHTML = '<div style="font-size:28px;font-weight:600;color:var(--mut);margin-top:18px;line-height:1.35">Coberturas, límites, exclusiones y cláusulas especiales</div>';
  badge(g, 830, 390, 260, 'balanza', W('e7e', 'incompatibles', -0.4));
  const kB = dcard(g, 1210, 380, 560, 320, 'Exigencias normativas', 'aplicables a la actividad', 'normativa', 'var(--blT)', W('e7e', 'exigencias normativas', -0.4), { x: 120, y: 0 });
  kB.querySelector('.rows').innerHTML = '<div style="font-size:28px;font-weight:600;color:var(--mut);margin-top:18px;line-height:1.35">D.S. N.º 01-94-EM y sus modificatorias</div>';
  stamp(g, 790, 760, 'COMPATIBLES', 'var(--ok)', W('e7e', 'actividad'), -4);
  // e7f: objetivo
  g = beat(c, S('e7f') - 0.2, fin('e7f'));
  head(g, S('e7f'), 'El *objetivo* de la revisión', { s: 64 });
  const q1 = card(g, 150, 300, 780, 420, `<div style="position:absolute;left:40px;top:40px;width:120px;height:120px">${ic9('escudo')}</div><div class="t" style="position:absolute;left:40px;top:200px;width:700px;font-size:44px;line-height:1.1">¿La protección contratada satisface los requisitos?</div>`, 'background:#fff');
  rise(q1, W('e7f', 'satisface', -0.6), { y: 160, r: -3 });
  const q2 = card(g, 990, 300, 780, 420, `<div style="position:absolute;left:40px;top:40px;width:120px;height:120px">${ic9('alerta')}</div><div class="t" style="position:absolute;left:40px;top:200px;width:700px;font-size:44px;line-height:1.1">¿Existen restricciones que comprometan su efectividad?</div>`, 'background:#fff');
  rise(q2, W('e7f', 'restricciones', -0.6), { y: 160, r: 3 });
  // e7g: texto completo vs carátula
  g = beat(c, S('e7g') - 0.2, fin('e7g'));
  head(g, S('e7g'), 'Revisar el *texto contractual completo*', { s: 64 });
  const t1 = card(g, 150, 300, 780, 470, `<div style="position:absolute;left:44px;top:40px;width:120px;height:120px">${ic9('clausula')}</div><div class="t" style="position:absolute;left:44px;top:190px;font-size:46px;line-height:1.1;width:680px">Texto contractual completo</div><div style="position:absolute;left:46px;top:310px;font-size:28px;font-weight:600;color:var(--mut);width:680px;line-height:1.3">Condiciones generales, particulares, especiales, exclusiones y anexos</div>`);
  rise(t1, W('e7g', 'texto contractual completo', -0.5), { y: 160, r: -3 });
  stamp(g, 470, 800, 'CORRECTO', 'var(--ok)', W('e7g', 'completo', 0.2), -4);
  const t2 = card(g, 990, 300, 780, 470, `<div style="position:absolute;left:44px;top:40px;width:120px;height:120px">${ic9('certificado')}</div><div class="t" style="position:absolute;left:44px;top:190px;font-size:46px;line-height:1.1;width:680px">Solo el certificado o la carátula</div><div style="position:absolute;left:46px;top:310px;font-size:28px;font-weight:600;color:var(--mut);width:680px;line-height:1.3">No muestra todas las condiciones ni las exclusiones</div>`);
  rise(t2, W('e7g', 'certificado', -0.5), { y: 160, r: 3 });
  stamp(g, 1290, 800, 'INSUFICIENTE', 'var(--no)', W('e7g', 'carátula'), -4);
})();

// ===================== 08 DOCUMENTACIÓN =====================
const ROUTE = { prog: [{ v: 0 }, { v: 0 }, { v: 0 }], segs: [], L: [], marker: null };
(() => {
  const c = scene('e8', '08', 'Documentación', r => texture(r));
  wipe(SC.e8[0]);
  chapter(c, SC.e8[0] + 0.25, '08', 'Documentación y prevención / de *observaciones*', '');
  let g = beat(c, S('e8a') - 0.2, fin('e8a'));
  head(g, S('e8a'), 'Una correcta *gestión documental*', { s: 68 });
  badge(g, 160, 330, 280, 'carpeta', S('e8a') + 0.4);
  checkItem(g, 520, 360, 'Reduce inconsistencias', W('e8a', 'reducir'), { s: 42, w: 1200 });
  checkItem(g, 520, 500, 'Facilita la evaluación de la póliza en trámites y supervisión', W('e8a', 'facilitar'), { s: 42, w: 1250 });
  // e8b: requisito TUPA
  g = beat(c, S('e8b') - 0.2, fin('e8b'));
  head(g, S('e8b'), 'La *copia de la póliza* es requisito documental', { s: 60 });
  const kt = dcard(g, 150, 300, 1050, 560, 'TUPA', 'Trámites de Registro de Hidrocarburos', 'normativa', 'var(--blT)', W('e8b', 'requisitos documentales', -0.6));
  checkItem(kt, 44, 160, 'Copia de la póliza de seguro', W('e8b', 'TUPA'), { w: 950, s: 38 });
  [0, 1, 2].forEach(i => el(kt, `<div class="ln" style="position:relative;width:${640 - i * 90}px;height:16px"></div>`, `left:116px;top:${300 + i * 70}px;opacity:.9`));
  pillAt(g, 1280, 420, 'Según la presentación', S('e8b') + 0.5, { bg: '#fff', s: 26 });
  // e8c: expediente anterior
  g = beat(c, S('e8c') - 0.2, fin('e8c'));
  head(g, S('e8c'), 'Si la póliza ya obra en un *expediente anterior*', { s: 60 });
  const ke = dcard(g, 150, 330, 640, 380, 'Expediente anterior', 'con la póliza', 'carpeta', 'var(--yeT)', W('e8c', 'expediente anterior', -0.5));
  ke.querySelector('.rows').innerHTML = '<div style="font-size:26px;font-weight:700;color:var(--mut);margin-top:24px">N.º de expediente</div><div class="t" style="font-size:58px;margin-top:8px">2025-XXXXXX</div>';
  arrow(g, 830, 520, 1080, 520, W('e8c', 'referencia', -0.3));
  const kn = dcard(g, 1120, 330, 650, 380, 'Nuevo trámite', 'Registro de Hidrocarburos', 'registro', 'var(--blT)', W('e8c', 'referencia'));
  kn.querySelector('.rows').innerHTML = '<div style="font-size:30px;font-weight:800;margin-top:26px;line-height:1.3">Referencia al número del expediente anterior</div>';
  para(g, 154, 780, 1600, 'Conforme al criterio descrito en el material de Osinergmin', W('e8c', 'criterio', -0.4), { s: 30 });
  // e8d: certificados no sustituyen la póliza
  g = beat(c, S('e8d') - 0.2, fin('e8d'));
  head(g, S('e8d'), 'Certificados y constancias de seguro', { s: 60 });
  badge(g, 230, 320, 260, 'certificado', S('e8d') + 0.3, 'Certificado o constancia', { lw: 420 });
  pillAt(g, 600, 400, '≠', W('e8d', 'no sustituyen', -0.2), { bg: 'var(--no)', c: '#fff', s: 60 });
  badge(g, 820, 320, 260, 'poliza', W('e8d', 'póliza', -0.3), 'Póliza (requisito documental)', { lw: 460 });
  stamp(g, 1240, 360, 'NO LA SUSTITUYE', 'var(--no)', W('e8d', 'automáticamente'), -6);
  checkItem(g, 1210, 560, 'Pueden presentarse de manera adicional', W('e8d', 'adicional'), { w: 580, s: 32 });
  // e8e: carpeta ordenada
  g = beat(c, S('e8e') - 0.2, fin('e8e'));
  head(g, S('e8e'), 'Mantener *identificados*', { s: 64 });
  const kf = dcard(g, 150, 290, 1100, 620, 'Expediente de la instalación', 'Consumidor directo de GLP', 'carpeta', 'var(--orT)', S('e8e') + 0.3);
  [['La póliza', 'póliza'], ['Sus adendas', 'adendas'], ['Documentos complementarios que sustentan la cobertura', 'complementarios']].forEach(([t, w], i) => checkItem(kf, 44, 160 + i * 130, t, W('e8e', w), { w: 1000, s: 36 }));
  // e8f + e8g: ruta y verificación final
  g = beat(c, S('e8f') - 0.3, fin('e8g'));
  head(g, S('e8f'), 'Antes del expediente o la supervisión: / *contrastar con el Registro*', { y: 140, s: 58 });
  const NV = '#0A1F4F';
  const M = [[260, 720, 'solicitud', 'Expediente'], [760, 470, 'poliza', 'Póliza'], [1260, 740, 'registro', 'Registro'], [1700, 480, 'supervision', 'Supervisión']];
  const SEG = ['M260 720 C480 720 540 470 760 470', 'M760 470 C980 470 1040 740 1260 740', 'M1260 740 C1480 740 1480 480 1700 480'];
  const sv = el(g, `<svg width="1920" height="1080" fill="none">${SEG.map(d => `<path d="${d}" stroke="${NV}" stroke-width="30" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-width="17" stroke-linecap="round"/>`).join('')}${SEG.map(d => `<path class="rf" d="${d}" stroke="#FF7A00" stroke-width="17" stroke-linecap="round"/>`).join('')}</svg>`, 'left:0;top:0');
  hide(sv); tl.to(sv, { autoAlpha: 1, duration: 0.5 }, S('e8f') + 0.3);
  ROUTE.segs = [...sv.querySelectorAll('.rf')]; ROUTE.L = ROUTE.segs.map(p => p.getTotalLength());
  const nodes = M.map(([x, y, n, l], i) => badge(g, x - 95, y - 95, 190, n, S('e8f') + 0.5 + i * 0.3, l, { lw: 320 }));
  ROUTE.marker = el(g, `<svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="44" fill="#FF7A00" stroke="${NV}" stroke-width="6"/><path d="M33 26 H60 L70 36 V74 H33 Z" fill="#fff" stroke="${NV}" stroke-width="5" stroke-linejoin="round"/></svg>`, 'left:0;top:0;width:96px;height:96px;margin:-48px 0 0 -48px');
  hide(ROUTE.marker); tl.to(ROUTE.marker, { autoAlpha: 1, duration: 0.3 }, S('e8f') + 0.9);
  const tS = [S('e8f') + 1.2, W('e8f', 'supervisión', -0.4), W('e8f', 'contrastar')];
  ROUTE.prog.forEach((o, i) => { tl.to(o, { v: 1, duration: 1.5, ease: 'power1.inOut' }, tS[i]); mark(g, M[i + 1][0] + 40, M[i + 1][1] - 120, true, tS[i] + 1.5); });
  mark(g, M[0][0] + 40, M[0][1] - 120, true, S('e8f') + 1.0);
  tl.to([sv, ...nodes, ...g.querySelectorAll('.cap,.mark'), ROUTE.marker], { autoAlpha: 0.12, duration: 0.5 }, S('e8g') - 0.3);
  const cl = dcard(g, 560, 300, 800, 600, 'Documentación ⇄ Registro', 'Verificar que no existan diferencias', 'supervision', 'var(--blT)', S('e8g') - 0.2, { y: 200 });
  [['Identidad del titular', 'titular'], ['Actividad', 'actividad'], ['Ubicación', 'ubicación'], ['Monto asegurado', 'monto asegurado']].forEach(([t, w], i) => checkItem(cl, 44, 150 + i * 105, t, W('e8g', w), { w: 700, s: 38 }));
})();

// ===================== 09 CONCLUSIONES =====================
(() => {
  const c = scene('e9', '09', 'Conclusiones', r => photo(r, F4, 'soft', '70% center'));
  wipe(SC.e9[0]);
  chapter(c, SC.e9[0] + 0.25, '09', 'Conclusiones y / *mensaje final*', '');
  let g = beat(c, S('e9a') - 0.2, fin('e9a'));
  badge(g, 150, 170, 200, 'poliza', S('e9a') + 0.2);
  head(g, S('e9a') + 0.3, 'La gestión de la póliza RCE es parte / del *cumplimiento normativo*', { y: 420, s: 64 });
  para(g, 154, 620, 1200, 'para los agentes que desarrollan actividades de hidrocarburos', W('e9a', 'agentes', -0.4), { s: 36 });
  // e9b + e9c: puntos de control
  g = beat(c, S('e9b') - 0.2, fin('e9c'));
  head(g, S('e9b'), 'Puntos de *control*', { s: 64, y: 130 });
  const k1 = dcard(g, 150, 250, 900, 720, 'Revisión de la póliza', 'Consumidor directo de GLP', 'supervision', 'var(--yeT)', S('e9b') + 0.2);
  [['Identificación del titular asegurado', 'identificación del titular'], ['Vigencia de la póliza', 'vigencia'], ['Correspondencia de la actividad', 'correspondencia de la actividad'], ['Ubicación del riesgo', 'ubicación del riesgo'], ['Alcance de las coberturas', 'alcance'], ['Suficiencia del monto asegurado', 'suficiencia']].forEach(([t, w], i) =>
    checkItem(k1, 40, 140 + i * 92, t, W('e9b', w), { w: 820, s: 32 }));
  const k2 = dcard(g, 1110, 250, 660, 500, 'Además, examinar', 'Condiciones del seguro', 'clausula', 'var(--orT)', S('e9c') - 0.1, { x: 150, y: 0 });
  [['Condiciones especiales', 'condiciones especiales'], ['Exclusiones', 'exclusiones'], ['Cláusulas que limitan o condicionan', 'cláusulas']].forEach(([t, w], i) => checkItem(k2, 40, 150 + i * 100, t, W('e9c', w), { w: 580, s: 30 }));
  // e9d: documentación coherente
  g = beat(c, S('e9d') - 0.2, fin('e9d'));
  head(g, S('e9d'), 'Documentación *ordenada y coherente*', { a: 'center', x: 0, w: 1920, y: 170, s: 66 });
  badge(g, 470, 380, 260, 'carpeta', S('e9d') + 0.3, 'Documentación', { lw: 400 });
  pillAt(g, 900, 470, '=', W('e9d', 'coherente'), { bg: 'var(--ok)', c: '#fff', s: 60 });
  badge(g, 1190, 380, 260, 'registro', W('e9d', 'Registro', -0.3), 'Registro de Hidrocarburos', { lw: 420 });
  // e9e: revisión preventiva
  g = beat(c, S('e9e') - 0.2, fin('e9e'));
  head(g, S('e9e'), 'Una revisión *preventiva* permite', { s: 64 });
  [['alerta', 'Identificar inconsistencias', 'identificar'], ['clausula', 'Gestionar a tiempo las correcciones', 'correcciones'], ['escudo', 'Fortalecer el cumplimiento', 'fortalecer']].forEach(([n, t, w], i) => {
    const k = card(g, 150 + i * 570, 330, 480, 470, `<div style="position:absolute;left:40px;top:40px;width:140px;height:140px">${ic9(n)}</div><div class="t" style="position:absolute;left:40px;top:220px;width:400px;font-size:42px;line-height:1.08">${t}</div><div class="t" style="position:absolute;right:30px;top:30px;font-size:60px;color:transparent;-webkit-text-stroke:3px var(--or)">0${i + 1}</div>`);
    rise(k, W('e9e', w, -0.4), { y: 160, r: i % 2 ? 3 : -3 });
    if (i < 2) arrow(g, 640 + i * 570, 565, 715 + i * 570, 565, W('e9e', w, 0.2));
  });
  // e9f: contribuye a…
  g = beat(c, S('e9f') - 0.2, fin('e9f'));
  head(g, S('e9f'), 'Una adecuada gestión del seguro *contribuye* a', { a: 'center', x: 0, w: 1920, y: 170, s: 62 });
  [['instalaciones', 'Una operación responsable', 'operación responsable'], ['terceros', 'La protección de terceros', 'protección de terceros'], ['escudo', 'Una mejor administración de los riesgos', 'administración']].forEach(([n, l, w], i) =>
    badge(g, 300 + i * 500, 400, 240, n, W('e9f', w, -0.3), l, { lw: 440, ls: 34 }));
  // e9g: mensaje final
  g = beat(c, S('e9g') - 0.2, SC.e9[1] + 0.3);
  [['poliza'], ['terceros'], ['ambiente']].forEach(([n], i) => badge(g, 760 + i * 150, 150, 110, n, S('e9g') + 0.4 + i * 0.2));
  head(g, S('e9g') + 0.1, 'La prevención comienza / con el *conocimiento*', { a: 'center', x: 0, w: 1920, y: 330, s: 104 });
  para(g, 260, 620, 1400, 'y se fortalece con una gestión rigurosa de los riesgos y de las coberturas contratadas', W('e9g', 'fortalece', -0.4), { a: 'center', s: 38 });
})();

// ===================== CIERRE =====================
photo(B(SC.outro[0], SC.outro[1] + 2), F6, 'top');
(() => {
  const c = scene('outro');
  const end = el(c, `<div class="pill" style="position:relative;display:inline-block;background:var(--orT);margin-bottom:34px">Capacitación · Consumidor directo de GLP</div><div class="t" style="font-size:88px">Pólizas de Responsabilidad<br>Civil Extracontractual</div>`, 'left:0;top:360px;width:1920px;text-align:center');
  rise(end, SC.outro[0] + 0.3, { y: 80 });
  tl.to('#stage', { opacity: 0, duration: 1 }, TOTAL - 1);
})();

tl.to('#prog i', { scaleX: 1, duration: TOTAL, ease: 'none' }, 0);
tl.to({}, { duration: 0.01 }, TOTAL);
function applyRoute() {
  if (!ROUTE.marker || !ROUTE.segs.length) return;
  ROUTE.segs.forEach((p, i) => { p.style.strokeDasharray = `${ROUTE.L[i]} ${ROUTE.L[i]}`; p.style.strokeDashoffset = ROUTE.L[i] * (1 - ROUTE.prog[i].v); });
  let i = ROUTE.prog.findIndex(o => o.v < 1); if (i < 0) i = 2;
  const pt = ROUTE.segs[i].getPointAtLength(ROUTE.L[i] * ROUTE.prog[i].v);
  ROUTE.marker.style.left = pt.x + 'px'; ROUTE.marker.style.top = pt.y + 'px';
}
window.renderAt = t => { tl.time(t, false); applyRoute(); };
window.DURATION = TOTAL;
window.renderAt(0);
document.fonts.ready.then(() => { window.READY = true; });

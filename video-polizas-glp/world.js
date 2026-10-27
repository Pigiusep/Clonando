// "Toma" ilustrada de la instalación industrial de GLP, con cámara virtual.
// Coordenadas del mundo: 4400 x 1080, suelo en y=880.
const WORLD = (() => {
  const host = $('#world');
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080);
  svg.setAttribute('viewBox', '0 0 1920 1080');
  host.appendChild(svg);
  svg.innerHTML = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#071a45"/><stop offset=".7" stop-color="#16408f"/><stop offset="1" stop-color="#2a63c4"/></linearGradient>
    <linearGradient id="tank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e7eef9"/><stop offset="1" stop-color="#a9bad6"/></linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fb2d3"/><stop offset=".5" stop-color="#e9f0fb"/><stop offset="1" stop-color="#8ea2c6"/></linearGradient>
    <linearGradient id="boiler" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c4f95"/><stop offset=".5" stop-color="#4d7bd1"/><stop offset="1" stop-color="#22417e"/></linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2558"/><stop offset="1" stop-color="#061230"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#19D3FF" stop-opacity=".55"/><stop offset="1" stop-color="#19D3FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="fire"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#FFC93C"/><stop offset="1" stop-color="#FF7A1A"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#19D3FF" stop-opacity=".55"/><stop offset="1" stop-color="#19D3FF" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
  <g id="stars"></g>
  <g id="far"></g>
  <g id="cam"><g id="main"></g></g>
  `;
  const far = svg.querySelector('#far'), main = svg.querySelector('#main'), cam = svg.querySelector('#cam');
  const stars = svg.querySelector('#stars');
  let s = '';
  for (let i = 0; i < 70; i++) { const x = (i * 397) % 1920, y = (i * 211) % 520; s += `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.6}" fill="#cfe3ff" opacity="${0.25 + (i % 5) * 0.1}"/>`; }
  stars.innerHTML = s;

  // fondo lejano: siluetas industriales (parallax)
  let f = '';
  for (let i = 0; i < 26; i++) {
    const x = i * 260 - 400, h = 120 + ((i * 73) % 160), w = 180 + ((i * 41) % 90);
    f += `<rect x="${x}" y="${880 - h}" width="${w}" height="${h}" fill="#0f2c66"/>`;
    if (i % 3 === 0) f += `<rect x="${x + 30}" y="${880 - h - 120}" width="26" height="120" fill="#0f2c66"/>`;
    if (i % 4 === 1) f += `<path d="M${x} ${880 - h} l${w / 2} -50 l${w / 2} 50z" fill="#0f2c66"/>`;
    for (let j = 0; j < 3; j++) f += `<rect x="${x + 20 + j * 50}" y="${880 - h + 30}" width="22" height="14" fill="#2a5bb5" opacity=".5"/>`;
  }
  far.innerHTML = f;

  // ---------- escena principal ----------
  const G = 880;
  let m = '';
  // suelo con rejilla
  m += `<rect x="-2000" y="${G}" width="9000" height="600" fill="url(#ground)"/>`;
  for (let i = -20; i < 60; i++) m += `<path d="M${i * 150} ${G} L${i * 150 - 300 + i * 4} ${G + 300}" stroke="#19D3FF" stroke-opacity=".08" stroke-width="2"/>`;
  for (let j = 1; j < 6; j++) m += `<path d="M-2000 ${G + j * j * 9} H7000" stroke="#19D3FF" stroke-opacity="${0.12 - j * 0.015}" stroke-width="2"/>`;
  m += `<path d="M-2000 ${G} H7000" stroke="#19D3FF" stroke-opacity=".5" stroke-width="3"/>`;

  // losa de concreto del tanque y cerco perimetral
  m += `<rect x="380" y="${G - 14}" width="1060" height="22" fill="#8ea2c6"/>`;
  for (let x = 300; x < 2500; x += 60) m += `<rect x="${x}" y="${G - 140}" width="5" height="140" fill="#4a6aa6" opacity=".55"/>`;
  m += `<path d="M300 ${G - 140} H2500 M300 ${G - 70} H2500" stroke="#4a6aa6" stroke-width="3" opacity=".55"/>`;

  // camión cisterna (entra en escena 2)
  m += `<g id="truck" transform="translate(-900 0)">
    <rect x="-20" y="${G - 210}" width="360" height="150" rx="72" fill="url(#tank)" stroke="#8ea2c6" stroke-width="4"/>
    <rect x="-20" y="${G - 150}" width="360" height="22" fill="#FF7A1A"/>
    <text x="160" y="${G - 160}" font-family="M" font-weight="900" font-size="40" fill="#0B1F4D" text-anchor="middle">GLP</text>
    <rect x="-40" y="${G - 70}" width="520" height="22" fill="#2a3f6b"/>
    <path d="M350 ${G - 70} V${G - 190} H430 L480 ${G - 130} V${G - 70} Z" fill="#FF7A1A"/>
    <rect x="372" y="${G - 176}" width="54" height="44" rx="6" fill="#bfe9ff"/>
    <g fill="#13213f" stroke="#8ea2c6" stroke-width="6"><circle cx="40" cy="${G - 40}" r="34"/><circle cx="130" cy="${G - 40}" r="34"/><circle cx="410" cy="${G - 40}" r="34"/></g>
  </g>`;

  // tanque estacionario horizontal
  m += `<g id="tankG">
    <rect x="540" y="${G - 150}" width="60" height="140" fill="#6f85b0"/><rect x="1220" y="${G - 150}" width="60" height="140" fill="#6f85b0"/>
    <path d="M520 ${G - 60} h100 l-20 -90 h-60z M1200 ${G - 60} h100 l-20 -90 h-60z" fill="#5b729f"/>
    <rect x="440" y="${G - 360}" width="940" height="250" rx="125" fill="url(#tank)" stroke="#8ea2c6" stroke-width="4"/>
    <rect x="440" y="${G - 262}" width="940" height="16" fill="#FF7A1A" opacity=".9"/>
    <text x="910" y="${G - 186}" font-family="M" font-weight="900" font-size="88" fill="#0B1F4D" text-anchor="middle" letter-spacing="8">GLP</text>
    <g transform="translate(1200 ${G - 300})"><rect x="-34" y="-34" width="68" height="68" transform="rotate(45)" fill="#fff" stroke="#d11" stroke-width="5"/>
      <text y="-6" font-family="M" font-weight="900" font-size="22" fill="#d11" text-anchor="middle">2</text><text y="22" font-family="M" font-weight="900" font-size="16" fill="#0B1F4D" text-anchor="middle">INFL.</text></g>
    <rect x="640" y="${G - 300}" width="300" height="34" rx="6" fill="#0B1F4D"/>
    <text x="790" y="${G - 276}" font-family="M" font-weight="800" font-size="20" fill="#fff" text-anchor="middle">INFLAMABLE · NO FUMAR</text>
    <rect x="860" y="${G - 400}" width="40" height="44" fill="#8ea2c6"/><rect x="930" y="${G - 392}" width="28" height="36" fill="#8ea2c6"/>
    <rect x="850" y="${G - 410}" width="60" height="14" rx="4" fill="#FF7A1A"/>
    <g id="gauge1" transform="translate(620 ${G - 395})"><circle r="34" fill="#fff" stroke="#0B1F4D" stroke-width="6"/><path d="M-22 10 A24 24 0 1 1 22 10" fill="none" stroke="#FF3D5A" stroke-width="4"/><line id="needle1" x1="0" y1="0" x2="0" y2="-24" stroke="#0B1F4D" stroke-width="5" stroke-linecap="round"/><rect x="-6" y="34" width="12" height="26" fill="#8ea2c6"/></g>
  </g>`;

  // tuberías (base + flujo animado)
  const pipe = 'M1380 ' + (G - 160) + ' H1560 V' + (G - 300) + ' H1620 M1780 ' + (G - 300) + ' H1880 V' + (G - 240) + ' H2120 M2380 ' + (G - 240) + ' H2560 V' + (G - 320) + ' H2780';
  m += `<path d="${pipe}" fill="none" stroke="#7f95bf" stroke-width="30" stroke-linejoin="round"/>`;
  m += `<path d="${pipe}" fill="none" stroke="#c9d6ea" stroke-width="18" stroke-linejoin="round"/>`;
  m += `<path id="flow" d="${pipe}" fill="none" stroke="#19D3FF" stroke-width="8" stroke-dasharray="26 34" stroke-linecap="round" stroke-linejoin="round"/>`;
  // válvulas
  [[1470, G - 160], [1840, G - 300], [2480, G - 240], [2660, G - 320]].forEach(([x, y]) => {
    m += `<g transform="translate(${x} ${y})"><rect x="-22" y="-26" width="44" height="52" rx="6" fill="#FF7A1A"/><rect x="-4" y="-56" width="8" height="30" fill="#0B1F4D"/><rect x="-30" y="-64" width="60" height="12" rx="6" fill="#d11"/></g>`;
  });

  // vaporizador
  m += `<g id="vapG"><rect x="1620" y="${G - 470}" width="160" height="460" rx="12" fill="url(#metal)" stroke="#6f85b0" stroke-width="4"/>`;
  for (let i = 0; i < 12; i++) m += `<rect x="1636" y="${G - 440 + i * 34}" width="128" height="10" rx="4" fill="#6f85b0" opacity=".7"/>`;
  m += `<rect x="1640" y="${G - 500}" width="120" height="34" rx="6" fill="#0B1F4D"/><text x="1700" y="${G - 476}" font-family="M" font-weight="800" font-size="18" fill="#19D3FF" text-anchor="middle">VAP-01</text>
    <circle id="vapLed" cx="1760" cy="${G - 520}" r="10" fill="#14C77B"/></g>`;

  // estación de regulación
  m += `<g id="regG"><rect x="2110" y="${G - 330}" width="280" height="320" rx="14" fill="#0e2a63" stroke="#19D3FF" stroke-opacity=".5" stroke-width="3"/>`;
  [[2180, G - 240], [2320, G - 240]].forEach(([x, y], i) => {
    m += `<g transform="translate(${x} ${y})"><rect x="-40" y="-20" width="80" height="40" rx="8" fill="#FFC93C"/><path d="M-30 -20 Q0 -80 30 -20" fill="#FFC93C"/>
      <g transform="translate(0 -96)"><circle r="28" fill="#fff" stroke="#0B1F4D" stroke-width="5"/><line class="ndl" id="needleR${i}" x1="0" y1="0" x2="0" y2="-20" stroke="#0B1F4D" stroke-width="4" stroke-linecap="round"/></g></g>`;
  });
  m += `<text x="2250" y="${G - 40}" font-family="M" font-weight="800" font-size="22" fill="#19D3FF" text-anchor="middle">REGULACIÓN</text></g>`;

  // equipo de consumo: caldero industrial
  m += `<g id="boilG"><rect x="2780" y="${G - 420}" width="520" height="410" rx="40" fill="url(#boiler)" stroke="#19D3FF" stroke-opacity=".35" stroke-width="4"/>
    <rect x="3120" y="${G - 760}" width="70" height="350" fill="#2c4f95"/><rect x="3110" y="${G - 780}" width="90" height="26" fill="#FF7A1A"/>
    <rect x="2850" y="${G - 300}" width="190" height="130" rx="16" fill="#061230"/>
    <ellipse id="flame" cx="2945" cy="${G - 228}" rx="70" ry="42" fill="url(#fire)"/>
    <rect x="3080" y="${G - 360}" width="160" height="60" rx="8" fill="#061230"/><text x="3160" y="${G - 320}" font-family="M" font-weight="800" font-size="26" fill="#14C77B" text-anchor="middle" id="boilTxt">85 °C</text>
    <text x="3040" y="${G - 80}" font-family="M" font-weight="800" font-size="24" fill="#fff" text-anchor="middle" opacity=".85">CALDERO · EQUIPO DE CONSUMO</text>
    <g id="smoke"></g></g>`;

  // cerco exterior y terceros (viviendas y personas)
  m += `<g id="terceros">`;
  for (let x = 3420; x < 4500; x += 50) m += `<rect x="${x}" y="${G - 120}" width="6" height="120" fill="#4a6aa6"/>`;
  m += `<path d="M3420 ${G - 118} H4500" stroke="#4a6aa6" stroke-width="4"/>`;
  [[3560, 260, '#f0b44c'], [3860, 220, '#e36a5a'], [4120, 300, '#5ac1a6']].forEach(([x, h, c]) => {
    m += `<rect x="${x}" y="${G - h}" width="220" height="${h}" fill="${c}"/><path d="M${x - 20} ${G - h} L${x + 110} ${G - h - 90} L${x + 240} ${G - h}Z" fill="#7b2f2f"/>
      <rect x="${x + 30}" y="${G - h + 40}" width="50" height="50" fill="#fff6c9"/><rect x="${x + 130}" y="${G - h + 40}" width="50" height="50" fill="#fff6c9"/><rect x="${x + 85}" y="${G - 90}" width="50" height="90" fill="#3b2a20"/>`;
  });
  [[3700, '#FFC93C'], [3760, '#19D3FF'], [4040, '#FF7A1A'], [4330, '#14C77B']].forEach(([x, c], i) => {
    m += `<g class="pers" id="pers${i}" transform="translate(${x} ${G})"><circle cy="-128" r="18" fill="#e8b48a"/><rect x="-18" y="-108" width="36" height="62" rx="12" fill="${c}"/><rect x="-14" y="-48" width="11" height="48" fill="#13213f"/><rect x="3" y="-48" width="11" height="48" fill="#13213f"/></g>`;
  });
  m += `</g>`;

  // inspector (profesional con casco y tablet)
  m += `<g id="insp" transform="translate(1960 ${G})">
    <ellipse cx="0" cy="4" rx="70" ry="12" fill="#000" opacity=".3"/>
    <path id="beamP" d="M-40 -200 L-420 -330 L-420 -90 Z" fill="url(#beam)" opacity="0" transform="scale(-1 1)"/>
    <rect x="-34" y="-150" width="28" height="150" rx="10" fill="#13213f"/><rect x="6" y="-150" width="28" height="150" rx="10" fill="#13213f"/>
    <rect x="-40" y="-14" width="36" height="16" rx="6" fill="#3b2a20"/><rect x="4" y="-14" width="36" height="16" rx="6" fill="#3b2a20"/>
    <g id="torso"><rect x="-50" y="-310" width="100" height="170" rx="30" fill="#1F4BA8"/>
      <path d="M-50 -280 Q-50 -310 -20 -310 H20 Q50 -310 50 -280 V-150 H-50Z" fill="#FF7A1A"/>
      <rect x="-50" y="-230" width="100" height="12" fill="#e8f2ff"/><rect x="-50" y="-190" width="100" height="12" fill="#e8f2ff"/>
      <rect x="-10" y="-310" width="20" height="160" fill="#1F4BA8"/>
      <g id="arm"><rect x="38" y="-300" width="26" height="110" rx="12" fill="#1F4BA8" transform="rotate(-50 50 -296)"/>
        <g transform="translate(78 -268) rotate(-8)"><rect x="-4" y="-50" width="66" height="92" rx="8" fill="#0B1F4D"/><rect id="tabScr" x="4" y="-42" width="50" height="76" rx="4" fill="#19D3FF"/>
          <path d="M12 -20 h34 M12 -6 h26 M12 8 h30" stroke="#0B1F4D" stroke-width="4"/></g></g>
      <rect x="-64" y="-300" width="26" height="130" rx="12" fill="#1F4BA8"/></g>
    <g id="head"><circle cy="-350" r="38" fill="#e8b48a"/><path d="M-44 -360 Q-44 -410 0 -412 Q44 -410 44 -360 Z" fill="#FFC93C"/><rect x="-52" y="-366" width="104" height="12" rx="6" fill="#f2b600"/>
      <circle cx="14" cy="-348" r="4" fill="#13213f"/></g>
  </g>`;

  // etiquetas (callouts) dentro del mundo
  m += `<g id="callouts"></g>`;
  main.innerHTML = m;

  const callouts = main.querySelector('#callouts');
  function callout(id, x, y, label, dir = 1, color = '#FF7A1A') {
    const g = document.createElementNS(SVGNS, 'g');
    g.id = 'co-' + id;
    const lx = x + dir * 110, ly = y - 120;
    const w = label.length * 17 + 50;
    g.innerHTML = `<circle cx="${x}" cy="${y}" r="16" fill="${color}"/><circle class="ring" cx="${x}" cy="${y}" r="16" fill="none" stroke="${color}" stroke-width="4"/>
      <path class="ln" d="M${x} ${y} L${lx} ${ly} H${lx + dir * 40}" fill="none" stroke="#fff" stroke-width="4"/>
      <g class="lb"><rect x="${dir > 0 ? lx + 40 : lx - 40 - w}" y="${ly - 32}" width="${w}" height="64" rx="10" fill="#fff"/>
      <text x="${dir > 0 ? lx + 40 + w / 2 : lx - 40 - w / 2}" y="${ly + 11}" font-family="M" font-weight="800" font-size="30" fill="#0B1F4D" text-anchor="middle">${label}</text></g>`;
    callouts.appendChild(g);
    return g;
  }

  // cámara: x,y = punto del mundo al centro de pantalla, z = zoom
  const camS = { x: 2000, y: 600, z: 0.45, rot: 0 };
  function shot(t, x, y, z, d = 1.4, ease = 'power3.inOut') { tl.to(camS, { x, y, z, duration: d, ease }, t); }
  function cut(t, x, y, z) { tl.set(camS, { x, y, z }, t); }
  function applyCam() {
    cam.setAttribute('transform', `translate(960 540) scale(${camS.z}) rotate(${camS.rot}) translate(${-camS.x} ${-camS.y})`);
    far.setAttribute('transform', `translate(${960 - camS.x * 0.25 * camS.z} ${540 - 600 * camS.z * 0.6}) scale(${0.6 + camS.z * 0.35})`);
  }

  // animación ambiental (función pura del tiempo)
  const flow = main.querySelector('#flow'), n1 = main.querySelector('#needle1');
  const nr = [...main.querySelectorAll('.ndl')], flame = main.querySelector('#flame');
  const smoke = main.querySelector('#smoke'), led = main.querySelector('#vapLed');
  const head = main.querySelector('#head'), arm = main.querySelector('#arm'), torso = main.querySelector('#torso');
  const tab = main.querySelector('#tabScr'), beam = main.querySelector('#beamP');
  const pers = [...main.querySelectorAll('.pers')];
  let sm = '';
  for (let i = 0; i < 7; i++) sm += `<circle class="pf" r="30" fill="#c9d6ea"/>`;
  smoke.innerHTML = sm;
  const puffs = [...smoke.querySelectorAll('.pf')];
  const st = { beam: 0, walk: 0 };
  function ambient(t) {
    flow.setAttribute('stroke-dashoffset', -t * 120);
    n1.setAttribute('transform', `rotate(${20 + Math.sin(t * 1.7) * 8 + Math.sin(t * 5.3) * 2})`);
    nr.forEach((n, i) => n.setAttribute('transform', `rotate(${-30 + i * 50 + Math.sin(t * 2.1 + i) * 6})`));
    const fl = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.1) * 0.06;
    flame.setAttribute('transform', `translate(2945 ${G - 228}) scale(${fl} ${2 - fl}) translate(-2945 ${-(G - 228)})`);
    puffs.forEach((p, i) => {
      const k = ((t * 0.25 + i / puffs.length) % 1);
      p.setAttribute('cx', 3155 + Math.sin(k * 6 + i) * 30 + k * 160);
      p.setAttribute('cy', G - 790 - k * 380);
      p.setAttribute('r', 24 + k * 70);
      p.setAttribute('opacity', (0.5 * (1 - k)).toFixed(3));
    });
    led.setAttribute('opacity', (Math.sin(t * 6) > 0 ? 1 : 0.35));
    head.setAttribute('transform', `rotate(${Math.sin(t * 0.9) * 3} 0 -320)`);
    torso.setAttribute('transform', `translate(0 ${Math.sin(t * 1.8) * 2})`);
    arm.setAttribute('transform', `rotate(${Math.sin(t * 1.2) * 2} 50 -296)`);
    tab.setAttribute('opacity', 0.75 + Math.sin(t * 4) * 0.25);
    beam.setAttribute('opacity', st.beam * (0.6 + Math.sin(t * 9) * 0.25));
    pers.forEach((p, i) => p.setAttribute('transform', `translate(${[3700, 3760, 4040, 4330][i] + Math.sin(t * 0.6 + i * 2) * 40} ${G + Math.abs(Math.sin(t * 3 + i)) * -4})`));
  }
  tickers.push(t => { applyCam(); ambient(t); });

  return { svg, main, cam: camS, shot, cut, callout, st, el: id => main.querySelector('#' + id) };
})();

// callout con animación de aparición
function showCallout(id, x, y, label, t, dur, dir = 1, color) {
  const g = WORLD.callout(id, x, y, label, dir, color);
  const ln = g.querySelector('.ln'), lb = g.querySelector('.lb'), ring = g.querySelector('.ring');
  gsap.set(g, { autoAlpha: 0 });
  tl.set(g, { autoAlpha: 1 }, t);
  draw(ln, t, 0.45, 'power2.out');
  gsap.set(lb, { autoAlpha: 0, scale: 0.4, transformOrigin: `${x + dir * 150}px ${y - 120}px` });
  tl.to(lb, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, t + 0.3);
  tl.fromTo(ring, { attr: { r: 16 }, opacity: 1 }, { attr: { r: 70 }, opacity: 0, duration: 1.2, ease: 'power2.out', repeat: 2, immediateRender: false }, t);
  if (dur) tl.to(g, { autoAlpha: 0, duration: 0.35 }, t + dur);
  return g;
}

// fondo animado (partículas + rejilla) en canvas
(() => {
  const c = $('#bg'), g = c.getContext('2d');
  const P = Array.from({ length: 90 }, (_, i) => ({ x: (i * 733) % 1920, y: (i * 389) % 1080, s: 1 + (i % 4), v: 10 + (i % 7) * 6 }));
  tickers.push(t => {
    const gr = g.createLinearGradient(0, 0, 1920, 1080);
    gr.addColorStop(0, '#071436'); gr.addColorStop(1, '#0d2a6b');
    g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
    g.strokeStyle = 'rgba(25,211,255,0.07)'; g.lineWidth = 1;
    const off = (t * 30) % 80;
    for (let x = -80 + off; x < 1920; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1080); g.stroke(); }
    for (let y = -80 + off; y < 1080; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke(); }
    P.forEach(p => {
      const y = (p.y - t * p.v) % 1080, yy = y < 0 ? y + 1080 : y;
      g.fillStyle = `rgba(25,211,255,${0.15 + p.s * 0.08})`;
      g.beginPath(); g.arc(p.x + Math.sin(t + p.y) * 20, yy, p.s, 0, 6.283); g.fill();
    });
    // destello diagonal suave
    const sx = ((t * 260) % 3800) - 900;
    const lg = g.createLinearGradient(sx, 0, sx + 500, 300);
    lg.addColorStop(0, 'rgba(31,107,255,0)'); lg.addColorStop(0.5, 'rgba(31,107,255,0.12)'); lg.addColorStop(1, 'rgba(31,107,255,0)');
    g.fillStyle = lg; g.fillRect(0, 0, 1920, 1080);
  });
})();

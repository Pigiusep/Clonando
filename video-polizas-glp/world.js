// "Toma" ilustrada de la instalación industrial de GLP, con cámara virtual.
// Coordenadas del mundo: ~4400 x 1080, suelo en y=880. Paleta Solgas (tokens.css).
const WORLD = (() => {
  const G = 880;
  const host = $('#world');
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080);
  svg.setAttribute('viewBox', '0 0 1920 1080');
  host.appendChild(svg);

  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  svg.innerHTML = `
  <defs>
    ${lg('sky', [[0, '#040C22'], [.35, '#0A1F4F'], [.62, '#0047BB'], [.84, '#3D7BE0'], [.95, '#FFB27A'], [1, '#FF8A1C']])}
    ${lg('sunG', [[0, '#FFD36B'], [.6, '#FFB81C'], [1, '#FF7A00']])}
    ${lg('mt1', [[0, '#173A86'], [1, '#0B2460']])}
    ${lg('mt2', [[0, '#0E2C6E'], [1, '#081A47']])}
    ${lg('tankB', [[0, '#C9D6EC'], [.12, '#FFFFFF'], [.38, '#F3F7FD'], [.72, '#C2D0E8'], [.9, '#8EA3C9'], [1, '#A9BADB']])}
    ${lg('capL', [[0, '#8EA3C9'], [.55, '#E9F0FB'], [1, '#FFFFFF']], 1, 0)}
    ${lg('capR', [[0, '#FFFFFF'], [.45, '#D5E0F2'], [1, '#7F95BF']], 1, 0)}
    ${lg('pipeH', [[0, '#B98400'], [.22, '#FFE07A'], [.5, '#FFC21C'], [1, '#9A6A00']])}
    ${lg('pipeV', [[0, '#9A6A00'], [.4, '#FFE07A'], [.65, '#FFC21C'], [1, '#B98400']], 1, 0)}
    ${lg('steel', [[0, '#5D739E'], [.45, '#C7D3EA'], [1, '#4B5F88']], 1, 0)}
    ${lg('steelH', [[0, '#C7D3EA'], [1, '#4B5F88']])}
    ${lg('cab', [[0, '#E6EDF8'], [.5, '#C3D0E6'], [1, '#93A6C9']], 1, 0)}
    ${lg('boil', [[0, '#3D7BE0'], [.2, '#7FA8EE'], [.45, '#0047BB'], [.85, '#0A2F80'], [1, '#123A8E']])}
    ${lg('boilEnd', [[0, '#0A2F80'], [.6, '#2C66CF'], [1, '#0047BB']], 1, 0)}
    ${lg('stack', [[0, '#3B4E78'], [.45, '#A8B7D6'], [1, '#2D3D63']], 1, 0)}
    ${lg('conc', [[0, '#A6B3CC'], [1, '#7A89A8']])}
    ${lg('concTop', [[0, '#C9D3E6'], [1, '#AEBBD4']])}
    ${lg('ground', [[0, '#14295C'], [.25, '#0C1E49'], [1, '#050F2A']])}
    ${lg('lampCone', [[0, '#FFE6A3', .32], [1, '#FFE6A3', 0]])}
    ${lg('beam', [[0, '#00A9E0', .5], [1, '#00A9E0', 0]], 1, 0)}
    ${lg('glass', [[0, '#9FE3FF'], [1, '#2B8FD6']])}
    ${lg('fire', [[0, '#FFF1B8'], [.4, '#FFB81C'], [1, '#FF5A00']])}
    ${lg('vest', [[0, '#FF9A2E'], [1, '#E86A00']])}
    ${lg('helmet', [[0, '#FFE07A'], [.5, '#FFC21C'], [1, '#D99A00']])}
    ${lg('truckT', [[0, '#DCE6F5'], [.2, '#FFFFFF'], [.7, '#C2D0E8'], [1, '#8EA3C9']])}
    <pattern id="chain" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 0 L18 18 M18 0 L0 18" stroke="#6F86B8" stroke-width="1.6" opacity=".55"/></pattern>
    <pattern id="tiles" width="120" height="40" patternUnits="userSpaceOnUse"><path d="M0 0 H120 M0 0 V40" stroke="#5E6F92" stroke-width="2" opacity=".5"/></pattern>
    <pattern id="hazard" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="#FFB81C"/><rect x="14" width="14" height="28" fill="#0B1530"/></pattern>
    <pattern id="louver" width="10" height="16" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="#8EA3C9"/><rect y="9" width="10" height="3" fill="#5D739E"/><rect y="12" width="10" height="4" fill="#D5E0F2"/></pattern>
  </defs>
  <rect width="1920" height="1080" fill="#040C22"/>
  <g id="skyG"><rect x="0" y="-40" width="1920" height="920" fill="url(#sky)"/></g>
  <g id="stars"></g>
  <g id="far"></g>
  <g id="mid"></g>
  <g id="cam"><g id="main"></g></g>`;
  const skyG = svg.querySelector('#skyG'), far = svg.querySelector('#far'), mid = svg.querySelector('#mid'), main = svg.querySelector('#main'), cam = svg.querySelector('#cam');
  let s = '';
  for (let i = 0; i < 90; i++) { const x = (i * 397) % 1920, y = (i * 211) % 470; s += `<circle cx="${x}" cy="${y}" r="${0.8 + (i % 3) * 0.6}" fill="#DCE8FF" opacity="${0.18 + (i % 5) * 0.1}"/>`; }
  svg.querySelector('#stars').innerHTML = s;

  // ---- fondo lejano: sol poniente + cerros (parallax lento) ----
  let f = `<circle cx="2050" cy="790" r="200" fill="url(#sunG)"/>`;
  f += `<path d="M-600 880 L-400 700 L-250 760 L-60 610 L150 740 L330 650 L560 760 L760 640 L980 735 L1200 600 L1420 720 L1640 630 L1880 760 L2100 660 L2350 760 L2600 680 L2900 880 Z" fill="url(#mt1)" opacity=".9"/>`;
  f += `<path d="M-600 880 L-380 780 L-150 820 L60 740 L300 810 L520 760 L760 830 L1000 770 L1260 830 L1500 780 L1760 840 L2020 790 L2300 850 L2600 800 L2900 880 Z" fill="url(#mt2)"/>`;
  far.innerHTML = f;

  // ---- plano medio: skyline industrial con ventanas encendidas ----
  let m2 = '';
  for (let i = 0; i < 30; i++) {
    if (i % 5 === 2 || i % 5 === 3) continue;   // huecos para ver cerros y sol
    const x = i * 230 - 700, h = 80 + ((i * 73) % 130), w = 150 + ((i * 41) % 90);
    m2 += `<rect x="${x}" y="${880 - h}" width="${w}" height="${h}" fill="#0B2257"/>`;
    m2 += `<rect x="${x}" y="${880 - h}" width="${w}" height="6" fill="#1B3F8C"/>`;
    if (i % 3 === 0) m2 += `<rect x="${x + 24}" y="${880 - h - 130}" width="22" height="130" fill="#0B2257"/><rect x="${x + 22}" y="${880 - h - 136}" width="26" height="8" fill="#FF7A00" opacity=".8"/>`;
    if (i % 4 === 1) m2 += `<path d="M${x} ${880 - h} l${w / 2} -46 l${w / 2} 46z" fill="#0B2257"/>`;
    for (let r = 0; r < Math.floor(h / 40); r++) for (let c = 0; c < Math.floor(w / 34); c++)
      if ((i * 7 + r * 3 + c * 5) % 4 === 0) m2 += `<rect x="${x + 12 + c * 34}" y="${880 - h + 22 + r * 40}" width="16" height="10" fill="#FFB81C" opacity="${0.35 + ((r + c) % 3) * 0.15}"/>`;
  }
  mid.innerHTML = m2;

  // ---------- helpers de dibujo ----------
  const pipeR = 17;
  function pipeH(x1, x2, y) {
    const a = Math.min(x1, x2), b = Math.max(x1, x2);
    return `<rect x="${a}" y="${y - pipeR}" width="${b - a}" height="${pipeR * 2}" fill="url(#pipeH)"/>`;
  }
  function pipeV(x, y1, y2) {
    const a = Math.min(y1, y2), b = Math.max(y1, y2);
    return `<rect x="${x - pipeR}" y="${a}" width="${pipeR * 2}" height="${b - a}" fill="url(#pipeV)"/>`;
  }
  const elbow = (x, y) => `<circle cx="${x}" cy="${y}" r="${pipeR + 3}" fill="url(#pipeH)"/><circle cx="${x}" cy="${y}" r="${pipeR + 3}" fill="none" stroke="#9A6A00" stroke-width="2"/>`;
  function flange(x, y, vert) {
    const w = 12, h = pipeR * 2 + 18;
    const r = vert ? `<rect x="${x - h / 2}" y="${y - w / 2}" width="${h}" height="${w}" rx="3" fill="#D9A400" stroke="#8A5E00" stroke-width="2"/>`
      : `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3" fill="#D9A400" stroke="#8A5E00" stroke-width="2"/>`;
    const bolts = vert ? [-1, 1].map(k => `<circle cx="${x + k * (h / 2 - 5)}" cy="${y}" r="3" fill="#5A3E00"/>`).join('')
      : [-1, 1].map(k => `<circle cx="${x}" cy="${y + k * (h / 2 - 5)}" r="3" fill="#5A3E00"/>`).join('');
    return r + bolts;
  }
  function valve(x, y, col = '#E5484D') {
    return `<g transform="translate(${x} ${y})">
      <path d="M-26 -20 L0 0 L-26 20 Z M26 -20 L0 0 L26 20 Z" fill="#2B3F6E" stroke="#16264D" stroke-width="2"/>
      <rect x="-5" y="-52" width="10" height="34" fill="#2B3F6E"/>
      <rect x="-30" y="-62" width="60" height="12" rx="6" fill="${col}"/><rect x="-30" y="-62" width="60" height="4" rx="2" fill="#fff" opacity=".35"/></g>`;
  }
  function gauge(x, y, r, id, stem = 26) {
    return `<g transform="translate(${x} ${y})"><rect x="-5" y="${r - 2}" width="10" height="${stem}" fill="url(#steel)"/>
      <circle r="${r + 4}" fill="#2B3F6E"/><circle r="${r}" fill="#fff"/>
      <path d="M${-r * .7} ${r * .45} A${r * .82} ${r * .82} 0 1 1 ${r * .7} ${r * .45}" fill="none" stroke="#12B76A" stroke-width="${r * .14}"/>
      <path d="M${r * .45} ${-r * .7} A${r * .82} ${r * .82} 0 0 1 ${r * .7} ${r * .45}" fill="none" stroke="#E5484D" stroke-width="${r * .14}"/>
      ${[...Array(9)].map((_, k) => { const an = (-225 + k * 33.75) * Math.PI / 180; return `<line x1="${Math.cos(an) * r * .62}" y1="${Math.sin(an) * r * .62}" x2="${Math.cos(an) * r * .78}" y2="${Math.sin(an) * r * .78}" stroke="#0B1530" stroke-width="1.6"/>`; }).join('')}
      <line ${id ? `id="${id}"` : 'class="ndl"'} x1="0" y1="0" x2="0" y2="${-r * .72}" stroke="#0B1530" stroke-width="${Math.max(2, r * .1)}" stroke-linecap="round"/>
      <circle r="${r * .12}" fill="#0B1530"/><path d="M${-r * .6} ${-r * .55} A${r * .85} ${r * .85} 0 0 1 ${r * .2} ${-r * .82}" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/></g>`;
  }
  const shadow = (cx, w, o = .35) => `<ellipse cx="${cx}" cy="${G + 6}" rx="${w}" ry="${w * 0.06 + 6}" fill="#000" opacity="${o}"/>`;
  function lamp(x, h) {
    return `<g><path d="M${x + 40} ${G - h + 20} L${x - 120} ${G} L${x + 200} ${G} Z" fill="url(#lampCone)"/>
      <rect x="${x - 4}" y="${G - h}" width="8" height="${h}" fill="#2B3F6E"/><path d="M${x} ${G - h} q20 -16 46 -6" stroke="#2B3F6E" stroke-width="7" fill="none"/>
      <rect x="${x + 30}" y="${G - h - 4}" width="34" height="12" rx="5" fill="#16264D"/><rect x="${x + 34}" y="${G - h + 6}" width="26" height="5" rx="2" fill="#FFE6A3"/></g>`;
  }
  function bollard(x) { return `<rect x="${x - 9}" y="${G - 70}" width="18" height="70" rx="4" fill="url(#hazard)"/><rect x="${x - 11}" y="${G - 74}" width="22" height="8" rx="4" fill="#FFB81C"/>`; }
  function tree(x, s = 1) {
    return `<g transform="translate(${x} ${G}) scale(${s})"><rect x="-7" y="-90" width="14" height="90" fill="#3B2A20"/>
      <circle cx="0" cy="-130" r="58" fill="#0F5B4F"/><circle cx="-34" cy="-104" r="40" fill="#0D4E44"/><circle cx="32" cy="-106" r="42" fill="#12695B"/><circle cx="10" cy="-150" r="34" fill="#178070"/></g>`;
  }

  // ---------- escena principal ----------
  let m = '';
  // suelo: asfalto + losa de concreto con canto
  m += `<rect x="-2600" y="${G}" width="9800" height="2600" fill="#050F2A"/><rect x="-2600" y="${G}" width="9800" height="600" fill="url(#ground)"/>`;
  m += `<rect x="-2600" y="${G}" width="9800" height="3" fill="#3D7BE0" opacity=".55"/>`;
  m += `<rect x="300" y="${G}" width="3150" height="34" fill="url(#concTop)"/><rect x="300" y="${G + 34}" width="3150" height="16" fill="#6F7F9F"/>`;
  m += `<rect x="300" y="${G}" width="3150" height="34" fill="url(#tiles)"/>`;
  m += `<rect x="300" y="${G + 12}" width="3150" height="5" fill="#FFB81C" opacity=".85"/>`;
  for (let x = -2400; x < 7000; x += 260) m += `<rect x="${x}" y="${G + 120}" width="130" height="10" fill="#C9D3E6" opacity=".25"/>`;
  m += `<rect x="-2600" y="${G + 230}" width="9800" height="14" fill="#C9D3E6" opacity=".55"/><rect x="-2600" y="${G + 244}" width="9800" height="60" fill="#5E6F92" opacity=".55"/><rect x="-2600" y="${G + 304}" width="9800" height="400" fill="#0B3B3A"/>`;
  for (let x = -2400; x < 7000; x += 180) m += `<ellipse cx="${x}" cy="${G + 312}" rx="${70 + (x % 50)}" ry="34" fill="#0F5B4F"/><ellipse cx="${x + 60}" cy="${G + 306}" rx="50" ry="26" fill="#12695B"/>`;

  // postes de luz y árboles de fondo
  [120, 1500, 2600, 3420].forEach(x => m += lamp(x, 420));
  m += tree(-300, 1.1) + tree(-120, .8) + tree(3330, .9);

  // cerco perimetral de la zona del tanque (malla)
  m += `<rect x="330" y="${G - 210}" width="1170" height="210" fill="url(#chain)"/>`;
  for (let x = 330; x <= 1500; x += 130) m += `<rect x="${x - 4}" y="${G - 220}" width="8" height="220" fill="#4D6699"/>`;
  m += `<rect x="330" y="${G - 222}" width="1170" height="6" fill="#4D6699"/>`;

  // letrero de seguridad
  m += `<g transform="translate(380 ${G - 330})"><rect x="8" y="80" width="8" height="250" fill="#4D6699"/><rect x="134" y="80" width="8" height="250" fill="#4D6699"/>
    <rect width="150" height="110" rx="8" fill="#FFB81C" stroke="#0B1530" stroke-width="4"/><path d="M75 14 L104 64 H46 Z" fill="#0B1530"/><path d="M75 28 L94 60 H56 Z" fill="#FFB81C"/>
    <rect x="72" y="36" width="6" height="14" fill="#0B1530"/><circle cx="75" cy="55" r="3" fill="#0B1530"/>
    <text x="75" y="84" font-family="M" font-weight="800" font-size="15" fill="#0B1530" text-anchor="middle">PELIGRO</text>
    <text x="75" y="101" font-family="M" font-weight="700" font-size="11" fill="#0B1530" text-anchor="middle">GAS INFLAMABLE</text></g>`;

  // camión cisterna (entra en escena 2)
  m += `<g id="truck" transform="translate(-900 0)">
    ${shadow(220, 300, .4)}
    <rect x="-40" y="${G - 78}" width="540" height="24" rx="4" fill="#1B2A4F"/>
    <rect x="-20" y="${G - 236}" width="380" height="160" rx="80" fill="url(#truckT)" stroke="#7F95BF" stroke-width="3"/>
    ${[60, 170, 280].map(x => `<rect x="${x}" y="${G - 236}" width="3" height="160" fill="#9FB0D0"/>`).join('')}
    <rect x="-20" y="${G - 168}" width="380" height="14" fill="#FF7A00"/><rect x="-20" y="${G - 154}" width="380" height="5" fill="#0047BB"/>
    <text x="170" y="${G - 186}" font-family="M" font-weight="800" font-size="40" fill="#0047BB" text-anchor="middle">GLP</text>
    <rect x="120" y="${G - 252}" width="100" height="18" rx="4" fill="#5D739E"/>
    <path d="M370 ${G - 78} V${G - 206} Q370 ${G - 216} 380 ${G - 216} H440 Q456 ${G - 216} 466 ${G - 200} L500 ${G - 140} V${G - 78} Z" fill="#0047BB"/>
    <path d="M388 ${G - 200} H440 L470 ${G - 146} H388 Z" fill="url(#glass)"/><path d="M398 ${G - 196} L420 ${G - 196} L400 ${G - 160}" fill="#fff" opacity=".35"/>
    <rect x="370" y="${G - 120}" width="130" height="10" fill="#FF7A00"/><rect x="490" y="${G - 110}" width="16" height="12" rx="3" fill="#FFE6A3"/>
    ${[40, 140, 420].map(x => `<g transform="translate(${x} ${G - 36})"><circle r="36" fill="#0B1530"/><circle r="22" fill="#9FB0D0"/><circle r="9" fill="#2B3F6E"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 15}" cy="${Math.sin(a * Math.PI / 180) * 15}" r="3" fill="#2B3F6E"/>`).join('')}</g>`).join('')}
  </g>`;

  // ---- tanque estacionario horizontal ----
  const TX1 = 470, TX2 = 1350, TY = 520, TH = 250, TC = TY + TH / 2;
  m += `<g id="tankG">${shadow(910, 520, .45)}
    ${[560, 1260].map(x => `<rect x="${x - 70}" y="${G - 70}" width="140" height="70" fill="url(#conc)"/><rect x="${x - 70}" y="${G - 76}" width="140" height="10" fill="url(#concTop)"/>
      <path d="M${x - 56} ${G - 76} L${x - 40} ${TY + TH - 30} H${x + 40} L${x + 56} ${G - 76} Z" fill="#2B3F6E"/><path d="M${x - 40} ${TY + TH - 30} Q${x} ${TY + TH + 2} ${x + 40} ${TY + TH - 30}" fill="#1B2A4F"/>`).join('')}
    <ellipse cx="${TX1}" cy="${TC}" rx="78" ry="${TH / 2}" fill="url(#capL)"/>
    <ellipse cx="${TX2}" cy="${TC}" rx="78" ry="${TH / 2}" fill="url(#capR)"/>
    <rect x="${TX1}" y="${TY}" width="${TX2 - TX1}" height="${TH}" fill="url(#tankB)"/>
    <path d="M${TX1} ${TY} Q${TX1 - 26} ${TC} ${TX1} ${TY + TH}" stroke="#A9BADB" stroke-width="3" fill="none"/><path d="M${TX2} ${TY} Q${TX2 + 26} ${TC} ${TX2} ${TY + TH}" stroke="#A9BADB" stroke-width="3" fill="none"/>
    ${[660, 910, 1160].map(x => `<rect x="${x}" y="${TY}" width="3" height="${TH}" fill="#A9BADB" opacity=".8"/>`).join('')}
    <rect x="${TX1}" y="${TY + 150}" width="${TX2 - TX1}" height="16" fill="#FF7A00"/><rect x="${TX1}" y="${TY + 166}" width="${TX2 - TX1}" height="6" fill="#0047BB"/>
    <text x="910" y="${TY + 128}" font-family="M" font-weight="800" font-size="92" fill="#0047BB" text-anchor="middle" letter-spacing="10">GLP</text>
    <rect x="720" y="${TY + 192}" width="380" height="30" rx="5" fill="#0B1530"/>
    <text x="910" y="${TY + 213}" font-family="M" font-weight="700" font-size="17" fill="#fff" text-anchor="middle" letter-spacing="2">INFLAMABLE · NO FUMAR</text>
    <g transform="translate(1195 ${TY + 82})"><g transform="rotate(45)"><rect x="-36" y="-36" width="36" height="36" fill="#E5484D"/><rect x="0" y="-36" width="36" height="36" fill="#FFB81C"/><rect x="-36" y="0" width="36" height="36" fill="#0047BB"/><rect x="0" y="0" width="36" height="36" fill="#fff"/><rect x="-36" y="-36" width="72" height="72" fill="none" stroke="#0B1530" stroke-width="3"/></g>
      <text y="-20" font-family="M" font-weight="800" font-size="20" fill="#fff" text-anchor="middle">4</text><text x="-22" y="8" font-family="M" font-weight="800" font-size="18" fill="#fff" text-anchor="middle">1</text><text x="22" y="8" font-family="M" font-weight="800" font-size="18" fill="#0B1530" text-anchor="middle">0</text></g>
    <rect x="${TX1 + 60}" y="${TY + 40}" width="92" height="56" rx="4" fill="#C9D3E6" stroke="#7F95BF" stroke-width="2"/>${[0, 1, 2, 3].map(k => `<rect x="${TX1 + 70}" y="${TY + 50 + k * 11}" width="${70 - k * 12}" height="4" fill="#7F95BF"/>`).join('')}
    <rect x="880" y="${TY - 36}" width="60" height="40" fill="url(#steel)"/><rect x="870" y="${TY - 44}" width="80" height="12" rx="4" fill="#5D739E"/>
    ${[790, 830].map(x => `<rect x="${x - 7}" y="${TY - 54}" width="14" height="56" fill="url(#steel)"/><rect x="${x - 13}" y="${TY - 66}" width="26" height="14" rx="6" fill="#FFB81C"/>`).join('')}
    <rect x="1010" y="${TY - 30}" width="40" height="34" fill="url(#steel)"/><circle cx="1030" cy="${TY - 40}" r="18" fill="#2B3F6E"/><circle cx="1030" cy="${TY - 40}" r="13" fill="#fff"/><path d="M1030 ${TY - 40} l6 -9" stroke="#E5484D" stroke-width="3"/>
    <g id="gauge1">${gauge(620, TY - 40, 32, 'needle1', 34)}</g>
    <path d="M${TX2 + 40} ${TY + 200} q40 40 10 ${G - TY - 200 - 20}" stroke="#12B76A" stroke-width="4" fill="none"/><rect x="${TX2 + 40}" y="${G - 22}" width="20" height="22" fill="#5D739E"/>
  </g>`;
  // bolardos y extintor frente al tanque
  [430, 700, 1120, 1450].forEach(x => m += bollard(x));
  m += `<g transform="translate(1540 ${G})">${shadow(0, 40, .3).replace(`cy="${G + 6}"`, 'cy="6"')}<rect x="-24" y="-140" width="48" height="128" rx="20" fill="#E5484D"/><rect x="-24" y="-140" width="14" height="128" rx="7" fill="#fff" opacity=".25"/>
    <rect x="-12" y="-160" width="24" height="22" fill="#0B1530"/><path d="M12 -152 q40 10 30 70" stroke="#0B1530" stroke-width="7" fill="none"/><rect x="-18" y="-100" width="36" height="34" rx="3" fill="#fff"/><text y="-78" font-family="M" font-weight="800" font-size="12" fill="#E5484D" text-anchor="middle">PQS</text></g>`;

  // ---- tuberías amarillas (GLP) con bridas y soportes ----
  const P = { a: [1350 + 70, G - 160], b: [1560, G - 160], c: [1560, G - 300], d: [1620, G - 300], e: [1780, G - 300], f: [1880, G - 300], g: [1880, G - 240], h: [2120, G - 240], i: [2380, G - 240], j: [2560, G - 240], k: [2560, G - 260], l: [2700, G - 260] };
  m += pipeH(P.a[0] - 40, P.b[0], P.a[1]) + pipeV(P.b[0], P.b[1], P.c[1]) + pipeH(P.c[0], P.d[0], P.c[1]);
  m += pipeH(P.e[0], P.f[0], P.e[1]) + pipeV(P.f[0], P.f[1], P.g[1]) + pipeH(P.g[0], P.h[0], P.g[1]);
  m += pipeH(P.i[0], P.j[0], P.i[1]) + pipeV(P.j[0], P.j[1], P.k[1]) + pipeH(P.k[0], P.l[0], P.k[1]);
  [P.b, P.c, P.f, P.g, P.j, P.k].forEach(([x, y]) => m += elbow(x, y));
  [[1440, G - 160, 0], [1600, G - 300, 0], [1800, G - 300, 0], [2100, G - 240, 0], [2400, G - 240, 0], [2680, G - 260, 0], [1560, G - 230, 1], [2560, G - 250, 1]].forEach(([x, y, v]) => m += flange(x, y, v));
  [[1500, G - 160], [2000, G - 240], [2470, G - 240], [2630, G - 260]].forEach(([x, y]) => {
    m += `<rect x="${x - 6}" y="${y + pipeR}" width="12" height="${G - y - pipeR}" fill="url(#steel)"/><rect x="${x - 24}" y="${y + pipeR}" width="48" height="8" fill="#5D739E"/><rect x="${x - 20}" y="${G - 10}" width="40" height="10" fill="#5D739E"/>`;
  });
  m += valve(1500, G - 160) + valve(1940, G - 240) + valve(2470, G - 240, '#0047BB') + valve(2630, G - 260);
  // flechas de sentido de flujo
  [[1690 - 140, G - 160 + 0], [2010, G - 240], [2620 - 120, G - 240]].forEach(([x, y]) => m += `<path d="M${x - 14} ${y - 8} L${x} ${y} L${x - 14} ${y + 8}" stroke="#0B1530" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  const route = `M${P.a[0] - 40} ${P.a[1]} H${P.b[0]} V${P.c[1]} H${P.d[0]} M${P.e[0]} ${P.e[1]} H${P.f[0]} V${P.g[1]} H${P.h[0]} M${P.i[0]} ${P.i[1]} H${P.j[0]} V${P.k[1]} H${P.l[0]}`;
  m += `<path id="flow" d="${route}" fill="none" stroke="#00A9E0" stroke-width="6" stroke-dasharray="18 40" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;

  // ---- vaporizador ----
  m += `<g id="vapG">${shadow(1700, 110)}
    <rect x="1610" y="${G - 20}" width="180" height="20" fill="#2B3F6E"/>
    <rect x="1620" y="${G - 470}" width="160" height="452" rx="10" fill="url(#cab)" stroke="#7F95BF" stroke-width="3"/>
    <rect x="1636" y="${G - 430}" width="128" height="250" rx="4" fill="url(#louver)"/>
    <path d="M1610 ${G - 470} L1640 ${G - 500} H1760 L1790 ${G - 470} Z" fill="#5D739E"/>
    <rect x="1640" y="${G - 160}" width="120" height="120" rx="8" fill="#16264D"/>
    <rect x="1652" y="${G - 148}" width="96" height="40" rx="4" fill="#06132F"/><text x="1700" y="${G - 120}" font-family="M" font-weight="800" font-size="20" fill="#12B76A" text-anchor="middle">60 °C</text>
    <circle id="vapLed" cx="1664" cy="${G - 82}" r="8" fill="#12B76A"/><circle cx="1690" cy="${G - 82}" r="8" fill="#FFB81C" opacity=".5"/><circle cx="1716" cy="${G - 82}" r="8" fill="#E5484D" opacity=".35"/>
    <rect x="1652" y="${G - 64}" width="96" height="14" rx="3" fill="#2B3F6E"/>
    <rect x="1650" y="${G - 530}" width="100" height="26" rx="5" fill="#0B1530"/><text x="1700" y="${G - 511}" font-family="M" font-weight="800" font-size="15" fill="#00A9E0" text-anchor="middle">VAPORIZADOR</text>
    <path d="M1790 ${G - 140} q30 0 30 40 v100" stroke="#5D739E" stroke-width="8" fill="none"/></g>`;

  // ---- estación de regulación (skid con techo) ----
  m += `<g id="regG">${shadow(2250, 170)}
    <rect x="2090" y="${G - 22}" width="320" height="22" fill="#2B3F6E"/><rect x="2090" y="${G - 22}" width="320" height="5" fill="#5D739E"/>
    ${[2100, 2400].map(x => `<rect x="${x - 5}" y="${G - 460}" width="10" height="440" fill="url(#steel)"/>`).join('')}
    <path d="M2070 ${G - 460} L2250 ${G - 520} L2430 ${G - 460} Z" fill="#0047BB"/><rect x="2070" y="${G - 462}" width="360" height="10" fill="#0A2F80"/>
    ${pipeH(2120, 2380, G - 240)}
    ${[2190, 2310].map((x, i) => `<g transform="translate(${x} ${G - 240})"><rect x="-30" y="-24" width="60" height="48" rx="8" fill="#2B3F6E"/>
      <path d="M-40 -24 Q-40 -96 0 -100 Q40 -96 40 -24 Z" fill="${i ? '#FF7A00' : '#FFB81C'}"/><path d="M-26 -30 Q-24 -80 -2 -86" stroke="#fff" stroke-width="5" fill="none" opacity=".45"/>
      <rect x="-8" y="-112" width="16" height="14" fill="#2B3F6E"/></g>
      ${gauge(x, G - 380, 26, 'needleR' + i, 30)}
      <rect x="${x - 46}" y="${G - 190}" width="92" height="24" rx="4" fill="#0B1530"/><text x="${x}" y="${G - 173}" font-family="M" font-weight="800" font-size="13" fill="#fff" text-anchor="middle">${i ? '2ª ETAPA' : '1ª ETAPA'}</text>`).join('')}
    <rect x="2236" y="${G - 300}" width="28" height="70" rx="10" fill="url(#steel)"/>
    <rect x="2150" y="${G - 110}" width="200" height="34" rx="6" fill="#0B1530"/><text x="2250" y="${G - 87}" font-family="M" font-weight="800" font-size="17" fill="#00A9E0" text-anchor="middle">REGULACIÓN</text></g>`;

  // ---- equipo de consumo: caldero pirotubular ----
  const BX1 = 2820, BX2 = 3260, BY = G - 360, BH = 250;
  m += `<g id="boilG">${shadow(3040, 300, .45)}
    <rect x="2780" y="${G - 40}" width="520" height="40" fill="#2B3F6E"/><rect x="2780" y="${G - 40}" width="520" height="6" fill="#5D739E"/>
    ${[2900, 3180].map(x => `<path d="M${x - 50} ${G - 40} L${x - 30} ${BY + BH - 20} H${x + 30} L${x + 50} ${G - 40} Z" fill="#16264D"/>`).join('')}
    <rect x="${BX1}" y="${BY}" width="${BX2 - BX1}" height="${BH}" fill="url(#boil)"/>
    <ellipse cx="${BX2}" cy="${BY + BH / 2}" rx="46" ry="${BH / 2}" fill="url(#boilEnd)"/>
    ${[2960, 3100].map(x => `<rect x="${x}" y="${BY}" width="4" height="${BH}" fill="#0A2F80" opacity=".6"/>`).join('')}
    <ellipse cx="${BX1}" cy="${BY + BH / 2}" rx="46" ry="${BH / 2}" fill="#0A2F80"/>
    <ellipse cx="${BX1}" cy="${BY + BH / 2}" rx="40" ry="${BH / 2 - 8}" fill="#123A8E" stroke="#3D7BE0" stroke-width="3"/>
    ${[...Array(12)].map((_, k) => { const a = k * 30 * Math.PI / 180; return `<circle cx="${BX1 + Math.cos(a) * 32}" cy="${BY + BH / 2 + Math.sin(a) * (BH / 2 - 18)}" r="4" fill="#C7D3EA"/>`; }).join('')}
    <!-- quemador -->
    <rect x="2716" y="${BY + 186}" width="12" height="${G - 40 - BY - 186}" fill="#2B3F6E"/><rect x="2786" y="${BY + 186}" width="12" height="${G - 40 - BY - 186}" fill="#2B3F6E"/>
    <rect x="2700" y="${BY + 70}" width="110" height="120" rx="12" fill="#E5484D"/><rect x="2700" y="${BY + 70}" width="110" height="20" rx="8" fill="#FF6B6F"/>
    <circle cx="2735" cy="${BY + 150}" r="26" fill="#9C2B30"/>${[0, 45, 90, 135].map(a => `<line x1="${2735 + Math.cos(a * Math.PI / 180) * 22}" y1="${BY + 150 + Math.sin(a * Math.PI / 180) * 22}" x2="${2735 - Math.cos(a * Math.PI / 180) * 22}" y2="${BY + 150 - Math.sin(a * Math.PI / 180) * 22}" stroke="#E5484D" stroke-width="3"/>`).join('')}
    <rect x="2768" y="${BY + 100}" width="34" height="34" rx="17" fill="#06132F" stroke="#C7D3EA" stroke-width="3"/>
    <ellipse id="flame" cx="2785" cy="${BY + 117}" rx="12" ry="9" fill="url(#fire)"/>
    <!-- chimenea -->
    <rect x="3120" y="${G - 780}" width="70" height="${G - 780 < BY ? BY - (G - 780) : 10}" fill="url(#stack)"/>
    ${[G - 700, G - 560].map(y => `<rect x="3114" y="${y}" width="82" height="12" fill="#FF7A00"/>`).join('')}
    <rect x="3108" y="${G - 796}" width="94" height="20" rx="4" fill="#2D3D63"/>
    <path d="M3155 ${G - 640} L3330 ${G - 40} M3155 ${G - 640} L2990 ${BY}" stroke="#7F95BF" stroke-width="2" opacity=".6"/>
    <!-- tablero de control -->
    <rect x="3330" y="${G - 300}" width="90" height="260" rx="8" fill="#C7D3EA" stroke="#7F95BF" stroke-width="3"/>
    <rect x="3342" y="${G - 284}" width="66" height="44" rx="4" fill="#06132F"/><text id="boilTxt" x="3375" y="${G - 254}" font-family="M" font-weight="800" font-size="18" fill="#12B76A" text-anchor="middle">85 °C</text>
    <circle cx="3358" cy="${G - 214}" r="8" fill="#12B76A"/><circle cx="3392" cy="${G - 214}" r="8" fill="#E5484D"/>
    ${[0, 1, 2].map(k => `<rect x="3346" y="${G - 190 + k * 26}" width="58" height="12" rx="3" fill="#7F95BF"/>`).join('')}
    <rect x="${BX1 + 70}" y="${BY + BH + 4}" width="300" height="28" rx="5" fill="#0B1530"/><text x="${BX1 + 220}" y="${BY + BH + 24}" font-family="M" font-weight="800" font-size="15" fill="#fff" text-anchor="middle">CALDERO · EQUIPO DE CONSUMO</text>
    <g id="smoke"></g></g>`;

  // ---- cerco exterior y terceros (viviendas y personas) ----
  m += `<g id="terceros">`;
  m += `<rect x="3460" y="${G - 130}" width="1100" height="130" fill="url(#chain)"/>`;
  for (let x = 3460; x < 4560; x += 110) m += `<rect x="${x - 4}" y="${G - 136}" width="8" height="136" fill="#4D6699"/>`;
  m += `<rect x="3460" y="${G - 138}" width="1100" height="6" fill="#4D6699"/>`;
  m += tree(4520, 1.1);
  [[3560, 250, '#F2C46D', '#B5532F'], [3860, 210, '#E8806E', '#7C2E2A'], [4140, 290, '#7FD1BC', '#2F5D6E']].forEach(([x, h, c, r]) => {
    m += `${shadow(x + 110, 140, .3)}<rect x="${x}" y="${G - h}" width="220" height="${h}" fill="${c}"/><rect x="${x + 180}" y="${G - h}" width="40" height="${h}" fill="#000" opacity=".12"/>
      <path d="M${x - 24} ${G - h + 4} L${x + 110} ${G - h - 92} L${x + 244} ${G - h + 4} Z" fill="${r}"/><path d="M${x - 24} ${G - h + 4} L${x + 110} ${G - h - 92} L${x + 120} ${G - h - 86} L${x - 10} ${G - h + 4} Z" fill="#fff" opacity=".12"/>
      ${[[30, 40], [130, 40]].map(([dx, dy]) => `<rect x="${x + dx}" y="${G - h + dy}" width="56" height="56" fill="#FFE6A3"/><rect x="${x + dx + 26}" y="${G - h + dy}" width="4" height="56" fill="${r}"/><rect x="${x + dx}" y="${G - h + dy + 26}" width="56" height="4" fill="${r}"/>`).join('')}
      <rect x="${x + 82}" y="${G - 96}" width="56" height="96" rx="4" fill="#3B2A20"/><circle cx="${x + 128}" cy="${G - 48}" r="4" fill="#FFB81C"/>`;
  });
  [[3700, '#FFB81C', '#2B1D14'], [3760, '#00A9E0', '#5A3A22'], [4040, '#FF7A00', '#111'], [4330, '#12B76A', '#3A2618']].forEach(([x, c, hair], i) => {
    m += `<g class="pers" id="pers${i}" transform="translate(${x} ${G})"><ellipse cy="2" rx="26" ry="5" fill="#000" opacity=".3"/>
      <rect x="-14" y="-52" width="12" height="52" rx="5" fill="#16264D"/><rect x="2" y="-52" width="12" height="52" rx="5" fill="#16264D"/>
      <rect x="-20" y="-112" width="40" height="66" rx="14" fill="${c}"/><rect x="-27" y="-106" width="11" height="48" rx="5" fill="${c}"/><rect x="16" y="-106" width="11" height="48" rx="5" fill="${c}"/>
      <circle cy="-132" r="19" fill="#E8B48A"/><path d="M-19 -134 Q-18 -156 0 -156 Q19 -156 19 -134 Q10 -146 -19 -134 Z" fill="${hair}"/></g>`;
  });
  m += `</g>`;

  // ---- inspector (profesional con EPP y tablet) ----
  m += `<g id="insp" transform="translate(1960 ${G})">
    <ellipse cx="0" cy="4" rx="78" ry="12" fill="#000" opacity=".35"/>
    <path id="beamP" d="M110 -270 L470 -400 L470 -150 Z" fill="url(#beam)" opacity="0"/>
    <path d="M-34 -160 L-30 -14 H-4 L-2 -160 Z" fill="#16264D"/><path d="M4 -160 L6 -14 H32 L34 -160 Z" fill="#16264D"/>
    <rect x="-34" y="-90" width="30" height="7" fill="#FFB81C" opacity=".85"/><rect x="4" y="-90" width="30" height="7" fill="#FFB81C" opacity=".85"/>
    <path d="M-44 -16 H-2 V2 H-50 Q-50 -12 -44 -16 Z" fill="#2B1D14"/><path d="M2 -16 H44 Q50 -12 50 2 H2 Z" fill="#2B1D14"/>
    <g id="torso">
      <rect x="-50" y="-320" width="100" height="172" rx="28" fill="#0047BB"/>
      <path d="M-50 -292 Q-50 -320 -24 -320 H-10 L-6 -150 H-50 Z M50 -292 Q50 -320 24 -320 H10 L6 -150 H50 Z" fill="url(#vest)"/>
      <rect x="-50" y="-238" width="44" height="11" fill="#E8F2FF"/><rect x="6" y="-238" width="44" height="11" fill="#E8F2FF"/>
      <rect x="-50" y="-200" width="44" height="11" fill="#E8F2FF"/><rect x="6" y="-200" width="44" height="11" fill="#E8F2FF"/>
      <rect x="-36" y="-300" width="20" height="14" rx="3" fill="#0B1530"/><rect x="-52" y="-160" width="104" height="14" rx="4" fill="#0B1530"/><rect x="-8" y="-160" width="16" height="14" rx="3" fill="#C7D3EA"/>
      <path d="M-12 -320 L0 -300 L12 -320" stroke="#E8B48A" stroke-width="10" fill="none"/>
      <g id="arm"><path d="M40 -308 Q76 -286 92 -246" stroke="#0047BB" stroke-width="26" stroke-linecap="round" fill="none"/>
        <circle cx="96" cy="-240" r="13" fill="#FFB81C"/>
        <g transform="translate(86 -300) rotate(-10)"><rect x="0" y="0" width="74" height="104" rx="10" fill="#0B1530"/><rect id="tabScr" x="7" y="8" width="60" height="86" rx="5" fill="#00A9E0"/>
          <rect x="13" y="16" width="48" height="10" rx="3" fill="#06132F" opacity=".7"/><path d="M14 40 l6 6 l10 -12 M14 58 l6 6 l10 -12" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <rect x="34" y="40" width="26" height="6" rx="3" fill="#fff" opacity=".8"/><rect x="34" y="58" width="22" height="6" rx="3" fill="#fff" opacity=".8"/><rect x="14" y="76" width="44" height="8" rx="4" fill="#FFB81C"/></g></g>
      <path d="M-42 -306 Q-66 -270 -60 -188" stroke="#0047BB" stroke-width="26" stroke-linecap="round" fill="none"/><circle cx="-60" cy="-182" r="13" fill="#FFB81C"/></g>
    <g id="head"><rect x="-12" y="-336" width="24" height="20" fill="#D9A07A"/>
      <ellipse cx="0" cy="-366" rx="36" ry="40" fill="#E8B48A"/><ellipse cx="-34" cy="-362" rx="7" ry="11" fill="#D9A07A"/>
      <path d="M6 -344 q10 6 20 -2" stroke="#9C5A3C" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-36 -380 Q-30 -404 -6 -404" stroke="#3A2618" stroke-width="10" fill="none" stroke-linecap="round"/>
      <circle cx="14" cy="-372" r="4" fill="#0B1530"/><path d="M2 -386 h20" stroke="#3A2618" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 -366 q8 8 0 14" stroke="#C98C66" stroke-width="4" fill="none"/>
      <rect x="-2" y="-384" width="38" height="16" rx="6" fill="#00A9E0" opacity=".55" stroke="#0B1530" stroke-width="2"/>
      <path d="M-46 -384 Q-46 -436 0 -440 Q46 -436 46 -384 Z" fill="url(#helmet)"/><rect x="-56" y="-390" width="112" height="12" rx="6" fill="#D99A00"/>
      <rect x="-6" y="-438" width="12" height="50" rx="5" fill="#FFE07A" opacity=".8"/><path d="M-30 -420 Q-20 -432 -4 -434" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/></g>
  </g>`;

  m += `<g id="callouts"></g>`;
  main.innerHTML = m;

  const callouts = main.querySelector('#callouts');
  function callout(id, x, y, label, dir = 1, color = '#FF7A00') {
    const g = document.createElementNS(SVGNS, 'g');
    g.id = 'co-' + id;
    const lx = x + dir * 110, ly = y - 120;
    const w = label.length * 19 + 56;
    g.innerHTML = `<circle cx="${x}" cy="${y}" r="14" fill="${color}" stroke="#fff" stroke-width="4"/><circle class="ring" cx="${x}" cy="${y}" r="16" fill="none" stroke="${color}" stroke-width="4"/>
      <path class="ln" d="M${x} ${y} L${lx} ${ly} H${lx + dir * 40}" fill="none" stroke="#fff" stroke-width="4"/>
      <g class="lb"><rect x="${dir > 0 ? lx + 40 : lx - 40 - w}" y="${ly - 34}" width="${w}" height="68" rx="16" fill="#fff"/>
      <rect x="${dir > 0 ? lx + 40 : lx - 40 - w}" y="${ly - 34}" width="10" height="68" rx="5" fill="${color}"/>
      <text x="${dir > 0 ? lx + 45 + w / 2 : lx - 35 - w / 2}" y="${ly + 12}" font-family="M" font-weight="800" font-size="32" fill="#0B1530" text-anchor="middle">${label}</text></g>`;
    callouts.appendChild(g);
    return g;
  }

  // cámara: x,y = punto del mundo al centro de pantalla, z = zoom
  const camS = { x: 2000, y: 600, z: 0.45, rot: 0 };
  function shot(t, x, y, z, d = 1.4, ease = 'power3.inOut') { tl.to(camS, { x, y, z, duration: d, ease }, t); }
  function cut(t, x, y, z) { tl.set(camS, { x, y, z }, t); }
  function applyCam() {
    cam.setAttribute('transform', `translate(960 540) scale(${camS.z}) rotate(${camS.rot}) translate(${-camS.x} ${-camS.y})`);
    const gy = 540 + (G - camS.y) * camS.z;           // línea de suelo en pantalla
    const k = 0.5 + camS.z * 0.35, k2 = 0.6 + camS.z * 0.4;
    skyG.setAttribute('transform', `translate(0 ${gy - 880})`);
    far.setAttribute('transform', `translate(${960 - (camS.x - 2000) * 0.06 * camS.z - 1250 * k} ${gy - 880 * k}) scale(${k})`);
    mid.setAttribute('transform', `translate(${960 - (camS.x - 2000) * 0.2 * camS.z - 2700 * k2} ${gy - 880 * k2}) scale(${k2})`);
  }

  // animación ambiental (función pura del tiempo)
  const flow = main.querySelector('#flow'), n1 = main.querySelector('#needle1');
  const nr = [main.querySelector('#needleR0'), main.querySelector('#needleR1')], flame = main.querySelector('#flame');
  const smoke = main.querySelector('#smoke'), led = main.querySelector('#vapLed');
  const head = main.querySelector('#head'), arm = main.querySelector('#arm'), torso = main.querySelector('#torso');
  const tab = main.querySelector('#tabScr'), beam = main.querySelector('#beamP');
  const pers = [...main.querySelectorAll('.pers')];
  const FX = 2785, FY = BY + 117;
  let sm = '';
  for (let i = 0; i < 8; i++) sm += `<circle class="pf" r="30" fill="#C9D6EA"/>`;
  smoke.innerHTML = sm;
  const puffs = [...smoke.querySelectorAll('.pf')];
  const st = { beam: 0, walk: 0 };
  function ambient(t) {
    flow.setAttribute('stroke-dashoffset', -t * 130);
    n1.setAttribute('transform', `rotate(${20 + Math.sin(t * 1.7) * 8 + Math.sin(t * 5.3) * 2})`);
    nr.forEach((n, i) => n.setAttribute('transform', `rotate(${-30 + i * 50 + Math.sin(t * 2.1 + i) * 6})`));
    const fl = 1 + Math.sin(t * 13) * 0.12 + Math.sin(t * 7.1) * 0.08;
    flame.setAttribute('transform', `translate(${FX} ${FY}) scale(${fl} ${2 - fl}) translate(${-FX} ${-FY})`);
    puffs.forEach((p, i) => {
      const k = ((t * 0.22 + i / puffs.length) % 1);
      p.setAttribute('cx', 3155 + Math.sin(k * 6 + i) * 30 + k * 170);
      p.setAttribute('cy', G - 810 - k * 380);
      p.setAttribute('r', 22 + k * 74);
      p.setAttribute('opacity', (0.45 * (1 - k)).toFixed(3));
    });
    led.setAttribute('opacity', (Math.sin(t * 6) > 0 ? 1 : 0.35));
    head.setAttribute('transform', `rotate(${Math.sin(t * 0.9) * 3} 0 -330)`);
    torso.setAttribute('transform', `translate(0 ${Math.sin(t * 1.8) * 2})`);
    arm.setAttribute('transform', `rotate(${Math.sin(t * 1.2) * 2} 40 -308)`);
    tab.setAttribute('opacity', 0.8 + Math.sin(t * 4) * 0.2);
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

// fondo de gráficos: degradado Noche → Azul con arcos solares finos (sin brillos)
(() => {
  const c = $('#bg'), g = c.getContext('2d');
  const P = Array.from({ length: 46 }, (_, i) => ({ x: (i * 733) % 1920, y: (i * 389) % 1080, s: 1 + (i % 3), v: 8 + (i % 7) * 4 }));
  tickers.push(t => {
    const gr = g.createLinearGradient(0, 0, 1920, 1080);
    gr.addColorStop(0, '#06132F'); gr.addColorStop(0.55, '#0A1F4F'); gr.addColorStop(1, '#0047BB');
    g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
    // arcos concéntricos del "sol" en la esquina inferior derecha
    g.lineWidth = 1.5;
    for (let k = 0; k < 9; k++) {
      const r = 260 + k * 120 + ((t * 18) % 120);
      g.strokeStyle = `rgba(255,184,28,${Math.max(0, 0.13 - k * 0.013)})`;
      g.beginPath(); g.arc(1920, 1080, r, Math.PI, 1.5 * Math.PI); g.stroke();
    }
    // línea de horizonte naranja
    const lgx = g.createLinearGradient(0, 0, 1920, 0);
    lgx.addColorStop(0, 'rgba(255,122,0,0)'); lgx.addColorStop(0.5, 'rgba(255,122,0,.35)'); lgx.addColorStop(1, 'rgba(255,184,28,0)');
    g.fillStyle = lgx; g.fillRect(0, 1072, 1920, 2);
    P.forEach(p => {
      const y = (p.y - t * p.v) % 1080, yy = y < 0 ? y + 1080 : y;
      g.fillStyle = `rgba(220,232,255,${0.12 + p.s * 0.06})`;
      g.beginPath(); g.arc(p.x + Math.sin(t * .5 + p.y) * 14, yy, p.s, 0, 6.283); g.fill();
    });
  });
})();

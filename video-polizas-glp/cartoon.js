// Técnico Solgas en estilo cartoon vectorial (2D): contornos, cel-shading y brillos.
// Vista 3/4 hacia la derecha de la pantalla, pies en y=0, alto ~490 u (con casco).
// Partes animables: cabeza, párpados, brazo cercano (hombro + codo, 3 manos), brazo con tablet, torso.
const CARTOON = (() => {
  const C = {
    ol: '#1B2340', skin: '#C9875A', skinS: '#A9683E', skinH: '#DDA073', blush: '#E3876F',
    hair: '#171213', white: '#FFFFFF', iris: '#3E2516', mouth: '#5B1F1B', tongue: '#D9676A', teeth: '#FFFDF8',
    suit: '#2A55C9', suitS: '#1E40A3', suitH: '#3D6BE3', yoke: '#F2731F', yokeS: '#D35A0C', yokeH: '#FF9046', navy: '#1A2552',
    refl: '#E9EEF5', reflS: '#B9C3D3', boot: '#202027', bootH: '#4A4A57', helmet: '#FFFFFF', helmetS: '#D6DDEA', blue: '#0047BB', orange: '#FF7A00',
    lens: 'rgba(190,236,255,.28)', frame: '#1B2A4F', metal: '#C7D3EA',
  };
  const W = 3.4;   // grosor de contorno
  const P = (d, fill, o = {}) => `<path d="${d}" fill="${fill}"${o.ol === false ? '' : ` stroke="${C.ol}" stroke-width="${o.w || W}" stroke-linejoin="round" stroke-linecap="round"`}${o.op ? ` opacity="${o.op}"` : ''}${o.id ? ` id="${o.id}"` : ''}/>`;
  const F = (d, fill, op) => `<path d="${d}" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;   // relleno sin contorno (sombras/brillos)
  // extremidad con contorno: dos trazos redondeados (contorno + relleno)
  const limb = (pts, w, fill, extra = '') => { const d = 'M' + pts.map(p => p.join(' ')).join(' L');
    return `<path d="${d}" fill="none" stroke="${C.ol}" stroke-width="${w + W * 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>${extra}`; };
  const band = (pts, w, fill) => { const d = 'M' + pts.map(p => p.join(' ')).join(' L'); return `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="butt"/>`; };

  // ---------- manos ----------
  // mano relajada (cuelga), dedos hacia abajo
  const handRest = `<g id="hRest">
    ${P('M-13 -6 C-16 6 -14 20 -6 25 C2 29 12 26 14 16 C16 6 12 -4 6 -8 C0 -11 -9 -10 -13 -6 Z', C.skin)}
    ${F('M6 -8 C12 -4 16 6 14 16 C13 21 10 24 6 26 C10 18 10 6 6 -8 Z', C.skinS)}
    <path d="M-6 12 C-4 18 -2 21 1 23 M2 10 C4 16 6 19 8 21" stroke="${C.skinS}" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${P('M-13 2 C-20 4 -22 12 -18 16 C-15 18 -11 14 -10 10', C.skin, { w: 3 })}</g>`;
  // mano señalando (índice extendido hacia abajo del eje del brazo)
  const handPoint = `<g id="hPoint" opacity="0">
    ${P('M-12 -6 C-15 4 -12 14 -4 17 C4 19 12 15 13 6 C14 -2 10 -8 4 -10 C-2 -12 -9 -10 -12 -6 Z', C.skin)}
    ${P('M-3 12 C-4 24 -3 36 0 42 C3 46 7 45 7 40 C7 32 6 22 6 13 Z', C.skin)}
    ${F('M4 -10 C10 -8 14 -2 13 6 C12 12 9 15 6 16 C9 8 9 -2 4 -10 Z', C.skinS)}
    <path d="M6 6 C9 8 11 8 12 6" stroke="${C.skinS}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
  // pulgar arriba: puño con el pulgar hacia arriba (en el sistema del antebrazo, apunta hacia -x = arriba al levantar)
  const handThumb = `<g id="hThumb" opacity="0"><g transform="rotate(-142)">
    ${P('M-14 -10 C-18 2 -16 16 -6 20 C4 23 14 18 15 6 C16 -4 12 -12 4 -14 C-4 -16 -11 -14 -14 -10 Z', C.skin)}
    <path d="M-12 2 H10 M-12 9 H10 M-10 15 H8" stroke="${C.skinS}" stroke-width="2.2" stroke-linecap="round"/>
    ${P('M-14 -6 C-26 -8 -36 -10 -40 -6 C-43 -2 -40 3 -34 3 C-28 3 -20 2 -14 2 Z', C.skin)}
    ${F('M4 -14 C12 -12 16 -4 15 6 C14 13 11 17 7 19 C11 10 11 -2 4 -14 Z', C.skinS)}</g></g>`;

  // ---------- SVG del personaje ----------
  function svg() {
    return `
  <ellipse cx="6" cy="2" rx="86" ry="11" fill="#000" opacity=".22"/>
  <path id="beamP" d="M150 -300 L520 -460 L520 -190 Z" fill="url(#beam)" opacity="0"/>

  <!-- brazo lejano (sostiene la tablet): parte superior detrás del torso -->
  <g id="cArmF">
    ${limb([[52, -330], [70, -290], [78, -262]], 30, C.suit)}
    ${band([[56, -322], [66, -300]], 30, C.yoke)}
  </g>

  <!-- piernas -->
  <g id="cLegs">
    ${P('M-54 -218 C-56 -160 -54 -90 -52 -36 L-10 -36 C-8 -90 -6 -150 -2 -188 L4 -188 C8 -150 10 -90 12 -36 L54 -36 C56 -100 60 -170 60 -218 Z', C.suit)}
    ${F('M30 -205 C34 -160 38 -100 40 -40 L54 -40 C56 -100 59 -168 59 -214 Z', C.suitS)}
    ${F('M-52 -210 C-53 -160 -52 -100 -50 -42 L-42 -42 C-44 -100 -46 -160 -45 -210 Z', C.suitH, 0.6)}
    <path d="M-2 -188 L4 -188" stroke="${C.ol}" stroke-width="${W}"/>
    <path d="M-32 -108 C-26 -104 -20 -104 -16 -108 M26 -108 C32 -104 40 -104 46 -108" stroke="${C.suitS}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${P('M-52.5 -78 H-9.5 V-66 H-52.8 Z', C.refl, { w: 2.4 })}${P('M11.5 -78 H54.6 V-66 H11.8 Z', C.refl, { w: 2.4 })}
    <path d="M-52 -72 H-10 M12 -72 H54" stroke="${C.reflS}" stroke-width="2"/>
    ${P('M-52.2 -50 H-9.8 V-36 H-52 Z', C.suitS, { w: 2.4 })}${P('M11.8 -50 H54.2 V-36 H12 Z', C.suitS, { w: 2.4 })}
  </g>
  <!-- botines -->
  <g id="cBoots">
    ${P('M-56 -36 H-8 C-4 -26 -4 -12 -6 -4 C-24 0 -44 0 -62 -2 C-66 -14 -64 -28 -56 -36 Z', C.boot)}
    ${P('M10 -36 H54 C64 -28 74 -18 76 -6 C76 -2 74 0 70 0 H10 C6 -12 6 -26 10 -36 Z', C.boot)}
    ${F('M-54 -32 C-58 -24 -58 -16 -56 -10 L-50 -10 C-52 -18 -52 -26 -48 -32 Z', C.bootH)}
    ${F('M54 -30 C60 -24 66 -18 68 -10 L62 -9 C60 -17 56 -24 50 -30 Z', C.bootH)}
    <path d="M-62 -4 H-6 M10 -4 H74" stroke="#0C0C10" stroke-width="5" stroke-linecap="round"/>
    <path d="M22 -30 L36 -26 M22 -23 L36 -19 M-40 -30 L-26 -27 M-40 -23 L-26 -20" stroke="${C.bootH}" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- torso -->
  <g id="cTorso">
    ${P('M-60 -340 C-74 -300 -68 -250 -62 -214 L62 -214 C70 -250 74 -300 62 -340 C34 -356 -32 -356 -60 -340 Z', C.suit)}
    ${F('M40 -300 C48 -270 52 -240 50 -216 L62 -216 C68 -250 70 -282 64 -318 Z', C.suitS)}
    ${F('M-62 -300 C-66 -270 -64 -240 -60 -218 L-52 -218 C-56 -240 -58 -270 -56 -298 Z', C.suitH, 0.5)}
    ${P('M-60 -340 C-32 -356 34 -356 62 -340 C66 -326 67 -310 67 -294 C30 -286 -24 -286 -66 -294 C-66 -310 -64 -326 -60 -340 Z', C.yoke)}
    ${F('M44 -340 C54 -330 60 -316 62 -298 L67 -296 C67 -312 66 -328 62 -340 Z', C.yokeS)}
    ${F('M-50 -344 C-30 -350 -10 -352 4 -352 C-14 -348 -36 -342 -50 -334 Z', C.yokeH, 0.7)}
    <path d="M-66 -294 C-24 -286 30 -286 67 -294" stroke="${C.navy}" stroke-width="4" fill="none"/>
    <path d="M8 -350 C8 -320 7 -270 6 -216" stroke="${C.ol}" stroke-width="2.2" fill="none"/><path d="M11 -348 C11 -320 10 -270 9 -218" stroke="${C.metal}" stroke-width="1.6" fill="none"/>
    <!-- texto SOLGAS en el pecho -->
    <g transform="translate(30 -268) rotate(-3)"><circle cx="-17" cy="0" r="4.6" fill="#fff"/><path d="M-21.5 -0.5 H-12.5" stroke="${C.suit}" stroke-width="2.2"/>
      <text x="5" y="4" font-family="M" font-weight="800" font-size="11" fill="#fff" text-anchor="middle">SOLGAS</text></g>
    <!-- fotocheck y radio -->
    <path d="M-40 -284 V-272" stroke="${C.ol}" stroke-width="1.6"/>
    ${P('M-50 -272 H-30 V-246 H-50 Z', '#fff', { w: 2.4 })}<rect x="-46" y="-268" width="8" height="9" fill="${C.blue}"/><rect x="-46" y="-255" width="12" height="3" fill="${C.orange}"/><rect x="-36" y="-267" width="4" height="2" fill="#98A2B3"/>
    ${P('M-56 -334 H-42 V-306 H-56 Z', '#202027', { w: 2.4 })}<path d="M-46 -334 V-352" stroke="${C.ol}" stroke-width="3.4" stroke-linecap="round"/><circle cx="-52" cy="-328" r="2" fill="#12B76A"/>
    <!-- cuello mao -->
    ${P('M-24 -350 C-26 -362 -24 -368 -20 -370 C-6 -364 16 -364 30 -370 C34 -366 34 -358 32 -350 C14 -346 -6 -346 -24 -350 Z', C.suit)}
    ${F('M20 -366 C28 -368 32 -364 32 -352 C30 -350 28 -350 26 -350 C28 -356 26 -362 20 -366 Z', C.suitS)}
    <!-- cinturón y portaherramientas -->
    ${P('M-63 -226 C-20 -222 22 -222 63 -226 L63 -212 C22 -208 -20 -208 -63 -212 Z', C.suitS)}
    ${P('M-2 -225 H14 V-211 H-2 Z', C.metal, { w: 2.2 })}
    ${P('M-70 -222 H-50 V-182 H-70 Z', '#202027', { w: 2.6 })}<path d="M-64 -222 V-240" stroke="${C.metal}" stroke-width="4" stroke-linecap="round"/><path d="M-56 -222 V-234" stroke="${C.orange}" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- tablet y mano lejana (delante del torso) -->
  <g id="cTab">
    ${limb([[78, -262], [100, -276], [112, -284]], 26, C.suit)}
    ${band([[84, -266], [94, -272]], 26, C.refl)}
    ${band([[101, -277], [109, -282]], 27, C.navy)}
    <g transform="translate(130 -314) rotate(14)">
      ${P('M-34 -50 H34 Q42 -50 42 -42 V42 Q42 50 34 50 H-34 Q-42 50 -42 42 V-42 Q-42 -50 -34 -50 Z', '#1B2A4F')}
      ${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<rect x="${a * 37 - 8}" y="${b * 45 - 8}" width="16" height="16" rx="4" fill="${C.orange}" stroke="${C.ol}" stroke-width="2"/>`).join('')}
      <rect id="tabScr" x="-34" y="-42" width="68" height="84" rx="4" fill="#0B66D6"/>
      <rect x="-34" y="-42" width="68" height="13" rx="4" fill="#06132F" opacity=".5"/><rect x="-29" y="-38" width="26" height="4" rx="2" fill="#fff"/>
      ${[0, 1, 2, 3].map(k => `<rect x="-28" y="${-23 + k * 14}" width="9" height="9" rx="2" fill="${k < 3 ? '#12B76A' : '#fff'}" opacity="${k < 3 ? 1 : .5}"/>${k < 3 ? `<path d="M-26 ${-18.5 + k * 14} l2.2 2.2 l3.6 -4.4" stroke="#fff" stroke-width="1.7" fill="none"/>` : ''}<rect x="-15" y="${-21 + k * 14}" width="${40 - k * 6}" height="5" rx="2.5" fill="#fff" opacity=".85"/>`).join('')}
      <rect x="-28" y="33" width="56" height="4" rx="2" fill="#FFB81C"/>
      <path d="M-30 -40 L-6 -40 L-30 0 Z" fill="#fff" opacity=".1"/>
    </g>
    <g transform="translate(116 -284) rotate(-20)">
      ${P('M-14 -10 C-16 4 -10 16 0 18 C10 19 18 12 17 0 C16 -10 8 -16 0 -16 C-8 -16 -12 -14 -14 -10 Z', C.skin)}
      ${P('M2 -14 C4 -26 8 -32 14 -32 C19 -32 20 -26 17 -20 C15 -16 12 -12 10 -8', C.skin, { w: 3 })}
      ${F('M8 -14 C14 -10 17 -2 16 6 C15 12 12 15 9 17 C12 8 12 -2 8 -14 Z', C.skinS)}
    </g>
  </g>

  <!-- cabeza -->
  <g id="cHead">
    ${P('M-14 -372 C-14 -362 -12 -354 -10 -350 C2 -347 16 -347 24 -350 C26 -356 26 -364 26 -372 Z', C.skinS)}
    <g id="cHeadIn">
    ${P('M-46 -418 C-48 -452 -22 -470 6 -470 C38 -469 58 -448 56 -414 C55 -386 44 -364 18 -358 C-2 -354 -28 -362 -38 -380 C-45 -392 -46 -404 -46 -418 Z', C.skin)}
    ${F('M-46 -418 C-46 -404 -45 -392 -38 -380 C-28 -362 -2 -354 18 -358 C0 -362 -18 -372 -26 -390 C-32 -404 -34 -420 -32 -436 C-40 -432 -46 -426 -46 -418 Z', C.skinS, 0.55)}
    ${F('M30 -458 C44 -450 52 -436 52 -420 C50 -432 42 -446 30 -458 Z', C.skinH, 0.8)}
    <!-- cabello -->
    ${P('M-48 -428 C-52 -410 -50 -392 -42 -384 C-38 -390 -36 -402 -36 -414 C-34 -424 -28 -432 -20 -436 C-30 -438 -42 -436 -48 -428 Z', C.hair, { w: 2.4 })}
    ${P('M-22 -436 C-22 -426 -21 -416 -20 -408 L-15 -408 C-16 -418 -16 -428 -14 -436 Z', C.hair, { w: 2 })}
    <!-- oreja -->
    ${P('M-40 -420 C-54 -424 -58 -410 -54 -400 C-50 -392 -42 -392 -38 -398', C.skin)}
    <path d="M-44 -414 C-50 -412 -50 -404 -45 -401" stroke="${C.skinS}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <!-- mejillas -->
    <ellipse cx="-14" cy="-386" rx="9" ry="5" fill="${C.blush}" opacity=".35"/><ellipse cx="40" cy="-388" rx="7" ry="4.5" fill="${C.blush}" opacity=".35"/>
    <!-- ojos -->
    ${P('M-17 -416 C-17 -430 3 -430 3 -416 C3 -402 -17 -402 -17 -416 Z', C.white, { w: 2.6 })}
    ${P('M19 -416 C19 -429 36 -429 36 -416 C36 -403 19 -403 19 -416 Z', C.white, { w: 2.6 })}
    <circle cx="-3.5" cy="-415" r="6.6" fill="${C.iris}"/><circle cx="-3.5" cy="-415" r="3.4" fill="#0A0605"/><circle cx="-6" cy="-418.5" r="2.3" fill="#fff"/><circle cx="-1" cy="-412" r="1.1" fill="#fff"/>
    <circle cx="30" cy="-415" r="6" fill="${C.iris}"/><circle cx="30" cy="-415" r="3.1" fill="#0A0605"/><circle cx="27.8" cy="-418.3" r="2.1" fill="#fff"/><circle cx="32.2" cy="-412.2" r="1" fill="#fff"/>
    <path d="M-19 -419 C-15 -431 2 -431 5 -419" stroke="${C.ol}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M17 -419 C21 -430 35 -430 38 -419" stroke="${C.ol}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M-14 -405 C-9 -402 -2 -402 1 -405 M22 -405 C26 -402 32 -402 34 -405" stroke="${C.skinS}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g id="cLids" opacity="0">
      ${P('M-18 -416 C-18 -431 4 -431 4 -416 C-4 -411 -10 -411 -18 -416 Z', C.skin, { w: 0, ol: false })}${P('M18 -416 C18 -430 37 -430 37 -416 C30 -411 24 -411 18 -416 Z', C.skin, { ol: false })}
      <path d="M-18 -415 C-10 -410 -3 -410 4 -415 M18 -415 C24 -410 31 -410 37 -415" stroke="${C.ol}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    </g>
    <!-- cejas gruesas -->
    ${F('M-21 -436 C-14 -444 -2 -445 6 -439 C4 -436 1 -436 -2 -438 C-8 -440 -14 -438 -19 -433 Z', C.hair)}
    ${F('M17 -439 C24 -444 34 -443 40 -436 L38 -433 C33 -438 25 -439 19 -436 Z', C.hair)}
    <!-- nariz -->
    ${P('M14 -409 C13 -400 10 -396 12 -391 C14 -386 22 -385 28 -387 C33 -389 34 -395 30 -398 C27 -401 22 -400 19 -403', C.skin, { w: 3 })}
    ${F('M22 -398 C27 -399 30 -396 29 -392 C26 -394 24 -396 22 -398 Z', C.skinH, 0.9)}
    <path d="M15 -389 C17 -387 19 -387 21 -388" stroke="${C.skinS}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- sonrisa abierta -->
    ${P('M-10 -378 C2 -373 22 -372 40 -379 C38 -366 26 -357 12 -357 C0 -357 -8 -366 -10 -378 Z', C.mouth)}
    ${F('M-8 -377 C4 -372.5 22 -371.5 38.5 -378 L37.5 -372 C22 -366.5 4 -367 -7.5 -372 Z', C.teeth)}
    ${F('M2 -360.5 C8 -366 22 -366 28 -361.5 C22 -357.5 8 -357.5 2 -360.5 Z', C.tongue)}
    <path d="M-12 -380 C-14 -377 -14 -375 -12 -373 M42 -381 C44 -378 44 -375 42 -373" stroke="${C.skinS}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${F('M4 -352 C10 -350 18 -350 22 -352 C18 -349 10 -349 4 -352 Z', C.skinS, 0.8)}
    <!-- lentes de seguridad -->
    ${P('M-26 -432 C-4 -435 26 -435 46 -431 C48 -422 47 -411 44 -404 C40 -400 26 -400 20 -404 C17 -407 15 -410 12 -410 C9 -410 7 -407 4 -404 C-2 -400 -18 -400 -22 -404 C-25 -411 -27 -422 -26 -432 Z', C.lens, { w: 2.6 })}
    <path d="M-26 -432 C-4 -436 26 -436 46 -432" stroke="${C.frame}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-6 -429 L-14 -406 M-1 -429 L-5 -418 M30 -429 L24 -412" stroke="#fff" stroke-width="2.4" opacity=".75" stroke-linecap="round"/>
    <path d="M-26 -430 L-44 -420" stroke="${C.frame}" stroke-width="3.6" stroke-linecap="round"/>
    <!-- casco -->
    ${P('M-56 -432 C-58 -472 -24 -494 6 -494 C40 -494 66 -472 64 -434 Z', C.helmet)}
    ${F('M-56 -434 C-58 -462 -44 -480 -26 -488 C-38 -472 -42 -454 -40 -434 Z', C.helmetS)}
    ${F('M30 -488 C46 -482 56 -470 58 -458 C50 -468 42 -478 30 -488 Z', '#fff')}
    ${F('M-57 -452 C-30 -458 36 -458 64.5 -452 L64.8 -444 C36 -450 -30 -450 -57.5 -444 Z', C.blue)}
    ${F('M-57.6 -441 C-30 -447 36 -447 64.8 -441 L64.9 -437.5 C36 -443.5 -30 -443.5 -57.8 -437.5 Z', C.orange)}
    ${P('M6 -494 C10 -476 12 -456 12 -432', 'none', { w: 3 })}<path d="M9 -492 C13 -474 15 -456 15 -433" stroke="${C.helmetS}" stroke-width="3" fill="none"/>
    ${P('M-64 -432 C-30 -440 40 -442 80 -434 C86 -432 86 -426 80 -424 C40 -430 -30 -430 -62 -424 C-68 -425 -68 -431 -64 -432 Z', C.helmet)}
    ${F('M-62 -425 C-30 -431 40 -431 80 -425 L80 -424.5 C40 -429 -30 -429 -62 -424 Z', C.helmetS)}
    </g>
  </g>

  <!-- brazo cercano (hombro + codo), delante del torso -->
  <g id="cArmN">
    ${limb([[-56, -330], [-66, -292], [-68, -262]], 32, C.suit)}
    ${band([[-58, -324], [-63, -302]], 32, C.yoke)}
    <g id="cElbow">
      ${limb([[-68, -262], [-68, -230], [-66, -206]], 28, C.suit)}
      ${band([[-68, -244], [-68, -234]], 28, C.refl)}
      ${band([[-67, -218], [-66, -208]], 29, C.navy)}
      <g transform="translate(-66 -196)">${handRest}${handPoint}${handThumb}</g>
    </g>
  </g>`;
  }

  // ---------- animación ----------
  let el = {};
  function init(root) {
    const q = id => root.querySelector('#' + id);
    el = { head: q('cHead'), headIn: q('cHeadIn'), lids: q('cLids'), armN: q('cArmN'), elbow: q('cElbow'), tab: q('cTab'), armF: q('cArmF'), torso: q('cTorso'),
      hRest: q('hRest'), hPoint: q('hPoint'), hThumb: q('hThumb'), beam: q('beamP'), tabScr: q('tabScr') };
  }
  function update(t, st) {
    if (!el.head) return;
    const br = Math.sin(t * 1.8) * 1.4;
    const p = st.point || 0, th = st.thumb || 0, rest = Math.max(0, 1 - p - th);
    el.torso.setAttribute('transform', `translate(0 ${br * 0.6})`);
    el.armF.setAttribute('transform', `translate(0 ${br * 0.6})`);
    el.tab.setAttribute('transform', `translate(0 ${br * 0.6}) rotate(${Math.sin(t * 1.2) * 1.5} 78 -262)`);
    const hr = Math.sin(t * 0.9) * 2.5 + Math.sin(t * 0.37) * 2 + (st.nod || 0) * Math.sin(t * 7) * 4 - (st.look || 0) * 6 - p * 5 + th * 3;
    el.head.setAttribute('transform', `translate(0 ${br}) rotate(${hr} 6 -356)`);
    // brazo cercano: hombro (-56,-330), codo (-68,-262)
    const a1 = rest * (2 + Math.sin(t * 1.1) * 2) + p * 118 + th * 14;
    const a2 = rest * -4 + p * -8 + th * -128;
    el.armN.setAttribute('transform', `translate(0 ${br * 0.6}) rotate(${a1} -56 -330)`);
    el.elbow.setAttribute('transform', `rotate(${a2} -68 -262)`);
    el.hRest.setAttribute('opacity', p > 0.5 || th > 0.5 ? 0 : 1);
    el.hPoint.setAttribute('opacity', p > 0.5 ? 1 : 0);
    el.hThumb.setAttribute('opacity', th > 0.5 ? 1 : 0);
    el.lids.setAttribute('opacity', (t % 3.7) < 0.13 || (t % 11.3) < 0.1 ? 1 : 0);
    el.tabScr.setAttribute('opacity', 0.85 + Math.sin(t * 4) * 0.15);
  }
  return { svg, init, update };
})();

// Operario/inspector de seguridad en vista 3/4 hacia la derecha, pies en y=0 (~470 px de alto).
// Partes animables: #head, #arm (tablet), #arm2 (lápiz), #lids (parpadeo), #tabScr, #beamP.
function OPERARIO() {
  const C = {
    skin: '#E9B48C', skinS: '#D39A70', skinD: '#B97C55', lips: '#B0614C', hair: '#2B1B12',
    shirt: '#1E4FA8', shirtS: '#163C82', vest: '#FF7A00', vestS: '#DD6300', refl: '#E9EEF5', reflS: '#AEB9CC',
    pants: '#26375F', pantsS: '#1B2847', boot: '#3A2A1F', bootH: '#5A4231', sole: '#17110C', glove: '#F2C14E', gloveS: '#D29E2A',
  };
  const refl = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.refl}"/><rect x="${x}" y="${y + h / 2 - 1}" width="${w}" height="2" fill="${C.reflS}"/>`;
  const glove = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <path d="M-11 -12 Q-14 4 -6 12 L8 12 Q14 4 12 -10 Z" fill="${C.glove}"/>
      <path d="M-6 12 Q-8 20 -2 22 Q2 20 2 12 M2 12 Q2 22 8 22 Q12 20 10 11" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.4"/>
      <path d="M12 -6 Q22 -6 20 4 Q16 8 11 4" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.4"/>
      <rect x="-12" y="-16" width="25" height="7" rx="3" fill="${C.gloveS}"/></g>`;
  return `
  <ellipse cx="4" cy="4" rx="84" ry="12" fill="#000" opacity=".28"/>
  <path id="beamP" d="M150 -318 L520 -460 L520 -190 Z" fill="url(#beam)" opacity="0"/>

  <!-- botas -->
  <path d="M-50 0 H-4 V-18 Q-6 -30 -16 -32 H-38 Q-50 -30 -50 -14 Z" fill="${C.boot}"/>
  <path d="M-50 -14 Q-50 -26 -42 -30" stroke="${C.bootH}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="-52" y="-6" width="50" height="7" rx="2" fill="${C.sole}"/>
  <path d="M0 0 H56 Q60 -10 50 -18 L34 -24 Q26 -33 10 -31 H2 Z" fill="${C.boot}"/>
  <path d="M38 -20 Q50 -16 54 -6" stroke="${C.bootH}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <rect x="-1" y="-6" width="60" height="7" rx="2" fill="${C.sole}"/>
  <path d="M14 -28 l8 4 M14 -22 l8 4" stroke="#C9B9A8" stroke-width="2"/>

  <!-- piernas -->
  <path d="M-38 -212 L-42 -30 H-6 L-2 -206 Z" fill="${C.pantsS}"/>
  <path d="M0 -212 L4 -30 H40 Q42 -100 38 -150 Q40 -186 36 -212 Z" fill="${C.pants}"/>
  <path d="M20 -212 Q24 -160 22 -120" stroke="${C.pantsS}" stroke-width="2" fill="none"/>
  <rect x="16" y="-158" width="24" height="40" rx="4" fill="${C.pantsS}"/><rect x="16" y="-158" width="24" height="10" rx="3" fill="#30447A"/>
  <path d="M6 -108 Q22 -104 38 -110" stroke="${C.pantsS}" stroke-width="2" fill="none"/>
  ${refl(-41, -74, 36, 9)}${refl(4, -74, 37, 9)}

  <!-- cinturón -->
  <rect x="-46" y="-220" width="94" height="13" rx="3" fill="#1B1B22"/><rect x="-4" y="-221" width="15" height="15" rx="2" fill="#C7D3EA"/><rect x="0" y="-217" width="7" height="7" fill="#1B1B22"/>

  <!-- torso -->
  <g id="torso">
    <path d="M-46 -350 Q-50 -362 -30 -368 H34 Q54 -362 50 -348 L48 -212 H-44 Z" fill="${C.shirt}"/>
    <path d="M-44 -348 Q-48 -360 -28 -366 L-10 -366 L-6 -212 H-44 Z" fill="${C.vestS}"/>
    <path d="M50 -348 Q50 -364 32 -366 L12 -366 L8 -212 H48 Z" fill="${C.vest}"/>
    <path d="M40 -360 Q50 -330 46 -212 H48 L50 -348 Z" fill="${C.vestS}" opacity=".6"/>
    ${refl(-36, -362, 9, 100)}${refl(26, -362, 9, 100)}
    ${refl(-44, -268, 38, 11)}${refl(8, -268, 40, 11)}${refl(-44, -238, 38, 11)}${refl(8, -238, 40, 11)}
    <path d="M2 -366 V-214" stroke="#9AA7BE" stroke-width="2.5"/>
    <rect x="16" y="-334" width="22" height="22" rx="3" fill="${C.vestS}"/><rect x="16" y="-334" width="22" height="7" rx="2" fill="#C55400"/>
    <rect x="30" y="-346" width="4" height="18" rx="1.5" fill="#0047BB"/><rect x="30" y="-348" width="4" height="4" fill="#C7D3EA"/>
    <path d="M-28 -336 V-326" stroke="#9AA7BE" stroke-width="2"/>
    <rect x="-38" y="-326" width="22" height="28" rx="2.5" fill="#fff" stroke="#C7D3EA"/><rect x="-35" y="-322" width="9" height="11" fill="#0047BB"/>
    <rect x="-24" y="-322" width="6" height="2.5" fill="#98A2B3"/><rect x="-24" y="-317" width="5" height="2.5" fill="#98A2B3"/><rect x="-35" y="-307" width="16" height="3" fill="#FF7A00"/>
    <rect x="-47" y="-356" width="13" height="24" rx="3" fill="#1B1B22"/><path d="M-43 -356 V-372" stroke="#1B1B22" stroke-width="3" stroke-linecap="round"/><circle cx="-40" cy="-340" r="2" fill="#12B76A"/>
    <path d="M-16 -368 L0 -350 L-4 -376 Z" fill="${C.shirtS}"/><path d="M16 -368 L2 -350 L8 -376 Z" fill="${C.shirtS}"/>
  </g>

  <!-- brazo trasero (en reposo, sostiene un lapicero) -->
  <g id="arm2">
    <path d="M-36 -362 C-54 -358 -66 -340 -68 -300 L-70 -280 C-62 -272 -52 -276 -52 -290 L-46 -330 Z" fill="${C.shirtS}"/>
    <path d="M-62 -284 Q-64 -254 -56 -232" stroke="${C.shirtS}" stroke-width="21" stroke-linecap="round" fill="none"/>
    <path d="M-50 -350 Q-60 -326 -58 -290" stroke="${C.shirt}" stroke-width="5" fill="none" opacity=".55"/>
    <rect x="-66" y="-250" width="20" height="10" rx="3" fill="${C.shirt}"/>
    ${glove(-55, -222, 8)}
    <g id="finger" opacity="0"><path d="M-58 -206 Q-60 -186 -56 -176 Q-52 -174 -50 -178 Q-50 -192 -50 -206 Z" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.4"/></g>
    <rect x="-44" y="-238" width="5" height="34" rx="2" fill="#0B1530" transform="rotate(28 -42 -222)"/>
  </g>
  <!-- cabeza (coordenadas locales: centro de la cara en 0,0; mentón y=36, coronilla y=-40) -->
  <g id="head"><g transform="translate(4 -414)">
    <path d="M-14 22 H15 L17 48 Q1 56 -15 48 Z" fill="${C.skinS}"/><path d="M-14 30 Q2 40 15 28" stroke="${C.skinD}" stroke-width="2" fill="none" opacity=".5"/>
    <path d="M-30 -8 C-32 4 -29 12 -24 15 L-18 4 C-18 -4 -14 -10 -8 -12 Z" fill="${C.hair}"/>
    <path d="M-28 -6 C-30 -30 -12 -40 6 -40 C24 -40 33 -26 32 -10 C32 -4 33 0 34 4 C34 14 30 24 22 31 C16 36 8 38 2 36 C-8 33 -18 26 -24 16 C-28 10 -29 2 -28 -6 Z" fill="${C.skin}"/>
    <path d="M-24 16 C-18 26 -8 33 2 36 C-6 30 -11 22 -14 12 C-16 4 -16 -6 -14 -14 C-22 -10 -26 0 -24 16 Z" fill="${C.skinS}" opacity=".55"/>
    <path d="M-28 -8 C-28 -16 -26 -21 -23 -24 L-17 -22 C-20 -16 -20 -10 -18 -4 Z" fill="${C.hair}"/>
    <ellipse cx="-12" cy="0" rx="6.2" ry="9" fill="${C.skinS}"/>
    <path d="M-12.5 -5.5 C-8.5 -3 -8.5 3.5 -12.5 5.5" stroke="${C.skinD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M-6 -12 V-4" stroke="${C.hair}" stroke-width="3" stroke-linecap="round"/>
    <path d="M11 -17 Q18 -20.5 25 -16" stroke="${C.hair}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M-1 -16 Q3 -18 7 -16" stroke="${C.hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M12 -6 Q18 -11 24 -6 Q18 -2 12 -6 Z" fill="#fff"/>
    <circle cx="19" cy="-6.2" r="2.7" fill="#5A3520"/><circle cx="19" cy="-6.2" r="1.3" fill="#120A05"/><circle cx="20" cy="-7.2" r=".8" fill="#fff"/>
    <path d="M11.5 -6.3 Q18 -11.4 24.5 -6.3" stroke="#4A2C1A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M-1 -6 Q3 -9.6 7 -6 Q3 -3.2 -1 -6 Z" fill="#fff"/>
    <circle cx="4" cy="-6.1" r="2.1" fill="#5A3520"/><circle cx="4" cy="-6.1" r="1" fill="#120A05"/><circle cx="4.7" cy="-6.9" r=".6" fill="#fff"/>
    <path d="M-1.4 -6.2 Q3 -10 7.4 -6.2" stroke="#4A2C1A" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <g id="lids" opacity="0"><path d="M11 -6.5 Q18 -12 25 -6.5 Q18 -3 11 -6.5 Z" fill="${C.skin}"/><path d="M11.5 -5.6 Q18 -3.6 24.5 -5.6" stroke="#4A2C1A" stroke-width="1.5" fill="none"/>
      <path d="M-1.6 -6.4 Q3 -10.4 7.6 -6.4 Q3 -3 -1.6 -6.4 Z" fill="${C.skin}"/><path d="M-1 -5.6 Q3 -4.2 7 -5.6" stroke="#4A2C1A" stroke-width="1.3" fill="none"/></g>
    <path d="M31 -6 C35 0 40 7 39 11 C38.5 13.4 35 14 31.5 13 Z" fill="${C.skin}"/>
    <path d="M39 11 C38 13.6 34.6 14 31 13" stroke="${C.skinD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M30 -2 C31 3 31 8 30 11" stroke="${C.skinS}" stroke-width="1.6" fill="none" opacity=".8"/>
    <ellipse cx="24" cy="9" rx="4.6" ry="2.8" fill="#E8907A" opacity=".35"/>
    <path d="M14 20.5 Q19.5 24.5 25.5 19.5" stroke="${C.lips}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
    <path d="M17 24.6 Q20 25.8 23 24.4" stroke="${C.skinS}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M-3 -13 H31 Q33.4 -13 32.8 -10 L31.4 -2.6 Q30.6 1 26.6 1 H14.6 Q11.4 1 10.4 -2 L9.6 -4.2 H8.4 L7.6 -2 Q6.6 1 3.6 1 H0.4 Q-3 1 -3 -3 Z" fill="#BFEFFF" opacity=".35"/>
    <path d="M-3 -13 H31 Q33.4 -13 32.8 -10 L31.4 -2.6 Q30.6 1 26.6 1 H14.6 Q11.4 1 10.4 -2 L9.6 -4.2 H8.4 L7.6 -2 Q6.6 1 3.6 1 H0.4 Q-3 1 -3 -3 Z" fill="none" stroke="#1B2A4F" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M-3 -13 H32" stroke="#1B2A4F" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M22 -11 L18 -2 M28 -11 L25.5 -5" stroke="#fff" stroke-width="1.3" opacity=".75" stroke-linecap="round"/>
    <path d="M-3 -11 L-13 -6" stroke="#1B2A4F" stroke-width="1.8" stroke-linecap="round"/>
    <g transform="translate(0 -5)"><path d="M-34 -20 C-34 -46 -14 -58 4 -58 C24 -58 40 -46 40 -22 Z" fill="url(#helmet)"/>
    <path d="M4 -58 C7.5 -44 7.5 -32 6.5 -21" stroke="#E0A500" stroke-width="6" fill="none"/>
    <path d="M-38 -23 H44 C52 -23 54 -19 50 -16 H-38 C-41 -17.5 -41 -21.5 -38 -23 Z" fill="#D99A00"/>
    <path d="M-38 -16 H50" stroke="#B37E00" stroke-width="1.4"/>
    <path d="M-22 -40 C-15 -50 -6 -54 2 -55" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
    <circle cx="24" cy="-38" r="7" fill="#fff"/><path d="M24 -42.5 V-33.5 M19.5 -38 H28.5" stroke="#12B76A" stroke-width="2.8"/></g>
  </g></g>

  <!-- brazo delantero con tablet -->
  <g id="arm">
    <path d="M36 -360 C56 -356 66 -338 70 -300 L68 -284 C60 -276 52 -280 50 -292 L46 -330 Z" fill="${C.shirt}"/>
    <path d="M58 -350 C66 -336 70 -318 70 -300" stroke="${C.shirtS}" stroke-width="5" fill="none" opacity=".7"/>
    <path d="M60 -290 Q80 -282 104 -298" stroke="${C.shirt}" stroke-width="22" stroke-linecap="round" fill="none"/>
    <path d="M70 -284 Q86 -282 100 -292" stroke="${C.shirtS}" stroke-width="4" fill="none" opacity=".6"/>
    <g transform="translate(84 -372) rotate(-8)">
      <rect x="0" y="0" width="84" height="112" rx="11" fill="#1B2A4F"/>
      <path d="M0 14 V11 Q0 0 11 0 H16 V5 H5 V14 Z M84 14 V11 Q84 0 73 0 H68 V5 H79 V14 Z M0 98 V101 Q0 112 11 112 H16 V107 H5 V98 Z M84 98 V101 Q84 112 73 112 H68 V107 H79 V98 Z" fill="#FF7A00"/>
      <rect id="tabScr" x="8" y="10" width="68" height="92" rx="5" fill="#0B66D6"/>
      <rect x="8" y="10" width="68" height="14" rx="5" fill="#06132F" opacity=".55"/><rect x="13" y="15" width="30" height="4" rx="2" fill="#fff" opacity=".85"/>
      ${[0, 1, 2, 3].map(k => `<rect x="13" y="${31 + k * 15}" width="10" height="10" rx="2" fill="${k < 3 ? '#12B76A' : '#fff'}" opacity="${k < 3 ? 1 : .5}"/>${k < 3 ? `<path d="M15 ${36 + k * 15} l2.5 2.5 l4 -5" stroke="#fff" stroke-width="1.8" fill="none"/>` : ''}<rect x="27" y="${33 + k * 15}" width="${40 - k * 6}" height="5" rx="2.5" fill="#fff" opacity=".8"/>`).join('')}
      <rect x="13" y="92" width="58" height="5" rx="2.5" fill="#FFB81C"/>
      <path d="M10 12 L40 12 L14 60 Z" fill="#fff" opacity=".08"/>
    </g>
    ${glove(104, -300, -20)}
  </g>`;
}

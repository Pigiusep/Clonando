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
    <path d="M-40 -356 Q-62 -330 -62 -284" stroke="${C.shirtS}" stroke-width="27" stroke-linecap="round" fill="none"/>
    <path d="M-62 -284 Q-64 -254 -56 -232" stroke="${C.shirtS}" stroke-width="23" stroke-linecap="round" fill="none"/>
    <path d="M-50 -350 Q-60 -326 -58 -290" stroke="${C.shirt}" stroke-width="5" fill="none" opacity=".55"/>
    <rect x="-66" y="-250" width="20" height="10" rx="3" fill="${C.shirt}"/>
    ${glove(-55, -222, 8)}
    <rect x="-44" y="-238" width="5" height="34" rx="2" fill="#0B1530" transform="rotate(28 -42 -222)"/>
  </g>
  <!-- cabeza -->
  <g id="head">
    <path d="M-10 -386 H12 V-364 Q0 -358 -10 -364 Z" fill="${C.skinS}"/>
    <path d="M-25 -420 Q-27 -452 2 -456 Q33 -454 35 -424 Q37 -404 31 -393 Q22 -378 6 -376 Q-14 -378 -21 -392 Q-27 -404 -25 -420 Z" fill="${C.skin}"/>
    <path d="M-25 -420 Q-27 -440 -14 -450 Q-20 -420 -12 -392 Q-8 -382 6 -376 Q-14 -378 -21 -392 Q-27 -404 -25 -420 Z" fill="${C.skinS}" opacity=".75"/>
    <path d="M10 -378 Q24 -380 31 -393" stroke="${C.skinS}" stroke-width="3" fill="none"/>
    <path d="M-30 -430 Q-36 -404 -24 -390 Q-18 -386 -14 -392 L-17 -410 Q-19 -422 -12 -432 Z" fill="${C.hair}"/><path d="M-4 -432 Q2 -428 6 -432" stroke="${C.hair}" stroke-width="3" fill="none"/>
    <ellipse cx="-19" cy="-412" rx="6.5" ry="10" fill="${C.skinS}"/><path d="M-20 -418 Q-15 -412 -20 -405" stroke="${C.skinD}" stroke-width="1.8" fill="none"/>
    <path d="M7 -430 Q16 -435 26 -430" stroke="${C.hair}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M-8 -429 Q-2 -432 3 -430" stroke="${C.hair}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="17" cy="-419" rx="5.4" ry="3.8" fill="#fff"/><circle cx="18.4" cy="-419" r="2.8" fill="#4A2C1A"/><circle cx="18.4" cy="-419" r="1.3" fill="#120A05"/><circle cx="19.4" cy="-420.2" r=".9" fill="#fff"/>
    <path d="M11.5 -421 Q17 -425 22.5 -421" stroke="#6B3E2A" stroke-width="1.6" fill="none"/>
    <ellipse cx="-1" cy="-419" rx="3.6" ry="3.3" fill="#fff"/><circle cx="0" cy="-419" r="2.2" fill="#4A2C1A"/><circle cx=".6" cy="-419.8" r=".7" fill="#fff"/>
    <g id="lids" opacity="0"><ellipse cx="17" cy="-419" rx="6" ry="4.4" fill="${C.skin}"/><path d="M11.5 -418.5 Q17 -416 22.5 -418.5" stroke="#6B3E2A" stroke-width="1.6" fill="none"/>
      <ellipse cx="-1" cy="-419" rx="4.2" ry="3.9" fill="${C.skin}"/><path d="M-4 -418.5 Q-1 -417 2 -418.5" stroke="#6B3E2A" stroke-width="1.4" fill="none"/></g>
    <path d="M24 -416 Q31 -404 27 -400 Q23 -397 19 -400" stroke="${C.skinD}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="23" cy="-400" rx="5" ry="3" fill="#E8907A" opacity=".35"/>
    <path d="M11 -390 Q19 -385 26 -391" stroke="${C.lips}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M14 -386 Q19 -384 23 -387" stroke="${C.skinS}" stroke-width="1.4" fill="none"/>
    <path d="M-6 -428 H32 Q35 -428 34 -424 L32 -412 Q31 -410 28 -410 H10 Q7 -410 6 -414 L5 -420 H3 L2 -414 Q1 -410 -2 -410 H-6 Z" fill="#9FE3FF" opacity=".38" stroke="#1B2A4F" stroke-width="1.8"/>
    <path d="M12 -426 L18 -414 M24 -426 L28 -418" stroke="#fff" stroke-width="1.6" opacity=".7"/>
    <path d="M-6 -424 L-19 -418" stroke="#1B2A4F" stroke-width="2"/>
    <path d="M-31 -430 Q-31 -472 4 -474 Q40 -472 41 -432 Z" fill="url(#helmet)"/>
    <path d="M2 -474 Q6 -452 4 -432" stroke="#E0A500" stroke-width="7" fill="none"/>
    <path d="M-36 -432 H50 Q60 -431 58 -425 H-36 Q-40 -428 -36 -432 Z" fill="#D99A00"/>
    <path d="M-20 -458 Q-10 -468 4 -470" stroke="#fff" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>
    <circle cx="24" cy="-450" r="8" fill="#fff"/><path d="M24 -455 V-445 M19 -450 H29" stroke="#12B76A" stroke-width="3.2"/>
  </g>

  <!-- brazo delantero con tablet -->
  <g id="arm">
    <path d="M42 -354 Q64 -332 62 -290" stroke="${C.shirt}" stroke-width="28" stroke-linecap="round" fill="none"/>
    <path d="M62 -290 Q78 -282 104 -298" stroke="${C.shirt}" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M50 -350 Q66 -330 66 -300" stroke="${C.shirtS}" stroke-width="5" fill="none" opacity=".6"/>
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

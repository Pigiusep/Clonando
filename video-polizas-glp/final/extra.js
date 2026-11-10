// Sincronía con la locución (timeline.js) + iconos y piezas adicionales del video final.
const SEGS = Object.fromEntries(TL.segs.map(s => [s.id, s]));
const SC = Object.fromEntries(TL.scenes.map(s => [s.id, [s.start, s.end]]));
const TOTAL = TL.total;
const S = id => SEGS[id].start, E = id => SEGS[id].start + SEGS[id].dur;
// instante aproximado en que se pronuncia una palabra (proporcional a la posición en el texto)
const W = (id, w, off = 0) => { const s = SEGS[id]; const i = s.text.indexOf(w); if (i < 0) throw new Error('palabra no encontrada ' + id + ': ' + w); return s.start + 0.1 + i / s.text.length * (s.dur - 0.25) + off; };
window.TOTAL = TOTAL;

Object.assign(ICON9, {
  alerta: [P9('a', 'M32 7 L59 54 H5 Z'), P9('d', 'M32 24 V38'), { role: 'd', tag: 'circle', cx: 32, cy: 46, r: 1.6 }],
  ubicacion: [P9('b', 'M4 22 L20 16 L40 22 L60 16 V50 L40 56 L20 50 L4 56 Z'), P9('d', 'M20 16 V50'), P9('d', 'M40 22 V56'), P9('a', 'M32 4 C24.5 4 19 9.5 19 17 C19 27 32 38 32 38 C32 38 45 27 45 17 C45 9.5 39.5 4 32 4 Z'), { role: 'd', tag: 'circle', cx: 32, cy: 17, r: 4.5 }],
  monto: [P9('b', 'M4 14 H46 V40 H4 Z'), P9('d', 'M10 20 H16'), P9('d', 'M34 34 H40'), { role: 'd', tag: 'circle', cx: 25, cy: 27, r: 6 }, { role: 'a', tag: 'circle', cx: 44, cy: 44, r: 15 }, { role: 't', x: 44, y: 49.5, s: 14, txt: 'S/' }],
  tanque: [P9('l', 'M20 46 V54'), P9('l', 'M44 46 V54'), P9('l', 'M8 55 H56'), P9('a', 'M27 22 V15 H37 V22'), P9('l', 'M24 13 H40'), P9('b', 'M16 22 H48 A12 12 0 0 1 48 46 H16 A12 12 0 0 1 16 22 Z'), P9('d', 'M16 34 H48'), { role: 't', x: 32, y: 31.5, s: 8.5, txt: 'GLP' }],
  bienes: [P9('b', 'M8 30 L32 10 L56 30 V56 H8 Z'), P9('a', 'M26 56 V40 H38 V56 Z'), P9('d', 'M14 36 H20'), P9('d', 'M44 36 H50')],
  escudo: [P9('b', 'M32 6 L54 14 V30 C54 46 44 54 32 60 C20 54 10 46 10 30 V14 Z'), P9('d', 'M22 32 L29 39 L42 25'), { role: 'a', tag: 'circle', cx: 52, cy: 12, r: 7 }],
  carpeta: [P9('b', 'M6 16 H26 L31 22 H58 V54 H6 Z'), P9('a', 'M6 16 H26 L31 22 H6 Z'), P9('d', 'M14 34 H40'), P9('d', 'M14 42 H32')],
  certificado: [P9('b', 'M6 10 H58 V44 H6 Z'), P9('d', 'M14 20 H42'), P9('d', 'M14 28 H32'), P9('a', 'M38 48 L35 59 L43 55 L51 59 L48 48'), { role: 'a', tag: 'circle', cx: 43, cy: 40, r: 9 }],
  balanza: [P9('l', 'M32 8 V54'), P9('l', 'M20 56 H44'), P9('l', 'M10 16 H54'), P9('l', 'M10 16 L4 34'), P9('l', 'M10 16 L16 34'), P9('l', 'M54 16 L48 34'), P9('l', 'M54 16 L60 34'), P9('a', 'M2 34 A8 8 0 0 0 18 34 Z'), P9('a', 'M46 34 A8 8 0 0 0 62 34 Z')],
  clausula: [...DOC9.slice(0, 2), P9('d', 'M19 20 H40'), P9('a', 'M16 27 H44 V35 H16 Z'), P9('d', 'M19 43 H40'), P9('d', 'M19 50 H30')],
  calendario: [P9('b', 'M6 12 H58 V56 H6 Z'), P9('d', 'M6 24 H58'), P9('l', 'M18 6 V16'), P9('l', 'M46 6 V16'), P9('a', 'M34 34 H46 V46 H34 Z'), P9('d', 'M14 34 H24'), P9('d', 'M14 44 H24')],
  prohibido: [{ role: 'b', tag: 'circle', cx: 32, cy: 32, r: 26 }, P9('a', 'M14 50 L50 14')],
  normativa: [P9('b', 'M10 6 H44 L54 16 V58 H10 Z'), P9('d', 'M44 6 V16 H54'), { role: 't', x: 32, y: 32, s: 11, txt: 'D.S.' }, P9('d', 'M18 42 H46'), P9('a', 'M18 48 H38 V54 H18 Z')],
  flecha: [P9('l', 'M6 32 H54'), P9('a', 'M40 18 L56 32 L40 46 Z')],
});
// textos destacados dentro de párrafos: <m>…</m> se convierte en marcador animable
const MARK = t => t.replace(/<m>/g, '<span class="mk2">').replace(/<\/m>/g, '</span>');
function hl2(e, t) { tl.to(e, { backgroundSize: '100% 100%', duration: 0.6, ease: 'power2.inOut' }, t); }
// grupo de un "momento" de la escena: aparece en a y sale en z
function beat(c, a, z) { const g = el(c, '', 'inset:0', 'L'); gsap.set(g, { autoAlpha: 0 }); tl.set(g, { autoAlpha: 1 }, a); tl.to(g, { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power2.in' }, z - 0.42); return g; }
function head(g, t, text, o = {}) { const d = words(g, o.x ?? 150, o.y ?? 150, text, o.s ?? 64, { w: o.w ?? 1620, a: o.a }); wordsIn(d, t); return d; }
function para(g, x, y, w, html, t, o = {}) { const d = el(g, html, `left:${x}px;top:${y}px;width:${w}px;font-size:${o.s ?? 32}px;font-weight:${o.fw ?? 600};color:${o.c ?? 'var(--mut)'};line-height:1.35;text-align:${o.a ?? 'left'}`); rise(d, t, { y: 40, r: 0 }); return d; }
function pillAt(g, x, y, html, t, o = {}) { const p = el(g, html, `left:${x}px;top:${y}px;background:${o.bg ?? '#fff'};color:${o.c ?? 'var(--nv)'};font-size:${o.s ?? 30}px${o.css ? ';' + o.css : ''}`, 'pill'); pop(p, t, o.anim || {}); return p; }
function badge(g, x, y, size, name, t, label, o = {}) {
  const b = el(g, ic9(name), `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${o.bg ?? '#fff'}`, 'badge'); pop(b, t);
  let cp = null;
  if (label) {
    cp = o.side ? el(g, label, `left:${x + size + 30}px;top:${y + size / 2 - 22}px;width:${o.lw ?? 340}px;text-align:left;white-space:normal;font-size:${o.ls ?? 32}px;line-height:1.15`, 'cap')
                : el(g, label, `left:${x + size / 2 - (o.lw ?? 340) / 2}px;top:${y + size + 26}px;width:${o.lw ?? 340}px;white-space:normal;font-size:${o.ls ?? 32}px;line-height:1.15`, 'cap');
    rise(cp, t + 0.15, { y: 30, r: 0 });
  }
  return b;
}
function dcard(g, x, y, w, h, title, sub, icon, hbg, t, o = {}) {
  const k = card(g, x, y, w, h, `<div class="dh" style="background:${hbg}">${ic9(icon)}<div><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div></div><div class="rows"></div>`, o.css || '');
  if (t != null) rise(k, t, { y: o.y ?? 140, x: o.x ?? 0, r: o.r ?? 3 });
  return k;
}
function rows(k, list) {
  const body = k.querySelector('.rows');
  body.innerHTML = list.map(([l, v]) => `<div class="row"><div class="l">${l}</div><div class="v"><span class="mk"></span><span class="tx">${v}</span></div></div>`).join('');
  return [...body.querySelectorAll('.mk')];
}
const hl = (e, t) => tl.to(e, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, t);
function checkItem(g, x, y, text, t, o = {}) {
  const ok = o.ok ?? true, s = o.s ?? 34;
  const r = el(g, `<span class="cb" style="position:relative;display:inline-grid;place-items:center;width:${s + 16}px;height:${s + 16}px;border-radius:14px;border:4px solid var(--nv);background:#fff;margin-right:20px;vertical-align:middle;flex:none"></span><span>${text}</span>`,
    `left:${x}px;top:${y}px;width:${o.w ?? 900}px;font-size:${s}px;font-weight:800;display:flex;align-items:center;line-height:1.15`);
  rise(r, t - 0.35, { x: -70, y: 0, r: 0 });
  const ck = el(r.querySelector('.cb'), ic(ok ? 'check' : 'x', '#fff', 3.6), `inset:-4px;border-radius:14px;background:${ok ? 'var(--ok)' : 'var(--no)'};display:grid;place-items:center;border:4px solid var(--nv)`);
  ck.querySelector('svg').setAttribute('width', s); pop(ck, t + 0.15, { s: 0, e: 'back.out(3)', d: 0.4 }); SFX.push({ t: t + 0.2, k: ok ? 'ok' : 'no' });
  return r;
}
function stamp(g, x, y, text, col, t, rot = -8) {
  const p = el(g, text, `left:${x}px;top:${y}px;background:${col};color:#fff;font-size:40px;letter-spacing:.04em;transform:rotate(${rot}deg)`, 'pill');
  SFX.push({ t, k: 'thud' }); hide(p, { scale: 2.6 }); tl.to(p, { autoAlpha: 1, scale: 1, duration: 0.32, ease: 'power4.in' }, t); return p;
}
function arrow(g, x1, y1, x2, y2, t, col = '#0A1F4F') {
  const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const d = el(g, `<svg width="${L + 30}" height="40" style="overflow:visible"><path d="M4 20 H${L - 14}" stroke="${col}" stroke-width="7" stroke-linecap="round" fill="none" stroke-dasharray="${L}" stroke-dashoffset="${L}"/><path d="M${L - 22} 6 L${L} 20 L${L - 22} 34 Z" fill="#FF7A00" stroke="${col}" stroke-width="4" stroke-linejoin="round" opacity="0"/></svg>`,
    `left:${x1}px;top:${y1 - 20}px;transform-origin:0 20px;transform:rotate(${a}deg)`);
  const [p1, p2] = d.querySelectorAll('path');
  tl.to(p1, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, t); tl.to(p2, { opacity: 1, duration: 0.2 }, t + 0.5);
  return d;
}
function counterTo(e, v, t, d = 0.9) { tl.fromTo(e, { innerText: 0 }, { innerText: v, snap: { innerText: 1 }, duration: d, ease: 'power2.out', immediateRender: false }, t); }
function scene(id, num, name, bg) {
  const [a, z] = SC[id]; const c = el(FX, '', '', 'sc');
  tl.set(c, { visibility: 'visible' }, a); tl.set(c, { visibility: 'hidden' }, z + 0.2);
  if (bg) bg([a, z]);
  if (num) hud(a + 0.3, num, name);
  return c;
}

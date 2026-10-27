// Utilidades de animación. Todo se controla desde un timeline GSAP pausado
// y se renderiza cuadro a cuadro con window.renderAt(t).
gsap.defaults({ ease: 'power3.out', duration: 0.6 });
const tl = gsap.timeline({ paused: true });
const SEG = {}; TL.segs.forEach(s => SEG[s.id] = s);
const SCN = {}; TL.scenes.forEach(s => SCN[s.id] = s);
const $ = s => document.querySelector(s);
const FX = $('#fx');
const SVGNS = 'http://www.w3.org/2000/svg';
const tickers = [];
const SFX = [];   // eventos de sonido {t, k}
window.SFX = SFX;   // funciones f(t) evaluadas cada cuadro (contadores, cámara, ambiente)

// tiempo de una frase: S('e1a') inicio, E('e1a') fin, W('e1a','terceros') ~instante de la palabra
const S = id => SEG[id].start;
const E = id => SEG[id].start + SEG[id].dur;
function W(id, word, off = 0) {
  const s = SEG[id], txt = s.text, i = txt.indexOf(word);
  if (i < 0) throw new Error('palabra no encontrada: ' + id + ' / ' + word);
  // la voz tarda un poco en arrancar; reparto proporcional a caracteres
  return s.start + 0.1 + (i / txt.length) * (s.dur - 0.2) + off;
}

function node(parent, html, style = {}, cls = '') {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  d.innerHTML = html;
  Object.assign(d.style, style);
  if (!d.className.includes('abs') && style.left !== undefined) d.classList.add('abs');
  parent.appendChild(d);
  return d;
}
const px = v => (typeof v === 'number' ? v + 'px' : v);
function at(parent, x, y, html, cls = '', extra = {}) {
  return node(parent, html, Object.assign({ left: px(x), top: px(y) }, extra), cls + ' abs');
}

// contenedor de escena: visible sólo durante la escena
function scene(id) {
  const c = node(FX, '', {}, 'sc');
  c.id = 'sc-' + id;
  const sc = SCN[id];
  tl.set(c, { visibility: 'visible' }, sc.start + 0.35);
  tl.set(c, { visibility: 'hidden' }, sc.end + 0.45);
  return c;
}

// ---------- entradas / salidas ----------
function hide(el, v = {}) { gsap.set(el, Object.assign({ autoAlpha: 0 }, v)); return el; }
function pop(el, t, o = {}) {
  SFX.push({ t, k: 'pop' });
  hide(el, { scale: o.from ?? 0.3, rotation: o.rot ?? 0 });
  tl.to(el, { autoAlpha: 1, scale: 1, rotation: 0, duration: o.d ?? 0.55, ease: o.ease ?? 'back.out(2.2)' }, t);
  return el;
}
function slide(el, t, o = {}) {
  SFX.push({ t, k: 'tick' });
  hide(el, { x: o.x ?? 0, y: o.y ?? 0, rotation: o.rot ?? 0, scale: o.s ?? 1 });
  tl.to(el, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: o.d ?? 0.7, ease: o.ease ?? 'expo.out' }, t);
  return el;
}
function out(el, t, o = {}) {
  tl.to(el, Object.assign({ autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, o), t);
  return el;
}
function flip(el, t, o = {}) {
  hide(el, { rotationY: o.ry ?? -80, transformPerspective: 1400, x: o.x ?? -120 });
  tl.to(el, { autoAlpha: 1, rotationY: 0, x: 0, duration: 0.9, ease: 'expo.out' }, t);
  return el;
}

// texto cinético: palabras con máscara. *texto* → naranja, _texto_ → cian, ~texto~ → amarillo
function kt(parent, x, y, text, size, o = {}) {
  const words = text.split(' ').map(w => {
    let cls = '';
    if (/^\*.*\*[.,:]?$/.test(w)) { cls = 'hl'; w = w.replace(/\*/g, ''); }
    else if (/^_.*_[.,:]?$/.test(w)) { cls = 'hc'; w = w.replace(/_/g, ''); }
    else if (/^~.*~[.,:]?$/.test(w)) { cls = 'hy'; w = w.replace(/~/g, ''); }
    if (w === '/') return '<br>';
    return `<span class="w"><span class="${cls}">${w}</span></span>`;
  }).join(' ');
  const el = at(parent, x, y, words, 'kt', { fontSize: px(size), width: px(o.w ?? 1600), textAlign: o.align ?? 'left', color: o.color ?? '' });
  gsap.set(el, { autoAlpha: 0 });
  return el;
}
function ktIn(el, t, o = {}) {
  SFX.push({ t, k: 'swish' });
  const ws = el.querySelectorAll('.w>span');
  gsap.set(ws, { yPercent: 125, rotation: o.rot ?? 6 });
  tl.set(el, { autoAlpha: 1 }, t);
  tl.to(ws, { yPercent: 0, rotation: 0, duration: o.d ?? 0.7, ease: 'expo.out', stagger: o.st ?? 0.06 }, t);
  return el;
}
function ktOut(el, t) {
  const ws = el.querySelectorAll('.w>span');
  tl.to(ws, { yPercent: -110, duration: 0.45, ease: 'power3.in', stagger: 0.025 }, t);
  return el;
}

// contador numérico
function counter(el, t, from, to, d = 1.2, fmt = v => Math.round(v).toLocaleString('es-PE')) {
  const o = { v: from };
  tl.to(o, { v: to, duration: d, ease: 'power2.out' }, t);
  tickers.push(() => { const s = fmt(o.v); if (el.textContent !== s) el.textContent = s; });
  return o;
}

// iconos SVG simples (trazos)
const ICON = {
  shield: '<path d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M22 32 L29 39 L43 24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
  people: '<circle cx="22" cy="22" r="8" fill="currentColor"/><circle cx="44" cy="22" r="8" fill="currentColor"/><path d="M8 52 C8 38 36 38 36 52 Z M30 52 C30 38 58 38 58 52 Z" fill="currentColor"/>',
  house: '<path d="M8 30 L32 10 L56 30 V56 H8 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><rect x="26" y="38" width="12" height="18" fill="currentColor"/>',
  leaf: '<path d="M12 52 C12 24 30 10 54 10 C54 36 40 52 12 52 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M12 52 L38 26" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
  factory: '<path d="M6 56 V28 L20 36 V28 L34 36 V28 L48 36 V10 H58 V56 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>',
  doc: '<path d="M14 6 H40 L52 18 V58 H14 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M22 30 H44 M22 40 H44 M22 50 H36" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  search: '<circle cx="28" cy="28" r="16" fill="none" stroke="currentColor" stroke-width="6"/><path d="M40 40 L56 56" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>',
  alert: '<path d="M32 6 L60 56 H4 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M32 24 V40" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="48" r="3.5" fill="currentColor"/>',
  coin: '<ellipse cx="32" cy="18" rx="22" ry="9" fill="none" stroke="currentColor" stroke-width="5"/><path d="M10 18 V44 C10 49 20 53 32 53 C44 53 54 49 54 44 V18 M10 31 C10 36 20 40 32 40 C44 40 54 36 54 31" fill="none" stroke="currentColor" stroke-width="5"/>',
  cal: '<rect x="8" y="12" width="48" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="5"/><path d="M8 26 H56 M20 6 V16 M44 6 V16" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
  pin: '<path d="M32 58 C32 58 12 38 12 24 C12 13 21 6 32 6 C43 6 52 13 52 24 C52 38 32 58 32 58 Z" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="24" r="7" fill="currentColor"/>',
  folder: '<path d="M6 16 H26 L32 22 H58 V54 H6 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>',
  check: '<path d="M14 34 L27 47 L52 18" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M18 18 L46 46 M46 18 L18 46" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>',
  refresh: '<path d="M50 24 A20 20 0 1 0 52 38" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M52 10 V26 H36" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  gear: '<circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" stroke-width="5"/><path d="M32 6 V14 M32 50 V58 M6 32 H14 M50 32 H58 M13 13 L19 19 M45 45 L51 51 M13 51 L19 45 M45 19 L51 13" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
  truck: '<rect x="4" y="18" width="36" height="24" rx="10" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 26 H50 L58 34 V42 H40" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><circle cx="16" cy="48" r="6" fill="currentColor"/><circle cx="48" cy="48" r="6" fill="currentColor"/>',
  link: '<rect x="4" y="22" width="30" height="20" rx="10" fill="none" stroke="currentColor" stroke-width="6"/><rect x="30" y="22" width="30" height="20" rx="10" fill="none" stroke="currentColor" stroke-width="6"/>',
  pump: '<rect x="12" y="8" width="26" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="5"/><rect x="18" y="14" width="14" height="12" fill="currentColor"/><path d="M38 20 H46 L52 28 V46 C52 50 46 50 46 46 V36" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
  list: '<path d="M24 16 H56 M24 32 H56 M24 48 H56" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="11" cy="16" r="4" fill="currentColor"/><circle cx="11" cy="32" r="4" fill="currentColor"/><circle cx="11" cy="48" r="4" fill="currentColor"/>',
  bolt: '<path d="M36 4 L12 36 H30 L26 60 L52 26 H34 Z" fill="currentColor"/>',
};
const ic = (name, size = 40, color = 'currentColor') => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="color:${color}">${ICON[name]}</svg>`;

function chip(parent, x, y, icon, text, cls = '') {
  return at(parent, x, y, `<span class="ic">${ic(icon, 38)}</span><span>${text}</span>`, 'chip ' + cls);
}

// círculo con check / cruz que se dibuja
function mark(parent, x, y, ok, t, size = 92) {
  SFX.push({ t: t + 0.15, k: ok ? 'ok' : 'no' });
  const col = ok ? 'var(--green)' : 'var(--red)';
  const el = at(parent, x, y, `<svg viewBox="0 0 92 92" width="${size}" height="${size}">
    <circle cx="46" cy="46" r="42" fill="${col}"/>
    ${ok ? '<path class="p" d="M26 47 L40 61 L67 31" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'
         : '<path class="p" d="M30 30 L62 62 M62 30 L30 62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>'}
  </svg>`, 'mark', { width: px(size), height: px(size) });
  pop(el, t, { from: 0, rot: -90 });
  const p = el.querySelector('.p'); const L = 90;
  gsap.set(p, { strokeDasharray: L, strokeDashoffset: L, opacity: 0 }); tl.set(p, { opacity: 1 }, t + 0.2);
  tl.to(p, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, t + 0.2);
  return el;
}

// trazo SVG que se dibuja
function draw(path, t, d = 0.8, ease = 'power2.inOut') {
  const L = path.getTotalLength ? path.getTotalLength() : 2000;
  gsap.set(path, { strokeDasharray: L, strokeDashoffset: L, opacity: 0 });
  tl.set(path, { opacity: 1 }, t);
  tl.to(path, { strokeDashoffset: 0, duration: d, ease }, t);
}

// línea conectora en una capa SVG a pantalla completa
function svgLayer(parent) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('width', 1920); s.setAttribute('height', 1080);
  s.setAttribute('viewBox', '0 0 1920 1080');
  s.style.position = 'absolute'; s.style.left = 0; s.style.top = 0; s.style.overflow = 'visible';
  parent.appendChild(s);
  return s;
}
function svgEl(parent, tag, attrs) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}

// marcador fosforescente sobre filas de documento / texto normativo
function mk(el, t, d = 0.6) {
  if (el.classList.contains('hlx')) tl.to(el, { backgroundSize: '100% 100%', duration: d, ease: 'power2.inOut' }, t);
  else tl.to(el, { scaleX: 1, duration: d, ease: 'power2.inOut' }, t);
}

// documento genérico
function doc(parent, x, y, w, title, sub, rows, o = {}) {
  const r = rows.map(([l, v, key]) => `<div class="row" data-k="${key || l}"><div class="l">${l}</div><div class="v"><span class="mk"></span><span class="tx">${v}</span></div></div>`).join('');
  const el = at(parent, x, y, `<div class="hd">${ic(o.icon || 'doc', 40, o.iconColor || 'var(--cyan)')}<div>${title}<small>${sub}</small></div></div><div class="bd">${r}${o.extra || ''}</div>`, 'doc', { width: px(w) });
  if (o.hd) el.querySelector('.hd').style.background = o.hd;
  el.row = k => el.querySelector(`.row[data-k="${k}"]`);
  el.mk = k => el.row(k).querySelector('.mk');
  el.tx = k => el.row(k).querySelector('.tx');
  return el;
}

// sello (VIGENTE / OBSERVADA ...)
function stamp(parent, x, y, text, color, t) {
  SFX.push({ t: t + 0.3, k: 'thud' });
  const el = at(parent, x, y, text, 'stamp', { color, borderColor: color, position: 'absolute', fontFamily: 'M', fontWeight: 900, fontSize: '54px', padding: '6px 24px', border: '7px solid', borderRadius: '12px', background: 'rgba(255,255,255,.85)' });
  hide(el, { scale: 3, rotation: -30 });
  tl.to(el, { autoAlpha: 1, scale: 1, rotation: -12, duration: 0.35, ease: 'power4.in' }, t);
  shake(t + 0.35, 10);
  return el;
}

// sacudida de cámara global
function shake(t, amp = 14) {
  const st = $('#stage');
  tl.to(st, { keyframes: [{ x: amp, y: -amp * 0.6 }, { x: -amp * 0.8, y: amp * 0.5 }, { x: amp * 0.4, y: -amp * 0.3 }, { x: 0, y: 0 }], duration: 0.32, ease: 'none' }, t);
}
function flash(t, a = 0.5) {
  tl.to('#flash', { keyframes: [{ opacity: a, duration: 0.06 }, { opacity: 0, duration: 0.35 }] }, t);
}

// cortinilla de transición entre escenas (centro de la cortina en t)
function wipe(t) {
  SFX.push({ t: t - 0.45, k: 'whoosh' });
  const bars = document.querySelectorAll('#wipe b');
  bars.forEach((b, i) => {
    tl.fromTo(b, { x: -3200 + i * 20 }, { x: 2600, duration: 1.1, ease: 'power3.inOut', immediateRender: false }, t - 0.55 + i * 0.05);
  });
}

// título de escena con número
function sceneTitle(c, t, num, tag, title) {
  const g = at(c, 0, 0, '', '', { width: '1920px', height: '1080px' });
  const box = at(g, 140, 330, `<div class="num">${num}</div><div class="tag">${tag}</div><div class="bar"></div>`, 'stitle');
  const k = kt(box, 330, 70, title, 84, { w: 1380 });
  const n = box.querySelector('.num'), tg = box.querySelector('.tag'), bar = box.querySelector('.bar');
  hide(n, { x: -200 }); hide(tg, { x: 60 }); gsap.set(bar, { scaleX: 0 });
  tl.to(n, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'expo.out' }, t);
  tl.to(tg, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, t + 0.1);
  ktIn(k, t + 0.15, { st: 0.05 });
  tl.to(bar, { scaleX: 1, duration: 0.7, ease: 'expo.inOut' }, t + 0.35);
  tl.to(box, { y: -60, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, t + 1.95);
  // capítulo en HUD
  tl.set('#chapNum', { textContent: num }, t + 0.1);
  tl.set('#chapTxt', { textContent: tag }, t + 0.1);
  tl.fromTo('#chap', { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.6, immediateRender: false }, t + 2.2);
  return g;
}

// atenuar el mundo para gráficos a pantalla completa
function dim(t, v = 1, d = 0.6) { tl.to('#dim', { opacity: v, duration: d, ease: 'power2.inOut' }, t); }

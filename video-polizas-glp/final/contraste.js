// Mide el contraste real del texto que va directamente sobre la foto (no dentro de tarjetas).
const { chromium } = require('playwright');
const sharp = null;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + __dirname + '/index.html' + (process.argv[2] ? '?velo=' + process.argv[2] : '')); await p.waitForFunction('window.READY');
  const res = [];
  for (let t = 1; t < 124; t += 1.5) {
    await p.evaluate(t => window.renderAt(t), t);
    const boxes = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('#fx *').forEach(e => {
        if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        if (e.closest('.k,.pill,.badge,.hl,.mark')) return;
        let op = 1, x = e; while (x && x !== document.body) { const cs = getComputedStyle(x); if (cs.visibility === 'hidden' || cs.display === 'none') return; op *= +cs.opacity; x = x.parentElement; }
        if (op < 0.98) return;
        const r = e.getBoundingClientRect(); if (r.width < 5 || r.bottom < 0 || r.top > 1080) return;
        out.push({ x: r.left, y: r.top, w: r.width, h: r.height, c: getComputedStyle(e).color, tx: e.textContent.trim().slice(0, 40) });
      });
      return out;
    });
    if (!boxes.length) continue;
    await p.evaluate(() => { ['fx','wipes','hud','prog'].forEach(i => document.getElementById(i).style.opacity = '0'); });
    const png = await p.screenshot({ type: 'png' });
    await p.evaluate(() => { ['fx','wipes','hud','prog'].forEach(i => document.getElementById(i).style.opacity = ''); });
    const px = await p.evaluate(async ({ png, boxes }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
      const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
      const L = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gg, bb) => 0.2126 * L(r) + 0.7152 * L(gg) + 0.0722 * L(bb);
      return boxes.map(bx => {
        const d = g.getImageData(Math.max(0, bx.x | 0), Math.max(0, bx.y | 0), Math.max(1, bx.w | 0), Math.max(1, bx.h | 0)).data; const ls = [];
        for (let i = 0; i < d.length; i += 16) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b); const bg = ls[Math.floor(ls.length * 0.05)];
        const m = bx.c.match(/\d+/g).map(Number); const tl = lum(...m);
        return { bg, tl, n: ls.length, tx: bx.tx, ratio: +((Math.max(bg, tl) + 0.05) / (Math.min(bg, tl) + 0.05)).toFixed(1) };
      });
    }, { png: png.toString('base64'), boxes });
    px.forEach(r => res.push({ t, ...r }));
  }
  const uniq = {}; res.forEach(r => { if (!uniq[r.tx] || uniq[r.tx].ratio > r.ratio) uniq[r.tx] = r; });
  const list = Object.values(uniq).sort((a, b) => a.ratio - b.ratio);
  console.log('textos medidos:', list.length); list.slice(0, 10).forEach(r => console.log(r.ratio, '@' + r.t, r.tx));
  await b.close();
})();

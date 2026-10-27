// node still.js t1 t2 ... -> stills/t.jpg
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/index.html');
  await p.waitForFunction(() => window.READY === true, null, { timeout: 20000 }).catch(e => console.log('noready', errs));
  require('fs').mkdirSync(__dirname + '/stills', { recursive: true });
  const ts = process.argv.slice(2).map(Number).sort((a, b) => a - b);
  let cur = 0;
  for (const t of ts) {
    // avanzar progresivamente para inicializar tweens en orden
    while (cur < t) { cur = Math.min(t, cur + 0.5); await p.evaluate(x => window.renderAt(x), cur); }
    await p.screenshot({ path: `${__dirname}/stills/${t.toFixed(1)}.jpg`, type: 'jpeg', quality: 70 });
  }
  if (errs.length) console.log('ERR', errs.slice(0, 5));
  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + __dirname + '/index.html'); await p.waitForFunction('window.READY', null, { timeout: 30000 }).catch(e => errs.push('noready'));
  const dir = process.argv[2]; require('fs').mkdirSync(dir, { recursive: true });
  let ts = process.argv.slice(3);
  if (ts[0] === 'segs') { ts = await p.evaluate(() => TL.segs.map(s => [s.id, s.start + s.dur - 0.5])); }
  else ts = ts.map(t => [t, +t]);
  for (const [n, t] of ts) { await p.evaluate(t => window.renderAt(t), t); await p.screenshot({ path: `${dir}/${n}.jpg`, quality: 70, type: 'jpeg' }); }
  console.log('errs', errs.slice(0, 5)); await b.close();
})();

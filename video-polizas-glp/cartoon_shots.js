// Capturas del personaje cartoon: node cartoon_shots.js nombre z y [pose JSON]
const { chromium } = require('playwright');
(async () => {
  const [name, z = '2', y = '-240', pose = '{}', t = '12.3'] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/index.html'); await p.waitForFunction(() => window.READY === true, null, { timeout: 15000 }).catch(() => console.log(errs));
  await p.evaluate(([z, y, pose, t]) => {
    window.renderAt(1);
    ['#fx', '#hud'].forEach(s => document.querySelector(s).style.display = 'none');
    document.querySelector('#dim').style.opacity = 0; const w = document.querySelector('#world'); w.style.opacity = 1; w.style.visibility = 'visible';
    document.querySelectorAll('#callouts g').forEach(g => g.style.display = 'none');
    Object.assign(WORLD.st, pose); Object.assign(WORLD.cam, { x: 1975, y: 880 + y, z });
    for (const f of tickers) f(t);
  }, [+z, +y, JSON.parse(pose), +t]);
  await p.screenshot({ path: `${__dirname}/stills/${name}.jpg`, type: 'jpeg', quality: 90 });
  await b.close();
})();

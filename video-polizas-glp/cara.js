// Primer plano del operario: node cara.js nombre [z] [y]
const { chromium } = require('playwright');
(async () => {
  const [name = 'cara', z = '7', y = '-415', t = '12'] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + __dirname + '/index.html'); await p.waitForFunction(() => window.READY === true);
  await p.evaluate(() => window.renderAt(1)); if (process.env.POSE) await p.evaluate(s => { window.POSE = JSON.parse(s); }, process.env.POSE);
  await p.evaluate(([z, y, t]) => {
    ['#fx', '#hud'].forEach(s => document.querySelector(s).style.display = 'none');
    document.querySelector('#dim').style.opacity = 0; const w = document.querySelector('#world'); w.style.opacity = 1; w.style.visibility = 'visible';
    document.querySelectorAll('#callouts g').forEach(g => g.style.display = 'none');
    if (window.POSE) Object.assign(WORLD.st, POSE); Object.assign(WORLD.cam, { x: 1960 + 10, y: 880 + y, z }); for (const f of tickers) f(t);
    WORLD.cam.x = 1960 + 10; WORLD.cam.y = 880 + y; WORLD.cam.z = z;
    document.querySelector('#cam').setAttribute('transform', `translate(960 540) scale(${z}) translate(${-(1970)} ${-(880 + y)})`);
  }, [+z, +y, +t]);
  await p.screenshot({ path: `${__dirname}/stills/${name}.jpg`, type: 'jpeg', quality: 88 });
  await b.close();
})();

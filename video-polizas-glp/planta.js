// Capturas de la planta ilustrada con encuadres fijos (sin gráficos encima)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + __dirname + '/index.html' + (process.env.THEME ? '#' + process.env.THEME : '')); await p.waitForFunction(() => window.READY === true);
  await p.evaluate(() => window.renderAt(12));
  const shots = { operario: [1990, 470, 3.0], operario2: [1990, 640, 1.9], general: [1950, 560, 0.47], tanque: [930, 600, 1.05], inspector: [1900, 620, 1.25], regulacion: [2300, 640, 1.2], caldero: [3060, 560, 0.95], terceros: [3900, 650, 0.9] };
  for (const [n, [x, y, z]] of Object.entries(shots)) {
    await p.evaluate(([x, y, z]) => {
      document.querySelector('#fx').style.display = 'none'; document.querySelector('#hud').style.display = 'none';
      document.querySelector('#dim').style.opacity = 0; document.querySelector('#world').style.opacity = 1; document.querySelector('#world').style.visibility = 'visible';
      WORLD.st.beam = 1; Object.assign(WORLD.cam, { x, y, z }); for (const f of tickers) f(12);
    }, [x, y, z]);
    await p.screenshot({ path: `${__dirname}/stills/planta_${n}.jpg`, type: 'jpeg', quality: 85 });
  }
  await b.close();
})();

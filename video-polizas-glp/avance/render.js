// node render.js [fps] [workers] [t0] [t1] -> out/chunk_XX.mp4 + out/sfx.json
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const fps = +(process.argv[2] || 30), NW = +(process.argv[3] || 4);
const OUT = __dirname + '/out'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-device-scale-factor=1'] });
  const probe = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await probe.goto('file://' + __dirname + '/index.html');
  await probe.waitForFunction(() => window.READY === true);
  const dur = await probe.evaluate(() => window.DURATION);
  fs.writeFileSync(OUT + '/sfx.json', JSON.stringify(await probe.evaluate(() => window.SFX)));
  await probe.close();
  const T0 = +(process.argv[4] || 0), T1 = +(process.argv[5] || dur);
  const f0 = Math.round(T0 * fps), f1 = Math.round(T1 * fps), per = Math.ceil((f1 - f0) / NW);
  const t = Date.now();
  await Promise.all(Array.from({ length: NW }, async (_, w) => {
    const a = f0 + w * per, z = Math.min(f1, a + per);
    if (a >= z) return;
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.goto('file://' + __dirname + '/index.html');
    await p.waitForFunction(() => window.READY === true);
    // inicializar el timeline en orden hasta el inicio del tramo
    for (let s = 0; s < a / fps; s += 0.5) await p.evaluate(x => window.renderAt(x), s);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', `${OUT}/chunk_${String(w).padStart(2, '0')}.mp4`]);
    for (let f = a; f < z; f++) {
      await p.evaluate(x => window.renderAt(x), f / fps);
      const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (w === 0 && (f - a) % 300 === 0) console.log(`w0 ${f - a}/${z - a}  ${((Date.now() - t) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    await p.close();
  }));
  console.log('listo', ((Date.now() - t) / 1000).toFixed(0), 's');
  await b.close();
})();

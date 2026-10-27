// Render del personaje 3D en alta resolución: node cabeza3d.js nombre modo(cabeza|cuerpo) rotY... [pose JSON en env POSE]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [name, modo, ...rots] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + __dirname + '/index.html'); await p.waitForFunction(() => window.READY === true);
  const imgs = await p.evaluate(([modo, rots, pose]) => {
    const C = CHAR3D, out = [];
    const r = C.renderer; r.setSize(modo === 'cabeza' ? 900 : 700, modo === 'cabeza' ? 900 : 1400, false);
    const cam = C.cam, o = { l: cam.left, r: cam.right, t: cam.top, b: cam.bottom };
    if (modo === 'cabeza') { cam.left = -0.2; cam.right = 0.2; cam.top = 1.86; cam.bottom = 1.46; }
    else { cam.left = -0.55; cam.right = 0.55; cam.top = 2.0; cam.bottom = -0.2; }
    cam.updateProjectionMatrix();
    for (const ry of rots) {
      C.pose(12.3, Object.assign({}, pose));
      C.scene.children.find(c => c.type === 'Group').rotation.y = +ry;
      r.render(C.scene, cam); out.push(r.domElement.toDataURL('image/png'));
    }
    return out;
  }, [modo, rots, JSON.parse(process.env.POSE || '{}')]);
  imgs.forEach((d, i) => fs.writeFileSync(`${__dirname}/stills/${name}_${i}.png`, Buffer.from(d.split(',')[1], 'base64')));
  await b.close();
})();

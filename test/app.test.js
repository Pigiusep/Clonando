const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { leerConfig } = require('../src/config');
const {
  nuevaDb, nuevaApp, tokenDe, ingresar, sesionAdmin, PASSWORD_ADMIN, PASSWORD_NUEVA,
} = require('./ayuda');

function esperar(res, status, location) {
  assert.strictEqual(res.status, status);
  if (location) assert.strictEqual(res.headers.location, location);
}

test('pide iniciar sesión y rechaza contraseñas incorrectas', async () => {
  const { app } = nuevaApp();
  await request(app).get('/productos').expect(302).expect('Location', '/login');
  await request(app).get('/api/productos').expect(401);
  const agente = request.agent(app);
  esperar(await ingresar(agente, 'admin', 'incorrecta'), 401);
  esperar(await ingresar(agente, 'no-existe', 'incorrecta'), 401);
});

test('el primer ingreso obliga a cambiar la contraseña temporal', async () => {
  const { app } = nuevaApp();
  const agente = request.agent(app);
  esperar(await ingresar(agente, 'admin', PASSWORD_ADMIN), 302, '/cuenta/password');
  await agente.get('/productos').expect(302).expect('Location', '/cuenta/password');
  await agente.get('/api/productos').expect(403);

  const token = tokenDe((await agente.get('/cuenta/password')).text);
  const debil = await agente.post('/cuenta/password').type('form')
    .send({ _csrf: token, actual: PASSWORD_ADMIN, nueva: 'corta', confirmacion: 'corta' }).expect(400);
  assert.match(debil.text, /al menos 10/);
  const comun = await agente.post('/cuenta/password').type('form')
    .send({ _csrf: token, actual: PASSWORD_ADMIN, nueva: 'administrador', confirmacion: 'administrador' }).expect(400);
  assert.match(comun.text, /común/);
  await agente.post('/cuenta/password').type('form')
    .send({ _csrf: token, actual: PASSWORD_ADMIN, nueva: PASSWORD_NUEVA, confirmacion: PASSWORD_NUEVA })
    .expect(302).expect('Location', '/');
  await agente.get('/productos').expect(200);
});

test('los POST sin token CSRF válido se rechazan', async () => {
  const { agente, token } = await sesionAdmin(nuevaDb());
  await agente.post('/productos').type('form').send({ nombre: 'Sin token' }).expect(403);
  await agente.post('/productos').type('form').send({ _csrf: 'falso', nombre: 'Token falso' }).expect(403);
  await agente.post('/api/movimientos').send({ codigo: 'X', tipo: 'entrada', cantidad: 1 }).expect(403);
  await agente.post('/productos').type('form').send({ _csrf: token, nombre: 'Con token' }).expect(302);
});

test('flujo completo: crear producto con código automático, escanear y consultar', async () => {
  const { agente, token } = await sesionAdmin(nuevaDb());
  const creado = await agente.post('/productos').type('form')
    .send({ _csrf: token, codigo: '', nombre: 'Leche', unidad: 'UND', stock_minimo: '2' }).expect(302);
  const url = creado.headers.location;

  const api = (cuerpo) => agente.post('/api/movimientos').set('X-CSRF-Token', token).send(cuerpo);
  const mov = await api({ codigo: 'P00001', tipo: 'entrada', cantidad: 5 }).expect(201);
  assert.strictEqual(mov.body.stock, 5);
  const err = await api({ codigo: 'p00001', tipo: 'salida', cantidad: 9 }).expect(400);
  assert.match(err.body.error, /Stock insuficiente/);
  await api({ codigo: 'NOEXISTE', tipo: 'entrada', cantidad: 1 }).expect(404);

  const consulta = await agente.get('/api/productos/codigo/P00001').expect(200);
  assert.strictEqual(consulta.body.nombre, 'Leche');

  for (const ruta of ['/', '/productos', url, `${url}/editar`, '/productos/etiquetas', '/productos/etiquetas?formato=rollo&ids=1',
    '/movimientos', '/escanear', '/excel', '/usuarios', '/cuenta/password']) {
    const r = await agente.get(ruta);
    assert.strictEqual(r.status, 200, `${ruta} respondió ${r.status}`);
  }
  const detalle = await agente.get(url);
  assert.match(detalle.text, /data:image\/png;base64/);
  assert.match(detalle.text, /P00001/);

  const xlsx = await agente.get('/excel/productos.xlsx').expect(200);
  assert.match(xlsx.headers['content-type'], /spreadsheetml/);
});

test('cabeceras de seguridad y páginas sin caché', async () => {
  const { agente } = await sesionAdmin(nuevaDb());
  const r = await agente.get('/productos').expect(200);
  assert.match(r.headers['content-security-policy'], /default-src 'self'/);
  assert.strictEqual(r.headers['x-content-type-options'], 'nosniff');
  assert.strictEqual(r.headers['cache-control'], 'no-store');
  assert.strictEqual(r.headers['x-powered-by'], undefined);
  assert.match(r.headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.strictEqual(r.headers['referrer-policy'], 'same-origin');
  const cookie = (await request(nuevaApp().app).get('/login')).headers['set-cookie'][0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
});

test('bloquea el inicio de sesión tras 10 intentos fallidos', async () => {
  const { app } = nuevaApp();
  const agente = request.agent(app);
  for (let i = 0; i < 10; i++) esperar(await ingresar(agente, 'admin', 'incorrecta'), 401);
  esperar(await ingresar(agente, 'admin', PASSWORD_ADMIN), 429);
});

test('los operadores no pueden administrar; desactivar a alguien cierra su sesión', async () => {
  const db = nuevaDb();
  const { agente, token, app } = await sesionAdmin(db);
  await agente.post('/usuarios').type('form')
    .send({ _csrf: token, usuario: 'almacen', nombre: 'Almacén', password: 'temporal-12345', rol: 'operador' }).expect(302);

  const operador = request.agent(app);
  esperar(await ingresar(operador, 'almacen', 'temporal-12345'), 302, '/cuenta/password');
  let tokenOp = tokenDe((await operador.get('/cuenta/password')).text);
  await operador.post('/cuenta/password').type('form')
    .send({ _csrf: tokenOp, actual: 'temporal-12345', nueva: 'clave-del-deposito-1', confirmacion: 'clave-del-deposito-1' }).expect(302);
  tokenOp = tokenDe((await operador.get('/escanear').expect(200)).text);
  await operador.get('/usuarios').expect(403);
  await operador.post('/excel/importar').set('X-CSRF-Token', tokenOp).expect(403);
  await operador.post('/productos/1/estado').type('form').send({ _csrf: tokenOp, activo: '0' }).expect(403);

  const id = db.prepare("SELECT id FROM usuarios WHERE usuario = 'almacen'").get().id;
  await agente.post(`/usuarios/${id}/estado`).type('form').send({ _csrf: token, activo: '0' }).expect(302);
  await operador.get('/escanear').expect(302).expect('Location', '/login');

  const acciones = db.prepare('SELECT accion FROM auditoria ORDER BY id').all().map((a) => a.accion);
  assert.ok(acciones.includes('usuario_creado'));
  assert.ok(acciones.includes('usuario_desactivado'));
  assert.ok(acciones.includes('password_cambiado'));
});

test('no redirige a sitios externos después de un error', async () => {
  const { agente, token } = await sesionAdmin(nuevaDb());
  const r = await agente.post('/productos/999/movimientos').set('Referer', 'https://sitio-malicioso.example/')
    .type('form').send({ _csrf: token, tipo: 'entrada', cantidad: 1 }).expect(302);
  assert.strictEqual(r.headers.location, '/');
});

test('en producción exige un SESSION_SECRET fuerte', () => {
  assert.throws(() => leerConfig({ NODE_ENV: 'production' }), /SESSION_SECRET/);
  assert.throws(() => leerConfig({ NODE_ENV: 'production', SESSION_SECRET: 'corto' }), /SESSION_SECRET/);
  assert.ok(leerConfig({ NODE_ENV: 'production', SESSION_SECRET: 'a'.repeat(64) }).produccion);
});

test('la app instalable y el chequeo de salud responden sin sesión', async () => {
  const { app } = nuevaApp();
  await request(app).get('/salud').expect(200, { estado: 'ok' });
  await request(app).get('/manifest.webmanifest').expect(200).expect('Content-Type', /manifest\+json/);
  await request(app).get('/sw.js').expect(200);
});

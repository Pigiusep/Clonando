const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { abrirDb } = require('../src/db');
const { crearApp } = require('../src/app');

async function sesion(usuario = 'admin', password = 'admin123') {
  const db = abrirDb(':memory:');
  const agente = request.agent(crearApp(db, { secretoSesion: 'prueba' }));
  await agente.post('/login').type('form').send({ usuario, password }).expect(302).expect('Location', '/');
  return { db, agente };
}

test('pide iniciar sesión y rechaza contraseñas incorrectas', async () => {
  const app = crearApp(abrirDb(':memory:'), { secretoSesion: 'prueba' });
  await request(app).get('/productos').expect(302).expect('Location', '/login');
  await request(app).get('/api/productos').expect(401);
  await request(app).post('/login').type('form').send({ usuario: 'admin', password: 'x' }).expect(401);
});

test('flujo completo: crear producto, entrada por escáner, consulta y páginas', async () => {
  const { agente } = await sesion();
  const creado = await agente.post('/productos').type('form')
    .send({ codigo: '7751234567890', nombre: 'Leche', unidad: 'UND', stock_minimo: '2' }).expect(302);
  const url = creado.headers.location;

  const mov = await agente.post('/api/movimientos').send({ codigo: '7751234567890', tipo: 'entrada', cantidad: 5 }).expect(201);
  assert.strictEqual(mov.body.stock, 5);

  const err = await agente.post('/api/movimientos').send({ codigo: '7751234567890', tipo: 'salida', cantidad: 9 }).expect(400);
  assert.match(err.body.error, /Stock insuficiente/);
  await agente.post('/api/movimientos').send({ codigo: 'NOEXISTE', tipo: 'entrada', cantidad: 1 }).expect(404);

  const consulta = await agente.get('/api/productos/codigo/7751234567890').expect(200);
  assert.strictEqual(consulta.body.nombre, 'Leche');

  for (const ruta of ['/', '/productos', url, `${url}/editar`, '/productos/etiquetas', '/movimientos', '/escanear', '/excel', '/usuarios']) {
    const r = await agente.get(ruta);
    assert.strictEqual(r.status, 200, `${ruta} respondió ${r.status}`);
  }
  const detalle = await agente.get(url);
  assert.match(detalle.text, /data:image\/png;base64/); // QR generado

  const xlsx = await agente.get('/excel/productos.xlsx').expect(200);
  assert.match(xlsx.headers['content-type'], /spreadsheetml/);
});

test('los operadores no pueden administrar usuarios ni importar', async () => {
  const { db, agente } = await sesion();
  await agente.post('/usuarios').type('form')
    .send({ usuario: 'almacen', nombre: 'Almacén', password: 'clave-segura', rol: 'operador' }).expect(302);

  const operador = request.agent(crearApp(db, { secretoSesion: 'prueba' }));
  await operador.post('/login').type('form').send({ usuario: 'almacen', password: 'clave-segura' }).expect(302);
  await operador.get('/usuarios').expect(403);
  await operador.post('/excel/importar').expect(403);
  await operador.get('/escanear').expect(200);
});

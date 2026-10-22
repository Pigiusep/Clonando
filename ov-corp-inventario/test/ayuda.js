// Utilidades compartidas por las pruebas.
const request = require('supertest');
const { leerConfig } = require('../src/config');
const { crearLogger } = require('../src/logger');
const { abrirDb } = require('../src/db');
const { crearApp } = require('../src/app');

const PASSWORD_ADMIN = 'clave-inicial-admin';
const PASSWORD_NUEVA = 'nueva-clave-segura-2026';

function nuevaDb() {
  return abrirDb(':memory:', { adminPassword: PASSWORD_ADMIN }).db;
}

function nuevaApp(db = nuevaDb(), env = {}) {
  const config = leerConfig({ NODE_ENV: 'test', SESSION_SECRET: 'x'.repeat(40), ...env });
  return { db, app: crearApp({ db, config, logger: crearLogger('silent') }) };
}

/** Lee el token CSRF de una página ya renderizada. */
function tokenDe(html) {
  const m = html.match(/name="csrf-token" content="([^"]+)"/) || html.match(/name="_csrf" value="([^"]+)"/);
  if (!m) throw new Error('No se encontró el token CSRF en la página');
  return m[1];
}

async function ingresar(agente, usuario, password) {
  const token = tokenDe((await agente.get('/login')).text);
  return agente.post('/login').type('form').send({ _csrf: token, usuario, password });
}

/**
 * Agente con sesión de administrador ya iniciada y contraseña inicial cambiada.
 * Devuelve también el token CSRF vigente para usarlo en las peticiones POST.
 */
async function sesionAdmin(db) {
  const { app } = nuevaApp(db);
  const agente = request.agent(app);
  const ingreso = await ingresar(agente, 'admin', PASSWORD_ADMIN);
  if (ingreso.headers.location !== '/cuenta/password') throw new Error(`Ingreso inesperado: ${ingreso.status}`);
  let token = tokenDe((await agente.get('/cuenta/password')).text);
  await agente.post('/cuenta/password').type('form')
    .send({ _csrf: token, actual: PASSWORD_ADMIN, nueva: PASSWORD_NUEVA, confirmacion: PASSWORD_NUEVA })
    .expect(302).expect('Location', '/');
  token = tokenDe((await agente.get('/')).text);
  return { agente, token, app };
}

module.exports = { nuevaDb, nuevaApp, tokenDe, ingresar, sesionAdmin, PASSWORD_ADMIN, PASSWORD_NUEVA };

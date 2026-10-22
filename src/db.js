const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const Database = require('better-sqlite3');
const { hashPassword } = require('./services/passwords');

// Migraciones versionadas: cada cambio de esquema se agrega al final y nunca se edita
// una que ya se aplicó. La versión aplicada se guarda en PRAGMA user_version.
const MIGRACIONES = [
  `
  CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL UNIQUE COLLATE NOCASE,
    nombre TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'operador')),
    activo INTEGER NOT NULL DEFAULT 1,
    debe_cambiar_password INTEGER NOT NULL DEFAULT 1,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE COLLATE NOCASE,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT '',
    unidad TEXT NOT NULL DEFAULT 'UND',
    costo REAL NOT NULL DEFAULT 0,
    precio REAL NOT NULL DEFAULT 0,
    stock_minimo REAL NOT NULL DEFAULT 0,
    ubicacion TEXT NOT NULL DEFAULT '',
    activo INTEGER NOT NULL DEFAULT 1,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- El stock nunca se guarda "a mano": se calcula desde los movimientos,
  -- así cada cambio queda registrado con fecha, usuario y motivo.
  CREATE TABLE movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad REAL NOT NULL,
    nota TEXT NOT NULL DEFAULT '',
    origen TEXT NOT NULL DEFAULT 'manual',
    usuario_id INTEGER REFERENCES usuarios(id),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_movimientos_producto ON movimientos(producto_id);
  CREATE INDEX idx_movimientos_fecha ON movimientos(creado_en);

  -- Correlativos para códigos automáticos. Solo avanzan: un código nunca se reutiliza.
  CREATE TABLE correlativos (
    prefijo TEXT PRIMARY KEY,
    ultimo INTEGER NOT NULL
  );

  -- Bitácora de eventos de seguridad y administración.
  CREATE TABLE auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion TEXT NOT NULL,
    detalle TEXT NOT NULL DEFAULT '',
    ip TEXT NOT NULL DEFAULT '',
    creado_en TEXT NOT NULL
  );
  CREATE INDEX idx_auditoria_fecha ON auditoria(creado_en);
  `,
];

function migrar(db) {
  const actual = db.pragma('user_version', { simple: true });
  MIGRACIONES.slice(actual).forEach((sql, i) => {
    db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${actual + i + 1}`);
    })();
  });
}

/**
 * Abre (o crea) la base de datos y aplica migraciones.
 * Si no hay usuarios, crea el administrador inicial. Si no se indicó contraseña, genera una
 * aleatoria y la devuelve en `passwordGenerada` para mostrarla una sola vez al arrancar.
 */
function abrirDb(archivo, { adminUsuario = 'admin', adminPassword = '' } = {}) {
  if (archivo !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(archivo)), { recursive: true });
  const db = new Database(archivo);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  migrar(db);

  let passwordGenerada = null;
  if (db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n === 0) {
    const password = adminPassword || (passwordGenerada = crypto.randomBytes(9).toString('base64url'));
    db.prepare(`INSERT INTO usuarios (usuario, nombre, password_hash, rol, debe_cambiar_password)
      VALUES (?, 'Administrador', ?, 'admin', 1)`).run(adminUsuario, hashPassword(password));
  }
  return { db, passwordGenerada };
}

module.exports = { abrirDb };

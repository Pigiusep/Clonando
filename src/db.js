const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'operador')),
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS productos (
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
CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad REAL NOT NULL,
  nota TEXT NOT NULL DEFAULT '',
  origen TEXT NOT NULL DEFAULT 'manual',
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(creado_en);
`;

function abrirDb(archivo = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'inventario.db')) {
  if (archivo !== ':memory:') fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const db = new Database(archivo);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  crearAdminInicial(db);
  return db;
}

function crearAdminInicial(db) {
  const hay = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
  if (hay > 0) return;
  const usuario = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  db.prepare('INSERT INTO usuarios (usuario, nombre, password_hash, rol) VALUES (?, ?, ?, ?)')
    .run(usuario, 'Administrador', bcrypt.hashSync(password, 10), 'admin');
}

module.exports = { abrirDb };

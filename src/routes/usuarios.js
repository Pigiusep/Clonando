const express = require('express');
const { hashPassword, validarPassword } = require('../services/passwords');
const { auditar, cerrarSesionesDe } = require('../middleware');

const router = express.Router();

function listar(db) {
  return db.prepare('SELECT id, usuario, nombre, rol, activo, debe_cambiar_password, creado_en FROM usuarios ORDER BY nombre').all();
}

function auditoriaReciente(db) {
  return db.prepare(`SELECT a.*, u.usuario FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
    ORDER BY a.id DESC LIMIT 100`).all();
}

function pantalla(req, res, { error = null, datos = {}, status = 200 } = {}) {
  const db = req.app.locals.db;
  res.status(status).render('usuarios/lista', { usuarios: listar(db), auditoria: auditoriaReciente(db), error, datos });
}

function objetivo(req) {
  const id = Number(req.params.id);
  return req.app.locals.db.prepare('SELECT id, usuario FROM usuarios WHERE id = ?').get(id);
}

router.get('/', (req, res) => pantalla(req, res));

router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const usuario = String(req.body.usuario || '').trim();
  const nombre = String(req.body.nombre || '').trim().slice(0, 100);
  const password = String(req.body.password || '');
  const rol = req.body.rol === 'admin' ? 'admin' : 'operador';
  let error;
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(usuario)) error = 'El usuario debe tener 3 a 30 caracteres (letras, números, . _ -).';
  else if (!nombre) error = 'El nombre es obligatorio.';
  else if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) error = 'Ese usuario ya existe.';
  else error = validarPassword(password, usuario);
  if (error) return pantalla(req, res, { error, datos: req.body, status: 400 });

  // Contraseña temporal: el usuario deberá cambiarla en su primer ingreso.
  db.prepare('INSERT INTO usuarios (usuario, nombre, password_hash, rol, debe_cambiar_password) VALUES (?, ?, ?, ?, 1)')
    .run(usuario, nombre, hashPassword(password), rol);
  auditar(req, 'usuario_creado', `${usuario} (${rol})`);
  req.flash('ok', `Usuario "${usuario}" creado. Deberá cambiar la contraseña al ingresar.`);
  res.redirect('/usuarios');
});

router.post('/:id/estado', (req, res, next) => {
  const u = objetivo(req);
  if (!u) return next();
  if (u.id === req.session.usuario.id) {
    req.flash('error', 'No puedes desactivar tu propio usuario.');
    return res.redirect('/usuarios');
  }
  const activo = req.body.activo === '1';
  const db = req.app.locals.db;
  db.prepare('UPDATE usuarios SET activo = ? WHERE id = ?').run(activo ? 1 : 0, u.id);
  if (!activo) cerrarSesionesDe(db, u.id);
  auditar(req, activo ? 'usuario_activado' : 'usuario_desactivado', u.usuario);
  req.flash('ok', `Usuario "${u.usuario}" ${activo ? 'activado' : 'desactivado'}.`);
  res.redirect('/usuarios');
});

// Restablecer la contraseña de otro usuario (la olvidó): queda como temporal.
router.post('/:id/password', (req, res, next) => {
  const u = objetivo(req);
  if (!u) return next();
  const password = String(req.body.password || '');
  const problema = validarPassword(password, u.usuario);
  if (problema) {
    req.flash('error', problema);
    return res.redirect('/usuarios');
  }
  const db = req.app.locals.db;
  db.prepare('UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 1 WHERE id = ?').run(hashPassword(password), u.id);
  cerrarSesionesDe(db, u.id, req.sessionID);
  auditar(req, 'password_restablecido', u.usuario);
  req.flash('ok', `Contraseña de "${u.usuario}" restablecida. Deberá cambiarla al ingresar.`);
  res.redirect('/usuarios');
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

function listar(db) {
  return db.prepare('SELECT id, usuario, nombre, rol, activo, creado_en FROM usuarios ORDER BY nombre').all();
}

router.get('/', (req, res) => {
  res.render('usuarios/lista', { usuarios: listar(req.app.locals.db), error: null, datos: {} });
});

router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const usuario = String(req.body.usuario || '').trim();
  const nombre = String(req.body.nombre || '').trim();
  const password = String(req.body.password || '');
  const rol = req.body.rol === 'admin' ? 'admin' : 'operador';
  let error = null;
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(usuario)) error = 'El usuario debe tener 3 a 30 caracteres (letras, números, . _ -).';
  else if (!nombre) error = 'El nombre es obligatorio.';
  else if (password.length < 8) error = 'La contraseña debe tener al menos 8 caracteres.';
  else if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) error = 'Ese usuario ya existe.';
  if (error) {
    return res.status(400).render('usuarios/lista', { usuarios: listar(db), error, datos: req.body });
  }
  db.prepare('INSERT INTO usuarios (usuario, nombre, password_hash, rol) VALUES (?, ?, ?, ?)')
    .run(usuario, nombre, bcrypt.hashSync(password, 10), rol);
  req.flash('ok', `Usuario "${usuario}" creado.`);
  res.redirect('/usuarios');
});

router.post('/:id/estado', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.usuario.id) {
    req.flash('error', 'No puedes desactivar tu propio usuario.');
  } else {
    req.app.locals.db.prepare('UPDATE usuarios SET activo = ? WHERE id = ?').run(req.body.activo === '1' ? 1 : 0, id);
    req.flash('ok', 'Usuario actualizado.');
  }
  res.redirect('/usuarios');
});

router.post('/:id/password', (req, res) => {
  const password = String(req.body.password || '');
  if (password.length < 8) {
    req.flash('error', 'La contraseña debe tener al menos 8 caracteres.');
  } else {
    req.app.locals.db.prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?')
      .run(bcrypt.hashSync(password, 10), Number(req.params.id));
    req.flash('ok', 'Contraseña actualizada.');
  }
  res.redirect('/usuarios');
});

module.exports = router;

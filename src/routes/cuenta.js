const express = require('express');
const { hashPassword, verificarPassword, validarPassword } = require('../services/passwords');
const { auditar, cerrarSesionesDe } = require('../middleware');

const router = express.Router();

function pantalla(req, res, error = null, status = 200) {
  const { debe_cambiar_password: obligatorio } = req.app.locals.db
    .prepare('SELECT debe_cambiar_password FROM usuarios WHERE id = ?').get(req.session.usuario.id);
  res.status(status).render('cuenta', { error, obligatorio: !!obligatorio });
}

router.get('/cuenta/password', (req, res) => pantalla(req, res));

router.post('/cuenta/password', (req, res) => {
  const db = req.app.locals.db;
  const { id, usuario } = req.session.usuario;
  const { actual = '', nueva = '', confirmacion = '' } = req.body;
  const fila = db.prepare('SELECT password_hash FROM usuarios WHERE id = ?').get(id);

  if (!verificarPassword(actual, fila.password_hash)) return pantalla(req, res, 'La contraseña actual no es correcta.', 400);
  if (nueva !== confirmacion) return pantalla(req, res, 'La nueva contraseña y su confirmación no coinciden.', 400);
  if (nueva === actual) return pantalla(req, res, 'La nueva contraseña debe ser distinta de la actual.', 400);
  const problema = validarPassword(nueva, usuario);
  if (problema) return pantalla(req, res, problema, 400);

  db.prepare('UPDATE usuarios SET password_hash = ?, debe_cambiar_password = 0 WHERE id = ?').run(hashPassword(nueva), id);
  // Cierra las demás sesiones abiertas de este usuario (por ejemplo, en otro celular).
  cerrarSesionesDe(db, id, req.sessionID);
  auditar(req, 'password_cambiado');
  const datosSesion = { ...req.session.usuario };
  req.session.regenerate(() => {
    req.session.usuario = datosSesion;
    req.flash('ok', 'Contraseña actualizada.');
    res.redirect('/');
  });
});

module.exports = router;

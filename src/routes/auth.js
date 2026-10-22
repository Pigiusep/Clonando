const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.render('login', { error: null, usuarioIngresado: '' });
});

router.post('/login', (req, res, next) => {
  const { usuario = '', password = '' } = req.body;
  const fila = req.app.locals.db.prepare('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1').get(usuario.trim());
  if (!fila || !bcrypt.compareSync(password, fila.password_hash)) {
    return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos.', usuarioIngresado: usuario });
  }
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.usuario = { id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol };
    res.redirect('/');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;

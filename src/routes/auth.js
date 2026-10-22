const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const crypto = require('node:crypto');
const { hashPassword, verificarPassword } = require('../services/passwords');
const { auditar } = require('../middleware');

// Contra ataques de fuerza bruta: máximo 10 intentos fallidos cada 15 minutos por IP y usuario.
// Se crea uno por instancia de la app (cada uno con su propio contador).
const crearLimiteLogin = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip || '')}|${String(req.body?.usuario || '').trim().toLowerCase()}`,
  handler: (req, res) => {
    // Se registra solo el primer bloqueo de la ventana, para que un ataque no llene la bitácora.
    if (req.rateLimit?.used === req.rateLimit?.limit + 1) auditar(req, 'login_bloqueado', String(req.body?.usuario || ''), null);
    res.status(429).render('login', {
      error: 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.',
      usuarioIngresado: req.body?.usuario || '',
    });
  },
});

// Si el usuario no existe se compara igual contra un hash cualquiera,
// para que el tiempo de respuesta no revele qué usuarios existen.
let hashFalso;
const obtenerHashFalso = () => (hashFalso ??= hashPassword(crypto.randomBytes(16).toString('hex')));

function crearRouterAuth() {
  const router = express.Router();
  const limiteLogin = crearLimiteLogin();

  router.get('/login', (req, res) => {
    if (req.session.usuario) return res.redirect('/');
    res.render('login', { error: null, usuarioIngresado: '' });
  });

  router.post('/login', limiteLogin, (req, res, next) => {
    const usuario = String(req.body.usuario || '').trim().slice(0, 50);
    const password = String(req.body.password || '');
    const fila = req.app.locals.db.prepare('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1').get(usuario);
    const correcta = verificarPassword(password, fila ? fila.password_hash : obtenerHashFalso());
    if (!fila || !correcta) {
      auditar(req, 'login_fallido', usuario, fila ? fila.id : null);
      return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos.', usuarioIngresado: usuario });
    }
    // Nueva sesión al iniciar: evita la fijación de sesión.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.usuario = { id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol };
      auditar(req, 'login', '', fila.id);
      res.redirect(fila.debe_cambiar_password ? '/cuenta/password' : '/');
    });
  });

  router.post('/logout', (req, res) => {
    if (req.session.usuario) auditar(req, 'logout');
    req.session.destroy(() => {
      res.clearCookie('ovinv.sid');
      res.redirect('/login');
    });
  });

  return router;
}

module.exports = crearRouterAuth;

const crypto = require('node:crypto');
const { ahora } = require('./services/inventario');

const RUTA_SUBIDA = '/excel/importar';

function esApi(req) {
  return req.originalUrl.startsWith('/api');
}

/** Registra un evento en la bitácora de auditoría. */
function auditar(req, accion, detalle = '', usuarioId = req.session?.usuario?.id ?? null) {
  req.app.locals.db.prepare('INSERT INTO auditoria (usuario_id, accion, detalle, ip, creado_en) VALUES (?, ?, ?, ?, ?)')
    .run(usuarioId, accion, String(detalle).slice(0, 500), req.ip || '', ahora());
}

/** Cierra las sesiones abiertas de un usuario (menos la indicada), por ejemplo al cambiar su contraseña. */
function cerrarSesionesDe(db, usuarioId, exceptoSid = '') {
  db.prepare("DELETE FROM sessions WHERE sid != ? AND json_extract(sess, '$.usuario.id') = ?").run(exceptoSid, usuarioId);
}

/**
 * Protección CSRF con token sincronizado: cada sesión tiene un token aleatorio que los
 * formularios envían en `_csrf` y el escáner en la cabecera `X-CSRF-Token`.
 * Se suma a la cookie SameSite=Strict como segunda barrera.
 */
function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(32).toString('base64url');
  res.locals.csrf = req.session.csrf;
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // La subida de Excel (multipart) se valida en su propia ruta, después de que multer lea el cuerpo.
  if (req.path === RUTA_SUBIDA && req.is('multipart/form-data')) return next();
  verificarCsrf(req, res, next);
}

function verificarCsrf(req, res, next) {
  const enviado = String(req.get('x-csrf-token') || req.body?._csrf || '');
  const esperado = req.session.csrf || '';
  const valido = enviado.length === esperado.length && esperado.length > 0
    && crypto.timingSafeEqual(Buffer.from(enviado), Buffer.from(esperado));
  if (valido) return next();
  if (esApi(req)) return res.status(403).json({ error: 'Token de seguridad inválido. Recarga la página.' });
  res.status(403).render('error', {
    titulo: 'Formulario vencido',
    mensaje: 'La página estuvo abierta mucho tiempo o el envío no es válido. Vuelve atrás, recarga e inténtalo otra vez.',
  });
}

/**
 * Exige sesión y vuelve a leer al usuario en cada petición: si lo desactivan o le cambian
 * el rol, el cambio aplica de inmediato y no recién cuando vuelva a iniciar sesión.
 */
function requiereSesion(req, res, next) {
  const id = req.session.usuario?.id;
  const fila = id && req.app.locals.db
    .prepare('SELECT id, usuario, nombre, rol, activo, debe_cambiar_password FROM usuarios WHERE id = ?').get(id);
  if (!fila || !fila.activo) {
    delete req.session.usuario;
    if (esApi(req)) return res.status(401).json({ error: 'Sesión expirada' });
    return res.redirect('/login');
  }
  req.session.usuario = { id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol };
  res.locals.usuario = req.session.usuario;

  // Primera vez (o contraseña reseteada por un admin): debe elegir su propia contraseña.
  if (fila.debe_cambiar_password && req.path !== '/cuenta/password') {
    if (esApi(req)) return res.status(403).json({ error: 'Debes cambiar tu contraseña antes de continuar.' });
    return res.redirect('/cuenta/password');
  }
  next();
}

function requiereAdmin(req, res, next) {
  if (req.session.usuario?.rol === 'admin') return next();
  if (esApi(req)) return res.status(403).json({ error: 'Solo un administrador puede hacer esto.' });
  res.status(403).render('error', { titulo: 'Sin permiso', mensaje: 'Solo un administrador puede hacer esto.' });
}

// Las páginas con datos del inventario no se guardan en caché (equipos compartidos, botón "atrás" tras salir).
function sinCache(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}

module.exports = { auditar, cerrarSesionesDe, csrf, verificarCsrf, requiereSesion, requiereAdmin, sinCache };

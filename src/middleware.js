function requiereSesion(req, res, next) {
  if (req.session.usuario) return next();
  if (req.path.startsWith('/api')) return res.status(401).json({ error: 'Sesión expirada' });
  res.redirect('/login');
}

function requiereAdmin(req, res, next) {
  if (req.session.usuario?.rol === 'admin') return next();
  res.status(403).render('error', { titulo: 'Sin permiso', mensaje: 'Solo un administrador puede hacer esto.' });
}

module.exports = { requiereSesion, requiereAdmin };

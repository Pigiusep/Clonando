const path = require('node:path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const SqliteStore = require('better-sqlite3-session-store')(session);
const { ErrorInventario } = require('./services/inventario');
const { requiereSesion, requiereAdmin } = require('./middleware');

function crearApp(db, { secretoSesion = process.env.SESSION_SECRET || 'cambia-este-secreto' } = {}) {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('trust proxy', 1);
  app.locals.db = db;
  app.locals.moneda = process.env.MONEDA || 'S/';
  app.locals.num = (n) => Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 3 });
  app.locals.dinero = (n) => `${app.locals.moneda} ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        // html5-qrcode usa blob: para el video y data: para íconos.
        'img-src': ["'self'", 'data:', 'blob:'],
        'media-src': ["'self'", 'blob:'],
        // Se puede usar por HTTP en la red local; no forzar https en los recursos.
        'upgrade-insecure-requests': null,
      },
    },
  }));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use('/static', express.static(path.join(__dirname, '..', 'public')));
  app.use('/static/vendor', express.static(path.join(__dirname, '..', 'node_modules', 'html5-qrcode')));

  app.use(session({
    store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 15 * 60 * 1000 } }),
    secret: secretoSesion,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', secure: 'auto', maxAge: 12 * 60 * 60 * 1000 },
  }));

  // Mensajes "flash" de una sola lectura y datos comunes para las vistas.
  app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.flash = req.session.flash || null;
    res.locals.ruta = req.path;
    delete req.session.flash;
    req.flash = (tipo, mensaje) => { req.session.flash = { tipo, mensaje }; };
    next();
  });

  app.use(require('./routes/auth'));
  app.use(requiereSesion);
  app.use(require('./routes/inicio'));
  app.use('/productos', require('./routes/productos'));
  app.use('/movimientos', require('./routes/movimientos').router);
  app.use('/escanear', require('./routes/escaner'));
  app.use('/excel', require('./routes/excel'));
  app.use('/usuarios', requiereAdmin, require('./routes/usuarios'));
  app.use('/api', require('./routes/api'));

  app.use((req, res) => res.status(404).render('error', { titulo: 'No encontrado', mensaje: 'La página no existe.' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ErrorInventario) {
      if (req.path.startsWith('/api')) return res.status(400).json({ error: err.message });
      req.flash('error', err.message);
      return res.redirect(req.get('Referer') || '/');
    }
    console.error(err);
    if (req.path.startsWith('/api')) return res.status(500).json({ error: 'Error interno' });
    res.status(500).render('error', { titulo: 'Error', mensaje: 'Ocurrió un error inesperado.' });
  });

  return app;
}

module.exports = { crearApp };

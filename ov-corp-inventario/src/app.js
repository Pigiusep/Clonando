const path = require('node:path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const multer = require('multer');
const pinoHttp = require('pino-http');
const SqliteStore = require('better-sqlite3-session-store')(session);
const inv = require('./services/inventario');
const { csrf, requiereSesion, requiereAdmin, sinCache } = require('./middleware');

const RAIZ = path.join(__dirname, '..');

/**
 * Crea la aplicación Express. Recibe sus dependencias (base de datos, configuración y logger)
 * en lugar de leerlas de variables globales, así las pruebas pueden usar una base en memoria.
 */
function crearApp({ db, config, logger }) {
  inv.configurar(config);

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(RAIZ, 'views'));
  // Solo se confía en X-Forwarded-For cuando hay un proxy delante (Caddy, Render...); si no,
  // un cliente podría falsear su IP y saltarse el límite de intentos de inicio de sesión.
  app.set('trust proxy', config.confiarProxy ? 1 : false);
  app.locals.db = db;
  app.locals.moneda = config.moneda;
  app.locals.num = (n) => Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 3 });
  app.locals.dinero = (n) => `${config.moneda} ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  app.use(pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url.startsWith('/static') || req.url === '/salud' },
    customProps: (req) => ({ usuario: req.session?.usuario?.usuario }),
  }));

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        // html5-qrcode usa blob: para el video de la cámara y data: para íconos; los QR son data: PNG.
        'img-src': ["'self'", 'data:', 'blob:'],
        'media-src': ["'self'", 'blob:'],
        'worker-src': ["'self'"],
        'manifest-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        // Se puede usar por HTTP en la red local; no forzar https en los recursos.
        'upgrade-insecure-requests': config.produccion && config.confiarProxy ? [] : null,
      },
    },
    strictTransportSecurity: config.produccion ? undefined : false,
    // Referer solo dentro del mismo sitio: se usa para volver a la página anterior tras un error.
    referrerPolicy: { policy: 'same-origin' },
  }));

  // Archivos públicos (sin sesión): estáticos, PWA y chequeo de salud para el hosting.
  app.use('/static/vendor', express.static(path.join(RAIZ, 'node_modules', 'html5-qrcode'), { maxAge: '7d' }));
  app.use('/static', express.static(path.join(RAIZ, 'public'), { maxAge: config.produccion ? '1h' : 0 }));
  app.get('/sw.js', (req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(RAIZ, 'public', 'sw.js')));
  app.get('/manifest.webmanifest', (req, res) => res.type('application/manifest+json').sendFile(path.join(RAIZ, 'public', 'manifest.webmanifest')));
  app.get('/salud', (req, res) => {
    db.prepare('SELECT 1').get();
    res.json({ estado: 'ok' });
  });

  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(express.json({ limit: '20kb' }));

  app.use(session({
    name: 'ovinv.sid',
    store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 15 * 60 * 1000 } }),
    secret: config.secretoSesion,
    resave: false,
    saveUninitialized: false,
    rolling: true, // la sesión vence tras 8 h sin actividad
    cookie: { httpOnly: true, sameSite: 'strict', secure: 'auto', maxAge: 8 * 60 * 60 * 1000 },
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
  app.use(sinCache);
  app.use(csrf);

  app.use(require('./routes/auth')());
  app.use(requiereSesion);
  app.use(require('./routes/cuenta'));
  app.use(require('./routes/inicio'));
  app.use('/productos', require('./routes/productos'));
  app.use('/movimientos', require('./routes/movimientos').router);
  app.use('/escanear', require('./routes/escaner'));
  app.use('/excel', require('./routes/excel'));
  app.use('/usuarios', requiereAdmin, require('./routes/usuarios'));
  app.use('/api', require('./routes/api'));

  app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: 'No encontrado' });
    res.status(404).render('error', { titulo: 'No encontrado', mensaje: 'La página no existe.' });
  });

  app.use((err, req, res, next) => {
    const api = req.originalUrl.startsWith('/api');
    let mensaje = null;
    if (err instanceof inv.ErrorInventario) mensaje = err.message;
    else if (err instanceof multer.MulterError) mensaje = err.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera los 10 MB.' : 'No se pudo recibir el archivo.';
    else if (err.type === 'entity.too.large') mensaje = 'Los datos enviados son demasiado grandes.';

    if (mensaje) {
      if (api) return res.status(400).json({ error: mensaje });
      req.flash('error', mensaje);
      return res.redirect(rutaDeRegreso(req));
    }
    // Errores inesperados: se registran completos en el log, pero al usuario no se le muestran detalles.
    req.log.error({ err }, 'error no controlado');
    if (api) return res.status(500).json({ error: 'Error interno' });
    res.status(500).render('error', { titulo: 'Error', mensaje: 'Ocurrió un error inesperado. Si se repite, avisa al administrador.' });
  });

  return app;
}

// Vuelve a la página anterior solo si es del mismo sitio (evita redirecciones abiertas).
function rutaDeRegreso(req) {
  try {
    const url = new URL(req.get('Referer') || '/', `${req.protocol}://${req.get('host')}`);
    if (url.host === req.get('host')) return url.pathname + url.search;
  } catch { /* Referer inválido */ }
  return '/';
}

module.exports = { crearApp };

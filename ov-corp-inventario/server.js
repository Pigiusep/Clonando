const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const { leerConfig } = require('./src/config');
const { crearLogger } = require('./src/logger');
const { abrirDb } = require('./src/db');
const { crearApp } = require('./src/app');

let config;
try {
  config = leerConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
const logger = crearLogger(config.nivelLog);

const { db, passwordGenerada } = abrirDb(config.dbPath, {
  adminUsuario: config.adminUsuario,
  adminPassword: config.adminPassword,
});
if (passwordGenerada) {
  // Se muestra una sola vez, en la consola del servidor. Deberá cambiarse en el primer ingreso.
  console.log(`\n  Usuario administrador creado: ${config.adminUsuario}\n  Contraseña temporal: ${passwordGenerada}\n`);
}
if (!config.produccion && !process.env.SESSION_SECRET) {
  logger.warn('SESSION_SECRET no está definido: se usa un secreto de desarrollo. No lo uses así en producción.');
}

const app = crearApp({ db, config, logger });

// La cámara del navegador solo funciona en HTTPS (o en localhost).
// Para usarla desde celulares en la red local sin proxy, define SSL_KEY y SSL_CERT.
const servidor = config.sslKey
  ? https.createServer({ key: fs.readFileSync(config.sslKey), cert: fs.readFileSync(config.sslCert) }, app)
  : http.createServer(app);

servidor.listen(config.puerto, () => {
  logger.info(`Inventario OV Corp en ${config.sslKey ? 'https' : 'http'}://localhost:${config.puerto}`);
});

// Apagado ordenado (reinicios del hosting, Docker): termina las peticiones en curso y cierra la base.
function apagar(senal) {
  logger.info(`Recibido ${senal}, cerrando…`);
  servidor.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', apagar);
process.on('SIGINT', apagar);

// Configuración central. Todo valor que venga del entorno se lee y valida aquí,
// para que un error de configuración se detecte al arrancar y no en plena operación.
const path = require('node:path');

const SECRETO_DESARROLLO = 'solo-para-desarrollo-no-usar-en-produccion';

function leerConfig(env = process.env) {
  const config = {
    produccion: env.NODE_ENV === 'production',
    puerto: Number(env.PORT) || 3000,
    dbPath: env.DB_PATH || path.join(__dirname, '..', 'data', 'inventario.db'),
    secretoSesion: env.SESSION_SECRET || SECRETO_DESARROLLO,
    adminUsuario: env.ADMIN_USER || 'admin',
    adminPassword: env.ADMIN_PASSWORD || '',
    zonaHoraria: env.ZONA_HORARIA || 'America/Lima',
    moneda: env.MONEDA || 'S/',
    prefijoCodigo: (env.PREFIJO_CODIGO || 'P').toUpperCase(),
    digitosCodigo: Number(env.DIGITOS_CODIGO) || 5,
    // Poner en 1 solo si la app está detrás de un proxy (Caddy, Nginx, Render) que agrega X-Forwarded-For.
    confiarProxy: ['1', 'true'].includes(String(env.TRUST_PROXY || '').toLowerCase()),
    sslKey: env.SSL_KEY || '',
    sslCert: env.SSL_CERT || '',
    nivelLog: env.LOG_LEVEL || (env.NODE_ENV === 'test' ? 'silent' : 'info'),
  };

  const errores = [];
  if (config.produccion && (config.secretoSesion === SECRETO_DESARROLLO || config.secretoSesion.length < 32)) {
    errores.push('SESSION_SECRET debe tener al menos 32 caracteres aleatorios en producción (genera uno con: openssl rand -hex 32).');
  }
  if (!/^[A-Z]{1,5}$/.test(config.prefijoCodigo)) errores.push('PREFIJO_CODIGO debe tener de 1 a 5 letras.');
  if (config.digitosCodigo < 3 || config.digitosCodigo > 10) errores.push('DIGITOS_CODIGO debe estar entre 3 y 10.');
  if (!Number.isInteger(config.puerto) || config.puerto <= 0) errores.push('PORT inválido.');
  if (Boolean(config.sslKey) !== Boolean(config.sslCert)) errores.push('Define SSL_KEY y SSL_CERT juntos.');
  if (errores.length) {
    throw new Error(`Configuración inválida:\n- ${errores.join('\n- ')}`);
  }
  return Object.freeze(config);
}

module.exports = { leerConfig };

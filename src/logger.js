const pino = require('pino');

// Logs estructurados en JSON. Nunca se registran contraseñas, cookies ni tokens.
function crearLogger(nivel = 'info') {
  return pino({
    level: nivel,
    redact: {
      paths: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-csrf-token"]', 'res.headers["set-cookie"]', '*.password'],
      censor: '[oculto]',
    },
  });
}

module.exports = { crearLogger };

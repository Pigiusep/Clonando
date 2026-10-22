const bcrypt = require('bcryptjs');

const COSTO = process.env.NODE_ENV === 'test' ? 4 : 12;

// Contraseñas demasiado comunes que se rechazan aunque cumplan el largo mínimo.
const COMUNES = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'contraseña', 'contrasena',
  'qwertyui', 'qwerty123', 'admin123', 'administrador', 'inventario', 'ovcorp123', '11111111', 'abc12345',
]);

function hashPassword(password) {
  return bcrypt.hashSync(password, COSTO);
}

function verificarPassword(password, hash) {
  return bcrypt.compareSync(String(password ?? ''), hash);
}

// Política basada en NIST SP 800-63B: largo mínimo, sin reglas de composición forzadas,
// y rechazo de contraseñas comunes o iguales al usuario.
function validarPassword(password, usuario = '') {
  const p = String(password ?? '');
  if (p.length < 10) return 'La contraseña debe tener al menos 10 caracteres.';
  if (p.length > 72) return 'La contraseña no puede tener más de 72 caracteres.';
  if (COMUNES.has(p.toLowerCase())) return 'Esa contraseña es demasiado común. Elige otra.';
  if (usuario && p.toLowerCase().includes(usuario.toLowerCase())) return 'La contraseña no debe contener el nombre de usuario.';
  return null;
}

module.exports = { hashPassword, verificarPassword, validarPassword };

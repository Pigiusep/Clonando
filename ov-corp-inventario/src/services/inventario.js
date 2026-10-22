// Lógica de negocio del inventario. Todas las rutas (web, escáner, importación)
// pasan por aquí para que las reglas de stock sean las mismas en todos lados.

const STOCK_SQL = `
  COALESCE((SELECT SUM(CASE m.tipo WHEN 'salida' THEN -m.cantidad ELSE m.cantidad END)
            FROM movimientos m WHERE m.producto_id = p.id), 0)`;

class ErrorInventario extends Error {}

// Opciones que vienen de la configuración (ver src/config.js y crearApp).
const opciones = { zonaHoraria: 'America/Lima', prefijoCodigo: 'P', digitosCodigo: 5 };

function configurar(nuevas) {
  for (const clave of Object.keys(opciones)) if (nuevas[clave] !== undefined) opciones[clave] = nuevas[clave];
}

// Fecha y hora local de la empresa en formato "YYYY-MM-DD HH:MM:SS" (ordenable y legible en Excel).
function ahora(fecha = new Date()) {
  const partes = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: opciones.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(fecha).map((p) => [p.type, p.value]));
  return `${partes.year}-${partes.month}-${partes.day} ${partes.hour}:${partes.minute}:${partes.second}`;
}

function normalizarCodigo(codigo) {
  return String(codigo ?? '').trim();
}

// Letras, números y . _ - / : cubre códigos internos y los de barras de fabricantes.
const FORMATO_CODIGO = /^[A-Za-z0-9._\-/]{1,64}$/;

/**
 * Siguiente código interno libre, por ejemplo P00001. El correlativo solo avanza,
 * así un código impreso nunca se le asigna a otro producto.
 */
function generarCodigo(db) {
  const { prefijoCodigo: prefijo, digitosCodigo: digitos } = opciones;
  return db.transaction(() => {
    let n = db.prepare('SELECT ultimo FROM correlativos WHERE prefijo = ?').get(prefijo)?.ultimo ?? 0;
    let codigo;
    do {
      n += 1;
      codigo = `${prefijo}${String(n).padStart(digitos, '0')}`;
    } while (db.prepare('SELECT 1 FROM productos WHERE codigo = ?').get(codigo));
    db.prepare(`INSERT INTO correlativos (prefijo, ultimo) VALUES (?, ?)
      ON CONFLICT(prefijo) DO UPDATE SET ultimo = excluded.ultimo`).run(prefijo, n);
    return codigo;
  })();
}

function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function listarProductos(db, { buscar = '', soloBajoMinimo = false, incluirInactivos = false } = {}) {
  const condiciones = [];
  const params = {};
  if (!incluirInactivos) condiciones.push('p.activo = 1');
  if (buscar) {
    condiciones.push(`(p.codigo LIKE @q ESCAPE '\\' OR p.nombre LIKE @q ESCAPE '\\'
      OR p.categoria LIKE @q ESCAPE '\\' OR p.ubicacion LIKE @q ESCAPE '\\')`);
    params.q = `%${escaparLike(buscar)}%`;
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const having = soloBajoMinimo ? 'WHERE stock <= stock_minimo' : '';
  return db.prepare(`
    SELECT * FROM (SELECT p.*, ${STOCK_SQL} AS stock FROM productos p ${where})
    ${having}
    ORDER BY nombre COLLATE NOCASE`).all(params);
}

function obtenerProducto(db, id) {
  return db.prepare(`SELECT p.*, ${STOCK_SQL} AS stock FROM productos p WHERE p.id = ?`).get(id);
}

function buscarPorCodigo(db, codigo) {
  return db.prepare(`SELECT p.*, ${STOCK_SQL} AS stock FROM productos p WHERE p.codigo = ?`)
    .get(normalizarCodigo(codigo));
}

function buscarPorNombre(db, nombre) {
  return db.prepare(`SELECT p.*, ${STOCK_SQL} AS stock FROM productos p WHERE p.nombre = ? COLLATE NOCASE`)
    .all(String(nombre ?? '').trim());
}

function texto(valor, campo, maximo) {
  const t = String(valor ?? '').trim();
  if (t.length > maximo) throw new ErrorInventario(`"${campo}" no puede tener más de ${maximo} caracteres.`);
  return t;
}

function validarProducto(datos, { codigoOpcional = false } = {}) {
  const codigo = normalizarCodigo(datos.codigo);
  const nombre = texto(datos.nombre, 'Nombre', 200);
  if (!codigo && !codigoOpcional) throw new ErrorInventario('El código es obligatorio.');
  if (codigo && !FORMATO_CODIGO.test(codigo)) {
    throw new ErrorInventario('El código solo puede tener letras, números y los signos . _ - / (máximo 64).');
  }
  if (!nombre) throw new ErrorInventario('El nombre es obligatorio.');
  const numero = (valor, campo) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    const n = Number(String(valor).replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) throw new ErrorInventario(`"${campo}" debe ser un número mayor o igual a 0.`);
    return n;
  };
  return {
    codigo,
    nombre,
    categoria: texto(datos.categoria, 'Categoría', 100),
    unidad: texto(datos.unidad, 'Unidad', 20) || 'UND',
    costo: numero(datos.costo, 'Costo'),
    precio: numero(datos.precio, 'Precio'),
    stock_minimo: numero(datos.stock_minimo, 'Stock mínimo'),
    ubicacion: texto(datos.ubicacion, 'Ubicación', 100),
  };
}

// Si no se indica código, se asigna uno automático (ver generarCodigo).
function crearProducto(db, datos) {
  const p = validarProducto(datos, { codigoOpcional: true });
  if (!p.codigo) p.codigo = generarCodigo(db);
  else if (buscarPorCodigo(db, p.codigo)) throw new ErrorInventario(`Ya existe un producto con el código "${p.codigo}".`);
  const r = db.prepare(`INSERT INTO productos (codigo, nombre, categoria, unidad, costo, precio, stock_minimo, ubicacion)
    VALUES (@codigo, @nombre, @categoria, @unidad, @costo, @precio, @stock_minimo, @ubicacion)`).run(p);
  return Number(r.lastInsertRowid);
}

function actualizarProducto(db, id, datos) {
  const p = validarProducto(datos);
  const otro = buscarPorCodigo(db, p.codigo);
  if (otro && otro.id !== Number(id)) throw new ErrorInventario(`Ya existe otro producto con el código "${p.codigo}".`);
  db.prepare(`UPDATE productos SET codigo=@codigo, nombre=@nombre, categoria=@categoria, unidad=@unidad,
    costo=@costo, precio=@precio, stock_minimo=@stock_minimo, ubicacion=@ubicacion WHERE id=@id`).run({ ...p, id });
}

function cambiarEstadoProducto(db, id, activo) {
  db.prepare('UPDATE productos SET activo = ? WHERE id = ?').run(activo ? 1 : 0, id);
}

/**
 * Registra una entrada, salida o ajuste.
 * - entrada/salida: cantidad > 0. Una salida no puede dejar el stock en negativo.
 * - ajuste: se indica el stock contado (conteo físico); se guarda la diferencia.
 */
function registrarMovimiento(db, { productoId, tipo, cantidad, nota = '', origen = 'manual', usuarioId = null }) {
  const notaLimpia = texto(nota, 'Nota', 500);
  const n = Number(String(cantidad ?? '').replace(',', '.'));
  if (!['entrada', 'salida', 'ajuste'].includes(tipo)) throw new ErrorInventario('Tipo de movimiento inválido.');
  if (!Number.isFinite(n) || n < 0 || (tipo !== 'ajuste' && n === 0)) {
    throw new ErrorInventario('La cantidad debe ser un número mayor a 0.');
  }

  const tx = db.transaction(() => {
    const producto = obtenerProducto(db, productoId);
    if (!producto) throw new ErrorInventario('Producto no encontrado.');
    if (!producto.activo) throw new ErrorInventario('El producto está desactivado.');

    let cantidadGuardada = n;
    if (tipo === 'salida' && n > producto.stock) {
      throw new ErrorInventario(`Stock insuficiente: hay ${producto.stock} ${producto.unidad} de "${producto.nombre}".`);
    }
    if (tipo === 'ajuste') {
      cantidadGuardada = n - producto.stock;
      if (cantidadGuardada === 0) throw new ErrorInventario('El conteo coincide con el stock actual; no hay nada que ajustar.');
    }
    db.prepare(`INSERT INTO movimientos (producto_id, tipo, cantidad, nota, origen, usuario_id, creado_en)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(productoId, tipo, cantidadGuardada, notaLimpia, origen, usuarioId, ahora());
    return obtenerProducto(db, productoId);
  });
  return tx();
}

function listarMovimientos(db, { productoId, tipo, desde, hasta, limite = 200 } = {}) {
  const condiciones = [];
  const params = { limite };
  if (productoId) { condiciones.push('m.producto_id = @productoId'); params.productoId = productoId; }
  if (tipo) { condiciones.push('m.tipo = @tipo'); params.tipo = tipo; }
  if (desde) { condiciones.push('date(m.creado_en) >= date(@desde)'); params.desde = desde; }
  if (hasta) { condiciones.push('date(m.creado_en) <= date(@hasta)'); params.hasta = hasta; }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  return db.prepare(`
    SELECT m.*, p.codigo, p.nombre, p.unidad, u.nombre AS usuario
    FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    LEFT JOIN usuarios u ON u.id = m.usuario_id
    ${where}
    ORDER BY m.id DESC
    LIMIT @limite`).all(params);
}

function resumen(db) {
  const productos = listarProductos(db);
  return {
    totalProductos: productos.length,
    bajoMinimo: productos.filter((p) => p.stock <= p.stock_minimo),
    valorizado: productos.reduce((s, p) => s + p.stock * p.costo, 0),
    movimientosHoy: db.prepare('SELECT COUNT(*) AS n FROM movimientos WHERE date(creado_en) = ?').get(ahora().slice(0, 10)).n,
  };
}

module.exports = {
  ErrorInventario,
  configurar,
  ahora,
  generarCodigo,
  buscarPorNombre,
  listarProductos,
  obtenerProducto,
  buscarPorCodigo,
  crearProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  registrarMovimiento,
  listarMovimientos,
  resumen,
};

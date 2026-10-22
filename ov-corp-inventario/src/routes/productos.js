const express = require('express');
const QRCode = require('qrcode');
const inv = require('../services/inventario');
const { requiereAdmin, auditar } = require('../middleware');

const router = express.Router();

router.get('/', (req, res) => {
  const buscar = String(req.query.q || '').trim();
  const soloBajoMinimo = req.query.bajo === '1';
  const incluirInactivos = req.query.inactivos === '1';
  res.render('productos/lista', {
    productos: inv.listarProductos(req.app.locals.db, { buscar, soloBajoMinimo, incluirInactivos }),
    buscar, soloBajoMinimo, incluirInactivos,
  });
});

router.get('/nuevo', (req, res) => {
  res.render('productos/form', { producto: { codigo: req.query.codigo || '' }, error: null });
});

router.post('/', (req, res) => {
  try {
    const id = inv.crearProducto(req.app.locals.db, req.body);
    req.flash('ok', `Producto creado con el código ${inv.obtenerProducto(req.app.locals.db, id).codigo}.`);
    res.redirect(`/productos/${id}`);
  } catch (err) {
    if (!(err instanceof inv.ErrorInventario)) throw err;
    res.status(400).render('productos/form', { producto: req.body, error: err.message });
  }
});

// Etiquetas para imprimir: /productos/etiquetas?ids=1,2,3 (o todas las activas si no se indica).
// formato=a4 (hoja adhesiva A4 de 21) o rollo (impresora térmica, una etiqueta de 50 x 25 mm por página).
router.get('/etiquetas', async (req, res) => {
  const db = req.app.locals.db;
  const ids = String(req.query.ids || '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 2000);
  const productos = ids.length
    ? ids.map((id) => inv.obtenerProducto(db, id)).filter(Boolean)
    : inv.listarProductos(db);
  // Ordenadas por ubicación para pegarlas recorriendo el almacén.
  productos.sort((a, b) => a.ubicacion.localeCompare(b.ubicacion, 'es', { numeric: true })
    || a.nombre.localeCompare(b.nombre, 'es'));
  const copias = Math.min(Math.max(Number(req.query.copias) || 1, 1), 50);
  const formato = req.query.formato === 'rollo' ? 'rollo' : 'a4';
  for (const p of productos) p.qr = await QRCode.toDataURL(p.codigo, { margin: 1, width: 240, errorCorrectionLevel: 'M' });
  res.render('productos/etiquetas', { productos, copias, formato, ids: ids.join(',') });
});

router.get('/:id', async (req, res, next) => {
  const db = req.app.locals.db;
  const producto = inv.obtenerProducto(db, req.params.id);
  if (!producto) return next();
  const qr = await QRCode.toDataURL(producto.codigo, { margin: 1, width: 240 });
  res.render('productos/detalle', {
    producto, qr, movimientos: inv.listarMovimientos(db, { productoId: producto.id, limite: 50 }),
  });
});

router.get('/:id/editar', (req, res, next) => {
  const producto = inv.obtenerProducto(req.app.locals.db, req.params.id);
  if (!producto) return next();
  res.render('productos/form', { producto, error: null });
});

router.post('/:id', (req, res) => {
  const id = Number(req.params.id);
  try {
    inv.actualizarProducto(req.app.locals.db, id, req.body);
    req.flash('ok', 'Producto actualizado.');
    res.redirect(`/productos/${id}`);
  } catch (err) {
    if (!(err instanceof inv.ErrorInventario)) throw err;
    res.status(400).render('productos/form', { producto: { ...req.body, id }, error: err.message });
  }
});

router.post('/:id/estado', requiereAdmin, (req, res) => {
  const activo = req.body.activo === '1';
  const producto = inv.obtenerProducto(req.app.locals.db, req.params.id);
  if (!producto) return res.redirect('/productos');
  inv.cambiarEstadoProducto(req.app.locals.db, producto.id, activo);
  auditar(req, activo ? 'producto_reactivado' : 'producto_desactivado', producto.codigo);
  req.flash('ok', activo ? 'Producto reactivado.' : 'Producto desactivado.');
  res.redirect(`/productos/${producto.id}`);
});

router.post('/:id/movimientos', (req, res) => {
  const productoId = Number(req.params.id);
  inv.registrarMovimiento(req.app.locals.db, {
    productoId, tipo: req.body.tipo, cantidad: req.body.cantidad, nota: req.body.nota,
    usuarioId: req.session.usuario.id,
  });
  req.flash('ok', 'Movimiento registrado.');
  res.redirect(`/productos/${productoId}`);
});

module.exports = router;

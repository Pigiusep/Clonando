const express = require('express');
const QRCode = require('qrcode');
const inv = require('../services/inventario');
const { requiereAdmin } = require('../middleware');

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
    req.flash('ok', 'Producto creado.');
    res.redirect(`/productos/${id}`);
  } catch (err) {
    if (!(err instanceof inv.ErrorInventario)) throw err;
    res.status(400).render('productos/form', { producto: req.body, error: err.message });
  }
});

// Etiquetas para imprimir: /productos/etiquetas?ids=1,2,3 (o todas si no se indica).
router.get('/etiquetas', async (req, res) => {
  const db = req.app.locals.db;
  const ids = String(req.query.ids || '').split(',').map(Number).filter(Boolean);
  const productos = ids.length
    ? ids.map((id) => inv.obtenerProducto(db, id)).filter(Boolean)
    : inv.listarProductos(db);
  const copias = Math.min(Math.max(Number(req.query.copias) || 1, 1), 50);
  for (const p of productos) p.qr = await QRCode.toDataURL(p.codigo, { margin: 1, width: 240 });
  res.render('productos/etiquetas', { productos, copias });
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
  inv.cambiarEstadoProducto(req.app.locals.db, req.params.id, activo);
  req.flash('ok', activo ? 'Producto reactivado.' : 'Producto desactivado.');
  res.redirect(`/productos/${req.params.id}`);
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

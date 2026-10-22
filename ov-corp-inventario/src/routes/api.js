const express = require('express');
const inv = require('../services/inventario');

const router = express.Router();

function publico(p) {
  return {
    id: p.id, codigo: p.codigo, nombre: p.nombre, categoria: p.categoria, unidad: p.unidad,
    ubicacion: p.ubicacion, stock: p.stock, stock_minimo: p.stock_minimo, activo: !!p.activo,
  };
}

router.get('/productos/codigo/:codigo', (req, res) => {
  const p = inv.buscarPorCodigo(req.app.locals.db, req.params.codigo);
  if (!p) return res.status(404).json({ error: `No existe un producto con el código "${req.params.codigo}".` });
  res.json(publico(p));
});

router.get('/productos', (req, res) => {
  const buscar = String(req.query.q || '').trim();
  res.json(inv.listarProductos(req.app.locals.db, { buscar }).slice(0, 20).map(publico));
});

router.post('/movimientos', (req, res) => {
  const { codigo, tipo, cantidad, nota } = req.body || {};
  const db = req.app.locals.db;
  const p = inv.buscarPorCodigo(db, codigo);
  if (!p) return res.status(404).json({ error: `No existe un producto con el código "${codigo}".` });
  const actualizado = inv.registrarMovimiento(db, {
    productoId: p.id, tipo, cantidad, nota, origen: 'escaner', usuarioId: req.session.usuario.id,
  });
  res.status(201).json(publico(actualizado));
});

module.exports = router;

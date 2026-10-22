const express = require('express');
const inv = require('../services/inventario');

const router = express.Router();

function filtros(query) {
  return {
    tipo: ['entrada', 'salida', 'ajuste'].includes(query.tipo) ? query.tipo : '',
    desde: /^\d{4}-\d{2}-\d{2}$/.test(query.desde || '') ? query.desde : '',
    hasta: /^\d{4}-\d{2}-\d{2}$/.test(query.hasta || '') ? query.hasta : '',
  };
}

router.get('/', (req, res) => {
  const f = filtros(req.query);
  res.render('movimientos/lista', { movimientos: inv.listarMovimientos(req.app.locals.db, { ...f, limite: 500 }), filtros: f });
});

module.exports = { router, filtros };

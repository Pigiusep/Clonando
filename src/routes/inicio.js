const express = require('express');
const inv = require('../services/inventario');

const router = express.Router();

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  res.render('inicio', {
    resumen: inv.resumen(db),
    ultimos: inv.listarMovimientos(db, { limite: 10 }),
  });
});

module.exports = router;

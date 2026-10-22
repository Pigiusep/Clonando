const express = require('express');

const router = express.Router();

// La página del escáner trabaja contra /api (búsqueda por código y registro de movimientos).
router.get('/', (req, res) => {
  res.render('escaner');
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const excel = require('../services/excel');
const { filtros } = require('./movimientos');
const { requiereAdmin } = require('../middleware');
const { ErrorInventario } = require('../services/inventario');

const router = express.Router();
const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function enviarXlsx(res, nombre, buffer) {
  res.set('Content-Type', XLSX);
  res.set('Content-Disposition', `attachment; filename="${nombre}"`);
  res.send(Buffer.from(buffer));
}

function fecha() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', (req, res) => {
  res.render('excel', { resultado: null });
});

router.post('/importar', requiereAdmin, subida.single('archivo'), async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Selecciona un archivo .xlsx o .csv.');
    return res.redirect('/excel');
  }
  if (!/\.(xlsx|csv)$/i.test(req.file.originalname)) {
    req.flash('error', 'Formato no soportado. Guarda el archivo como .xlsx (Excel moderno) o .csv.');
    return res.redirect('/excel');
  }
  let resultado;
  try {
    resultado = await excel.importarProductos(req.app.locals.db, req.file.buffer, req.file.originalname, req.session.usuario.id);
  } catch (err) {
    if (err instanceof ErrorInventario) throw err;
    console.error(err);
    req.flash('error', 'No se pudo leer el archivo. Verifica que sea un Excel (.xlsx) o CSV válido.');
    return res.redirect('/excel');
  }
  res.render('excel', { resultado });
});

router.get('/plantilla.xlsx', async (req, res) => {
  enviarXlsx(res, 'plantilla-productos.xlsx', await excel.plantilla());
});

router.get('/productos.xlsx', async (req, res) => {
  enviarXlsx(res, `productos-${fecha()}.xlsx`, await excel.exportarProductos(req.app.locals.db));
});

router.get('/movimientos.xlsx', async (req, res) => {
  enviarXlsx(res, `movimientos-${fecha()}.xlsx`, await excel.exportarMovimientos(req.app.locals.db, filtros(req.query)));
});

module.exports = router;

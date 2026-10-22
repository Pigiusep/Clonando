const test = require('node:test');
const assert = require('node:assert');
const ExcelJS = require('exceljs');
const inv = require('../src/services/inventario');
const excel = require('../src/services/excel');
const { nuevaDb } = require('./ayuda');

test('el stock se calcula a partir de entradas, salidas y ajustes', () => {
  const db = nuevaDb();
  const id = inv.crearProducto(db, { codigo: 'P1', nombre: 'Tornillo', stock_minimo: 5 });
  inv.registrarMovimiento(db, { productoId: id, tipo: 'entrada', cantidad: 10 });
  inv.registrarMovimiento(db, { productoId: id, tipo: 'salida', cantidad: '3' });
  assert.strictEqual(inv.obtenerProducto(db, id).stock, 7);

  // Ajuste: se indica el conteo físico y se guarda la diferencia.
  const p = inv.registrarMovimiento(db, { productoId: id, tipo: 'ajuste', cantidad: 4 });
  assert.strictEqual(p.stock, 4);
  assert.strictEqual(inv.listarMovimientos(db, { productoId: id })[0].cantidad, -3);
  assert.strictEqual(inv.resumen(db).bajoMinimo.length, 1);
});

test('no permite salidas mayores al stock ni cantidades inválidas', () => {
  const db = nuevaDb();
  const id = inv.crearProducto(db, { codigo: 'P1', nombre: 'Tornillo' });
  inv.registrarMovimiento(db, { productoId: id, tipo: 'entrada', cantidad: 2 });
  assert.throws(() => inv.registrarMovimiento(db, { productoId: id, tipo: 'salida', cantidad: 3 }), /Stock insuficiente/);
  assert.throws(() => inv.registrarMovimiento(db, { productoId: id, tipo: 'entrada', cantidad: 0 }), /mayor a 0/);
  assert.throws(() => inv.registrarMovimiento(db, { productoId: id, tipo: 'entrada', cantidad: 'abc' }), /mayor a 0/);
  assert.throws(() => inv.registrarMovimiento(db, { productoId: id, tipo: 'robo', cantidad: 1 }), /inválido/);
  assert.strictEqual(inv.obtenerProducto(db, id).stock, 2);
});

test('el código es único sin importar mayúsculas y se busca sin espacios', () => {
  const db = nuevaDb();
  inv.crearProducto(db, { codigo: 'abc-1', nombre: 'Uno' });
  assert.throws(() => inv.crearProducto(db, { codigo: 'ABC-1', nombre: 'Dos' }), /Ya existe/);
  assert.strictEqual(inv.buscarPorCodigo(db, '  ABC-1 ').nombre, 'Uno');
});

test('asigna códigos automáticos correlativos que no se reutilizan', () => {
  const db = nuevaDb();
  const a = inv.crearProducto(db, { nombre: 'Uno' });
  inv.crearProducto(db, { codigo: 'P00002', nombre: 'Código manual que choca con el correlativo' });
  const c = inv.crearProducto(db, { codigo: '  ', nombre: 'Tres' });
  assert.strictEqual(inv.obtenerProducto(db, a).codigo, 'P00001');
  assert.strictEqual(inv.obtenerProducto(db, c).codigo, 'P00003');
  assert.strictEqual(inv.generarCodigo(db), 'P00004');
  assert.strictEqual(inv.generarCodigo(db), 'P00005');
});

test('valida formato de código y largo de los textos', () => {
  const db = nuevaDb();
  assert.throws(() => inv.crearProducto(db, { codigo: 'con espacio', nombre: 'X' }), /solo puede tener/);
  assert.throws(() => inv.crearProducto(db, { codigo: '<script>', nombre: 'X' }), /solo puede tener/);
  assert.throws(() => inv.crearProducto(db, { nombre: 'x'.repeat(201) }), /más de 200/);
  const id = inv.crearProducto(db, { nombre: 'Ok' });
  assert.throws(() => inv.actualizarProducto(db, id, { codigo: '', nombre: 'Ok' }), /obligatorio/);
});

test('la búsqueda trata % y _ como texto literal', () => {
  const db = nuevaDb();
  inv.crearProducto(db, { nombre: 'Descuento 50%' });
  inv.crearProducto(db, { nombre: 'Otro' });
  assert.deepStrictEqual(inv.listarProductos(db, { buscar: '%' }).map((p) => p.nombre), ['Descuento 50%']);
  assert.strictEqual(inv.listarProductos(db, { buscar: '_' }).length, 0);
});

test('no registra movimientos en productos desactivados', () => {
  const db = nuevaDb();
  const id = inv.crearProducto(db, { codigo: 'P1', nombre: 'Tornillo' });
  inv.cambiarEstadoProducto(db, id, false);
  assert.throws(() => inv.registrarMovimiento(db, { productoId: id, tipo: 'entrada', cantidad: 1 }), /desactivado/);
});

async function libroDePrueba(filas) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Hoja1');
  hoja.addRow(['Inventario OV Corp']); // título antes de los encabezados, como en muchos Excel reales
  for (const f of filas) hoja.addRow(f);
  return Buffer.from(await libro.xlsx.writeBuffer());
}

test('importa un Excel con encabezados en español, crea, actualiza y ajusta stock', async () => {
  const db = nuevaDb();
  const existente = inv.crearProducto(db, { codigo: 'A1', nombre: 'Viejo nombre', costo: 9 });

  const buffer = await libroDePrueba([
    ['Código', 'Descripción', 'Categoría', 'Stock', 'Precio de compra'],
    ['A1', 'Nombre nuevo', 'Ferretería', 15, 2.5],
    ['B2', 'Clavo', 'Ferretería', 100, 0.1],
    ['', 'Sin código', '', 5, 1],
    ['A1', '', '', '', ''],
    ['C3', 'Sin stock', '', '', ''],
  ]);
  const r = await excel.importarProductos(db, buffer, 'inventario.xlsx', null);

  // La fila sin código se crea con código automático; la de nombre vacío es la que falla.
  assert.strictEqual(r.creados, 3);
  assert.strictEqual(r.actualizados, 1);
  assert.strictEqual(r.ajustesStock, 3);
  assert.deepStrictEqual(r.errores, [{ fila: 6, mensaje: 'El nombre es obligatorio.' }]);
  assert.strictEqual(inv.buscarPorNombre(db, 'Sin código')[0].codigo, 'P00001');

  const a1 = inv.obtenerProducto(db, existente);
  assert.strictEqual(a1.nombre, 'Nombre nuevo');
  assert.strictEqual(a1.costo, 2.5);
  assert.strictEqual(a1.stock, 15);
  assert.strictEqual(inv.buscarPorCodigo(db, 'B2').stock, 100);
  assert.strictEqual(inv.buscarPorCodigo(db, 'C3').stock, 0);

  // Reimportar el mismo archivo no duplica stock.
  const r2 = await excel.importarProductos(db, buffer, 'inventario.xlsx', null);
  assert.strictEqual(r2.ajustesStock, 0);
  assert.strictEqual(inv.buscarPorCodigo(db, 'B2').stock, 100);
});

test('importa un Excel sin códigos: los asigna y al reimportar reconoce por nombre', async () => {
  const db = nuevaDb();
  const buffer = await libroDePrueba([
    ['Descripción', 'Ubicación', 'Existencias'],
    ['Guantes de nitrilo', 'B-02', 40],
    ['Casco de seguridad', 'A-01', '12,5'],
    ['', '', ''],
  ]);
  const r = await excel.importarProductos(db, buffer, 'almacen.xlsx', null);
  assert.strictEqual(r.creados, 2);
  assert.deepStrictEqual(r.errores, []);
  assert.strictEqual(r.idsCreados.length, 2);
  const guantes = inv.buscarPorNombre(db, 'guantes de nitrilo')[0];
  assert.strictEqual(guantes.codigo, 'P00001');
  assert.strictEqual(guantes.stock, 40);
  assert.strictEqual(inv.buscarPorCodigo(db, 'P00002').stock, 12.5);

  const r2 = await excel.importarProductos(db, buffer, 'almacen.xlsx', null);
  assert.strictEqual(r2.creados, 0);
  assert.strictEqual(r2.actualizados, 2);
  assert.strictEqual(r2.ajustesStock, 0);
  assert.strictEqual(inv.listarProductos(db).length, 2);
  assert.strictEqual(inv.buscarPorNombre(db, 'Guantes de nitrilo')[0].codigo, 'P00001');
});

test('una fila con error no deja cambios a medias ni se cuenta', async () => {
  const db = nuevaDb();
  inv.crearProducto(db, { codigo: 'D1', nombre: 'Duplicado' });
  inv.crearProducto(db, { codigo: 'D2', nombre: 'Duplicado' });
  const buffer = await libroDePrueba([
    ['Nombre', 'Stock'],
    ['Nuevo con stock inválido', 'muchos'],
    ['Duplicado', 5],
  ]);
  const r = await excel.importarProductos(db, buffer, 'x.xlsx', null);
  assert.strictEqual(r.creados, 0);
  assert.strictEqual(r.errores.length, 2);
  assert.match(r.errores[1].mensaje, /Hay 2 productos llamados/);
  assert.strictEqual(inv.buscarPorNombre(db, 'Nuevo con stock inválido').length, 0);
  // El correlativo usado por la fila fallida se revierte junto con ella.
  assert.strictEqual(inv.generarCodigo(db), 'P00001');
});

test('importa CSV y rechaza archivos sin columnas reconocibles', async () => {
  const db = nuevaDb();
  const csv = Buffer.from('codigo,nombre,stock\nX1,Cinta,7\n');
  const r = await excel.importarProductos(db, csv, 'datos.csv', null);
  assert.strictEqual(r.creados, 1);
  assert.strictEqual(inv.buscarPorCodigo(db, 'X1').stock, 7);

  const malo = await libroDePrueba([['Columna', 'Otra'], [1, 2]]);
  await assert.rejects(excel.importarProductos(db, malo, 'malo.xlsx', null), /Nombre/);
});

test('exporta productos con stock a Excel', async () => {
  const db = nuevaDb();
  const id = inv.crearProducto(db, { codigo: 'P1', nombre: 'Tornillo', costo: 2 });
  inv.registrarMovimiento(db, { productoId: id, tipo: 'entrada', cantidad: 5 });
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.load(await excel.exportarProductos(db));
  const fila = libro.worksheets[0].getRow(2).values;
  assert.ok(fila.includes('P1'));
  assert.ok(fila.includes(5));
  assert.ok(fila.includes(10));
});

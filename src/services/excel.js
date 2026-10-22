const ExcelJS = require('exceljs');
const inv = require('./inventario');

// Nombres de columna aceptados al importar (sin tildes, en minúscula).
// Así se puede subir el Excel que ya usan sin tener que renombrar todo.
const ALIAS = {
  codigo: ['codigo', 'cod', 'sku', 'codigo de barras', 'item', 'id'],
  nombre: ['nombre', 'producto', 'descripcion', 'articulo', 'detalle'],
  categoria: ['categoria', 'familia', 'linea', 'tipo'],
  unidad: ['unidad', 'um', 'u.m.', 'unidad de medida', 'medida'],
  costo: ['costo', 'costo unitario', 'precio compra', 'precio de compra'],
  precio: ['precio', 'precio venta', 'precio de venta', 'pvp'],
  stock_minimo: ['stock minimo', 'stock_minimo', 'minimo', 'stock min'],
  stock: ['stock', 'cantidad', 'stock actual', 'stock inicial', 'existencias', 'saldo'],
  ubicacion: ['ubicacion', 'almacen', 'estante', 'lugar'],
};

const COLUMNAS_PLANTILLA = [
  ['codigo', 'Código'], ['nombre', 'Nombre'], ['categoria', 'Categoría'], ['unidad', 'Unidad'],
  ['costo', 'Costo'], ['precio', 'Precio'], ['stock_minimo', 'Stock mínimo'], ['stock', 'Stock'],
  ['ubicacion', 'Ubicación'],
];

function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function campoDeEncabezado(encabezado) {
  const n = normalizar(encabezado);
  return Object.keys(ALIAS).find((campo) => ALIAS[campo].includes(n));
}

function valorCelda(celda) {
  const v = celda.value;
  if (v && typeof v === 'object') {
    if ('result' in v) return v.result; // fórmula
    if ('richText' in v) return v.richText.map((t) => t.text).join('');
    if ('text' in v) return v.text; // hipervínculo
  }
  return v;
}

async function leerFilas(buffer, nombreArchivo) {
  const libro = new ExcelJS.Workbook();
  if (/\.csv$/i.test(nombreArchivo)) {
    const { Readable } = require('node:stream');
    await libro.csv.read(Readable.from(buffer));
  } else {
    await libro.xlsx.load(buffer);
  }
  const hoja = libro.worksheets[0];
  if (!hoja) throw new inv.ErrorInventario('El archivo no tiene hojas.');

  // La fila de encabezados es la primera que tenga una columna reconocible como "código".
  let filaEncabezado = null;
  let mapa = {};
  hoja.eachRow((fila, numero) => {
    if (filaEncabezado) return;
    const candidato = {};
    fila.eachCell((celda, col) => {
      const campo = campoDeEncabezado(valorCelda(celda));
      if (campo && !(campo in candidato)) candidato[campo] = col;
    });
    if (candidato.codigo && candidato.nombre) { filaEncabezado = numero; mapa = candidato; }
  });
  if (!filaEncabezado) {
    throw new inv.ErrorInventario('No se encontraron las columnas "Código" y "Nombre" en la primera hoja.');
  }

  const filas = [];
  hoja.eachRow((fila, numero) => {
    if (numero <= filaEncabezado) return;
    const datos = {};
    for (const [campo, col] of Object.entries(mapa)) {
      const v = valorCelda(fila.getCell(col));
      datos[campo] = v === null || v === undefined ? '' : v;
    }
    if (Object.values(datos).every((v) => String(v).trim() === '')) return;
    filas.push({ numero, datos });
  });
  return { filas, columnas: Object.keys(mapa) };
}

/**
 * Importa productos. Si el código existe, actualiza sus datos; si no, lo crea.
 * Si hay columna de stock, se registra un ajuste para dejar el stock en ese valor.
 * Las filas con error se reportan y no detienen al resto.
 */
async function importarProductos(db, buffer, nombreArchivo, usuarioId) {
  const { filas, columnas } = await leerFilas(buffer, nombreArchivo);
  const resultado = { creados: 0, actualizados: 0, ajustesStock: 0, errores: [], columnas };

  for (const { numero, datos } of filas) {
    try {
      db.transaction(() => {
        const existente = inv.buscarPorCodigo(db, datos.codigo);
        let id;
        if (existente) {
          // Solo se sobrescriben las columnas presentes en el archivo.
          const combinado = { ...existente };
          for (const c of columnas) if (c !== 'stock') combinado[c] = datos[c];
          inv.actualizarProducto(db, existente.id, combinado);
          id = existente.id;
          resultado.actualizados++;
        } else {
          id = inv.crearProducto(db, datos);
          resultado.creados++;
        }
        if (columnas.includes('stock') && String(datos.stock).trim() !== '') {
          const actual = inv.obtenerProducto(db, id).stock;
          if (Number(datos.stock) !== actual) {
            inv.registrarMovimiento(db, {
              productoId: id, tipo: 'ajuste', cantidad: datos.stock,
              nota: `Importación de ${nombreArchivo}`, origen: 'importacion', usuarioId,
            });
            resultado.ajustesStock++;
          }
        }
      })();
    } catch (err) {
      if (!(err instanceof inv.ErrorInventario)) throw err;
      resultado.errores.push({ fila: numero, mensaje: err.message });
    }
  }
  return resultado;
}

function estilarEncabezado(hoja) {
  hoja.getRow(1).font = { bold: true };
  hoja.views = [{ state: 'frozen', ySplit: 1 }];
}

async function exportarProductos(db) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Productos');
  hoja.columns = [
    ...COLUMNAS_PLANTILLA.map(([key, header]) => ({ key, header, width: key === 'nombre' ? 40 : 14 })),
    { key: 'valorizado', header: 'Valorizado', width: 14 },
  ];
  for (const p of inv.listarProductos(db)) hoja.addRow({ ...p, valorizado: p.stock * p.costo });
  estilarEncabezado(hoja);
  return libro.xlsx.writeBuffer();
}

async function exportarMovimientos(db, filtros) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Movimientos');
  hoja.columns = [
    { key: 'creado_en', header: 'Fecha', width: 20 },
    { key: 'codigo', header: 'Código', width: 14 },
    { key: 'nombre', header: 'Producto', width: 40 },
    { key: 'tipo', header: 'Tipo', width: 10 },
    { key: 'cantidad', header: 'Cantidad', width: 10 },
    { key: 'unidad', header: 'Unidad', width: 8 },
    { key: 'usuario', header: 'Usuario', width: 18 },
    { key: 'origen', header: 'Origen', width: 12 },
    { key: 'nota', header: 'Nota', width: 40 },
  ];
  for (const m of inv.listarMovimientos(db, { ...filtros, limite: 100000 })) hoja.addRow(m);
  estilarEncabezado(hoja);
  return libro.xlsx.writeBuffer();
}

async function plantilla() {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Productos');
  hoja.columns = COLUMNAS_PLANTILLA.map(([key, header]) => ({ key, header, width: key === 'nombre' ? 40 : 14 }));
  hoja.addRow({ codigo: 'P0001', nombre: 'Ejemplo: Tornillo 1/4"', categoria: 'Ferretería', unidad: 'UND',
    costo: 0.5, precio: 0.8, stock_minimo: 100, stock: 500, ubicacion: 'A-01' });
  estilarEncabezado(hoja);
  return libro.xlsx.writeBuffer();
}

module.exports = { importarProductos, exportarProductos, exportarMovimientos, plantilla, normalizar };

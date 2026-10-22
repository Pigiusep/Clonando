# Inventario OV Corp

Sistema web de inventario para reemplazar el control en Excel. Incluye productos, entradas, salidas, conteos físicos, alertas de stock mínimo, escaneo con QR o código de barras, etiquetas QR imprimibles, importación del Excel actual y exportación de reportes.

- **Stack:** Node.js 20+, Express, SQLite (un solo archivo, sin instalar un servidor de base de datos) y vistas EJS.
- **Usuarios:** `admin` (todo) y `operador` (productos y movimientos; no puede importar, desactivar ni gestionar usuarios).

## Puesta en marcha

```bash
npm install
cp .env.example .env      # opcional: edita la clave del admin y SESSION_SECRET
npm start                 # http://localhost:3000
npm test                  # pruebas automáticas
```

La primera vez se crea el usuario `admin` con clave `admin123`, o con los valores de `ADMIN_USER` y `ADMIN_PASSWORD` si los definiste. **Cámbiala apenas ingreses**, en *Usuarios*.

La base de datos queda en `data/inventario.db`. Para respaldarla basta con copiar ese archivo.

## Migrar desde el Excel actual

1. Entra a **Excel → Importar productos** con el usuario admin.
2. Sube el `.xlsx` o `.csv`. Solo necesita las columnas **Código** y **Nombre**. También reconoce Categoría, Unidad, Costo, Precio, Stock mínimo, Stock y Ubicación, con o sin tildes y con sinónimos como "Descripción", "SKU", "Existencias" o "Almacén" (ver `src/services/excel.js`).
3. Si el código ya existe, se actualizan sus datos. Si trae **Stock**, se registra un *ajuste* para que el stock quede igual al del Excel, así que reimportar el mismo archivo no duplica cantidades.
4. Las filas con problemas, como un código vacío o un número inválido, se listan y no detienen el resto.

Antes de importar conviene limpiar el Excel: una fila por producto, un código único, sin celdas combinadas y la primera hoja con los datos.

## Cómo se registran los movimientos con escáner

El stock **no se edita a mano**. Se calcula sumando los movimientos (entrada `+`, salida `−` y ajuste por conteo), así cada cambio queda con fecha, usuario, origen y nota. El sistema no permite salidas mayores al stock disponible.

La pantalla **Escanear** acepta tres formas de leer un código, y todas terminan en el mismo flujo:

| Opción | Qué se necesita | Cuándo conviene |
|---|---|---|
| **Pistola lectora USB o Bluetooth** | Un lector de códigos de barras y QR (desde unos S/ 60–150). Funciona como un teclado: "escribe" el código y presiona Enter. | Almacén con mucho movimiento. Es la opción más rápida y confiable y **no necesita HTTPS ni permisos**. Elige un modelo "2D" para leer QR y códigos de barras. |
| **Cámara del celular, tablet o laptop** | El navegador (Chrome o Safari) y que el sistema se abra con **https://** | Sin hardware extra. Lee QR y códigos de barras (EAN-13, Code 128 y otros). |
| **Escribir el código** | Nada | Respaldo cuando la etiqueta está dañada. También puedes buscar por nombre en *Productos*. |

Flujo en pantalla:

1. Elige la operación: **Consultar**, **Entrada**, **Salida** o **Conteo** (ajuste por inventario físico).
2. Escanea. Aparece el producto con su stock; ingresa la cantidad y presiona *Registrar*.
3. **Registro rápido** (opcional): en entradas y salidas, cada lectura suma 1 unidad sin confirmar. Sirve para recibir o despachar unidad por unidad con la pistola.
4. Si el código no existe, ofrece crear el producto con ese código ya completado.
5. Hay un sonido y una vibración distintos para lectura correcta o error, para no tener que mirar la pantalla.

### ¿Qué código lleva cada producto?

- **Si el producto ya trae código de barras del fabricante** (EAN-13 en la caja), usa ese número como *Código* en el sistema y no necesitas etiquetas.
- **Si no trae código**, asigna uno interno (`P0001`, `P0002`…) e imprime etiquetas QR en *Productos → Imprimir etiquetas QR*. La hoja está pensada para A4 con 21 etiquetas autoadhesivas de 63,5 × 38 mm, aunque también sirve en papel normal para recortar. El QR contiene solo el código, así que lo lee cualquier lector.
- Para estantes o cajas, puedes poner una etiqueta por ubicación y anotar la ubicación en el producto.

### Sobre la cámara y HTTPS

Por seguridad, los navegadores **solo permiten usar la cámara en sitios con HTTPS** (o en `localhost`). Opciones:

1. **Publicarlo en internet con HTTPS** (lo más simple): Render, Railway o Fly.io dan HTTPS automático. Usa un disco persistente para `data/`.
2. **Red local de la oficina:** genera un certificado con [mkcert](https://github.com/FiloSottile/mkcert) para la IP del servidor e inicia con `SSL_KEY=certs/key.pem SSL_CERT=certs/cert.pem npm start`. Cada celular debe confiar en el certificado raíz de mkcert. Otra opción es poner Caddy delante como proxy.
3. **Sin HTTPS:** las pistolas lectoras y la escritura manual siguen funcionando. Solo la cámara queda desactivada, y la pantalla lo explica.

## Estructura

```
server.js                 arranque (HTTP o HTTPS)
src/app.js                configuración de Express, sesión y rutas
src/db.js                 esquema SQLite y admin inicial
src/services/inventario.js reglas de stock y movimientos
src/services/excel.js     importar/exportar Excel y CSV
src/routes/               páginas y API (/api usada por el escáner)
views/                    plantillas EJS
public/js/escaner.js      lector: pistola, cámara (html5-qrcode) y teclado
test/                     pruebas (node --test)
```

## Ideas para siguientes versiones

- Varios almacenes y transferencias entre ellos.
- Proveedores, órdenes de compra y costo promedio.
- Lotes y fechas de vencimiento.
- Modo sin conexión (PWA) para almacenes sin buena señal.

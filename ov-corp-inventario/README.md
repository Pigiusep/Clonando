# Inventario OV Corp

Aplicación web de inventario para reemplazar el control en Excel. Se usa desde el celular: se escanea el código QR del producto con la cámara y se registra la entrada, la salida o el conteo físico. También se puede instalar en la pantalla de inicio del celular como una app.

**Funciones:** productos con **código automático** (P00001, P00002…), etiquetas QR para hoja A4 o impresora térmica, escaneo con cámara, pistola lectora o teclado, stock calculado a partir de los movimientos, alertas de stock mínimo, importación del Excel actual (aunque no tenga códigos), exportación a Excel, usuarios con roles y bitácora de seguridad.

**Stack:** Node.js 22, Express 5, SQLite (better-sqlite3), vistas EJS sin frameworks de frontend, html5-qrcode y Docker con Caddy para HTTPS automático.

---

## Cómo se usa

1. **Migrar:** en *Excel → Importar*, sube el Excel actual. Solo necesita la columna **Nombre**. A cada producto se le asigna un código automático; si ya trae código de barras, se respeta.
2. **Etiquetar:** usa el botón *Imprimir etiquetas de los productos nuevos*. Las etiquetas salen ordenadas por ubicación para pegarlas recorriendo el almacén.
3. **Operar:** en *Escanear* (también desde el celular), elige **Salida**, **Entrada** o **Conteo**, abre la cámara, apunta al QR, escribe la cantidad y registra.
4. **Controlar:** el inicio muestra los productos bajo el mínimo. *Movimientos* tiene el historial completo y se exporta a Excel.

### Códigos de producto

- Si el código se deja vacío, el sistema asigna el siguiente libre: `P` más 5 dígitos. Se configura con `PREFIJO_CODIGO` y `DIGITOS_CODIGO`.
- El correlativo **solo avanza**: un código impreso nunca se le asigna a otro producto, ni siquiera si el original se desactiva.
- El código no contiene datos que cambien (precio, ubicación). Esos datos están en la ficha.
- Al reimportar un Excel sin códigos, las filas se reconocen por **nombre exacto**, así que no se duplican. Si hay dos productos con el mismo nombre, se pide agregar la columna Código.

### Etiquetas

En *Productos → Imprimir etiquetas QR* hay dos formatos:

| Formato | Papel | Cuándo conviene |
|---|---|---|
| **A4** | Hojas adhesivas de 21 etiquetas (70 × 42 mm o 63,5 × 38 mm) en cualquier impresora láser o de tinta | Para empezar sin comprar equipo. |
| **Rollo** | Impresora térmica de etiquetas con rollo de 50 × 25 mm | Si se etiqueta seguido. No usa tinta y las etiquetas son más resistentes. |

Para productos pequeños o a granel (tornillos, cables), la etiqueta va en el **estante o gaveta**, no en cada unidad.

---

## Instalación

### Desarrollo

```bash
npm install
npm run dev               # http://localhost:3000 (se reinicia al guardar cambios)
```

Al arrancar por primera vez, la consola muestra el **usuario `admin` y una contraseña temporal**, que hay que cambiar en el primer ingreso. En `localhost` la cámara funciona sin HTTPS.

### Producción: https://inventario.ovcorp.com.pe

La guía paso a paso está en **[docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)**: servidor, registro DNS del subdominio, instalación e instalación en los celulares. En resumen:

1. Crea un registro DNS **A** `inventario` → IP del servidor.
2. **Automático (recomendado):** GitHub Actions publica en cada cambio a esta carpeta en `master` o `claude/untitled-session-hbq806` (`.github/workflows/inventario.yml` en la raíz del repositorio). Requiere configurar una vez los secretos indicados en la guía.
   **Manual:** en el servidor, `git clone https://github.com/pigiusep/clonando.git`, luego `cd clonando/ov-corp-inventario && sudo ./deploy/instalar.sh`.

Caddy obtiene y renueva el certificado HTTPS automáticamente. Sin HTTPS los celulares **no permiten usar la cámara**.

**Solo red local (sin internet):** en `deploy/Caddyfile` descomenta `tls internal` y usa la IP del servidor como `DOMINIO`. Luego instala en cada celular el certificado raíz de Caddy.

### Respaldos

Toda la información está en un solo archivo SQLite, dentro del volumen `datos` (`/app/data/inventario.db`). Un respaldo diario basta, por ejemplo con cron:

```bash
docker compose exec app node -e "require('better-sqlite3')('/app/data/inventario.db').backup('/app/data/respaldo-'+new Date().toISOString().slice(0,10)+'.db')"
```

Copia esos archivos fuera del servidor (Google Drive, otro disco) y prueba de vez en cuando restaurar uno.

---

## Seguridad

| Riesgo | Medida |
|---|---|
| Contraseñas robadas o débiles | bcrypt (costo 12). Política NIST: mínimo 10 caracteres, rechaza contraseñas comunes o que contengan el usuario. Las contraseñas temporales se cambian obligatoriamente en el primer ingreso. |
| Fuerza bruta | Máximo 10 intentos fallidos cada 15 minutos por IP y usuario. Los bloqueos quedan en la bitácora. |
| Enumeración de usuarios | Mismo mensaje y mismo tiempo de respuesta si el usuario existe o no. |
| Robo o fijación de sesión | Cookie `HttpOnly`, `SameSite=Strict` y `Secure` con HTTPS. Nueva sesión al ingresar. Vence tras 8 h sin uso. Al cambiar la contraseña o desactivar a un usuario se cierran sus otras sesiones. |
| CSRF | Token aleatorio por sesión en todos los formularios y en la API del escáner, comparado en tiempo constante. |
| XSS | Las plantillas escapan todo por defecto. CSP estricta sin scripts en línea (`script-src 'self'`). El escáner usa `textContent`. |
| Inyección SQL | Todas las consultas usan parámetros, y la búsqueda escapa `%` y `_`. |
| Permisos | Roles `admin` y `operador` verificados en el servidor. El usuario se vuelve a leer en cada petición, así que los cambios aplican de inmediato. |
| Datos inválidos | Validación de tipos, rangos y largos en el servidor. Límites de tamaño para formularios (100 KB), JSON (20 KB) y archivos (10 MB). |
| Filtrado de información | Los errores inesperados se registran en el log; al usuario solo se le muestra un mensaje genérico. Los logs ocultan cookies y contraseñas. |
| Cabeceras HTTP | Helmet: CSP, HSTS (en producción), `nosniff`, `frame-ancestors 'none'`, `Referrer-Policy`. Las páginas con datos usan `Cache-Control: no-store`. |
| Redirecciones abiertas | Solo se redirige a rutas del mismo sitio. |
| Configuración insegura | En producción la app no arranca sin un `SESSION_SECRET` de 32 o más caracteres. Solo confía en `X-Forwarded-For` con `TRUST_PROXY=1`. |
| Trazabilidad | Cada movimiento guarda usuario, fecha, origen y nota, y el stock no se edita directamente. La bitácora registra ingresos, intentos fallidos, cambios de usuarios, importaciones y productos desactivados. |
| Dependencias | `npm audit` en CI y Dependabot semanal. Imagen Docker que corre sin root. |

Para reportar una vulnerabilidad, ver [SECURITY.md](SECURITY.md).

---

## Desarrollo

```bash
npm run lint      # ESLint
npm test          # pruebas (node:test + supertest), base de datos en memoria
npm run check     # lint + pruebas + auditoría de dependencias
```

GitHub Actions (`.github/workflows/inventario.yml`, en la raíz del repositorio `pigiusep/clonando`) ejecuta lo mismo en cada push y pull request que toque esta carpeta, construye la imagen Docker y publica en el servidor.

```
server.js                    arranque, HTTPS opcional y apagado ordenado
src/config.js                variables de entorno validadas al arrancar
src/app.js                   Express: seguridad, sesión, rutas y manejo de errores
src/middleware.js            CSRF, sesión, roles, auditoría y no-cache
src/db.js                    esquema SQLite con migraciones versionadas y admin inicial
src/services/inventario.js   reglas de negocio: códigos, stock y movimientos
src/services/excel.js        importar y exportar Excel/CSV
src/services/passwords.js    hash y política de contraseñas
src/routes/                  páginas y API JSON (/api) que usa el escáner
views/                       plantillas EJS
public/js/escaner.js         cámara, pistola y teclado
public/sw.js                 service worker (app instalable, sin cachear datos)
test/                        pruebas automáticas
deploy/Caddyfile             proxy HTTPS para inventario.ovcorp.com.pe
deploy/instalar.sh           instalación guiada en el servidor
docs/DESPLIEGUE.md           guía de publicación
```

### Siguientes pasos posibles

- Varios almacenes y transferencias entre ellos.
- Proveedores, órdenes de compra y costo promedio.
- Lotes y fechas de vencimiento.
- Deshacer el último movimiento (con registro de quién lo deshizo).
- Autenticación en dos pasos para administradores.

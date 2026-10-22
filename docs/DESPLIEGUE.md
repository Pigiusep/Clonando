# Publicar el sistema en https://inventario.ovcorp.com.pe

Hacen falta tres piezas:

1. **Un servidor** (VPS) donde corre la aplicación.
2. **Un registro DNS** que haga que `inventario.ovcorp.com.pe` apunte a ese servidor.
3. **HTTPS**, que se configura solo con Caddy y es obligatorio para usar la cámara del celular.

La web actual de `ovcorp.com.pe` no se toca: solo se agrega el subdominio `inventario`.

---

## 1. Contratar el servidor

Un VPS con **Ubuntu 24.04**, 1 vCPU, 1–2 GB de RAM y 25 GB de disco alcanza para decenas de usuarios. Proveedores con buena latencia desde Perú: DigitalOcean, Vultr, Linode, Hetzner o AWS Lightsail. Cuesta entre USD 5 y 12 al mes.

Anota la **IP pública** que te asignen (por ejemplo `203.0.113.25`).

> Si `ovcorp.com.pe` está en un hosting compartido con cPanel, normalmente ahí no se puede ejecutar esta aplicación (necesita Node.js y Docker). Igual se usa ese panel para crear el registro DNS del paso 2.

## 2. Crear el subdominio (registro DNS)

Hay que entrar donde se administra el DNS de `ovcorp.com.pe`. Suele ser el panel del hosting (cPanel → *Zone Editor*), Cloudflare o el proveedor donde se compró el dominio (Punto.pe, GoDaddy, etc.). Para saber cuál es, se puede ejecutar `nslookup -type=NS ovcorp.com.pe` y ver los servidores que responde.

Crea este registro:

| Tipo | Nombre / Host | Valor / Apunta a | TTL |
|---|---|---|---|
| **A** | `inventario` | la IP del VPS (ej. `203.0.113.25`) | 3600 (o "Auto") |

- No modifiques los registros que ya existen (web, correo, etc.).
- **Cloudflare:** deja la nube en **gris** (*DNS only*) al menos hasta que el certificado esté emitido. Después se puede activar el proxy en modo SSL *Full (strict)*.

Para comprobarlo (a veces tarda de 5 a 30 minutos):

```bash
nslookup inventario.ovcorp.com.pe
# Debe responder con la IP del VPS
```

## 3. Instalar en el servidor

Conéctate al VPS por SSH y ejecuta:

```bash
sudo apt update && sudo apt install -y git
git clone https://github.com/pigiusep/ov-corp-inventario.git
cd ov-corp-inventario
sudo ./deploy/instalar.sh
```

El script:

1. instala Docker si no está;
2. crea el `.env` con una clave secreta aleatoria y te pide el correo para los avisos del certificado;
3. verifica que el DNS apunte al servidor;
4. abre en el firewall solo SSH, 80 y 443;
5. levanta la aplicación y Caddy, y muestra la **contraseña temporal del administrador**.

Abre **https://inventario.ovcorp.com.pe**, ingresa con `admin` y esa contraseña, y cámbiala cuando te lo pida.

## 3-B. Despliegue automático desde GitHub (recomendado)

Con esto, cada cambio que se sube a la rama `main` pasa las pruebas y se publica solo en el servidor, sin entrar por SSH. Se configura **una sola vez**.

**a) En el servidor:** conéctate por SSH y crea una llave exclusiva para GitHub:

```bash
ssh-keygen -t ed25519 -N "" -C "github-despliegue" -f ~/.ssh/github_despliegue
cat ~/.ssh/github_despliegue.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_despliegue          # llave privada: cópiala completa, desde -----BEGIN hasta -----END
for f in /etc/ssh/ssh_host_*_key.pub; do echo "179.236.250.122 $(cut -d' ' -f1,2 "$f")"; done   # huella del servidor
```

Después de copiarla a GitHub, borra la llave privada del servidor (la pública queda en `authorized_keys`):

```bash
rm ~/.ssh/github_despliegue
```

**b) En GitHub:** en el repositorio, ve a *Settings → Secrets and variables → Actions → New repository secret* y crea:

| Secreto | Valor |
|---|---|
| `VPS_HOST` | `179.236.250.122` |
| `VPS_USER` | `root` (o el usuario del VPS, que debe tener `sudo` sin contraseña) |
| `VPS_SSH_KEY` | la llave privada del paso a) |
| `VPS_HOST_KEY` | las líneas de la huella del servidor del paso a). Evita conectarse a un servidor falso. |
| `ACME_EMAIL` | correo para avisos del certificado, por ejemplo `sistemas@ovcorp.com.pe` |
| `ADMIN_PASSWORD_INICIAL` | *(opcional)* contraseña temporal del primer administrador: 10 o más caracteres, solo letras, números y `. _ @ # % + = ! , : -`. Se pide cambiarla en el primer ingreso. |
| `VPS_PORT` | *(opcional)* solo si SSH no usa el puerto 22 |

**c) Desplegar:** en *Actions → Desplegar → Run workflow*, o simplemente sube un cambio a `main`. El flujo copia el código, conserva `.env` y la base de datos, reconstruye, reinicia y comprueba que `https://inventario.ovcorp.com.pe/salud` responda.

Si no definiste `ADMIN_PASSWORD_INICIAL`, la contraseña temporal del administrador **no** aparece en GitHub, por seguridad. Se ve en el servidor con:

```bash
cd ~/ov-corp-inventario && docker compose logs app | grep -A1 "Usuario administrador creado"
```

## 4. Instalar la app en los celulares

1. Abre `https://inventario.ovcorp.com.pe` en el celular: Chrome en Android o Safari en iPhone.
2. **Android:** menú ⋮ → *Instalar aplicación*. **iPhone:** botón Compartir → *Agregar a pantalla de inicio*.
3. Aparece el ícono "Inventario" y se abre directo en la pantalla de escaneo.
4. La primera vez que toques *Abrir cámara*, acepta el permiso de cámara.

## 5. Mantenimiento

| Tarea | Comando (en la carpeta del proyecto) |
|---|---|
| Ver si está funcionando | `docker compose ps` |
| Ver los logs | `docker compose logs -f app` |
| Actualizar a una nueva versión | `git pull && docker compose up -d --build` |
| Reiniciar | `docker compose restart` |
| Respaldo manual | ver la sección *Respaldos* del README |

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| El navegador dice "No se puede acceder al sitio" | El registro DNS no existe o todavía no se propaga. Revisa con `nslookup`. |
| Error de certificado o "conexión no privada" | Caddy no pudo emitir el certificado: el DNS no apunta al VPS, los puertos 80/443 están cerrados, o Cloudflare está en modo proxy (nube naranja). Revisa `docker compose logs caddy`. |
| "La cámara solo funciona si el sistema se abre con https://" | Se abrió por IP o con `http://`. Usa siempre `https://inventario.ovcorp.com.pe`. |
| El celular no pide permiso de cámara | El permiso se negó antes. Actívalo en los ajustes del navegador para ese sitio. |

#!/usr/bin/env bash
# Instala o actualiza el sistema en un servidor Ubuntu/Debian.
#
# Manual (te pregunta lo necesario):   sudo ./deploy/instalar.sh
# Automático (lo usa GitHub Actions):  sudo NO_INTERACTIVO=1 ACME_EMAIL=correo@empresa [ADMIN_PASSWORD=...] ./deploy/instalar.sh
#
# Es seguro ejecutarlo más de una vez: no sobrescribe el .env ni borra datos.
set -euo pipefail

cd "$(dirname "$0")/.."
DOMINIO_POR_DEFECTO="inventario.ovcorp.com.pe"
NO_INTERACTIVO="${NO_INTERACTIVO:-0}"

paso() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
aviso() { printf '\033[1;33m[!] %s\033[0m\n' "$1"; }
error() { printf '\033[1;31m[x] %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || error "Ejecuta con sudo: sudo ./deploy/instalar.sh"

paso "1/5 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
docker compose version >/dev/null || error "Falta el plugin 'docker compose'."
echo "Docker listo: $(docker --version)"

paso "2/5 Configuración (.env)"
if [ ! -f .env ]; then
  if [ "$NO_INTERACTIVO" = "1" ]; then
    dominio="${DOMINIO:-$DOMINIO_POR_DEFECTO}"
    correo="${ACME_EMAIL:-}"
  else
    read -rp "Subdominio [${DOMINIO_POR_DEFECTO}]: " dominio
    read -rp "Correo para avisos del certificado HTTPS (ej. sistemas@ovcorp.com.pe): " correo
  fi
  [ -n "$correo" ] || error "El correo (ACME_EMAIL) es obligatorio."
  [[ "$correo" =~ ^[^[:space:]@|]+@[^[:space:]@|]+$ ]] || error "Correo inválido: $correo"
  cp .env.example .env
  sed -i "s|^DOMINIO=.*|DOMINIO=${dominio:-$DOMINIO_POR_DEFECTO}|" .env
  sed -i "s|^ACME_EMAIL=.*|ACME_EMAIL=${correo}|" .env
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$(openssl rand -hex 32)|" .env
  # Contraseña inicial del admin (opcional). Solo se usa al crear la base y debe cambiarse al primer ingreso.
  if [ -n "${ADMIN_PASSWORD:-}" ]; then
    # Solo caracteres que no se interpretan al leer el .env (sin espacios, comillas, $, &, | ni \).
    [[ "$ADMIN_PASSWORD" =~ ^[A-Za-z0-9._@#%+=!,:-]{10,72}$ ]] \
      || error "ADMIN_PASSWORD: 10 a 72 caracteres, solo letras, números y . _ @ # % + = ! , : -"
    sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PASSWORD}|" .env
  fi
  chmod 600 .env
  echo ".env creado con una clave secreta aleatoria (solo lo puede leer root)."
else
  echo ".env ya existe; no se modifica."
fi
# shellcheck disable=SC1091
set -a; . ./.env; set +a

paso "3/5 DNS de ${DOMINIO}"
ip_servidor="$(curl -fsS -4 https://api.ipify.org || true)"
ip_dns="$(getent ahostsv4 "$DOMINIO" | awk 'NR==1 {print $1}' || true)"
echo "IP pública de este servidor: ${ip_servidor:-desconocida}"
echo "IP a la que apunta ${DOMINIO}: ${ip_dns:-(sin registro)}"
if [ -z "$ip_dns" ] || [ "$ip_dns" != "$ip_servidor" ]; then
  aviso "El DNS no apunta a este servidor. Registro necesario: A  inventario -> ${ip_servidor}"
  aviso "Sin eso, Caddy no podrá obtener el certificado HTTPS."
  if [ "$NO_INTERACTIVO" != "1" ]; then
    read -rp "¿Continuar de todos modos? [s/N] " seguir
    [ "${seguir,,}" = "s" ] || exit 1
  fi
fi

paso "4/5 Firewall"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  echo "Firewall activo: se permitieron los puertos 80 y 443."
else
  # No se activa un firewall nuevo: podría cortar otros servicios que ya usa este servidor.
  echo "ufw no está activo; no se cambia. Verifica en el panel del proveedor que 80 y 443 estén abiertos."
fi

paso "4b/5 Publicación web (puertos 80 y 443)"
PUERTO_LOCAL="${PUERTO_LOCAL:-3080}"
command -v ss >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq iproute2; }
poner_env() { # poner_env CLAVE VALOR: agrega o reemplaza una línea del .env
  if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=$2|" .env; else printf '%s=%s\n' "$1" "$2" >> .env; fi
}
quien_usa() { # nombre del proceso que escucha en un puerto TCP (vacío si está libre)
  ss -ltnpH "sport = :$1" 2>/dev/null | grep -o 'users:(("[^"]*' | head -1 | cut -d'"' -f2
}
caddy_propio=0
if [ -n "$(docker compose ps -q --status running caddy 2>/dev/null)" ]; then caddy_propio=1; fi
dueno="$(quien_usa 80)"; [ -n "$dueno" ] || dueno="$(quien_usa 443)"
if [ "$caddy_propio" = "1" ] || [ -z "$dueno" ]; then
  modo=caddy
elif [[ "$dueno" == nginx* ]]; then
  modo=nginx
elif [[ "$dueno" == apache2* || "$dueno" == httpd* ]]; then
  modo=apache
elif [ "$dueno" = "docker-proxy" ] \
  && caddy_ajeno="$(docker ps --filter publish=80 --format '{{.Names}} {{.Image}}' | awk '$2 ~ /caddy/ {print $1; exit}')" \
  && [ -n "$caddy_ajeno" ]; then
  modo=caddy-existente
else
  echo "Programa que usa el puerto 80/443: $dueno"
  if [ "$dueno" = "docker-proxy" ]; then
    docker ps --format '  contenedor {{.Names}} -> {{.Ports}}' | grep -E ':(80|443)->' || true
  fi
  error "Los puertos 80/443 los usa '$dueno' y no sé configurarlo solo. Envía este mensaje para resolverlo; no se cambió nada."
fi
echo "Puertos 80/443: ${dueno:-libres}. Modo de publicación: $modo"
poner_env PUERTO_LOCAL "$PUERTO_LOCAL"
if [ "$modo" = "caddy-existente" ]; then
  red_externa="$(docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$caddy_ajeno" | awk '{print $1}')"
  [ -n "$red_externa" ] || error "No se encontró la red Docker del contenedor $caddy_ajeno."
  echo "Se usará el Caddy existente '$caddy_ajeno' (red Docker: $red_externa)."
  cat > docker-compose.proxy-externo.yml <<YAML
# Generado por deploy/instalar.sh: une la app a la red del Caddy que ya usa los puertos 80/443.
services:
  app:
    networks:
      default: {}
      proxy_externo:
        aliases: [inventario-app]
networks:
  proxy_externo:
    external: true
    name: ${red_externa}
YAML
  poner_env COMPOSE_FILE "docker-compose.yml:docker-compose.proxy-externo.yml"
else
  poner_env COMPOSE_FILE "docker-compose.yml"
fi
export COMPOSE_FILE="$(grep '^COMPOSE_FILE=' .env | cut -d= -f2-)"
if [ "$modo" = "caddy" ]; then
  poner_env COMPOSE_PROFILES caddy
else
  poner_env COMPOSE_PROFILES ""
  docker compose rm -sf caddy >/dev/null 2>&1 || true
fi
export COMPOSE_PROFILES="$( [ "$modo" = caddy ] && echo caddy || true )"

paso "5/5 Levantar el sistema"
docker compose up -d --build --remove-orphans
echo "Esperando a que arranque…"
sano=0
for _ in $(seq 1 30); do
  if docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/salud').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    sano=1
    break
  fi
  sleep 2
done
if [ "$sano" != "1" ]; then
  docker compose logs --tail 50 app >&2
  error "La aplicación no respondió. Revisa los logs de arriba."
fi
docker image prune -f >/dev/null

if [ "$modo" = "caddy-existente" ]; then
  paso "Agregando ${DOMINIO} al Caddy existente ($caddy_ajeno)"
  caddyfile="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}' "$caddy_ajeno")"
  if [ -z "$caddyfile" ]; then
    dir_caddy="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/caddy"}}{{.Source}}{{end}}{{end}}' "$caddy_ajeno")"
    [ -n "$dir_caddy" ] && caddyfile="$dir_caddy/Caddyfile"
  fi
  [ -n "$caddyfile" ] && [ -f "$caddyfile" ] \
    || error "No se encontró en el servidor el Caddyfile de $caddy_ajeno. No se cambió su configuración."
  echo "Caddyfile: $caddyfile"
  if grep -q "^${DOMINIO//./\\.}[[:space:]]*{" "$caddyfile"; then
    echo "${DOMINIO} ya estaba configurado en ese Caddyfile."
  else
    respaldo="${caddyfile}.respaldo-$(date +%Y%m%d-%H%M%S)"
    cp -p "$caddyfile" "$respaldo"
    echo "Respaldo: $respaldo"
    # Se agrega al final (sin reemplazar el archivo) para no afectar los sitios que ya tiene.
    cat >> "$caddyfile" <<CADDY

# Inventario OV Corp (agregado por ov-corp-inventario/deploy/instalar.sh)
${DOMINIO} {
	encode zstd gzip
	reverse_proxy inventario-app:3000
}
CADDY
    if ! docker exec "$caddy_ajeno" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
      cat "$respaldo" > "$caddyfile"
      error "La configuración nueva no era válida; se restauró el Caddyfile original."
    fi
  fi
  docker exec "$caddy_ajeno" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile \
    || error "Caddy no pudo recargar la configuración (ver arriba)."
  echo "Caddy recargado. Los demás sitios de ese Caddy siguen igual."
  aviso "Si el proyecto de '$caddy_ajeno' se vuelve a desplegar y reemplaza su Caddyfile, agrega también este bloque en ese proyecto:"
  printf '  %s {\n    encode zstd gzip\n    reverse_proxy inventario-app:3000\n  }\n' "$DOMINIO"
elif [ "$modo" = "nginx" ]; then
  paso "Configurando Nginx para ${DOMINIO}"
  if [ -d /etc/nginx/sites-available ]; then
    conf="/etc/nginx/sites-available/${DOMINIO}"; enlace="/etc/nginx/sites-enabled/${DOMINIO}"
  else
    conf="/etc/nginx/conf.d/${DOMINIO}.conf"; enlace=""
  fi
  # Solo se crea si no existe: certbot le agrega luego la parte de HTTPS y no hay que pisarla.
  if [ ! -f "$conf" ]; then
    cat > "$conf" <<NGINX
# Inventario OV Corp (creado por deploy/instalar.sh). Solo afecta a ${DOMINIO}.
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMINIO};
    client_max_body_size 12m;
    location / {
        proxy_pass http://127.0.0.1:${PUERTO_LOCAL};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
  fi
  [ -n "$enlace" ] && ln -sf "$conf" "$enlace"
  nginx -t || error "La configuración de Nginx tiene un error (ver arriba). No se recargó Nginx."
  systemctl reload nginx
  command -v certbot >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx; }
  certbot --nginx -d "$DOMINIO" -m "$ACME_EMAIL" --agree-tos --non-interactive --redirect --keep-until-expiring \
    || error "No se pudo obtener el certificado HTTPS. Revisa que el DNS de ${DOMINIO} apunte a este servidor."
elif [ "$modo" = "apache" ]; then
  paso "Configurando Apache para ${DOMINIO}"
  a2enmod -q proxy proxy_http headers >/dev/null
  conf="/etc/apache2/sites-available/${DOMINIO}.conf"
  if [ ! -f "$conf" ]; then
    cat > "$conf" <<APACHE
# Inventario OV Corp (creado por deploy/instalar.sh). Solo afecta a ${DOMINIO}.
<VirtualHost *:80>
    ServerName ${DOMINIO}
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:${PUERTO_LOCAL}/
    ProxyPassReverse / http://127.0.0.1:${PUERTO_LOCAL}/
    RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}
    LimitRequestBody 12582912
</VirtualHost>
APACHE
  fi
  a2ensite -q "${DOMINIO}.conf" >/dev/null
  apachectl configtest || error "La configuración de Apache tiene un error (ver arriba). No se recargó Apache."
  systemctl reload apache2
  command -v certbot >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq certbot python3-certbot-apache; }
  certbot --apache -d "$DOMINIO" -m "$ACME_EMAIL" --agree-tos --non-interactive --redirect --keep-until-expiring \
    || error "No se pudo obtener el certificado HTTPS. Revisa que el DNS de ${DOMINIO} apunte a este servidor."
fi

paso "Comprobando https://${DOMINIO}"
if curl -fsS --retry 10 --retry-delay 3 --retry-all-errors -o /dev/null "https://${DOMINIO}/salud"; then
  echo "Responde correctamente por HTTPS."
else
  aviso "Todavía no responde por HTTPS desde el propio servidor. Si usas Caddy, el certificado puede tardar un minuto:"
  aviso "revisa con: docker compose logs --tail 30 caddy"
fi

echo
echo "Listo: https://${DOMINIO}"
if [ "$NO_INTERACTIVO" = "1" ]; then
  # No se imprime ninguna contraseña: este log puede quedar guardado en GitHub Actions.
  echo "Si es la primera instalación y no definiste ADMIN_PASSWORD, la contraseña temporal del admin"
  echo "se ve en el servidor con: cd $(pwd) && docker compose logs app | grep -A1 'Usuario administrador creado'"
else
  echo "Usuario y contraseña temporal del administrador (solo aparecen en el primer arranque):"
  docker compose logs app 2>/dev/null | grep -A1 "Usuario administrador creado" || echo "  (ya existían usuarios; usa los de siempre)"
fi

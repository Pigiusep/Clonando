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
if command -v ufw >/dev/null 2>&1; then
  # Se abre el puerto SSH por el que estás conectado (aunque no sea el 22) para no quedar fuera.
  puerto_ssh="${SSH_CONNECTION:+${SSH_CONNECTION##* }}"
  ufw allow OpenSSH >/dev/null
  [ -n "$puerto_ssh" ] && ufw allow "${puerto_ssh}/tcp" >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw --force enable >/dev/null
  echo "Abiertos: SSH${puerto_ssh:+ (puerto $puerto_ssh)}, 80 y 443. Todo lo demás, cerrado."
else
  aviso "ufw no está instalado: verifica que solo estén abiertos los puertos de SSH, 80 y 443."
fi

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

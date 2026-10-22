#!/usr/bin/env bash
# Instalación guiada en un servidor Ubuntu/Debian nuevo.
# Uso (dentro de la carpeta del proyecto):  sudo ./deploy/instalar.sh
# Es seguro ejecutarlo más de una vez: no sobrescribe el .env ni borra datos.
set -euo pipefail

cd "$(dirname "$0")/.."
DOMINIO_POR_DEFECTO="inventario.ovcorp.com.pe"

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
  cp .env.example .env
  read -rp "Subdominio [${DOMINIO_POR_DEFECTO}]: " dominio
  read -rp "Correo para avisos del certificado HTTPS (ej. sistemas@ovcorp.com.pe): " correo
  [ -n "$correo" ] || error "El correo es obligatorio."
  secreto="$(openssl rand -hex 32)"
  sed -i "s|^DOMINIO=.*|DOMINIO=${dominio:-$DOMINIO_POR_DEFECTO}|" .env
  sed -i "s|^ACME_EMAIL=.*|ACME_EMAIL=${correo}|" .env
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=${secreto}|" .env
  chmod 600 .env
  echo ".env creado (solo lo puede leer root)."
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
  aviso "El DNS todavía no apunta a este servidor. Crea un registro A: inventario -> ${ip_servidor}"
  aviso "Sin eso, Caddy no podrá obtener el certificado HTTPS. Puede tardar unos minutos en propagarse."
  read -rp "¿Continuar de todos modos? [s/N] " seguir
  [ "${seguir,,}" = "s" ] || exit 1
fi

paso "4/5 Firewall"
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw --force enable >/dev/null
  echo "Abiertos: SSH, 80 y 443. Todo lo demás, cerrado."
else
  aviso "ufw no está instalado: verifica que solo estén abiertos los puertos 22, 80 y 443."
fi

paso "5/5 Levantar el sistema"
docker compose up -d --build
echo "Esperando a que arranque…"
for _ in $(seq 1 30); do
  if docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/salud').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    break
  fi
  sleep 2
done

echo
echo "Listo: https://${DOMINIO}"
echo "Usuario y contraseña temporal del administrador (solo aparecen en el primer arranque):"
docker compose logs app 2>/dev/null | grep -A1 "Usuario administrador creado" || echo "  (ya existían usuarios; usa los de siempre)"

#!/usr/bin/env bash
# Publica (o actualiza) el inventario en este servidor con un solo comando:
#
#   curl -fsSL https://raw.githubusercontent.com/Pigiusep/Clonando/claude/untitled-session-hbq806/ov-corp-inventario/deploy/publicar.sh | sudo bash
#
# Descarga el código desde GitHub y ejecuta deploy/instalar.sh. Al repetirlo, actualiza a la última
# versión sin tocar la configuración (.env) ni la base de datos.
set -euo pipefail

REPO="https://github.com/Pigiusep/Clonando.git"
RAMA="${RAMA:-claude/untitled-session-hbq806}"
DESTINO="/opt/ov-corp-inventario"

[ "$(id -u)" -eq 0 ] || { echo "Ejecuta con sudo." >&2; exit 1; }

echo "==> Descargando el código ($RAMA)"
if ! command -v git >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq git curl ca-certificates
fi
if [ -d "$DESTINO/.git" ]; then
  git -C "$DESTINO" fetch --depth 1 origin "$RAMA"
  # Solo reemplaza archivos del repositorio; .env (ignorado por git) se conserva.
  git -C "$DESTINO" reset --hard FETCH_HEAD
else
  git clone --depth 1 -b "$RAMA" "$REPO" "$DESTINO"
fi

cd "$DESTINO/ov-corp-inventario"
chmod +x deploy/*.sh
# Al ejecutarse con "curl | bash" la entrada es el propio script: las preguntas se leen de la terminal.
if [ -r /dev/tty ] && [ "${NO_INTERACTIVO:-0}" != "1" ]; then
  exec ./deploy/instalar.sh < /dev/tty
else
  exec ./deploy/instalar.sh
fi

#!/bin/zsh
cd "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  echo "Clavia necesita Node.js. Instalalo desde https://nodejs.org y volvé a abrir este archivo."
  read
  exit 1
fi
if curl --max-time 1 -fsS 'http://localhost:4173' 2>/dev/null | grep -q '<title>Clavia'; then
  open 'http://localhost:4173'
  exit 0
fi
node server.mjs &
clavia_pid=$!
trap 'kill "$clavia_pid" 2>/dev/null' EXIT INT TERM
for attempt in {1..30}; do
  if curl --max-time 1 -fsS 'http://localhost:4173' >/dev/null 2>&1; then
    open 'http://localhost:4173'
    wait "$clavia_pid"
    exit $?
  fi
  if ! kill -0 "$clavia_pid" 2>/dev/null; then
    echo "No se pudo iniciar Clavia. Revisá si el puerto 4173 está ocupado."
    read
    exit 1
  fi
  sleep 0.1
done
echo "No se pudo abrir la app. Revisá el mensaje del servidor."
read

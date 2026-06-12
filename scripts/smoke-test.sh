#!/bin/bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3001}"
WEB_ORIGIN="${WEB_ORIGIN:-http://localhost:5173}"

echo "==> Health check"
curl -sf "${API_URL}/health" | grep -q '"status":"ok"'
echo "OK"

echo "==> Auth required on protected route"
code=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/api/jugadores")
[ "$code" = "401" ]
echo "OK (401)"

echo "==> CORS preflight from web origin"
curl -sf -D - -o /dev/null -X OPTIONS "${API_URL}/api/jugadores" \
  -H "Origin: ${WEB_ORIGIN}" \
  -H "Access-Control-Request-Method: GET" | grep -qi "access-control-allow-origin: ${WEB_ORIGIN}"
echo "OK"

echo "All smoke tests passed."

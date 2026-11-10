#!/usr/bin/env bash
# CRS launcher for Linux/macOS. Mirrors start_app.bat.
set -e
cd "$(dirname "$0")"

if [ ! -x ".venv/bin/python" ]; then
  echo "The Python environment is missing. Follow the setup steps in README.md first."
  exit 1
fi
if [ ! -f "models/qwen2.5-1.5b/config.json" ]; then
  echo "The model files are missing. Run: python scripts/fetch_resources.py and python scripts/fetch_adapters.py"
  exit 1
fi
if [ ! -f "app/web/dist/index.html" ]; then
  echo "The built interface is missing from app/web/dist. Run: (cd app/web && npm install && npm run build)"
  exit 1
fi

echo "Starting CRS. Your browser will open shortly at http://127.0.0.1:8600"
( sleep 3; (xdg-open http://127.0.0.1:8600 >/dev/null 2>&1 || open http://127.0.0.1:8600 >/dev/null 2>&1 || true) ) &
PYTHONPATH="$(pwd)" .venv/bin/python -m app.server
echo
echo "CRS has stopped."

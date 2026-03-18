#!/usr/bin/env sh
set -eu

# Ensure dependencies are present (fixes: `react-scripts: not found`)
if [ ! -d "node_modules" ]; then
  echo "[start-preview] node_modules missing; running npm install..."
  npm install --silent
fi

# Respect externally provided PORT/HOST if present (PreviewManager may set them)
exec npm start

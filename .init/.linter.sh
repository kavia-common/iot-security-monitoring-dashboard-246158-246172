#!/bin/bash
cd /home/kavia/workspace/code-generation/iot-security-monitoring-dashboard-246158-246172/frontend_dashboard
npm install --no-audit --no-fund
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


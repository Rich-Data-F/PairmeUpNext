#!/bin/bash

# EarbudHub - Stop Servers Script
# Gracefully stops both API and Web servers

echo "🛑 Stopping EarbudHub servers..."

# Kill servers using stored PIDs
if [ -f /tmp/earbudhub-api.pid ]; then
    API_PID=$(cat /tmp/earbudhub-api.pid)
    echo "Stopping API server (PID: $API_PID)..."
    kill $API_PID 2>/dev/null || true
    rm -f /tmp/earbudhub-api.pid
fi

if [ -f /tmp/earbudhub-web.pid ]; then
    WEB_PID=$(cat /tmp/earbudhub-web.pid)
    echo "Stopping Web server (PID: $WEB_PID)..."
    kill $WEB_PID 2>/dev/null || true
    rm -f /tmp/earbudhub-web.pid
fi

# Force kill any remaining processes
echo "Force killing any remaining processes..."
lsof -ti:3000 | xargs -r kill -9
lsof -ti:4000 | xargs -r kill -9
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Clean up log files
rm -f /tmp/api-server.log /tmp/web-server.log

echo "✅ All servers stopped"

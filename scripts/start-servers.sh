#!/bin/bash

# EarbudHub - Clean Server Startup Script
# Kills existing processes and starts both API and Web servers

echo "🧹 Cleaning up existing processes..."

# Kill any existing Node.js processes on our ports
echo "Killing processes on port 3000 and 4000..."
lsof -ti:3000 | xargs -r kill -9
lsof -ti:4000 | xargs -r kill -9

# Kill any nest/next processes
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo "⏳ Waiting for ports to be freed..."
sleep 3

# Verify ports are free
if lsof -i:4000 >/dev/null 2>&1; then
    echo "❌ Port 4000 still in use!"
    lsof -i:4000
    exit 1
fi

if lsof -i:3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 still in use!"
    lsof -i:3000
    exit 1
fi

echo "✅ Ports are free, starting servers..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Start API server in background
echo "🚀 Starting API server (port 4000)..."
cd "$PROJECT_ROOT/apps/api"
npm run start:dev > /tmp/api-server.log 2>&1 &
API_PID=$!

# Wait a moment for API to start
sleep 5

# Check if API started successfully
if ! curl -s http://localhost:4000/health >/dev/null 2>&1; then
    echo "❌ API server failed to start. Check logs:"
    tail -20 /tmp/api-server.log
    kill $API_PID 2>/dev/null || true
    exit 1
fi

echo "✅ API server started successfully"

# Start Web server in background
echo "🚀 Starting Web server (port 3000)..."
cd "$PROJECT_ROOT"
npm run dev:web > /tmp/web-server.log 2>&1 &
WEB_PID=$!

# Wait for web server
sleep 8

# Check if Web started successfully
if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "❌ Web server failed to start. Check logs:"
    tail -20 /tmp/web-server.log
    kill $API_PID $WEB_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Web server started successfully"
echo ""
echo "🎉 Both servers are running:"
echo "   📡 API Server: http://localhost:4000"
echo "   🌐 Web Server: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   API: tail -f /tmp/api-server.log"
echo "   Web: tail -f /tmp/web-server.log"
echo ""
echo "🛑 To stop servers: scripts/stop-servers.sh"

# Store PIDs for cleanup script
echo "$API_PID" > /tmp/earbudhub-api.pid
echo "$WEB_PID" > /tmp/earbudhub-web.pid

# Keep script running to show logs
echo "📊 Showing live logs (Ctrl+C to detach):"
tail -f /tmp/api-server.log /tmp/web-server.log

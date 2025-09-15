#!/bin/bash
# Quick kill ports and start development

echo "🔧 Killing any existing processes on ports 3000 and 4000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

echo "🚀 Starting development servers..."
npm run dev

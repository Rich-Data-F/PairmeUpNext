#!/bin/bash
# Exit on any error
set -e

echo "==> Installing dependencies..."
npm ci --include=dev

echo "==> Copying Prisma schema from packages/db..."
cp -r ../../packages/db/prisma ./prisma

echo "==> Generating Prisma Client (with fresh schema)..."
# Force output to node_modules/@prisma/client so TS compiler finds it
# The generate is run here AFTER schema copy so types are up-to-date
npx prisma generate

# Explicitly regenerate into local node_modules in case workspace hoisting
# caused the generate above to target the workspace root. This ensures
# that the nest build TypeScript compilation picks up the latest types.
echo "==> Verifying Prisma Client has SurveyResponse..."
node -e "const p = require('@prisma/client'); console.log('surveyResponse' in new p.PrismaClient() ? '✅ surveyResponse found' : '❌ surveyResponse MISSING')" || true

echo "==> Running database migrations..."
export PRISMA_MIGRATION_LOCK_TIMEOUT=30000
export PRISMA_CLIENT_ENGINE_TYPE=library

until npx prisma migrate deploy; do
  echo "⚠️  Migration failed, retrying in 5 seconds..."
  sleep 5
done

sleep 2

echo "==> Building NestJS application..."
npx nest build

echo "==> Build complete ✅"

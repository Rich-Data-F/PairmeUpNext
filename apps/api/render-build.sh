#!/bin/bash
# Exit on any error
set -e

echo "==> Installing dependencies..."
npm ci --include=dev

echo "==> Generating Prisma Client from workspace root..."
cd ../../packages/db
npx prisma generate
cd ../../apps/api

echo "==> Generating Prisma Client from API schema (ensures local node_modules is fresh)..."
npx prisma generate --schema=prisma/prisma/schema.prisma

echo "==> Verifying Prisma Client has SurveyResponse..."
node -e "const p = require('../../node_modules/@prisma/client'); console.log('surveyResponse' in new p.PrismaClient() ? '✅ surveyResponse found' : '❌ surveyResponse MISSING')" || true


echo "==> Running database migrations..."
export PRISMA_MIGRATION_LOCK_TIMEOUT=30000
export PRISMA_CLIENT_ENGINE_TYPE=library

cd ../../packages/db
until npx prisma migrate deploy; do
  echo "⚠️  Migration failed, retrying in 5 seconds..."
  sleep 5
done
cd ../../apps/api
sleep 2

echo "==> Building NestJS application..."
npx nest build

echo "==> Build complete ✅"

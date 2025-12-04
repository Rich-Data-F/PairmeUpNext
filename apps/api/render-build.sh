#!/bin/bash
# Exit on any error
set -e

echo "Installing dependencies..."
npm ci

# Patch Prisma schema to output client to local node_modules (ensures correct client)
echo "Patching Prisma schema..."
sed -i '/provider = "prisma-client-js"/a \  output = "../node_modules/@prisma/client"' prisma/schema.prisma

# Verify schema contains ProposedBrand (debug helper)
echo "Verifying schema content (ProposedBrand check):"
grep "model ProposedBrand" prisma/schema.prisma || echo "ProposedBrand NOT FOUND in schema!"

# Generate Prisma client
echo "Generating Prisma Client..."
npx prisma generate

# -------------------------------------------------
# Migration section – increase advisory lock timeout and use library engine
export PRISMA_MIGRATION_LOCK_TIMEOUT=30000   # 30 seconds
export PRISMA_CLIENT_ENGINE_TYPE=library      # better connection handling for serverless DBs

echo "Running migrations with retry logic..."
until npx prisma migrate deploy; do
  echo "⚠️ Migration failed, retrying in 5 seconds..."
  sleep 5
done
# Small pause to let the DB settle before building the app
sleep 2
# -------------------------------------------------

echo "Building NestJS app..."
npx nest build

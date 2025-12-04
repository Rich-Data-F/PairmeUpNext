#!/bin/bash
# Exit on error
set -e

echo "Installing dependencies..."
npm ci

echo "Setting up Prisma..."
rm -rf prisma
cp -r ../../packages/db/prisma ./prisma

# Patch schema to output client to local node_modules
# This ensures the API uses the generated client instead of the default one
echo "Patching Prisma schema..."
sed -i '/provider = "prisma-client-js"/a \  output = "../node_modules/@prisma/client"' prisma/schema.prisma

echo "Generating Prisma Client..."
npx prisma generate

echo "Building NestJS app..."
npx nest build

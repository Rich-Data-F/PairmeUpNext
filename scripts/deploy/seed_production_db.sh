#!/usr/bin/env bash
set -euo pipefail

# seed_production_db.sh
# Run Prisma db seed against a production DB
# Usage:
#   DATABASE_URL="postgresql://username:password@..." bash scripts/deploy/seed_production_db.sh

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Please set DATABASE_URL environment variable to the target DB before running." >&2
  exit 1
fi

echo "Seeding Production DB: $DATABASE_URL"
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 1
cd packages/db

echo "Running Prisma seed..."
DATABASE_URL="$DATABASE_URL" npm run db:seed
echo "Done. Seed completed."

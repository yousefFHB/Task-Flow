#!/bin/sh
set -e

echo "Starting Jira Backend..."

# Run database push or migrations
if [ -f "prisma7.config.ts" ]; then
  echo "Applying database schema..."
  npx prisma db push --config prisma7.config.ts || true
fi

echo "Seeding initial mock data and demo users..."
node seed.js || true

echo "Launching application server on port ${PORT:-5000}..."
exec node server.js

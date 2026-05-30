#!/bin/sh

# Entrypoint script for Docker container
# Runs migrations and starts the application

set -e

echo "Waiting for database..."
# Database health is ensured by docker-compose depends_on with health check

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/main.js

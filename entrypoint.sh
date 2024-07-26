#!/bin/sh

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy
# Start the application
exec npm run dev

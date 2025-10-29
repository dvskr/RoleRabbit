@echo off
echo Starting PostgreSQL in Docker...
echo.

docker run --name roleready-postgres -e POSTGRES_PASSWORD=roleready_dev -e POSTGRES_USER=postgres -e POSTGRES_DB=roleready -p 5432:5432 -d postgres:15-alpine

echo.
echo PostgreSQL container started!
echo.
echo Next steps:
echo 1. Add DATABASE_URL to apps/api/.env
echo 2. Run: cd apps/api
echo 3. Run: npx prisma migrate dev --name init
echo.
pause


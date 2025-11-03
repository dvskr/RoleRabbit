#!/bin/bash
# Connect to PostgreSQL via Docker
# Usage: ./docker-connect-postgres.sh

echo ""
echo "=== Connecting to PostgreSQL via Docker ==="
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check for PostgreSQL containers
CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER" ]; then
    echo "⚠️  No PostgreSQL container found running."
    echo ""
    echo "Starting PostgreSQL container..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose up -d postgres
        sleep 5
        CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)
    else
        echo "❌ docker-compose.yml not found"
        echo ""
        echo "You can start PostgreSQL manually:"
        echo "  docker-compose up -d postgres"
        exit 1
    fi
fi

if [ -z "$CONTAINER" ]; then
    echo "❌ Could not find PostgreSQL container"
    exit 1
fi

echo "✅ Found PostgreSQL container: $CONTAINER"
echo ""
echo "Connecting..."
echo ""
echo "Useful commands once connected:"
echo "  \\dt roleready.*          - List all tables"
echo "  SELECT * FROM roleready.sessions;  - View sessions"
echo "  \\q                       - Quit"
echo ""

# Try connecting with roleready user first
docker exec -it $CONTAINER psql -U roleready -d roleready_db || \
docker exec -it $CONTAINER psql -U postgres -d postgres


# Connect to PostgreSQL via Docker
# Run: .\connect-postgres-docker.ps1

Write-Host "`n=== Connecting to PostgreSQL via Docker ===`n" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check for running PostgreSQL containers
$postgresContainers = docker ps --filter "name=postgres" --format "{{.Names}}"
if (-not $postgresContainers) {
    Write-Host "⚠️  No PostgreSQL containers found running." -ForegroundColor Yellow
    Write-Host "`nStarting PostgreSQL container..." -ForegroundColor Yellow
    
    # Try to start using docker-compose
    if (Test-Path "docker-compose.yml") {
        Write-Host "Found docker-compose.yml, starting services..." -ForegroundColor Green
        docker-compose up -d postgres
        Start-Sleep -Seconds 5
    } else {
        Write-Host "❌ docker-compose.yml not found" -ForegroundColor Red
        Write-Host "`nYou can start PostgreSQL manually:" -ForegroundColor Yellow
        Write-Host "  docker-compose up -d postgres" -ForegroundColor White
        exit 1
    }
}

# Get PostgreSQL container name
$containerName = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Could not find PostgreSQL container" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found PostgreSQL container: $containerName" -ForegroundColor Green

# Read connection details from .env
$envPath = "apps/api/.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'DATABASE_URL=postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
        $username = $matches[1]
        $password = $matches[2]
        $host = $matches[3]
        $port = $matches[4]
        $database = $matches[5]
        
        Write-Host "`nConnection Details:" -ForegroundColor Cyan
        Write-Host "  Host: $host" -ForegroundColor Gray
        Write-Host "  Port: $port" -ForegroundColor Gray
        Write-Host "  Database: $database" -ForegroundColor Gray
        Write-Host "  User: $username`n" -ForegroundColor Gray
    }
}

Write-Host "Connecting to PostgreSQL via Docker..." -ForegroundColor Yellow
Write-Host "`nOnce connected, try these commands:" -ForegroundColor Cyan
Write-Host "  \dt roleready.*          - List all tables" -ForegroundColor Gray
Write-Host "  SELECT * FROM roleready.sessions;  - View sessions" -ForegroundColor Gray
Write-Host "  \q                       - Quit`n" -ForegroundColor Gray

# Method 1: Connect via Docker exec (if container has psql)
Write-Host "Attempting connection via Docker exec..." -ForegroundColor Yellow
docker exec -it $containerName psql -U roleready -d roleready_db

# If that fails, try with postgres user
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nTrying with postgres user..." -ForegroundColor Yellow
    docker exec -it $containerName psql -U postgres -d postgres
}


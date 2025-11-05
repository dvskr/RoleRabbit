# Kill Ports Script - Kills processes on common development ports
# Usage: .\kill-ports.ps1

Write-Host "`n🔍 Checking for processes on development ports...`n" -ForegroundColor Cyan

# Common development ports
$ports = @(3000, 3001, 5173, 8000, 8080, 5000, 5001, 4000, 4001)

# Kill processes on specific ports
$killedPorts = @()
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        if ($conn.OwningProcess) {
            try {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
                Write-Host "✅ Killed process on port $port (PID: $($conn.OwningProcess))" -ForegroundColor Green
                $killedPorts += $port
            } catch {
                Write-Host "⚠️  Could not kill process on port $port (PID: $($conn.OwningProcess))" -ForegroundColor Yellow
            }
        }
    }
}

# Kill Node.js and Python processes
Write-Host "`n🔍 Checking for Node.js and Python processes...`n" -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -match "node|npm|python|uvicorn|fastapi"} -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "✅ Killed $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not kill $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No Node.js or Python processes found" -ForegroundColor Gray
}

# Verify ports are free
Write-Host "`n🔍 Verifying ports are free...`n" -ForegroundColor Cyan
$stillInUse = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object {$_.LocalPort -in $ports}
if ($stillInUse) {
    Write-Host "⚠️  These ports are still in use:" -ForegroundColor Yellow
    $stillInUse | ForEach-Object { Write-Host "  Port $($_.LocalPort) - PID $($_.OwningProcess)" -ForegroundColor Yellow }
} else {
    Write-Host "✅ All ports are free!" -ForegroundColor Green
}

Write-Host "`nDone!`n" -ForegroundColor Cyan


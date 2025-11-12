#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick setup script for Redis configuration in RoleReady

.DESCRIPTION
    This script helps you quickly set up Redis (Upstash) for your RoleReady project.
    It will guide you through the process and update your .env file.

.EXAMPLE
    .\SETUP_REDIS.ps1
#>

$ErrorActionPreference = "Stop"

# Colors for output
$ESC = [char]27
$Green = "$ESC[32m"
$Yellow = "$ESC[33m"
$Blue = "$ESC[34m"
$Red = "$ESC[31m"
$Bold = "$ESC[1m"
$Reset = "$ESC[0m"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = $Reset
    )
    Write-Host "$Color$Message$Reset"
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "════════════════════════════════════════════════════════" $Blue
    Write-ColorOutput "  $Title" "$Bold$Blue"
    Write-ColorOutput "════════════════════════════════════════════════════════" $Blue
    Write-Host ""
}

Clear-Host

Write-Header "🚀 RoleReady - Redis Setup Wizard"

Write-ColorOutput "This wizard will help you set up Redis caching for RoleReady." $Yellow
Write-ColorOutput "Estimated time: 5 minutes" $Yellow
Write-Host ""

# Check if .env already exists
$envFile = ".env"
$apiEnvFile = "apps\api\.env"
$sampleEnvFile = "samples\environment-sample.env"

Write-Header "Step 1: Check Environment Files"

if (Test-Path $envFile) {
    Write-ColorOutput "✓ Found .env file in root" $Green
    $useExisting = Read-Host "Do you want to update the existing .env file? (y/n)"
    if ($useExisting -ne "y" -and $useExisting -ne "Y") {
        Write-ColorOutput "Exiting without changes." $Yellow
        exit 0
    }
} else {
    Write-ColorOutput "✗ No .env file found in root" $Yellow
    Write-ColorOutput "Creating .env from sample..." $Blue
    
    if (Test-Path $sampleEnvFile) {
        Copy-Item $sampleEnvFile $envFile
        Write-ColorOutput "✓ Created .env file from sample" $Green
    } else {
        Write-ColorOutput "✗ Sample file not found: $sampleEnvFile" $Red
        exit 1
    }
}

Write-Host ""
Write-Header "Step 2: Upstash Redis Setup"

Write-ColorOutput "Please follow these steps to get your Redis URL:" $Yellow
Write-Host ""
Write-ColorOutput "1. Go to: https://upstash.com" $Bold
Write-ColorOutput "2. Sign up or log in (GitHub/Google recommended)" $Bold
Write-ColorOutput "3. Click 'Create Database'" $Bold
Write-ColorOutput "4. Configure:" $Bold
Write-ColorOutput "   - Name: roleready-cache" $Blue
Write-ColorOutput "   - Type: Regional" $Blue
Write-ColorOutput "   - Region: Choose closest to you" $Blue
Write-ColorOutput "5. After creation, copy the Redis URL" $Bold
Write-ColorOutput "   (Should look like: rediss://default:password@xxx.upstash.io:6379)" $Blue
Write-Host ""

Write-ColorOutput "Press Enter when you're ready to continue..." $Yellow
Read-Host

Write-Host ""
$redisUrl = Read-Host "Paste your Redis URL here"

if ([string]::IsNullOrWhiteSpace($redisUrl)) {
    Write-ColorOutput "✗ No Redis URL provided. Exiting." $Red
    exit 1
}

# Validate URL format
if ($redisUrl -notmatch "^redis(s)?://") {
    Write-ColorOutput "⚠ Warning: URL doesn't start with redis:// or rediss://" $Yellow
    Write-ColorOutput "Please make sure this is correct." $Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-ColorOutput "Exiting." $Yellow
        exit 0
    }
}

# Determine if TLS is enabled
$redisTls = if ($redisUrl -match "^rediss://") { "true" } else { "false" }

Write-Host ""
Write-Header "Step 3: Update Environment Variables"

# Read current .env content
$envContent = Get-Content $envFile -Raw

# Check if REDIS_URL already exists
if ($envContent -match "REDIS_URL=") {
    Write-ColorOutput "Updating existing REDIS_URL..." $Blue
    $envContent = $envContent -replace "REDIS_URL=.*", "REDIS_URL=$redisUrl"
} else {
    Write-ColorOutput "Adding REDIS_URL..." $Blue
    # Add after Redis Cache Configuration header
    if ($envContent -match "# Redis Cache Configuration") {
        $envContent = $envContent -replace "(# Redis Cache Configuration.*?REDIS_URL=)", "`$1$redisUrl"
    } else {
        # Add at the end
        $envContent += "`nREDIS_URL=$redisUrl`n"
    }
}

# Update REDIS_TLS
if ($envContent -match "REDIS_TLS=") {
    $envContent = $envContent -replace "REDIS_TLS=.*", "REDIS_TLS=$redisTls"
} else {
    $envContent += "REDIS_TLS=$redisTls`n"
}

# Save updated content
Set-Content -Path $envFile -Value $envContent -NoNewline
Write-ColorOutput "✓ Updated $envFile" $Green

# Copy to apps/api/.env if needed
if (Test-Path "apps\api") {
    Copy-Item $envFile $apiEnvFile -Force
    Write-ColorOutput "✓ Copied to $apiEnvFile" $Green
} else {
    Write-ColorOutput "⚠ apps\api directory not found, skipping copy" $Yellow
}

Write-Host ""
Write-Header "Step 4: Configuration Summary"

Write-ColorOutput "Redis Configuration:" $Bold
Write-ColorOutput "  URL: $redisUrl" $Blue
Write-ColorOutput "  TLS Enabled: $redisTls" $Blue
Write-Host ""

Write-ColorOutput "Environment Files Updated:" $Bold
Write-ColorOutput "  ✓ $envFile" $Green
if (Test-Path $apiEnvFile) {
    Write-ColorOutput "  ✓ $apiEnvFile" $Green
}

Write-Host ""
Write-Header "Step 5: Next Steps"

Write-ColorOutput "✓ Redis configuration complete!" $Green
Write-Host ""
Write-ColorOutput "To start using Redis:" $Bold
Write-Host ""
Write-ColorOutput "1. Restart your servers:" $Yellow
Write-ColorOutput "   .\START_SERVERS.ps1" $Blue
Write-Host ""
Write-ColorOutput "2. Check logs for:" $Yellow
Write-ColorOutput "   'Redis cache connected'" $Green
Write-Host ""
Write-ColorOutput "3. Monitor usage:" $Yellow
Write-ColorOutput "   Visit your Upstash dashboard" $Blue
Write-Host ""
Write-ColorOutput "4. Test performance:" $Yellow
Write-ColorOutput "   Try analyzing a resume twice - second time should be faster!" $Blue
Write-Host ""

Write-ColorOutput "📚 For detailed documentation, see:" $Bold
Write-ColorOutput "   REDIS_SETUP_GUIDE.md" $Blue
Write-Host ""

Write-ColorOutput "════════════════════════════════════════════════════════" $Green
Write-ColorOutput "  Setup Complete! Happy coding! 🚀" "$Bold$Green"
Write-ColorOutput "════════════════════════════════════════════════════════" $Green
Write-Host ""


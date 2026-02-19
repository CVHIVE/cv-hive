<#
.SYNOPSIS
    Start ngrok tunnel and update backend .env with the ngrok URL.
    
.DESCRIPTION
    1. Starts ngrok tunnel on port 3001 (frontend Vite dev server)
    2. Queries the ngrok API to get the public URL
    3. Updates backend/.env FRONTEND_URL to the ngrok URL
    4. Prints instructions for starting backend and frontend
    
.USAGE
    .\scripts\start-ngrok.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CV Hive - ngrok Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Kill any existing ngrok processes
Write-Host "[1/4] Stopping existing ngrok processes..." -ForegroundColor Yellow
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start ngrok in the background
Write-Host "[2/4] Starting ngrok tunnel on port 3001..." -ForegroundColor Yellow
Start-Process -FilePath "ngrok.cmd" -ArgumentList "http", "3001", "--host-header=localhost:3001" -WindowStyle Minimized
Start-Sleep -Seconds 5

# Get the ngrok public URL
Write-Host "[3/4] Fetching ngrok public URL..." -ForegroundColor Yellow
$maxRetries = 10
$ngrokUrl = $null

for ($i = 0; $i -lt $maxRetries; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method Get
        $tunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        if ($tunnel) {
            $ngrokUrl = $tunnel.public_url
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $ngrokUrl) {
    Write-Host "ERROR: Could not get ngrok URL. Is ngrok authenticated?" -ForegroundColor Red
    Write-Host "Run: ngrok.cmd config add-authtoken YOUR_TOKEN" -ForegroundColor Red
    exit 1
}

Write-Host "  ngrok URL: $ngrokUrl" -ForegroundColor Green

# Update backend .env with the ngrok URL
Write-Host "[4/4] Updating backend .env FRONTEND_URL..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot "..\backend\.env"
$envContent = Get-Content $envPath -Raw
$envContent = $envContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=$ngrokUrl"
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ngrok is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n  Public URL: $ngrokUrl" -ForegroundColor White
Write-Host "`n  Now start both servers:" -ForegroundColor White
Write-Host "    Terminal 1: cd backend; npx ts-node src/server.ts" -ForegroundColor Gray
Write-Host "    Terminal 2: cd frontend; npx vite" -ForegroundColor Gray
Write-Host "`n  Access your app at: $ngrokUrl" -ForegroundColor White
Write-Host "  ngrok dashboard: http://127.0.0.1:4040`n" -ForegroundColor White

# scripts/start-local.ps1
# Starts FoodieHut backend and frontend on Windows

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "             STARTING FOODIEHUT LOCALLY                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check / Start MySQL via Docker if available
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerAvailable) {
    Write-Host "`nStarting MySQL container via Docker Compose..." -ForegroundColor Yellow
    & docker compose up -d mysql
    Write-Host "Waiting for MySQL to become ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
} else {
    Write-Host "`nDocker not detected. Backend will connect to configured MySQL or embedded datasource." -ForegroundColor DarkYellow
}

# 2. Start Backend
Write-Host "`nStarting Spring Boot Backend..." -ForegroundColor Yellow
$backendDir = Join-Path $workspaceRoot "backend"
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; mvn spring-boot:run" -PassThru

# 3. Start Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
$frontendDir = Join-Path $workspaceRoot "frontend"
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; cmd.exe /c npm run dev" -PassThru

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "FoodieHut Local Services Started!" -ForegroundColor Green
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Swagger UI:  http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

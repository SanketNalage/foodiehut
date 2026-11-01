# scripts/start-kind.ps1
# Complete KIND Kubernetes deployment workflow for Windows

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$binDir = Join-Path $workspaceRoot "bin"
if ($env:PATH -notlike "*$binDir*") {
    $env:PATH = "$binDir;$env:PATH"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "        FOODIEHUT - KIND KUBERNETES DEPLOYMENT            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Docker check
Write-Host "`n[Step 1/7] Checking Docker Engine..." -ForegroundColor Yellow
$dockerInfo = docker info --format '{{.ServerVersion}}' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker Desktop is not running. Please start Docker Desktop on Windows first." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running: $dockerInfo" -ForegroundColor Green

# 2. KIND Cluster check/creation
Write-Host "`n[Step 2/7] Checking KIND cluster 'foodiehut-cluster'..." -ForegroundColor Yellow
$clusters = kind get clusters 2>&1
if ($clusters -notcontains "foodiehut-cluster") {
    Write-Host "Creating KIND cluster with extraPortMappings..." -ForegroundColor Yellow
    $kindConfig = Join-Path $workspaceRoot "k8s\kind-config.yaml"
    & kind create cluster --config $kindConfig
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create KIND cluster." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Cluster 'foodiehut-cluster' already exists." -ForegroundColor Green
}

# Ensure kubectl context
& kubectl cluster-info --context kind-foodiehut-cluster

# 3. Build Docker Images
Write-Host "`n[Step 3/7] Building Docker Images..." -ForegroundColor Yellow
Write-Host "Building foodiehut-backend:1.0.0..." -ForegroundColor DarkYellow
& docker build -t foodiehut-backend:1.0.0 (Join-Path $workspaceRoot "backend")
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Building foodiehut-frontend:1.0.0..." -ForegroundColor DarkYellow
& docker build -t foodiehut-frontend:1.0.0 (Join-Path $workspaceRoot "frontend")
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend Docker build failed." -ForegroundColor Red
    exit 1
}
Write-Host "Docker images built successfully." -ForegroundColor Green

# 4. Load Images into KIND nodes
Write-Host "`n[Step 4/7] Loading Images into KIND nodes..." -ForegroundColor Yellow
& kind load docker-image foodiehut-backend:1.0.0 --name foodiehut-cluster
& kind load docker-image foodiehut-frontend:1.0.0 --name foodiehut-cluster
Write-Host "Images loaded into KIND cluster." -ForegroundColor Green

# 5. Apply Kubernetes Manifests
Write-Host "`n[Step 5/7] Applying Kubernetes Manifests..." -ForegroundColor Yellow
& kubectl apply -f (Join-Path $workspaceRoot "k8s\namespace.yaml")
& kubectl apply -f (Join-Path $workspaceRoot "k8s\mysql\")
& kubectl apply -f (Join-Path $workspaceRoot "k8s\backend\")
& kubectl apply -f (Join-Path $workspaceRoot "k8s\frontend\")

# 6. Wait for Pod Readiness
Write-Host "`n[Step 6/7] Waiting for workloads to become Ready..." -ForegroundColor Yellow
Write-Host "Waiting for MySQL pod..."
& kubectl wait --namespace foodiehut --for=condition=ready pod --selector=app=mysql --timeout=150s

Write-Host "Waiting for Backend pod..."
& kubectl wait --namespace foodiehut --for=condition=ready pod --selector=app=backend --timeout=180s

Write-Host "Waiting for Frontend pod..."
& kubectl wait --namespace foodiehut --for=condition=ready pod --selector=app=frontend --timeout=90s

# 7. Print Status and Endpoints
Write-Host "`n[Step 7/7] Deployment Status & Service Endpoints" -ForegroundColor Cyan
& kubectl get pods -n foodiehut -o wide
& kubectl get svc -n foodiehut

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "FoodieHut Successfully Deployed to KIND Kubernetes!" -ForegroundColor Green
Write-Host "  Frontend Web UI:   http://localhost:80 (or http://localhost:30080)" -ForegroundColor Cyan
Write-Host "  Backend REST API:  http://localhost:8080 (or http://localhost:30880)" -ForegroundColor Cyan
Write-Host "  Swagger UI Docs:   http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

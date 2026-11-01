# scripts/stop-kind.ps1
# Stops and deletes the KIND cluster

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$binDir = Join-Path $workspaceRoot "bin"
if ($env:PATH -notlike "*$binDir*") {
    $env:PATH = "$binDir;$env:PATH"
}

Write-Host "Deleting KIND cluster 'foodiehut-cluster'..." -ForegroundColor Yellow
& kind delete cluster --name foodiehut-cluster
Write-Host "KIND cluster deleted." -ForegroundColor Green

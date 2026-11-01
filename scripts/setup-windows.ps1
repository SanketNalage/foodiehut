# scripts/setup-windows.ps1
# Automates Windows prerequisite verification and installation

$ErrorActionPreference = "Continue"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$binDir = Join-Path $workspaceRoot "bin"
if (!(Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
}

if ($env:PATH -notlike "*$binDir*") {
    $env:PATH = "$binDir;$env:PATH"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "        FOODIEHUT - WINDOWS PREREQUISITE SETUP            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$missingTools = @()

# 1. Java Check
Write-Host "`n[1/8] Checking Java..." -NoNewline
try {
    $javaVer = & java -version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0 -or $javaVer -match "version") {
        Write-Host " [OK]" -ForegroundColor Green
        Write-Host "      $($javaVer.Split([Environment]::NewLine)[0])" -ForegroundColor DarkGray
    } else {
        throw "Java not functional"
    }
} catch {
    Write-Host " [MISSING]" -ForegroundColor Red
    $missingTools += "Java 17/21+"
    Write-Host "      To install Java 21, run: winget install Microsoft.OpenJDK.21" -ForegroundColor Yellow
}

# 2. Maven Check
Write-Host "`n[2/8] Checking Apache Maven..." -NoNewline
try {
    $mvnVer = & mvn -version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [OK]" -ForegroundColor Green
        Write-Host "      $($mvnVer.Split([Environment]::NewLine)[0])" -ForegroundColor DarkGray
    } else {
        throw "Maven error"
    }
} catch {
    Write-Host " [MISSING]" -ForegroundColor Red
    $missingTools += "Maven"
    Write-Host "      To install Maven, run: winget install Apache.Maven" -ForegroundColor Yellow
}

# 3. Node.js Check
Write-Host "`n[3/8] Checking Node.js..." -NoNewline
try {
    $nodeVer = & node --version 2>&1
    Write-Host " [OK] ($nodeVer)" -ForegroundColor Green
} catch {
    Write-Host " [MISSING]" -ForegroundColor Red
    $missingTools += "Node.js"
    Write-Host "      To install Node.js, run: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
}

# 4. npm Check
Write-Host "`n[4/8] Checking npm..." -NoNewline
try {
    $npmVer = cmd.exe /c npm --version 2>&1
    Write-Host " [OK] ($npmVer)" -ForegroundColor Green
} catch {
    Write-Host " [MISSING]" -ForegroundColor Red
    $missingTools += "npm"
}

# 5. Git Check
Write-Host "`n[5/8] Checking Git..." -NoNewline
try {
    $gitVer = & git --version 2>&1
    Write-Host " [OK] ($gitVer)" -ForegroundColor Green
} catch {
    Write-Host " [MISSING]" -ForegroundColor Red
    $missingTools += "Git"
    Write-Host "      To install Git, run: winget install Git.Git" -ForegroundColor Yellow
}

# 6. Kubectl Check & Auto-Install
Write-Host "`n[6/8] Checking kubectl..." -NoNewline
$kubectlExe = Join-Path $binDir "kubectl.exe"
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    Write-Host " [OK]" -ForegroundColor Green
} elseif (Test-Path $kubectlExe) {
    Write-Host " [OK - in bin/]" -ForegroundColor Green
} else {
    Write-Host " [DOWNLOADING...]" -ForegroundColor Yellow
    & curl.exe -sSL "https://dl.k8s.io/release/v1.31.0/bin/windows/amd64/kubectl.exe" -o $kubectlExe
    if (Test-Path $kubectlExe) {
        Write-Host "      kubectl v1.31.0 downloaded to bin\kubectl.exe" -ForegroundColor Green
    } else {
        Write-Host "      Failed to download kubectl." -ForegroundColor Red
        $missingTools += "kubectl"
    }
}

# 7. KIND Check & Auto-Install
Write-Host "`n[7/8] Checking KIND (Kubernetes in Docker)..." -NoNewline
$kindExe = Join-Path $binDir "kind.exe"
if (Get-Command kind -ErrorAction SilentlyContinue) {
    Write-Host " [OK]" -ForegroundColor Green
} elseif (Test-Path $kindExe) {
    Write-Host " [OK - in bin/]" -ForegroundColor Green
} else {
    Write-Host " [DOWNLOADING...]" -ForegroundColor Yellow
    & curl.exe -sSL "https://github.com/kubernetes-sigs/kind/releases/download/v0.33.0/kind-windows-amd64" -o $kindExe
    if (Test-Path $kindExe) {
        Write-Host "      KIND v0.33.0 downloaded to bin\kind.exe" -ForegroundColor Green
    } else {
        Write-Host "      Failed to download KIND." -ForegroundColor Red
        $missingTools += "KIND"
    }
}

# 8. Docker Desktop Check
Write-Host "`n[8/8] Checking Docker Desktop..." -NoNewline
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerCmd) {
    $dockerInfo = & docker info --format '{{.ServerVersion}}' 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [RUNNING] (Server: $dockerInfo)" -ForegroundColor Green
    } else {
        Write-Host " [INSTALLED BUT NOT RUNNING]" -ForegroundColor Yellow
        Write-Host "      Please start Docker Desktop from Start Menu or desktop icon." -ForegroundColor Yellow
    }
} else {
    Write-Host " [MISSING]" -ForegroundColor Red
    Write-Host "      Docker Desktop requires Administrator rights to install system kernel services." -ForegroundColor Yellow
    Write-Host "      Installation command: winget install Docker.DockerDesktop" -ForegroundColor Cyan
    Write-Host "      Direct download: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -ForegroundColor Cyan
    $missingTools += "Docker Desktop"
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($missingTools.Count -eq 0) {
    Write-Host "All prerequisites verified successfully! Ready to launch." -ForegroundColor Green
} else {
    Write-Host "Notice: The following prerequisites require user installation:" -ForegroundColor Yellow
    $missingTools | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
}
Write-Host "==========================================================" -ForegroundColor Cyan

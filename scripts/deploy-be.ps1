# Deploy backend to Vercel
# Usage:
#   .\scripts\deploy-be.ps1         # preview
#   .\scripts\deploy-be.ps1 -Prod   # production

param(
    [switch]$Prod
)

$ErrorActionPreference = "Stop"
$backendDir = Join-Path $PSScriptRoot ".." "backend"

Push-Location $backendDir
try {
    if ($Prod) {
        Write-Host "Deploying backend to Vercel (production)..." -ForegroundColor Cyan
        npx vercel --prod
    } else {
        Write-Host "Deploying backend to Vercel (preview)..." -ForegroundColor Cyan
        npx vercel
    }
} finally {
    Pop-Location
}

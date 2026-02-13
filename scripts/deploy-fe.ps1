# Deploy frontend to Vercel
# Usage:
#   .\scripts\deploy-fe.ps1         # preview
#   .\scripts\deploy-fe.ps1 -Prod   # production

param(
    [switch]$Prod
)

$ErrorActionPreference = "Stop"
$frontendDir = Join-Path (Join-Path $PSScriptRoot "..") "frontend"

Push-Location $frontendDir
try {
    if ($Prod) {
        Write-Host "Deploying frontend to Vercel (production)..." -ForegroundColor Cyan
        npx vercel --prod
    } else {
        Write-Host "Deploying frontend to Vercel (preview)..." -ForegroundColor Cyan
        npx vercel
    }
} finally {
    Pop-Location
}

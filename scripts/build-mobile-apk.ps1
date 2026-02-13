# Build APK for mobile app and output to mobile/build
# Usage: .\scripts\build-mobile-apk.ps1
# Requires: Node.js, JDK 17+, Android SDK (ANDROID_HOME)

param(
    [switch]$SkipPrebuild  # Skip prebuild if android/ already exists and is up to date
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$mobileDir = Join-Path $scriptRoot ".." "mobile"
$buildDir = Join-Path $mobileDir "build"
$androidDir = Join-Path $mobileDir "android"

# Read version from app.json for output filename
$appJsonPath = Join-Path $mobileDir "app.json"
$appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
$version = $appJson.expo.version
$appName = $appJson.expo.name -replace '\s+', ''

Write-Host "Building APK for $appName v$version..." -ForegroundColor Cyan
Write-Host "Output folder: $buildDir" -ForegroundColor Gray

# Create build output folder
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
    Write-Host "Created folder: build/" -ForegroundColor Gray
}

Push-Location $mobileDir
try {
    # 1. Generate native Android project if needed
    if (-not $SkipPrebuild -or -not (Test-Path $androidDir)) {
        Write-Host "`n[1/3] Running expo prebuild (Android)..." -ForegroundColor Yellow
        npx expo prebuild --platform android --clean
        if ($LASTEXITCODE -ne 0) { throw "expo prebuild failed" }
    } else {
        Write-Host "`n[1/3] Skipping prebuild (use without -SkipPrebuild to regenerate android/)." -ForegroundColor Yellow
    }

    # 2. Build release APK with Gradle
    Write-Host "`n[2/3] Building release APK with Gradle..." -ForegroundColor Yellow
    Push-Location $androidDir
    try {
        if ($IsWindows -or $env:OS -match "Windows") {
            .\gradlew.bat assembleRelease
        } else {
            ./gradlew assembleRelease
        }
        if ($LASTEXITCODE -ne 0) { throw "Gradle build failed" }
    } finally {
        Pop-Location
    }

    # 3. Copy APK to mobile/build with a clear name
    $apkSource = Join-Path $androidDir (Join-Path "app" "build" "outputs" "apk" "release" "app-release.apk")
    $apkDest = Join-Path $buildDir "${appName}-${version}.apk"

    if (-not (Test-Path $apkSource)) {
        throw "APK not found at: $apkSource"
    }

    Copy-Item -Path $apkSource -Destination $apkDest -Force
    Write-Host "`n[3/3] APK copied to build/" -ForegroundColor Yellow

    $fullPath = (Resolve-Path $apkDest).Path
    Write-Host "`nDone. APK: mobile\build\$($appName)-${version}.apk" -ForegroundColor Green
    Write-Host "Full path: $fullPath" -ForegroundColor Gray
} finally {
    Pop-Location
}

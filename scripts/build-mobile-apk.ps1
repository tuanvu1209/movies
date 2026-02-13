# Build APK for mobile app and output to mobile/build
# Usage: .\scripts\build-mobile-apk.ps1
# Requires: Node.js, JDK 17+, Android SDK (ANDROID_HOME)
#
# On Windows, if you see "Filename longer than 260 characters" (CMake/Ninja),
# this script uses a subst drive (W:) to shorten paths. Alternatively enable
# long paths: Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1

param(
    [switch]$SkipPrebuild,  # Skip prebuild if android/ already exists and is up to date
    [switch]$NoSubst        # Do not use subst drive (avoids "different roots" in Gradle/codegen; may hit 260-char path limit)
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..")).Path
$mobileDir = Join-Path $repoRoot "mobile"
$buildDir = Join-Path $mobileDir "build"
$androidDir = Join-Path $mobileDir "android"
$apkDest = $null   # set below after $appName, $version

# On Windows, use a subst drive to avoid CMake/Ninja "path > 260 chars" errors
# (full build paths like .cxx\...\node_modules\react-native-safe-area-context\... exceed 260 chars)
$substDrive = $null
$isWindows = $IsWindows -or $env:OS -match "Windows"
if ($isWindows -and -not $NoSubst) {
    $usedDrives = Get-PSDrive -PSProvider FileSystem | ForEach-Object { $_.Name }
    foreach ($driveLetter in @("W", "X", "Y")) {
        if ($usedDrives -notcontains $driveLetter) {
            subst "${driveLetter}:" $repoRoot
            $substDrive = "${driveLetter}:"
            $mobileDir = "${driveLetter}:\mobile"
            $buildDir = "${driveLetter}:\mobile\build"
            $androidDir = "${driveLetter}:\mobile\android"
            Write-Host "Using $substDrive\ to shorten paths (avoids 260-char limit)." -ForegroundColor Gray
            break
        }
    }
    if (-not $substDrive) {
        Write-Host "Warning: Could not create subst (W:, X:, Y: in use). Build may fail with path > 260 chars." -ForegroundColor Yellow
    }
}

# Read version from app.json for output filename
$appJsonPath = Join-Path $mobileDir "app.json"
$appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
$version = $appJson.expo.version
$appName = $appJson.expo.name -replace '\s+', ''
$apkDest = Join-Path $buildDir "$appName-$version.apk"

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

    # Copy APK from Gradle output to mobile/build with friendly name
    $gradleApk = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path $gradleApk)) { throw "Gradle did not produce APK at expected path" }
    Copy-Item -Path $gradleApk -Destination $apkDest -Force
    Write-Host "`n[3/3] Copied APK to build folder." -ForegroundColor Yellow

    $apkDisplayPath = if ($substDrive) { Join-Path $repoRoot "mobile\build\$appName-$version.apk" } else { (Resolve-Path $apkDest).Path }
    Write-Host "`nDone. APK: mobile\build\$($appName)-${version}.apk" -ForegroundColor Green
    Write-Host "Full path: $apkDisplayPath" -ForegroundColor Gray
} finally {
    Pop-Location
    if ($substDrive) {
        subst $substDrive /D
        Write-Host "Removed subst $substDrive" -ForegroundColor Gray
    }
}

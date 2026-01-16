#!/usr/bin/env pwsh

Write-Host "🔧 Fixing ExpoDocumentPicker Module Error..." -ForegroundColor Cyan

# Navigate to app directory
Set-Location "app"

Write-Host "1. Stopping Metro bundler..." -ForegroundColor Yellow
# Kill any existing Metro processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "2. Fixing expo-document-picker dependency..." -ForegroundColor Yellow

# Remove the problematic package
Write-Host "   - Removing expo-document-picker" -ForegroundColor Gray
npm uninstall expo-document-picker

# Clear cache
Write-Host "   - Clearing npm cache" -ForegroundColor Gray
npm cache clean --force

# Reinstall with correct version for Expo SDK 54
Write-Host "   - Installing compatible version" -ForegroundColor Gray
npx expo install expo-document-picker

Write-Host "3. Clearing Metro cache..." -ForegroundColor Yellow
npx expo start --clear --reset-cache

Write-Host "✅ ExpoDocumentPicker should now be working!" -ForegroundColor Green
Write-Host "📱 Try scanning the QR code again" -ForegroundColor Cyan
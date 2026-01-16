#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Auto WiFi IP Configuration Updater for Mobile App

.DESCRIPTION
    This script automatically detects your current WiFi IP address and updates
    the mobile app's env.js configuration file accordingly.

.PARAMETER Port
    The backend port number (default: 5001)

.PARAMETER Watch
    Run in watch mode to continuously monitor for IP changes

.EXAMPLE
    .\update-wifi-ip.ps1
    Update once with default port

.EXAMPLE
    .\update-wifi-ip.ps1 -Port 5001
    Update once with specific port

.EXAMPLE
    .\update-wifi-ip.ps1 -Watch
    Run in watch mode

.EXAMPLE
    .\update-wifi-ip.ps1 -Watch -Port 5001
    Run in watch mode with specific port
#>

param(
    [int]$Port = 5001,
    [switch]$Watch,
    [switch]$Help
)

# Colors for output
$Colors = @{
    Reset = "`e[0m"
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
    Cyan = "`e[36m"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "Reset"
    )
    Write-Host "$($Colors[$Color])$Message$($Colors.Reset)"
}

function Show-Help {
    Write-Host @"

Auto WiFi IP Configuration Updater
==================================

This script automatically detects your WiFi IP and updates your mobile app configuration.

Usage:
    .\update-wifi-ip.ps1 [-Port <port>] [-Watch] [-Help]

Parameters:
    -Port <number>    Backend port number (default: 5001)
    -Watch           Run in watch mode (continuously monitor)
    -Help            Show this help message

Examples:
    .\update-wifi-ip.ps1                    # Update once
    .\update-wifi-ip.ps1 -Port 5001        # Update with specific port
    .\update-wifi-ip.ps1 -Watch            # Watch mode
    .\update-wifi-ip.ps1 -Watch -Port 5001 # Watch mode with port

"@
}

if ($Help) {
    Show-Help
    exit 0
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
    Write-ColorOutput "✅ Node.js detected: $nodeVersion" "Green"
} catch {
    Write-ColorOutput "❌ Node.js is not installed or not in PATH" "Red"
    Write-ColorOutput "Please install Node.js first" "Yellow"
    exit 1
}

# Prepare arguments for the Node.js script
$nodeArgs = @()
if ($Watch) {
    $nodeArgs += "--watch"
}
$nodeArgs += $Port.ToString()

Write-ColorOutput "`n🔍 Auto WiFi IP Detection Starting..." "Cyan"
Write-ColorOutput "======================================" "Cyan"

if ($Watch) {
    Write-ColorOutput "👀 Running in watch mode (Press Ctrl+C to stop)" "Magenta"
} else {
    Write-ColorOutput "🔄 Running single update" "Blue"
}

Write-ColorOutput "🔌 Using port: $Port" "Blue"
Write-Host ""

# Run the Node.js script
try {
    & node "auto-update-wifi-ip.js" @nodeArgs
    
    if (-not $Watch) {
        Write-ColorOutput "`n======================================" "Green"
        Write-ColorOutput "   Update Complete" "Green"
        Write-ColorOutput "======================================" "Green"
        Write-Host ""
        Write-ColorOutput "💡 Next steps:" "Yellow"
        Write-ColorOutput "   1. Restart your mobile app (Expo)" "White"
        Write-ColorOutput "   2. Make sure your backend is running" "White"
        Write-ColorOutput "   3. Test the connection" "White"
        Write-Host ""
    }
} catch {
    Write-ColorOutput "❌ Script execution failed: $($_.Exception.Message)" "Red"
    exit 1
}
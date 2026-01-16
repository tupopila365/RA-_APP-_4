# Metro Bundler Error Fix Guide

## Error Description
```
com.facebook.react.common.DebugServerException: The development server returned response error code: 500
URL: http://192.168.11.52:8081/node_modules/expo/AppEntry.bundle
```

This error occurs when the Metro bundler (React Native's JavaScript bundler) encounters issues resolving modules.

## Quick Fix (Try This First)

### Option 1: Clear Metro Cache
```bash
cd app
npx expo start --clear
```

Or simply run:
```bash
quick-metro-fix.bat
```

### Option 2: Restart with Reset Cache
```bash
cd app
npx expo start --reset-cache
```

## Complete Fix (If Quick Fix Doesn't Work)

Run the automated script:
```powershell
.\fix-metro-bundler.ps1
```

Or manually:

### Step 1: Stop All Metro Processes
```powershell
# Kill any running Metro/Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Clear All Caches
```bash
cd app

# Clear Metro cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Clear watchman cache (if installed)
watchman watch-del-all
```

### Step 3: Clean Install
```bash
# Remove node_modules and lock file
rm -rf node_modules
rm package-lock.json

# Reinstall dependencies
npm install
```

### Step 4: Start Fresh
```bash
npx expo start --clear --reset-cache
```

## Common Causes & Solutions

### 1. Corrupted Metro Cache
**Solution:** Clear cache with `npx expo start --clear`

### 2. Network Issues
**Problem:** Phone can't reach development server at `192.168.11.52:8081`

**Solutions:**
- Ensure phone and computer are on the same WiFi network
- Check firewall isn't blocking port 8081
- Try using tunnel mode: `npx expo start --tunnel`
- Update IP address in app config if WiFi changed

### 3. Outdated Dependencies
**Solution:** Update Expo and dependencies
```bash
cd app
npx expo install --fix
```

### 4. Port Conflicts
**Problem:** Port 8081 is already in use

**Solution:**
```bash
# Kill process on port 8081
npx kill-port 8081

# Or start on different port
npx expo start --port 8082
```

### 5. Node Modules Corruption
**Solution:** Complete reinstall (see Step 3 above)

## Development Server Connection Methods

### Method 1: LAN (Default - Fastest)
```bash
npx expo start
```
- Requires same WiFi network
- Fastest performance
- Current IP: `192.168.11.52`

### Method 2: Tunnel (Most Reliable)
```bash
npx expo start --tunnel
```
- Works across different networks
- Slower but more reliable
- Uses ngrok tunneling

### Method 3: USB Connection
```bash
# Setup ADB port forwarding
adb reverse tcp:8081 tcp:8081

# Start Expo
npx expo start
```

## Verify Setup

### Check Metro Bundler Status
```bash
curl http://localhost:8081/status
```

Should return: `packager-status:running`

### Check Network Connectivity
```bash
# From your phone's browser, visit:
http://192.168.11.52:8081
```

Should show Metro bundler status page.

## Alternative: Use Development Build

If Expo Go continues having issues, create a development build:

```bash
cd app

# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

This creates a custom native build with all required modules.

## Prevention Tips

1. **Always use `--clear` flag** when restarting after errors
2. **Keep dependencies updated**: `npx expo install --fix`
3. **Use stable WiFi connection** for development
4. **Close Metro bundler properly** (Ctrl+C) before restarting
5. **Avoid switching networks** during development

## Still Having Issues?

### Check Logs
```bash
# View Metro bundler logs
npx expo start --verbose

# View device logs (Android)
adb logcat | grep ReactNative

# View device logs (iOS)
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"'
```

### Test Backend Connection
```bash
node test-backend-connection.js
```

### Verify Environment
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check Expo CLI version
npx expo --version
```

## Emergency: Complete Reset

If nothing works, nuclear option:

```powershell
cd app

# Remove everything
Remove-Item -Recurse -Force node_modules, .expo, .expo-shared, package-lock.json

# Clear all caches
npm cache clean --force
npx expo start --clear

# Reinstall
npm install

# Start fresh
npx expo start --clear --reset-cache --tunnel
```

## Quick Reference Commands

| Issue | Command |
|-------|---------|
| Clear cache | `npx expo start --clear` |
| Reset cache | `npx expo start --reset-cache` |
| Use tunnel | `npx expo start --tunnel` |
| Kill port 8081 | `npx kill-port 8081` |
| Clean install | `rm -rf node_modules && npm install` |
| Fix dependencies | `npx expo install --fix` |
| Verbose logs | `npx expo start --verbose` |

## Success Indicators

✅ Metro bundler shows: `Metro waiting on exp://192.168.11.52:8081`
✅ QR code displays in terminal
✅ No red error messages in terminal
✅ Phone can scan QR code and load app
✅ App loads without "Unable to resolve module" errors

---

**Last Updated:** January 2026
**Expo SDK:** 54.0.31
**React Native:** 0.81.5

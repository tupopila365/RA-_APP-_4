# Metro Cache Fix for StatusBar Error

## Issue
Despite adding the correct StatusBar import, the error persists due to Metro bundler cache not picking up the changes.

## Solution
The StatusBar import has been correctly added to ProcurementAwardsScreen.js:
```javascript
import { StatusBar } from 'expo-status-bar';
```

## Required Steps to Fix
1. **Clear Metro Cache**: Run one of these commands:
   ```bash
   npx expo start --clear
   # OR
   npx react-native start --reset-cache
   # OR
   npm start -- --reset-cache
   ```

2. **If the above doesn't work, try a full clean**:
   ```bash
   # Stop the current development server
   # Then run:
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

3. **Alternative approach** - Restart the development server:
   - Stop the current Expo/Metro server (Ctrl+C)
   - Run `npx expo start --clear`

## Why This Happens
- Metro bundler caches compiled JavaScript modules
- When imports are added/changed, the cache might not invalidate properly
- The `--clear` flag forces Metro to rebuild the bundle from scratch

## Verification
After clearing the cache, the ProcurementAwardsScreen should load without the StatusBar reference error.

## Files Confirmed Correct
- ✅ `app/screens/ProcurementAwardsScreen.js` - Has correct StatusBar import
- ✅ `app/screens/OpeningRegisterScreen.js` - Already had correct StatusBar import

The code is correct; this is purely a caching issue that requires clearing the Metro bundler cache.
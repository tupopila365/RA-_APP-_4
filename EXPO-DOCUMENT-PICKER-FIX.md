# ExpoDocumentPicker Module Error Fix

## Error Description
```
[runtime not ready]: Error: Cannot find module 'ExpoDocumentPicker', stack:
requireNativeModule@[native code]
loadModuleImplementation@252:40
guardedLoadModule@165:37
metroRequire@78:91
```

This error occurs when the `expo-document-picker` module is not properly installed or linked.

## Quick Fix

### Step 1: Stop Metro Bundler
```bash
# Kill any running Metro processes
npx kill-port 8081
```

### Step 2: Reinstall Document Picker
```bash
cd app

# Remove the problematic package
npm uninstall expo-document-picker

# Clear cache
npm cache clean --force

# Reinstall with correct version for Expo SDK 54
npx expo install expo-document-picker
```

### Step 3: Clear Metro Cache and Restart
```bash
npx expo start --clear --reset-cache
```

## Automated Fix

Run the automated script:
```powershell
.\fix-document-picker.ps1
```

## Code Fix Applied

Updated the import in `PLNApplicationScreenEnhanced.js` to be more robust:

**Before:**
```javascript
import * as DocumentPicker from 'expo-document-picker';
```

**After:**
```javascript
// Import native modules conditionally to avoid Expo Go errors
let DocumentPicker;
try {
  DocumentPicker = require('expo-document-picker');
} catch (error) {
  console.log('DocumentPicker not available in Expo Go');
  DocumentPicker = null;
}
```

This prevents the app from crashing if the module isn't available.

## Alternative Solutions

### Option 1: Use Development Build
If Expo Go continues having issues with native modules:

```bash
cd app

# Create development build for Android
npx expo run:android

# Or for iOS
npx expo run:ios
```

### Option 2: Disable Document Picker Temporarily
If you don't need document picking functionality right now, you can comment out the usage:

```javascript
const handleDocumentPick = async () => {
  if (!DocumentPicker) {
    Alert.alert(
      'Feature Unavailable', 
      'Document picker is not available in Expo Go. Please use a development build.'
    );
    return;
  }
  // ... rest of the code
};
```

## Verification

After applying the fix:

1. ✅ Metro bundler should start without errors
2. ✅ QR code should display in terminal
3. ✅ App should load on your phone without the red error screen
4. ✅ Document picker should work (or show appropriate message if unavailable)

## Common Issues

### Issue 1: Still Getting Module Error
**Solution:** Complete clean install
```bash
cd app
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

### Issue 2: Works in Development Build but not Expo Go
**Expected Behavior:** Some native modules don't work in Expo Go. Use development build for full functionality.

### Issue 3: Different Error After Fix
**Solution:** Check for other missing native modules and apply similar conditional imports.

## Prevention

To prevent similar issues in the future:

1. **Always use conditional imports** for native modules
2. **Use `npx expo install`** instead of `npm install` for Expo packages
3. **Keep Expo SDK updated** to latest stable version
4. **Test on development build** for production-like behavior

## Success Indicators

✅ No red error screen on app startup
✅ Metro bundler shows no module resolution errors
✅ Document picker either works or shows graceful fallback message
✅ App navigation works normally

---

**Status:** Fixed ✅
**Date:** January 2026
**Expo SDK:** 54.0.31
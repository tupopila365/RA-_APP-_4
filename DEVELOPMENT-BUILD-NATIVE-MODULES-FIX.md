# Development Build Native Modules Fix

## Issue Description
You're running a development build but getting "Document picker not available" message, even though the module should work in development builds.

## Root Cause
When you add new native modules (like `expo-document-picker`) to your app.json plugins, you need to rebuild the development build to include the native code.

## Quick Fix

### Option 1: Rebuild Development Build (Recommended)
```bash
cd app

# Clear cache
npx expo start --clear

# Rebuild development build with new native modules
npx expo run:android
```

Or run the automated script:
```bash
.\quick-dev-build-fix.bat
```

### Option 2: Complete Rebuild (If Option 1 Doesn't Work)
```bash
cd app

# Clean prebuild
npx expo prebuild --clean

# Rebuild for Android
npx expo run:android

# Or for iOS
npx expo run:ios
```

## Why This Happens

### Development Build vs Expo Go
- **Expo Go**: Limited to Expo SDK modules only, many native modules don't work
- **Development Build**: Custom native build that includes all your native modules

### When You Need to Rebuild
You need to rebuild your development build when you:
1. ✅ Add new native modules to dependencies
2. ✅ Add new plugins to app.json
3. ✅ Change native configuration (permissions, etc.)
4. ✅ Update Expo SDK version

### What Doesn't Require Rebuild
You DON'T need to rebuild for:
- ❌ JavaScript code changes
- ❌ Styling changes
- ❌ Adding pure JS packages
- ❌ Configuration changes that don't affect native code

## Verification Steps

### 1. Check if You're Actually Using Development Build
Look for these indicators:
- App icon shows your custom icon (not Expo Go icon)
- App name shows "Roads Authority Namibia" (not "Expo Go")
- You built it with `npx expo run:android` or `npx expo run:ios`

### 2. Check Native Module Loading
The app now logs DocumentPicker debug info. Check the console for:
```javascript
DocumentPicker debug: {
  DocumentPicker: true,
  getDocumentAsync: true,
  type: "object",
  keys: ["getDocumentAsync", "DocumentPickerOptions", ...]
}
```

### 3. Test Document Picker
Try to use the document picker feature. It should either:
- ✅ Work properly and open file picker
- ❌ Show specific error about rebuilding needed

## Fixed Files

Updated these files to use proper imports:
- `app/screens/PLNApplicationScreenEnhanced.js`
- `app/screens/PLNApplicationWizard.js`

**Before (problematic):**
```javascript
let DocumentPicker = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (error) {
  console.warn('Native modules not available:', error.message);
}
```

**After (correct):**
```javascript
import * as DocumentPicker from 'expo-document-picker';
```

## Troubleshooting

### Issue 1: Still Getting "Not Available" Message
**Solution:** You need to rebuild the development build
```bash
cd app
npx expo run:android
```

### Issue 2: Build Fails
**Solution:** Clean and rebuild
```bash
cd app
npx expo prebuild --clean
npx expo run:android
```

### Issue 3: "Module Not Found" Error
**Solution:** Reinstall the module and rebuild
```bash
cd app
npm uninstall expo-document-picker
npx expo install expo-document-picker
npx expo run:android
```

### Issue 4: Works on One Device, Not Another
**Solution:** Install the new build on all test devices
```bash
# The APK is generated in: app/android/app/build/outputs/apk/debug/
# Install it on your device manually or via ADB
```

## Prevention Tips

1. **Always rebuild after adding native modules**
2. **Use `npx expo install` instead of `npm install` for Expo packages**
3. **Test on development build, not Expo Go, for native features**
4. **Keep a list of when you last rebuilt** to track if rebuild is needed

## Build Commands Reference

| Command | Purpose |
|---------|---------|
| `npx expo run:android` | Build and install development build for Android |
| `npx expo run:ios` | Build and install development build for iOS |
| `npx expo prebuild` | Generate native directories |
| `npx expo prebuild --clean` | Clean and regenerate native directories |
| `npx expo start --clear` | Start Metro with cleared cache |

## Success Indicators

After rebuilding, you should see:
- ✅ Document picker works without error messages
- ✅ Console shows proper DocumentPicker debug info
- ✅ File picker opens when you tap document upload buttons
- ✅ No "not available" or "rebuild needed" messages

## Time Expectations

- **First build**: 5-15 minutes (downloads dependencies)
- **Subsequent builds**: 2-5 minutes (uses cache)
- **Clean builds**: 10-20 minutes (rebuilds everything)

---

**Status:** Ready to rebuild ⚠️
**Next Step:** Run `npx expo run:android` to rebuild with native modules
**Date:** January 2026
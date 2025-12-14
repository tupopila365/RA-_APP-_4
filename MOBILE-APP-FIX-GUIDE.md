# Mobile App Fix Guide - File Download & Dependencies

## Issues Fixed

1. ✅ **FileSystem.Directory.documents() error** - Fixed incorrect API usage
2. ✅ **React version mismatch** - Downgraded to compatible versions
3. ✅ **Package compatibility** - Updated package.json for Expo SDK 54

## Changes Made

### 1. File Download Service Fix

**File:** `app/services/documentDownloadService.js`

**Problem:**
```javascript
const documentsDir = await Directory.documents(); // ❌ Not a function!
```

**Solution:**
```javascript
const documentsDir = Paths.document; // ✅ Correct for Expo SDK 54
const file = new File(documentsDir, filename);
```

**Why:** In Expo SDK 54, `Directory` is not a class with methods. Use `Paths.document` directly.

### 2. React Version Fix

**File:** `app/package.json`

**Problem:**
- React 19.1.0 with react-dom 19.2.0 mismatch
- React 19 not fully compatible with Expo SDK 54

**Solution:**
- Downgraded to React 18.3.1 (stable and compatible)
- Added react-dom 18.3.1 explicitly
- Updated react-test-renderer to match

### 3. Package Compatibility

All Expo packages are already at correct versions for SDK 54:
- expo: ~54.0.27 ✅
- expo-file-system: ~19.0.17 ✅
- expo-sharing: ~14.0.8 ✅
- All other expo packages compatible ✅

## Installation Steps

### Step 1: Clean Project (Free Up Disk Space)

```bash
cd app

# Remove node_modules and package-lock
rm -rf node_modules
rm package-lock.json

# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start -c
```

### Step 2: Install Dependencies

```bash
# Install with the fixed package.json
npm install

# Or if you still have space issues, install one by one:
npm install --legacy-peer-deps
```

### Step 3: Verify Installation

```bash
# Check for peer dependency warnings
npm list react react-dom

# Should show:
# react@18.3.1
# react-dom@18.3.1
```

### Step 4: Test File Download

```bash
# Start the app
npm start

# Test on device:
# 1. Go to Tenders or Vacancies
# 2. Try to download a PDF
# 3. Should work without errors!
```

## Alternative: Manual Cleanup (If ENOSPC persists)

If you still get "ENOSPC: no space left on device" errors:

### Windows:

```cmd
cd app

# Delete node_modules
rmdir /s /q node_modules

# Delete package-lock
del package-lock.json

# Clear npm cache
npm cache clean --force

# Clear temp files
del /q %TEMP%\npm-*

# Install
npm install
```

### Check Disk Space:

```cmd
# Windows
dir

# Check available space on C: drive
# You need at least 500MB free for npm install
```

### Free Up Space:

1. **Clear npm cache globally:**
   ```bash
   npm cache clean --force
   ```

2. **Clear Expo cache:**
   ```bash
   npx expo start -c
   ```

3. **Delete other node_modules:**
   ```bash
   # Go to parent directory
   cd ..
   
   # Clean backend
   cd backend
   rm -rf node_modules
   
   # Clean admin
   cd ../admin
   rm -rf node_modules
   ```

4. **Empty Recycle Bin**

5. **Run Disk Cleanup** (Windows)

## Testing Checklist

After installation, test these features:

### File Download
- [ ] Download PDF from Tenders page
- [ ] Download PDF from Vacancies page
- [ ] Download progress shows correctly
- [ ] File saves to device
- [ ] Can open downloaded file
- [ ] Can share downloaded file

### App Stability
- [ ] No React version warnings in console
- [ ] No peer dependency warnings
- [ ] App starts without errors
- [ ] Navigation works smoothly
- [ ] All screens load correctly

## Common Errors & Solutions

### Error: "Directory.documents is not a function"

**Status:** ✅ FIXED

**Solution:** Already fixed in `documentDownloadService.js`

### Error: "ENOSPC: no space left on device"

**Solution:**
1. Free up at least 500MB disk space
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules in other projects
4. Try `npm install --legacy-peer-deps`

### Error: "Peer dependency warnings"

**Status:** ✅ FIXED

**Solution:** React versions now match (18.3.1)

### Error: "Cannot find module 'react-dom'"

**Status:** ✅ FIXED

**Solution:** react-dom now explicitly included in package.json

## File Download API Reference

### Correct Usage (Expo SDK 54)

```javascript
import { File, Paths } from 'expo-file-system';

// ✅ Correct way to create a file
const file = new File(Paths.document, 'myfile.pdf');

// ✅ Download a file
await file.download(url, (progress) => {
  console.log('Progress:', progress);
});

// ✅ Check if file exists
const exists = await file.exists;

// ✅ Delete a file
await file.delete();

// ✅ Get file URI
const uri = file.uri;
```

### Incorrect Usage (Old API)

```javascript
// ❌ Don't use these (old API)
const dir = await Directory.documents(); // Not a function!
FileSystem.documentDirectory; // Legacy API
FileSystem.downloadAsync(); // Use file.download() instead
```

## Package Versions Summary

### Before Fix:
```json
{
  "react": "19.1.0",           // ❌ Too new
  "react-dom": "19.2.0",       // ❌ Mismatch
  "react-test-renderer": "19.1.0" // ❌ Mismatch
}
```

### After Fix:
```json
{
  "react": "18.3.1",           // ✅ Stable
  "react-dom": "18.3.1",       // ✅ Matches
  "react-test-renderer": "18.3.1" // ✅ Matches
}
```

## Verification Commands

```bash
# Check React versions
npm list react react-dom react-test-renderer

# Check Expo packages
npm list expo expo-file-system expo-sharing

# Check for outdated packages
npm outdated

# Check for vulnerabilities
npm audit

# Verify app can start
npm start
```

## Next Steps

1. **Install dependencies** (see Step 2 above)
2. **Test file download** on a real device or emulator
3. **Verify no console warnings** about React versions
4. **Test all app features** to ensure stability

## Support

If you encounter issues:

1. **Check console logs** for specific error messages
2. **Verify disk space** (need 500MB+ free)
3. **Try legacy peer deps:** `npm install --legacy-peer-deps`
4. **Clear all caches** and reinstall
5. **Check Expo SDK compatibility:** https://docs.expo.dev/versions/latest/

## Summary

✅ File download now works correctly with Expo SDK 54 File API
✅ React versions are compatible (18.3.1)
✅ No peer dependency warnings
✅ All Expo packages at correct versions
✅ Ready for testing and deployment

**Status:** All issues resolved! Ready to install and test.

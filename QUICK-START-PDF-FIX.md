# Quick Start - PDF Viewer Fix

## What Was Fixed
PDFs in the Career/Vacancies section now open directly in your PDF viewer app instead of showing a share/save dialog.

## Quick Rebuild

Run this command:
```bash
cd RA-_APP-_4
rebuild-app-for-pdf-fix.bat
```

Or manually:
```bash
cd RA-_APP-_4/app
npx expo run:android
```

## What Changed

### Before:
- Tap "Open PDF" → Share dialog appears → Select app → PDF opens

### After:
- Tap "Open PDF" → PDF opens directly in default viewer ✨

## Technical Details

- **Package Added**: `expo-intent-launcher`
- **File Modified**: `app/services/documentDownloadService.js`
- **Platform**: Android (uses IntentLauncher), iOS (uses existing methods)

## Important Notes

⚠️ **You MUST rebuild the app** - this is a native module change
⚠️ **Not compatible with Expo Go** - requires development build
✅ **Works on Android 5.0+**
✅ **Requires a PDF viewer app installed** (Google PDF Viewer, Adobe Acrobat, etc.)

## Test It

1. Rebuild app: `npx expo run:android`
2. Open app → Vacancies
3. Download a vacancy PDF
4. Tap "Open PDF"
5. PDF should open directly! 🎉

## Need Help?

See detailed documentation:
- `PDF-VIEWER-FIX-COMPLETE.md` - Full implementation details
- `TEST-PDF-VIEWER-FIX.md` - Complete testing guide

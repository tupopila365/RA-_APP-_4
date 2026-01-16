# Testing PDF Viewer Fix

## Quick Test Guide

### Prerequisites
1. Android device or emulator with a PDF viewer app installed (e.g., Google PDF Viewer, Adobe Acrobat)
2. App rebuilt with the new native module

### Rebuild the App

**Option 1: Use the batch script**
```bash
rebuild-app-for-pdf-fix.bat
```

**Option 2: Manual rebuild**
```bash
cd app
npx expo run:android
```

### Test Steps

1. **Launch the app** on your Android device

2. **Navigate to Vacancies**:
   - From Home screen → Tap "Vacancies" or "Career"

3. **Select a vacancy with PDF**:
   - Look for vacancies that show a download button
   - Tap on a vacancy card to expand details

4. **Download the PDF**:
   - Tap "Download Application Form" button
   - Wait for download to complete
   - You should see "Download Complete" alert

5. **Open the PDF**:
   - Tap "Open PDF" button in the alert
   - **Expected**: PDF opens directly in your default PDF viewer
   - **Previous behavior**: Share/save dialog appeared

### Expected Results

✅ **Success Indicators:**
- PDF opens immediately in default viewer app
- No share dialog appears
- PDF displays correctly
- Can navigate, zoom, and read the PDF

❌ **If you see share dialog:**
- App needs to be rebuilt (native module not loaded)
- Run: `cd app && npx expo run:android`

### Error Scenarios to Test

1. **No PDF viewer installed**:
   - Uninstall all PDF viewers
   - Try to open PDF
   - Should show: "No PDF viewer app found. Please install a PDF reader app from the Play Store."

2. **Invalid PDF URL**:
   - Should show appropriate error message
   - App should not crash

3. **Network failure during download**:
   - Turn off WiFi/data during download
   - Should show network error message

### Fallback Test (iOS or if IntentLauncher fails)

The app includes fallback mechanisms:
1. First tries IntentLauncher (Android)
2. Falls back to Sharing dialog if IntentLauncher fails
3. On iOS, uses Linking → WebBrowser → Sharing

### Verification Checklist

- [ ] App rebuilt with `expo run:android`
- [ ] PDF downloads successfully
- [ ] "Open PDF" button works
- [ ] PDF opens in default viewer (not share dialog)
- [ ] Can read and navigate the PDF
- [ ] "Share" button still works separately
- [ ] Error messages display correctly
- [ ] No app crashes

### Troubleshooting

**Problem**: Still seeing share dialog
**Solution**: Rebuild the app - native module needs to be compiled
```bash
cd app
npx expo prebuild --clean
npx expo run:android
```

**Problem**: "No Activity found" error
**Solution**: Install a PDF viewer app from Play Store (Google PDF Viewer recommended)

**Problem**: App won't build
**Solution**: 
```bash
cd app
rm -rf android ios node_modules
npm install
npx expo prebuild
npx expo run:android
```

### Additional Testing

Test with different vacancy PDFs:
- Small PDFs (< 1MB)
- Large PDFs (> 5MB)
- PDFs with images
- Text-only PDFs

Test on different Android versions:
- Android 10+
- Android 11+
- Android 12+

### Success Criteria

The fix is successful when:
1. PDFs open directly in viewer app on Android
2. No share dialog appears (unless IntentLauncher fails)
3. User experience is smooth and intuitive
4. Error handling works correctly
5. Fallback mechanisms work on iOS

## Notes

- This fix is Android-specific using `expo-intent-launcher`
- iOS continues to use existing methods (Linking, WebBrowser, Sharing)
- The share functionality remains available as a separate option
- Requires development build (not compatible with Expo Go)

# How to Refresh Mobile App to See Changes

## The Issue
You've made changes to the code, but the mobile app is still showing the old design. This is because React Native caches components and needs to be refreshed.

---

## Quick Solutions (Try in Order)

### Solution 1: Reload in Expo Go (Fastest)
**If using Expo Go app:**

1. **Shake your device** (or press Ctrl+M on Android emulator / Cmd+D on iOS simulator)
2. Tap **"Reload"** from the menu
3. Changes should appear immediately

**Keyboard Shortcuts:**
- **Android Emulator**: Press `R` twice quickly (RR)
- **iOS Simulator**: Press `Cmd + R`
- **Expo Go**: Shake device → Reload

---

### Solution 2: Clear Metro Bundler Cache
**If reload doesn't work:**

```bash
# Stop the current Metro bundler (Ctrl+C)

# Clear cache and restart
cd app
npm start -- --clear

# Or use Expo CLI
npx expo start -c
```

**What this does:**
- Clears the Metro bundler cache
- Forces a fresh build of all components
- Reloads all JavaScript files

---

### Solution 3: Restart Expo Development Server

```bash
# Stop current server (Ctrl+C)

# Navigate to app folder
cd app

# Start fresh
npm start

# Or with Expo
npx expo start
```

Then:
1. Scan QR code again with Expo Go
2. App will reload with new changes

---

### Solution 4: Clear React Native Cache (Nuclear Option)

```bash
# Stop all running processes

# Navigate to app folder
cd app

# Clear all caches
npm start -- --reset-cache

# Or manually clear
rm -rf node_modules/.cache
rm -rf .expo

# Restart
npm start
```

---

## Step-by-Step: Recommended Approach

### For Expo Go Users

1. **Stop the current Metro bundler**
   ```bash
   # Press Ctrl+C in the terminal running npm start
   ```

2. **Clear cache and restart**
   ```bash
   cd app
   npx expo start -c
   ```

3. **Wait for bundler to start**
   - You'll see "Metro waiting on..."
   - QR code will appear

4. **Reload on device**
   - Shake device
   - Tap "Reload"
   - Or scan QR code again

5. **Verify changes**
   - Go to Track PLN Application
   - Track an application
   - You should see the new progress bar!

---

### For Development Build Users

1. **Stop the app completely**
   - Close the app on your device
   - Stop Metro bundler (Ctrl+C)

2. **Clear cache**
   ```bash
   cd app
   npm start -- --clear
   ```

3. **Reopen the app**
   - Launch app from device
   - Changes should load

---

## Verification Checklist

After reloading, check for these new features:

### ✅ Progress Bar Header
- [ ] Blue header box at top of status section
- [ ] Progress bar with filled portion
- [ ] Text: "Step X of 6 • XX% Complete"
- [ ] Chart icon (📊) visible

### ✅ Enhanced Icons
- [ ] Icons are larger (44x44px)
- [ ] Current step has blue background
- [ ] Completed steps have green checkmarks
- [ ] Pending steps have gray outlines

### ✅ Status Descriptions
- [ ] Each step shows description text
- [ ] Example: "Application received and logged"
- [ ] Gray text below status label

### ✅ Payment Warnings (if applicable)
- [ ] Colored box for payment pending
- [ ] Shows days remaining or due date
- [ ] Orange if urgent, red if overdue

### ✅ Better Timestamps
- [ ] Full date and time shown
- [ ] Example: "January 10, 2024, 2:30 PM"

### ✅ Admin Comments
- [ ] Chat bubble icon (💬) before comments
- [ ] Comments displayed with border on left

---

## Still Not Working?

### Check 1: Verify File Changes
```bash
# Make sure StatusStepper.js was actually modified
cd app/components
cat StatusStepper.js | grep "progressHeader"

# Should show the new progress header code
```

### Check 2: Check for Errors
Look at the Metro bundler terminal for errors:
- Red error messages
- Syntax errors
- Import errors

### Check 3: Verify Expo is Running
```bash
# Check if Expo is running
# You should see:
# "Metro waiting on exp://..."
# "Logs for your project will appear below"
```

### Check 4: Check Device Connection
- Device and computer on same WiFi network
- Expo Go app is up to date
- QR code scans successfully

---

## Common Issues & Fixes

### Issue: "Unable to resolve module"
**Fix:**
```bash
cd app
rm -rf node_modules
npm install
npm start -- --clear
```

### Issue: "Invariant Violation"
**Fix:**
```bash
cd app
watchman watch-del-all
npm start -- --reset-cache
```

### Issue: Changes not appearing after reload
**Fix:**
```bash
# Complete cache clear
cd app
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android/app/build  # If using Android
npm start -- --clear
```

### Issue: "Network response timed out"
**Fix:**
- Check WiFi connection
- Restart Expo server
- Restart device
- Try USB connection instead

---

## Alternative: Use USB Connection

If WiFi is unreliable:

### Android
```bash
# Enable USB debugging on device
# Connect via USB
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001

# Start Expo
cd app
npm start
```

### iOS
- Connect via USB
- Trust computer on device
- Expo will detect USB connection automatically

---

## Quick Command Reference

```bash
# Clear cache and restart (RECOMMENDED)
cd app
npx expo start -c

# Reset cache completely
cd app
npm start -- --reset-cache

# Clear Metro bundler cache
cd app
npm start -- --clear

# Restart from scratch
cd app
rm -rf node_modules/.cache
rm -rf .expo
npm start

# Check for errors
cd app
npm start
# Watch terminal for red error messages
```

---

## Expected Result

After successfully reloading, you should see:

```
┌─────────────────────────────────────┐
│  📊 Application Progress             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  │
│  Step 3 of 6 • 50% Complete         │
└─────────────────────────────────────┘

  ✓  Submitted
  │  Application received and logged
  │  💬 Application submitted
  │  📅 January 10, 2024, 2:30 PM
  
  ✓  Under Review
  │  Documents being verified
  │  💬 Documents verified
  │  📅 January 11, 2024, 10:15 AM
  
  ⏱  Payment Pending
  │  Payment required to proceed
  │  ⚠️ Due in 5 days
  │  💬 Awaiting payment
  │  📅 January 12, 2024, 9:00 AM
```

---

## Summary

**Fastest Method:**
1. Shake device → Reload
2. Or: `npx expo start -c` → Reload app

**If that doesn't work:**
1. Stop Metro bundler (Ctrl+C)
2. Run: `cd app && npx expo start -c`
3. Reload app on device
4. Verify new progress bar appears

**Still not working?**
- Check terminal for errors
- Clear all caches (see "Nuclear Option")
- Restart device
- Reinstall Expo Go app

---

**Need Help?**
Check the terminal output for error messages and share them for troubleshooting.

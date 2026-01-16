# PLN Application Tracking - Debug Tools

## 🚀 Quick Start

Having issues with PLN application tracking? Start here!

### Option 1: Quick Status Check (Fastest)
```bash
# Windows
QUICK-CHECK-PLN.bat

# Or manually
node quick-check-pln-tracking.js
```

This will quickly tell you if tracking is working and provide test credentials.

### Option 2: Full Diagnostics
```bash
# Windows
DEBUG-PLN-TRACKING.bat

# Or manually
node debug-pln-tracking.js
```

This provides comprehensive diagnostics and automatically fixes common issues.

### Option 3: API Testing
```bash
node test-pln-tracking-api.js
```

This tests the backend API endpoints directly.

---

## 📁 Debug Tools Overview

### 1. Quick Check (`quick-check-pln-tracking.js`)
**Use when:** You want a fast status check

**What it does:**
- ✅ Checks MongoDB connection
- ✅ Counts PLN applications
- ✅ Tests backend API
- ✅ Provides test credentials

**Run:**
```bash
QUICK-CHECK-PLN.bat
# or
node quick-check-pln-tracking.js
```

---

### 2. Full Debugger (`debug-pln-tracking.js`)
**Use when:** You need detailed diagnostics

**What it does:**
- ✅ Lists all PLN applications
- ✅ Checks tracking PIN configuration
- ✅ Identifies and fixes missing PINs
- ✅ Tests database queries
- ✅ Provides test data
- ✅ Shows common issues and solutions

**Run:**
```bash
DEBUG-PLN-TRACKING.bat
# or
node debug-pln-tracking.js
```

**Output includes:**
- All applications with Reference IDs
- Tracking PIN status
- Test credentials
- CURL commands for manual testing
- Common issues and solutions

---

### 3. API Tester (`test-pln-tracking-api.js`)
**Use when:** You want to test the backend API

**What it does:**
- ✅ Tests valid tracking request
- ✅ Tests invalid PIN (should fail with 401)
- ✅ Tests invalid Reference ID (should fail with 404)
- ✅ Tests missing parameters (should fail)
- ✅ Shows detailed error messages

**Run:**
```bash
node test-pln-tracking-api.js
```

**Tests performed:**
1. Valid tracking (should succeed)
2. Invalid PIN (should fail with 401)
3. Invalid Reference ID (should fail with 404)
4. Missing parameters (should fail)

---

## 🎯 Troubleshooting Workflow

### Step 1: Quick Check
```bash
QUICK-CHECK-PLN.bat
```

**If it says "PLN TRACKING IS WORKING":**
- ✅ Use the provided test credentials in mobile app
- ✅ You're done!

**If it shows errors:**
- ❌ Continue to Step 2

---

### Step 2: Full Diagnostics
```bash
DEBUG-PLN-TRACKING.bat
```

**This will:**
- Show all applications in database
- Check tracking PIN configuration
- Automatically fix missing PINs
- Provide detailed test data

**Look for:**
- Number of applications (should be > 0)
- Tracking PINs (should all be "12345")
- Any warnings or errors

---

### Step 3: Test Backend API
```bash
node test-pln-tracking-api.js
```

**This will:**
- Test the backend API directly
- Verify PIN validation
- Check error handling

**Expected results:**
- ✅ Test 1 (valid request) should succeed
- ✅ Test 2 (invalid PIN) should fail with 401
- ✅ Test 3 (invalid Reference ID) should fail with 404

---

### Step 4: Check Mobile App

If backend tests pass but mobile app fails:

1. **Check API_BASE_URL** in `app/config/env.js`
   ```javascript
   API_BASE_URL: 'http://localhost:5000/api'  // Emulator
   // or
   API_BASE_URL: 'http://192.168.1.100:5000/api'  // Physical device
   ```

2. **Verify network connectivity**
   - Emulator: Use `localhost` or `10.0.2.2` (Android)
   - Physical device: Use computer's IP address
   - Or use USB with port forwarding

3. **Test with credentials from debugger**
   - Use Reference ID from debug output
   - Use PIN: `12345`

---

## 📊 Common Issues

### Issue: "No applications found"
**Solution:** Create a PLN application first
```bash
# Use mobile app or admin panel to create an application
# Or run:
node create-test-pln-application.js
```

---

### Issue: "Cannot connect to backend"
**Solution:** Start the backend
```bash
cd backend
npm run dev
```

---

### Issue: "Invalid PIN"
**Solution:** Run the debugger to fix PINs
```bash
DEBUG-PLN-TRACKING.bat
# This will automatically set all PINs to "12345"
```

---

### Issue: "Application not found" (but it exists)
**Possible causes:**
1. Reference ID has typo
2. Reference ID is lowercase (should be uppercase)
3. Extra spaces in Reference ID

**Solution:**
```bash
# Get exact Reference ID from debugger
DEBUG-PLN-TRACKING.bat
# Copy the Reference ID exactly as shown
```

---

## 🔧 Manual Testing

### Test with CURL
```bash
# Get Reference ID from debugger first
DEBUG-PLN-TRACKING.bat

# Then test with curl
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
```

### Test with Postman
```
Method: GET
URL: http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
```

### Test in Mobile App
1. Open PLN Tracking screen
2. Enter Reference ID (from debugger output)
3. Enter PIN: `12345`
4. Click "Check Status"

---

## 📱 Mobile App Configuration

### For Emulator/Simulator
```javascript
// app/config/env.js
API_BASE_URL: 'http://localhost:5000/api'  // iOS
API_BASE_URL: 'http://10.0.2.2:5000/api'   // Android
```

### For Physical Device (WiFi)
```bash
# 1. Get your computer's IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Update app/config/env.js
API_BASE_URL: 'http://192.168.1.100:5000/api'  # Use your IP
```

### For Physical Device (USB)
```bash
# Android
adb reverse tcp:5000 tcp:5000

# Then use
API_BASE_URL: 'http://localhost:5000/api'
```

---

## 📚 Documentation

### Detailed Guides
- **`PLN-TRACKING-TROUBLESHOOTING-GUIDE.md`** - Comprehensive troubleshooting guide
- **`PLN-TRACKING-MISMATCH-DIAGNOSIS.md`** - Technical diagnosis of the tracking system

### Code Files
- **`app/screens/PLNTrackingScreen_Unified.js`** - Mobile app tracking screen
- **`app/services/plnService.js`** - Mobile app API service
- **`backend/src/modules/pln/pln.controller.ts`** - Backend controller
- **`backend/src/modules/pln/pln.service.ts`** - Backend service
- **`backend/src/modules/pln/pln.routes.ts`** - Backend routes

---

## ✅ Success Checklist

Before testing in mobile app, verify:

- [ ] MongoDB is running
- [ ] Backend is running (port 5000)
- [ ] At least one PLN application exists
- [ ] Quick check shows "PLN TRACKING IS WORKING"
- [ ] API tester shows all tests passing
- [ ] You have test credentials (Reference ID + PIN)

---

## 🎯 Expected Behavior

### Successful Tracking
- User enters correct Reference ID
- User enters PIN: `12345`
- App displays application details
- Shows status, plate choices, dates, etc.

### Failed Tracking (Invalid PIN)
- User enters wrong PIN
- App shows: "Invalid PIN. Please check your PIN and try again."
- Status code: 401

### Failed Tracking (Not Found)
- User enters wrong Reference ID
- App shows: "Application not found. Please check your reference ID."
- Status code: 404

---

## 🚨 Emergency Reset

If nothing works, try this:

```bash
# 1. Stop everything
# Press Ctrl+C in all terminals

# 2. Reset tracking PINs
mongosh
use road-authority
db.plns.updateMany({}, { $set: { trackingPin: "12345" } })
exit

# 3. Restart backend
cd backend
npm run dev

# 4. Run quick check
QUICK-CHECK-PLN.bat

# 5. Test in mobile app
```

---

## 📞 Need More Help?

1. **Read the full troubleshooting guide:**
   ```
   PLN-TRACKING-TROUBLESHOOTING-GUIDE.md
   ```

2. **Check the technical diagnosis:**
   ```
   PLN-TRACKING-MISMATCH-DIAGNOSIS.md
   ```

3. **Run all debug tools:**
   ```bash
   QUICK-CHECK-PLN.bat
   DEBUG-PLN-TRACKING.bat
   node test-pln-tracking-api.js
   ```

4. **Check backend logs:**
   - Look for error messages
   - Verify incoming requests
   - Check MongoDB connection

---

## 📝 Quick Reference

### Universal PIN
```
12345
```
All applications use this PIN for tracking.

### Reference ID Format
```
PLN-YYYY-XXXXXXXXXXXX
Example: PLN-2024-ABC123DEF456
```

### API Endpoint
```
GET /api/pln/track/:referenceId/:pin
Example: GET /api/pln/track/PLN-2024-ABC123DEF456/12345
```

### Test Commands
```bash
# Quick check
QUICK-CHECK-PLN.bat

# Full diagnostics
DEBUG-PLN-TRACKING.bat

# API testing
node test-pln-tracking-api.js

# Manual API test
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
```

---

**Last Updated:** January 15, 2026

**Quick Start:** Run `QUICK-CHECK-PLN.bat` to get started!

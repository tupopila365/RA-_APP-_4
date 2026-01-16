# PLN Application Tracking - Troubleshooting Guide

## 🎯 Quick Start

If you're experiencing issues with PLN application tracking, follow these steps:

### Step 1: Run the Debugger
```bash
# Windows
DEBUG-PLN-TRACKING.bat

# Or manually
node debug-pln-tracking.js
```

### Step 2: Test the API
```bash
node test-pln-tracking-api.js
```

---

## 📋 How PLN Tracking Works

### Current Implementation (Correct)

**Backend:**
- Route: `GET /api/pln/track/:referenceId/:pin`
- PIN Validation: Must be exactly `"12345"` (universal PIN)
- Database Query: Searches by `referenceId` only (after PIN validation)

**Mobile App:**
- User enters Reference ID (e.g., `PLN-2024-ABC123DEF456`)
- User enters PIN (`12345`)
- App calls: `/api/pln/track/{referenceId}/{pin}`
- Displays application details if found

### Data Flow

```
User Input
  ↓
[Reference ID] + [PIN: 12345]
  ↓
Mobile App (plnService.trackApplication)
  ↓
API: GET /api/pln/track/:referenceId/:pin
  ↓
Backend Controller (pln.controller.ts)
  ↓
Validate PIN === "12345"
  ↓
Backend Service (pln.service.ts)
  ↓
MongoDB Query: { referenceId: "PLN-2024-..." }
  ↓
Return Application Data
```

---

## 🔍 Common Issues and Solutions

### Issue 1: "Application not found"

**Symptoms:**
- User enters correct Reference ID and PIN
- Gets "Application not found" error

**Possible Causes:**

1. **Reference ID is incorrect**
   - Check for typos
   - Verify case sensitivity (should be uppercase)
   - Ensure format: `PLN-YYYY-XXXXXXXXXXXX`

2. **Application doesn't exist in database**
   ```bash
   # Check database
   node debug-pln-tracking.js
   ```

3. **Reference ID has extra spaces**
   - Backend trims spaces, but check input

**Solutions:**
```bash
# 1. List all applications
node debug-pln-tracking.js

# 2. Test with a known Reference ID
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345

# 3. Check MongoDB directly
mongosh
use road-authority
db.plns.find({}).pretty()
```

---

### Issue 2: "Invalid PIN"

**Symptoms:**
- Gets 401 Unauthorized error
- Message: "Invalid PIN. Please check your PIN and try again."

**Possible Causes:**

1. **PIN is not "12345"**
   - Universal PIN is hardcoded as `"12345"`
   - No other PIN will work

2. **PIN has spaces**
   - Backend trims spaces, but verify input

3. **trackingPin field not set in database**
   ```bash
   # Check and fix
   node debug-pln-tracking.js
   ```

**Solutions:**
```bash
# 1. Verify PIN in database
node debug-pln-tracking.js

# 2. Test with correct PIN
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345

# 3. Update trackingPin in database if needed
mongosh
use road-authority
db.plns.updateMany({}, { $set: { trackingPin: "12345" } })
```

---

### Issue 3: "Network request failed"

**Symptoms:**
- Mobile app shows network error
- Cannot connect to backend

**Possible Causes:**

1. **Backend is not running**
   ```bash
   # Start backend
   cd backend
   npm run dev
   ```

2. **Wrong API_BASE_URL in mobile app**
   - Check `app/config/env.js`
   - Should match backend URL

3. **Device and computer on different networks**
   - Use same WiFi network
   - Or use USB with port forwarding
   - Or use ngrok

**Solutions:**

**For Emulator/Simulator:**
```javascript
// app/config/env.js
API_BASE_URL: 'http://localhost:5000/api'  // iOS Simulator
API_BASE_URL: 'http://10.0.2.2:5000/api'   // Android Emulator
```

**For Physical Device (WiFi):**
```bash
# 1. Get your computer's IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Update mobile app config
# app/config/env.js
API_BASE_URL: 'http://192.168.1.100:5000/api'  # Use your IP
```

**For Physical Device (USB):**
```bash
# Android
adb reverse tcp:5000 tcp:5000

# Then use
API_BASE_URL: 'http://localhost:5000/api'
```

**Using ngrok:**
```bash
# Start ngrok
ngrok http 5000

# Update mobile app config with ngrok URL
API_BASE_URL: 'https://abc123.ngrok.io/api'
```

---

### Issue 4: Backend returns 500 error

**Symptoms:**
- API returns 500 Internal Server Error
- Backend logs show errors

**Possible Causes:**

1. **MongoDB connection issue**
   - Check if MongoDB is running
   - Verify connection string

2. **Database schema mismatch**
   - Check if PLN model matches database

3. **Missing environment variables**
   - Check `backend/.env` file

**Solutions:**
```bash
# 1. Check backend logs
cd backend
npm run dev
# Look for error messages

# 2. Verify MongoDB connection
mongosh
show dbs
use road-authority
db.plns.countDocuments()

# 3. Check environment variables
cat backend/.env  # Mac/Linux
type backend\.env  # Windows
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] MongoDB is running
- [ ] Backend server is running (port 5000)
- [ ] At least one PLN application exists in database
- [ ] Application has `trackingPin` field set to "12345"
- [ ] API endpoint responds to curl/Postman requests

```bash
# Test backend
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
```

### Mobile App Tests

- [ ] Mobile app is connected to backend
- [ ] API_BASE_URL is correct in `app/config/env.js`
- [ ] Device/emulator can reach backend
- [ ] Reference ID is entered correctly (uppercase)
- [ ] PIN is entered as "12345"

### Database Tests

- [ ] PLN applications exist in `plns` collection
- [ ] Each application has `referenceId` field
- [ ] Each application has `trackingPin` field (should be "12345")
- [ ] Reference IDs are unique

```bash
# Check database
node debug-pln-tracking.js
```

---

## 🔧 Debug Tools

### 1. Database Debugger
```bash
# Run comprehensive database check
node debug-pln-tracking.js
```

**What it does:**
- Lists all PLN applications
- Checks tracking PIN configuration
- Identifies applications without PIN
- Automatically fixes missing PINs
- Provides test data for manual testing

### 2. API Tester
```bash
# Test API endpoints directly
node test-pln-tracking-api.js
```

**What it does:**
- Tests valid tracking request
- Tests invalid PIN (should fail)
- Tests invalid Reference ID (should fail)
- Tests missing parameters (should fail)
- Provides detailed error messages

### 3. Manual API Test
```bash
# Using curl
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345

# Using Postman
GET http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
```

### 4. MongoDB Direct Query
```bash
mongosh
use road-authority

# List all applications
db.plns.find({}).pretty()

# Find specific application
db.plns.findOne({ referenceId: "PLN-2024-ABC123DEF456" })

# Check tracking PINs
db.plns.find({}, { referenceId: 1, trackingPin: 1, _id: 0 })

# Fix missing PINs
db.plns.updateMany(
  { trackingPin: { $exists: false } },
  { $set: { trackingPin: "12345" } }
)
```

---

## 📱 Mobile App Configuration

### Environment Configuration

**File:** `app/config/env.js`

```javascript
const ENV = {
  // Development
  development: {
    API_BASE_URL: 'http://localhost:5000/api',  // Emulator/Simulator
    // API_BASE_URL: 'http://192.168.1.100:5000/api',  // Physical device (WiFi)
    // API_BASE_URL: 'https://abc123.ngrok.io/api',  // ngrok
  },
  
  // Production
  production: {
    API_BASE_URL: 'https://your-production-api.com/api',
  },
};
```

### Network Configuration

**For Android Emulator:**
```javascript
API_BASE_URL: 'http://10.0.2.2:5000/api'
```

**For iOS Simulator:**
```javascript
API_BASE_URL: 'http://localhost:5000/api'
```

**For Physical Device (WiFi):**
1. Get computer's IP address
2. Ensure device and computer on same network
3. Use IP address in config:
```javascript
API_BASE_URL: 'http://192.168.1.100:5000/api'
```

**For Physical Device (USB):**
```bash
# Android
adb reverse tcp:5000 tcp:5000

# Then use
API_BASE_URL: 'http://localhost:5000/api'
```

---

## 🎯 Step-by-Step Debugging Process

### Step 1: Verify Backend is Working

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Check if it's running
curl http://localhost:5000/api/health
# or
curl http://localhost:5000/api/pln/applications
```

### Step 2: Check Database

```bash
# Run debugger
node debug-pln-tracking.js

# Look for:
# - Number of applications
# - Reference IDs
# - Tracking PINs
```

### Step 3: Test API Endpoint

```bash
# Run API tester
node test-pln-tracking-api.js

# Or test manually
curl http://localhost:5000/api/pln/track/[REFERENCE_ID]/12345
```

### Step 4: Test Mobile App Connection

```bash
# Check mobile app can reach backend
# In mobile app, try any API call
# Check backend logs for incoming requests
```

### Step 5: Test Tracking in Mobile App

1. Open PLN Tracking screen
2. Enter Reference ID from debugger output
3. Enter PIN: `12345`
4. Click "Check Status"
5. Check for errors

### Step 6: Check Logs

**Backend logs:**
- Look for incoming requests
- Check for errors
- Verify PIN validation

**Mobile app logs:**
- Check console for errors
- Verify API URL being called
- Check response data

---

## 📊 Expected Behavior

### Successful Tracking

**Request:**
```
GET /api/pln/track/PLN-2024-ABC123DEF456/12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "...",
      "referenceId": "PLN-2024-ABC123DEF456",
      "fullName": "John Doe",
      "status": "submitted",
      "plateChoices": [...],
      "statusHistory": [...],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Failed Tracking (Invalid PIN)

**Request:**
```
GET /api/pln/track/PLN-2024-ABC123DEF456/99999
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Invalid PIN. Please check your PIN and try again."
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Failed Tracking (Not Found)

**Request:**
```
GET /api/pln/track/PLN-2024-INVALID123/12345
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Application not found. Please check your reference ID."
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## 🚀 Quick Fixes

### Fix 1: Reset All Tracking PINs
```bash
mongosh
use road-authority
db.plns.updateMany({}, { $set: { trackingPin: "12345" } })
```

### Fix 2: Create Test Application
```bash
node create-test-pln-application.js
```

### Fix 3: Restart Everything
```bash
# Stop all services
# Ctrl+C in all terminals

# Start MongoDB
mongod

# Start backend
cd backend
npm run dev

# Start mobile app
cd app
npm start
```

### Fix 4: Clear Cache
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Mobile app
cd app
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📞 Still Having Issues?

If you've tried everything and still have issues:

1. **Check the diagnosis document:**
   - `PLN-TRACKING-MISMATCH-DIAGNOSIS.md`

2. **Run all debug tools:**
   ```bash
   node debug-pln-tracking.js
   node test-pln-tracking-api.js
   ```

3. **Check backend logs carefully:**
   - Look for error messages
   - Check MongoDB connection
   - Verify environment variables

4. **Verify mobile app configuration:**
   - Check `app/config/env.js`
   - Verify network connectivity
   - Test with curl/Postman first

5. **Create a minimal test case:**
   - Create new application
   - Note the Reference ID
   - Test tracking immediately

---

## ✅ Success Indicators

You know tracking is working when:

- ✅ Backend responds to curl requests
- ✅ API tester shows all tests passing
- ✅ Mobile app can connect to backend
- ✅ Tracking with correct credentials returns application data
- ✅ Tracking with wrong PIN returns 401 error
- ✅ Tracking with wrong Reference ID returns 404 error

---

## 📝 Notes

- **Universal PIN:** All applications use PIN `"12345"` for tracking
- **Case Sensitivity:** Reference IDs are case-sensitive (use uppercase)
- **Trimming:** Backend automatically trims spaces from inputs
- **Security:** PIN validation happens before database query
- **Error Messages:** Backend provides clear error messages for debugging

---

## 🔗 Related Files

- `app/screens/PLNTrackingScreen_Unified.js` - Mobile app tracking screen
- `app/services/plnService.js` - Mobile app API service
- `backend/src/modules/pln/pln.controller.ts` - Backend controller
- `backend/src/modules/pln/pln.service.ts` - Backend service
- `backend/src/modules/pln/pln.routes.ts` - Backend routes
- `debug-pln-tracking.js` - Database debugger
- `test-pln-tracking-api.js` - API tester
- `PLN-TRACKING-MISMATCH-DIAGNOSIS.md` - Detailed diagnosis

---

**Last Updated:** January 15, 2026

# Quick Start: PLN Tracking with Universal PIN

## What Changed?

The PLN tracking system now uses a **universal PIN (12345)** instead of individual ID numbers.

### Before:
- Reference ID + ID Number (13 digits)

### After:
- Reference ID + PIN (12345 for everyone)

## Quick Test

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Get a Test Reference ID

You need an existing PLN application. If you don't have one:

**Option A: Check Database**
```bash
# Connect to MongoDB and find a reference ID
mongosh
use roads_authority
db.plnapplications.findOne({}, {referenceId: 1})
```

**Option B: Create New Application**
- Use the mobile app to submit a PLN application
- Note the Reference ID from the confirmation

### 3. Test the Tracking

**Using curl:**
```bash
# Replace with your actual Reference ID
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
```

**Using the test script:**
```bash
node test-pln-tracking-pin.js PLN-2024-ABC123DEF456
```

**Using the mobile app:**
1. Open the app
2. Go to "Track PLN Application"
3. Enter your Reference ID
4. Enter PIN: **12345**
5. Click "Check Status"

## Expected Results

### ✓ Success (Correct PIN)
```json
{
  "success": true,
  "data": {
    "application": {
      "referenceId": "PLN-2024-ABC123DEF456",
      "fullName": "John Doe",
      "status": "under-review",
      ...
    }
  }
}
```

### ✗ Invalid PIN
```json
{
  "success": false,
  "error": {
    "code": "AUTH_006",
    "message": "Invalid PIN. Please check your PIN and try again."
  }
}
```

### ✗ Application Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Application not found. Please check your reference ID."
  }
}
```

## User Instructions

Tell your users:

> **To track your PLN application:**
> 1. Enter your Reference ID (from your confirmation)
> 2. Enter PIN: **12345**
> 3. Click "Check Status"

## Troubleshooting

**Backend not starting?**
```bash
cd backend
npm run build
npm start
```

**Mobile app not connecting?**
- Check `app/config/env.js` has correct API_BASE_URL
- For physical device, use ngrok or port forwarding
- For emulator, use http://10.0.2.2:5000

**Test script failing?**
- Make sure backend is running
- Verify you have at least one PLN application in database
- Check the Reference ID is correct

## Files Changed

- ✓ Backend service, controller, routes
- ✓ Frontend tracking screen
- ✓ Frontend service layer
- ✓ Test script created
- ✓ Documentation added

## Next Steps

1. Test with the mobile app
2. Verify error handling
3. Update user documentation
4. Train support staff on new PIN system

---

**Universal PIN:** 12345 (same for all users)

# PLN Tracking Input Mismatch - Diagnosis

## 🔍 Problem Identified

There's a **critical mismatch** between what the frontend sends and what the backend expects for PLN tracking.

---

## Frontend Expectations (PLNTrackingScreen.js)

### Input Fields:
1. **Reference ID** - User enters the PLN reference (e.g., `PLN-2024-ABC123DEF456`)
2. **ID Number** - User enters their 13-digit ID number (e.g., `1234567890123`)

### Validation:
```javascript
// Reference ID validation
if (!referenceId.toUpperCase().match(/^PLN-\d{4}-[123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{12,15}$/)) {
  setReferenceError('Invalid Reference ID format (PLN-YYYY-XXXXXXXXXXXX)');
}

// ID Number validation
if (trackingPin.length !== 13 || !trackingPin.match(/^\d{13}$/)) {
  setPinError('ID Number must be 13 digits');
}
```

### API Call (plnService.js):
```javascript
async trackApplication(referenceId, idNumber) {
  const response = await ApiClient.get(`/pln/track/${referenceId.trim()}/${idNumber.trim()}`);
  return response.data.application;
}
```

**Frontend sends:** `/api/pln/track/{referenceId}/{idNumber}`

---

## Backend Expectations (pln.service.ts)

### Database Query:
```typescript
async getApplicationByReference(referenceId: string, idNumber: string): Promise<IPLN> {
  const application = await PLNModel.findOne({
    referenceId: referenceId.trim(),
    idNumber: idNumber.trim(),  // ❌ PROBLEM: Searches by idNumber field
  }).lean();
  
  if (!application) {
    throw {
      statusCode: 404,
      message: 'Application not found. Please check your reference ID and ID number.',
    };
  }
  
  return application;
}
```

**Backend expects:** Both `referenceId` AND `idNumber` to match database records

---

## 🚨 The Core Issue

### What the Backend Stores:
When a PLN application is created, the backend stores:
- `referenceId`: e.g., `PLN-2024-ABC123DEF456`
- `trackingPin`: Always `"12345"` (hardcoded default)
- `idNumber`: The actual ID number from the application (e.g., `1234567890123`)

### What the Backend Searches For:
The `getApplicationByReference()` method searches for:
```javascript
{
  referenceId: "PLN-2024-ABC123DEF456",
  idNumber: "1234567890123"  // Must match the stored idNumber
}
```

### What the User Thinks They Need:
The frontend labels suggest users should enter:
1. Reference ID (correct ✅)
2. ID Number (correct ✅)

**BUT** the route parameter is called `trackingPin` in the controller!

---

## Route Definition Confusion

### Backend Route (pln.routes.ts):
```typescript
/**
 * @route   GET /api/pln/track/:referenceId/:trackingPin
 * @desc    Track application by reference ID and tracking PIN
 */
router.get(
  '/track/:referenceId/:trackingPin',
  plnController.trackApplication.bind(plnController)
);
```

### Backend Controller (pln.controller.ts):
```typescript
async trackApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { referenceId, trackingPin } = req.params;  // ❌ Called trackingPin
  
  const application = await plnService.getApplicationByReference(referenceId, trackingPin);
  // But passes it as the second parameter which is used to search idNumber field
}
```

---

## 💡 The Solution

You have **TWO OPTIONS**:

### Option 1: Use trackingPin Field (Simpler but less secure)
Change the backend to search by `trackingPin` instead of `idNumber`:

**File:** `backend/src/modules/pln/pln.service.ts`
```typescript
async getApplicationByReference(referenceId: string, trackingPin: string): Promise<IPLN> {
  const application = await PLNModel.findOne({
    referenceId: referenceId.trim(),
    trackingPin: trackingPin.trim(),  // ✅ Search by trackingPin (always "12345")
  }).lean();
  
  if (!application) {
    throw {
      statusCode: 404,
      message: 'Application not found. Please check your reference ID and tracking PIN.',
    };
  }
  
  return application;
}
```

**Then update frontend to ask for tracking PIN:**
- Change label from "ID Number" to "Tracking PIN"
- Change validation to accept "12345"
- Update helper text

### Option 2: Keep Using ID Number (More secure, recommended)
Keep the current backend logic but fix the parameter naming:

**File:** `backend/src/modules/pln/pln.routes.ts`
```typescript
/**
 * @route   GET /api/pln/track/:referenceId/:idNumber
 * @desc    Track application by reference ID and ID number
 */
router.get(
  '/track/:referenceId/:idNumber',  // ✅ Rename parameter
  plnController.trackApplication.bind(plnController)
);
```

**File:** `backend/src/modules/pln/pln.controller.ts`
```typescript
async trackApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { referenceId, idNumber } = req.params;  // ✅ Rename parameter
  
  if (!referenceId || !idNumber) {
    res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Reference ID and ID number are required',  // ✅ Update message
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  const application = await plnService.getApplicationByReference(referenceId, idNumber);
  // Rest of the code...
}
```

---

## 🎯 Recommended Approach

**Use Option 2** (ID Number) because:
1. ✅ More secure - trackingPin is always "12345" (not secure)
2. ✅ Better user experience - users remember their ID number
3. ✅ Frontend already validates 13-digit ID numbers correctly
4. ✅ Only requires backend changes (no frontend changes needed)

---

## Testing After Fix

### Test Case 1: Valid Application
```bash
# Create an application first, note the referenceId and idNumber
# Then test tracking:
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/1234567890123
```

### Test Case 2: Invalid ID Number
```bash
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/9999999999999
# Should return 404
```

### Test Case 3: Invalid Reference ID
```bash
curl http://localhost:5000/api/pln/track/PLN-2024-INVALID/1234567890123
# Should return 404
```

---

## Summary

**Current State:**
- Frontend sends: `referenceId` + `idNumber` ✅
- Backend route expects: `referenceId` + `trackingPin` ❌
- Backend searches for: `referenceId` + `idNumber` ✅
- **Result:** Parameter name mismatch causes confusion

**After Fix (Option 2):**
- Frontend sends: `referenceId` + `idNumber` ✅
- Backend route expects: `referenceId` + `idNumber` ✅
- Backend searches for: `referenceId` + `idNumber` ✅
- **Result:** Everything matches! 🎉

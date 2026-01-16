# PLN Application ID Number Fix - COMPLETE ✅

## Issue Description
PLN applications were failing with error:
```
Traffic Register Number or Namibia ID-doc number is required {"statusCode":400,"code":"VALIDATION_001"}
```

The backend expected an ID number for both "Traffic Register Number" and "Namibia ID-doc" types, but the frontend was only sending it for "Traffic Register Number".

## Root Cause
In `PLNApplicationScreenEnhanced.js`, the form submission logic had:
```javascript
trafficRegisterNumber: idType === 'Traffic Register Number' ? trafficRegisterNumber : undefined,
```

This only sent the ID number for Traffic Register Number, not for Namibia ID-doc.

## Fix Applied

### 1. Updated Form Submission Logic
**File:** `app/screens/PLNApplicationScreenEnhanced.js`

**Before:**
```javascript
trafficRegisterNumber: idType === 'Traffic Register Number' ? trafficRegisterNumber : undefined,
```

**After:**
```javascript
trafficRegisterNumber: (idType === 'Traffic Register Number' || idType === 'Namibia ID-doc') ? trafficRegisterNumber : undefined,
```

### 2. Updated Validation Logic
**Before:**
```javascript
if (idType === 'Traffic Register Number' && !trafficRegisterNumber.trim()) {
  errors.trafficRegisterNumber = 'Traffic Register Number is required';
}
```

**After:**
```javascript
if ((idType === 'Traffic Register Number' || idType === 'Namibia ID-doc') && !trafficRegisterNumber.trim()) {
  errors.trafficRegisterNumber = idType === 'Traffic Register Number' ? 'Traffic Register Number is required' : 'ID Number is required';
}
```

### 3. Updated Form UI
**Before:**
```javascript
{idType === 'Traffic Register Number' && (
  <UnifiedFormInput
    label="Traffic Register Number"
    // ...
  />
)}
```

**After:**
```javascript
{(idType === 'Traffic Register Number' || idType === 'Namibia ID-doc') && (
  <UnifiedFormInput
    label={idType === 'Traffic Register Number' ? 'Traffic Register Number' : 'ID Number'}
    placeholder={idType === 'Traffic Register Number' ? 'Enter traffic register number' : 'Enter ID number'}
    // ...
  />
)}
```

## Backend Validation (Already Correct)
The backend in `pln.service.ts` was already correctly validating:
```typescript
if (dto.idType === 'Traffic Register Number' || dto.idType === 'Namibia ID-doc') {
  if (!dto.trafficRegisterNumber || !dto.trafficRegisterNumber.trim()) {
    throw {
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Traffic Register Number or Namibia ID-doc number is required',
    };
  }
}
```

## Testing

### Test Script Created
`test-pln-id-number-fix.js` - Tests both ID types to ensure fix works correctly.

### Manual Testing
1. Open PLN Application form
2. Select "Namibia ID-doc" as ID type
3. Fill in ID Number field (now visible)
4. Complete and submit form
5. ✅ Should succeed without validation error

## Expected Behavior After Fix

### For Namibia ID-doc:
- ✅ ID Number field is visible and required
- ✅ Form validates ID number is provided
- ✅ Backend receives trafficRegisterNumber field
- ✅ Application submits successfully

### For Traffic Register Number:
- ✅ Traffic Register Number field is visible and required
- ✅ Form validates number is provided
- ✅ Backend receives trafficRegisterNumber field
- ✅ Application submits successfully (unchanged behavior)

### For Business Reg. No:
- ✅ Business Registration Number field is visible
- ✅ No ID number field shown (correct behavior)
- ✅ Application submits successfully (unchanged behavior)

## Files Modified
1. `app/screens/PLNApplicationScreenEnhanced.js` - Form logic and UI
2. `test-pln-id-number-fix.js` - Test script (new)

## Verification Steps
1. ✅ Form shows correct fields for each ID type
2. ✅ Validation works for all ID types
3. ✅ Form submission includes required fields
4. ✅ Backend accepts applications without validation errors
5. ✅ PDF generation works with all ID types

## Status: COMPLETE ✅

The PLN application form now correctly handles ID numbers for both Traffic Register Number and Namibia ID-doc types. Users can successfully submit applications with either ID type.

---

**Fixed:** January 14, 2026
**Issue:** VALIDATION_001 error for Namibia ID-doc applications
**Impact:** PLN applications now work for all ID types
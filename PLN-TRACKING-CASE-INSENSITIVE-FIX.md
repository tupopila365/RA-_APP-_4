# PLN Tracking Case-Insensitive Fix

## Problem
Users were entering the correct Reference ID and PIN but getting "Application not found" errors because:
- Database stored: `PLN-2026-4efMbEiQDNxX` (mixed case)
- Mobile app sent: `PLN-2026-4EFMBEIQDN XX` (uppercase)
- Backend comparison was **case-sensitive**, so it didn't match

## Solution
Made the Reference ID comparison **case-insensitive** so users can enter their Reference ID in any case (uppercase, lowercase, or mixed).

## Changes Made

### 1. Backend Service (`backend/src/modules/pln/pln.service.ts`)
Changed the database query from exact match to case-insensitive regex:

```typescript
// Before (case-sensitive)
const application = await PLNModel.findOne({
  referenceId: referenceId.trim(),
}).lean();

// After (case-insensitive)
const application = await PLNModel.findOne({
  referenceId: { $regex: new RegExp(`^${referenceId.trim()}$`, 'i') },
}).lean();
```

### 2. Mobile App (`app/screens/PLNTrackingScreen_Unified.js`)
Removed the `.toUpperCase()` conversion since we now handle case-insensitivity on the backend:

```javascript
// Before
const result = await plnService.trackApplication(referenceId.trim().toUpperCase(), pin.trim());

// After
const result = await plnService.trackApplication(referenceId.trim(), pin.trim());
```

## Testing

### Quick Test
Run the automated test:
```bash
TEST-PLN-TRACKING-CASE-FIX.bat
```

This will:
1. Restart the backend
2. Test tracking with different case variations
3. Show results

### Manual Test
1. Start the backend: `cd backend && npm run dev`
2. Open the mobile app
3. Go to "Track PLN Application"
4. Try entering your Reference ID in different cases:
   - `PLN-2026-4efMbEiQDNxX` (exact)
   - `pln-2026-4efmbeiqdn xx` (lowercase)
   - `PLN-2026-4EFMBEIQDN XX` (uppercase)
   - Any mixed case variation

All should work now! ✅

## Benefits
- ✅ Users can enter Reference ID in any case
- ✅ No more "Application not found" errors due to case mismatch
- ✅ More user-friendly experience
- ✅ Works with existing data (no database migration needed)

## Technical Details
- Uses MongoDB regex with case-insensitive flag (`'i'`)
- Pattern: `^${referenceId}$` ensures exact match (not partial)
- Maintains security (PIN still required)
- No performance impact (referenceId field is indexed)

# Quick Test: PLN Status Refresh

## Simple Manual Test (No Scripts Required)

### Step 1: Prepare Test Application
1. Open mobile app
2. Submit a PLN application (or use existing one)
3. Note the Reference ID (e.g., `PLN-2024-ABC123`)

### Step 2: Track Application
1. Go to "Track PLN Application" screen
2. Enter Reference ID: `PLN-2024-ABC123`
3. Enter PIN: `12345`
4. Tap "Check Status"
5. **Note the current status** (e.g., "SUBMITTED")

### Step 3: Update Status in Admin
1. Open admin panel in browser
2. Log in as admin
3. Go to PLN Applications
4. Find your test application
5. Change status (e.g., SUBMITTED → UNDER_REVIEW)
6. Add comment: "Testing refresh functionality"
7. Save changes

### Step 4: Test Refresh in Mobile App
1. Go back to mobile app (don't close it)
2. You should see:
   - Green "Application Found Successfully" banner
   - "Refresh" button on the right
   - "Last updated: X minutes ago" text
3. **Tap the "Refresh" button**
4. Watch for:
   - Button shows "Refreshing..." briefly
   - Status updates to new value (UNDER_REVIEW)
   - "Last updated" changes to "Just now"
   - Status history shows new entry

### Step 5: Verify
✅ Status changed without re-entering credentials
✅ "Last updated" timestamp updated
✅ Status history shows admin's change
✅ Admin comments visible (if added)

---

## What to Look For

### Success Indicators
- ✅ Refresh button appears after successful search
- ✅ Clicking refresh shows loading state
- ✅ Status updates immediately
- ✅ Timestamp shows "Just now" after refresh
- ✅ No need to re-enter Reference ID or PIN

### If It Doesn't Work
- ❌ Backend not running → Start backend
- ❌ Network error → Check connection
- ❌ Status not changing → Verify admin saved changes
- ❌ Refresh button missing → Track application first

---

## Quick Verification (Without Mobile App)

### Test API Directly
```bash
# Windows (PowerShell)
Invoke-RestMethod -Uri "http://localhost:5000/api/pln/track/PLN-2024-ABC123/12345"

# Or using curl
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123/12345
```

Replace `PLN-2024-ABC123` with your actual Reference ID.

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "referenceId": "PLN-2024-ABC123",
      "status": "UNDER_REVIEW",
      "statusHistory": [...],
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Troubleshooting

### Problem: Refresh Button Not Visible
**Cause:** Application not loaded yet
**Fix:** Track application first, then refresh button appears

### Problem: Status Not Updating
**Cause:** Admin changes not saved or backend not running
**Fix:**
1. Check backend is running: `http://localhost:5000/health`
2. Verify admin saved changes
3. Check database directly (if possible)

### Problem: Network Error
**Cause:** Backend not accessible
**Fix:**
1. Start backend: `cd backend && npm run dev`
2. Check API_BASE_URL in `app/config/env.js`
3. Verify network connection

### Problem: "Last Updated" Not Showing
**Cause:** Need to refresh once to initialize
**Fix:** Click refresh button once

---

## Expected Behavior

### Before Fix
- ❌ User had to re-enter Reference ID and PIN to see updates
- ❌ No way to know if data was fresh
- ❌ Confusing user experience

### After Fix
- ✅ One-tap refresh button
- ✅ "Last updated" timestamp
- ✅ Smooth user experience
- ✅ No re-entering credentials

---

## Testing Checklist

- [ ] Mobile app shows tracking screen
- [ ] Can track application with Reference ID and PIN
- [ ] Refresh button appears after successful search
- [ ] Clicking refresh shows loading state
- [ ] Status updates without re-entering credentials
- [ ] "Last updated" timestamp updates
- [ ] Status history shows admin changes
- [ ] Admin comments visible (if added)
- [ ] Works on both Android and iOS (if applicable)

---

## Summary

**What Was Fixed:**
Added refresh button and timestamp to PLN tracking screen.

**How to Test:**
1. Track application
2. Update status in admin
3. Click refresh in mobile app
4. Verify status updates

**Result:**
Users can now see status updates instantly without re-entering their tracking details.

**Files Changed:**
- `app/screens/PLNTrackingScreen_Unified.js`

**Documentation:**
- `PLN-STATUS-SYNC-FIX-GUIDE.md` - Full guide
- `PLN-STATUS-REFRESH-QUICK-GUIDE.md` - Quick reference
- `QUICK-TEST-PLN-REFRESH.md` - This file

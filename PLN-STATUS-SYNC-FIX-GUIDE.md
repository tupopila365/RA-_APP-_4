# PLN Status Sync Fix Guide

## Problem
Users are not seeing status updates made by admins on their PLN applications in the mobile app.

## Root Cause Analysis

### Why This Happens
1. **No Auto-Refresh**: The mobile app doesn't automatically refresh application data
2. **Client-Side Caching**: Once data is loaded, it stays in component state
3. **No Real-Time Updates**: No WebSocket or polling mechanism for live updates
4. **Manual Refresh Required**: Users must re-enter tracking details to see updates

### What's Working
✅ Backend correctly updates status in database
✅ Backend API returns latest data when called
✅ Status history is properly logged
✅ Admin panel shows correct status

### What's Not Working
❌ Mobile app doesn't refresh automatically
❌ No indication that data might be stale
❌ No "last updated" timestamp shown
❌ No refresh button for quick updates

## Solution Implemented

### 1. Added Refresh Functionality
- **Refresh Button**: Added next to "Application Found Successfully" message
- **Manual Refresh**: Users can refresh without re-entering credentials
- **Loading State**: Shows "Refreshing..." indicator during refresh

### 2. Last Updated Timestamp
- Shows when data was last fetched
- Displays relative time (e.g., "2 minutes ago", "Just now")
- Helps users know if data is fresh

### 3. Improved UX
- Refresh button only appears after successful search
- Non-intrusive placement
- Clear visual feedback during refresh

## How to Use

### For Users
1. **Track Application**: Enter Reference ID and PIN as usual
2. **View Status**: See current application status
3. **Refresh**: Click the "Refresh" button to check for updates
4. **Last Updated**: Check timestamp to see data freshness

### For Admins
1. **Update Status**: Make changes in admin panel as usual
2. **Inform User**: Tell user to refresh their tracking screen
3. **Verify**: User clicks refresh button to see latest status

## Testing the Fix

### Run Diagnostic Script
```bash
node diagnose-pln-status-sync.js
```

This will:
- Show recent applications and their status
- Display status history
- Test tracking endpoint
- Identify any sync issues

### Manual Testing Steps

1. **Create Test Application**
   ```bash
   # Use mobile app to submit a PLN application
   # Note the Reference ID
   ```

2. **Update Status in Admin**
   - Log into admin panel
   - Find the application
   - Change status (e.g., SUBMITTED → UNDER_REVIEW)
   - Add admin comments

3. **Test Mobile Refresh**
   - Open mobile app
   - Track application with Reference ID and PIN
   - Note the status shown
   - Click "Refresh" button
   - Verify status updates immediately

4. **Verify Timestamp**
   - Check "Last updated" shows current time
   - Wait 2 minutes
   - Verify it shows "2 minutes ago"

## Additional Improvements (Optional)

### Auto-Refresh Timer
Add automatic refresh every 30 seconds when viewing status:

```javascript
// In PLNTrackingScreen_Unified.js
useEffect(() => {
  if (application && referenceId && pin) {
    const interval = setInterval(() => {
      handleCheckStatus(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }
}, [application, referenceId, pin]);
```

### Pull-to-Refresh
Add pull-to-refresh gesture to ScrollView:

```javascript
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[colors.primary]}
    />
  }
>
  {/* content */}
</ScrollView>
```

### Push Notifications
Implement real-time notifications when status changes:
1. Set up Firebase Cloud Messaging
2. Store device tokens with applications
3. Send push notification when admin updates status
4. User receives notification and can open app to see update

## Files Modified

1. **PLNTrackingScreen_Unified.js**
   - Added `refreshing` state
   - Added `lastUpdated` state
   - Modified `handleCheckStatus` to support refresh mode
   - Added `handleRefresh` function
   - Added `formatLastUpdated` function
   - Updated success card UI with refresh button
   - Added last updated timestamp display

2. **diagnose-pln-status-sync.js** (New)
   - Diagnostic script to identify sync issues
   - Tests tracking endpoint
   - Shows status history
   - Provides troubleshooting guidance

## Common Issues & Solutions

### Issue: Refresh Button Not Appearing
**Solution**: Ensure application was successfully loaded first

### Issue: Refresh Shows Same Data
**Solution**: 
- Check backend is running
- Verify network connection
- Check admin actually saved status change
- Run diagnostic script to verify database

### Issue: "Last Updated" Not Showing
**Solution**: Refresh the application once to initialize timestamp

### Issue: Status Still Not Updating
**Solution**:
1. Run diagnostic script: `node diagnose-pln-status-sync.js`
2. Check if status was actually updated in database
3. Verify Reference ID matches exactly
4. Check network connectivity
5. Clear app cache and restart

## API Endpoint Reference

### Track Application
```
GET /api/pln/track/:referenceId/:pin
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "...",
      "referenceId": "PLN-2024-ABC123",
      "status": "UNDER_REVIEW",
      "statusHistory": [...],
      "adminComments": "...",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Monitoring & Maintenance

### Check for Stale Data
```bash
# Run diagnostic script regularly
node diagnose-pln-status-sync.js
```

### Monitor API Calls
```bash
# Check backend logs for tracking requests
# Look for: "Get application by reference"
```

### Database Verification
```javascript
// Check if status and statusHistory match
db.plnapplications.find({}).forEach(app => {
  const latestHistory = app.statusHistory[app.statusHistory.length - 1];
  if (latestHistory.status !== app.status) {
    print(`Mismatch: ${app.referenceId}`);
  }
});
```

## Best Practices

### For Users
1. ✅ Use refresh button to check for updates
2. ✅ Check "last updated" timestamp
3. ✅ Contact support if status seems stuck
4. ✅ Keep Reference ID and PIN secure

### For Admins
1. ✅ Always add comments when changing status
2. ✅ Inform users to refresh after updates
3. ✅ Verify status change was saved
4. ✅ Use status history to track changes

### For Developers
1. ✅ Run diagnostic script before troubleshooting
2. ✅ Check backend logs for API errors
3. ✅ Verify database consistency
4. ✅ Test refresh functionality after changes
5. ✅ Consider implementing auto-refresh or push notifications

## Future Enhancements

### Short Term
- [ ] Add pull-to-refresh gesture
- [ ] Implement auto-refresh timer (30s)
- [ ] Add visual indicator for stale data (>5 min old)
- [ ] Show loading skeleton during refresh

### Medium Term
- [ ] Implement WebSocket for real-time updates
- [ ] Add push notifications for status changes
- [ ] Cache tracking credentials securely
- [ ] Add "Watch Application" feature

### Long Term
- [ ] Build notification system
- [ ] Add email notifications
- [ ] SMS notifications for critical updates
- [ ] In-app messaging system

## Support

### User Reports Issue
1. Ask for Reference ID
2. Run diagnostic script
3. Check database status
4. Verify API endpoint
5. Test refresh functionality
6. Check network logs

### Quick Fixes
```bash
# Restart backend
cd backend
npm run dev

# Clear app cache (user)
# Settings → Apps → Road Authority → Clear Cache

# Test API directly
curl http://localhost:5000/api/pln/track/PLN-2024-ABC123/12345
```

## Summary

The fix adds a **manual refresh button** and **last updated timestamp** to the PLN tracking screen. This allows users to easily check for status updates without re-entering their tracking details.

**Key Benefits:**
- ✅ Users can refresh with one tap
- ✅ Clear indication of data freshness
- ✅ No need to re-enter credentials
- ✅ Better user experience
- ✅ Solves the sync issue immediately

**Next Steps:**
1. Test the refresh functionality
2. Run diagnostic script to verify
3. Consider implementing auto-refresh
4. Plan for push notifications (optional)

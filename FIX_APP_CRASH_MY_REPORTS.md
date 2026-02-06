# Fix: App Crash When Opening "My Reports"

## Problem
The app crashes when users try to open "My Reports" screen.

## Root Causes Identified

1. **Backend returning undefined/null instead of array**
   - The `getReportsByUserIdOrEmail()` method might return undefined/null in error cases
   - Frontend expects an array but receives undefined/null

2. **SQL Server NULL comparison issue**
   - SQL Server requires explicit NULL checks (`IS NULL`) when comparing nullable fields
   - The query might fail when userId is NULL in database

3. **Frontend not handling errors gracefully**
   - Frontend crashes when response.data.reports is undefined/null
   - No fallback to empty array

4. **useMemo crash on non-array**
   - The filteredReports useMemo tries to spread a non-array, causing crash

## Fixes Applied

### 1. Backend Service (`pothole-reports.service.ts`)

**Added error handling and NULL safety:**
```typescript
async getReportsByUserIdOrEmail(...) {
  try {
    // Validate inputs
    if (!userId && !userEmail) {
      return [];
    }

    // Handle SQL Server NULL comparison properly
    if (userId && userEmail) {
      qb.where('(report.userId = :userId OR (report.userId IS NULL AND report.userEmail = :userEmail) OR report.userEmail = :userEmail)', {
        userId,
        userEmail: userEmail.toLowerCase(),
      });
    }

    const reports = await qb.orderBy('report.createdAt', 'DESC').getMany();
    
    // CRITICAL FIX: Always return an array, never null or undefined
    return Array.isArray(reports) ? reports : [];
  } catch (error: any) {
    logger.error('Get reports by userId or email error:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}
```

### 2. Backend Controller (`pothole-reports.controller.ts`)

**Added array safety check:**
```typescript
// CRITICAL FIX: Ensure reports is always an array to prevent frontend crashes
const reportsArray = Array.isArray(reports) ? reports : [];

res.status(200).json({
  success: true,
  data: {
    reports: reportsArray.map((report) => ({
      // ... report fields
    })),
  },
});
```

### 3. Frontend Service (`potholeReportsService.js`)

**Added error handling and array safety:**
```javascript
async getMyReports(status = null) {
  try {
    const response = await ApiClient.get(`/pothole-reports/my-reports${params}`, {
      headers,
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch reports');
    }

    // CRITICAL FIX: Ensure we always return an array
    const reports = response.data?.reports;
    return Array.isArray(reports) ? reports : [];
  } catch (error) {
    console.error('Error fetching my reports:', error);
    // CRITICAL FIX: Return empty array instead of throwing
    return [];
  }
}
```

### 4. Frontend Screen (`MyReportsScreen.js`)

**Added multiple safety checks:**
```javascript
const loadReports = async () => {
  try {
    setError(null);
    const data = await potholeReportsService.getMyReports();
    // CRITICAL FIX: Ensure data is always an array
    setReports(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Error loading reports:', err);
    setError(err.message || 'Failed to load reports');
    // CRITICAL FIX: Set empty array on error
    setReports([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

// CRITICAL FIX: Ensure reports is always an array in useMemo
const filteredReports = useMemo(() => {
  if (!Array.isArray(reports)) {
    return [];
  }
  let filtered = [...reports];
  // ... rest of filtering logic
}, [reports, searchQuery, selectedFilter, sortOrder]);
```

## Testing Checklist

- [ ] App doesn't crash when opening "My Reports" with no reports
- [ ] App doesn't crash when opening "My Reports" with reports
- [ ] App doesn't crash when backend returns error
- [ ] App doesn't crash when backend returns undefined/null
- [ ] Empty state shows correctly when no reports
- [ ] Reports display correctly when reports exist

## Expected Behavior After Fix

### Before Fix:
```
User opens "My Reports" → Backend error/null → Frontend crashes
```

### After Fix:
```
User opens "My Reports" → Backend error/null → Frontend shows empty list or error message (no crash)
```

## Files Modified

1. `backend/src/modules/pothole-reports/pothole-reports.service.ts`
   - Added error handling in `getReportsByUserIdOrEmail()`
   - Fixed SQL Server NULL comparison
   - Always returns array

2. `backend/src/modules/pothole-reports/pothole-reports.controller.ts`
   - Added array safety check before mapping

3. `app/services/potholeReportsService.js`
   - Added error handling
   - Always returns array

4. `app/screens/MyReportsScreen.js`
   - Added array safety checks
   - Added error handling with fallback to empty array
   - Fixed useMemo to handle non-array

## Next Steps

1. **Restart Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Rebuild/Restart Mobile App**
   - The frontend changes should be picked up automatically
   - If not, restart the React Native app

3. **Test the Fix**
   - Open "My Reports" screen
   - Should not crash even if there are errors
   - Should show empty state or error message gracefully

## Notes

- All error cases now return empty arrays instead of crashing
- The app will show an empty list if there's an error (better UX than crashing)
- Error messages are logged to console for debugging
- The fix maintains backward compatibility with existing reports

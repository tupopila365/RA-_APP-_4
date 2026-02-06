# Fix: userId NULL Issue - Users Cannot See Their Reports

## Problem
When logged-in users create pothole reports, the `userId` field was being set to `NULL` in the database. This prevented users from viewing their own reports because the system queries reports by `userId`.

**Root Cause:**
- Reports were being created with `userId = NULL` even when users were authenticated
- The `getReportsByUserId()` method couldn't find reports with `userId = NULL`
- Users couldn't see their reports even though they were logged in

## Solution Applied

### 1. Enhanced Report Creation (`pothole-reports.service.ts`)

**Added `resolveUserId()` helper method:**
- If `userId` is provided from JWT token, use it
- If `userId` is missing but `userEmail` exists, look up the user in `app_users` table
- This ensures `userId` is always set when a user is authenticated

**Code:**
```typescript
private async resolveUserId(userId?: number, userEmail?: string): Promise<number | null> {
  // If userId is already provided, use it
  if (userId !== undefined && userId !== null) {
    return userId;
  }

  // If userEmail is provided but userId is not, look up the user
  if (userEmail) {
    const userRepo = AppDataSource.getRepository(AppUser);
    const user = await userRepo.findOne({
      where: { email: userEmail.toLowerCase().trim() },
      select: ['id'],
    });

    if (user) {
      return user.id;
    }
  }

  return null;
}
```

### 2. Improved User ID Extraction (`pothole-reports.controller.ts`)

**Better parsing and logging:**
- Properly converts JWT `userId` string to number
- Adds validation to ensure valid number
- Adds logging to debug authentication issues

**Code:**
```typescript
let userId: number | undefined;
if (authReq.user?.userId) {
  const parsedUserId = parseInt(authReq.user.userId, 10);
  if (!isNaN(parsedUserId)) {
    userId = parsedUserId;
  } else {
    logger.warn(`Invalid userId in JWT token: ${authReq.user.userId}`);
  }
}
```

### 3. Enhanced Report Retrieval (`pothole-reports.service.ts`)

**Added `getReportsByUserIdOrEmail()` method:**
- Searches by both `userId` AND `userEmail`
- Handles transition period where some reports have `userId` and some only have `userEmail`
- Ensures users see ALL their reports regardless of which field is populated

**Code:**
```typescript
async getReportsByUserIdOrEmail(userId: number, userEmail: string, filters?: { status?: ReportStatus }): Promise<PotholeReport[]> {
  const qb = repo.createQueryBuilder('report');
  
  // Search by userId OR userEmail (handles both old and new reports)
  qb.where('(report.userId = :userId OR report.userEmail = :userEmail)', {
    userId,
    userEmail: userEmail.toLowerCase(),
  });
  
  // ... rest of query
}
```

### 4. Updated Controller to Use Combined Search (`pothole-reports.controller.ts`)

**Changed `getMyReports()` to use combined search:**
- When both `userId` and `userEmail` are available, uses `getReportsByUserIdOrEmail()`
- This ensures all reports are found, even if some have `userId = NULL`

### 5. Migration Script for Existing Data

**Created `backfill-pothole-reports-userid.js`:**
- Updates existing reports that have `userEmail` but `userId = NULL`
- Looks up users by email and sets their `userId`
- Handles cases where user email doesn't exist in `app_users` table

## How to Apply the Fix

### Step 1: Deploy Code Changes
The code changes are already applied. The system will now:
- Set `userId` when creating new reports (if user is authenticated)
- Look up `userId` from email if not provided in JWT
- Search by both `userId` and `userEmail` when retrieving reports

### Step 2: Run Migration for Existing Data
```bash
cd backend
node migrations/backfill-pothole-reports-userid.js
```

This will:
- Find all reports with `userEmail` but `userId = NULL`
- Look up the user by email
- Set `userId` for all matching reports

### Step 3: Verify Fix
1. Log in as a user
2. Create a new pothole report
3. Check database: `userId` should be set (not NULL)
4. View "My Reports" - should see all your reports

## Testing Checklist

- [ ] New reports created by logged-in users have `userId` set
- [ ] Logged-in users can see their reports in "My Reports"
- [ ] Reports created before the fix are backfilled with `userId`
- [ ] Reports without matching user email still work (device-based)
- [ ] Unauthenticated users can still create reports (deviceId fallback)

## Expected Behavior After Fix

### Before Fix:
```
User creates report → userId = NULL → User cannot see reports
```

### After Fix:
```
User creates report → userId resolved from JWT or email lookup → userId = 123 → User can see reports
```

## Files Modified

1. `backend/src/modules/pothole-reports/pothole-reports.service.ts`
   - Added `resolveUserId()` method
   - Added `getReportsByUserIdOrEmail()` method
   - Updated `createReport()` to use `resolveUserId()`

2. `backend/src/modules/pothole-reports/pothole-reports.controller.ts`
   - Improved `userId` extraction from JWT
   - Updated `getMyReports()` to use combined search
   - Added logging for debugging

3. `backend/migrations/backfill-pothole-reports-userid.js` (NEW)
   - Migration script to backfill existing reports

## Notes

- The fix maintains backward compatibility with device-based reports
- Reports without matching user email will remain with `userId = NULL` (device-based reports)
- The system now searches by both `userId` and `userEmail` to ensure all reports are found
- New reports will automatically have `userId` set when created by authenticated users

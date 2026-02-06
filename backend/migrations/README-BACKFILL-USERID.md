# Backfill userId for Pothole Reports

## Problem
Existing pothole reports have `userEmail` but `userId` is NULL. This prevents logged-in users from viewing their reports because the system looks up reports by `userId`.

## Solution
This migration script backfills the `userId` field for existing reports by looking up users in the `app_users` table based on their email address.

## How to Run

### Option 1: Using Node.js directly
```bash
cd backend
node migrations/backfill-pothole-reports-userid.js
```

### Option 2: Using npm script (if added to package.json)
```bash
cd backend
npm run migrate:backfill-userid
```

## What It Does

1. Finds all pothole reports where:
   - `userEmail` IS NOT NULL
   - `userId` IS NULL

2. For each report:
   - Looks up the user in `app_users` table by email
   - If user found: Updates the report's `userId` field
   - If user not found: Logs a warning (report remains with userId=NULL)

3. Provides a summary:
   - Number of reports successfully updated
   - Number of reports where user was not found
   - Number of errors encountered

## Expected Output

```
🔄 Starting userId backfill migration for pothole reports...
✅ Database connected
📊 Found 150 reports to update
✅ Updated report 1: userId=5 for email=user@example.com
✅ Updated report 2: userId=12 for email=another@example.com
⚠️  User not found for email: olduser@example.com (report 3)
...

📈 Migration Summary:
✅ Successfully updated: 145 reports
⚠️  Users not found: 5 reports
❌ Errors: 0 reports
📊 Total processed: 150 reports

✅ Migration completed successfully!
Users can now view their reports using userId.
```

## Notes

- Reports where the user email doesn't exist in `app_users` will remain with `userId=NULL`
- These reports can still be accessed via deviceId or email lookup (backward compatibility)
- New reports created after this fix will automatically have `userId` set

## After Running Migration

1. Test that logged-in users can now see their reports
2. Verify the `userId` column is populated in the database
3. Check logs for any warnings about users not found

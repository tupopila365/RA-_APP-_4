# Road Damage Severity - Admin Only Update

## Summary
Updated the road damage reporting system so that users can no longer select damage severity when submitting reports. Only administrators can now set the severity level through the admin panel.

## Changes Made

### 1. Mobile App (ReportPotholeScreen.js)
**Removed:**
- Severity selection UI (Step 2 - Damage Severity section with big buttons)
- `SEVERITY_OPTIONS` constant
- `severity` state variable
- `showMoreDetails` state variable (no longer needed)
- Severity from progress calculation (now 2 steps instead of 3)
- Severity from confirmation message
- Severity from report submission data

**Updated:**
- Changed "Step 2" from severity selection to "Additional Details (Optional)"
- Simplified the form to show additional details directly without expandable section
- Progress bar now calculates based on photo + location only (2 steps)

### 2. Backend Model (pothole-reports.model.ts)
**Updated:**
- Changed `severity` field from `required: true` to `required: false`
- Kept default value as `'medium'` for reports submitted without severity
- Added comment: "Not required - admins will set this"

### 3. Backend Service (pothole-reports.service.ts)
**Updated:**
- Changed `CreateReportDTO` interface to make `severity` optional (`severity?: Severity`)
- Added comment explaining severity is optional and will default to 'medium'
- Updated `updateReportStatus` method signature to accept optional `severity` parameter
- Added severity update logic in the `updateReportStatus` method

### 4. Backend Controller (pothole-reports.controller.ts)
**Updated:**
- Removed strict validation requiring severity on report creation
- Changed to optional validation: only validates severity format if provided
- Updated `createReport` to handle optional severity (uses undefined if not provided, which triggers model default)
- Updated `updateReportStatus` to accept and validate optional severity parameter
- Added severity to the response when updating report status

### 5. Admin Panel Service (potholeReports.service.ts)
**Updated:**
- Updated `updateReportStatus` function signature to accept optional `severity` parameter in updates object

### 6. Admin Panel UI (ReportDetail.tsx)
**Added:**
- New `severity` state variable initialized to 'medium'
- Severity dropdown selector in the Admin Actions section
- Severity is now loaded from report data when viewing a report
- Severity is included in the save/update operation

**UI Changes:**
- Added severity dropdown between "Assigned To" and "Admin Notes" fields
- Dropdown options:
  - Minor Damage (Small)
  - Moderate Damage (Medium)
  - Severe Damage (Dangerous)

## User Flow

### Mobile App Users
1. Take/select photo of road damage
2. Confirm or adjust location on map
3. Optionally add details (town, street, road name, notes)
4. Submit report
5. Severity is automatically set to "medium" by default

### Admin Users
1. View submitted reports in admin panel
2. Open report details
3. Review photo and location
4. Set appropriate severity level based on damage assessment
5. Update status, assign to team, add notes as needed
6. Save changes

## Benefits
- Reduces user friction - simpler reporting process
- Ensures consistent severity assessment by trained administrators
- Prevents users from over/under-reporting severity
- Maintains data quality through expert evaluation
- Faster report submission for users

## Technical Notes
- All existing reports retain their severity values
- New reports without severity default to "medium"
- Backend validates severity format if provided (small/medium/dangerous)
- Admin panel allows changing severity at any time
- Severity is included in all report responses and listings

## Testing Recommendations
1. Test mobile app report submission without severity
2. Verify default severity is set to "medium" in database
3. Test admin panel severity dropdown functionality
4. Verify severity updates are saved correctly
5. Test that existing reports display correctly
6. Verify API responses include severity field

## Files Modified
- `RA-_APP-_4/app/screens/ReportPotholeScreen.js`
- `RA-_APP-_4/backend/src/modules/pothole-reports/pothole-reports.model.ts`
- `RA-_APP-_4/backend/src/modules/pothole-reports/pothole-reports.service.ts`
- `RA-_APP-_4/backend/src/modules/pothole-reports/pothole-reports.controller.ts`
- `RA-_APP-_4/admin/src/services/potholeReports.service.ts`
- `RA-_APP-_4/admin/src/pages/PotholeReports/ReportDetail.tsx`

## Deployment Notes
- No database migration required (severity field already exists)
- Backward compatible with existing data
- No breaking changes to API endpoints
- Admin users should be notified of new severity management responsibility

# Pothole Report Severity - Admin-Only Implementation Complete

## Summary
Successfully implemented admin-only severity/risk level classification for pothole reports. Users can now submit reports without specifying severity, and admins can classify them as low, medium, or high risk.

## Changes Made

### Backend Changes

#### 1. Model (`pothole-reports.model.ts`)
- Changed severity type from `'small' | 'medium' | 'dangerous'` to `'low' | 'medium' | 'high'`
- Made severity field **optional** (`severity?: Severity`)
- Removed default value and required flag from schema
- Severity is now admin-only and not set on report creation

#### 2. Service (`pothole-reports.service.ts`)
- Removed severity from `CreateReportDTO` interface
- Added severity back to `ListReportsQuery` for filtering
- Added severity to `updateReportStatus` method parameters
- Reports are created without severity - admins set it later

#### 3. Controller (`pothole-reports.controller.ts`)
- Removed severity validation from report creation endpoint
- Added severity validation to update endpoint: `'low' | 'medium' | 'high'`
- Severity can only be set/updated by admins via status update endpoint
- All API responses include severity field (will be null/undefined until admin sets it)

### Admin Panel Changes

#### 1. Service Types (`potholeReports.service.ts`)
- Updated `PotholeReport` interface: `severity?: 'low' | 'medium' | 'high'`
- Updated `ListReportsParams` interface with new severity values
- Made severity optional in TypeScript types

#### 2. Reports List (`ReportsList.tsx`)
- Updated `SEVERITY_COLORS` to use `low`, `medium`, `high`
- Updated filter dropdown options to show "Low Risk", "Medium Risk", "High Risk"
- Added fallback display for reports without severity ("Not Set" chip)

#### 3. Report Detail (`ReportDetail.tsx`)
- Updated `SEVERITY_COLORS` to use `low`, `medium`, `high`
- Changed dropdown label from "Severity" to "Risk Level"
- Updated dropdown options to show "Low Risk", "Medium Risk", "High Risk"
- Added fallback display for reports without severity
- Admins can now set/update risk level when updating report status

## Severity Values

### Old Values (Removed)
- `small` - Minor damage
- `medium` - Moderate damage
- `dangerous` - Severe damage

### New Values (Admin-Only)
- `low` - Low risk to public safety
- `medium` - Medium risk to public safety
- `high` - High risk to public safety

## User Flow

1. **User submits report** (mobile app)
   - Provides: location, photo, road name, description
   - Does NOT provide severity/risk level

2. **Admin reviews report** (admin panel)
   - Views report details and photo
   - Assesses risk level based on photo and description
   - Sets risk level: Low, Medium, or High
   - Updates status and assigns to maintenance team

3. **User views their reports** (mobile app)
   - Can see admin-assigned risk level (if set)
   - Can track status updates

## API Endpoints

### Create Report (Public)
```
POST /api/pothole-reports
Body: { location, roadName, photo, description }
Note: severity is NOT accepted
```

### Update Report Status (Admin)
```
PUT /api/pothole-reports/:id/status
Body: { status, severity?, assignedTo?, adminNotes? }
Note: severity can be set/updated here
```

### List Reports (Admin)
```
GET /api/pothole-reports?severity=low|medium|high
Note: Can filter by severity
```

## Database

The severity field in MongoDB:
- Type: String
- Enum: ['low', 'medium', 'high']
- Required: false
- Default: none (undefined until admin sets it)

## Testing

To test the implementation:

1. **Create a report** (should work without severity)
2. **View report in admin panel** (severity should show "Not Set")
3. **Update report** and set risk level to "High Risk"
4. **Verify** the severity is saved and displayed correctly
5. **Filter reports** by severity in admin panel

## Notes

- Mobile app does NOT need any changes (already doesn't send severity)
- Existing reports in database may have old severity values - consider migration if needed
- Admin panel now clearly shows when severity hasn't been set yet
- Risk level is optional and can be set at any time by admins

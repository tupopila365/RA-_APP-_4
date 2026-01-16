# Road Damage Severity Update - Visual Guide

## Before vs After

### Mobile App - BEFORE
```
┌─────────────────────────────────────┐
│  Step 1 — Capture Photo             │
│  [Photo Upload Area]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Step 2 — Damage Severity           │
│  ┌───────────────────────────────┐  │
│  │ ● Minor Damage            ✓   │  │
│  ├───────────────────────────────┤  │
│  │ ● Moderate Damage             │  │
│  ├───────────────────────────────┤  │
│  │ ● Severe Damage               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ▼ Add More Details (Optional)      │
│  [Collapsed]                        │
└─────────────────────────────────────┘
```

### Mobile App - AFTER
```
┌─────────────────────────────────────┐
│  Step 1 — Capture Photo             │
│  [Photo Upload Area]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Step 2 — Additional Details        │
│  (Optional)                         │
│                                     │
│  Town / City: [____________]        │
│  Street Name: [____________]        │
│  Road Name:   [____________]        │
│  Notes:       [____________]        │
│               [____________]        │
└─────────────────────────────────────┘
```

### Admin Panel - BEFORE
```
┌─────────────────────────────────────┐
│  Admin Actions                      │
│                                     │
│  Status:      [Pending ▼]          │
│  Assigned To: [____________]        │
│  Admin Notes: [____________]        │
│               [____________]        │
│                                     │
│  [Save Changes]                     │
└─────────────────────────────────────┘
```

### Admin Panel - AFTER
```
┌─────────────────────────────────────┐
│  Admin Actions                      │
│                                     │
│  Status:      [Pending ▼]          │
│  Assigned To: [____________]        │
│  Severity:    [Medium ▼]           │  ← NEW!
│               • Minor Damage        │
│               • Moderate Damage     │
│               • Severe Damage       │
│  Admin Notes: [____________]        │
│               [____________]        │
│                                     │
│  [Save Changes]                     │
└─────────────────────────────────────┘
```

## Data Flow

### Report Submission (Mobile App)
```
User Action                Backend Processing
───────────                ──────────────────
1. Take Photo       ──────> Validate photo
2. Confirm Location ──────> Validate coordinates
3. Add Details      ──────> Optional fields
4. Submit           ──────> Create report
                            ├─ severity: undefined
                            └─ Model default: "medium"
                            
Database: { severity: "medium" }
```

### Severity Update (Admin Panel)
```
Admin Action               Backend Processing
────────────               ──────────────────
1. Open Report      ──────> Load report data
2. View Details     ──────> Display severity: "medium"
3. Change Severity  ──────> Validate: small/medium/dangerous
4. Save Changes     ──────> Update report
                            └─ severity: "dangerous"
                            
Database: { severity: "dangerous" }
```

## API Changes

### POST /api/pothole-reports
**Before:**
```json
{
  "location": { "latitude": -22.5, "longitude": 17.0 },
  "roadName": "Main Road",
  "severity": "medium",  ← REQUIRED
  "description": "Large pothole"
}
```

**After:**
```json
{
  "location": { "latitude": -22.5, "longitude": 17.0 },
  "roadName": "Main Road",
  // severity is OPTIONAL - defaults to "medium"
  "description": "Large pothole"
}
```

### PUT /api/pothole-reports/:id/status
**Before:**
```json
{
  "status": "assigned",
  "assignedTo": "Team A",
  "adminNotes": "Scheduled for repair"
}
```

**After:**
```json
{
  "status": "assigned",
  "assignedTo": "Team A",
  "adminNotes": "Scheduled for repair",
  "severity": "dangerous"  ← NEW! Optional
}
```

## Progress Indicator Changes

### Before (3 Steps)
```
Progress: 33%  [████░░░░░░░░] Photo captured
Progress: 66%  [████████░░░░] Location confirmed
Progress: 100% [████████████] Severity selected
```

### After (2 Steps)
```
Progress: 50%  [██████░░░░░░] Photo captured
Progress: 100% [████████████] Location confirmed
```

## User Experience Impact

### Mobile Users
- ✅ Faster report submission (1 less step)
- ✅ Less decision fatigue
- ✅ Simpler interface
- ✅ Focus on essential information (photo + location)

### Admin Users
- ✅ Professional severity assessment
- ✅ Consistent evaluation standards
- ✅ Better data quality
- ✅ Full control over damage classification

## Severity Levels Reference

| Level      | Label            | Color  | Use Case                          |
|------------|------------------|--------|-----------------------------------|
| small      | Minor Damage     | Gray   | Small cracks, minor wear          |
| medium     | Moderate Damage  | Orange | Noticeable potholes, rough surface|
| dangerous  | Severe Damage    | Red    | Large holes, safety hazard        |

**Default:** All new reports start as "medium" until admin reviews and adjusts.

# Admin Road Status Management Guide

## Quick Reference for Creating/Editing Road Status

### 🚨 Critical Rules

#### 1. Coordinate Requirements
**Namibia Bounds (STRICT):**
- Latitude: **-28 to -16**
- Longitude: **11 to 26**

❌ **If outside these ranges:**
- Error message will appear
- Cannot save the record
- Must verify location

#### 2. Status-Specific Rules

**For CLOSED or RESTRICTED roads:**
- ✅ GPS coordinates are **REQUIRED**
- ✅ Location **MUST be verified** before saving
- ✅ Use map or "Verify" button

**For PLANNED roads:**
- ⚠️ Cannot publish if start date is in the past
- ⚠️ Update start date or change status first

#### 3. Date Logic
- Start date ≤ Expected completion date
- System will reject invalid date ranges

### 📍 How to Add Location Coordinates

#### Method 1: Use the Map (RECOMMENDED)
1. Click **"Show Map"** button
2. Search for the location or zoom to area
3. Click on the exact location on the map
4. Coordinates auto-fill and location is **verified** ✅
5. Form fields may auto-populate (road, area, region)

#### Method 2: Manual Entry
1. Get coordinates from Google Maps:
   - Open [Google Maps](https://maps.google.com)
   - Right-click on location
   - Click coordinates to copy
2. Paste into Latitude and Longitude fields
3. Click **"Verify"** button
4. Wait for verification ✅

#### Method 3: Google Maps Link
1. Click the Google Maps link in the form
2. Find your location
3. Copy coordinates
4. Paste and verify

### ✅ Location Verification Status

**Green Badge: "Location Verified"**
- ✅ Coordinates are valid
- ✅ Location confirmed
- ✅ Can save the record

**Yellow Warning: "Location Not Verified"**
- ⚠️ For Closed/Restricted roads
- ⚠️ Must verify before saving
- ⚠️ Click "Verify" or use map

**Red Error: "Invalid Coordinates"**
- ❌ Coordinates outside Namibia
- ❌ Cannot save
- ❌ Check and correct coordinates

### 📝 Required Fields

**Always Required:**
- Road name
- Area/Town
- Region
- Title

**Required for Closed/Restricted:**
- GPS Coordinates (verified)

**Recommended:**
- Start date
- Expected completion
- Description
- Alternative route

### 🔍 Validation Messages

#### Common Errors and Solutions

**"Coordinates are outside Namibia"**
- ✅ Check latitude is between -28 and -16
- ✅ Check longitude is between 11 and 26
- ✅ Use map to select correct location

**"GPS coordinates are required for Closed roads"**
- ✅ Add coordinates using map or manual entry
- ✅ Verify the location

**"Please verify the location before saving"**
- ✅ Click "Verify" button
- ✅ Or use map to select location

**"Start date cannot be after expected completion"**
- ✅ Check your dates
- ✅ Start date must be before or equal to completion

**"Planned roadworks with past start date cannot be published"**
- ✅ Update start date to future
- ✅ Or change status to "Ongoing"
- ✅ Or uncheck "Published"

### 📊 Change History

**Every change is tracked:**
- Who created the record
- Who last edited it
- What changed (old value → new value)
- When it changed

**Tracked information:**
- Status changes
- Published state
- Dates
- Coordinates
- All field updates

**View history:**
- Available in roadwork details
- Shows complete audit trail
- Accountability for all changes

### 🎯 Best Practices

#### Creating New Roadwork
1. Fill in basic information (road, area, region)
2. Add title and description
3. Select status
4. **For Closed/Restricted:**
   - Click "Show Map"
   - Find and click location
   - Verify green "Location Verified" appears
5. Add dates and other details
6. Review all fields
7. Click "Create"

#### Updating Existing Roadwork
1. Make your changes
2. **If changing coordinates:**
   - Must re-verify location
   - Use map or "Verify" button
3. **If changing to Closed/Restricted:**
   - Add and verify coordinates
4. Review changes
5. Click "Update"

#### Publishing Roadwork
**Before publishing, ensure:**
- ✅ All required fields filled
- ✅ Coordinates added (recommended)
- ✅ Dates are correct
- ✅ Status is appropriate
- ✅ Information is accurate

### 🗺️ Map Features

**Map Selector includes:**
- Search box (search by place name)
- Click to select location
- Road detection (auto-detects road name)
- Area detection (auto-detects town/area)
- Region detection (auto-detects region)
- Zoom controls
- Satellite/Map view toggle

**Auto-fill from map:**
- Coordinates (verified)
- Road name (if detected)
- Area/Town (if detected)
- Region (if detected)
- Title suggestion

### 🔐 Data Quality Guarantees

**System ensures:**
- ✅ All coordinates within Namibia
- ✅ Critical roads have verified locations
- ✅ Dates follow logical rules
- ✅ Required fields are filled
- ✅ Complete audit trail
- ✅ Accountability for changes

### 📞 Support

**If you encounter issues:**
1. Check this guide first
2. Verify all required fields
3. Ensure coordinates are within Namibia
4. Verify location for critical statuses
5. Contact system administrator if problems persist

### 🎓 Training Tips

**For new admins:**
1. Start with "Planned" status (easier)
2. Practice using the map selector
3. Understand coordinate ranges
4. Learn verification process
5. Review change history to see tracking

**Common mistakes to avoid:**
- ❌ Forgetting to verify location for Closed roads
- ❌ Using coordinates outside Namibia
- ❌ Publishing planned jobs with past dates
- ❌ Invalid date ranges
- ❌ Missing required fields

### ✨ Tips for Efficiency

**Speed up data entry:**
1. Use map selector (auto-fills multiple fields)
2. Copy similar roadworks and modify
3. Use road name autocomplete
4. Use town/area autocomplete
5. Save frequently used contractors

**Quality checks:**
1. Always verify coordinates on map
2. Double-check dates
3. Review before publishing
4. Use descriptive titles
5. Add alternative routes when available

---

## Summary

**Remember the 3 V's:**
1. **Valid** - Coordinates within Namibia bounds
2. **Verified** - Location confirmed for critical roads
3. **Visible** - Complete information for public

**Every roadwork entry:**
- Must have valid coordinates (if provided)
- Must be verified (if Closed/Restricted)
- Is tracked with complete history
- Is validated by the system
- Ensures data quality

**Your responsibility:**
- Accurate information
- Verified locations
- Proper status selection
- Complete details
- Timely updates

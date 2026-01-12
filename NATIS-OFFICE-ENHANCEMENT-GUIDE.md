# NATIS Office Enhancement Guide

## Overview

This enhancement adds comprehensive NATIS office information including services, operating hours, holidays, and special schedules to help users know exactly what services are available at each office and when they can visit.

## ✨ New Features

### 🏢 Enhanced Office Information
- **Available Services**: List of NATIS services offered at each office
- **Operating Hours**: Separate hours for weekdays, weekends, and public holidays
- **Closed Days**: Regular days when the office is closed
- **Special Hours**: Holiday schedules and special operating hours

### 🛡️ Safe Coordinate Management
- **Auto-geocoding**: Automatically finds coordinates based on office name and address
- **Manual Entry**: Safe manual coordinate entry with validation
- **Verification**: Reverse geocoding to verify coordinate accuracy
- **Google Maps Integration**: Direct link to verify location on Google Maps

### 📱 Mobile App Enhancements
- **Service Tags**: Visual display of available services (first 3 + count)
- **Operating Hours**: Clear display of weekday/weekend hours
- **Closed Days**: Warning about regular closed days
- **Enhanced Search**: Search by services, office names, and regions

## 🚀 Quick Start

### 1. Backend Setup
The backend automatically supports the new fields. No additional setup required.

### 2. Admin Panel Usage

#### Creating a New NATIS Office
1. Navigate to **Locations** → **Add New Location**
2. Fill in **Basic Information**:
   - Office Name (e.g., "NATIS Windhoek Main Office")
   - Region (dropdown selection)
   - Full Address
   - Contact Number & Email

3. Set **Location Coordinates**:
   - Enter office details and wait for auto-geocoding
   - Or manually enter latitude/longitude
   - Click "Verify Coordinates" to confirm accuracy
   - Use "Open in Google Maps" to double-check location

4. Configure **Available Services**:
   - Select from predefined NATIS services
   - Multiple services can be selected
   - Services include: Vehicle Registration, Driver's License, etc.

5. Set **Operating Hours**:
   - **Weekdays**: Monday-Friday hours
   - **Weekends**: Saturday-Sunday hours (leave empty if closed)
   - **Public Holidays**: Special holiday hours (leave empty if closed)

6. Configure **Regular Closed Days**:
   - Check days when office is regularly closed
   - Common: Saturday, Sunday

7. Add **Special Hours & Holidays**:
   - Click "Add Special Day" for each holiday/special day
   - Set date, reason, and whether closed or special hours
   - Examples: Independence Day (closed), Christmas Eve (half day)

#### Safe Coordinate Picking
The system uses the same safe pattern as Roads Status:

1. **Auto-geocoding**: As you type office name, address, and region, the system automatically finds coordinates
2. **Manual Entry**: Enter coordinates manually if auto-geocoding fails
3. **Verification**: Click "Verify Coordinates" to reverse-geocode and confirm location
4. **Google Maps**: Use the Google Maps link to visually verify the location
5. **Validation**: System ensures coordinates are within Namibia bounds

### 3. Mobile App Display

The mobile app now shows enhanced office information:

#### Office Cards Display
- **Service Tags**: First 3 services + count of additional services
- **Operating Hours**: 
  - Mon-Fri: 08:00 - 17:00
  - Weekends: 08:00 - 12:00 (if open)
  - Closed: Sunday (if applicable)

#### Search Enhancement
Users can now search for:
- Office names
- Regions
- Available services (e.g., "Driver's License")

## 📋 Available NATIS Services

The system includes these predefined services:
- Vehicle Registration
- Driver's License Renewal
- Learner's License
- Professional Driving Permit (PDP)
- Vehicle License Renewal
- Roadworthy Certificate
- Clearance Certificate
- Duplicate Documents
- Change of Ownership
- Import/Export Permits
- Temporary Permits
- Fitness Certificate

## 🕒 Operating Hours Format

### Time Format
- Use 24-hour format: `HH:MM` (e.g., `08:00`, `17:30`)
- Leave empty if closed during that period

### Examples
```javascript
operatingHours: {
  weekdays: { open: "08:00", close: "17:00" },
  weekends: { open: "08:00", close: "12:00" },
  publicHolidays: { open: "", close: "" } // Closed on public holidays
}
```

### Closed Days
```javascript
closedDays: ["Saturday", "Sunday"]
```

### Special Hours
```javascript
specialHours: [
  {
    date: "2024-03-21",
    reason: "Independence Day",
    closed: true
  },
  {
    date: "2024-12-24", 
    reason: "Christmas Eve",
    closed: false,
    hours: { open: "08:00", close: "12:00" }
  }
]
```

## 🧪 Testing

Run the test script to verify functionality:

```bash
node test-natis-office-enhancement.js
```

This tests:
- Creating offices with enhanced data
- Retrieving and displaying office information
- Updating office services and hours
- Mobile app data format compatibility

## 🔧 Technical Details

### Database Schema
The Location model now includes:
- `services: [String]` - Array of available services
- `operatingHours: Object` - Structured hours for different day types
- `closedDays: [String]` - Array of regularly closed days
- `specialHours: [Object]` - Array of special dates with custom hours

### API Endpoints
All existing endpoints support the new fields:
- `GET /api/locations` - Lists offices with enhanced data
- `POST /api/locations` - Creates office with services and hours
- `PUT /api/locations/:id` - Updates office information
- `DELETE /api/locations/:id` - Removes office

### Mobile App Integration
The FindOfficesScreen automatically displays:
- Service tags (visual chips)
- Operating hours (formatted display)
- Closed days (warning text)
- Enhanced search functionality

## 🎯 Benefits

### For Users
- **Know Before You Go**: See exactly what services are available
- **Plan Your Visit**: Check operating hours and closed days
- **Avoid Wasted Trips**: See holiday schedules and special hours
- **Find Right Office**: Search by specific services needed

### For Administrators
- **Easy Management**: Intuitive admin interface for all office data
- **Safe Coordinates**: Auto-geocoding with manual override and verification
- **Flexible Hours**: Support for complex schedules and holidays
- **Comprehensive Data**: All office information in one place

### For Developers
- **Backward Compatible**: Existing functionality unchanged
- **Extensible**: Easy to add more services or hour types
- **Validated**: Strong validation for all data types
- **Mobile Ready**: Optimized display for mobile devices

## 🚨 Important Notes

1. **Coordinate Safety**: Always verify coordinates using the "Verify Coordinates" button
2. **Time Format**: Use 24-hour format (HH:MM) for all times
3. **Empty Hours**: Leave time fields empty to indicate "closed"
4. **Service Selection**: Choose from predefined services for consistency
5. **Special Hours**: Use for holidays, maintenance days, or special events

## 📞 Support

If you encounter issues:
1. Check that the backend server is running
2. Verify admin authentication
3. Run the test script to diagnose problems
4. Check browser console for any JavaScript errors
5. Ensure all required fields are filled correctly

The enhancement maintains full backward compatibility while adding powerful new features for better user experience and office management.
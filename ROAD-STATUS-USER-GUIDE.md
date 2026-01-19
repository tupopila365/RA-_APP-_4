# 🛣️ Road Status Feature - Complete User Guide

## Overview

The Road Status feature allows administrators to manage road conditions and allows app users to view real-time road status information, including closures, ongoing maintenance, and planned works.

---

## 📱 **FOR APP USERS (Mobile App)**

### How to Access Road Status

1. **Open the Roads Authority App**
2. **Navigate to "Road Status"** from the main menu
3. You'll see a list or map view of all published road status updates

### Viewing Road Status

#### **List View (Default)**
- Scroll through a list of all road status updates
- Each entry shows:
  - **Road name** and location
  - **Status badge** (color-coded)
  - **Title** and brief description
  - **Dates** (start date, expected completion)
  - **Region** and area

#### **Map View**
- Tap the **Map View** button to switch to map mode
- See road status markers on an interactive map
- **Color-coded markers:**
  - 🟢 **Green**: Open roads
  - 🟠 **Orange**: Ongoing work / Ongoing Maintenance
  - 🔵 **Blue**: Planned / Planned Works
  - 🔴 **Red**: Closed / Restricted roads
  - ✅ **Green**: Completed work

### Using Filters

#### **Search by Text**
- Type in the search box to find roads by:
  - Road name (e.g., "B1", "Independence Avenue")
  - Area/Town (e.g., "Windhoek", "Swakopmund")
  - Description keywords

#### **Filter by Status**
- Tap a status filter chip:
  - **Open** - Roads currently open
  - **Ongoing** - Active roadworks
  - **Planned** - Future roadworks
  - **Closed** - Road closures

#### **Filter by Region**
- Select a region from the dropdown:
  - Khomas, Erongo, Hardap, etc.
  - Shows only road status in that region

#### **Auto-Detection**
- The app can detect your location
- Automatically filters to show road status near you
- Tap the location icon to enable/disable

### Viewing Details

1. **Tap any road status entry** in the list
2. **Or tap a marker** on the map
3. See detailed information:
   - Full description
   - Exact location with coordinates
   - Dates and timeline
   - Alternative routes (if available)
   - Contractor information
   - Expected delays

### Route Planner Feature

#### **Plan Your Route**
1. Tap the **"Route Planner"** button
2. The map will switch to route planning mode
3. **Set Start Point:**
   - Tap "Set Start" button
   - Tap on the map where you want to start
   - Or use "My Location" if enabled
4. **Set End Point:**
   - Tap "Set End" button
   - Tap on the map where you want to go
5. **View Route:**
   - A route line appears on the map
   - Road status markers along your route are highlighted
   - See which roads are affected on your journey

#### **Navigate Your Route**
- Tap **"Navigate"** to open in Google Maps or Apple Maps
- Get turn-by-turn directions
- Avoid closed or restricted roads

### Alternative Routes

When a road is **Closed** or **Restricted**, you may see:
- **Alternative route suggestions**
- **Distance** and **estimated time** for each route
- **Vehicle type restrictions** (e.g., trucks only, passenger vehicles)
- **Recommended route** (highlighted in green)

### Saving Road Status

- **Bookmark** important road status updates
- Tap the **bookmark icon** on any entry
- Access saved roadworks from your saved list
- Get notified of updates to saved roadworks

### Sorting Options

Sort road status by:
- **Relevance** (default) - Most important first
- **Distance** - Closest to your location
- **Date** - Most recent first
- **Status** - Grouped by status type

### Refreshing Data

- **Pull down** on the list to refresh
- Get the latest road status updates
- See when data was last updated

---

## 🖥️ **FOR ADMINISTRATORS (Admin Panel)**

### Accessing Road Status Management

1. **Log in** to the admin panel
2. Navigate to **"Road Status"** from the sidebar menu
3. You'll see a list of all road status entries (published and unpublished)

### Creating a New Road Status Entry

#### **Step 1: Click "Add New"**
- Click the **"+"** or **"Add New"** button
- A form will open

#### **Step 2: Fill Required Information**

**Basic Information:**
- **Road Name** - Select from dropdown or type custom name
- **Section** (optional) - Specific section of the road
- **Area/Town** - Town or locality name
- **Region** - Select from dropdown (required)
- **Title** - Brief title describing the roadwork (required)
- **Description** - Detailed description (optional but recommended)

**Status Selection:**
- **Open** - Road is open and clear
- **Ongoing** - Active roadworks happening now
- **Ongoing Maintenance** - Maintenance work in progress
- **Planned** - Future roadworks
- **Planned Works** - Scheduled maintenance
- **Closed** - Road is completely closed
- **Restricted** - Road has restrictions (e.g., one lane, weight limits)
- **Completed** - Work is finished

**Dates:**
- **Start Date** - When work begins or began
- **Expected Completion** - When work is expected to finish
- **Completed At** - Actual completion date (for completed status)

**Additional Details:**
- **Affected Lanes** - Which lanes are affected
- **Contractor** - Company doing the work
- **Estimated Duration** - How long work will take
- **Priority** - Low, Medium, High, or Critical

#### **Step 3: Add Location (IMPORTANT)**

**For CLOSED or RESTRICTED roads, GPS coordinates are REQUIRED!**

**Method 1: Use Map (RECOMMENDED)**
1. Click **"Show Map"** button
2. Search for the location or zoom to the area
3. **Click on the exact location** on the map
4. Coordinates will auto-fill
5. Location will be **automatically verified** ✅
6. Road name, area, and region may auto-populate

**Method 2: Manual Entry**
1. Get coordinates from Google Maps:
   - Open Google Maps
   - Right-click on the location
   - Click coordinates to copy
2. Paste into **Latitude** and **Longitude** fields
3. Click **"Verify"** button
4. Wait for verification ✅

**Coordinate Requirements:**
- Must be within Namibia bounds:
  - Latitude: **-28 to -16**
  - Longitude: **11 to 26**
- Invalid coordinates will show an error

**Verification Status:**
- ✅ **Green "Location Verified"** - Good to go!
- ⚠️ **Yellow "Location Not Verified"** - Must verify for Closed/Restricted roads
- ❌ **Red "Invalid Coordinates"** - Outside Namibia, cannot save

#### **Step 4: Add Alternative Routes (Optional)**

For **Closed** or **Restricted** roads, you can add structured alternate routes:

1. Click **"Add Alternate Route"**
2. Fill in:
   - **Route Name** (e.g., "Via C28")
   - **Roads Used** - List of roads in the route
   - **Waypoints** - Add points along the route:
     - Click "Add Waypoint"
     - Use map to select waypoint location
     - Name the waypoint (e.g., "Kalkrand Junction")
   - **Vehicle Types** - Which vehicles can use this route
   - **Distance** (auto-calculated or manual)
   - **Estimated Time** (auto-calculated or manual)
   - **Mark as Recommended** - Check if this is the best route
3. **Approve** the route to make it visible to users

#### **Step 5: Publish or Save as Draft**

- **Published** - Visible to app users immediately
- **Unpublished** - Only visible to admins (draft mode)

**Important:** 
- You can save without publishing
- Only published entries appear in the mobile app
- You can publish/unpublish later

#### **Step 6: Click "Create"**

- Form validates all required fields
- Checks coordinate validity
- Verifies location (if required)
- Creates the entry

### Editing an Existing Road Status

1. **Find the entry** in the list
2. Click the **Edit icon** (pencil) on that row
3. Make your changes
4. **If changing coordinates:**
   - Must re-verify location
   - Use map or "Verify" button
5. Click **"Update"** to save changes

### Publishing/Unpublishing

**To Publish:**
1. Find the entry in the list
2. Toggle the **eye icon** (👁️) to publish
3. Entry becomes visible to app users

**To Unpublish:**
1. Find the published entry
2. Toggle the **eye-off icon** (👁️‍🗨️) to unpublish
3. Entry is hidden from app users but remains in admin panel

**Note:** 
- Cannot publish "Planned" roadworks with past start dates
- Update the start date or change status first

### Deleting a Road Status

1. Find the entry in the list
2. Click the **Delete icon** (trash)
3. Confirm deletion in the dialog
4. Entry is permanently removed

### Filtering and Searching (Admin Panel)

**Search:**
- Type in search box to find by:
  - Road name
  - Area/town
  - Title
  - Description

**Filters:**
- **Region** - Filter by region
- **Status** - Filter by status type
- **Date Range** - Filter by start/end dates
- **Published Only** - Show only published entries

**Pagination:**
- Use page controls at bottom
- Adjust items per page (10, 25, 50, 100)

### Viewing Details

- Click the **View icon** (eye) to see full details
- See complete information including:
  - All fields
  - Change history (who edited, when)
  - Alternate routes
  - Location on map

---

## 🎨 **Status Color Guide**

### For Users:
- 🟢 **Green** = Open / Completed (safe to travel)
- 🟠 **Orange** = Ongoing / Ongoing Maintenance (caution)
- 🔵 **Blue** = Planned / Planned Works (future)
- 🔴 **Red** = Closed / Restricted (avoid or use alternative)

### For Admins:
- Same color coding in the admin panel
- Priority colors:
  - **Gray** = Low priority
  - **Yellow** = Medium priority
  - **Orange** = High priority
  - **Red** = Critical priority

---

## ⚠️ **Common Issues & Solutions**

### For Users:

**"No road status found"**
- Try removing filters
- Check if you're searching in the correct region
- Pull down to refresh

**"Map not loading"**
- Check internet connection
- Ensure location permissions are granted
- Try switching to list view

**"Route planner not working"**
- Make sure you've set both start and end points
- Check that location services are enabled

### For Admins:

**"Cannot save - Invalid coordinates"**
- Check coordinates are within Namibia bounds
- Use the map selector instead of manual entry
- Verify location before saving

**"Cannot publish - Past start date"**
- Update start date to future date
- Or change status from "Planned" to "Ongoing"

**"Location not verified"**
- For Closed/Restricted roads, you MUST verify location
- Click "Verify" button or use map selector
- Green badge must appear before saving

**"Form won't submit"**
- Check all required fields are filled
- Ensure coordinates are valid (if provided)
- Verify location for Closed/Restricted roads
- Check date ranges are logical

---

## 💡 **Best Practices**

### For Users:
- ✅ Check road status before long trips
- ✅ Use route planner to avoid closures
- ✅ Save important road status updates
- ✅ Enable location for better filtering
- ✅ Refresh data regularly for updates

### For Admins:
- ✅ Always verify location for Closed/Restricted roads
- ✅ Use map selector for accurate coordinates
- ✅ Add detailed descriptions
- ✅ Include alternative routes when available
- ✅ Update status promptly (e.g., change "Ongoing" to "Completed")
- ✅ Set realistic completion dates
- ✅ Review before publishing
- ✅ Keep information up-to-date

---

## 📞 **Need Help?**

- **For App Users:** Check the app's help section or contact support
- **For Admins:** Refer to `ADMIN-ROAD-STATUS-GUIDE.md` for detailed technical information

---

## 🔄 **Quick Reference**

### User Actions:
- **View** → Tap entry or marker
- **Filter** → Use search, status, or region filters
- **Plan Route** → Use Route Planner feature
- **Get Directions** → Tap "Directions" button
- **Save** → Tap bookmark icon
- **Refresh** → Pull down on list

### Admin Actions:
- **Create** → Click "Add New" → Fill form → Click "Create"
- **Edit** → Click edit icon → Make changes → Click "Update"
- **Publish** → Toggle eye icon
- **Delete** → Click delete icon → Confirm
- **Add Location** → Use map selector or manual entry → Verify
- **Add Routes** → Click "Add Alternate Route" → Fill details → Approve

---

**Last Updated:** This guide covers the current implementation of the Road Status feature.





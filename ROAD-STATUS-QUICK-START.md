# 🛣️ Road Status - Quick Start Guide

## 📱 **MOBILE APP - Quick Access**

### How to Get There:
1. Open the **Roads Authority App**
2. From **Home Screen**, tap **"Road Status"** (blue icon with map)
3. Or navigate from menu → **"Road Status"**

### What You Can Do:

```
┌─────────────────────────────────────┐
│   ROAD STATUS SCREEN                │
├─────────────────────────────────────┤
│                                     │
│  [Search Box] 🔍                    │
│                                     │
│  Filters:                           │
│  [Open] [Ongoing] [Planned] [Closed]│
│                                     │
│  Region: [Select Region ▼]         │
│                                     │
│  View: [List] [Map] [Route Planner]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Road Status Entries         │   │
│  │ • B1 National Road          │   │
│  │   🟠 Ongoing               │   │
│  │   Windhoek → Okahandja     │   │
│  │   Expected: 2 weeks        │   │
│  │                             │   │
│  │ • C28 Road                 │   │
│  │   🔴 Closed                │   │
│  │   Alternative route via... │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Quick Actions:
- **Tap entry** → See full details
- **Tap marker on map** → View location & details
- **Use Route Planner** → Plan trip avoiding closures
- **Pull down** → Refresh latest updates
- **Bookmark** → Save important updates

---

## 🖥️ **ADMIN PANEL - Quick Access**

### How to Get There:
1. **Log in** to admin panel
2. Click **"Road Status"** in sidebar (requires `road-status:manage` permission)
3. You'll see the list of all road status entries

### Creating a New Entry:

```
┌─────────────────────────────────────┐
│   ROAD STATUS LIST                  │
├─────────────────────────────────────┤
│  [+ Add New]  [Search] [Filters]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Road Name | Status | Region │   │
│  │ B1        | Ongoing| Khomas │   │
│  │ C28       | Closed | Erongo │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         ↓ Click "Add New"
┌─────────────────────────────────────┐
│   CREATE ROAD STATUS FORM           │
├─────────────────────────────────────┤
│  Road Name: [Select or type]        │
│  Region: [Select ▼]                 │
│  Status: [Select ▼]                 │
│  Title: [Enter title]               │
│                                     │
│  📍 Location:                       │
│  [Show Map] or [Manual Entry]      │
│  Latitude: [____]                   │
│  Longitude: [____]                  │
│  [Verify] ✅ Location Verified       │
│                                     │
│  Dates:                             │
│  Start: [Date picker]               │
│  Completion: [Date picker]          │
│                                     │
│  ☑ Published (visible to users)    │
│                                     │
│  [Cancel]  [Create]                 │
└─────────────────────────────────────┘
```

### Quick Actions:
- **Add New** → Create new road status
- **Edit** (pencil icon) → Modify existing entry
- **Publish** (eye icon) → Make visible to users
- **Delete** (trash icon) → Remove entry
- **View** (eye icon) → See full details

---

## 🎯 **Common Workflows**

### User Workflow: "Is the B1 road open?"

1. Open app → Tap "Road Status"
2. Type "B1" in search box
3. See results → Tap entry
4. Read details → Check status (Open/Ongoing/Closed)
5. If closed → See alternative routes
6. Tap "Directions" → Open in maps app

### User Workflow: "Plan a trip avoiding closures"

1. Open app → Tap "Road Status"
2. Tap "Route Planner"
3. Tap "Set Start" → Tap on map
4. Tap "Set End" → Tap on map
5. See route with road status markers
6. Check which roads are affected
7. Tap "Navigate" → Get directions

### Admin Workflow: "Report a road closure"

1. Log in → Go to "Road Status"
2. Click "Add New"
3. Fill in:
   - Road: "B1 National Road"
   - Region: "Khomas"
   - Status: "Closed"
   - Title: "B1 Closed for Maintenance"
4. Click "Show Map" → Click location on map
5. Add alternative route (optional)
6. Check "Published"
7. Click "Create"
8. ✅ Users can now see the closure

### Admin Workflow: "Update ongoing work to completed"

1. Log in → Go to "Road Status"
2. Find entry with status "Ongoing"
3. Click Edit (pencil icon)
4. Change Status to "Completed"
5. Add "Completed At" date
6. Click "Update"
7. ✅ Status updated

---

## ⚡ **Status Meanings**

| Status | What It Means | User Action |
|--------|---------------|-------------|
| 🟢 **Open** | Road is clear, no issues | Safe to travel |
| 🟠 **Ongoing** | Work happening now | Expect delays, drive carefully |
| 🔵 **Planned** | Work scheduled for future | Plan ahead |
| 🔴 **Closed** | Road is closed | Use alternative route |
| 🔴 **Restricted** | Limited access (e.g., one lane) | Expect delays |
| ✅ **Completed** | Work finished | Road should be clear |

---

## 🔑 **Key Points**

### For Users:
- ✅ Only **published** entries are visible
- ✅ Use **Route Planner** to avoid closures
- ✅ **Refresh** regularly for updates
- ✅ **Bookmark** important updates
- ✅ Check before long trips

### For Admins:
- ✅ **Verify location** for Closed/Restricted roads
- ✅ **Publish** to make visible to users
- ✅ Use **map selector** for accurate coordinates
- ✅ Update status when work completes
- ✅ Add alternative routes when available

---

## 🆘 **Troubleshooting**

### User: "I don't see any road status"
- Check if filters are applied
- Try removing all filters
- Pull down to refresh
- Check internet connection

### User: "Map not showing"
- Grant location permissions
- Check internet connection
- Try switching to list view

### Admin: "Can't save - invalid coordinates"
- Coordinates must be within Namibia:
  - Latitude: -28 to -16
  - Longitude: 11 to 26
- Use map selector instead of manual entry

### Admin: "Can't publish"
- Check if all required fields are filled
- For "Planned" status, ensure start date is in future
- Verify location if status is Closed/Restricted

---

## 📚 **More Help**

- **Full User Guide:** See `ROAD-STATUS-USER-GUIDE.md`
- **Admin Technical Guide:** See `ADMIN-ROAD-STATUS-GUIDE.md`
- **Backend Schema:** See `ROAD_STATUS_BACKEND_SCHEMA.md`

---

**Quick Tip:** Bookmark this guide for easy reference! 📌



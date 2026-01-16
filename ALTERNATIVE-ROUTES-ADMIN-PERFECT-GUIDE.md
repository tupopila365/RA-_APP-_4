# 🛣️ Making Alternative Routes Work Perfect in Admin

## Current Status

The alternative routes feature is implemented with:
- ✅ Backend API endpoints for road closures with routes
- ✅ Admin form (RoadClosureForm.tsx) for managing routes
- ✅ Structured data models with waypoints, vehicle types, and approval workflow
- ⚠️ May need integration fixes and testing

## 🎯 Step-by-Step Guide to Perfect Implementation

### 1. Access the Road Closure Form

The alternative routes feature uses a dedicated form at:
```
http://localhost:3001/road-status/new-closure
```

**Important:** This is different from the regular road status form. The regular form (`/road-status/new`) only has a simple text field for alternative routes.

### 2. Verify Backend Routes Are Registered

Check that the backend routes are properly set up:

**File:** `backend/src/modules/roadworks/road-status.routes.ts`

The following routes should exist:
- `GET /api/road-status/road-closures/:id` - Get closure with routes
- `POST /api/road-status/road-closures` - Create new closure
- `PUT /api/road-status/road-closures/:id` - Update closure
- `PUT /api/road-status/:id/alternate-routes/:index/approve` - Approve route

### 3. Add Navigation Link to Road Closure Form

The admin interface needs a way to access the road closure form. Add a button to the road status list page.

**File:** `admin/src/pages/RoadStatus/RoadStatusList.tsx`

Add this button near the "Add New Roadwork" button:
```tsx
<Button
  variant="contained"
  color="secondary"
  startIcon={<RouteIcon />}
  onClick={() => navigate('/road-status/new-closure')}
>
  Create Road Closure with Routes
</Button>
```

### 4. Register the Route in Admin Router

**File:** `admin/src/App.tsx` or your router configuration

Add the route:
```tsx
import RoadClosureForm from './pages/RoadStatus/RoadClosureForm';

// In your routes:
<Route path="/road-status/new-closure" element={<RoadClosureForm />} />
<Route path="/road-status/edit-closure/:id" element={<RoadClosureForm />} />
```

### 5. Fix Common Issues

#### Issue 1: Map Integration for Coordinates

The form requires coordinates but doesn't have map integration. Add the MapLocationSelector:

```tsx
// In RoadClosureForm.tsx, add state for map
const [showMapForStart, setShowMapForStart] = useState(false);
const [showMapForEnd, setShowMapForEnd] = useState(false);
const [showMapForWaypoint, setShowMapForWaypoint] = useState<{routeIndex: number, waypointIndex: number} | null>(null);

// Add map selector buttons next to coordinate inputs
<Button
  size="small"
  startIcon={<MapIcon />}
  onClick={() => setShowMapForStart(true)}
>
  Select on Map
</Button>

// Add MapLocationSelector component
{showMapForStart && (
  <MapLocationSelector
    onLocationSelect={(location) => {
      setRoadClosure({
        ...roadClosure,
        startCoordinates: location.coordinates
      });
      setShowMapForStart(false);
    }}
    height="400px"
  />
)}
```

#### Issue 2: Coordinate Validation

Add Namibia bounds validation:

```tsx
const validateNamibiaCoordinates = (lat: number, lon: number): boolean => {
  const NAMIBIA_BOUNDS = {
    minLat: -28.97, maxLat: -16.96,
    minLon: 11.72, maxLon: 25.26
  };
  
  return lat >= NAMIBIA_BOUNDS.minLat && lat <= NAMIBIA_BOUNDS.maxLat &&
         lon >= NAMIBIA_BOUNDS.minLon && lon <= NAMIBIA_BOUNDS.maxLon;
};
```

#### Issue 3: Auto-calculate Distance and Time

The backend should auto-calculate these, but add client-side estimates:

```tsx
const calculateRouteMetrics = (waypoints: Array<{coordinates: {latitude: number, longitude: number}}>) => {
  if (waypoints.length < 2) return { distance: 0, time: '0 min' };
  
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const lat1 = waypoints[i].coordinates.latitude;
    const lon1 = waypoints[i].coordinates.longitude;
    const lat2 = waypoints[i + 1].coordinates.latitude;
    const lon2 = waypoints[i + 1].coordinates.longitude;
    
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    totalDistance += R * c;
  }
  
  const avgSpeed = 80; // km/h
  const timeHours = totalDistance / avgSpeed;
  const timeMinutes = Math.round(timeHours * 60);
  
  return {
    distance: Math.round(totalDistance),
    time: timeMinutes > 60 ? `${Math.floor(timeMinutes/60)}h ${timeMinutes%60}m` : `${timeMinutes}m`
  };
};
```

### 6. Testing Checklist

#### Test 1: Create a Simple Road Closure
1. Navigate to `/road-status/new-closure`
2. Fill in basic information:
   - Title: "B1 Road Closure - Okahandja to Otjiwarongo"
   - Region: "Khomas"
   - Description: "Emergency repairs"
3. Fill road closure details:
   - Road Code: "B1"
   - Start Town: "Okahandja"
   - End Town: "Otjiwarongo"
   - Start Coordinates: -21.9833, 16.9167 (Okahandja)
   - End Coordinates: -20.4667, 16.6500 (Otjiwarongo)
4. Click "Save"
5. Verify it appears in the road status list

#### Test 2: Add Alternative Routes
1. Edit the road closure created above
2. Click "Add Route"
3. Fill in route details:
   - Route Name: "Via Gross Barmen & Otavi"
   - Vehicle Types: Select "All"
   - Roads Used: Add "C28", "D1268"
4. Add waypoints:
   - Waypoint 1: "Gross Barmen" (-21.9500, 16.8000)
   - Waypoint 2: "Otavi" (-19.6500, 17.3333)
5. Mark as "Recommended Route"
6. Click "Save"
7. Verify the route is saved

#### Test 3: Multiple Routes with Different Vehicle Types
1. Add a second route:
   - Route Name: "Light Vehicles Only - Via Karibib"
   - Vehicle Types: "Light Vehicles"
   - Roads Used: "C33", "D1935"
   - Waypoints: Add Karibib coordinates
2. Add a third route:
   - Route Name: "Heavy Vehicle Route"
   - Vehicle Types: "Heavy Vehicles", "Trucks"
   - Roads Used: "C28"
   - Waypoints: Add industrial area waypoints
3. Save and verify all routes appear

#### Test 4: Approval Workflow
1. Edit a road closure with routes
2. Find a route with "Pending" status
3. Click "Approve Route"
4. Verify status changes to "Approved"
5. Check that approved routes show green chip

#### Test 5: Mobile App Display
1. Ensure the road closure is published
2. Open mobile app
3. Navigate to Road Status screen
4. Switch to Map view
5. Verify:
   - Red line shows closed road
   - Green line shows recommended route
   - Gray dashed lines show other routes
   - Waypoint markers appear
   - Tapping polylines shows route info

### 7. Common Problems and Solutions

#### Problem: "Cannot read property 'roadClosure' of undefined"
**Solution:** The backend might not be returning the structured data. Check:
```bash
# Test the endpoint directly
curl http://localhost:5000/api/road-status/road-closures/CLOSURE_ID
```

If it returns null or missing fields, run the migration:
```bash
cd backend
node migrations/add-alternate-routes-fields.js
```

#### Problem: Coordinates not saving
**Solution:** Ensure coordinates are numbers, not strings:
```tsx
// Wrong:
startCoordinates: { latitude: e.target.value, longitude: e.target.value }

// Correct:
startCoordinates: { latitude: parseFloat(e.target.value) || 0, longitude: parseFloat(e.target.value) || 0 }
```

#### Problem: Routes not showing on mobile map
**Solution:** Check that:
1. Road closure has `published: true`
2. Coordinates are within Namibia bounds
3. At least 2 waypoints exist per route
4. Backend is generating polylineCoordinates

#### Problem: "Permission denied" when saving
**Solution:** Ensure your admin user has the `roadworks:manage` permission:
```javascript
// Run this in MongoDB or via script
db.users.updateOne(
  { email: 'admin@example.com' },
  { $set: { permissions: ['roadworks:manage', 'roadworks:view'] } }
);
```

### 8. Quick Test Script

Create a test script to verify the API:

**File:** `test-road-closure-api.js`
```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TOKEN = 'YOUR_ADMIN_TOKEN'; // Get from login

async function testRoadClosureAPI() {
  try {
    // Create road closure
    const createResponse = await axios.post(
      `${API_URL}/road-status/road-closures`,
      {
        title: 'Test Road Closure',
        region: 'Khomas',
        description: 'Testing alternate routes',
        priority: 'high',
        published: true,
        roadClosure: {
          roadCode: 'B1',
          startTown: 'Okahandja',
          endTown: 'Otjiwarongo',
          startCoordinates: { latitude: -21.9833, longitude: 16.9167 },
          endCoordinates: { latitude: -20.4667, longitude: 16.6500 }
        },
        alternateRoutes: [
          {
            routeName: 'Via Gross Barmen',
            roadsUsed: ['C28'],
            waypoints: [
              { name: 'Gross Barmen', coordinates: { latitude: -21.9500, longitude: 16.8000 } },
              { name: 'Otavi', coordinates: { latitude: -19.6500, longitude: 17.3333 } }
            ],
            vehicleType: ['All'],
            isRecommended: true,
            approved: false
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }
    );

    console.log('✅ Road closure created:', createResponse.data);

    const closureId = createResponse.data.data.roadwork._id;

    // Get road closure
    const getResponse = await axios.get(
      `${API_URL}/road-status/road-closures/${closureId}`
    );

    console.log('✅ Road closure retrieved:', getResponse.data);

    // Approve route
    const approveResponse = await axios.put(
      `${API_URL}/road-status/${closureId}/alternate-routes/0/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }
    );

    console.log('✅ Route approved:', approveResponse.data);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRoadClosureAPI();
```

Run it:
```bash
node test-road-closure-api.js
```

### 9. Production Checklist

Before deploying to production:

- [ ] All coordinates validated within Namibia bounds
- [ ] At least one route marked as recommended
- [ ] All routes have minimum 2 waypoints
- [ ] Vehicle type restrictions are logical
- [ ] Distance and time calculations are accurate
- [ ] Approval workflow is tested
- [ ] Mobile app displays routes correctly
- [ ] Map polylines render smoothly
- [ ] External navigation links work
- [ ] Published/unpublished toggle works
- [ ] Edit mode loads existing data correctly
- [ ] Delete confirmation works
- [ ] Permissions are properly enforced

### 10. Next Steps for Enhancement

Once basic functionality works:

1. **Add Map Preview in Admin**
   - Show a preview map in the form
   - Display all routes with color coding
   - Allow dragging waypoints

2. **Import from GPX/KML**
   - Allow uploading route files
   - Auto-extract waypoints

3. **Route Validation**
   - Check if route overlaps with closed road
   - Warn if route is too long
   - Suggest nearby towns for waypoints

4. **Analytics**
   - Track which routes users select
   - Monitor route effectiveness
   - Collect user feedback

5. **Notifications**
   - Alert users when new routes are added
   - Notify when closures are updated
   - Send reminders before planned closures

## 🚀 Quick Start Commands

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start admin (in new terminal)
cd admin
npm start

# 3. Access road closure form
# Open browser: http://localhost:3001/road-status/new-closure

# 4. Test the API
node test-road-closure-api.js

# 5. Check mobile app
cd app
npm start
# Scan QR code and test Road Status > Map view
```

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify database has the correct schema
4. Test API endpoints with curl/Postman
5. Check that coordinates are within Namibia bounds
6. Ensure user has proper permissions

The alternative routes feature is powerful but requires careful setup. Follow this guide step by step, and you'll have a perfect implementation! 🎉

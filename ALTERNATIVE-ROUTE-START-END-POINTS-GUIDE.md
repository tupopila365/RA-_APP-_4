# 🛣️ Alternative Route with Start and End Points - Implementation Guide

## Overview

This guide explains how to enhance the existing RoadStatusForm to include start and end points for alternative routes, making it easier for users to understand where the alternative route begins and ends.

## Current State

The form currently has a simple text field for "Alternative Route" where admins can type a description like:
```
"Use B2 via Karibib, then rejoin B1 at Otjiwarongo"
```

## Enhanced Design

We'll add structured fields for:
1. **Alternative Route Start Point** - Where drivers should exit the closed road
2. **Alternative Route End Point** - Where drivers rejoin the main road
3. **Alternative Route Description** - Detailed directions

## Implementation Steps

### Step 1: Add State Variables

Add these new state variables to `RoadStatusForm.tsx` after the existing `alternativeRoute` state:

```typescript
// Alternative route enhanced fields
const [altRouteStartPoint, setAltRouteStartPoint] = useState('');
const [altRouteStartLat, setAltRouteStartLat] = useState('');
const [altRouteStartLon, setAltRouteStartLon] = useState('');
const [altRouteEndPoint, setAltRouteEndPoint] = useState('');
const [altRouteEndLat, setAltRouteEndLat] = useState('');
const [altRouteEndLon, setAltRouteEndLon] = useState('');
const [showAltRouteStartMap, setShowAltRouteStartMap] = useState(false);
const [showAltRouteEndMap, setShowAltRouteEndMap] = useState(false);
```

### Step 2: Update loadRoadwork Function

Add loading of the new fields when editing:

```typescript
const loadRoadwork = async (roadworkId: string) => {
  try {
    // ... existing code ...
    
    setAlternativeRoute(rw.alternativeRoute || '');
    
    // Load alternative route points if they exist
    if (rw.alternativeRoutePoints) {
      setAltRouteStartPoint(rw.alternativeRoutePoints.start?.name || '');
      setAltRouteStartLat(rw.alternativeRoutePoints.start?.latitude?.toString() || '');
      setAltRouteStartLon(rw.alternativeRoutePoints.start?.longitude?.toString() || '');
      setAltRouteEndPoint(rw.alternativeRoutePoints.end?.name || '');
      setAltRouteEndLat(rw.alternativeRoutePoints.end?.latitude?.toString() || '');
      setAltRouteEndLon(rw.alternativeRoutePoints.end?.longitude?.toString() || '');
    }
    
    // ... rest of existing code ...
  } catch (err: any) {
    // ... error handling ...
  }
};
```

### Step 3: Update handleSubmit Function

Include the new fields in the data being saved:

```typescript
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  // ... existing validation ...

  try {
    setSaving(true);
    setError(null);

    const data: RoadStatusCreateInput = {
      // ... existing fields ...
      alternativeRoute: alternativeRoute.trim() || undefined,
      
      // Add alternative route points if provided
      alternativeRoutePoints: (altRouteStartPoint || altRouteEndPoint) ? {
        start: altRouteStartPoint ? {
          name: altRouteStartPoint.trim(),
          latitude: altRouteStartLat ? parseFloat(altRouteStartLat) : undefined,
          longitude: altRouteStartLon ? parseFloat(altRouteStartLon) : undefined,
        } : undefined,
        end: altRouteEndPoint ? {
          name: altRouteEndPoint.trim(),
          latitude: altRouteEndLat ? parseFloat(altRouteEndLat) : undefined,
          longitude: altRouteEndLon ? parseFloat(altRouteEndLon) : undefined,
        } : undefined,
      } : undefined,
      
      // ... rest of existing fields ...
    };

    // ... rest of submit logic ...
  } catch (err: any) {
    // ... error handling ...
  }
};
```

### Step 4: Replace the Work Details Section

Replace the existing "Work Details" card with this enhanced version:

```typescript
{/* Work Details */}
<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Work Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contractor"
            value={contractor}
            onChange={(e) => setContractor(e.target.value)}
            placeholder="Contractor company name"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Affected Lanes"
            value={affectedLanes}
            onChange={(e) => setAffectedLanes(e.target.value)}
            placeholder="e.g., Both lanes, North-bound lane"
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>

{/* Alternative Route Section - ENHANCED */}
<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Alternative Route
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Provide clear directions for motorists to navigate around the roadwork or closure.
          Include start and end points with coordinates for map display.
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        {/* Alternative Route Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Route Description"
            value={alternativeRoute}
            onChange={(e) => setAlternativeRoute(e.target.value)}
            multiline
            rows={2}
            placeholder="e.g., Use B2 via Karibib, then rejoin B1 at Otjiwarongo"
            helperText="Describe the alternative route for motorists"
          />
        </Grid>

        {/* Start Point */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Start Point (Where to Exit)
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Start Point Name"
            value={altRouteStartPoint}
            onChange={(e) => setAltRouteStartPoint(e.target.value)}
            placeholder="e.g., Okahandja Junction"
            helperText="Where drivers should exit the main road"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Start Latitude"
            type="number"
            value={altRouteStartLat}
            onChange={(e) => setAltRouteStartLat(e.target.value)}
            placeholder="-21.9833"
            inputProps={{ step: 'any' }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Start Longitude"
            type="number"
            value={altRouteStartLon}
            onChange={(e) => setAltRouteStartLon(e.target.value)}
            placeholder="16.9167"
            inputProps={{ step: 'any' }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() => setShowAltRouteStartMap(!showAltRouteStartMap)}
            sx={{ height: '56px' }}
          >
            {showAltRouteStartMap ? 'Hide' : 'Map'}
          </Button>
        </Grid>

        {/* Start Point Map */}
        {showAltRouteStartMap && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Click on the map to select the start point
              </Typography>
              <MapLocationSelector
                onLocationSelect={(location) => {
                  setAltRouteStartLat(location.coordinates.latitude.toString());
                  setAltRouteStartLon(location.coordinates.longitude.toString());
                  if (location.address && !altRouteStartPoint) {
                    setAltRouteStartPoint(location.address);
                  }
                  setShowAltRouteStartMap(false);
                }}
                initialCoordinates={
                  altRouteStartLat && altRouteStartLon
                    ? { latitude: parseFloat(altRouteStartLat), longitude: parseFloat(altRouteStartLon) }
                    : undefined
                }
                height="400px"
                showSearch={true}
              />
            </Paper>
          </Grid>
        )}

        {/* End Point */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
            End Point (Where to Rejoin)
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="End Point Name"
            value={altRouteEndPoint}
            onChange={(e) => setAltRouteEndPoint(e.target.value)}
            placeholder="e.g., Otjiwarongo Junction"
            helperText="Where drivers rejoin the main road"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="End Latitude"
            type="number"
            value={altRouteEndLat}
            onChange={(e) => setAltRouteEndLat(e.target.value)}
            placeholder="-20.4667"
            inputProps={{ step: 'any' }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="End Longitude"
            type="number"
            value={altRouteEndLon}
            onChange={(e) => setAltRouteEndLon(e.target.value)}
            placeholder="16.6500"
            inputProps={{ step: 'any' }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() => setShowAltRouteEndMap(!showAltRouteEndMap)}
            sx={{ height: '56px' }}
          >
            {showAltRouteEndMap ? 'Hide' : 'Map'}
          </Button>
        </Grid>

        {/* End Point Map */}
        {showAltRouteEndMap && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Click on the map to select the end point
              </Typography>
              <MapLocationSelector
                onLocationSelect={(location) => {
                  setAltRouteEndLat(location.coordinates.latitude.toString());
                  setAltRouteEndLon(location.coordinates.longitude.toString());
                  if (location.address && !altRouteEndPoint) {
                    setAltRouteEndPoint(location.address);
                  }
                  setShowAltRouteEndMap(false);
                }}
                initialCoordinates={
                  altRouteEndLat && altRouteEndLon
                    ? { latitude: parseFloat(altRouteEndLat), longitude: parseFloat(altRouteEndLon) }
                    : undefined
                }
                height="400px"
                showSearch={true}
              />
            </Paper>
          </Grid>
        )}

        {/* Preview */}
        {(altRouteStartPoint || altRouteEndPoint) && (
          <Grid item xs={12}>
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <Typography variant="body2" fontWeight="bold">
                Alternative Route Summary
              </Typography>
              {altRouteStartPoint && (
                <Typography variant="caption" display="block">
                  📍 Start: {altRouteStartPoint}
                  {altRouteStartLat && altRouteStartLon && 
                    ` (${parseFloat(altRouteStartLat).toFixed(4)}, ${parseFloat(altRouteStartLon).toFixed(4)})`
                  }
                </Typography>
              )}
              {altRouteEndPoint && (
                <Typography variant="caption" display="block">
                  🏁 End: {altRouteEndPoint}
                  {altRouteEndLat && altRouteEndLon && 
                    ` (${parseFloat(altRouteEndLat).toFixed(4)}, ${parseFloat(altRouteEndLon).toFixed(4)})`
                  }
                </Typography>
              )}
              {alternativeRoute && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  📝 Route: {alternativeRoute}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </Grid>
    </CardContent>
  </Card>
</Grid>
```

### Step 5: Update Backend Model

Update the RoadStatus interface in `admin/src/services/roadStatus.service.ts`:

```typescript
export interface RoadStatus {
  // ... existing fields ...
  alternativeRoute?: string; // Legacy field
  alternativeRoutePoints?: {
    start?: {
      name: string;
      latitude?: number;
      longitude?: number;
    };
    end?: {
      name: string;
      latitude?: number;
      longitude?: number;
    };
  };
  // ... rest of fields ...
}
```

### Step 6: Update Backend Schema

Update the Mongoose schema in `backend/src/modules/roadworks/roadworks.model.ts`:

```typescript
const roadworkSchema = new Schema({
  // ... existing fields ...
  alternativeRoute: { type: String, trim: true, maxlength: 500 },
  alternativeRoutePoints: {
    start: {
      name: { type: String, trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    end: {
      name: { type: String, trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
  },
  // ... rest of fields ...
});
```

## Usage Example

### Creating a Road Closure with Alternative Route

1. **Fill Basic Information:**
   - Road: B1
   - Section: Okahandja to Otjiwarongo
   - Status: Closed

2. **Add Alternative Route:**
   - Description: "Use B2 via Karibib, then rejoin B1 at Otjiwarongo"
   - Start Point: "Okahandja Junction"
     - Latitude: -21.9833
     - Longitude: 16.9167
   - End Point: "Otjiwarongo Junction"
     - Latitude: -20.4667
     - Longitude: 16.6500

3. **Save** - The mobile app will now show:
   - A marker at the start point
   - A marker at the end point
   - The route description
   - Ability to navigate to either point

## Mobile App Integration

The mobile app (`app/screens/RoadStatusScreen.js`) can use these points to:

1. **Display Markers:**
   ```javascript
   {roadwork.alternativeRoutePoints?.start && (
     <Marker
       coordinate={{
         latitude: roadwork.alternativeRoutePoints.start.latitude,
         longitude: roadwork.alternativeRoutePoints.start.longitude,
       }}
       title="Alternative Route Start"
       description={roadwork.alternativeRoutePoints.start.name}
       pinColor="green"
     />
   )}
   ```

2. **Show Route Info:**
   ```javascript
   <View style={styles.alternativeRouteCard}>
     <Text style={styles.cardTitle}>Alternative Route</Text>
     {roadwork.alternativeRoutePoints?.start && (
       <Text>📍 Start: {roadwork.alternativeRoutePoints.start.name}</Text>
     )}
     {roadwork.alternativeRoutePoints?.end && (
       <Text>🏁 End: {roadwork.alternativeRoutePoints.end.name}</Text>
     )}
     <Text>{roadwork.alternativeRoute}</Text>
   </View>
   ```

3. **Navigation Buttons:**
   ```javascript
   <Button
     title="Navigate to Start Point"
     onPress={() => openMaps(
       roadwork.alternativeRoutePoints.start.latitude,
       roadwork.alternativeRoutePoints.start.longitude
     )}
   />
   ```

## Benefits

1. **Clear Visual Guidance** - Users see exactly where to exit and rejoin
2. **Map Integration** - Points appear as markers on the map
3. **Navigation Support** - Users can navigate directly to start/end points
4. **Better UX** - Structured data is easier to understand than text
5. **Backward Compatible** - Still supports the text description field

## Testing

### Test Case 1: Simple Alternative Route
- Start: Okahandja (-21.9833, 16.9167)
- End: Otjiwarongo (-20.4667, 16.6500)
- Description: "Use B2 via Karibib"

### Test Case 2: Urban Detour
- Start: Independence Avenue & Sam Nujoma (-22.5609, 17.0658)
- End: Robert Mugabe Avenue (-22.5700, 17.0800)
- Description: "Turn left on Mandume Ndemufayo, right on Robert Mugabe"

### Test Case 3: No Coordinates
- Start: "Okahandja Junction" (no coordinates)
- End: "Otjiwarongo Junction" (no coordinates)
- Description: "Follow B2 signs"
- Should still save and display text only

## Migration

For existing data with only text descriptions:

```javascript
// Migration script
db.roadworks.find({ alternativeRoute: { $exists: true, $ne: '' } }).forEach(rw => {
  // Parse text to extract potential start/end points
  // This is optional - existing data continues to work
  console.log(`Roadwork ${rw._id}: ${rw.alternativeRoute}`);
});
```

## Summary

This enhancement adds structured start and end points to alternative routes while maintaining backward compatibility with the existing text field. The implementation is straightforward and provides significant UX improvements for both admins and mobile users.

**Key Files to Modify:**
1. `admin/src/pages/RoadStatus/RoadStatusForm.tsx` - Add UI fields
2. `admin/src/services/roadStatus.service.ts` - Update TypeScript interface
3. `backend/src/modules/roadworks/roadworks.model.ts` - Update Mongoose schema
4. `app/screens/RoadStatusScreen.js` - Display markers and info

**Estimated Time:** 2-3 hours for full implementation and testing

# Mobile App Integration Guide
## Road Status Map Rendering & Search

This guide documents the required changes to the mobile app (`RA-_APP-_4/app/screens/RoadStatusScreen.js`) to ensure reliable map rendering and search functionality.

---

## 🗺️ **Map Rendering Logic (Priority-Based)**

### **Current Problem**
The app currently uses fallback geocoding which can fail, resulting in missing map pins.

### **Solution: Priority-Based Rendering**

Update the `getRoadworkCoordinates` function to use a priority-based approach:

```javascript
/**
 * Get coordinates for roadwork with priority-based fallback
 * Priority:
 *   1. Direct coordinates from database (most reliable)
 *   2. GeoJSON location field (if available)
 *   3. Geocoding as last resort
 */
const getRoadworkCoordinates = (roadwork) => {
  // PRIORITY 1: Direct coordinates (from admin or geocoding)
  if (roadwork.coordinates?.latitude && roadwork.coordinates?.longitude) {
    return {
      latitude: roadwork.coordinates.latitude,
      longitude: roadwork.coordinates.longitude,
      source: 'direct', // For debugging
    };
  }
  
  // PRIORITY 2: GeoJSON location field
  if (roadwork.location?.coordinates && Array.isArray(roadwork.location.coordinates)) {
    return {
      latitude: roadwork.location.coordinates[1], // GeoJSON is [lon, lat]
      longitude: roadwork.location.coordinates[0],
      source: 'geojson',
    };
  }
  
  // PRIORITY 3: Legacy location field (backwards compatibility)
  if (roadwork.location?.latitude && roadwork.location?.longitude) {
    return {
      latitude: roadwork.location.latitude,
      longitude: roadwork.location.longitude,
      source: 'legacy',
    };
  }
  
  // No coordinates available - will need geocoding fallback
  return null;
};
```

---

## 🔍 **Enhanced Geocoding Fallback**

Update the `geocodeRoadworkLocation` function to use the new `searchText` field:

```javascript
/**
 * Geocode roadwork location using optimized search text
 * Uses pre-built searchText from backend if available
 */
const geocodeRoadworkLocation = async (roadwork) => {
  try {
    let searchQuery;
    
    // PREFERRED: Use pre-built searchText from backend
    if (roadwork.searchText) {
      searchQuery = roadwork.searchText;
    } else {
      // FALLBACK: Build search query manually
      searchQuery = [
        roadwork.road,
        roadwork.section,
        roadwork.area,
        roadwork.region,
        'Namibia'
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    }
    
    if (!searchQuery || searchQuery === 'Namibia') {
      return null;
    }
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Roads-Authority-App/1.0',
        },
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        source: 'geocoded',
      };
    }
  } catch (error) {
    console.warn('Geocoding failed:', error);
  }
  
  return null;
};
```

---

## 📍 **Map Marker Rendering with Error Handling**

Update the map marker rendering to handle missing coordinates gracefully:

```javascript
// In the MapView component
{filteredRoadworks.map((roadwork) => {
  const coords = getRoadworkCoordinates(roadwork);
  
  // Skip rendering if no coordinates available
  if (!coords) {
    console.warn(`No coordinates for roadwork: ${roadwork.road} in ${roadwork.area}`);
    return null;
  }
  
  return (
    <Marker
      key={roadwork._id}
      coordinate={{
        latitude: coords.latitude,
        longitude: coords.longitude,
      }}
      title={roadwork.road}
      description={roadwork.title}
    >
      {/* Custom marker based on status */}
      <View style={styles.customMarker}>
        <View
          style={[
            styles.markerInner,
            { backgroundColor: getStatusColor(roadwork.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(roadwork.status)}
            size={16}
            color="white"
          />
        </View>
      </View>
    </Marker>
  );
})}

{/* Show warning if some roadworks couldn't be mapped */}
{filteredRoadworks.some(rw => !getRoadworkCoordinates(rw)) && (
  <View style={styles.mapWarning}>
    <Ionicons name="warning" size={16} color={colors.warning} />
    <Text style={styles.mapWarningText}>
      Some roadworks don't have location data and aren't shown on the map
    </Text>
  </View>
)}
```

---

## 🔎 **Enhanced Search Logic**

Update the search functionality to search across multiple fields:

```javascript
const [searchQuery, setSearchQuery] = useState('');

// Enhanced search that checks multiple fields
const filteredRoadworks = useMemo(() => {
  if (!searchQuery || searchQuery.trim() === '') {
    return applyOtherFilters(roadworks); // Apply status, region filters
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return roadworks.filter((roadwork) => {
    // Search across multiple fields
    const searchableText = [
      roadwork.road,
      roadwork.roadCode,
      roadwork.section,
      roadwork.area,
      roadwork.region,
      roadwork.title,
      roadwork.description,
      roadwork.searchText, // Pre-built search text from backend
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    
    return searchableText.includes(query);
  });
}, [searchQuery, roadworks]);

// Search component
<SearchInput
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search by road, area, or region..."
  suggestions={[]} // Could add autocomplete suggestions
  onSuggestionSelect={(suggestion) => setSearchQuery(suggestion)}
/>
```

---

## 🎯 **Search by Road Code**

Add quick filter buttons for common road types:

```javascript
const [selectedRoadType, setSelectedRoadType] = useState(null);

const ROAD_TYPE_FILTERS = [
  { label: 'B-Roads', value: 'National', icon: 'speedometer' },
  { label: 'C-Roads', value: 'Main', icon: 'map' },
  { label: 'Urban', value: 'Urban', icon: 'business' },
];

// Filter by road type
<View style={styles.roadTypeFilters}>
  {ROAD_TYPE_FILTERS.map((filter) => (
    <TouchableOpacity
      key={filter.value}
      style={[
        styles.roadTypeChip,
        selectedRoadType === filter.value && styles.roadTypeChipActive,
      ]}
      onPress={() =>
        setSelectedRoadType(
          selectedRoadType === filter.value ? null : filter.value
        )
      }
    >
      <Ionicons
        name={filter.icon}
        size={16}
        color={
          selectedRoadType === filter.value ? colors.primary : colors.textSecondary
        }
      />
      <Text
        style={[
          styles.roadTypeChipText,
          selectedRoadType === filter.value && styles.roadTypeChipTextActive,
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  ))}
</View>

// Apply road type filter
const filteredByType = selectedRoadType
  ? roadworks.filter((rw) => rw.roadType === selectedRoadType)
  : roadworks;
```

---

## 📱 **"Near Me" Feature**

Add a feature to show roadworks near user's location:

```javascript
const [userLocation, setUserLocation] = useState(null);
const [nearbyRoadworks, setNearbyRoadworks] = useState([]);

const findNearbyRoadworks = useCallback(async () => {
  if (!userLocation) return;
  
  try {
    // Request nearby roadworks from backend
    const response = await fetch(
      `${API_BASE_URL}/road-status/nearby?` +
      `latitude=${userLocation.latitude}&` +
      `longitude=${userLocation.longitude}&` +
      `radius=50` // 50 km radius
    );
    
    const data = await response.json();
    
    if (data.success) {
      setNearbyRoadworks(data.data.roadworks);
    }
  } catch (error) {
    console.error('Failed to fetch nearby roadworks:', error);
  }
}, [userLocation]);

// Button to show nearby
<TouchableOpacity
  style={styles.nearMeButton}
  onPress={findNearbyRoadworks}
  disabled={!userLocation}
>
  <Ionicons name="navigate-circle" size={20} color="white" />
  <Text style={styles.nearMeButtonText}>Near Me</Text>
</TouchableOpacity>
```

---

## ⚡ **Performance Optimizations**

### **1. Memoize Expensive Operations**

```javascript
// Memoize coordinate lookups
const roadworkCoordinatesMap = useMemo(() => {
  const map = new Map();
  roadworks.forEach((rw) => {
    const coords = getRoadworkCoordinates(rw);
    if (coords) {
      map.set(rw._id, coords);
    }
  });
  return map;
}, [roadworks]);

// Use memoized map
const coords = roadworkCoordinatesMap.get(roadwork._id);
```

### **2. Limit Geocoding Requests**

```javascript
// Only geocode visible roadworks (in map viewport)
const [mapBounds, setMapBounds] = useState(null);

const visibleRoadworks = useMemo(() => {
  if (!mapBounds) return filteredRoadworks;
  
  return filteredRoadworks.filter((rw) => {
    const coords = getRoadworkCoordinates(rw);
    if (!coords) return false;
    
    return (
      coords.latitude >= mapBounds.southWest.latitude &&
      coords.latitude <= mapBounds.northEast.latitude &&
      coords.longitude >= mapBounds.southWest.longitude &&
      coords.longitude <= mapBounds.northEast.longitude
    );
  });
}, [filteredRoadworks, mapBounds]);
```

---

## 🐛 **Debug Panel (Development Only)**

Add a debug panel to help identify missing coordinates:

```javascript
{__DEV__ && (
  <View style={styles.debugPanel}>
    <Text style={styles.debugText}>
      Total roadworks: {roadworks.length}
    </Text>
    <Text style={styles.debugText}>
      With coordinates: {roadworks.filter(rw => getRoadworkCoordinates(rw)).length}
    </Text>
    <Text style={styles.debugText}>
      Missing coordinates: {roadworks.filter(rw => !getRoadworkCoordinates(rw)).length}
    </Text>
    {roadworks
      .filter(rw => !getRoadworkCoordinates(rw))
      .slice(0, 3)
      .map((rw) => (
        <Text key={rw._id} style={styles.debugTextSmall}>
          ⚠️ {rw.road} in {rw.area}
        </Text>
      ))}
  </View>
)}
```

---

## ✅ **Testing Checklist**

Before deploying, verify:

- [ ] All published roadworks appear on the map
- [ ] Search finds roadworks by road name (e.g., "B1")
- [ ] Search finds roadworks by road code (e.g., "B1")
- [ ] Search finds roadworks by town (e.g., "Windhoek")
- [ ] Search finds roadworks by region (e.g., "Khomas")
- [ ] Critical roads (Closed/Restricted) have coordinates
- [ ] Map loads quickly even with many roadworks
- [ ] No console errors about missing coordinates
- [ ] Tapping a marker shows correct information
- [ ] "Near Me" feature works if implemented

---

## 🚀 **Summary of Changes**

### **Required Updates:**

1. **Update `getRoadworkCoordinates`** to use priority-based coordinate lookup
2. **Update `geocodeRoadworkLocation`** to use `searchText` field
3. **Add error handling** for roadworks without coordinates
4. **Enhance search** to check `roadCode`, `roadType`, and `searchText`
5. **Add visual feedback** for missing location data

### **Optional Enhancements:**

6. Add "Near Me" feature using geospatial queries
7. Add road type quick filters (B-roads, C-roads, etc.)
8. Add performance optimizations for large datasets
9. Add debug panel for development

---

## 📝 **Next Steps**

1. Implement the map rendering priority logic
2. Update the search to use new backend fields
3. Test with production data
4. Monitor for roadworks without coordinates
5. Work with backend team to geocode any missing locations

**With these changes, the mobile app will reliably display all roadworks and provide excellent search functionality!** 🎉












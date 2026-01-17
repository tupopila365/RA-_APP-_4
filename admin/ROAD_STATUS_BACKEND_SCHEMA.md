# Road Status Backend Data Model

## 📋 **Required Database Schema**

This document defines the production-ready database schema for the Road Status system that ensures:
- Reliable geocoding
- Accurate map rendering
- Efficient search
- Data quality enforcement

---

## 🗄️ **MongoDB Schema (Recommended)**

```javascript
const RoadStatusSchema = new mongoose.Schema(
  {
    // === REQUIRED FIELDS ===
    
    // Road Identification
    road: {
      type: String,
      required: true,
      trim: true,
      index: true, // Indexed for search performance
      // Examples: "B1 National Road", "Independence Avenue"
    },
    
    roadCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
      // Examples: "B1", "C28", "IND-AVE"
      // Extracted from road name or provided separately
    },
    
    roadType: {
      type: String,
      enum: ['National', 'Main', 'District', 'Urban', 'Other'],
      default: 'Other',
      index: true,
    },
    
    // Location (REQUIRED)
    area: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // Town or locality name
      // Examples: "Windhoek", "Swakopmund", "Kalkrand"
    },
    
    region: {
      type: String,
      required: true,
      enum: [
        'Erongo', 'Hardap', 'ǁKaras', 'Kavango East', 'Kavango West',
        'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati',
        'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'
      ],
      index: true,
    },
    
    // Roadwork Details
    status: {
      type: String,
      required: true,
      enum: [
        'Open',
        'Ongoing',
        'Ongoing Maintenance',
        'Planned',
        'Planned Works',
        'Closed',
        'Restricted',
        'Completed'
      ],
      index: true,
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
      // Brief description
    },
    
    // === OPTIONAL FIELDS ===
    
    section: {
      type: String,
      trim: true,
      // Examples: "Section 5", "KM 125-135"
    },
    
    description: {
      type: String,
      trim: true,
    },
    
    // GPS Coordinates
    coordinates: {
      latitude: {
        type: Number,
        min: -30,  // Namibia southern bound
        max: -16,  // Namibia northern bound
        // Required if status is 'Closed' or 'Restricted'
      },
      longitude: {
        type: Number,
        min: 10,   // Namibia western bound
        max: 27,   // Namibia eastern bound
        // Required if status is 'Closed' or 'Restricted'
      },
    },
    
    // For GeoJSON queries (recommended for spatial operations)
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    
    // Timeline
    startDate: {
      type: Date,
    },
    
    expectedCompletion: {
      type: Date,
    },
    
    completedAt: {
      type: Date,
    },
    
    // Work Details
    alternativeRoute: {
      type: String,
      trim: true,
    },
    
    affectedLanes: {
      type: String,
      trim: true,
    },
    
    contractor: {
      type: String,
      trim: true,
    },
    
    estimatedDuration: {
      type: String,
      trim: true,
    },
    
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    
    // === COMPUTED/SEARCH FIELDS ===
    
    // Pre-built search text for efficient full-text search
    searchText: {
      type: String,
      trim: true,
      lowercase: true,
      index: 'text', // Text index for search
      // Auto-generated from: road + section + area + region + Namibia
      // Example: "b1 national road section 5 windhoek khomas namibia"
    },
    
    // Geocoding metadata
    geocoded: {
      type: Boolean,
      default: false,
      // True if coordinates were obtained via geocoding
    },
    
    geocodedDisplayName: {
      type: String,
      // Display name from geocoding service
    },
    
    // === ADMIN METADATA ===
    
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// === INDEXES FOR PERFORMANCE ===
RoadStatusSchema.index({ road: 1, area: 1 });
RoadStatusSchema.index({ status: 1, published: 1 });
RoadStatusSchema.index({ region: 1, published: 1 });
RoadStatusSchema.index({ coordinates: '2dsphere' }); // Geospatial queries

// === PRE-SAVE MIDDLEWARE ===
RoadStatusSchema.pre('save', function (next) {
  // 1. Build search text
  this.searchText = [
    this.road,
    this.roadCode,
    this.section,
    this.area,
    this.region,
    'Namibia',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  
  // 2. Extract road code if not provided
  if (!this.roadCode && this.road) {
    const codeMatch = this.road.match(/([BCD]\d+)/i);
    if (codeMatch) {
      this.roadCode = codeMatch[1].toUpperCase();
    }
  }
  
  // 3. Set GeoJSON location from coordinates
  if (this.coordinates?.latitude && this.coordinates?.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.coordinates.longitude, this.coordinates.latitude],
    };
  }
  
  next();
});

module.exports = mongoose.model('RoadStatus', RoadStatusSchema);
```

---

## ✅ **Validation Rules (Backend)**

Implement these validations in your API endpoints:

### **1. Pre-Save Validation**

```javascript
async function validateRoadStatus(data) {
  const errors = [];
  
  // Required fields
  if (!data.road || !data.road.trim()) {
    errors.push('Road name is required');
  }
  
  if (!data.area || !data.area.trim()) {
    errors.push('Area/Town is required');
  }
  
  if (!data.region) {
    errors.push('Region is required');
  }
  
  if (!data.title || !data.title.trim()) {
    errors.push('Title is required');
  }
  
  // Critical status validation
  const criticalStatuses = ['Closed', 'Restricted'];
  if (criticalStatuses.includes(data.status)) {
    if (!data.coordinates?.latitude || !data.coordinates?.longitude) {
      errors.push('GPS coordinates are required for Closed/Restricted roads');
    }
  }
  
  // Coordinate validation
  if (data.coordinates?.latitude || data.coordinates?.longitude) {
    const lat = data.coordinates.latitude;
    const lon = data.coordinates.longitude;
    
    if (lat < -30 || lat > -16) {
      errors.push('Latitude is outside Namibia bounds');
    }
    
    if (lon < 10 || lon > 27) {
      errors.push('Longitude is outside Namibia bounds');
    }
  }
  
  // Geocoding fallback validation
  if (!data.coordinates?.latitude && !data.coordinates?.longitude) {
    // Attempt geocoding
    const geocoded = await geocodeLocation(
      `${data.road} ${data.section || ''} ${data.area} ${data.region} Namibia`
    );
    
    if (!geocoded.success) {
      errors.push(
        'Location could not be geocoded. Please provide GPS coordinates manually.'
      );
    } else {
      // Save geocoded coordinates
      data.coordinates = {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      };
      data.geocoded = true;
      data.geocodedDisplayName = geocoded.displayName;
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
  
  return true;
}
```

---

## 🔍 **Search Implementation**

### **Text Search Query**

```javascript
async function searchRoadStatus(searchTerm, filters = {}) {
  const query = {
    published: true, // Only published records
  };
  
  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Filters
  if (filters.region) {
    query.region = filters.region;
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.startDate || filters.endDate) {
    query.startDate = {};
    if (filters.startDate) query.startDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.startDate.$lte = new Date(filters.endDate);
  }
  
  const results = await RoadStatus.find(query)
    .sort({ score: { $meta: 'textScore' } })
    .limit(50);
  
  return results;
}
```

---

## 🗺️ **Geospatial Queries**

### **Find Nearby Roadworks**

```javascript
async function findNearbyRoadworks(latitude, longitude, radiusKm = 50) {
  const results = await RoadStatus.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude], // [lon, lat]
        },
        $maxDistance: radiusKm * 1000, // Convert km to meters
      },
    },
    published: true,
  }).limit(20);
  
  return results;
}
```

---

## 📤 **API Response Format**

```javascript
{
  "success": true,
  "data": {
    "roadworks": [
      {
        "_id": "...",
        "road": "B1 National Road",
        "roadCode": "B1",
        "roadType": "National",
        "section": "Section 5",
        "area": "Windhoek",
        "region": "Khomas",
        "status": "Closed",
        "title": "Emergency Repairs",
        "description": "...",
        "coordinates": {
          "latitude": -22.5597,
          "longitude": 17.0832
        },
        "startDate": "2026-01-10T00:00:00.000Z",
        "expectedCompletion": "2026-01-25T00:00:00.000Z",
        "alternativeRoute": "Use B2 via Karibib",
        "priority": "critical",
        "published": true,
        "createdAt": "2026-01-09T10:00:00.000Z",
        "updatedAt": "2026-01-09T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "totalPages": 1,
      "limit": 10
    }
  }
}
```

---

## 🚨 **Critical Implementation Notes**

1. **NEVER** save a record without either:
   - Valid coordinates, OR
   - Successful geocoding

2. **ALWAYS** require coordinates for `Closed` and `Restricted` statuses

3. **ALWAYS** validate coordinates are within Namibia bounds

4. **ALWAYS** build `searchText` for efficient search

5. **ALWAYS** create text and geospatial indexes

6. **LOG** geocoding failures for admin review

---

## 📝 **Migration Script for Existing Data**

If you have existing road status records without proper structure:

```javascript
async function migrateExistingRoadStatus() {
  const roadworks = await RoadStatus.find({});
  
  for (const rw of roadworks) {
    let updated = false;
    
    // Add searchText if missing
    if (!rw.searchText) {
      rw.searchText = [rw.road, rw.section, rw.area, rw.region, 'Namibia']
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      updated = true;
    }
    
    // Extract roadCode if missing
    if (!rw.roadCode && rw.road) {
      const match = rw.road.match(/([BCD]\d+)/i);
      if (match) {
        rw.roadCode = match[1].toUpperCase();
        updated = true;
      }
    }
    
    // Geocode if no coordinates
    if (!rw.coordinates?.latitude && !rw.coordinates?.longitude) {
      const geocoded = await geocodeLocation(
        `${rw.road} ${rw.section || ''} ${rw.area} ${rw.region} Namibia`
      );
      
      if (geocoded.success) {
        rw.coordinates = {
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
        };
        rw.geocoded = true;
        rw.geocodedDisplayName = geocoded.displayName;
        updated = true;
      } else {
        console.warn(`Failed to geocode: ${rw.road} in ${rw.area}`);
      }
    }
    
    if (updated) {
      await rw.save();
      console.log(`Updated: ${rw.road}`);
    }
  }
  
  console.log('Migration complete');
}
```

---

## ✅ **Summary**

This schema ensures:
- ✅ All records are geocodable or have coordinates
- ✅ Efficient search by road name, code, area, region
- ✅ Geospatial queries for "near me" features
- ✅ Data quality at the database level
- ✅ Mobile app can reliably display all roads on map
- ✅ No silent failures or missing locations

**Next Step:** Implement this schema in your backend and run the migration script for existing data.











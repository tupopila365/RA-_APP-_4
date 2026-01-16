# Map Location Selector Setup Guide

## Overview

The Map Location Selector feature allows admins to visually select road locations on an interactive map, which automatically populates form fields with coordinates, road names, areas, and regions.

## Features

✅ **Interactive Google Maps integration**
✅ **Click-to-select location with draggable markers**
✅ **Auto-detection of road names, areas, and regions**
✅ **Search functionality for addresses and locations**
✅ **Current location detection (GPS)**
✅ **Coordinate validation for Namibia bounds**
✅ **Fallback mode when Google Maps API is not available**
✅ **Auto-population of form fields**
✅ **Fullscreen map view**

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** 
   - **Geocoding API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

### 2. Configure Environment Variables

Add your Google Maps API key to the admin `.env` file:

```bash
# Google Maps API Key (for map location selector)
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your real API key.

**Note:** The admin uses Vite, so environment variables must be prefixed with `VITE_` (not `REACT_APP_`).

### 3. API Key Security (Recommended)

For production, restrict your API key:

1. In Google Cloud Console, go to **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your domain: `https://yourdomain.com/*`
4. Under **API restrictions**:
   - Select **Restrict key**
   - Choose: Maps JavaScript API, Places API, Geocoding API

### 4. Test the Integration

1. Restart the admin development server
2. Go to **Road Status** → **Add New Roadwork**
3. In the **Location Coordinates** section, click **Show Map**
4. You should see an interactive Google Maps interface

## Usage Guide

### For Admins

1. **Show Map**: Click the "Show Map" button in the Location Coordinates section
2. **Select Location**: Click anywhere on the map to place a marker
3. **Drag Marker**: Drag the marker to fine-tune the location
4. **Search**: Use the search box to find specific roads or addresses
5. **Current Location**: Click the GPS button to use your current location
6. **Auto-Fill**: The map will automatically detect and fill:
   - Road name (if available)
   - Area/Town
   - Region
   - Coordinates
   - Auto-generated title

### Map Controls

- **Search Box**: Find roads, towns, or addresses
- **GPS Button**: Use current location
- **Fullscreen**: Expand map to full screen
- **Clear**: Remove current selection
- **Road Detection Toggle**: Enable/disable automatic road information detection

## Fallback Mode

If no Google Maps API key is configured, the system automatically uses a fallback mode with:

- Manual coordinate entry
- GPS location detection
- Links to external mapping tools
- Coordinate validation for Namibia

## Troubleshooting

### Map Not Loading

1. **Check API Key**: Ensure `REACT_APP_GOOGLE_MAPS_API_KEY` is set correctly
2. **Check APIs**: Verify Maps JavaScript API is enabled
3. **Check Console**: Look for JavaScript errors in browser console
4. **Check Quota**: Ensure you haven't exceeded API quotas

### Location Detection Issues

1. **Enable Places API**: Required for road name detection
2. **Enable Geocoding API**: Required for address lookup
3. **Check Permissions**: Browser may block location access

### Common Errors

**"Google Maps API key is required"**
- Add your API key to the `.env` file as `VITE_GOOGLE_MAPS_API_KEY`
- Restart the development server

**"This page can't load Google Maps correctly"**
- Check if APIs are enabled in Google Cloud Console
- Verify API key restrictions

**"Geocoding failed"**
- Check internet connection
- Verify Geocoding API is enabled

## File Structure

```
admin/src/
├── components/
│   ├── MapLocationSelector.tsx          # Main map component
│   └── MapLocationSelectorFallback.tsx  # Fallback without API
├── pages/RoadStatus/
│   └── RoadStatusForm.tsx               # Enhanced form with map
└── .env                                 # Environment variables
```

## Integration Details

### Auto-Population Logic

When a location is selected on the map:

1. **Coordinates**: Automatically filled with precise lat/lng
2. **Road Name**: Detected from Google Maps road data
3. **Area/Town**: Extracted from locality information
4. **Region**: Matched with Namibian regions
5. **Title**: Auto-generated based on road and status

### Data Flow

```
Map Click → Google Geocoding → Extract Info → Populate Form Fields
```

### Validation

- Coordinates are validated to be within Namibia bounds
- Road names are matched against predefined Namibian roads
- Regions are validated against the official list

## Cost Considerations

Google Maps API pricing (as of 2024):
- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Places API**: $17 per 1,000 requests

**Free tier**: $200 credit per month (covers ~28,000 map loads)

For typical admin usage (10-50 roadworks per month), costs should be minimal.

## Future Enhancements

Potential improvements:
- **Route Drawing**: Draw road closure areas
- **Multiple Markers**: Mark start/end points
- **Offline Maps**: Cache map tiles for offline use
- **Custom Map Styles**: Government-themed map styling
- **Satellite View**: Toggle between map and satellite views

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API key configuration
3. Test with fallback mode
4. Check Google Cloud Console quotas
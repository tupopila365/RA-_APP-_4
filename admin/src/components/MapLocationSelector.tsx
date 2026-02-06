import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import {
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import MapLocationSelectorFallback from './MapLocationSelectorFallback';
import { geocodeLocation, reverseGeocode as reverseGeocodeNominatim } from '../services/geocoding.service';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapLocationSelectorProps {
  onLocationSelect: (location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => void;
  initialCoordinates?: { latitude: number; longitude: number };
  height?: string;
  showSearch?: boolean;
  showRoadDetection?: boolean;
  className?: string;
}

const NAMIBIA_BOUNDS = {
  north: -16.5,
  south: -29.5,
  east: 25.5,
  west: 11.5,
};

const NAMIBIA_CENTER = {
  lat: -22.5,
  lng: 17.5,
};

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({
  onLocationSelect,
  initialCoordinates,
  height = '400px',
  showSearch = true,
  showRoadDetection = true,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  } | null>(null);
  const [roadDetectionEnabled, setRoadDetectionEnabled] = useState(showRoadDetection);

  // Check if Google Maps API key is available
  const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY && 
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here');

  // If no API key, use fallback component
  if (!hasGoogleMapsKey) {
    return (
      <MapLocationSelectorFallback
        onLocationSelect={onLocationSelect}
        initialCoordinates={initialCoordinates}
        height={height}
        showSearch={showSearch}
        showRoadDetection={showRoadDetection}
        className={className}
      />
    );
  }

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry,marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps. This usually means: 1) Your API key is invalid, 2) Billing is not enabled in Google Cloud Console, or 3) Required APIs are not enabled. The app will use fallback mode (manual coordinate entry).');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Ensure Google Maps API is fully loaded
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      setError('Google Maps API is not fully loaded. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      // Check if marker library is available for AdvancedMarkerElement
      const hasMarkerLibrary = window.google?.maps?.marker?.AdvancedMarkerElement;
      
      const mapOptions: google.maps.MapOptions = {
        center: initialCoordinates 
          ? { lat: initialCoordinates.latitude, lng: initialCoordinates.longitude }
          : NAMIBIA_CENTER,
        zoom: initialCoordinates ? 15 : 6,
        restriction: {
          latLngBounds: NAMIBIA_BOUNDS,
          strictBounds: true,
        },
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeId: 'roadmap',
        // Include mapId only if using AdvancedMarkerElement (requires Map ID)
        ...(hasMarkerLibrary && { mapId: 'ROAD_STATUS_MAP' }),
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      // Note: We use Nominatim for geocoding instead of Google Geocoder
      // geocoderRef.current is kept for compatibility but not used

      // Add click listener
      mapInstanceRef.current.addListener('click', handleMapClick);

      // Add initial marker if coordinates provided
      if (initialCoordinates) {
        addMarker(initialCoordinates.latitude, initialCoordinates.longitude);
      }

    } catch (err: any) {
      console.error('Map initialization error:', err);
      const errorMessage = err.message || 'Unknown error';
      if (errorMessage.includes('keys') || errorMessage.includes('undefined')) {
        setError(`Failed to initialize map: Google Maps API is not properly configured. This usually means billing is not enabled or the API key is invalid. The app will use fallback mode (manual coordinate entry). To enable Google Maps: 1) Enable billing in Google Cloud Console, 2) Enable Maps JavaScript API, 3) Verify your API key.`);
      } else {
        setError(`Failed to initialize map: ${errorMessage}. Please check your Google Maps API key and ensure the Maps JavaScript API is enabled.`);
      }
      setIsLoading(false);
    }
  }, [isLoaded, initialCoordinates]);

  // Update map center when initialCoordinates changes
  useEffect(() => {
    if (!mapInstanceRef.current || !initialCoordinates) return;
    
    mapInstanceRef.current.setCenter({
      lat: initialCoordinates.latitude,
      lng: initialCoordinates.longitude,
    });
    mapInstanceRef.current.setZoom(13); // Zoom to street level
    
    // Add/update marker
    addMarker(initialCoordinates.latitude, initialCoordinates.longitude);
  }, [initialCoordinates]);

  const handleMapClick = useCallback((event: any) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    addMarker(lat, lng);
    reverseGeocode(lat, lng);
  }, [roadDetectionEnabled]);

  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      if ('setMap' in markerRef.current && typeof markerRef.current.setMap === 'function') {
        markerRef.current.setMap(null);
      } else if ('map' in markerRef.current) {
        (markerRef.current as any).map = null;
      }
    }

    try {
      // Try to use AdvancedMarkerElement if available
      if (window.google?.maps?.marker?.AdvancedMarkerElement && window.google?.maps?.marker?.PinElement) {
        const pinElement = new window.google.maps.marker.PinElement({
          background: '#1976d2',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: 1.2,
        });

        markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map: mapInstanceRef.current,
          gmpDraggable: true,
          title: 'Selected Location',
          content: pinElement.element,
        });

        // Add drag listener
        markerRef.current.addListener('dragend', (event: any) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          reverseGeocode(newLat, newLng);
        });
      } else {
        // Fallback to regular Marker
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          draggable: true,
          title: 'Selected Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#1976d2',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add drag listener
        markerRef.current.addListener('dragend', (event: any) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          reverseGeocode(newLat, newLng);
        });
      }
    } catch (err: any) {
      console.error('Error creating marker:', err);
      setError(`Failed to create marker: ${err.message || 'Unknown error'}`);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Use Nominatim for reverse geocoding (free, no billing required)
      const result = await reverseGeocodeNominatim(lat, lng);

      if (result.success && result.displayName) {
        const location = extractLocationInfoFromNominatim(result.displayName, lat, lng);
        setSelectedLocation(location);
        onLocationSelect(location);
      } else {
        // Fallback to coordinates only
        const location = {
          coordinates: { latitude: lat, longitude: lng },
          address: result.error || 'Location details not available',
        };
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    } catch (err: any) {
      console.warn('Reverse geocoding failed:', err);
      // Fallback to coordinates only
      const location = {
        coordinates: { latitude: lat, longitude: lng },
        address: 'Location details not available',
      };
      setSelectedLocation(location);
      onLocationSelect(location);
    }
  };

  // Extract location info from Google Maps format (kept for backward compatibility)
  const extractLocationInfo = (result: any, lat: number, lng: number) => {
    const components = result.address_components || [];
    let roadName = '';
    let area = '';
    let region = '';

    // Extract road name from route or street_number + route
    const route = components.find((c: any) => c.types.includes('route'));
    const streetNumber = components.find((c: any) => c.types.includes('street_number'));
    
    if (route) {
      roadName = streetNumber 
        ? `${streetNumber.long_name} ${route.long_name}`
        : route.long_name;
    }

    // Extract area (locality or sublocality)
    const locality = components.find((c: any) => 
      c.types.includes('locality') || c.types.includes('sublocality')
    );
    if (locality) {
      area = locality.long_name;
    }

    // Extract region (administrative_area_level_1)
    const adminArea = components.find((c: any) => 
      c.types.includes('administrative_area_level_1')
    );
    if (adminArea) {
      region = adminArea.long_name;
    }

    return {
      coordinates: { latitude: lat, longitude: lng },
      address: result.formatted_address,
      roadName: roadName || undefined,
      area: area || undefined,
      region: region || undefined,
    };
  };

  // Extract location info from Nominatim display_name format
  // Nominatim returns: "Road Name, Town, Region, Namibia"
  const extractLocationInfoFromNominatim = (displayName: string, lat: number, lng: number) => {
    // Parse the display name which is typically: "Road, Town, Region, Namibia"
    const parts = displayName.split(',').map(p => p.trim());
    
    let roadName = '';
    let area = '';
    let region = '';

    // Try to extract components
    // Format is usually: [road/street, town/city, region, country]
    if (parts.length >= 2) {
      roadName = parts[0]; // First part is usually the road/street
    }
    if (parts.length >= 3) {
      area = parts[1]; // Second part is usually the town/city
    }
    if (parts.length >= 4) {
      region = parts[2]; // Third part is usually the region
    }

    // Clean up region name (remove "Region" suffix if present)
    if (region) {
      region = region.replace(/\s+Region$/, '').trim();
    }

    return {
      coordinates: { latitude: lat, longitude: lng },
      address: displayName,
      roadName: roadName || undefined,
      area: area || undefined,
      region: region || undefined,
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      // Use Nominatim for geocoding (free, no billing required)
      const searchQueryWithNamibia = searchQuery.includes('Namibia') 
        ? searchQuery 
        : `${searchQuery}, Namibia`;
      
      const result = await geocodeLocation(searchQueryWithNamibia);

      if (result.success && result.latitude && result.longitude) {
        const lat = result.latitude;
        const lng = result.longitude;

        // Center map and add marker
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
        addMarker(lat, lng);

        const locationInfo = extractLocationInfoFromNominatim(
          result.displayName || searchQuery,
          lat,
          lng
        );
        setSelectedLocation(locationInfo);
        onLocationSelect(locationInfo);
      } else {
        setError(result.error || 'Location not found. Try a more specific search term.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Search failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        mapInstanceRef.current.setCenter({ lat, lng });
        mapInstanceRef.current.setZoom(15);
        addMarker(lat, lng);
        reverseGeocode(lat, lng);
      },
      (err) => {
        setError('Failed to get current location: ' + err.message);
      }
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const clearSelection = () => {
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }
    setSelectedLocation(null);
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" height={height}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading map...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Google Maps Configuration Issue
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
          
          <Alert severity="info">
            <Typography variant="body2" fontWeight="bold">
              Quick Fix Required:
            </Typography>
            <Typography variant="body2" component="div">
              1. <strong>Enable billing</strong> in Google Cloud Console (free $200 credit monthly)
            </Typography>
            <Typography variant="body2" component="div">
              2. <strong>Add localhost</strong> to API key referrers: <code>http://localhost:3001/*</code>
            </Typography>
            <Typography variant="body2" component="div">
              3. <strong>Enable web APIs</strong>: Maps JavaScript API, Places API, Geocoding API
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              See <strong>FIX-GOOGLE-MAPS-ERRORS.md</strong> for detailed instructions.
            </Typography>
          </Alert>
          
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Using fallback mode for now - you can still enter coordinates manually below.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent sx={{ p: 1 }}>
        {/* Map Controls */}
        <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
          {showSearch && (
            <>
              <TextField
                size="small"
                placeholder="Search for roads, towns, or addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  endAdornment: searchQuery && (
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                startIcon={isSearching ? <CircularProgress size={16} /> : <SearchIcon />}
              >
                Search
              </Button>
            </>
          )}
          
          <Tooltip title="Use current location">
            <IconButton size="small" onClick={handleCurrentLocation}>
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <IconButton size="small" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          
          {selectedLocation && (
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={clearSelection}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Map Options */}
        {showRoadDetection && (
          <Box mb={1}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={roadDetectionEnabled}
                  onChange={(e) => setRoadDetectionEnabled(e.target.checked)}
                />
              }
              label="Auto-detect road information"
            />
          </Box>
        )}

        {/* Selected Location Info */}
        {selectedLocation && (
          <Box mb={1}>
            <Typography variant="caption" color="textSecondary">
              Selected Location:
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
              <Chip
                size="small"
                label={`${selectedLocation.coordinates.latitude.toFixed(6)}, ${selectedLocation.coordinates.longitude.toFixed(6)}`}
                variant="outlined"
              />
              {selectedLocation.roadName && (
                <Chip size="small" label={selectedLocation.roadName} color="primary" />
              )}
              {selectedLocation.area && (
                <Chip size="small" label={selectedLocation.area} color="secondary" />
              )}
              {selectedLocation.region && (
                <Chip size="small" label={selectedLocation.region} />
              )}
            </Box>
          </Box>
        )}

        {/* Map Container */}
        <Box
          ref={mapRef}
          sx={{
            height: isFullscreen ? '80vh' : height,
            width: '100%',
            borderRadius: 1,
            border: '1px solid #e0e0e0',
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? 0 : 'auto',
            left: isFullscreen ? 0 : 'auto',
            right: isFullscreen ? 0 : 'auto',
            bottom: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 9999 : 'auto',
            backgroundColor: '#f5f5f5',
          }}
        />

        {/* Instructions */}
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Click on the map to select a location, or drag the marker to adjust the position.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MapLocationSelector;
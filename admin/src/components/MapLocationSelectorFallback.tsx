import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Grid,
  Link,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { geocodeLocation, reverseGeocode } from '../services/geocoding.service';

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface MapLocationSelectorFallbackProps {
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

const MapLocationSelectorFallback: React.FC<MapLocationSelectorFallbackProps> = ({
  onLocationSelect,
  initialCoordinates,
  height = '400px',
  showSearch = true,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [latitude, setLatitude] = useState(
    initialCoordinates?.latitude?.toString() || ''
  );
  const [longitude, setLongitude] = useState(
    initialCoordinates?.longitude?.toString() || ''
  );
  const [address, setAddress] = useState('');
  const [roadName, setRoadName] = useState<string>('');
  const [roadDetails, setRoadDetails] = useState<{
    road?: string;
    area?: string;
    region?: string;
    fullAddress?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const popupRef = useRef<any>(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !window.L || !mapRef.current) return;

    const lat = initialCoordinates?.latitude || -22.5;
    const lng = initialCoordinates?.longitude || 17.5;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current, {
        center: [lat, lng],
        zoom: initialCoordinates ? 13 : 6,
        maxBounds: [[-29.5, 11.5], [-16.5, 25.5]], // Namibia bounds
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add click handler
      mapInstanceRef.current.on('click', (e: any) => {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;
        setLatitude(clickedLat.toString());
        setLongitude(clickedLng.toString());
        // Don't update marker here - let reverseGeocodeLocation do it with road details
        reverseGeocodeLocation(clickedLat, clickedLng);
      });
    }

    // Add initial marker if coordinates exist
    if (initialCoordinates) {
      updateMarker(initialCoordinates.latitude, initialCoordinates.longitude);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update map center when initialCoordinates changes after map is loaded
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !initialCoordinates) return;
    
    mapInstanceRef.current.setView(
      [initialCoordinates.latitude, initialCoordinates.longitude],
      13 // Zoom to street level
    );
    updateMarker(initialCoordinates.latitude, initialCoordinates.longitude);
  }, [initialCoordinates, mapLoaded]);

  // Update marker position
  const updateMarker = (lat: number, lng: number, roadInfo?: { road?: string; area?: string; region?: string; fullAddress?: string }) => {
    if (!mapInstanceRef.current || !window.L) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Create popup content with road details
    const popupContent = `
      <div style="min-width: 200px;">
        <strong>📍 Selected Location</strong><br/>
        ${roadInfo?.road ? `<strong>Road:</strong> ${roadInfo.road}<br/>` : ''}
        ${roadInfo?.area ? `<strong>Area:</strong> ${roadInfo.area}<br/>` : ''}
        ${roadInfo?.region ? `<strong>Region:</strong> ${roadInfo.region}<br/>` : ''}
        <strong>Coordinates:</strong><br/>
        ${lat.toFixed(6)}, ${lng.toFixed(6)}<br/>
        <small style="color: #666;">Drag marker to adjust</small>
      </div>
    `;

    // Add new marker with popup
    markerRef.current = window.L.marker([lat, lng], {
      draggable: true,
    }).addTo(mapInstanceRef.current);

    // Add popup to marker
    if (roadInfo && (roadInfo.road || roadInfo.area)) {
      markerRef.current.bindPopup(popupContent).openPopup();
    } else {
      markerRef.current.bindPopup(popupContent);
    }

    // Handle marker drag
    markerRef.current.on('dragend', (e: any) => {
      const newLat = e.target.getLatLng().lat;
      const newLng = e.target.getLatLng().lng;
      setLatitude(newLat.toString());
      setLongitude(newLng.toString());
      reverseGeocodeLocation(newLat, newLng);
    });

    // Center map on marker
    mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
  };

  // Extract road details from Nominatim display name and address components
  const extractRoadDetails = (displayName: string, addressData?: any) => {
    // Nominatim format: "Road Name, Town, Region, Namibia"
    const parts = displayName.split(',').map(p => p.trim());
    
    let road = '';
    let area = '';
    let region = '';

    // Try to extract from address components first (more accurate)
    if (addressData?.address) {
      const addr = addressData.address;
      road = addr.road || addr.street || addr.pedestrian || addr.path || '';
      area = addr.city || addr.town || addr.village || addr.municipality || '';
      region = addr.state || addr.region || '';
    }

    // Fallback to parsing display name if address components not available
    if (!road && parts.length >= 1) {
      road = parts[0]; // First part is usually the road/street
    }
    if (!area && parts.length >= 2) {
      area = parts[1]; // Second part is usually the town/city
    }
    if (!region && parts.length >= 3) {
      region = parts[2]; // Third part is usually the region
    }

    // Clean up region name (remove "Region" suffix if present)
    if (region) {
      region = region.replace(/\s+Region$/, '').trim();
    }

    return { road, area, region, fullAddress: displayName };
  };

  // Reverse geocode coordinates
  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    try {
      const result = await reverseGeocode(lat, lng);
      if (result.success && result.displayName) {
        setAddress(result.displayName);
        
        // Extract road details
        const details = extractRoadDetails(result.displayName);
        setRoadDetails(details);
        setRoadName(details.road || '');
        
        // Update marker popup with road details
        updateMarker(lat, lng, details);
        
        // Call onLocationSelect with road information
        onLocationSelect({
          coordinates: { latitude: lat, longitude: lng },
          address: result.displayName,
          roadName: details.road,
          area: details.area,
          region: details.region,
        });
      } else {
        // Still update marker even if geocoding fails
        updateMarker(lat, lng);
      }
    } catch (error) {
      // Silently fail, but still update marker
      updateMarker(lat, lng);
    }
  };

  // Update map when coordinates change from input fields
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      // Validate Namibia bounds
      if (lat >= -29.5 && lat <= -16.5 && lng >= 11.5 && lng <= 25.5) {
        // If we have road details, use them; otherwise just update marker
        const currentDetails = roadDetails || undefined;
        updateMarker(lat, lng, currentDetails);
        // Also try to reverse geocode to get road details if we don't have them
        if (!roadDetails) {
          reverseGeocodeLocation(lat, lng);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, mapLoaded]);

  const handleLocationSubmit = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    // Basic validation for Namibia bounds
    if (lat < -29.5 || lat > -16.5 || lng < 11.5 || lng > 25.5) {
      alert('Coordinates appear to be outside Namibia. Please verify.');
    }

    onLocationSelect({
      coordinates: { latitude: lat, longitude: lng },
      address: address || undefined,
    });
  };

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        
        // Try to reverse geocode to get address
        try {
          const result = await reverseGeocode(lat, lng);
          if (result.success && result.displayName) {
            setAddress(result.displayName);
            onLocationSelect({
              coordinates: { latitude: lat, longitude: lng },
              address: result.displayName,
            });
          } else {
            onLocationSelect({
              coordinates: { latitude: lat, longitude: lng },
              address: `Current location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
          }
        } catch (error) {
          onLocationSelect({
            coordinates: { latitude: lat, longitude: lng },
            address: `Current location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        }
      },
      (error) => {
        alert('Failed to get current location: ' + error.message);
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const searchQueryWithNamibia = searchQuery.includes('Namibia') 
        ? searchQuery 
        : `${searchQuery}, Namibia`;
      
      const result = await geocodeLocation(searchQueryWithNamibia);

      if (result.success && result.latitude && result.longitude) {
        setLatitude(result.latitude.toString());
        setLongitude(result.longitude.toString());
        setAddress(result.displayName || searchQuery);
        
        // Extract road details
        const details = extractRoadDetails(result.displayName || searchQuery);
        setRoadDetails(details);
        setRoadName(details.road || '');
        
        // Update map marker with road details
        if (mapInstanceRef.current) {
          updateMarker(result.latitude, result.longitude, details);
        }
        
        onLocationSelect({
          coordinates: { 
            latitude: result.latitude, 
            longitude: result.longitude 
          },
          address: result.displayName || searchQuery,
          roadName: details.road,
          area: details.area,
          region: details.region,
        });
        setSearchQuery(''); // Clear search after success
      } else {
        setSearchError(result.error || 'Location not found. Try a more specific search term.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError('Search failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Using OpenStreetMap (Free)
          </Typography>
          <Typography variant="caption" display="block">
            Interactive map powered by OpenStreetMap. Click on the map to select a location, 
            or search for a place. No API key or billing required.
          </Typography>
        </Alert>

        {/* Map Container */}
        <Box
          ref={mapRef}
          sx={{
            height: height,
            width: '100%',
            borderRadius: 1,
            border: '1px solid #e0e0e0',
            mb: 2,
            backgroundColor: '#f5f5f5',
            position: 'relative',
          }}
        >
          {!mapLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Loading map...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Search Section */}
        {showSearch && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Search Location"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isSearching) {
                  handleSearch();
                }
              }}
              placeholder="e.g., Windhoek, B1 Road, Otjiwarongo"
              InputProps={{
                endAdornment: isSearching ? (
                  <CircularProgress size={20} />
                ) : (
                  <Button
                    size="small"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    sx={{ minWidth: 'auto' }}
                  >
                    Search
                  </Button>
                ),
              }}
              helperText={searchError || 'Search for locations using OpenStreetMap'}
              error={!!searchError}
            />
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g., -22.5597"
              type="number"
              inputProps={{ step: 'any' }}
              helperText="Decimal degrees format"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g., 17.0832"
              type="number"
              inputProps={{ step: 'any' }}
              helperText="Decimal degrees format"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MyLocationIcon />}
              onClick={handleCurrentLocation}
              sx={{ height: '56px' }}
              title="Use current location"
            >
              GPS
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address or description"
              helperText="Optional: Add address or location description"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<LocationOnIcon />}
              onClick={handleLocationSubmit}
              disabled={!latitude || !longitude}
              fullWidth
            >
              Confirm Location
            </Button>
          </Grid>
        </Grid>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
          💡 Tip: Click on the map above to select a location, or drag the marker to adjust the position.
        </Typography>

        {/* Quick Links */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
            Quick tools:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Link
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener"
              sx={{ fontSize: '0.75rem' }}
            >
              Google Maps
            </Link>
            <Link
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener"
              sx={{ fontSize: '0.75rem' }}
            >
              OpenStreetMap
            </Link>
            <Link
              href="https://www.gps-coordinates.net"
              target="_blank"
              rel="noopener"
              sx={{ fontSize: '0.75rem' }}
            >
              GPS Coordinates Tool
            </Link>
          </Box>
        </Box>

        {/* Road Details Panel */}
        {roadDetails && (roadDetails.road || roadDetails.area) && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              📍 Road Details Detected
            </Typography>
            {roadDetails.road && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Road:</strong> {roadDetails.road}
              </Typography>
            )}
            {roadDetails.area && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Area:</strong> {roadDetails.area}
              </Typography>
            )}
            {roadDetails.region && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Region:</strong> {roadDetails.region}
              </Typography>
            )}
            {roadDetails.fullAddress && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {roadDetails.fullAddress}
              </Typography>
            )}
          </Alert>
        )}

        {/* Current Selection */}
        {latitude && longitude && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Selected coordinates:
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={`${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`}
                variant="outlined"
              />
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener"
                sx={{ ml: 1, fontSize: '0.75rem' }}
              >
                View on Google Maps
              </Link>
            </Box>
          </Box>
        )}

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Namibia coordinate ranges:</strong><br />
            Latitude: -16.5 to -29.5 (negative values)<br />
            Longitude: 11.5 to 25.5 (positive values)
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MapLocationSelectorFallback;
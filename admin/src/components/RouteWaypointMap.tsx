import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Alert, Typography, CircularProgress } from '@mui/material';
import MapLocationSelectorFallback from './MapLocationSelectorFallback';
import { reverseGeocode as reverseGeocodeNominatim } from '../services/geocoding.service';

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface Waypoint {
  name: string;
  coordinates: { latitude: number; longitude: number };
}

interface RouteWaypointMapProps {
  waypoints: Waypoint[];
  onWaypointAdd: (location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => void;
  onWaypointUpdate: (waypointIndex: number, location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => void;
  height?: string;
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

const RouteWaypointMap: React.FC<RouteWaypointMapProps> = ({
  waypoints,
  onWaypointAdd,
  onWaypointUpdate,
  height = '400px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Google Maps API key is available
  const hasGoogleMapsKey = Boolean(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY &&
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here'
  );

  // Load Google Maps API
  useEffect(() => {
    if (!hasGoogleMapsKey) {
      setIsLoaded(false);
      setIsLoading(false);
      return;
    }

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
      setError('Failed to load Google Maps. Using fallback mode.');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [hasGoogleMapsKey]);

  // Initialize map and markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !hasGoogleMapsKey) return;

    // Ensure Google Maps API is fully loaded
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      setError('Google Maps API is not fully loaded.');
      setIsLoading(false);
      return;
    }

    try {
      // Calculate bounds to fit all waypoints
      let bounds: any = null;
      if (waypoints.length > 0) {
        bounds = new window.google.maps.LatLngBounds();
        waypoints.forEach(wp => {
          if (wp.coordinates.latitude && wp.coordinates.longitude) {
            bounds.extend({
              lat: wp.coordinates.latitude,
              lng: wp.coordinates.longitude,
            });
          }
        });
      }

      const mapOptions: google.maps.MapOptions = {
        center: bounds
          ? bounds.getCenter()
          : waypoints.length > 0 && waypoints[0].coordinates.latitude
          ? { lat: waypoints[0].coordinates.latitude, lng: waypoints[0].coordinates.longitude }
          : NAMIBIA_CENTER,
        zoom: bounds ? undefined : 6,
        restriction: {
          latLngBounds: NAMIBIA_BOUNDS,
          strictBounds: true,
        },
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeId: 'roadmap',
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Fit bounds if we have waypoints
      if (bounds) {
        mapInstanceRef.current.fitBounds(bounds);
        // Ensure minimum zoom
        const listener = window.google.maps.event.addListener(
          mapInstanceRef.current,
          'bounds_changed',
          () => {
            if (mapInstanceRef.current.getZoom()! > 15) {
              mapInstanceRef.current.setZoom(15);
            }
            window.google.maps.event.removeListener(listener);
          }
        );
      }

      // Add click listener to add new waypoints
      mapInstanceRef.current.addListener('click', async (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Reverse geocode to get address
        try {
          const result = await reverseGeocodeNominatim(lat, lng);
          const location = {
            coordinates: { latitude: lat, longitude: lng },
            address: result.success ? result.displayName : undefined,
            roadName: undefined,
            area: undefined,
            region: undefined,
          };
          onWaypointAdd(location);
        } catch (err) {
          // Add waypoint even if geocoding fails
          onWaypointAdd({
            coordinates: { latitude: lat, longitude: lng },
          });
        }
      });

      // Update markers and polyline
      updateMarkersAndPolyline();

    } catch (err: any) {
      console.error('Map initialization error:', err);
      setError(`Failed to initialize map: ${err.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [isLoaded, hasGoogleMapsKey, waypoints, onWaypointAdd]);

  const updateMarkersAndPolyline = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Create markers for each waypoint
    const validWaypoints = waypoints.filter(
      wp => wp.coordinates.latitude && wp.coordinates.longitude
    );

    validWaypoints.forEach((waypoint, index) => {
      try {
        const hasMarkerLibrary = window.google?.maps?.marker?.AdvancedMarkerElement;

        if (hasMarkerLibrary && window.google?.maps?.marker?.PinElement) {
          const pinElement = new window.google.maps.marker.PinElement({
            background: index === 0 ? '#059669' : index === validWaypoints.length - 1 ? '#DC2626' : '#2563EB',
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            scale: 1.2,
            glyph: String(index + 1),
          });

          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: {
              lat: waypoint.coordinates.latitude,
              lng: waypoint.coordinates.longitude,
            },
            map: mapInstanceRef.current,
            gmpDraggable: true,
            title: waypoint.name || `Waypoint ${index + 1}`,
            content: pinElement.element,
          });

          // Add drag listener
          marker.addListener('dragend', async (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            
            try {
              const result = await reverseGeocodeNominatim(newLat, newLng);
              onWaypointUpdate(index, {
                coordinates: { latitude: newLat, longitude: newLng },
                address: result.success ? result.displayName : undefined,
              });
            } catch (err) {
              onWaypointUpdate(index, {
                coordinates: { latitude: newLat, longitude: newLng },
              });
            }
            updateMarkersAndPolyline();
          });

          markersRef.current.push(marker);
        } else {
          // Fallback to regular Marker
          const marker = new window.google.maps.Marker({
            position: {
              lat: waypoint.coordinates.latitude,
              lng: waypoint.coordinates.longitude,
            },
            map: mapInstanceRef.current,
            draggable: true,
            title: waypoint.name || `Waypoint ${index + 1}`,
            label: String(index + 1),
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: index === 0 ? '#059669' : index === validWaypoints.length - 1 ? '#DC2626' : '#2563EB',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          // Add drag listener
          marker.addListener('dragend', async (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            
            try {
              const result = await reverseGeocodeNominatim(newLat, newLng);
              onWaypointUpdate(index, {
                coordinates: { latitude: newLat, longitude: newLng },
                address: result.success ? result.displayName : undefined,
              });
            } catch (err) {
              onWaypointUpdate(index, {
                coordinates: { latitude: newLat, longitude: newLng },
              });
            }
            updateMarkersAndPolyline();
          });

          markersRef.current.push(marker);
        }
      } catch (err) {
        console.error('Error creating marker:', err);
      }
    });

    // Create polyline connecting waypoints
    if (validWaypoints.length >= 2) {
      const path = validWaypoints.map(wp => ({
        lat: wp.coordinates.latitude,
        lng: wp.coordinates.longitude,
      }));

      polylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#2563EB',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });
    }
  }, [waypoints, onWaypointUpdate]);

  // Update markers when waypoints change
  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkersAndPolyline();
    }
  }, [isLoaded, waypoints, updateMarkersAndPolyline]);

  if (!hasGoogleMapsKey) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Google Maps is not configured. Please configure your API key to use the interactive map.
            You can still add waypoints manually using the coordinate fields.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={height}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading map...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <div ref={mapRef} style={{ width: '100%', height, borderRadius: '4px', overflow: 'hidden' }} />
      {waypoints.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="textSecondary">
            💡 Click on the map to add waypoints. Drag markers to adjust positions. 
            Green = Start, Red = End, Blue = Intermediate waypoints.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RouteWaypointMap;


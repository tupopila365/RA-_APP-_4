import React, { useState } from 'react';
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
  const [latitude, setLatitude] = useState(
    initialCoordinates?.latitude?.toString() || ''
  );
  const [longitude, setLongitude] = useState(
    initialCoordinates?.longitude?.toString() || ''
  );
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
        
        onLocationSelect({
          coordinates: { 
            latitude: result.latitude, 
            longitude: result.longitude 
          },
          address: result.displayName || searchQuery,
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
            This mode uses OpenStreetMap Nominatim for geocoding (free, no billing required).
            You can search for locations or enter coordinates manually.
          </Typography>
        </Alert>

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
              Set Location
            </Button>
          </Grid>
        </Grid>

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
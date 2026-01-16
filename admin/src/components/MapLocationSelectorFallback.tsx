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
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';

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
  className,
}) => {
  const [latitude, setLatitude] = useState(
    initialCoordinates?.latitude?.toString() || ''
  );
  const [longitude, setLongitude] = useState(
    initialCoordinates?.longitude?.toString() || ''
  );
  const [address, setAddress] = useState('');

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

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        
        onLocationSelect({
          coordinates: { latitude: lat, longitude: lng },
          address: `Current location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      },
      (error) => {
        alert('Failed to get current location: ' + error.message);
      }
    );
  };

  return (
    <Card className={className}>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Map Integration Available
          </Typography>
          <Typography variant="caption" display="block">
            To enable the interactive map, add your Google Maps API key to the .env file.
            For now, you can enter coordinates manually or use the location tools below.
          </Typography>
        </Alert>

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
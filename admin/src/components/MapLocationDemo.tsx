import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import MapLocationSelector from './MapLocationSelector';

/**
 * Demo component to showcase the Map Location Selector
 * This can be used for testing and demonstration purposes
 */
const MapLocationDemo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  } | null>(null);

  const handleLocationSelect = (location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  const handleReset = () => {
    setSelectedLocation(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Map Location Selector Demo
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This demo shows the interactive map location selector that's integrated into the Road Status form.
          Click on the map to select a location and see how it auto-populates location information.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Map Selector */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interactive Map Selector
              </Typography>
              <MapLocationSelector
                onLocationSelect={handleLocationSelect}
                initialCoordinates={selectedLocation?.coordinates}
                height="500px"
                showSearch={true}
                showRoadDetection={true}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Location Info */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Selected Location
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={!selectedLocation}
                >
                  Reset
                </Button>
              </Box>

              {selectedLocation ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Coordinates:
                  </Typography>
                  <Chip
                    icon={<LocationOnIcon />}
                    label={`${selectedLocation.coordinates.latitude.toFixed(6)}, ${selectedLocation.coordinates.longitude.toFixed(6)}`}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />

                  {selectedLocation.address && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Address:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {selectedLocation.address}
                      </Typography>
                    </>
                  )}

                  {selectedLocation.roadName && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Road Name:
                      </Typography>
                      <Chip
                        label={selectedLocation.roadName}
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                    </>
                  )}

                  {selectedLocation.area && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Area/Town:
                      </Typography>
                      <Chip
                        label={selectedLocation.area}
                        color="secondary"
                        sx={{ mb: 1 }}
                      />
                    </>
                  )}

                  {selectedLocation.region && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Region:
                      </Typography>
                      <Chip
                        label={selectedLocation.region}
                        sx={{ mb: 1 }}
                      />
                    </>
                  )}

                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      ✅ This information would be automatically populated in the Road Status form
                    </Typography>
                  </Alert>
                </Box>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    Click on the map to select a location and see the extracted information here.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Form Field Preview */}
          {selectedLocation && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Form Field Preview
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  How this would appear in the Road Status form:
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    Road Name: {selectedLocation.roadName || 'Not detected'}<br />
                    Area: {selectedLocation.area || 'Not detected'}<br />
                    Region: {selectedLocation.region || 'Not detected'}<br />
                    Latitude: {selectedLocation.coordinates.latitude}<br />
                    Longitude: {selectedLocation.coordinates.longitude}<br />
                    {selectedLocation.roadName && selectedLocation.area && (
                      <>Title: Roadwork on {selectedLocation.roadName} near {selectedLocation.area}</>
                    )}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Usage Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Use in Road Status Form
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                <strong>1. Show Map:</strong> Click "Show Map" button in Location Coordinates section
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>2. Select Location:</strong> Click anywhere on the map to place a marker
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>3. Fine-tune:</strong> Drag the marker to adjust the exact position
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                <strong>4. Search:</strong> Use the search box to find specific roads or addresses
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>5. Auto-fill:</strong> Form fields are automatically populated with detected information
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>6. Verify:</strong> Review and adjust the auto-filled information as needed
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MapLocationDemo;
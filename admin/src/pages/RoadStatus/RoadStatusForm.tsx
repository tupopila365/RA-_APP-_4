import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Paper,
  Autocomplete,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Stack,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Map as MapIcon,
  LocationOn as LocationOnIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import {
  getRoadStatusById,
  createRoadStatus,
  updateRoadStatus,
  RoadStatusCreateInput,
} from '../../services/roadStatus.service';
import {
  ALL_ROADS,
  TOWNS_BY_REGION,
  ALL_TOWNS,
  RoadEntry,
  getRoadByCodeOrName,
  buildSearchText,
} from '../../constants/namibianRoads';
import {
  validateRoadLocation,
  validateCoordinates,
  reverseGeocode,
  geocodeLocation,
  GeocodingResult,
} from '../../services/geocoding.service';
import MapLocationSelector from '../../components/MapLocationSelector';
import RouteWaypointMap from '../../components/RouteWaypointMap';

const REGIONS = [
  'Erongo',
  'Hardap',
  'ǁKaras',
  'Kavango East',
  'Kavango West',
  'Khomas',
  'Kunene',
  'Ohangwena',
  'Omaheke',
  'Omusati',
  'Oshana',
  'Oshikoto',
  'Otjozondjupa',
  'Zambezi',
];

// Lane status types
type LaneStatus = 'open' | 'partial' | 'closed';

interface LaneSegment {
  id: string;
  name: string; // e.g., "North-bound lane", "South-bound lane", "Both lanes"
  status: LaneStatus;
  startDate?: string;
  endDate?: string;
  coordinates?: { latitude: number; longitude: number };
}

const STEPS = [
  'Select Road',
  'Mark Affected Lanes',
  'Describe Roadwork',
  'Timing & Impact',
  'Advanced Options',
  'Publish',
];

const RoadStatusForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id && id !== 'new');

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STEP 1: Select Road
  const [selectedRoad, setSelectedRoad] = useState<RoadEntry | null>(null);
  const [roadCustom, setRoadCustom] = useState('');
  const [region, setRegion] = useState('');
  const [area, setArea] = useState('');
  const [showRoadMap, setShowRoadMap] = useState(false);
  const [mapSelectedLocation, setMapSelectedLocation] = useState<{
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  } | null>(null);
  const [roadMapCoordinates, setRoadMapCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocodingRoad, setIsGeocodingRoad] = useState(false);

  // STEP 2: Mark Affected Lanes
  const [laneSegments, setLaneSegments] = useState<LaneSegment[]>([]);
  const [selectedLaneStatus, setSelectedLaneStatus] = useState<LaneStatus>('open');

  // STEP 3: Describe Roadwork
  const [workType, setWorkType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // STEP 4: Timing & Impact
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [impactLevel, setImpactLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [roadFullyClosed, setRoadFullyClosed] = useState(false);

  // STEP 5: Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [section, setSection] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contractor, setContractor] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [alternativeRoute, setAlternativeRoute] = useState('');

  // Structured Alternate Routes
  interface AlternateRoute {
    routeName: string;
    roadsUsed: string[];
    waypoints: Array<{
      name: string;
      coordinates: { latitude: number; longitude: number };
    }>;
    vehicleType: string[];
    distanceKm?: number;
    estimatedTime?: string;
    isRecommended: boolean;
    approved: boolean;
  }
  const [alternateRoutes, setAlternateRoutes] = useState<AlternateRoute[]>([]);
  const [showRouteMap, setShowRouteMap] = useState<number | null>(null);
  const [showRouteMapAll, setShowRouteMapAll] = useState<number | null>(null);

  // STEP 6: Publish
  const [published, setPublished] = useState(false);
  const [status, setStatus] = useState<RoadStatusCreateInput['status']>('Planned');

  // Computed values
  const roadName = selectedRoad ? selectedRoad.displayName : roadCustom;
  const availableTowns = region ? TOWNS_BY_REGION[region] || ALL_TOWNS : ALL_TOWNS;
  const VEHICLE_TYPES = ['All', 'Light Vehicles', 'Heavy Vehicles', 'Motorcycles', 'Buses', 'Trucks'];

  // Load existing roadwork in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadRoadwork(id);
    }
  }, [id, isEditMode]);

  // Auto-show map when road and region are selected
  useEffect(() => {
    if (roadName && region && !showRoadMap) {
      setShowRoadMap(true);
    }
  }, [roadName, region]);

  // Auto-geocode and zoom map when road/region/area changes
  useEffect(() => {
    if (!roadName || !region) return;

    const geocodeRoadLocation = async () => {
      setIsGeocodingRoad(true);
      try {
        // Build search query: "Road Name, Town, Region, Namibia"
        const searchParts = [roadName];
        if (area) searchParts.push(area);
        searchParts.push(region, 'Namibia');
        const searchQuery = searchParts.join(', ');

        const result = await geocodeLocation(searchQuery);
        
        if (result.success && result.latitude && result.longitude) {
          setRoadMapCoordinates({
            latitude: result.latitude,
            longitude: result.longitude,
          });
          
          // Also update map selected location
          setMapSelectedLocation({
            coordinates: {
              latitude: result.latitude,
              longitude: result.longitude,
            },
            address: result.displayName,
            roadName: roadName,
            area: area || undefined,
            region: region,
          });
          
          // Update coordinates if not set
          if (!latitude || !longitude) {
            setLatitude(result.latitude.toString());
            setLongitude(result.longitude.toString());
          }
        }
      } catch (error) {
        console.error('Error geocoding road location:', error);
      } finally {
        setIsGeocodingRoad(false);
      }
    };

    // Debounce the geocoding
    const timeoutId = setTimeout(() => {
      geocodeRoadLocation();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [roadName, region, area]);

  const loadRoadwork = async (roadworkId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoadStatusById(roadworkId);
      const rw = response.data.roadwork;

      const matchedRoad = getRoadByCodeOrName(rw.road);
      if (matchedRoad) {
        setSelectedRoad(matchedRoad);
      } else {
        setRoadCustom(rw.road);
      }

      setRegion(rw.region);
      setArea(rw.area || '');
      setSection(rw.section || '');
      setTitle(rw.title);
      setDescription(rw.description || '');
      setStartDate(rw.startDate ? rw.startDate.split('T')[0] : '');
      setExpectedCompletion(rw.expectedCompletion ? rw.expectedCompletion.split('T')[0] : '');
      setLatitude(rw.coordinates?.latitude?.toString() || '');
      setLongitude(rw.coordinates?.longitude?.toString() || '');
      setContractor(rw.contractor || '');
      setEstimatedDuration(rw.estimatedDuration || '');
      setPriority(rw.priority || 'medium');
      setPublished(rw.published);
      setStatus(rw.status);
      setAlternativeRoute(rw.alternativeRoute || '');

      // Parse affected lanes if exists
      if (rw.affectedLanes) {
        const lanes: LaneSegment[] = [{
          id: '1',
          name: rw.affectedLanes,
          status: rw.status === 'Closed' ? 'closed' : rw.status === 'Restricted' ? 'partial' : 'open',
        }];
        setLaneSegments(lanes);
      }

      // Load alternate routes if exists
      if (rw.alternateRoutes && rw.alternateRoutes.length > 0) {
        setAlternateRoutes(rw.alternateRoutes.map((route: any) => ({
          routeName: route.routeName,
          roadsUsed: route.roadsUsed || [],
          waypoints: route.waypoints || [],
          vehicleType: route.vehicleType || ['All'],
          distanceKm: route.distanceKm,
          estimatedTime: route.estimatedTime,
          isRecommended: route.isRecommended || false,
          approved: route.approved || false,
        })));
      }
    } catch (err: any) {
      console.error('Error loading roadwork:', err);
      setError(err.response?.data?.error?.message || 'Failed to load roadwork data');
    } finally {
      setLoading(false);
    }
  };

  // Handle road selection and map highlighting
  const handleRoadSelect = (road: RoadEntry | string) => {
    if (typeof road === 'string') {
      setRoadCustom(road);
      setSelectedRoad(null);
    } else {
      setSelectedRoad(road);
      setRoadCustom('');
    }
    // Automatically show map when road is selected
    if (road) {
      setShowRoadMap(true);
    }
  };

  const handleMapLocationSelect = useCallback((location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => {
    setMapSelectedLocation(location);
    setLatitude(location.coordinates.latitude.toString());
    setLongitude(location.coordinates.longitude.toString());
    
    if (location.roadName && !roadName) {
      const matchedRoad = getRoadByCodeOrName(location.roadName);
      if (matchedRoad) {
        setSelectedRoad(matchedRoad);
        setRoadCustom('');
      } else {
        setRoadCustom(location.roadName);
        setSelectedRoad(null);
      }
    }
    
    if (location.area && !area) {
      setArea(location.area);
    }
    
    if (location.region && !region) {
      const matchedRegion = REGIONS.find(r => 
        r.toLowerCase().includes(location.region!.toLowerCase()) ||
        location.region!.toLowerCase().includes(r.toLowerCase())
      );
      if (matchedRegion) {
        setRegion(matchedRegion);
      }
    }
  }, [roadName, area, region]);

  // Lane management functions
  const addLaneSegment = () => {
    const newSegment: LaneSegment = {
      id: `lane-${Date.now()}`,
      name: `Lane ${laneSegments.length + 1}`,
      status: selectedLaneStatus,
    };
    setLaneSegments([...laneSegments, newSegment]);
  };

  const updateLaneSegment = (id: string, updates: Partial<LaneSegment>) => {
    setLaneSegments(laneSegments.map(lane => 
      lane.id === id ? { ...lane, ...updates } : lane
    ));
  };

  const removeLaneSegment = (id: string) => {
    setLaneSegments(laneSegments.filter(lane => lane.id !== id));
  };

  // Alternate Routes Management Functions
  const addAlternateRoute = () => {
    const newRoute: AlternateRoute = {
      routeName: `Route ${alternateRoutes.length + 1}`,
      roadsUsed: [],
      waypoints: [],
      vehicleType: ['All'],
      isRecommended: alternateRoutes.length === 0,
      approved: false,
    };
    setAlternateRoutes([...alternateRoutes, newRoute]);
  };

  const updateAlternateRoute = (index: number, updates: Partial<AlternateRoute>) => {
    const updated = [...alternateRoutes];
    updated[index] = { ...updated[index], ...updates };
    setAlternateRoutes(updated);
  };

  const removeAlternateRoute = (index: number) => {
    setAlternateRoutes(alternateRoutes.filter((_, i) => i !== index));
  };

  const addWaypoint = (routeIndex: number) => {
    const updated = [...alternateRoutes];
    updated[routeIndex].waypoints.push({
      name: '',
      coordinates: { latitude: 0, longitude: 0 },
    });
    setAlternateRoutes(updated);
  };

  const updateWaypoint = (routeIndex: number, waypointIndex: number, updates: any) => {
    const updated = [...alternateRoutes];
    updated[routeIndex].waypoints[waypointIndex] = {
      ...updated[routeIndex].waypoints[waypointIndex],
      ...updates,
    };
    setAlternateRoutes(updated);
  };

  const removeWaypoint = (routeIndex: number, waypointIndex: number) => {
    const updated = [...alternateRoutes];
    updated[routeIndex].waypoints = updated[routeIndex].waypoints.filter((_, i) => i !== waypointIndex);
    setAlternateRoutes(updated);
  };

  const calculateRouteDistance = (coordinates: Array<{ latitude: number; longitude: number }>): number => {
    if (coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const R = 6371;
      const dLat = (coordinates[i + 1].latitude - coordinates[i].latitude) * Math.PI / 180;
      const dLon = (coordinates[i + 1].longitude - coordinates[i].longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coordinates[i].latitude * Math.PI / 180) * Math.cos(coordinates[i + 1].latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }
    return Math.round(totalDistance * 100) / 100;
  };

  const estimateRouteTime = (distanceKm: number, roadsUsed: string[] = []): string => {
    if (distanceKm <= 0) return 'Unknown';
    
    const avgSpeed = roadsUsed.some(r => r.startsWith('B') || r.startsWith('A')) ? 80 : 60;
    const hours = distanceKm / avgSpeed;
    const minutes = Math.round(hours * 60);
    
    if (hours >= 1) {
      return `${Math.floor(hours)}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Step validation
  const validateStep = (step: number): { valid: boolean; error?: string } => {
    switch (step) {
      case 0: // Select Road
        if (!roadName || !roadName.trim()) {
          return { valid: false, error: 'Please select or enter a road name' };
        }
        if (!region) {
          return { valid: false, error: 'Please select a region' };
        }
        // Auto-generate section if not provided (backend requires it)
        if (!section || !section.trim()) {
          // This is OK - we'll generate it on submit
        }
        return { valid: true };
      
      case 1: // Mark Affected Lanes
        if (laneSegments.length === 0) {
          return { valid: false, error: 'Please mark at least one affected lane' };
        }
        return { valid: true };
      
      case 2: // Describe Roadwork
        if (!title || !title.trim()) {
          return { valid: false, error: 'Please enter a title for the roadwork' };
        }
        return { valid: true };
      
      case 3: // Timing & Impact
        if (startDate && expectedCompletion) {
          const start = new Date(startDate);
          const completion = new Date(expectedCompletion);
          if (start > completion) {
            return { valid: false, error: 'Start date cannot be after expected completion date' };
          }
        }
        return { valid: true };
      
      case 4: // Advanced Options (optional)
        return { valid: true };
      
      case 5: // Publish
        return { valid: true };
      
      default:
        return { valid: true };
    }
  };

  const handleNext = () => {
    const validation = validateStep(activeStep);
    if (!validation.valid) {
      setError(validation.error || 'Please complete the current step');
      return;
    }
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    // Allow going back to previous steps
    if (step < activeStep) {
      setActiveStep(step);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const validation = validateStep(5);
    if (!validation.valid) {
      setError(validation.error || 'Please complete all required steps');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Determine status based on lane segments
      let finalStatus: RoadStatusCreateInput['status'] = status;
      if (laneSegments.length > 0) {
        const hasClosed = laneSegments.some(l => l.status === 'closed');
        const hasPartial = laneSegments.some(l => l.status === 'partial');
        
        if (hasClosed && roadFullyClosed) {
          finalStatus = 'Closed';
        } else if (hasClosed || hasPartial) {
          finalStatus = 'Ongoing';
        } else {
          finalStatus = 'Open';
        }
      }

      // Build affected lanes description from segments
      const affectedLanesText = laneSegments
        .map(lane => `${lane.name}: ${lane.status.charAt(0).toUpperCase() + lane.status.slice(1)}`)
        .join('; ');

      // Generate default section if not provided (backend requires it)
      // Use road name and area/region as a sensible default
      let finalSection = section.trim();
      if (!finalSection) {
        const sectionParts = [roadName];
        if (area) sectionParts.push(`near ${area}`);
        finalSection = sectionParts.join(' ');
      }

      const data: RoadStatusCreateInput = {
        road: roadName.trim(),
        section: finalSection,
        area: area.trim() || undefined,
        region,
        status: finalStatus,
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        expectedCompletion: expectedCompletion || undefined,
        alternativeRoute: alternativeRoute.trim() || undefined,
        coordinates:
          latitude && longitude
            ? {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }
            : undefined,
        affectedLanes: affectedLanesText || undefined,
        contractor: contractor.trim() || undefined,
        estimatedDuration: estimatedDuration.trim() || undefined,
        priority,
        published,
        alternateRoutes: alternateRoutes.length > 0 ? alternateRoutes
          .filter(route => route.routeName && route.routeName.trim() && route.waypoints.length >= 2)
          .map(route => ({
            routeName: route.routeName.trim(),
            roadsUsed: route.roadsUsed.filter(r => r && r.trim()),
            waypoints: route.waypoints
              .filter(wp => wp.coordinates && wp.coordinates.latitude !== 0 && wp.coordinates.longitude !== 0)
              .map(wp => ({
                name: wp.name.trim(),
                coordinates: {
                  latitude: wp.coordinates.latitude,
                  longitude: wp.coordinates.longitude,
                },
              })),
            vehicleType: route.vehicleType.length > 0 ? route.vehicleType : ['All'],
            distanceKm: route.distanceKm || calculateRouteDistance(route.waypoints.map(wp => wp.coordinates)),
            estimatedTime: route.estimatedTime || estimateRouteTime(route.distanceKm || calculateRouteDistance(route.waypoints.map(wp => wp.coordinates)), route.roadsUsed),
            isRecommended: route.isRecommended || false,
            approved: route.approved || false,
          })) : undefined,
      };

      if (isEditMode && id) {
        await updateRoadStatus(id, data);
      } else {
        await createRoadStatus(data);
      }

      navigate('/road-status');
    } catch (err: any) {
      console.error('Error saving roadwork:', err);
      
      let errorMessage = 'Failed to save roadwork';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join('. ');
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/road-status');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render Step Content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // STEP 1: Select Road
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Quick Start (10 seconds max):</strong> Search for a road name (e.g., "B1") and select the region/town. 
                The map will automatically zoom to show the selected road. No forms yet - just context.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={ALL_ROADS}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.displayName)}
                  value={selectedRoad}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                      handleRoadSelect(newValue);
                    } else if (newValue) {
                      handleRoadSelect(newValue);
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (!selectedRoad) {
                      setRoadCustom(newInputValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Road Name"
                      required
                      placeholder="e.g., B1, C28, Independence Avenue"
                      helperText="Start typing to search..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2">{option.displayName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.type} Road • Code: {option.code}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>Region</InputLabel>
                  <Select value={region} label="Region" onChange={(e) => setRegion(e.target.value)}>
                    {REGIONS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={availableTowns}
                  value={area}
                  onChange={(event, newValue) => setArea(newValue || '')}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Town (Optional)"
                      placeholder="Select or type..."
                      helperText="Helpful for context"
                    />
                  )}
                />
              </Grid>

              {roadName && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CheckCircleIcon color="success" />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            Selected: {roadName}
                          </Typography>
                          {region && (
                            <Typography variant="caption" color="text.secondary">
                              Region: {region} {area && `• Town: ${area}`}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showRoadMap}
                      onChange={(e) => setShowRoadMap(e.target.checked)}
                    />
                  }
                  label="Show map to verify road location"
                />
              </Grid>

              {showRoadMap && (
                <Grid item xs={12}>
                  {isGeocodingRoad && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} />
                        <Typography variant="body2">
                          Searching for "{roadName}" in {region}...
                        </Typography>
                      </Stack>
                    </Alert>
                  )}
                  <MapLocationSelector
                    onLocationSelect={handleMapLocationSelect}
                    initialCoordinates={roadMapCoordinates || undefined}
                    height="400px"
                    showSearch={true}
                    showRoadDetection={true}
                  />
                  {mapSelectedLocation && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        ✓ Road Location Found & Map Zoomed
                      </Typography>
                      <Typography variant="caption" display="block">
                        {mapSelectedLocation.address || `${mapSelectedLocation.coordinates.latitude.toFixed(6)}, ${mapSelectedLocation.coordinates.longitude.toFixed(6)}`}
                      </Typography>
                      {roadName && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Road "{roadName}" is highlighted on the map
                        </Typography>
                      )}
                    </Alert>
                  )}
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 1: // STEP 2: Mark Affected Lanes
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Core Step:</strong> This is where your idea shines! Click on lanes or road segments to mark their status. 
                This is like "painting on the road" - no typing, no coordinates, no confusion.
              </Typography>
            </Alert>

            {/* Legend */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Status Legend:
              </Typography>
              <Stack direction="row" spacing={3}>
                <Chip
                  icon={<Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#34C759' }} />}
                  label="🟢 Open"
                  variant="outlined"
                />
                <Chip
                  icon={<Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FF9500' }} />}
                  label="🟡 Partial"
                  variant="outlined"
                />
                <Chip
                  icon={<Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FF3B30' }} />}
                  label="🔴 Closed"
                  variant="outlined"
                />
              </Stack>
            </Paper>

            {/* Lane Status Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select Status for New Lane:
              </Typography>
              <ToggleButtonGroup
                value={selectedLaneStatus}
                exclusive
                onChange={(e, newStatus) => newStatus && setSelectedLaneStatus(newStatus)}
                aria-label="lane status"
              >
                <ToggleButton value="open" aria-label="open">
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#34C759', mr: 1 }} />
                  Open
                </ToggleButton>
                <ToggleButton value="partial" aria-label="partial">
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF9500', mr: 1 }} />
                  Partial
                </ToggleButton>
                <ToggleButton value="closed" aria-label="closed">
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF3B30', mr: 1 }} />
                  Closed
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Map for Lane Selection */}
            {roadName && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Click on the map</strong> to add lane segments. The road "{roadName}" is highlighted in grey.
                  </Typography>
                </Alert>
                <MapLocationSelector
                  onLocationSelect={(location) => {
                    const newSegment: LaneSegment = {
                      id: `lane-${Date.now()}`,
                      name: `Lane at ${location.roadName || 'selected location'}`,
                      status: selectedLaneStatus,
                      coordinates: location.coordinates,
                    };
                    setLaneSegments([...laneSegments, newSegment]);
                  }}
                  height="400px"
                  showSearch={false}
                />
              </Box>
            )}

            {/* Manual Lane Entry */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addLaneSegment}
                sx={{ mb: 2 }}
              >
                Add Lane Segment Manually
              </Button>
            </Box>

            {/* Lane Segments List */}
            {laneSegments.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <WarningIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No lanes marked yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click on the map above or add lanes manually to mark affected road segments
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {laneSegments.map((lane) => (
                  <Card key={lane.id} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Lane Name"
                            value={lane.name}
                            onChange={(e) => updateLaneSegment(lane.id, { name: e.target.value })}
                            placeholder="e.g., North-bound lane, Both lanes"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={lane.status}
                              label="Status"
                              onChange={(e) => updateLaneSegment(lane.id, { status: e.target.value as LaneStatus })}
                            >
                              <MenuItem value="open">🟢 Open</MenuItem>
                              <MenuItem value="partial">🟡 Partial</MenuItem>
                              <MenuItem value="closed">🔴 Closed</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={lane.startDate || ''}
                            onChange={(e) => updateLaneSegment(lane.id, { startDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={lane.endDate || ''}
                            onChange={(e) => updateLaneSegment(lane.id, { endDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={1}>
                          <IconButton
                            color="error"
                            onClick={() => removeLaneSegment(lane.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        );

      case 2: // STEP 3: Describe Roadwork
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Human Language:</strong> Now that you've seen the problem on the map, 
                describe what's happening in plain language that drivers will understand.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type of Work</InputLabel>
                  <Select
                    value={workType}
                    label="Type of Work"
                    onChange={(e) => setWorkType(e.target.value)}
                  >
                    <MenuItem value="emergency">Emergency Repairs</MenuItem>
                    <MenuItem value="maintenance">Routine Maintenance</MenuItem>
                    <MenuItem value="resurfacing">Road Resurfacing</MenuItem>
                    <MenuItem value="construction">Construction</MenuItem>
                    <MenuItem value="bridge">Bridge Work</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Public Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Emergency repairs on B1"
                  helperText="Short, clear title that appears in the app"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="e.g., One lane closed due to storm damage. Expect delays of 15-20 minutes during peak hours."
                  helperText={`${description.length}/1000 characters - Plain language description for drivers`}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // STEP 4: Timing & Impact
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Driver Impact:</strong> Only include information that affects drivers. 
                Keep it simple and actionable.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected End Date"
                  type="date"
                  value={expectedCompletion}
                  onChange={(e) => setExpectedCompletion(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Impact Level</InputLabel>
                  <Select
                    value={impactLevel}
                    label="Impact Level"
                    onChange={(e) => setImpactLevel(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <MenuItem value="low">Low - Minor delays expected</MenuItem>
                    <MenuItem value="medium">Medium - Moderate delays expected</MenuItem>
                    <MenuItem value="high">High - Significant delays expected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={roadFullyClosed}
                      onChange={(e) => setRoadFullyClosed(e.target.checked)}
                    />
                  }
                  label="Road Fully Closed"
                />
                {roadFullyClosed && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      This will mark the road as "Closed" status. Make sure alternate routes are configured.
                    </Typography>
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 4: // STEP 5: Advanced Options
        return (
          <Box sx={{ mt: 2 }}>
            <Accordion expanded={showAdvanced} onChange={(e, expanded) => setShowAdvanced(expanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Advanced Options {!showAdvanced && '(Most admins will never open this)'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g., Between Windhoek and Okahandja, KM 125-135"
                    />
                  </Grid>

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
                      label="Estimated Duration"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="e.g., 3 months, 2 weeks"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={priority}
                        label="Priority"
                        onChange={(e) => setPriority(e.target.value as any)}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      GPS Fine-tuning (Optional)
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Latitude"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          placeholder="e.g., -22.5597"
                          type="number"
                          inputProps={{ step: 'any' }}
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
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<MapIcon />}
                          onClick={() => setShowRouteMapAll(0)}
                          sx={{ height: '56px' }}
                        >
                          Map
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Structured Alternate Routes (Power users only)
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addAlternateRoute}
                        size="small"
                      >
                        Add Route
                      </Button>
                    </Stack>

                    {alternateRoutes.length === 0 ? (
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography variant="body2" color="text.secondary">
                          No alternate routes defined. Add routes for better navigation experience.
                        </Typography>
                      </Paper>
                    ) : (
                      <Stack spacing={2}>
                        {alternateRoutes.map((route, routeIndex) => (
                          <Accordion key={routeIndex}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                {route.routeName}
                              </Typography>
                              {route.distanceKm && (
                                <Chip label={`${route.distanceKm} km`} size="small" sx={{ mr: 1 }} />
                              )}
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Route Name"
                                    value={route.routeName}
                                    onChange={(e) => updateAlternateRoute(routeIndex, { routeName: e.target.value })}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Autocomplete
                                    multiple
                                    freeSolo
                                    options={[]}
                                    value={route.roadsUsed}
                                    onChange={(_, newValue) => updateAlternateRoute(routeIndex, { roadsUsed: newValue })}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Roads Used" size="small" placeholder="e.g., B2, C28" />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                      value.map((option, index) => (
                                        <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} size="small" />
                                      ))
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<MapIcon />}
                                    onClick={() => setShowRouteMapAll(showRouteMapAll === routeIndex ? null : routeIndex)}
                                  >
                                    {showRouteMapAll === routeIndex ? 'Hide Map' : 'Show Map for Waypoints'}
                                  </Button>
                                </Grid>
                                {showRouteMapAll === routeIndex && (
                                  <Grid item xs={12}>
                                    <RouteWaypointMap
                                      waypoints={route.waypoints}
                                      onWaypointAdd={(location) => {
                                        const newWaypoint = {
                                          name: location.address || location.roadName || `Waypoint ${route.waypoints.length + 1}`,
                                          coordinates: location.coordinates,
                                        };
                                        updateAlternateRoute(routeIndex, {
                                          waypoints: [...route.waypoints, newWaypoint],
                                        });
                                      }}
                                      onWaypointUpdate={(waypointIndex, location) => {
                                        updateWaypoint(routeIndex, waypointIndex, {
                                          coordinates: location.coordinates,
                                          name: location.address || location.roadName || `Waypoint ${waypointIndex + 1}`,
                                        });
                                      }}
                                      height="300px"
                                    />
                                  </Grid>
                                )}
                                <Grid item xs={12}>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => removeAlternateRoute(routeIndex)}
                                    size="small"
                                  >
                                    Remove Route
                                  </Button>
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 5: // STEP 6: Publish
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Final Step:</strong> Review your roadwork information and publish when ready. 
                The system will validate that lane coloring exists before publishing.
              </Typography>
            </Alert>

            {/* Summary Card */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Roadwork Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Road:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {roadName || 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Region:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {region || 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Title:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {title || 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Affected Lanes:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {laneSegments.length} lane segment(s) marked
                    </Typography>
                  </Grid>
                  {startDate && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Start Date:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  {expectedCompletion && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expected Completion:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(expectedCompletion).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Ongoing">Ongoing</MenuItem>
                    <MenuItem value="Planned">Planned</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                    <MenuItem value="Restricted">Restricted</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                  }
                  label="Publish to Public App"
                />
                {published && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      This roadwork will be visible to all users in the public app.
                    </Typography>
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isEditMode ? 'Edit Roadwork' : 'Create New Roadwork'}
        </Typography>
        <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>
          Cancel
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {STEPS.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{ cursor: index < activeStep ? 'pointer' : 'default' }}
              >
                {label}
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === STEPS.length - 1 ? handleSubmit : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={saving}
                    startIcon={index === STEPS.length - 1 ? <SaveIcon /> : <NavigateNextIcon />}
                  >
                    {saving ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Saving...
                      </>
                    ) : index === STEPS.length - 1 ? (
                      'Publish Road Status'
                    ) : (
                      'Next'
                    )}
                  </Button>
                  {index > 0 && (
                    <Button
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                      startIcon={<NavigateBeforeIcon />}
                    >
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default RoadStatusForm;

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
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Map as MapIcon,
  LocationOn as LocationOnIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Route as RouteIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
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

const RoadStatusForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [selectedRoad, setSelectedRoad] = useState<RoadEntry | null>(null);
  const [roadCustom, setRoadCustom] = useState('');
  const [section, setSection] = useState('');
  const [area, setArea] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<RoadStatusCreateInput['status']>('Planned');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [alternativeRoute, setAlternativeRoute] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [affectedLanes, setAffectedLanes] = useState('');
  const [contractor, setContractor] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [published, setPublished] = useState(false);

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

  // Geocoding validation state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [showGeocodingValidation, setShowGeocodingValidation] = useState(false);
  
  // Map integration state
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [mapSelectedLocation, setMapSelectedLocation] = useState<{
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  } | null>(null);
  
  // Location verification state
  const [locationVerified, setLocationVerified] = useState(false);
  const [coordinateError, setCoordinateError] = useState<string | null>(null);

  // Computed values
  const roadName = selectedRoad ? selectedRoad.displayName : roadCustom;
  const availableTowns = region ? TOWNS_BY_REGION[region] || ALL_TOWNS : ALL_TOWNS;
  const isCriticalStatus = status === 'Closed' || status === 'Restricted';
  const coordinatesRequired = isCriticalStatus;

  // Vehicle types for alternate routes
  const VEHICLE_TYPES = ['All', 'Light Vehicles', 'Heavy Vehicles', 'Motorcycles', 'Buses', 'Trucks'];

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
    
    if (updated[routeIndex].waypoints.length >= 2) {
      calculateRouteMetrics(routeIndex);
    }
  };

  const removeWaypoint = (routeIndex: number, waypointIndex: number) => {
    const updated = [...alternateRoutes];
    updated[routeIndex].waypoints = updated[routeIndex].waypoints.filter((_, i) => i !== waypointIndex);
    setAlternateRoutes(updated);
    if (updated[routeIndex].waypoints.length >= 2) {
      calculateRouteMetrics(routeIndex);
    }
  };

  const calculateRouteMetrics = (routeIndex: number) => {
    const route = alternateRoutes[routeIndex];
    if (route.waypoints.length < 2) return;

    let totalDistance = 0;
    for (let i = 0; i < route.waypoints.length - 1; i++) {
      const wp1 = route.waypoints[i].coordinates;
      const wp2 = route.waypoints[i + 1].coordinates;
      const R = 6371;
      const dLat = (wp2.latitude - wp1.latitude) * Math.PI / 180;
      const dLon = (wp2.longitude - wp1.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(wp1.latitude * Math.PI / 180) * Math.cos(wp2.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    const avgSpeed = route.roadsUsed.some(r => r.startsWith('B') || r.startsWith('A')) ? 80 : 60;
    const hours = totalDistance / avgSpeed;
    const minutes = Math.round(hours * 60);
    const timeString = hours >= 1 
      ? `${Math.floor(hours)}h ${minutes % 60}m`
      : `${minutes}m`;

    updateAlternateRoute(routeIndex, {
      distanceKm: Math.round(totalDistance * 100) / 100,
      estimatedTime: timeString,
    });
  };

  const handleWaypointMapSelect = (routeIndex: number, waypointIndex: number, location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => {
    updateWaypoint(routeIndex, waypointIndex, {
      coordinates: location.coordinates,
      name: location.address || location.roadName || `Waypoint ${waypointIndex + 1}`,
    });
    setShowRouteMap(null);
  };

  const handleRouteMapClick = (routeIndex: number, location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => {
    const updated = [...alternateRoutes];
    const newWaypoint = {
      name: location.address || location.roadName || `Waypoint ${updated[routeIndex].waypoints.length + 1}`,
      coordinates: location.coordinates,
    };
    updated[routeIndex].waypoints.push(newWaypoint);
    setAlternateRoutes(updated);
    
    if (updated[routeIndex].waypoints.length >= 2) {
      const distance = calculateRouteDistance(updated[routeIndex].waypoints.map(wp => wp.coordinates));
      const time = estimateRouteTime(distance, updated[routeIndex].roadsUsed);
      updated[routeIndex].distanceKm = distance;
      updated[routeIndex].estimatedTime = time;
      setAlternateRoutes(updated);
    }
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

  useEffect(() => {
    if (isEditMode && id) {
      loadRoadwork(id);
    }
  }, [id, isEditMode]);

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

      setSection(rw.section || '');
      setArea(rw.area || '');
      setRegion(rw.region);
      setStatus(rw.status);
      setTitle(rw.title);
      setDescription(rw.description || '');
      setStartDate(rw.startDate ? rw.startDate.split('T')[0] : '');
      setExpectedCompletion(rw.expectedCompletion ? rw.expectedCompletion.split('T')[0] : '');
      setAlternativeRoute(rw.alternativeRoute || '');
      setLatitude(rw.coordinates?.latitude?.toString() || '');
      setLongitude(rw.coordinates?.longitude?.toString() || '');
      setAffectedLanes(rw.affectedLanes || '');
      setContractor(rw.contractor || '');
      setEstimatedDuration(rw.estimatedDuration || '');
      setPriority(rw.priority || 'medium');
      setPublished(rw.published);
    } catch (err: any) {
      console.error('Error loading roadwork:', err);
      setError(err.response?.data?.error?.message || 'Failed to load roadwork data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roadName || !area || !region) {
      setGeocodingResult(null);
      setShowGeocodingValidation(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsGeocoding(true);
      setShowGeocodingValidation(true);

      try {
        const result = await validateRoadLocation(roadName, section, area, region);
        setGeocodingResult(result);
      } catch (err) {
        setGeocodingResult({
          success: false,
          error: 'Geocoding validation failed',
        });
      } finally {
        setIsGeocoding(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [roadName, section, area, region]);

  const validateNamibiaCoordinates = (lat: number, lon: number): { valid: boolean; error?: string } => {
    const NAMIBIA_BOUNDS = {
      minLat: -28,
      maxLat: -16,
      minLon: 11,
      maxLon: 26
    };

    if (lat < NAMIBIA_BOUNDS.minLat || lat > NAMIBIA_BOUNDS.maxLat) {
      return {
        valid: false,
        error: `Latitude must be between ${NAMIBIA_BOUNDS.minLat} and ${NAMIBIA_BOUNDS.maxLat} (Namibia range)`
      };
    }

    if (lon < NAMIBIA_BOUNDS.minLon || lon > NAMIBIA_BOUNDS.maxLon) {
      return {
        valid: false,
        error: `Longitude must be between ${NAMIBIA_BOUNDS.minLon} and ${NAMIBIA_BOUNDS.maxLon} (Namibia range)`
      };
    }

    return { valid: true };
  };

  const handleMapLocationSelect = useCallback((location: {
    coordinates: { latitude: number; longitude: number };
    address?: string;
    roadName?: string;
    area?: string;
    region?: string;
  }) => {
    const validation = validateNamibiaCoordinates(
      location.coordinates.latitude,
      location.coordinates.longitude
    );

    if (!validation.valid) {
      setCoordinateError(validation.error || 'Coordinates are outside Namibia');
      return;
    }

    setMapSelectedLocation(location);
    setCoordinateError(null);
    
    setLatitude(location.coordinates.latitude.toString());
    setLongitude(location.coordinates.longitude.toString());
    
    setLocationVerified(true);
    
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
    
    if (!title && location.roadName) {
      const statusText = status === 'Planned' ? 'Planned roadwork' : 
                        status === 'Ongoing' ? 'Ongoing roadwork' :
                        status === 'Closed' ? 'Road closure' :
                        status === 'Restricted' ? 'Road restrictions' : 'Roadwork';
      setTitle(`${statusText} on ${location.roadName}${location.area ? ` near ${location.area}` : ''}`);
    }
  }, [roadName, area, region, title, status]);

  const handleReverseGeocode = useCallback(async () => {
    if (!latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const namibiaValidation = validateNamibiaCoordinates(lat, lon);
    if (!namibiaValidation.valid) {
      setCoordinateError(namibiaValidation.error || 'Coordinates are outside Namibia');
      setLocationVerified(false);
      return;
    }

    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      setCoordinateError(validation.error || 'Invalid coordinates');
      setLocationVerified(false);
      return;
    }

    setIsGeocoding(true);
    setCoordinateError(null);
    try {
      const result = await reverseGeocode(lat, lon);
      if (result.success) {
        setLocationVerified(true);
        setCoordinateError(null);
        alert(`✓ Location Verified: ${result.displayName}`);
      } else {
        setCoordinateError('Could not verify coordinates');
        setLocationVerified(false);
      }
    } catch (err) {
      setCoordinateError('Coordinate verification failed');
      setLocationVerified(false);
    } finally {
      setIsGeocoding(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (latitude || longitude) {
      setLocationVerified(false);
      setCoordinateError(null);
    }
  }, [latitude, longitude]);

  const validateForm = (): { valid: boolean; error?: string } => {
    if (!roadName || !roadName.trim()) {
      return { valid: false, error: 'Road name is required' };
    }
    if (!section || !section.trim()) {
      return { valid: false, error: 'Section is required (e.g., "Between Town A and Town B")' };
    }
    if (!area || !area.trim()) {
      return { valid: false, error: 'Area/Town is required' };
    }
    if (!region) {
      return { valid: false, error: 'Region is required' };
    }
    if (!title || !title.trim()) {
      return { valid: false, error: 'Title is required' };
    }

    if (alternateRoutes.length > 0) {
      for (let i = 0; i < alternateRoutes.length; i++) {
        const route = alternateRoutes[i];
        
        if (!route.routeName || !route.routeName.trim()) {
          continue;
        }
        
        if (route.waypoints.length > 0) {
          if (route.waypoints.length < 2) {
            return { valid: false, error: `Route "${route.routeName}": At least 2 waypoints are required for navigation. Add more waypoints or remove this route.` };
          }
          
          for (let j = 0; j < route.waypoints.length; j++) {
            const waypoint = route.waypoints[j];
            if (!waypoint.name || !waypoint.name.trim()) {
              return { valid: false, error: `Route "${route.routeName}": Waypoint ${j + 1} name is required` };
            }
            if (!waypoint.coordinates || 
                typeof waypoint.coordinates.latitude !== 'number' || 
                typeof waypoint.coordinates.longitude !== 'number' ||
                (waypoint.coordinates.latitude === 0 && waypoint.coordinates.longitude === 0)) {
              return { valid: false, error: `Route "${route.routeName}": Waypoint "${waypoint.name || j + 1}" has invalid coordinates. Click "Map" button to select location.` };
            }
            
            const coordValidation = validateNamibiaCoordinates(
              waypoint.coordinates.latitude,
              waypoint.coordinates.longitude
            );
            if (!coordValidation.valid) {
              return { valid: false, error: `Route "${route.routeName}": Waypoint "${waypoint.name}" coordinates are outside Namibia bounds` };
            }
          }
        }
      }
    }

    if (coordinatesRequired) {
      if (!latitude || !longitude) {
        return {
          valid: false,
          error: 'GPS coordinates are required for Closed/Restricted roads',
        };
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      const namibiaValidation = validateNamibiaCoordinates(lat, lon);
      if (!namibiaValidation.valid) {
        return { valid: false, error: namibiaValidation.error };
      }

      const coordValidation = validateCoordinates(latitude, longitude);
      if (!coordValidation.valid) {
        return { valid: false, error: coordValidation.error };
      }

      if (!locationVerified) {
        return {
          valid: false,
          error: 'Please verify the location using the map or "Verify" button before saving'
        };
      }
    }

    if (startDate && expectedCompletion) {
      const start = new Date(startDate);
      const completion = new Date(expectedCompletion);
      if (start > completion) {
        return {
          valid: false,
          error: 'Start date cannot be after expected completion date'
        };
      }
    }

    if (published && (status === 'Planned' || status === 'Planned Works')) {
      if (startDate) {
        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (start < now) {
          return {
            valid: false,
            error: 'Planned roadworks with a past start date cannot be published'
          };
        }
      }
    }

    if (!latitude && !longitude) {
      if (!geocodingResult || !geocodingResult.success) {
        return {
          valid: false,
          error: 'Location could not be geocoded. Please provide GPS coordinates manually.',
        };
      }
    }

    if (description && description.trim()) {
      const desc = description.trim();
      if (desc.length > 1000) {
        return { 
          valid: false, 
          error: 'Description must be 1000 characters or less' 
        };
      }
      
      const errorPatterns = [
        /ERROR\s+\[Error:/i,
        /TransformError/i,
        /SyntaxError/i,
        /ValidationError/i,
        /at\s+\w+\.\w+\(/i,
        /at\s+file:\/\//i,
        /node_modules/i,
        /\.js:\d+:\d+/i,
      ];
      
      const hasErrorPattern = errorPatterns.some(pattern => pattern.test(desc));
      
      if (hasErrorPattern && (desc.startsWith('ERROR') || desc.startsWith('Error') || 
          (desc.includes('TransformError') || desc.includes('SyntaxError') || desc.includes('ValidationError')))) {
        return { 
          valid: false, 
          error: 'Description appears to contain an error message. Please enter a valid description.' 
        };
      }
    }

    return { valid: true };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error!);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let cleanDescription = description.trim() || undefined;
      if (cleanDescription && cleanDescription.length > 1000) {
        cleanDescription = cleanDescription.substring(0, 1000);
      }

      const data: RoadStatusCreateInput = {
        road: roadName.trim(),
        section: section.trim(),
        area: area.trim(),
        region,
        status,
        title: title.trim(),
        description: cleanDescription,
        startDate: startDate || undefined,
        expectedCompletion: expectedCompletion || undefined,
        alternativeRoute: alternativeRoute.trim() || undefined,
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
        coordinates:
          latitude && longitude
            ? {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }
            : undefined,
        affectedLanes: affectedLanes.trim() || undefined,
        contractor: contractor.trim() || undefined,
        estimatedDuration: estimatedDuration.trim() || undefined,
        priority,
        published,
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

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isEditMode ? 'Edit Roadwork' : 'Add New Roadwork'}
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

      {isCriticalStatus && (
        <Alert severity="warning" icon={<ErrorIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            CRITICAL ROAD STATUS
          </Typography>
          <Typography variant="body2">
            GPS coordinates are <strong>required</strong> for {status} roads to ensure accurate map display and
            public safety alerts.
          </Typography>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* SECTION 1: Basic Information */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                1. Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={ALL_ROADS}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.displayName)}
                    value={selectedRoad}
                    onChange={(event, newValue) => {
                      if (typeof newValue === 'string') {
                        setRoadCustom(newValue);
                        setSelectedRoad(null);
                      } else {
                        setSelectedRoad(newValue);
                        setRoadCustom('');
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
                        label="Road Name"
                        required
                        placeholder="Start typing or select..."
                        helperText="Select official road or enter custom name"
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

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g., Between Windhoek and Okahandja, KM 125-135"
                    helperText="Required: Describe the road section"
                    error={!section || !section.trim()}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={availableTowns}
                    value={area}
                    onChange={(event, newValue) => setArea(newValue || '')}
                    freeSolo
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Area / Town"
                        required
                        placeholder="Select or type town name"
                        helperText="Required for geocoding"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Brief description of the work"
                    helperText="e.g., Emergency repairs, Routine maintenance, Road resurfacing"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Detailed description of the roadwork"
                    helperText={`${description.length}/1000 characters`}
                  />
                </Grid>

                {showGeocodingValidation && (
                  <Grid item xs={12}>
                    {isGeocoding ? (
                      <Alert severity="info" icon={<CircularProgress size={20} />}>
                        Validating location...
                      </Alert>
                    ) : geocodingResult?.success ? (
                      <Alert severity="success" icon={<CheckCircleIcon />}>
                        <Typography variant="body2" fontWeight="bold">
                          ✓ Location Found
                        </Typography>
                        <Typography variant="caption" display="block">
                          {geocodingResult.displayName}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Coordinates: {geocodingResult.latitude?.toFixed(4)}, {geocodingResult.longitude?.toFixed(4)}
                        </Typography>
                      </Alert>
                    ) : (
                      <Alert severity="warning" icon={<ErrorIcon />}>
                        <Typography variant="body2" fontWeight="bold">
                          ⚠️ Location Not Found
                        </Typography>
                        <Typography variant="caption" display="block">
                          {geocodingResult?.error || 'Could not geocode this location'}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Please provide GPS coordinates manually below
                        </Typography>
                      </Alert>
                    )}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* SECTION 2: Status & Timeline */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                2. Status & Timeline
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as any)}>
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="Ongoing">Ongoing</MenuItem>
                      <MenuItem value="Ongoing Maintenance">Ongoing Maintenance</MenuItem>
                      <MenuItem value="Planned">Planned</MenuItem>
                      <MenuItem value="Planned Works">Planned Works</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                      <MenuItem value="Restricted">Restricted</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value as any)}>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={<Switch checked={published} onChange={(e) => setPublished(e.target.checked)} />}
                    label="Published"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Expected Completion"
                    type="date"
                    value={expectedCompletion}
                    onChange={(e) => setExpectedCompletion(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Estimated Duration"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g., 3 months, 2 weeks"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SECTION 3: Work Details */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                3. Work Details
              </Typography>
              <Grid container spacing={3}>
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
                    label="Affected Lanes"
                    value={affectedLanes}
                    onChange={(e) => setAffectedLanes(e.target.value)}
                    placeholder="e.g., Both lanes, North-bound lane"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alternative Route (Legacy)"
                    value={alternativeRoute}
                    onChange={(e) => setAlternativeRoute(e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Simple text description (for backward compatibility)"
                    helperText="For best navigation experience, use the structured alternate routes section below"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SECTION 4: Location Coordinates */}
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  4. Location Coordinates
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {coordinatesRequired && <Chip label="REQUIRED" color="error" size="small" />}
                  <Button
                    variant={showMapSelector ? "contained" : "outlined"}
                    size="small"
                    startIcon={showMapSelector ? <VisibilityOffIcon /> : <LocationOnIcon />}
                    onClick={() => setShowMapSelector(!showMapSelector)}
                  >
                    {showMapSelector ? 'Hide Map' : 'Show Map'}
                  </Button>
                </Stack>
              </Stack>

              {showMapSelector && (
                <Box sx={{ mb: 3 }}>
                  <MapLocationSelector
                    onLocationSelect={handleMapLocationSelect}
                    initialCoordinates={
                      latitude && longitude 
                        ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
                        : undefined
                    }
                    height="500px"
                    showSearch={true}
                    showRoadDetection={true}
                  />
                  {mapSelectedLocation && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        ✓ Location Selected from Map
                      </Typography>
                      <Typography variant="caption" display="block">
                        {mapSelectedLocation.address || `${mapSelectedLocation.coordinates.latitude.toFixed(6)}, ${mapSelectedLocation.coordinates.longitude.toFixed(6)}`}
                      </Typography>
                      {mapSelectedLocation.roadName && (
                        <Typography variant="caption" display="block">
                          Road: {mapSelectedLocation.roadName}
                        </Typography>
                      )}
                    </Alert>
                  )}
                  {coordinateError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        ❌ Invalid Coordinates
                      </Typography>
                      <Typography variant="caption" display="block">
                        {coordinateError}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}

              {!showMapSelector && (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>How to get coordinates:</strong>
                  </Typography>
                  <Typography variant="caption" component="div">
                    1. Open{' '}
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${buildSearchText(
                        roadName,
                        section,
                        area,
                        region
                      )}`}
                      target="_blank"
                      rel="noopener"
                    >
                      Google Maps
                    </Link>
                  </Typography>
                  <Typography variant="caption" component="div">
                    2. Right-click on the exact location and copy coordinates
                  </Typography>
                </Alert>
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
                    required={coordinatesRequired}
                    error={coordinatesRequired && (!latitude || !!coordinateError)}
                    helperText={
                      coordinateError 
                        ? coordinateError 
                        : coordinatesRequired && !latitude 
                          ? 'Required for this status' 
                          : 'Must be between -28 and -16 (Namibia)'
                    }
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
                    required={coordinatesRequired}
                    error={coordinatesRequired && (!longitude || !!coordinateError)}
                    helperText={
                      coordinateError 
                        ? coordinateError 
                        : coordinatesRequired && !longitude 
                          ? 'Required for this status' 
                          : 'Must be between 11 and 26 (Namibia)'
                    }
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={handleReverseGeocode}
                    disabled={!latitude || !longitude || isGeocoding}
                    sx={{ height: '56px' }}
                  >
                    {isGeocoding ? <CircularProgress size={20} /> : 'Verify'}
                  </Button>
                </Grid>
              </Grid>

              {latitude && longitude && (
                <Box sx={{ mt: 2 }}>
                  {locationVerified ? (
                    <Alert severity="success" icon={<CheckCircleIcon />}>
                      <Typography variant="body2" fontWeight="bold">
                        ✓ Location Verified
                      </Typography>
                      <Typography variant="caption" display="block">
                        Coordinates: {latitude}, {longitude}
                      </Typography>
                    </Alert>
                  ) : coordinatesRequired ? (
                    <Alert severity="warning" icon={<ErrorIcon />}>
                      <Typography variant="body2" fontWeight="bold">
                        ⚠️ Location Not Verified
                      </Typography>
                      <Typography variant="caption" display="block">
                        Please verify the location using the map or "Verify" button before saving
                      </Typography>
                    </Alert>
                  ) : null}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: Alternate Routes */}
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    5. Alternate Routes ({alternateRoutes.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create structured routes with waypoints for best navigation experience
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addAlternateRoute}
                >
                  Add Route
                </Button>
              </Stack>

              {alternateRoutes.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <RouteIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No alternate routes defined yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Add structured routes with waypoints to enable turn-by-turn navigation
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {alternateRoutes.map((route, routeIndex) => (
                    <Accordion key={routeIndex}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                            {route.routeName}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {route.isRecommended && (
                              <Chip label="Recommended" color="success" size="small" icon={<CheckCircleIcon />} />
                            )}
                            {route.distanceKm && (
                              <Chip label={`${route.distanceKm} km`} size="small" variant="outlined" />
                            )}
                            {route.estimatedTime && (
                              <Chip label={route.estimatedTime} size="small" variant="outlined" />
                            )}
                            {route.waypoints.length < 2 && (
                              <Chip label="Incomplete" color="warning" size="small" icon={<WarningIcon />} />
                            )}
                          </Stack>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Route Name"
                              value={route.routeName}
                              onChange={(e) => updateAlternateRoute(routeIndex, { routeName: e.target.value })}
                              placeholder="e.g., Route via B2 and C28"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Autocomplete
                              multiple
                              options={VEHICLE_TYPES}
                              value={route.vehicleType}
                              onChange={(_, newValue) => updateAlternateRoute(routeIndex, { vehicleType: newValue })}
                              renderInput={(params) => (
                                <TextField {...params} label="Vehicle Types" />
                              )}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                                ))
                              }
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Autocomplete
                              multiple
                              freeSolo
                              options={[]}
                              value={route.roadsUsed}
                              onChange={(_, newValue) => updateAlternateRoute(routeIndex, { roadsUsed: newValue })}
                              renderInput={(params) => (
                                <TextField {...params} label="Roads Used" placeholder="e.g., B2, C28, D1265" />
                              )}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                                ))
                              }
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2">
                                Waypoints ({route.waypoints.length}) - Minimum 2 required
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<MapIcon />}
                                  onClick={() => setShowRouteMapAll(showRouteMapAll === routeIndex ? null : routeIndex)}
                                >
                                  {showRouteMapAll === routeIndex ? 'Hide Map' : 'Show Map'}
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => addWaypoint(routeIndex)}
                                >
                                  Add Waypoint
                                </Button>
                              </Stack>
                            </Stack>
                            {showRouteMapAll === routeIndex && (
                              <Box sx={{ mt: 2, mb: 2 }}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Click on the map to add waypoints!</strong> Each click will add a new waypoint at that location.
                                  </Typography>
                                </Alert>
                                <RouteWaypointMap
                                  waypoints={route.waypoints}
                                  onWaypointAdd={(location) => handleRouteMapClick(routeIndex, location)}
                                  onWaypointUpdate={(waypointIndex, location) => {
                                    updateWaypoint(routeIndex, waypointIndex, {
                                      coordinates: location.coordinates,
                                      name: location.address || location.roadName || `Waypoint ${waypointIndex + 1}`,
                                    });
                                  }}
                                  height="400px"
                                />
                              </Box>
                            )}
                            {route.waypoints.length === 0 && (
                              <Alert severity="info" sx={{ mb: 2 }}>
                                Add at least 2 waypoints (start and end) to enable navigation.
                              </Alert>
                            )}
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              {route.waypoints.map((waypoint, waypointIndex) => (
                                <Paper key={waypointIndex} sx={{ p: 2 }}>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={4}>
                                      <TextField
                                        fullWidth
                                        label={`Waypoint ${waypointIndex + 1} Name`}
                                        value={waypoint.name}
                                        onChange={(e) => updateWaypoint(routeIndex, waypointIndex, { name: e.target.value })}
                                        placeholder="e.g., Start at Karibib"
                                      />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                      <TextField
                                        fullWidth
                                        type="number"
                                        label="Latitude"
                                        value={waypoint.coordinates.latitude || ''}
                                        onChange={(e) => updateWaypoint(routeIndex, waypointIndex, {
                                          coordinates: {
                                            ...waypoint.coordinates,
                                            latitude: parseFloat(e.target.value) || 0
                                          }
                                        })}
                                        inputProps={{ step: 'any' }}
                                      />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                      <TextField
                                        fullWidth
                                        type="number"
                                        label="Longitude"
                                        value={waypoint.coordinates.longitude || ''}
                                        onChange={(e) => updateWaypoint(routeIndex, waypointIndex, {
                                          coordinates: {
                                            ...waypoint.coordinates,
                                            longitude: parseFloat(e.target.value) || 0
                                          }
                                        })}
                                        inputProps={{ step: 'any' }}
                                      />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                      <Stack direction="row" spacing={1}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          startIcon={<MapIcon />}
                                          onClick={() => setShowRouteMap(routeIndex * 1000 + waypointIndex)}
                                        >
                                          Map
                                        </Button>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => removeWaypoint(routeIndex, waypointIndex)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                  {showRouteMap === routeIndex * 1000 + waypointIndex && (
                                    <Box sx={{ mt: 2 }}>
                                      <MapLocationSelector
                                        onLocationSelect={(location) => handleWaypointMapSelect(routeIndex, waypointIndex, location)}
                                        initialCoordinates={
                                          waypoint.coordinates.latitude && waypoint.coordinates.longitude
                                            ? waypoint.coordinates
                                            : undefined
                                        }
                                        height="300px"
                                      />
                                    </Box>
                                  )}
                                </Paper>
                              ))}
                            </Stack>
                            {route.waypoints.length >= 2 && (
                              <Alert severity="success" sx={{ mt: 2 }}>
                                ✓ Route ready for navigation! Distance and time calculated automatically.
                              </Alert>
                            )}
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={route.isRecommended}
                                  onChange={(e) => updateAlternateRoute(routeIndex, { isRecommended: e.target.checked })}
                                />
                              }
                              label="Mark as Recommended Route"
                            />
                          </Grid>

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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
              {saving ? <CircularProgress size={24} /> : isEditMode ? 'Update Roadwork' : 'Create Roadwork'}
            </Button>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default RoadStatusForm;

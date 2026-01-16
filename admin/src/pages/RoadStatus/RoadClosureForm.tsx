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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Map as MapIcon,
  Route as RouteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  getRoadClosureWithRoutes,
  createRoadClosureWithRoutes,
  updateRoadClosureWithRoutes,
  approveAlternateRoute,
  RoadStatus,
} from '../../services/roadStatus.service';

const REGIONS = [
  'Erongo', 'Hardap', 'ǁKaras', 'Kavango East', 'Kavango West',
  'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati',
  'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi',
];

const VEHICLE_TYPES = [
  'All', 'Light Vehicles', 'Heavy Vehicles', 'Motorcycles', 'Buses', 'Trucks'
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#94A3B8' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'critical', label: 'Critical', color: '#DC2626' },
];

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

interface RoadClosure {
  roadCode: string;
  startTown?: string;
  endTown?: string;
  startCoordinates: { latitude: number; longitude: number };
  endCoordinates: { latitude: number; longitude: number };
}

const RoadClosureForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [published, setPublished] = useState(false);

  // Road closure data
  const [roadClosure, setRoadClosure] = useState<RoadClosure>({
    roadCode: '',
    startTown: '',
    endTown: '',
    startCoordinates: { latitude: 0, longitude: 0 },
    endCoordinates: { latitude: 0, longitude: 0 },
  });

  // Alternate routes
  const [alternateRoutes, setAlternateRoutes] = useState<AlternateRoute[]>([]);

  useEffect(() => {
    if (isEditMode && id) {
      loadRoadClosure(id);
    }
  }, [id, isEditMode]);

  const loadRoadClosure = async (closureId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoadClosureWithRoutes(closureId);
      const { roadClosure: closure, alternateRoutes: routes } = response.data;

      if (closure) {
        setRoadClosure(closure);
        setTitle(`Road Closure: ${closure.roadCode}`);
        setDescription(`Road closed between ${closure.startTown || 'Start'} and ${closure.endTown || 'End'}`);
      }

      if (routes) {
        setAlternateRoutes(routes);
      }
    } catch (err: any) {
      console.error('Error loading road closure:', err);
      setError(err.message || 'Failed to load road closure');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!region) {
        throw new Error('Region is required');
      }
      if (!roadClosure.roadCode.trim()) {
        throw new Error('Road code is required');
      }
      if (!roadClosure.startCoordinates.latitude || !roadClosure.startCoordinates.longitude) {
        throw new Error('Start coordinates are required');
      }
      if (!roadClosure.endCoordinates.latitude || !roadClosure.endCoordinates.longitude) {
        throw new Error('End coordinates are required');
      }

      const data = {
        title: title.trim(),
        description: description.trim(),
        region,
        startDate: startDate || undefined,
        expectedCompletion: expectedCompletion || undefined,
        priority,
        published,
        roadClosure,
        alternateRoutes,
      };

      if (isEditMode && id) {
        await updateRoadClosureWithRoutes(id, data);
      } else {
        await createRoadClosureWithRoutes(data);
      }

      navigate('/road-status');
    } catch (err: any) {
      console.error('Error saving road closure:', err);
      setError(err.message || 'Failed to save road closure');
    } finally {
      setSaving(false);
    }
  };

  const addAlternateRoute = () => {
    const newRoute: AlternateRoute = {
      routeName: `Route ${alternateRoutes.length + 1}`,
      roadsUsed: [],
      waypoints: [],
      vehicleType: ['All'],
      isRecommended: alternateRoutes.length === 0, // First route is recommended by default
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
    const updated = alternateRoutes.filter((_, i) => i !== index);
    setAlternateRoutes(updated);
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

  const handleApproveRoute = async (routeIndex: number) => {
    if (!isEditMode || !id) return;

    try {
      await approveAlternateRoute(id, routeIndex);
      updateAlternateRoute(routeIndex, { approved: true });
    } catch (err: any) {
      console.error('Error approving route:', err);
      setError(err.message || 'Failed to approve route');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Road Closure' : 'Create Road Closure'}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/road-status')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      label="Region"
                    >
                      {REGIONS.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
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
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      label="Priority"
                    >
                      {PRIORITY_LEVELS.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              width={12}
                              height={12}
                              borderRadius="50%"
                              bgcolor={p.color}
                            />
                            {p.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                      />
                    }
                    label="Published (visible to mobile users)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Road Closure Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Road Closure Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Road Code"
                    value={roadClosure.roadCode}
                    onChange={(e) => setRoadClosure({ ...roadClosure, roadCode: e.target.value })}
                    placeholder="e.g., B1, C28"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Start Town"
                    value={roadClosure.startTown || ''}
                    onChange={(e) => setRoadClosure({ ...roadClosure, startTown: e.target.value })}
                    placeholder="e.g., Okahandja"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="End Town"
                    value={roadClosure.endTown || ''}
                    onChange={(e) => setRoadClosure({ ...roadClosure, endTown: e.target.value })}
                    placeholder="e.g., Otjiwarongo"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Start Coordinates
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        type="number"
                        value={roadClosure.startCoordinates.latitude || ''}
                        onChange={(e) => setRoadClosure({
                          ...roadClosure,
                          startCoordinates: {
                            ...roadClosure.startCoordinates,
                            latitude: parseFloat(e.target.value) || 0
                          }
                        })}
                        inputProps={{ step: 'any' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        type="number"
                        value={roadClosure.startCoordinates.longitude || ''}
                        onChange={(e) => setRoadClosure({
                          ...roadClosure,
                          startCoordinates: {
                            ...roadClosure.startCoordinates,
                            longitude: parseFloat(e.target.value) || 0
                          }
                        })}
                        inputProps={{ step: 'any' }}
                        required
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    End Coordinates
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        type="number"
                        value={roadClosure.endCoordinates.latitude || ''}
                        onChange={(e) => setRoadClosure({
                          ...roadClosure,
                          endCoordinates: {
                            ...roadClosure.endCoordinates,
                            latitude: parseFloat(e.target.value) || 0
                          }
                        })}
                        inputProps={{ step: 'any' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        type="number"
                        value={roadClosure.endCoordinates.longitude || ''}
                        onChange={(e) => setRoadClosure({
                          ...roadClosure,
                          endCoordinates: {
                            ...roadClosure.endCoordinates,
                            longitude: parseFloat(e.target.value) || 0
                          }
                        })}
                        inputProps={{ step: 'any' }}
                        required
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alternate Routes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Alternate Routes ({alternateRoutes.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addAlternateRoute}
                >
                  Add Route
                </Button>
              </Box>

              {alternateRoutes.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <RouteIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No alternate routes defined yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add alternate routes to help drivers navigate around the closure
                  </Typography>
                </Paper>
              ) : (
                alternateRoutes.map((route, routeIndex) => (
                  <Accordion key={routeIndex} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          {route.routeName}
                        </Typography>
                        <Box display="flex" gap={1}>
                          {route.isRecommended && (
                            <Chip
                              label="Recommended"
                              color="success"
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          )}
                          {route.approved ? (
                            <Chip
                              label="Approved"
                              color="primary"
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip
                              label="Pending"
                              color="warning"
                              size="small"
                              icon={<WarningIcon />}
                            />
                          )}
                        </Box>
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
                                <Chip
                                  variant="outlined"
                                  label={option}
                                  {...getTagProps({ index })}
                                  key={option}
                                />
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
                              <TextField {...params} label="Roads Used" placeholder="e.g., C28, D1265" />
                            )}
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <Chip
                                  variant="outlined"
                                  label={option}
                                  {...getTagProps({ index })}
                                  key={option}
                                />
                              ))
                            }
                          />
                        </Grid>

                        {/* Waypoints */}
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2">
                              Waypoints ({route.waypoints.length})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => addWaypoint(routeIndex)}
                            >
                              Add Waypoint
                            </Button>
                          </Box>
                          {route.waypoints.map((waypoint, waypointIndex) => (
                            <Paper key={waypointIndex} sx={{ p: 2, mb: 1 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                  <TextField
                                    fullWidth
                                    label="Waypoint Name"
                                    value={waypoint.name}
                                    onChange={(e) => updateWaypoint(routeIndex, waypointIndex, { name: e.target.value })}
                                    placeholder="e.g., Gross Barmen"
                                  />
                                </Grid>
                                <Grid item xs={5} md={3}>
                                  <TextField
                                    fullWidth
                                    label="Latitude"
                                    type="number"
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
                                <Grid item xs={5} md={3}>
                                  <TextField
                                    fullWidth
                                    label="Longitude"
                                    type="number"
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
                                <Grid item xs={2}>
                                  <IconButton
                                    color="error"
                                    onClick={() => removeWaypoint(routeIndex, waypointIndex)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Grid>

                        <Grid item xs={12}>
                          <Box display="flex" gap={2} alignItems="center">
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={route.isRecommended}
                                  onChange={(e) => updateAlternateRoute(routeIndex, { isRecommended: e.target.checked })}
                                />
                              }
                              label="Recommended Route"
                            />
                            {isEditMode && !route.approved && (
                              <Button
                                variant="outlined"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApproveRoute(routeIndex)}
                              >
                                Approve Route
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => removeAlternateRoute(routeIndex)}
                            >
                              Remove Route
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoadClosureForm;
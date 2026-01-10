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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Map as MapIcon,
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
  const [roadCustom, setRoadCustom] = useState(''); // For custom road names
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

  // Geocoding validation state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [showGeocodingValidation, setShowGeocodingValidation] = useState(false);

  // Computed values
  const roadName = selectedRoad ? selectedRoad.displayName : roadCustom;
  const availableTowns = region ? TOWNS_BY_REGION[region] || ALL_TOWNS : ALL_TOWNS;
  const isCriticalStatus = status === 'Closed' || status === 'Restricted';
  const coordinatesRequired = isCriticalStatus;

  useEffect(() => {
    if (isEditMode && id) {
      loadRoadwork(id);
    }
  }, [id, isEditMode]);

  /**
   * Load existing roadwork for editing
   */
  const loadRoadwork = async (roadworkId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoadStatusById(roadworkId);
      const rw = response.data.roadwork;

      // Try to match with predefined roads
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

  /**
   * Live geocoding validation with debouncing
   */
  useEffect(() => {
    // Only validate if we have minimum required fields
    if (!roadName || !area || !region) {
      setGeocodingResult(null);
      setShowGeocodingValidation(false);
      return;
    }

    // Debounce geocoding validation
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
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [roadName, section, area, region]);

  /**
   * Reverse geocode when coordinates are manually entered
   */
  const handleReverseGeocode = useCallback(async () => {
    if (!latitude || !longitude) return;

    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await reverseGeocode(parseFloat(latitude), parseFloat(longitude));
      if (result.success) {
        Alert.success(`Verified: ${result.displayName}`);
      } else {
        setError('Could not verify coordinates');
      }
    } catch (err) {
      setError('Coordinate verification failed');
    } finally {
      setIsGeocoding(false);
    }
  }, [latitude, longitude]);

  /**
   * Validation before save
   */
  const validateForm = (): { valid: boolean; error?: string } => {
    // Required fields
    if (!roadName || !roadName.trim()) {
      return { valid: false, error: 'Road name is required' };
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

    // Critical status validation
    if (coordinatesRequired) {
      if (!latitude || !longitude) {
        return {
          valid: false,
          error: 'GPS coordinates are required for Closed/Restricted roads',
        };
      }

      const coordValidation = validateCoordinates(latitude, longitude);
      if (!coordValidation.valid) {
        return { valid: false, error: coordValidation.error };
      }
    }

    // Geocoding validation (if no coordinates provided)
    if (!latitude && !longitude) {
      if (!geocodingResult || !geocodingResult.success) {
        return {
          valid: false,
          error: 'Location could not be geocoded. Please provide GPS coordinates manually.',
        };
      }
    }

    return { valid: true };
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error!);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data: RoadStatusCreateInput = {
        road: roadName.trim(),
        section: section.trim() || undefined,
        area: area.trim(),
        region,
        status,
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
      setError(err.response?.data?.error?.message || 'Failed to save roadwork');
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditMode ? 'Edit Roadwork' : 'Add New Roadwork'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Critical Status Warning */}
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
                      label="Section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g., Section 5, KM 125-135"
                      helperText="Optional: Specific section or kilometer range"
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
                    />
                  </Grid>
                </Grid>

                {/* Geocoding Validation Display */}
                {showGeocodingValidation && (
                  <Box sx={{ mt: 2 }}>
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
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Status & Timeline */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status & Timeline
                </Typography>
                <Grid container spacing={2}>
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
          </Grid>

          {/* Work Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Details
                </Typography>
                <Grid container spacing={2}>
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
                      label="Alternative Route"
                      value={alternativeRoute}
                      onChange={(e) => setAlternativeRoute(e.target.value)}
                      multiline
                      rows={2}
                      placeholder="Describe alternative routes for motorists"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Location Coordinates */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Location Coordinates</Typography>
                  {coordinatesRequired && <Chip label="REQUIRED" color="error" size="small" />}
                </Box>

                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
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
                    2. Right-click on the exact location
                  </Typography>
                  <Typography variant="caption" component="div">
                    3. Click the coordinates to copy them
                  </Typography>
                  <Typography variant="caption" component="div">
                    4. Paste below (format: -22.5597, 17.0832)
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
                      required={coordinatesRequired}
                      error={coordinatesRequired && !latitude}
                      helperText={coordinatesRequired && !latitude ? 'Required for this status' : ''}
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
                      error={coordinatesRequired && !longitude}
                      helperText={coordinatesRequired && !longitude ? 'Required for this status' : ''}
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
                      Verify
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                {saving ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default RoadStatusForm;

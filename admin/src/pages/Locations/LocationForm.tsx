import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Paper,
  Link,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  createLocation,
  updateLocation,
  getLocationById,
  LocationFormData,
} from '../../services/locations.service';
import {
  validateCoordinates,
  reverseGeocode,
  geocodeLocation,
  GeocodingResult,
} from '../../services/geocoding.service';

// NATIS Services available at offices
const NATIS_SERVICES = [
  'Vehicle Registration',
  'Driver\'s License Renewal',
  'Learner\'s License',
  'Professional Driving Permit (PDP)',
  'Vehicle License Renewal',
  'Roadworthy Certificate',
  'Clearance Certificate',
  'Duplicate Documents',
  'Change of Ownership',
  'Import/Export Permits',
  'Temporary Permits',
  'Fitness Certificate',
];

// Namibian regions
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

// Days of the week
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Allow either a valid HH:MM time or an empty string (when a time is not applicable)
const timeString = z.string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  .optional()
  .or(z.literal(''));

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  region: z.string().min(1, 'Region is required'),
  latitude: z
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: z
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  contactNumber: z
    .string()
    .max(20, 'Contact number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Must be a valid email')
    .max(100, 'Email must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  services: z.array(z.string()).optional(),
  operatingHours: z.object({
    weekdays: z.object({
      open: timeString,
      close: timeString,
    }).optional(),
    weekends: z.object({
      open: timeString,
      close: timeString,
    }).optional(),
    publicHolidays: z.object({
      open: timeString,
      close: timeString,
    }).optional(),
  }).optional(),
  closedDays: z.array(z.string()).optional(),
  specialHours: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    reason: z.string().min(1, 'Reason is required').max(200, 'Reason must be less than 200 characters'),
    closed: z.boolean(),
    hours: z.object({
      open: timeString,
      close: timeString,
    }).optional(),
  })).optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const LocationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      region: '',
      latitude: undefined,
      longitude: undefined,
      contactNumber: '',
      email: '',
      services: [],
      operatingHours: {
        weekdays: { open: '08:00', close: '17:00' },
        weekends: { open: '', close: '' },
        publicHolidays: { open: '', close: '' },
      },
      closedDays: [],
      specialHours: [],
    },
  });

  const { fields: specialHoursFields, append: appendSpecialHour, remove: removeSpecialHour } = useFieldArray({
    control,
    name: 'specialHours',
  });

  // Watch form values for geocoding
  const watchedName = watch('name');
  const watchedAddress = watch('address');
  const watchedRegion = watch('region');
  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  useEffect(() => {
    if (isEditMode && id) {
      fetchLocation();
    }
  }, [id, isEditMode]);

  // Geocoding with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedName && watchedAddress && watchedRegion) {
        performGeocode();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [watchedName, watchedAddress, watchedRegion]);

  const fetchLocation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getLocationById(id);
      const locationData = response.data.location;

      setValue('name', locationData.name);
      setValue('address', locationData.address);
      setValue('region', locationData.region);
      setValue('latitude', locationData.coordinates.latitude);
      setValue('longitude', locationData.coordinates.longitude);
      setValue('contactNumber', locationData.contactNumber || '');
      setValue('email', locationData.email || '');
      setValue('services', locationData.services || []);
      setValue('operatingHours', locationData.operatingHours || {});
      setValue('closedDays', locationData.closedDays || []);
      setValue('specialHours', locationData.specialHours || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch location');
    } finally {
      setLoading(false);
    }
  };

  const performGeocode = async () => {
    const searchQuery = `${watchedName} ${watchedAddress} ${watchedRegion} Namibia`;
    
    try {
      setIsGeocoding(true);
      const result = await geocodeLocation(searchQuery);
      setGeocodingResult(result);
      
      if (result.success && result.latitude && result.longitude) {
        setValue('latitude', result.latitude);
        setValue('longitude', result.longitude);
      }
    } catch (err) {
      console.warn('Geocoding failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleVerifyCoordinates = useCallback(async () => {
    console.log('🔍 Starting coordinate verification...');
    
    const latitude = getValues('latitude');
    const longitude = getValues('longitude');

    console.log('� Retrieved coordinates:', { 
      latitude, 
      longitude, 
      latType: typeof latitude, 
      lonType: typeof longitude 
    });

    // Check if coordinates are actually present
    if (latitude === undefined || latitude === null || 
        longitude === undefined || longitude === null) {
      const errorMsg = 'Please enter both latitude and longitude';
      console.error('❌ Validation failed:', errorMsg);
      setError(errorMsg);
      return;
    }

    // Convert to numbers if they're strings
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lon = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    
    console.log('📍 Converted coordinates:', { lat, lon });

    // Check if conversion was successful
    if (isNaN(lat) || isNaN(lon)) {
      const errorMsg = 'Coordinates must be valid numbers';
      console.error('❌ Invalid numbers:', errorMsg);
      setError(errorMsg);
      return;
    }

    const coordValidation = validateCoordinates(lat, lon);
    if (!coordValidation.valid) {
      console.error('❌ Coordinate validation failed:', coordValidation.error);
      setError(coordValidation.error!);
      return;
    }

    console.log('✅ Coordinates passed validation');
    setIsGeocoding(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🌐 Making reverse geocoding request...');
      const result = await reverseGeocode(lat, lon);
      console.log('📍 Geocoding result:', result);
      
      if (result.success) {
        const successMsg = `Verified: ${result.displayName}`;
        console.log('✅ Verification successful:', successMsg);
        setSuccess(successMsg);
        setError(null);
      } else {
        const errorMsg = result.error || 'Could not verify coordinates';
        console.error('❌ Verification failed:', errorMsg);
        setError(`Verification failed: ${errorMsg}`);
      }
    } catch (err: any) {
      const errorMsg = `Coordinate verification failed: ${err.message || err}`;
      console.error('❌ Exception during verification:', err);
      setError(errorMsg);
    } finally {
      setIsGeocoding(false);
    }
  }, [getValues]);

  const onSubmit = async (data: LocationFormValues) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Form submission data:', data);
      console.log('📋 Services data:', data.services);
      console.log('📋 Services type:', typeof data.services);
      console.log('📋 Services is array:', Array.isArray(data.services));

      // Validate coordinates are provided
      if (data.latitude === undefined || data.longitude === undefined) {
        setError('Please provide both latitude and longitude coordinates');
        return;
      }

      // Helper function to clean operating hours
      const cleanOperatingHours = (hours: any) => {
        if (!hours) return undefined;
        
        const cleanHoursPair = (pair: any) => {
          if (!pair || (!pair.open && !pair.close)) return undefined;
          return {
            open: pair.open || '',
            close: pair.close || '',
          };
        };

        const weekdays = cleanHoursPair(hours.weekdays);
        const weekends = cleanHoursPair(hours.weekends);
        const publicHolidays = cleanHoursPair(hours.publicHolidays);

        if (!weekdays && !weekends && !publicHolidays) return undefined;

        return {
          ...(weekdays && { weekdays }),
          ...(weekends && { weekends }),
          ...(publicHolidays && { publicHolidays }),
        };
      };

      // Helper function to clean special hours
      const cleanSpecialHours = (specialHours: any[]) => {
        if (!specialHours || specialHours.length === 0) return undefined;
        
        return specialHours.map(item => ({
          date: item.date,
          reason: item.reason,
          closed: item.closed,
          ...(item.hours && (item.hours.open || item.hours.close) && {
            hours: {
              open: item.hours.open || '',
              close: item.hours.close || '',
            }
          }),
        }));
      };

      const locationData: LocationFormData = {
        name: data.name,
        address: data.address,
        region: data.region,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        contactNumber: data.contactNumber || undefined,
        email: data.email || undefined,
        services: data.services,
        operatingHours: cleanOperatingHours(data.operatingHours),
        closedDays: data.closedDays || undefined,
        specialHours: cleanSpecialHours(data.specialHours || []),
      };

      console.log('📤 Sending location data:', locationData);
      console.log('📋 Final services data:', locationData.services);

      if (isEditMode && id) {
        await updateLocation(id, locationData);
        setSuccess('Location updated successfully');
      } else {
        await createLocation(locationData);
        setSuccess('Location created successfully');
      }

      setTimeout(() => {
        navigate('/locations');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Form submission error:', err);
      setError(err.response?.data?.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const addSpecialHour = () => {
    appendSpecialHour({
      date: '',
      reason: '',
      closed: false,
      hours: { open: '', close: '' },
    });
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/locations')}
          sx={{ mr: 2 }}
        >
          Back to Locations
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit NATIS Office' : 'Add New NATIS Office'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
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
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Office Name"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          placeholder="e.g., NATIS Windhoek Main Office"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="region"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.region}>
                          <InputLabel>Region</InputLabel>
                          <Select {...field} label="Region">
                            {REGIONS.map((region) => (
                              <MenuItem key={region} value={region}>
                                {region}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.region && (
                            <FormHelperText>{errors.region.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Address"
                          fullWidth
                          multiline
                          rows={2}
                          error={!!errors.address}
                          helperText={errors.address?.message}
                          placeholder="Full street address"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="contactNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Contact Number"
                          fullWidth
                          error={!!errors.contactNumber}
                          helperText={errors.contactNumber?.message}
                          placeholder="+264 61 123456"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          type="email"
                          fullWidth
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          placeholder="office@natis.gov.na"
                        />
                      )}
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
                <Typography variant="h6" gutterBottom>
                  Location Coordinates
                </Typography>
                
                {/* Geocoding Status */}
                {isGeocoding && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Validating location...
                    </Box>
                  </Alert>
                )}

                {geocodingResult && (
                  <Alert 
                    severity={geocodingResult.success ? 'success' : 'warning'} 
                    sx={{ mb: 2 }}
                    icon={geocodingResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                  >
                    {geocodingResult.success 
                      ? `Location found: ${geocodingResult.displayName}`
                      : `Could not geocode location: ${geocodingResult.error}`
                    }
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="latitude"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Latitude"
                          type="number"
                          fullWidth
                          error={!!errors.latitude}
                          helperText={errors.latitude?.message || 'Between -90 and 90 (e.g., -22.5609)'}
                          inputProps={{ step: 'any' }}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="longitude"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Longitude"
                          type="number"
                          fullWidth
                          error={!!errors.longitude}
                          helperText={errors.longitude?.message || 'Between -180 and 180 (e.g., 17.0658)'}
                          inputProps={{ step: 'any' }}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                          console.log('🔍 Debug: Button clicked');
                          console.log('🔍 Debug: Form values:', getValues());
                          console.log('🔍 Debug: Latitude field:', getValues('latitude'));
                          console.log('🔍 Debug: Longitude field:', getValues('longitude'));
                          handleVerifyCoordinates();
                        }}
                        disabled={isGeocoding}
                      >
                        Verify Coordinates
                      </Button>
                      <Link
                        href={`https://www.google.com/maps/@${watchedLatitude || -22.5609},${watchedLongitude || 17.0658},15z`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outlined" startIcon={<MapIcon />}>
                          Open in Google Maps
                        </Button>
                      </Link>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setValue('latitude', -22.5609);
                          setValue('longitude', 17.0658);
                        }}
                        sx={{ ml: 1 }}
                      >
                        Use Windhoek Example
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Namibian coordinates: Latitude -17 to -29, Longitude 11 to 26
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* NATIS Services */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Services
                </Typography>
                <Controller
                  name="services"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={NATIS_SERVICES}
                      value={field.value || []}
                      onChange={(_, newValue) => field.onChange(newValue)}
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
                      renderInput={(params) => {
                        const { size, ...filteredParams } = params;
                        return (
                          <TextField
                            {...filteredParams}
                            label="Services Available"
                            placeholder="Select services offered at this office"
                            helperText="Select all services available at this NATIS office"
                          />
                        );
                      }}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Operating Hours */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Operating Hours
                </Typography>
                <Grid container spacing={3}>
                  {/* Weekdays */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Weekdays (Mon-Fri)
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Controller
                          name="operatingHours.weekdays.open"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Open"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.operatingHours?.weekdays?.open}
                              helperText={errors.operatingHours?.weekdays?.open?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Controller
                          name="operatingHours.weekdays.close"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Close"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.operatingHours?.weekdays?.close}
                              helperText={errors.operatingHours?.weekdays?.close?.message}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Weekends */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Weekends (Sat-Sun)
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Controller
                          name="operatingHours.weekends.open"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Open"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.operatingHours?.weekends?.open}
                              helperText={errors.operatingHours?.weekends?.open?.message}
                              placeholder="Leave empty if closed"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Controller
                          name="operatingHours.weekends.close"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Close"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.operatingHours?.weekends?.close}
                              helperText={errors.operatingHours?.weekends?.close?.message}
                              placeholder="Leave empty if closed"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Public Holidays */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Public Holidays
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Controller
                          name="operatingHours.publicHolidays.open"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Open"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.operatingHours?.publicHolidays?.open}
                              helperText={errors.operatingHours?.publicHolidays?.open?.message}
                              placeholder="Leave empty if closed"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Controller
                          name="operatingHours.publicHolidays.close"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Close"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.operatingHours?.publicHolidays?.close}
                              helperText={errors.operatingHours?.publicHolidays?.close?.message}
                              placeholder="Leave empty if closed"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Closed Days */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Regular Closed Days
                </Typography>
                <Controller
                  name="closedDays"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      {DAYS_OF_WEEK.map((day) => (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              checked={field.value?.includes(day) || false}
                              onChange={(e) => {
                                const currentDays = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentDays, day]);
                                } else {
                                  field.onChange(currentDays.filter(d => d !== day));
                                }
                              }}
                            />
                          }
                          label={day}
                        />
                      ))}
                      <FormHelperText>
                        Select days when the office is regularly closed
                      </FormHelperText>
                    </Box>
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Special Hours/Holidays */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Special Hours & Holidays
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addSpecialHour}
                    variant="outlined"
                  >
                    Add Special Day
                  </Button>
                </Box>
                
                {specialHoursFields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Controller
                          name={`specialHours.${index}.date`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Date"
                              type="date"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              error={!!errors.specialHours?.[index]?.date}
                              helperText={errors.specialHours?.[index]?.date?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Controller
                          name={`specialHours.${index}.reason`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Reason"
                              fullWidth
                              error={!!errors.specialHours?.[index]?.reason}
                              helperText={errors.specialHours?.[index]?.reason?.message}
                              placeholder="e.g., Independence Day, Maintenance"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Controller
                          name={`specialHours.${index}.closed`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              }
                              label="Closed"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Controller
                          name={`specialHours.${index}.hours.open`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Open"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              disabled={watch(`specialHours.${index}.closed`) || false}
                              error={!!errors.specialHours?.[index]?.hours?.open}
                              helperText={errors.specialHours?.[index]?.hours?.open?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Controller
                          name={`specialHours.${index}.hours.close`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Close"
                              type="time"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              disabled={watch(`specialHours.${index}.closed`) || false}
                              error={!!errors.specialHours?.[index]?.hours?.close}
                              helperText={errors.specialHours?.[index]?.hours?.close?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          onClick={() => removeSpecialHour(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                
                {specialHoursFields.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No special hours configured. Click "Add Special Day" to add holidays or special operating hours.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/locations')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Office' : 'Create Office'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default LocationForm;
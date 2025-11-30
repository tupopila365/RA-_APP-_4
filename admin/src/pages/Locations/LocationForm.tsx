import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import {
  createLocation,
  updateLocation,
  getLocationById,
  LocationFormData,
} from '../../services/locations.service';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  region: z.string().min(1, 'Region is required').max(50, 'Region must be less than 50 characters'),
  latitude: z
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
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
});

type LocationFormValues = z.infer<typeof locationSchema>;

const LocationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      region: '',
      latitude: 0,
      longitude: 0,
      contactNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchLocation();
    }
  }, [id, isEditMode]);

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
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch location');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LocationFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData: LocationFormData = {
        name: data.name,
        address: data.address,
        region: data.region,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        contactNumber: data.contactNumber ? data.contactNumber : undefined,
        email: data.email ? data.email : undefined,
      };

      if (isEditMode && id) {
        await updateLocation(id, formData);
        setSuccess('Location updated successfully');
      } else {
        await createLocation(formData);
        setSuccess('Location created successfully');
      }

      setTimeout(() => {
        navigate('/locations');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/locations');
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Location' : 'Add Location'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Office Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
              )}
            />

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Address"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  required
                />
              )}
            />

            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Region"
                  fullWidth
                  margin="normal"
                  error={!!errors.region}
                  helperText={errors.region?.message || 'e.g., Khomas, Erongo, Oshana'}
                  required
                />
              )}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Coordinates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the GPS coordinates for this location. You can find coordinates using Google Maps.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
                      helperText={errors.latitude?.message || 'Between -90 and 90'}
                      required
                      inputProps={{
                        step: 'any',
                      }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                      helperText={errors.longitude?.message || 'Between -180 and 180'}
                      required
                      inputProps={{
                        step: 'any',
                      }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Optional contact details for this office
            </Typography>

            <Controller
              name="contactNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Number"
                  fullWidth
                  margin="normal"
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber?.message}
                  placeholder="+264 61 123 4567"
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  placeholder="office@roadsauthority.na"
                />
              )}
            />
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LocationForm;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import {
  IncidentStatus,
  IncidentType,
  IncidentSeverity,
  createIncident,
  updateIncident,
  getIncidentById,
  IncidentPayload,
} from '../../services/incidents.service';

const incidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['Accident', 'Road closure', 'Hazard', 'Debris', 'Flooding']),
  road: z.string().min(1, 'Road is required').max(50),
  locationDescription: z.string().min(1, 'Location description is required').max(300),
  area: z.string().optional(),
  status: z.enum(['Active', 'Cleared']).default('Active'),
  severity: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  reportedAt: z.string().optional(),
  expectedClearance: z.string().optional(),
  latitude: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), { message: 'Latitude must be a number' }),
  longitude: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), { message: 'Longitude must be a number' }),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

const IncidentForm = () => {
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
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      type: 'Accident',
      road: '',
      locationDescription: '',
      area: '',
      status: 'Active',
      severity: 'Medium',
      reportedAt: '',
      expectedClearance: '',
      latitude: '',
      longitude: '',
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadIncident();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const toLocalInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const loadIncident = async () => {
    try {
      setLoading(true);
      setError(null);
      const incident = await getIncidentById(id!);
      setValue('title', incident.title || '');
      setValue('type', incident.type as IncidentType);
      setValue('road', incident.road || '');
      setValue('locationDescription', incident.locationDescription || '');
      setValue('area', incident.area || '');
      setValue('status', incident.status as IncidentStatus);
      setValue('severity', (incident.severity as IncidentSeverity) || 'Medium');
      setValue('reportedAt', toLocalInput(incident.reportedAt));
      setValue('expectedClearance', toLocalInput(incident.expectedClearance));
      setValue('latitude', incident.coordinates?.latitude?.toString() || '');
      setValue('longitude', incident.coordinates?.longitude?.toString() || '');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: IncidentFormValues) => {
    const payload: IncidentPayload = {
      title: data.title,
      type: data.type,
      road: data.road,
      locationDescription: data.locationDescription,
      area: data.area || undefined,
      status: data.status,
      severity: data.severity,
      reportedAt: data.reportedAt ? new Date(data.reportedAt).toISOString() : undefined,
      expectedClearance: data.expectedClearance ? new Date(data.expectedClearance).toISOString() : undefined,
      coordinates:
        data.latitude && data.longitude
          ? { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) }
          : undefined,
    };

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isEditMode && id) {
        await updateIncident(id, payload);
        setSuccess('Incident updated successfully');
      } else {
        await createIncident(payload);
        setSuccess('Incident created successfully');
      }

      setTimeout(() => navigate('/incidents'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save incident');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/incidents');

  if (loading && isEditMode && !success && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Incident' : 'Create Incident'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Type</InputLabel>
                      <Select {...field} label="Type">
                        <MenuItem value="Accident">Accident</MenuItem>
                        <MenuItem value="Road closure">Road closure</MenuItem>
                        <MenuItem value="Hazard">Hazard</MenuItem>
                        <MenuItem value="Debris">Debris</MenuItem>
                        <MenuItem value="Flooding">Flooding</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.severity}>
                      <InputLabel>Severity</InputLabel>
                      <Select {...field} label="Severity">
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="road"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Road"
                      fullWidth
                      error={!!errors.road}
                      helperText={errors.road?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Area (optional)" fullWidth error={!!errors.area} helperText={errors.area?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Cleared">Cleared</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="locationDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location Description"
                      fullWidth
                      multiline
                      minRows={2}
                      error={!!errors.locationDescription}
                      helperText={errors.locationDescription?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="reportedAt"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Reported At"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.reportedAt}
                      helperText={errors.reportedAt?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="expectedClearance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expected Clearance"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.expectedClearance}
                      helperText={errors.expectedClearance?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Latitude"
                      fullWidth
                      error={!!errors.latitude}
                      helperText={errors.latitude?.message}
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
                      fullWidth
                      error={!!errors.longitude}
                      helperText={errors.longitude?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={handleBack}>Cancel</Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IncidentForm;














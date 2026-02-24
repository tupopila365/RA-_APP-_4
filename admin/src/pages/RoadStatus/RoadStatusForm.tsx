import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import {
  getRoadStatusById,
  createRoadStatus,
  updateRoadStatus,
  getRegions,
  RoadStatusCreateInput,
  RoadStatusUpdateInput,
} from '../../services/roadStatus.service';

const STATUS_OPTIONS: { value: RoadStatusCreateInput['status']; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'caution', label: 'Caution' },
  { value: 'maintenance', label: 'Under maintenance' },
  { value: 'closed', label: 'Closed' },
];

const RoadStatusForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<RoadStatusCreateInput['status']>('open');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [notes, setNotes] = useState('');
  const [published, setPublished] = useState(true);

  useEffect(() => {
    getRegions().then((res) => setRegions(res.data?.regions || []));
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      getRoadStatusById(id)
        .then((res) => {
          const r = res.data?.roadwork;
          if (r) {
            setName(r.name || '');
            setRegion(r.region || '');
            setStatus((r.status as RoadStatusCreateInput['status']) || 'open');
            setLat(r.lat != null ? String(r.lat) : '');
            setLng(r.lng != null ? String(r.lng) : '');
            setNotes(r.notes || '');
            setPublished(r.published ?? true);
          }
        })
        .catch((err) => setError(err.response?.data?.error?.message || err.message || 'Failed to load'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!region.trim()) {
      setError('Region is required');
      return;
    }
    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Valid latitude and longitude are required');
      return;
    }

    setSaving(true);
    try {
      const payload: RoadStatusCreateInput & RoadStatusUpdateInput = {
        name: name.trim(),
        region: region.trim(),
        status,
        lat: latNum,
        lng: lngNum,
        notes: notes.trim() || null,
        published,
      };
      if (isEdit && id) {
        await updateRoadStatus(id, payload);
      } else {
        await createRoadStatus(payload);
      }
      navigate('/road-status');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 3 }}>
        {isEdit ? 'Edit road status' : 'Add road status'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Road name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. B1 Windhoek–Okahandja"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={region}
                    label="Region"
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {regions.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as RoadStatusCreateInput['status'])}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  inputProps={{ step: 0.0001 }}
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="-22.5609"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  inputProps={{ step: 0.0001 }}
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="17.0658"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Clear, Resurfacing 20–40 km"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                  }
                  label="Published (visible in app)"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/road-status')}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RoadStatusForm;

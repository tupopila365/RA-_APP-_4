import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  CheckCircle as FixedIcon,
} from '@mui/icons-material';
import {
  getReportById,
  updateReportStatus,
  assignReport,
  addAdminNotes,
  markAsFixed,
  PotholeReport,
} from '../../services/potholeReports.service';
import { ImageThumbnail } from '../../components/common';
import { ImageUploadField } from '../../components/common';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'invalid', label: 'Invalid' },
];

const SEVERITY_COLORS = {
  small: '#4ECDC4',
  medium: '#FFA500',
  dangerous: '#FF6B6B',
};

const STATUS_COLORS = {
  pending: '#FFA500',
  assigned: '#3498DB',
  'in-progress': '#9B59B6',
  fixed: '#4ECDC4',
  duplicate: '#95A5A6',
  invalid: '#E74C3C',
};

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<PotholeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [status, setStatus] = useState<PotholeReport['status']>('pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [repairPhoto, setRepairPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReportById(id!);
      const reportData = response.data.report;
      setReport(reportData);
      setStatus(reportData.status);
      setAssignedTo(reportData.assignedTo || '');
      setAdminNotes(reportData.adminNotes || '');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update status
      await updateReportStatus(id, status, {
        assignedTo: assignedTo || undefined,
        adminNotes: adminNotes || undefined,
      });

      // If status is being changed to fixed, mark as fixed (with optional repair photo)
      if (status === 'fixed' && repairPhoto) {
        await markAsFixed(id, repairPhoto);
      } else if (status === 'fixed' && !report?.repairPhotoUrl) {
        // Mark as fixed even without photo
        await markAsFixed(id);
      }

      setSuccess('Report updated successfully');
      setTimeout(() => {
        loadReport();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openMap = () => {
    if (!report) return;
    const { latitude, longitude } = report.location;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Report not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pothole-reports')}>
          Back to List
        </Button>
        <Typography variant="h4" component="h1">
          Report Details
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

      <Grid container spacing={3}>
        {/* Left Column - Report Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reference Code
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
                    {report.referenceCode}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Road Name / Landmark
                  </Typography>
                  <Typography variant="body1">{report.roadName}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {report.town}, {report.region}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                  </Typography>
                  <Button size="small" onClick={openMap} sx={{ mt: 1 }}>
                    Open in Maps
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip
                    label={report.severity}
                    size="small"
                    sx={{
                      backgroundColor: SEVERITY_COLORS[report.severity] + '20',
                      color: SEVERITY_COLORS[report.severity],
                      fontWeight: 'bold',
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Device ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {report.deviceId}
                  </Typography>
                </Grid>

                {report.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{report.description}</Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="body2">{formatDate(report.createdAt)}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">{formatDate(report.updatedAt)}</Typography>
                </Grid>

                {report.fixedAt && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fixed At
                    </Typography>
                    <Typography variant="body2">{formatDate(report.fixedAt)}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Photo
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ImageThumbnail src={report.photoUrl} alt={report.roadName} size={400} />
            </CardContent>
          </Card>

          {report.repairPhotoUrl && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Repair Photo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ImageThumbnail src={report.repairPhotoUrl} alt="Repair" size={400} />
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Admin Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Actions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as PotholeReport['status'])}>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Assigned To"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Maintenance team or person"
                />

                <TextField
                  fullWidth
                  label="Admin Notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Internal notes about this report..."
                />

                {status === 'fixed' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Repair Photo (Optional)
                    </Typography>
                    <ImageUploadField
                      value={report.repairPhotoUrl || ''}
                      onChange={(file) => setRepairPhoto(file)}
                      label="Upload repair photo"
                    />
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportDetail;


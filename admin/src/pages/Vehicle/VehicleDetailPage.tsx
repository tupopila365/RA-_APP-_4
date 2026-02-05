import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Payment as PaymentIcon,
  DirectionsCar as RegisterIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import {
  getApplicationById,
  updateStatus,
  markPaymentReceived,
  markRegistered,
  downloadApplicationPDF,
  VehicleRegApplication,
  VehicleRegStatus,
} from '../../services/vehicle.service';

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<VehicleRegApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getApplicationById(id);
      setApplication(response.data.application);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: VehicleRegStatus) => {
    const colors: Record<VehicleRegStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      SUBMITTED: 'info',
      UNDER_REVIEW: 'warning',
      APPROVED: 'success',
      DECLINED: 'error',
      PAYMENT_PENDING: 'warning',
      PAID: 'success',
      REGISTERED: 'success',
      EXPIRED: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !application) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/vehicle-reg/applications')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box>
        <Alert severity="warning">Application not found</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/vehicle-reg/applications')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/vehicle-reg/applications')}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Vehicle Registration Details
        </Typography>
        <Chip
          label={application.status.replace(/_/g, ' ')}
          color={getStatusColor(application.status)}
          sx={{ ml: 'auto' }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Reference ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{application.referenceId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{new Date(application.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={application.status.replace(/_/g, ' ')} color={getStatusColor(application.status)} size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">A. Owner Particulars</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">ID Type</Typography>
                  <Typography variant="body1">{application.idType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Identification Number</Typography>
                  <Typography variant="body1">{application.identificationNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">
                    {application.businessName || `${application.surname || ''} ${application.initials || ''}`.trim()}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <CarIcon sx={{ mr: 1 }} />
              <Typography variant="h6">E. Vehicle Particulars</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Make</Typography>
                  <Typography variant="body1">{application.make}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Series Name</Typography>
                  <Typography variant="body1">{application.seriesName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                  <Typography variant="body1">{application.fuelType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Transmission</Typography>
                  <Typography variant="body1">{application.transmission}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Main Colour</Typography>
                  <Typography variant="body1">{application.mainColour}</Typography>
                </Grid>
                {application.chassisNumber && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Chassis Number</Typography>
                    <Typography variant="body1">{application.chassisNumber}</Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadApplicationPDF(application.id || application._id || '')}
                >
                  Download PDF
                </Button>
                {application.status === 'SUBMITTED' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={async () => {
                        try {
                          await updateStatus(application.id || application._id || '', 'APPROVED');
                          fetchApplication();
                        } catch (err: any) {
                          setError(err.response?.data?.error?.message || 'Failed to approve application');
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeclineIcon />}
                      onClick={async () => {
                        try {
                          await updateStatus(application.id || application._id || '', 'DECLINED');
                          fetchApplication();
                        } catch (err: any) {
                          setError(err.response?.data?.error?.message || 'Failed to decline application');
                        }
                      }}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {application.status === 'PAYMENT_PENDING' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={async () => {
                      try {
                        await markPaymentReceived(application.id || application._id || '');
                        fetchApplication();
                      } catch (err: any) {
                        setError(err.response?.data?.error?.message || 'Failed to mark payment received');
                      }
                    }}
                  >
                    Mark Payment Received
                  </Button>
                )}
                {application.status === 'PAID' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<RegisterIcon />}
                    onClick={async () => {
                      try {
                        await markRegistered(application.id || application._id || '');
                        fetchApplication();
                      } catch (err: any) {
                        setError(err.response?.data?.error?.message || 'Failed to mark as registered');
                      }
                    }}
                  >
                    Mark as Registered
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleDetailPage;



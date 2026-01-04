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
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Payment as PaymentIcon,
  Inventory as OrderIcon,
  CheckCircleOutline as ReadyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  getApplicationById,
  updateStatus,
  markPaymentReceived,
  orderPlates,
  markReadyForCollection,
  downloadApplicationPDF,
  PLNApplication,
  PLNStatus,
} from '../../services/pln.service';

const PLNDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<PLNApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string;
    comment: string;
  }>({ open: false, action: '', comment: '' });
  const [downloadingPDF, setDownloadingPDF] = useState(false);

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

  const handleAction = async (action: string, status?: PLNStatus) => {
    if (!application || !id) return;

    try {
      if (action === 'approve' && status) {
        await updateStatus(id, status, actionDialog.comment);
      } else if (action === 'decline' && status) {
        await updateStatus(id, status, actionDialog.comment);
      } else if (action === 'payment') {
        await markPaymentReceived(id);
      } else if (action === 'order') {
        await orderPlates(id);
      } else if (action === 'ready') {
        await markReadyForCollection(id);
      }
      setActionDialog({ open: false, action: '', comment: '' });
      fetchApplication();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to ${action} application`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      setDownloadingPDF(true);
      await downloadApplicationPDF(id);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getStatusColor = (status: PLNStatus) => {
    const colors: Record<PLNStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      SUBMITTED: 'info',
      UNDER_REVIEW: 'warning',
      APPROVED: 'success',
      DECLINED: 'error',
      PAYMENT_PENDING: 'warning',
      PAID: 'success',
      PLATES_ORDERED: 'info',
      READY_FOR_COLLECTION: 'success',
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
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pln/applications')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box>
        <Alert severity="warning">Application not found</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pln/applications')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pln/applications')}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Application Details
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
        {/* Applicant Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Applicant Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Reference ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                  {application.referenceId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {application.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {application.idNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {application.phoneNumber}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Plate Choices */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plate Choices
              </Typography>
              {application.plateChoices?.map((choice, index) => (
                <Box key={index} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Choice {index + 1}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {choice.text}
                  </Typography>
                  <Typography variant="body2">{choice.meaning}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Document */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uploaded Document
              </Typography>
              <Button
                startIcon={<DownloadIcon />}
                href={application.documentUrl}
                target="_blank"
                variant="outlined"
                sx={{ mt: 2 }}
              >
                View Document
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Status History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status History
              </Typography>
              {application.statusHistory?.map((history, index) => (
                <Box key={index} sx={{ mt: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={history.status.replace(/_/g, ' ')}
                      color={getStatusColor(history.status)}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(history.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Changed by: {history.changedBy}
                  </Typography>
                  {history.comment && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {history.comment}
                    </Typography>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Actions
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                >
                  {downloadingPDF ? 'Downloading...' : 'Download Application Form (PDF)'}
                </Button>
                {application.status === 'SUBMITTED' && (
                  <>
                    <Button
                      startIcon={<ApproveIcon />}
                      variant="contained"
                      color="success"
                      onClick={() => setActionDialog({ open: true, action: 'approve', comment: '' })}
                    >
                      Approve
                    </Button>
                    <Button
                      startIcon={<DeclineIcon />}
                      variant="contained"
                      color="error"
                      onClick={() => setActionDialog({ open: true, action: 'decline', comment: '' })}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {application.status === 'PAYMENT_PENDING' && (
                  <Button
                    startIcon={<PaymentIcon />}
                    variant="contained"
                    color="primary"
                    onClick={() => handleAction('payment')}
                  >
                    Mark Payment Received
                  </Button>
                )}
                {application.status === 'PAID' && (
                  <Button
                    startIcon={<OrderIcon />}
                    variant="contained"
                    color="info"
                    onClick={() => handleAction('order')}
                  >
                    Order Plates
                  </Button>
                )}
                {application.status === 'PLATES_ORDERED' && (
                  <Button
                    startIcon={<ReadyIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => handleAction('ready')}
                  >
                    Mark Ready for Collection
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: '', comment: '' })}
      >
        <DialogTitle>
          {actionDialog.action === 'approve' && 'Approve Application'}
          {actionDialog.action === 'decline' && 'Decline Application'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment (optional)"
            value={actionDialog.comment}
            onChange={(e) => setActionDialog({ ...actionDialog, comment: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: '', comment: '' })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (actionDialog.action === 'approve') {
                handleAction('approve', 'APPROVED');
              } else if (actionDialog.action === 'decline') {
                handleAction('decline', 'DECLINED');
              }
            }}
            variant="contained"
            color={actionDialog.action === 'approve' ? 'success' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PLNDetailPage;




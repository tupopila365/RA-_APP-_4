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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Payment as PaymentIcon,
  Inventory as OrderIcon,
  CheckCircleOutline as ReadyIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import {
  getApplicationById,
  updateStatus,
  markPaymentReceived,
  orderPlates,
  markReadyForCollection,
  downloadApplicationPDF,
  updateAdminComments,
  assignToAdmin,
  setPriority,
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
  const [adminDialog, setAdminDialog] = useState<{
    open: boolean;
    type: 'comments' | 'assign' | 'priority';
    value: string;
  }>({ open: false, type: 'comments', value: '' });
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

  const handleAdminAction = async () => {
    if (!application || !id) return;

    try {
      if (adminDialog.type === 'comments') {
        await updateAdminComments(id, adminDialog.value);
      } else if (adminDialog.type === 'assign') {
        await assignToAdmin(id, adminDialog.value);
      } else if (adminDialog.type === 'priority') {
        await setPriority(id, adminDialog.value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT');
      }
      setAdminDialog({ open: false, type: 'comments', value: '' });
      fetchApplication();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update application');
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

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      LOW: 'info',
      NORMAL: 'default',
      HIGH: 'warning',
      URGENT: 'error',
    };
    return colors[priority || 'NORMAL'] || 'default';
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
        {application.priority && (
          <Chip
            label={`Priority: ${application.priority}`}
            color={getPriorityColor(application.priority)}
            size="small"
          />
        )}
        {application.assignedTo && (
          <Chip
            label={`Assigned to: ${application.assignedTo}`}
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setAdminDialog({ open: true, type: 'priority', value: application.priority || 'NORMAL' })}
                    sx={{ mr: 1 }}
                  >
                    Priority
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PersonIcon />}
                    onClick={() => setAdminDialog({ open: true, type: 'assign', value: application.assignedTo || '' })}
                  >
                    Assign
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Reference ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{application.referenceId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Transaction Type</Typography>
                  <Typography variant="body1">{application.transactionType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{new Date(application.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">{new Date(application.updatedAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section A - Applicant Information */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">A. Particulars of Owner/Transferor</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">ID Type</Typography>
                  <Typography variant="body1">{application.idType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">ID Number</Typography>
                  <Typography variant="body1">
                    {application.trafficRegisterNumber || application.businessRegNumber || application.idNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">
                    {application.businessName || `${application.surname} ${application.initials}` || application.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Postal Address</Typography>
                  <Typography variant="body1">
                    {application.postalAddress?.line1}<br />
                    {application.postalAddress?.line2 && <>{application.postalAddress.line2}<br /></>}
                    {application.postalAddress?.line3}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Street Address</Typography>
                  <Typography variant="body1">
                    {application.streetAddress?.line1}<br />
                    {application.streetAddress?.line2 && <>{application.streetAddress.line2}<br /></>}
                    {application.streetAddress?.line3}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Home Phone</Typography>
                  <Typography variant="body1">
                    {application.telephoneHome ? `+${application.telephoneHome.code} ${application.telephoneHome.number}` : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Day Phone</Typography>
                  <Typography variant="body1">
                    {application.telephoneDay ? `+${application.telephoneDay.code} ${application.telephoneDay.number}` : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Cell Phone</Typography>
                  <Typography variant="body1">
                    {application.cellNumber ? `+${application.cellNumber.code} ${application.cellNumber.number}` : application.phoneNumber || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{application.email || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Section B - Plate Choices */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FlagIcon sx={{ mr: 1 }} />
              <Typography variant="h6">B. Personalised Number Plate</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Plate Format</Typography>
                  <Typography variant="body1">{application.plateFormat}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{application.quantity}</Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Plate Choices</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Choice</TableCell>
                      <TableCell>Text</TableCell>
                      <TableCell>Meaning</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {application.plateChoices?.map((choice, index) => (
                      <TableRow key={index}>
                        <TableCell>{index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'}</TableCell>
                        <TableCell>
                          <Chip label={choice.text} color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{choice.meaning}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Section C - Representative (if applicable) */}
        {application.hasRepresentative && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="h6">C. Applicant's Representative/Proxy</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">ID Type</Typography>
                    <Typography variant="body1">{application.representativeIdType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">ID Number</Typography>
                    <Typography variant="body1">{application.representativeIdNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">
                      {application.representativeSurname} {application.representativeInitials}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Section D - Vehicle Particulars (if applicable) */}
        {application.hasVehicle && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <CarIcon sx={{ mr: 1 }} />
                <Typography variant="h6">D. Particulars of Vehicle</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Current Licence Number</Typography>
                    <Typography variant="body1">{application.currentLicenceNumber || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Vehicle Register Number</Typography>
                    <Typography variant="body1">{application.vehicleRegisterNumber || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Chassis Number/VIN</Typography>
                    <Typography variant="body1">{application.chassisNumber || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Vehicle Make</Typography>
                    <Typography variant="body1">{application.vehicleMake || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Series Name</Typography>
                    <Typography variant="body1">{application.seriesName || 'Not provided'}</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Section E - Declaration */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">E. Declaration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Declaration Role</Typography>
                  <Typography variant="body1">{application.declarationRole || 'applicant'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Declaration Place</Typography>
                  <Typography variant="body1">{application.declarationPlace}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Declaration Date</Typography>
                  <Typography variant="body1">{new Date(application.declarationDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Declaration Accepted</Typography>
                  <Chip 
                    label={application.declarationAccepted ? 'Yes' : 'No'} 
                    color={application.declarationAccepted ? 'success' : 'error'} 
                    size="small" 
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
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

        {/* Admin Comments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Admin Comments</Typography>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setAdminDialog({ open: true, type: 'comments', value: application.adminComments || '' })}
                >
                  Edit Comments
                </Button>
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {application.adminComments || 'No comments yet.'}
              </Typography>
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
        maxWidth="sm"
        fullWidth
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

      {/* Admin Dialog */}
      <Dialog
        open={adminDialog.open}
        onClose={() => setAdminDialog({ open: false, type: 'comments', value: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {adminDialog.type === 'comments' && 'Update Admin Comments'}
          {adminDialog.type === 'assign' && 'Assign Application'}
          {adminDialog.type === 'priority' && 'Set Priority'}
        </DialogTitle>
        <DialogContent>
          {adminDialog.type === 'comments' && (
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Admin Comments"
              value={adminDialog.value}
              onChange={(e) => setAdminDialog({ ...adminDialog, value: e.target.value })}
              sx={{ mt: 2 }}
            />
          )}
          {adminDialog.type === 'assign' && (
            <TextField
              fullWidth
              label="Assign to Admin"
              value={adminDialog.value}
              onChange={(e) => setAdminDialog({ ...adminDialog, value: e.target.value })}
              sx={{ mt: 2 }}
              placeholder="Enter admin name or email"
            />
          )}
          {adminDialog.type === 'priority' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={adminDialog.value}
                label="Priority"
                onChange={(e) => setAdminDialog({ ...adminDialog, value: e.target.value })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialog({ open: false, type: 'comments', value: '' })}>
            Cancel
          </Button>
          <Button onClick={handleAdminAction} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PLNDetailPage;




import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Payment as PaymentIcon,
  DirectionsCar as RegisterIcon,
} from '@mui/icons-material';
import {
  listApplications,
  updateStatus,
  markPaymentReceived,
  markRegistered,
  VehicleRegApplication,
  VehicleRegStatus,
} from '../../services/vehicle.service';
import { DataTable, ConfirmDialog } from '../../components/common';

const VehicleListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<VehicleRegApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleRegStatus | ''>(() => {
    try {
      return (searchParams.get('status') as VehicleRegStatus) || '';
    } catch {
      return '';
    }
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string;
    application: VehicleRegApplication | null;
  }>({ open: false, action: '', application: null });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listApplications({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setApplications(response.data.applications);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, rowsPerPage, search, statusFilter]);

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

  const columns = [
    { id: 'referenceId', label: 'Reference ID', minWidth: 150 },
    { 
      id: 'applicantName', 
      label: 'Applicant Name', 
      minWidth: 150,
      format: (_: any, row: VehicleRegApplication) => (
        row.businessName || `${row.surname || ''} ${row.initials || ''}`.trim() || row.fullName
      )
    },
    { 
      id: 'identificationNumber', 
      label: 'ID Number', 
      minWidth: 120,
      format: (_: any, row: VehicleRegApplication) => row.identificationNumber
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      minWidth: 200,
      format: (_: any, row: VehicleRegApplication) => (
        <Box>
          <Typography variant="body2">{row.make} {row.seriesName}</Typography>
          {row.chassisNumber && (
            <Typography variant="caption" color="text.secondary">
              Chassis: {row.chassisNumber}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 150,
      format: (value: VehicleRegStatus) => (
        <Chip label={value.replace(/_/g, ' ')} color={getStatusColor(value)} size="small" />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      format: (_: any, row: VehicleRegApplication) => (
        <Box>
          <IconButton size="small" onClick={() => navigate(`/vehicle-reg/applications/${row.id || row._id}`)}>
            <ViewIcon />
          </IconButton>
          {row.status === 'SUBMITTED' && (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={() => setActionDialog({ open: true, action: 'approve', application: row })}
              >
                <ApproveIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => setActionDialog({ open: true, action: 'decline', application: row })}
              >
                <DeclineIcon />
              </IconButton>
            </>
          )}
          {row.status === 'PAYMENT_PENDING' && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => setActionDialog({ open: true, action: 'payment', application: row })}
            >
              <PaymentIcon />
            </IconButton>
          )}
          {row.status === 'PAID' && (
            <IconButton
              size="small"
              color="success"
              onClick={() => setActionDialog({ open: true, action: 'register', application: row })}
            >
              <RegisterIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Vehicle Registration Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Vehicle Registration applications
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/vehicle-reg')}>
          Dashboard
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value as VehicleRegStatus | '');
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="SUBMITTED">Submitted</MenuItem>
            <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="DECLINED">Declined</MenuItem>
            <MenuItem value="PAYMENT_PENDING">Payment Pending</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="REGISTERED">Registered</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/vehicle-reg/applications/${row.id || row._id}`)}
        getRowId={(row) => row.id || row._id || ''}
      />

      <ConfirmDialog
        open={actionDialog.open}
        title={`${actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1)} Application`}
        message={`Are you sure you want to ${actionDialog.action} this application?`}
        onConfirm={async () => {
          if (!actionDialog.application) return;
          try {
            const id = actionDialog.application.id || actionDialog.application._id;
            if (!id) return;

            if (actionDialog.action === 'approve') {
              await updateStatus(id, 'APPROVED');
            } else if (actionDialog.action === 'decline') {
              await updateStatus(id, 'DECLINED');
            } else if (actionDialog.action === 'payment') {
              await markPaymentReceived(id);
            } else if (actionDialog.action === 'register') {
              await markRegistered(id);
            }
            setActionDialog({ open: false, action: '', application: null });
            fetchApplications();
          } catch (err: any) {
            setError(err.response?.data?.error?.message || `Failed to ${actionDialog.action} application`);
            setActionDialog({ open: false, action: '', application: null });
          }
        }}
        onCancel={() => setActionDialog({ open: false, action: '', application: null })}
      />
    </Box>
  );
};

export default VehicleListPage;

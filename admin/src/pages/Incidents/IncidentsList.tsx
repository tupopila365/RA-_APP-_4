import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  listIncidents,
  deleteIncident,
  Incident,
  IncidentStatus,
  IncidentType,
  IncidentSeverity,
} from '../../services/incidents.service';

const STATUS_COLORS: Record<IncidentStatus, string> = {
  Active: '#F59E0B',
  Cleared: '#10B981',
};

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  Low: '#4ECDC4',
  Medium: '#F59E0B',
  High: '#EF4444',
};

const IncidentsList = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<IncidentType | ''>('');
  const [roadFilter, setRoadFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listIncidents({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        road: roadFilter || undefined,
        area: areaFilter || undefined,
      });
      setIncidents(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, roadFilter, areaFilter]);

  const handleCreate = () => navigate('/incidents/create');
  const handleEdit = (id?: string) => {
    if (!id) return;
    navigate(`/incidents/edit/${id}`);
  };

  const handleDeleteClick = (incident: Incident) => {
    setIncidentToDelete(incident);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!incidentToDelete?._id && !incidentToDelete?.id) return;
    try {
      await deleteIncident((incidentToDelete._id || incidentToDelete.id)!);
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
      loadIncidents();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete incident');
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Incidents
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadIncidents}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ borderRadius: 2 }}
          >
            New Incident
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | '')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Cleared">Cleared</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value as IncidentType | '')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Accident">Accident</MenuItem>
              <MenuItem value="Road closure">Road closure</MenuItem>
              <MenuItem value="Hazard">Hazard</MenuItem>
              <MenuItem value="Debris">Debris</MenuItem>
              <MenuItem value="Flooding">Flooding</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Road"
            value={roadFilter}
            onChange={(e) => setRoadFilter(e.target.value)}
          />
          <TextField
            size="small"
            label="Area"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Road</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Reported</TableCell>
                <TableCell>Expected Clearance</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident._id || incident.id}>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.road}</TableCell>
                  <TableCell>{incident.area || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      size="small"
                      sx={{
                        backgroundColor: `${STATUS_COLORS[incident.status]}22`,
                        color: STATUS_COLORS[incident.status],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {incident.severity ? (
                      <Chip
                        label={incident.severity}
                        size="small"
                        sx={{
                          backgroundColor: `${SEVERITY_COLORS[incident.severity]}22`,
                          color: SEVERITY_COLORS[incident.severity],
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(incident.reportedAt)}</TableCell>
                  <TableCell>{formatDateTime(incident.expectedClearance)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(incident._id || incident.id)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(incident)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {incidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No incidents found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Incident</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{incidentToDelete?.title}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentsList;

















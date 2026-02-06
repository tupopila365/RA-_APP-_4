import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import {
  getRoadStatusList,
  deleteRoadStatus,
  publishRoadStatus,
  unpublishRoadStatus,
  getRegions,
  RoadStatus,
  ListRoadStatusParams,
} from '../../services/roadStatus.service';

const STATUS_COLORS = {
  'Open': '#34C759',
  'Ongoing': '#FF9500',
  'Ongoing Maintenance': '#FF9500',
  'Planned': '#007AFF',
  'Planned Works': '#007AFF',
  'Closed': '#FF3B30',
  'Restricted': '#FF3B30',
  'Completed': '#34C759',
};

const PRIORITY_COLORS = {
  low: '#94A3B8',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
};

const RoadStatusList = () => {
  const navigate = useNavigate();
  const [roadworks, setRoadworks] = useState<RoadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roadworkToDelete, setRoadworkToDelete] = useState<RoadStatus | null>(null);
  const [regions, setRegions] = useState<string[]>([]);

  // Load regions for filters
  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await getRegions();
      setRegions(response.data.regions);
    } catch (err: any) {
      console.error('Error loading regions:', err);
    }
  };

  const fetchRoadworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: ListRoadStatusParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        region: regionFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        published: showPublishedOnly ? true : undefined,
      };
      
      const response = await getRoadStatusList(params);
      
      if (response.data && response.data.roadworks) {
        // Filter out any roadworks without IDs (data integrity check)
        const validRoadworks = response.data.roadworks.filter((rw: RoadStatus) => {
          const hasId = rw._id || rw.id;
          if (!hasId) {
            console.warn('Roadwork missing ID:', rw);
          }
          return !!hasId;
        });
        
        if (validRoadworks.length !== response.data.roadworks.length) {
          console.warn(`Filtered out ${response.data.roadworks.length - validRoadworks.length} roadworks without IDs`);
        }
        
        setRoadworks(validRoadworks);
        setTotal(response.data.pagination?.total || 0);
      } else {
        setError('Unexpected response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching roadworks:', err);
      setError(
        err.response?.data?.error?.message || 
        err.message || 
        'Failed to fetch road status data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, regionFilter, statusFilter, startDate, endDate, showPublishedOnly]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/road-status/new');
  };

  const handleEdit = (id: string | undefined) => {
    if (!id) {
      setError('Roadwork ID is missing. Cannot edit.');
      console.error('Roadwork ID is undefined');
      return;
    }
    navigate(`/road-status/edit/${id}`);
  };

  const handleTogglePublish = async (roadwork: RoadStatus) => {
    const roadworkId = roadwork._id || roadwork.id;
    
    if (!roadworkId) {
      setError('Roadwork ID is missing. Cannot update publish status.');
      console.error('Roadwork missing ID:', roadwork);
      return;
    }

    try {
      if (roadwork.published) {
        await unpublishRoadStatus(roadworkId);
      } else {
        await publishRoadStatus(roadworkId);
      }
      fetchRoadworks();
    } catch (err: any) {
      console.error('Error toggling publish status:', err);
      setError(err.response?.data?.error?.message || 'Failed to update publish status');
    }
  };

  const handleDeleteClick = (roadwork: RoadStatus) => {
    setRoadworkToDelete(roadwork);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roadworkToDelete) return;

    const roadworkId = roadworkToDelete._id || roadworkToDelete.id;
    if (!roadworkId) {
      setError('Roadwork ID is missing. Cannot delete.');
      console.error('Roadwork missing ID:', roadworkToDelete);
      return;
    }

    try {
      await deleteRoadStatus(roadworkId);
      setDeleteDialogOpen(false);
      setRoadworkToDelete(null);
      fetchRoadworks();
    } catch (err: any) {
      console.error('Error deleting roadwork:', err);
      setError(err.response?.data?.error?.message || 'Failed to delete roadwork');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && roadworks.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Road Status Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
        >
          Add Roadwork
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
            Filters & Search
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder="Road name, section, area..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={regionFilter}
                  label="Region"
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <MenuItem value="">All Regions</MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Ongoing">Ongoing</MenuItem>
                  <MenuItem value="Planned">Planned</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="Restricted">Restricted</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPublishedOnly}
                    onChange={(e) => setShowPublishedOnly(e.target.checked)}
                  />
                }
                label="Show Published Only"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>Road</strong></TableCell>
                <TableCell><strong>Region</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Start Date</strong></TableCell>
                <TableCell><strong>Expected Completion</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Published</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : roadworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary">No roadworks found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              roadworks.map((roadwork) => {
                const roadworkId = roadwork._id || roadwork.id;
                return (
                <TableRow key={roadworkId || `roadwork-${roadwork.road}`} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {roadwork.road}
                      </Typography>
                      {roadwork.section && (
                        <Typography variant="caption" color="text.secondary">
                          {roadwork.section}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{roadwork.region}</Typography>
                    {roadwork.area && (
                      <Typography variant="caption" color="text.secondary">
                        {roadwork.area}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roadwork.status}
                      size="small"
                      sx={{
                        backgroundColor: STATUS_COLORS[roadwork.status] + '20',
                        color: STATUS_COLORS[roadwork.status],
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {roadwork.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(roadwork.startDate)}</TableCell>
                  <TableCell>{formatDate(roadwork.expectedCompletion)}</TableCell>
                  <TableCell>
                    {roadwork.priority && (
                      <Chip
                        label={roadwork.priority}
                        size="small"
                        sx={{
                          backgroundColor: PRIORITY_COLORS[roadwork.priority] + '20',
                          color: PRIORITY_COLORS[roadwork.priority],
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleTogglePublish(roadwork)}
                      color={roadwork.published ? 'success' : 'default'}
                    >
                      {roadwork.published ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    {roadwork.coordinates && (
                      <IconButton
                        size="small"
                        color="primary"
                        title="View on Map"
                        onClick={() => window.open(
                          `https://www.google.com/maps/search/?api=1&query=${roadwork.coordinates?.latitude},${roadwork.coordinates?.longitude}`,
                          '_blank'
                        )}
                      >
                        <MapIcon />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleEdit(roadwork._id || roadwork.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(roadwork)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Roadwork</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{roadworkToDelete?.road} - {roadworkToDelete?.title}"? 
            This action cannot be undone.
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

export default RoadStatusList;











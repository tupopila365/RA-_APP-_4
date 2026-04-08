import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
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
import { FilterPanel, PageHeader } from '../../components/common';

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  caution: 'Caution',
  maintenance: 'Under maintenance',
  closed: 'Closed',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#16A34A',
  caution: '#CA8A04',
  maintenance: '#EA580C',
  closed: '#DC2626',
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
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roadworkToDelete, setRoadworkToDelete] = useState<RoadStatus | null>(null);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await getRegions();
      setRegions(response.data?.regions || []);
    } catch (err: unknown) {
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
        published: showPublishedOnly ? true : undefined,
      };

      const response = await getRoadStatusList(params);

      if (response.data?.roadworks) {
        const valid = response.data.roadworks.filter((rw: RoadStatus) => rw._id || rw.id);
        setRoadworks(valid);
        setTotal(response.data.pagination?.total ?? 0);
      } else {
        setError('Unexpected response format');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(
        e.response?.data?.error?.message || e.message || 'Failed to fetch road status'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadworks();
  }, [page, rowsPerPage, search, regionFilter, statusFilter, showPublishedOnly]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleCreate = () => navigate('/road-status/new');
  const handleEdit = (id: string | undefined) => {
    if (id) navigate(`/road-status/edit/${id}`);
  };

  const handleTogglePublish = async (roadwork: RoadStatus) => {
    const id = roadwork._id || String(roadwork.id);
    if (!id) return;
    try {
      if (roadwork.published) {
        await unpublishRoadStatus(id);
      } else {
        await publishRoadStatus(id);
      }
      fetchRoadworks();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to update');
    }
  };

  const handleDeleteClick = (roadwork: RoadStatus) => {
    setRoadworkToDelete(roadwork);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roadworkToDelete) return;
    const id = roadworkToDelete._id || String(roadworkToDelete.id);
    try {
      await deleteRoadStatus(id);
      setDeleteDialogOpen(false);
      setRoadworkToDelete(null);
      fetchRoadworks();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to delete');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Road Status"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Add Road
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FilterPanel>
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
                placeholder="Name, region, notes..."
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
                  <MenuItem value="">All</MenuItem>
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
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="caution">Caution</MenuItem>
                  <MenuItem value="maintenance">Under maintenance</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPublishedOnly}
                    onChange={(e) => setShowPublishedOnly(e.target.checked)}
                  />
                }
                label="Published only"
              />
            </Grid>
          </Grid>
      </FilterPanel>

      <Card elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Region</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Notes</strong></TableCell>
                <TableCell><strong>Published</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : roadworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No road status entries</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                roadworks.map((row) => {
                  const id = row._id || String(row.id);
                  return (
                    <TableRow key={id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {row.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.region}</TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[row.status] || row.status}
                          size="small"
                          sx={{
                            backgroundColor: (STATUS_COLORS[row.status] || '#64748B') + '20',
                            color: STATUS_COLORS[row.status] || '#64748B',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {row.notes || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePublish(row)}
                          color={row.published ? 'success' : 'default'}
                        >
                          {row.published ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        {row.lat != null && row.lng != null && (
                          <IconButton
                            size="small"
                            color="primary"
                            title="View on map"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${row.lat},${row.lng}`,
                                '_blank'
                              )
                            }
                          >
                            <MapIcon />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleEdit(id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
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
            rowsPerPageOptions={[10, 25, 50]}
          />
        </TableContainer>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete road status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &quot;{roadworkToDelete?.name}&quot;? This cannot be undone.
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

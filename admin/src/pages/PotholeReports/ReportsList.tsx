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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  getReportsList,
  deleteReport,
  getRegionsAndTowns,
  PotholeReport,
  ListReportsParams,
} from '../../services/potholeReports.service';
import { ImageThumbnail, ZoomableImage } from '../../components/common';

const SEVERITY_COLORS = {
  low: '#4ECDC4',
  medium: '#FFA500',
  high: '#FF6B6B',
};

const STATUS_COLORS = {
  pending: '#FFA500',
  assigned: '#3498DB',
  'in-progress': '#9B59B6',
  fixed: '#4ECDC4',
  duplicate: '#95A5A6',
  invalid: '#E74C3C',
};

const ReportsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [townFilter, setTownFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<PotholeReport | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [towns, setTowns] = useState<string[]>([]);
  const [filteredTowns, setFilteredTowns] = useState<string[]>([]);

  // Load regions and towns for filters
  useEffect(() => {
    loadRegionsAndTowns();
  }, []);

  // Update filtered towns when region changes
  useEffect(() => {
    if (regionFilter) {
      // Filter towns by selected region (this would ideally come from backend)
      // For now, show all towns
      setFilteredTowns(towns);
      setTownFilter(''); // Reset town filter when region changes
    } else {
      setFilteredTowns(towns);
    }
  }, [regionFilter, towns]);

  const loadRegionsAndTowns = async () => {
    try {
      const response = await getRegionsAndTowns();
      setRegions(response.data.regions);
      setTowns(response.data.towns);
      setFilteredTowns(response.data.towns);
    } catch (err: any) {
      console.error('Error loading regions and towns:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: ListReportsParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        region: regionFilter || undefined,
        town: townFilter || undefined,
        severity: severityFilter as any || undefined,
        status: statusFilter as any || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      console.log('Fetching reports with params:', params);
      const response = await getReportsList(params);
      console.log('Reports response:', response);
      console.log('Reports data:', response.data);
      console.log('Reports array:', response.data.reports);
      console.log('Pagination:', response.data.pagination);
      
      if (response.data && response.data.reports) {
        setReports(response.data.reports);
        setTotal(response.data.pagination?.total || 0);
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      setError(
        err.response?.data?.error?.message || 
        err.message || 
        'Failed to fetch reports. Please check console for details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, regionFilter, townFilter, severityFilter, statusFilter, startDate, endDate]);

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

  const handleView = (id: string) => {
    navigate(`/pothole-reports/${id}`);
  };

  const handleDeleteClick = (report: PotholeReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    try {
      await deleteReport(reportToDelete.id);
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      fetchReports();
    } catch (err: any) {
      console.error('Error deleting report:', err);
      setError(err.response?.data?.error?.message || 'Failed to delete report');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Early return for loading state
  if (loading && reports.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log('ReportsList rendering:', { loading, reportsCount: reports.length, error, total });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pothole Reports
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
          <br />
          <small>Check browser console for more details</small>
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder="Reference code, road name..."
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
                <InputLabel>Town</InputLabel>
                <Select
                  value={townFilter}
                  label="Town"
                  onChange={(e) => setTownFilter(e.target.value)}
                  disabled={!regionFilter}
                >
                  <MenuItem value="">All Towns</MenuItem>
                  {filteredTowns.map((town) => (
                    <MenuItem key={town} value={town}>
                      {town}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  label="Severity"
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low Risk</MenuItem>
                  <MenuItem value="medium">Medium Risk</MenuItem>
                  <MenuItem value="high">High Risk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                  <MenuItem value="duplicate">Duplicate</MenuItem>
                  <MenuItem value="invalid">Invalid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Road Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">No reports found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <ZoomableImage
                      src={report.photoUrl}
                      alt={report.roadName}
                      title={`${report.roadName} - ${report.referenceCode}`}
                      thumbnail={
                        <ImageThumbnail src={report.photoUrl} alt={report.roadName} size="small" />
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {report.referenceCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{report.roadName}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report.town}, {report.region}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {report.severity ? (
                      <Chip
                        label={report.severity}
                        size="small"
                        sx={{
                          backgroundColor: SEVERITY_COLORS[report.severity] + '20',
                          color: SEVERITY_COLORS[report.severity],
                          fontWeight: 'bold',
                        }}
                      />
                    ) : (
                      <Chip
                        label="Not Set"
                        size="small"
                        sx={{
                          backgroundColor: '#95A5A620',
                          color: '#95A5A6',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      sx={{
                        backgroundColor: STATUS_COLORS[report.status] + '20',
                        color: STATUS_COLORS[report.status],
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleView(report.id)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(report)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete report {reportToDelete?.referenceCode}? This action
            cannot be undone.
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

export default ReportsList;


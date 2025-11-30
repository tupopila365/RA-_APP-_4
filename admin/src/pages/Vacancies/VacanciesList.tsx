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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { getVacanciesList, deleteVacancy, Vacancy } from '../../services/vacancies.service';

const VacanciesList = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVacanciesList({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        type: typeFilter || undefined,
        published: publishedFilter === 'all' ? undefined : publishedFilter === 'published',
      });
      setVacancies(response.data.vacancies);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, [page, rowsPerPage, search, typeFilter, publishedFilter]);

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

  const handleTypeFilterChange = (event: any) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handlePublishedFilterChange = (event: any) => {
    setPublishedFilter(event.target.value);
    setPage(0);
  };

  const handleCreateNew = () => {
    navigate('/vacancies/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/vacancies/edit/${id}`);
  };

  const handleDeleteClick = (vacancy: Vacancy) => {
    setVacancyToDelete(vacancy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vacancyToDelete) return;

    try {
      await deleteVacancy(vacancyToDelete.id);
      setDeleteDialogOpen(false);
      setVacancyToDelete(null);
      fetchVacancies();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete vacancy');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVacancyToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'bursary': 'Bursary',
      'internship': 'Internship',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string): 'primary' | 'secondary' | 'info' | 'warning' => {
    const colors: Record<string, 'primary' | 'secondary' | 'info' | 'warning'> = {
      'full-time': 'primary',
      'part-time': 'secondary',
      'bursary': 'info',
      'internship': 'warning',
    };
    return colors[type] || 'primary';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vacancies Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Create Vacancy
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={handleTypeFilterChange} label="Type">
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
                <MenuItem value="bursary">Bursary</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={publishedFilter} onChange={handlePublishedFilterChange} label="Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Closing Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>PDF</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : vacancies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No vacancies found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vacancies.map((vacancy) => (
                <TableRow key={vacancy.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {vacancy.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(vacancy.type)}
                      color={getTypeColor(vacancy.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{vacancy.department}</TableCell>
                  <TableCell>{vacancy.location}</TableCell>
                  <TableCell>{formatDate(vacancy.closingDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={vacancy.published ? 'Published' : 'Draft'}
                      color={vacancy.published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {vacancy.pdfUrl ? (
                      <IconButton
                        size="small"
                        href={vacancy.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View PDF"
                      >
                        <PdfIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(vacancy.id)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(vacancy)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{vacancyToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VacanciesList;

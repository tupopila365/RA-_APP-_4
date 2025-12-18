import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
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
} from '@mui/icons-material';
import { getFAQsList, deleteFAQ, FAQ } from '../../services/faqs.service';

const FAQList = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFAQsList({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        category: categoryFilter || undefined,
      });
      setFaqs(response.data.faqs);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, [page, rowsPerPage, search, categoryFilter]);

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

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleCreateNew = () => {
    navigate('/faqs/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/faqs/edit/${id}`);
  };

  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!faqToDelete) return;

    try {
      const idToDelete = faqToDelete._id || (faqToDelete as any).id;
      
      if (!idToDelete) {
        throw new Error('No valid ID found on FAQ item');
      }
      
      await deleteFAQ(idToDelete);
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
      fetchFAQs();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to delete FAQ';
      const errorDetails = err.response?.data?.error?.details;
      const fullError = errorDetails ? `${errorMessage}: ${JSON.stringify(errorDetails)}` : errorMessage;
      setError(fullError);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFaqToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          FAQ Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Create FAQ
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
              placeholder="Search by question or answer..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} onChange={handleCategoryFilterChange} label="Category">
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Licensing">Licensing</MenuItem>
                <MenuItem value="Registration">Registration</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Payments">Payments</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No FAQs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {faq.question}
                    </Typography>
                  </TableCell>
                  <TableCell>{faq.category || '-'}</TableCell>
                  <TableCell>{faq.order}</TableCell>
                  <TableCell>{formatDate(faq.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(faq._id)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(faq)}
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
            Are you sure you want to delete "{faqToDelete?.question}"? This action cannot be undone.
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

export default FAQList;


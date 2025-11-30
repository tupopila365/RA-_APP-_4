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
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getNewsList, deleteNews, News } from '../../services/news.service';
import { ImageThumbnail } from '../../components/common';

const NewsList = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNewsList({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        category: categoryFilter || undefined,
        published: publishedFilter === 'all' ? undefined : publishedFilter === 'published',
      });
      setNews(response.data.news);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page, rowsPerPage, search, categoryFilter, publishedFilter]);

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

  const handlePublishedFilterChange = (event: any) => {
    setPublishedFilter(event.target.value);
    setPage(0);
  };

  const handleCreateNew = () => {
    navigate('/news/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/news/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/news/${id}`);
  };

  const handleDeleteClick = (newsItem: News) => {
    setNewsToDelete(newsItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!newsToDelete) return;

    // Debug: Log the news item and ID
    console.log('Deleting news item:', newsToDelete);
    console.log('News ID (_id):', newsToDelete._id);
    console.log('News ID (id):', (newsToDelete as any).id);

    try {
      // Use _id, but fallback to id if _id is not available
      const idToDelete = newsToDelete._id || (newsToDelete as any).id;
      
      if (!idToDelete) {
        throw new Error('No valid ID found on news item');
      }
      
      console.log('Calling deleteNews with ID:', idToDelete);
      await deleteNews(idToDelete);
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
      fetchNews();
    } catch (err: any) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to delete news article';
      const errorDetails = err.response?.data?.error?.details;
      const fullError = errorDetails ? `${errorMessage}: ${JSON.stringify(errorDetails)}` : errorMessage;
      setError(fullError);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNewsToDelete(null);
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
          News Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Create News
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
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} onChange={handleCategoryFilterChange} label="Category">
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                <MenuItem value="Safety">Safety</MenuItem>
                <MenuItem value="Announcements">Announcements</MenuItem>
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
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Published Date</TableCell>
              <TableCell>Created</TableCell>
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
            ) : news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No news articles found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              news.map((newsItem) => (
                <TableRow key={newsItem._id} hover>
                  <TableCell>
                    {newsItem.imageUrl ? (
                      <ImageThumbnail
                        src={newsItem.imageUrl}
                        alt={newsItem.title}
                        size="small"
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          No image
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {newsItem.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{newsItem.category}</TableCell>
                  <TableCell>{newsItem.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={newsItem.published ? 'Published' : 'Draft'}
                      color={newsItem.published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {newsItem.publishedAt ? formatDate(newsItem.publishedAt) : '-'}
                  </TableCell>
                  <TableCell>{formatDate(newsItem.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleView(newsItem._id)} title="View">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(newsItem._id)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(newsItem)}
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
            Are you sure you want to delete "{newsToDelete?.title}"? This action cannot be undone.
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

export default NewsList;

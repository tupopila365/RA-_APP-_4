import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { formsService, FormDownload, FORM_CATEGORIES } from '../../services/formsService';
import { PDFUploadField } from '../../components/common';

const FormsPage = () => {
  const [items, setItems] = useState<FormDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FormDownload | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as string,
    pdfUrl: '',
    published: true,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await formsService.list({
        page: page + 1,
        limit: rowsPerPage,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      const data = response?.data ?? response;
      const list = data?.items ?? [];
      const pagination = data?.pagination;
      setItems(Array.isArray(list) ? list : []);
      setTotal(pagination?.total ?? list?.length ?? 0);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string }; message?: string } } })
          ?.response?.data?.error?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch forms';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, rowsPerPage, categoryFilter]);

  const handleCreateOrUpdate = async () => {
    try {
      setError(null);
      if (!formData.title?.trim() || !formData.category || !formData.pdfUrl?.trim()) {
        setError('Title, category, and PDF URL are required');
        return;
      }

      setSubmitting(true);

      if (editMode && selectedItem) {
        await formsService.update(String(selectedItem.id), {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          pdfUrl: formData.pdfUrl.trim(),
          published: formData.published,
        });
      } else {
        await formsService.create({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          pdfUrl: formData.pdfUrl.trim(),
          published: formData.published,
        });
      }

      setDialogOpen(false);
      setFormData({ title: '', description: '', category: '', pdfUrl: '', published: true });
      setEditMode(false);
      setSelectedItem(null);
      setError(null);
      await fetchItems();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string }; message?: string } } })
          ?.response?.data?.error?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        `Failed to ${editMode ? 'update' : 'create'} form`;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: FormDownload) => {
    setSelectedItem(item);
    setFormData({
      title: item.title ?? '',
      description: item.description ?? '',
      category: item.category ?? '',
      pdfUrl: item.pdfUrl ?? '',
      published: item.published ?? true,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await formsService.delete(String(selectedItem.id));
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Failed to delete form';
      setError(message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Forms &amp; Documents (Downloads)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add form / document
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Same structure as the app: each item has a title, description, category, and one PDF link. Only published items appear on the app Downloads screen.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All categories</MenuItem>
            {FORM_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell sx={{ maxWidth: 280 }}>{item.description || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={item.published ? 'Yes' : 'No'}
                    color={item.published ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditClick(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedItem(item);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!submitting) {
            setDialogOpen(false);
            setEditMode(false);
            setSelectedItem(null);
            setFormData({ title: '', description: '', category: '', pdfUrl: '', published: true });
            setError(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Edit form / document' : 'Add form / document'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Abnormal Load Permit Application"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              placeholder="Short description as shown in the app"
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {FORM_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                PDF URL (required)
              </Typography>
              <PDFUploadField
                value={formData.pdfUrl}
                onChange={(url) => setFormData({ ...formData, pdfUrl: url })}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  name="published"
                  color="primary"
                />
              }
              label="Published (show on app Downloads)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setEditMode(false);
              setSelectedItem(null);
              setFormData({ title: '', description: '', category: '', pdfUrl: '', published: true });
              setError(null);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateOrUpdate} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete form / document</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item? It will be removed from the app Downloads list.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormsPage;

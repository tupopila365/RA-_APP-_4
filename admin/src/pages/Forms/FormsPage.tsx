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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { formsService, Form } from '../../services/formsService';
import { PDFUploadField } from '../../components/common';

const FormsPage = () => {
  const [items, setItems] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Form | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '' as '' | 'Procurement' | 'Roads & Infrastructure' | 'Plans & Strategies' | 'Conferences & Events' | 'Legislation & Policy',
    documents: [] as Array<{ title: string; url: string; fileName: string }>,
    published: false,
  });

  const categories = [
    'Procurement',
    'Roads & Infrastructure',
    'Plans & Strategies',
    'Conferences & Events',
    'Legislation & Policy',
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await formsService.list({
        page: page + 1,
        limit: rowsPerPage,
        category: categoryFilter !== 'all' ? categoryFilter as any : undefined,
      });
      setItems(response.data.items || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, rowsPerPage, categoryFilter]);

  const handleCreateOrUpdate = async () => {
    try {
      // Clear previous errors
      setError(null);
      
      // Validation
      if (!formData.name || !formData.category || formData.documents.length === 0) {
        setError('Name, category, and at least one document are required');
        return;
      }

      // Validate documents have required fields
      const invalidDocs = formData.documents.filter(doc => !doc.title || !doc.url);
      if (invalidDocs.length > 0) {
        setError('All documents must have a title and file URL');
        return;
      }

      setSubmitting(true);

      if (editMode && selectedItem) {
        await formsService.update(selectedItem.id, formData);
      } else {
        await formsService.create(formData);
      }
      
      // Success - close dialog and reset form
      setDialogOpen(false);
      setFormData({
        name: '',
        category: '',
        documents: [],
        published: false,
      });
      setEditMode(false);
      setSelectedItem(null);
      setError(null);
      
      // Refresh the list
      await fetchItems();
    } catch (err: any) {
      console.error('Error creating/updating form:', err);
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || `Failed to ${editMode ? 'update' : 'create'} form`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: Form) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      documents: item.documents || [],
      published: item.published,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await formsService.delete(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete form');
    }
  };

  const handleAddDocument = () => {
    setFormData({
      ...formData,
      documents: [...formData.documents, { title: '', url: '', fileName: '' }],
    });
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: newDocuments });
  };

  const handleDocumentChange = (index: number, field: 'title' | 'url' | 'fileName', value: string) => {
    const newDocuments = [...formData.documents];
    newDocuments[index][field] = value;
    setFormData({ ...formData, documents: newDocuments });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Forms & Documents</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Form
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); }}>
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.documents?.length || 0} file(s)</TableCell>
                <TableCell><Chip label={item.published ? 'Yes' : 'No'} color={item.published ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditClick(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}>
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
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => { 
        if (!submitting) {
          setDialogOpen(false); 
          setEditMode(false); 
          setSelectedItem(null); 
          setFormData({ name: '', category: '', documents: [], published: false }); 
          setError(null);
        }
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Form' : 'Add Form'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Form Name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              fullWidth 
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Documents</Typography>
                <Button startIcon={<AttachFileIcon />} onClick={handleAddDocument} size="small">
                  Add Document
                </Button>
              </Box>

              {formData.documents.length === 0 && (
                <Alert severity="info">Add at least one document</Alert>
              )}

              <List>
                {formData.documents.map((doc, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch', border: '1px solid #e0e0e0', borderRadius: 1, mb: 2, p: 2 }}>
                    <TextField
                      label="Document Title"
                      value={doc.title}
                      onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <PDFUploadField
                      value={doc.url}
                      onChange={(url) => {
                        const fileName = url.split('/').pop() || '';
                        handleDocumentChange(index, 'url', url);
                        handleDocumentChange(index, 'fileName', fileName);
                        if (!doc.title) {
                          handleDocumentChange(index, 'title', fileName.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button 
                        color="error" 
                        size="small" 
                        onClick={() => handleRemoveDocument(index)}
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
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
              label="Published"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => { 
              setDialogOpen(false); 
              setEditMode(false); 
              setSelectedItem(null); 
              setFormData({ name: '', category: '', documents: [], published: false }); 
              setError(null);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateOrUpdate} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (editMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this form?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormsPage;

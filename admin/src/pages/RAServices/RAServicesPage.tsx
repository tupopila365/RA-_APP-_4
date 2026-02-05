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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import {
  raServicesService,
  RAService,
  RASERVICE_CATEGORIES,
  RAServiceCategory,
  RAServicePdf,
} from '../../services/raServices.service';
import { PDFUploadField } from '../../components/common';

const getEmptyFormData = () => ({
  name: '',
  description: '',
  requirements: [] as string[],
  fee: '',
  ageRestriction: '',
  category: '' as '' | RAServiceCategory,
  imageUrl: '',
  pdfs: [] as RAServicePdf[],
  contactInfo: '',
  published: false,
  sortOrder: 0,
});

const RAServicesPage = () => {
  const [items, setItems] = useState<RAService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RAService | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(getEmptyFormData());

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await raServicesService.list({
        page: page + 1,
        limit: rowsPerPage,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      const data = response.data?.data || response.data;
      setItems(data?.items || []);
      setTotal(data?.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch RA services');
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

      if (!formData.name || !formData.description || !formData.category) {
        setError('Name, description, and category are required');
        return;
      }

      setSubmitting(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim()),
        fee: formData.fee,
        ageRestriction: formData.ageRestriction || undefined,
        category: formData.category as RAServiceCategory,
        imageUrl: formData.imageUrl || undefined,
        pdfs: formData.pdfs,
        contactInfo: formData.contactInfo || undefined,
        published: formData.published,
        sortOrder: formData.sortOrder,
      };

      if (editMode && selectedItem) {
        await raServicesService.update(selectedItem.id, payload);
      } else {
        await raServicesService.create(payload);
      }

      setDialogOpen(false);
      setFormData(getEmptyFormData());
      setEditMode(false);
      setSelectedItem(null);
      setError(null);
      await fetchItems();
    } catch (err: any) {
      console.error('Error creating/updating RA service:', err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        `Failed to ${editMode ? 'update' : 'create'} service`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: RAService) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      requirements: item.requirements || [],
      fee: item.fee || '',
      ageRestriction: item.ageRestriction || '',
      category: item.category,
      imageUrl: item.imageUrl || '',
      pdfs: item.pdfs || [],
      contactInfo: item.contactInfo || '',
      published: item.published,
      sortOrder: item.sortOrder ?? 0,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await raServicesService.delete(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete service');
    }
  };

  const handleAddRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const handleRemoveRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleAddPdf = () => {
    setFormData({
      ...formData,
      pdfs: [...formData.pdfs, { title: '', url: '', fileName: '' }],
    });
  };

  const handleRemovePdf = (index: number) => {
    const newPdfs = formData.pdfs.filter((_, i) => i !== index);
    setFormData({ ...formData, pdfs: newPdfs });
  };

  const handlePdfChange = (index: number, field: 'title' | 'url' | 'fileName', value: string) => {
    const newPdfs = [...formData.pdfs];
    newPdfs[index] = { ...newPdfs[index], [field]: value };
    setFormData({ ...formData, pdfs: newPdfs });
  };

  const closeDialog = () => {
    if (!submitting) {
      setDialogOpen(false);
      setEditMode(false);
      setSelectedItem(null);
      setFormData(getEmptyFormData());
      setError(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">RA Services</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="all">All Categories</MenuItem>
            {RASERVICE_CATEGORIES.map((cat) => (
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
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.fee || '-'}</TableCell>
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
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit RA Service' : 'Add RA Service'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={4}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as RAServiceCategory })}
              >
                {RASERVICE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Fee (e.g. N$250)"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              fullWidth
            />
            <TextField
              label="Age / Eligibility Restriction"
              value={formData.ageRestriction}
              onChange={(e) => setFormData({ ...formData, ageRestriction: e.target.value })}
              fullWidth
            />
            <TextField
              label="Contact Info / Booking Link"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              fullWidth
              placeholder="e.g. https://book.ra.org.na or +264 61 123456"
            />
            <TextField
              label="Image URL (optional)"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Required Documents</Typography>
                <Button onClick={handleAddRequirement} size="small">
                  Add Requirement
                </Button>
              </Box>
              <List>
                {formData.requirements.map((req, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <TextField
                      label={`Requirement ${index + 1}`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton size="small" onClick={() => handleRemoveRequirement(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">PDF Forms</Typography>
                <Button startIcon={<AttachFileIcon />} onClick={handleAddPdf} size="small">
                  Add PDF
                </Button>
              </Box>
              <List>
                {formData.pdfs.map((doc, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch', border: '1px solid #e0e0e0', borderRadius: 1, mb: 2, p: 2 }}>
                    <TextField
                      label="Document Title"
                      value={doc.title}
                      onChange={(e) => handlePdfChange(index, 'title', e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <PDFUploadField
                      value={doc.url}
                      onChange={(url) => {
                        const fileName = url.split('/').pop() || '';
                        handlePdfChange(index, 'url', url);
                        handlePdfChange(index, 'fileName', fileName);
                        if (!doc.title) {
                          handlePdfChange(index, 'title', fileName.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleRemovePdf(index)}
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
          <Button onClick={closeDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateOrUpdate} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete RA Service</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this service?</Typography>
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

export default RAServicesPage;

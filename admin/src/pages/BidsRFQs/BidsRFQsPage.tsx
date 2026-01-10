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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { procurementOpeningRegisterService, ProcurementOpeningRegister } from '../../services/procurementService';
import { PDFUploadField } from '../../components/common';

const BidsRFQsPage = () => {
  const [items, setItems] = useState<ProcurementOpeningRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementOpeningRegister | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rfq' as 'rfq',
    reference: '',
    description: '',
    bidOpeningDate: '',
    status: 'open' as 'open' | 'closed',
    noticeUrl: '',
    noticeFileName: '',
    category: '' as '' | 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works',
    published: false,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await procurementOpeningRegisterService.list({
        page: page + 1,
        limit: rowsPerPage,
        type: 'rfq', // Always filter for RFQ type
        category: categoryFilter !== 'all' ? categoryFilter as any : undefined,
      });
      setItems(response.data.items || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, rowsPerPage, categoryFilter]);

  const handleCreateOrUpdate = async () => {
    try {
      if (editMode && selectedItem) {
        await procurementOpeningRegisterService.update(selectedItem.id, formData);
      } else {
        await procurementOpeningRegisterService.create(formData);
      }
      setDialogOpen(false);
      setFormData({
        type: 'rfq',
        reference: '',
        description: '',
        bidOpeningDate: '',
        status: 'open',
        noticeUrl: '',
        noticeFileName: '',
        category: '',
        published: false,
      });
      setEditMode(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to ${editMode ? 'update' : 'create'} item`);
    }
  };

  const handleEditClick = (item: ProcurementOpeningRegister) => {
    setSelectedItem(item);
    setFormData({
      type: item.type,
      reference: item.reference,
      description: item.description,
      bidOpeningDate: item.bidOpeningDate ? new Date(item.bidOpeningDate).toISOString().split('T')[0] : '',
      status: item.status,
      noticeUrl: item.noticeUrl || '',
      noticeFileName: item.noticeFileName || '',
      category: item.category || '',
      published: item.published,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await procurementOpeningRegisterService.delete(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'rfq',
      reference: '',
      description: '',
      bidOpeningDate: '',
      status: 'open',
      noticeUrl: '',
      noticeFileName: '',
      category: '',
      published: false,
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Bids / RFQs</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setDialogOpen(true); }}>
          Add Bid/RFQ
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}>
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Consultancy">Consultancy</MenuItem>
            <MenuItem value="Non-Consultancy">Non-Consultancy</MenuItem>
            <MenuItem value="Goods">Goods</MenuItem>
            <MenuItem value="Works">Works</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Bid Opening Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>No bids/RFQs found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.reference}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>{new Date(item.bidOpeningDate).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={item.status} color={item.status === 'open' ? 'success' : 'default'} size="small" /></TableCell>
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
              ))
            )}
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Bid/RFQ' : 'Add Bid/RFQ'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} fullWidth required />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={3} required />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Consultancy">Consultancy</MenuItem>
                <MenuItem value="Non-Consultancy">Non-Consultancy</MenuItem>
                <MenuItem value="Goods">Goods</MenuItem>
                <MenuItem value="Works">Works</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Bid Opening Date" type="date" value={formData.bidOpeningDate} onChange={(e) => setFormData({ ...formData, bidOpeningDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} required />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <PDFUploadField
              value={formData.noticeUrl}
              onChange={(url) => setFormData({ ...formData, noticeUrl: url, noticeFileName: url.split('/').pop() || '' })}
            />
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
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Bid/RFQ</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this bid/RFQ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BidsRFQsPage;





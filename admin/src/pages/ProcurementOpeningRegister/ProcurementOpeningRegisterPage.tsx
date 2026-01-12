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
  Tabs,
  Tab,
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

const ProcurementOpeningRegisterPage = () => {
  const [items, setItems] = useState<ProcurementOpeningRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeTab, setTypeTab] = useState<'opportunities' | 'rfq'>('opportunities');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementOpeningRegister | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    type: 'opportunities' as 'opportunities' | 'rfq',
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
        page: 1,
        limit: 1000, // Load all items for scrollable view
        type: typeTab,
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
  }, [typeTab, categoryFilter]);

  const handleCreateOrUpdate = async () => {
    try {
      if (editMode && selectedItem) {
        await procurementOpeningRegisterService.update(selectedItem.id, formData);
      } else {
        await procurementOpeningRegisterService.create(formData);
      }
      setDialogOpen(false);
      setFormData({
        type: 'opportunities',
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Opening Register</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Item
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={typeTab} onChange={(_, v) => { setTypeTab(v); }}>
          <Tab label="Open Procurement Opportunities" value="opportunities" />
          <Tab label="Request for Quotations" value="rfq" />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); }}>
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Consultancy">Consultancy</MenuItem>
            <MenuItem value="Non-Consultancy">Non-Consultancy</MenuItem>
            <MenuItem value="Goods">Goods</MenuItem>
            <MenuItem value="Works">Works</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader>
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
            {items.map((item) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditMode(false); setSelectedItem(null); setFormData({ type: 'opportunities', reference: '', description: '', bidOpeningDate: '', status: 'open', noticeUrl: '', noticeFileName: '', category: '', published: false }); }} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Opening Register Item' : 'Add Opening Register Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                <MenuItem value="opportunities">Open Procurement Opportunities</MenuItem>
                <MenuItem value="rfq">Request for Quotations</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} fullWidth />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={3} />
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
            <TextField label="Bid Opening Date" type="date" value={formData.bidOpeningDate} onChange={(e) => setFormData({ ...formData, bidOpeningDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
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
          <Button onClick={() => { setDialogOpen(false); setEditMode(false); setSelectedItem(null); setFormData({ type: 'opportunities', reference: '', description: '', bidOpeningDate: '', status: 'open', noticeUrl: '', noticeFileName: '', category: '', published: false }); }}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementOpeningRegisterPage;


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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { procurementAwardsService, ProcurementAward } from '../../services/procurementService';
import BulkFileUpload from '../../components/common/BulkFileUpload';
import { PDFUploadField } from '../../components/common';

const ProcurementAwardsPage = () => {
  const [items, setItems] = useState<ProcurementAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeTab, setTypeTab] = useState<'opportunities' | 'rfq'>('opportunities');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementAward | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    type: 'opportunities' as 'opportunities' | 'rfq',
    procurementReference: '',
    description: '',
    executiveSummary: { title: '', url: '', fileName: '' },
    successfulBidder: '',
    dateAwarded: '',
    category: '' as '' | 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works',
    published: false,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await procurementAwardsService.list({
        page: page + 1,
        limit: rowsPerPage,
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
  }, [page, rowsPerPage, typeTab, categoryFilter]);

  const handleCreateOrUpdate = async () => {
    try {
      if (editMode && selectedItem) {
        await procurementAwardsService.update(selectedItem.id, formData);
      } else {
        await procurementAwardsService.create(formData);
      }
      setDialogOpen(false);
      setFormData({
        type: 'opportunities',
        procurementReference: '',
        description: '',
        executiveSummary: { title: '', url: '', fileName: '' },
        successfulBidder: '',
        dateAwarded: '',
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

  const handleEditClick = (item: ProcurementAward) => {
    setSelectedItem(item);
    setFormData({
      type: item.type,
      procurementReference: item.procurementReference,
      description: item.description,
      executiveSummary: item.executiveSummary || { title: '', url: '', fileName: '' },
      successfulBidder: item.successfulBidder,
      dateAwarded: item.dateAwarded ? new Date(item.dateAwarded).toISOString().split('T')[0] : '',
      category: item.category || '',
      published: item.published,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await procurementAwardsService.delete(selectedItem.id);
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
        <Typography variant="h4">Procurement Awards</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Award
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Successful Bidder</TableCell>
              <TableCell>Date Awarded</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.procurementReference}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.category || 'N/A'}</TableCell>
                <TableCell>{item.successfulBidder}</TableCell>
                <TableCell>{new Date(item.dateAwarded).toLocaleDateString()}</TableCell>
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditMode(false); setSelectedItem(null); setFormData({ type: 'opportunities', procurementReference: '', description: '', executiveSummary: { title: '', url: '', fileName: '' }, successfulBidder: '', dateAwarded: '', published: false }); }} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Procurement Award' : 'Add Procurement Award'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                <MenuItem value="opportunities">Open Procurement Opportunities</MenuItem>
                <MenuItem value="rfq">Request for Quotations</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Procurement Reference" value={formData.procurementReference} onChange={(e) => setFormData({ ...formData, procurementReference: e.target.value })} fullWidth />
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
            <TextField label="Successful Bidder" value={formData.successfulBidder} onChange={(e) => setFormData({ ...formData, successfulBidder: e.target.value })} fullWidth />
            <TextField label="Date Awarded" type="date" value={formData.dateAwarded} onChange={(e) => setFormData({ ...formData, dateAwarded: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Executive Summary Title" value={formData.executiveSummary.title} onChange={(e) => setFormData({ ...formData, executiveSummary: { ...formData.executiveSummary, title: e.target.value } })} fullWidth />
            <PDFUploadField
              value={formData.executiveSummary.url}
              onChange={(url) => setFormData({ ...formData, executiveSummary: { title: formData.executiveSummary.title || url.split('/').pop() || '', url, fileName: url.split('/').pop() || '' } })}
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
          <Button onClick={() => { setDialogOpen(false); setEditMode(false); setSelectedItem(null); setFormData({ type: 'opportunities', procurementReference: '', description: '', executiveSummary: { title: '', url: '', fileName: '' }, successfulBidder: '', dateAwarded: '', category: '', published: false }); }}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Award</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this award?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementAwardsPage;


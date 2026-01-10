import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
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
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { procurementPlanService, ProcurementPlan } from '../../services/procurementService';
import BulkFileUpload from '../../components/common/BulkFileUpload';
import { PDFUploadField } from '../../components/common';

const ProcurementPlanPage = () => {
  const [items, setItems] = useState<ProcurementPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementPlan | null>(null);
  const [formData, setFormData] = useState({ fiscalYear: '', documentUrl: '', documentFileName: '', published: false });
  const [editMode, setEditMode] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await procurementPlanService.list({
        page: page + 1,
        limit: rowsPerPage,
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
  }, [page, rowsPerPage]);

  const handleCreateOrUpdate = async () => {
    try {
      if (editMode && selectedItem) {
        await procurementPlanService.update(selectedItem.id, formData);
      } else {
        await procurementPlanService.create(formData);
      }
      setDialogOpen(false);
      setFormData({ fiscalYear: '', documentUrl: '', documentFileName: '', published: false });
      setEditMode(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to ${editMode ? 'update' : 'create'} item`);
    }
  };

  const handleEditClick = (item: ProcurementPlan) => {
    setSelectedItem(item);
    setFormData({
      fiscalYear: item.fiscalYear,
      documentUrl: item.documentUrl,
      documentFileName: item.documentFileName,
      published: item.published,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await procurementPlanService.delete(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete item');
    }
  };

  const handleBulkUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('published', 'false');

    try {
      await procurementPlanService.bulkUpload(formData);
      setBulkDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Bulk upload failed');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Procurement Plan</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setBulkDialogOpen(true)}>
            Bulk Upload
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add Plan
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fiscal Year</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.fiscalYear}</TableCell>
                <TableCell>{item.documentFileName}</TableCell>
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditMode(false); setSelectedItem(null); setFormData({ fiscalYear: '', documentUrl: '', documentFileName: '', published: false }); }} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Procurement Plan' : 'Add Procurement Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Fiscal Year" value={formData.fiscalYear} onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })} fullWidth />
            <PDFUploadField
              value={formData.documentUrl}
              onChange={(url) => setFormData({ ...formData, documentUrl: url, documentFileName: url.split('/').pop() || '' })}
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
          <Button onClick={() => { setDialogOpen(false); setEditMode(false); setSelectedItem(null); setFormData({ fiscalYear: '', documentUrl: '', documentFileName: '', published: false }); }}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Plans</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <BulkFileUpload onUpload={handleBulkUpload} accept=".pdf" maxFiles={10} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this plan?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementPlanPage;


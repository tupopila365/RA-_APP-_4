import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon, Edit as EditIcon } from '@mui/icons-material';
import { procurementLegislationService, ProcurementLegislation } from '../../services/procurementService';
import BulkFileUpload from '../../components/common/BulkFileUpload';
import { PDFUploadField } from '../../components/common';

const ProcurementLegislationPage = () => {
  const [items, setItems] = useState<ProcurementLegislation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [sectionTab, setSectionTab] = useState<'act' | 'regulations' | 'guidelines'>('act');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementLegislation | null>(null);
  const [formData, setFormData] = useState({ section: 'act' as 'act' | 'regulations' | 'guidelines', title: '', documentUrl: '', documentFileName: '', published: false });
  const [bulkSection, setBulkSection] = useState<'act' | 'regulations' | 'guidelines'>('act');
  const [isEditing, setIsEditing] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await procurementLegislationService.list({
        page: page + 1,
        limit: rowsPerPage,
        section: sectionTab,
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
  }, [page, rowsPerPage, sectionTab]);

  const handleCreate = async () => {
    try {
      if (isEditing && selectedItem) {
        await procurementLegislationService.update(selectedItem.id, formData);
      } else {
        await procurementLegislationService.create(formData);
      }
      setDialogOpen(false);
      setFormData({ section: 'act', title: '', documentUrl: '', documentFileName: '', published: false });
      setIsEditing(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to ${isEditing ? 'update' : 'create'} item`);
    }
  };

  const handleEdit = (item: ProcurementLegislation) => {
    setSelectedItem(item);
    setFormData({
      section: item.section,
      title: item.title,
      documentUrl: item.documentUrl,
      documentFileName: item.documentFileName,
      published: item.published,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await procurementLegislationService.delete(selectedItem.id);
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
    formData.append('section', bulkSection);
    formData.append('published', 'false');

    try {
      await procurementLegislationService.bulkUpload(formData);
      setBulkDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Bulk upload failed');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Procurement Legislation</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setBulkDialogOpen(true)}>
            Bulk Upload
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setIsEditing(false); setSelectedItem(null); setFormData({ section: 'act', title: '', documentUrl: '', documentFileName: '', published: false }); setDialogOpen(true); }}>
            Add Document
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={sectionTab} onChange={(_, v) => { setSectionTab(v); setPage(0); }}>
          <Tab label="Act" value="act" />
          <Tab label="Regulations" value="regulations" />
          <Tab label="Guidelines" value="guidelines" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.documentFileName}</TableCell>
                <TableCell><Chip label={item.published ? 'Yes' : 'No'} color={item.published ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(item)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setIsEditing(false); setSelectedItem(null); setFormData({ section: 'act', title: '', documentUrl: '', documentFileName: '', published: false }); }} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Legislation Document' : 'Add Legislation Document'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value as any })}>
                <MenuItem value="act">Act</MenuItem>
                <MenuItem value="regulations">Regulations</MenuItem>
                <MenuItem value="guidelines">Guidelines</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required />
            <PDFUploadField
              value={formData.documentUrl}
              onChange={(url) => setFormData({ ...formData, documentUrl: url, documentFileName: url.split('/').pop() || '' })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
              }
              label="Published"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setIsEditing(false); setSelectedItem(null); setFormData({ section: 'act', title: '', documentUrl: '', documentFileName: '', published: false }); }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">{isEditing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Section</InputLabel>
              <Select value={bulkSection} onChange={(e) => setBulkSection(e.target.value as any)}>
                <MenuItem value="act">Act</MenuItem>
                <MenuItem value="regulations">Regulations</MenuItem>
                <MenuItem value="guidelines">Guidelines</MenuItem>
              </Select>
            </FormControl>
            <BulkFileUpload onUpload={handleBulkUpload} accept=".pdf" maxFiles={10} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this document?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementLegislationPage;


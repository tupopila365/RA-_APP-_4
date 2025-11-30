import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
} from '@mui/icons-material';
import { getDocuments, deleteDocument } from '../../services/documents.service';
import { IDocument } from '../../types';
import PDFPreview from '../../components/common/PDFPreview';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'policy', label: 'Policy' },
  { value: 'tender', label: 'Tender' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
];

/**
 * Document List Page
 * Displays all uploaded PDF documents with search, filter, and pagination
 */
const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<IDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  // PDF Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<IDocument | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }

      const response = await getDocuments(params);

      setDocuments(response.data.items);
      setTotalCount(response.data.total);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage, searchQuery, categoryFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleUploadClick = () => {
    navigate('/documents/upload');
  };

  const handlePreview = (document: IDocument) => {
    setPreviewDocument(document);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewDocument(null);
  };

  const handleDeleteClick = (document: IDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    try {
      await deleteDocument(documentToDelete._id);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      // Refresh the list
      fetchDocuments();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string): string => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          PDF Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleUploadClick}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={handleCategoryChange}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {CATEGORIES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>File Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No documents found. Upload your first document to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {document.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {document.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(document.category)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                  <TableCell>
                    {document.indexed ? (
                      <Tooltip title="Document has been indexed and is available for chatbot queries">
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Indexed"
                          color="success"
                          size="small"
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Document is being processed for indexing. This may take a few minutes.">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={<HourglassIcon />}
                            label="Indexing"
                            color="warning"
                            size="small"
                          />
                          <CircularProgress size={16} thickness={4} />
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(document.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(document)}
                      title="Preview PDF"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(document)}
                      color="error"
                      title="Delete document"
                    >
                      <DeleteIcon />
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be
            undone and the document will be removed from the chatbot's knowledge base.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Preview Dialog */}
      {previewDocument && (
        <PDFPreview
          open={previewOpen}
          onClose={handleClosePreview}
          fileUrl={previewDocument.fileUrl}
          title={previewDocument.title}
        />
      )}
    </Box>
  );
};

export default DocumentList;

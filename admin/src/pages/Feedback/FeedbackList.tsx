import { useState, useEffect } from 'react';
import {
  Box,
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  getFeedbackList,
  updateFeedback,
  FeedbackItem,
  FeedbackListParams,
} from '../../services/feedback.service';
import { UnifiedSkeletonLoader } from '../../components/common';

const STATUS_OPTIONS = ['new', 'read', 'in-progress', 'resolved', 'closed'];
const CATEGORY_OPTIONS = ['General', 'Suggestion', 'Bug report', 'Complaint', 'Other'];

const statusColor: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  new: 'info',
  read: 'default',
  'in-progress': 'warning',
  resolved: 'success',
  closed: 'default',
};

const FeedbackList = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: FeedbackListParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      };
      const res = await getFeedbackList(params);
      setItems(res.data.feedback);
      setTotal(res.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, rowsPerPage, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchList();
  };

  const handleOpenDetail = (item: FeedbackItem) => {
    setSelectedItem(item);
    setEditStatus(item.status);
    setEditNotes(item.adminNotes || '');
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedItem(null);
  };

  const handleSaveDetail = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      await updateFeedback(selectedItem.id, {
        status: editStatus,
        adminNotes: editNotes,
      });
      setSelectedItem({ ...selectedItem, status: editStatus, adminNotes: editNotes });
      setItems((prev) =>
        prev.map((f) =>
          f.id === selectedItem.id ? { ...f, status: editStatus, adminNotes: editNotes } : f
        )
      );
      handleCloseDetail();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update feedback');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        App Feedback
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        View and manage feedback submitted from the Roads Authority mobile app.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search message, email, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="outlined" size="medium">
              Search
            </Button>
            <IconButton onClick={() => fetchList()} aria-label="Refresh" size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <UnifiedSkeletonLoader rows={10} columns={7} showActions />
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No feedback found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" noWrap>
                          {row.message}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.email || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={statusColor[row.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetail(row)}
                          aria-label="View details"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        {!loading && (
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
        )}
      </TableContainer>

      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Feedback #{selectedItem?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1">{selectedItem.category}</Typography>

              <Typography variant="body2" color="text.secondary">
                Message
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedItem.message}
                </Typography>
              </Paper>

              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{selectedItem.email || '—'}</Typography>

              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(selectedItem.createdAt).toLocaleString()}
              </Typography>

              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editStatus}
                  label="Status"
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Internal notes (not visible to user)"
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveDetail}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackList;

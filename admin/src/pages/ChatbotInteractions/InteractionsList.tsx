import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
  Button,
} from '@mui/material';
import { ThumbUp, ThumbDown, HelpOutline } from '@mui/icons-material';
import { getInteractions, IChatbotInteraction, IInteractionsListParams } from '../../services/interactions.service';

const CATEGORIES = ['general', 'policy', 'tender', 'report', 'location', 'contact', 'procedure'];

const InteractionsList = () => {
  const [interactions, setInteractions] = useState<IChatbotInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [feedbackFilter, setFeedbackFilter] = useState<'like' | 'dislike' | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: IInteractionsListParams = {
        page: page + 1,
        limit: rowsPerPage,
        feedback: feedbackFilter || undefined,
        category: categoryFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const response = await getInteractions(params);
      
      // Handle response format: { data: { interactions, pagination } }
      const interactions = response.data?.interactions || [];
      const pagination = response.data?.pagination || { total: 0 };
      
      setInteractions(interactions);
      setTotal(pagination.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to fetch interactions';
      console.error('Error fetching interactions:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, feedbackFilter, categoryFilter, startDate, endDate]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFeedbackFilterChange = (event: any) => {
    setFeedbackFilter(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFeedbackIcon = (feedback?: 'like' | 'dislike' | null) => {
    if (feedback === 'like') return <ThumbUp fontSize="small" color="success" />;
    if (feedback === 'dislike') return <ThumbDown fontSize="small" color="error" />;
    return <HelpOutline fontSize="small" color="disabled" />;
  };

  const getFeedbackLabel = (feedback?: 'like' | 'dislike' | null) => {
    if (feedback === 'like') return 'Liked';
    if (feedback === 'dislike') return 'Disliked';
    return 'No feedback';
  };

  if (loading && interactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && interactions.length === 0) {
    return (
      <Box>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={fetchInteractions}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Feedback</InputLabel>
              <Select
                value={feedbackFilter}
                label="Feedback"
                onChange={handleFeedbackFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="like">Liked</MenuItem>
                <MenuItem value="dislike">Disliked</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />

            <TextField
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Session ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No interactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              interactions.map((interaction) => (
                <TableRow key={interaction.id} hover>
                  <TableCell>{formatDate(interaction.timestamp)}</TableCell>
                  <TableCell>
                    <Tooltip title={interaction.question}>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {interaction.question}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={interaction.answer}>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {interaction.answer}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getFeedbackIcon(interaction.feedback)}
                      <Typography variant="body2">{getFeedbackLabel(interaction.feedback)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {interaction.comment ? (
                      <Tooltip title={interaction.comment}>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {interaction.comment}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={interaction.category.charAt(0).toUpperCase() + interaction.category.slice(1)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {interaction.sessionId.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default InteractionsList;

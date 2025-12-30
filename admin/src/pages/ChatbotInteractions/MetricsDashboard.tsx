import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
} from '@mui/material';
import { ThumbDown } from '@mui/icons-material';
import { getMetrics, IMetrics } from '../../services/interactions.service';

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState<IMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMetrics(
        startDate || undefined,
        endDate || undefined
      );
      setMetrics(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to fetch metrics';
      console.error('Error fetching metrics:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={fetchMetrics}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!metrics) {
    return null;
  }

  const feedbackPercentage = metrics.totalQuestions > 0
    ? ((metrics.totalLikes + metrics.totalDislikes) / metrics.totalQuestions * 100).toFixed(1)
    : '0';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Metrics Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Questions
              </Typography>
              <Typography variant="h4">{metrics.totalQuestions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Likes
              </Typography>
              <Typography variant="h4" color="success.main">
                {metrics.totalLikes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Dislikes
              </Typography>
              <Typography variant="h4" color="error.main">
                {metrics.totalDislikes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Like/Dislike Ratio
              </Typography>
              <Typography variant="h4">
                {metrics.likeDislikeRatio.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {metrics.totalLikes} : {metrics.totalDislikes || 1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Questions by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Questions by Category
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                {Object.entries(metrics.questionsByCategory).map(([category, count]) => (
                  <Chip
                    key={category}
                    label={`${category.charAt(0).toUpperCase() + category.slice(1)}: ${count}`}
                    color="primary"
                    variant="outlined"
                    size="medium"
                  />
                ))}
                {Object.keys(metrics.questionsByCategory).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feedback Statistics
              </Typography>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Feedback Rate: {feedbackPercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({metrics.totalLikes + metrics.totalDislikes} out of {metrics.totalQuestions} questions)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Disliked Questions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Disliked Questions
              </Typography>
              {metrics.mostDislikedQuestions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No disliked questions found
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Question</TableCell>
                        <TableCell>Answer</TableCell>
                        <TableCell align="right">Dislike Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.mostDislikedQuestions.map((item, index) => (
                        <TableRow key={item.interactionId} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ThumbDown fontSize="small" color="error" />
                              <Typography variant="body2">
                                {item.question}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.answer}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={item.dislikeCount}
                              color="error"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Questions Over Time */}
        {metrics.questionsOverTime.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Questions Over Time (Last 30 Days)
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Question Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.questionsOverTime.map((item) => (
                        <TableRow key={item.date} hover>
                          <TableCell>
                            {new Date(item.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{item.count}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MetricsDashboard;



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
  LinearProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { 
  ThumbDown, 
  Speed, 
  Storage, 
  SentimentSatisfied, 
  TouchApp,
  TrendingUp,
  TrendingDown,
  Refresh,
  Assessment,
  BugReport,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { getMetrics, IMetrics } from '../../services/interactions.service';

// Enhanced metrics interface
interface EnhancedMetrics extends IMetrics {
  avgResponseTime?: number;
  cacheHitRate?: number;
  avgSatisfaction?: number;
  quickReplyUsage?: number;
  totalInteractions?: number;
  errorRate?: number;
  responseTimeHistory?: Array<{ timestamp: string; responseTime: number }>;
  topQuestions?: Array<{ question: string; count: number }>;
  contentGaps?: Array<{ topic: string; frequency: number; coverage: number }>;
}

// Metric card component
const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  icon, 
  color = 'primary', 
  trend, 
  description,
  status = 'good' 
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  trend?: { value: number; isPositive: boolean };
  description?: string;
  status?: 'good' | 'warning' | 'error';
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      default: return 'primary.main';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good': return <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'warning': return <Warning sx={{ color: 'warning.main', fontSize: 16 }} />;
      case 'error': return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default: return null;
    }
  };

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ color: getStatusColor() }}>{icon}</Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          {getStatusIcon()}
        </Box>
        
        <Box display="flex" alignItems="baseline" gap={1} mb={1}>
          <Typography variant="h4" sx={{ color: getStatusColor(), fontWeight: 'bold' }}>
            {value}
          </Typography>
          {unit && (
            <Typography variant="body2" color="text.secondary">
              {unit}
            </Typography>
          )}
        </Box>

        {trend && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            {trend.isPositive ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ color: trend.isPositive ? 'success.main' : 'error.main' }}
            >
              {Math.abs(trend.value)}% vs last period
            </Typography>
          </Box>
        )}

        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Simple chart component (without external dependencies)
const SimpleLineChart = ({ 
  data, 
  title, 
  height = 200 
}: { 
  data: Array<{ label: string; value: number }>; 
  title: string;
  height?: number;
}) => {
  if (!data || data.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={height}>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height, position: 'relative', p: 2 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 150">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 30}
              x2="400"
              y2={i * 30}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#2196F3"
            strokeWidth="2"
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 380 + 10;
              const y = 130 - ((d.value - minValue) / range) * 120;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 380 + 10;
            const y = 130 - ((d.value - minValue) / range) * 120;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#2196F3"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <Box display="flex" justifyContent="space-between" mt={1}>
          {data.map((d, i) => (
            <Typography key={i} variant="caption" color="text.secondary">
              {d.label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const EnhancedMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<EnhancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch basic metrics
      const response = await getMetrics(
        startDate || undefined,
        endDate || undefined
      );
      
      // Simulate enhanced metrics (in production, these would come from the analytics API)
      const enhancedData: EnhancedMetrics = {
        ...response.data,
        avgResponseTime: 2.3 + Math.random() * 2,
        cacheHitRate: 0.65 + Math.random() * 0.2,
        avgSatisfaction: 4.2 + Math.random() * 0.6,
        quickReplyUsage: 0.35 + Math.random() * 0.3,
        totalInteractions: Math.floor(150 + Math.random() * 100),
        errorRate: 0.02 + Math.random() * 0.03,
        responseTimeHistory: generateMockTimeData(),
        topQuestions: [
          { question: 'How do I register my vehicle?', count: 45 },
          { question: 'What documents do I need for license renewal?', count: 38 },
          { question: 'Where is the nearest office?', count: 32 },
          { question: 'How much does PLN cost?', count: 28 },
          { question: 'What are the office hours?', count: 24 },
        ],
        contentGaps: [
          { topic: 'Online payment methods', frequency: 15, coverage: 0.3 },
          { topic: 'Emergency procedures', frequency: 12, coverage: 0.1 },
          { topic: 'International permits', frequency: 8, coverage: 0.4 },
        ]
      };
      
      setMetrics(enhancedData);
      setLastUpdated(new Date());
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to fetch metrics';
      console.error('Error fetching metrics:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock time series data
  const generateMockTimeData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        label: time.getHours() + ':00',
        value: 2 + Math.random() * 3 + Math.sin(i / 4) * 0.5
      });
    }
    
    return data.map(d => ({ timestamp: d.label, responseTime: d.value }));
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, startDate, endDate]);

  // Determine metric status
  const getMetricStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'error';
  };

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          🤖 Enhanced Chatbot Analytics
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto-refresh"
          />
          
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchMetrics} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Date Range Filter */}
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
            <Button variant="outlined" onClick={() => { setStartDate(''); setEndDate(''); }}>
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Enhanced Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={2}>
          <MetricCard
            title="Response Time"
            value={metrics.avgResponseTime?.toFixed(1) || '--'}
            unit="seconds"
            icon={<Speed />}
            color="primary"
            status={getMetricStatus(metrics.avgResponseTime || 0, { good: 3, warning: 5 })}
            description="Average response time"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <MetricCard
            title="Cache Hit Rate"
            value={((metrics.cacheHitRate || 0) * 100).toFixed(1)}
            unit="%"
            icon={<Storage />}
            color="success"
            status={getMetricStatus(100 - (metrics.cacheHitRate || 0) * 100, { good: 40, warning: 60 })}
            description="Cached responses"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <MetricCard
            title="User Satisfaction"
            value={metrics.avgSatisfaction?.toFixed(1) || '--'}
            unit="/5"
            icon={<SentimentSatisfied />}
            color="success"
            status={getMetricStatus(5 - (metrics.avgSatisfaction || 0), { good: 1, warning: 1.5 })}
            description="Average rating"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <MetricCard
            title="Quick Replies"
            value={((metrics.quickReplyUsage || 0) * 100).toFixed(1)}
            unit="%"
            icon={<TouchApp />}
            color="info"
            status={getMetricStatus(100 - (metrics.quickReplyUsage || 0) * 100, { good: 60, warning: 80 })}
            description="Using suggestions"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <MetricCard
            title="Total Interactions"
            value={metrics.totalInteractions?.toLocaleString() || metrics.totalQuestions}
            icon={<Assessment />}
            color="primary"
            description="Last 24 hours"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <MetricCard
            title="Error Rate"
            value={((metrics.errorRate || 0) * 100).toFixed(1)}
            unit="%"
            icon={<BugReport />}
            color="error"
            status={getMetricStatus((metrics.errorRate || 0) * 100, { good: 2, warning: 5 })}
            description="Failed requests"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SimpleLineChart
                data={metrics.responseTimeHistory?.map(h => ({
                  label: h.timestamp,
                  value: h.responseTime
                })) || []}
                title="Response Time Trend (Last 12 Hours)"
                height={250}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Response Time</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metrics.avgResponseTime?.toFixed(1)}s / 5s target
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((metrics.avgResponseTime || 0) / 5 * 100, 100)}
                  color={getMetricStatus(metrics.avgResponseTime || 0, { good: 3, warning: 5 }) === 'good' ? 'success' : 'warning'}
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Cache Efficiency</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((metrics.cacheHitRate || 0) * 100).toFixed(1)}% / 60% target
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(metrics.cacheHitRate || 0) * 100}
                  color="success"
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">User Satisfaction</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metrics.avgSatisfaction?.toFixed(1)}/5 / 4.2 target
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(metrics.avgSatisfaction || 0) / 5 * 100}
                  color="success"
                />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Error Rate</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((metrics.errorRate || 0) * 100).toFixed(1)}% / 2% target
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(metrics.errorRate || 0) * 100 * 10} // Scale for visibility
                  color={(metrics.errorRate || 0) * 100 > 5 ? 'error' : 'success'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analysis Tables */}
      <Grid container spacing={3} mb={4}>
        {/* Top Questions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔥 Most Asked Questions
              </Typography>
              {metrics.topQuestions && metrics.topQuestions.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Question</TableCell>
                        <TableCell align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.topQuestions.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {item.question}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={item.count} color="primary" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No question data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Content Gaps */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Content Gaps Analysis
              </Typography>
              {metrics.contentGaps && metrics.contentGaps.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Topic</TableCell>
                        <TableCell align="right">Frequency</TableCell>
                        <TableCell align="right">Coverage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.contentGaps.map((gap, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {gap.topic}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={gap.frequency} color="warning" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${(gap.coverage * 100).toFixed(0)}%`} 
                              color={gap.coverage < 0.3 ? 'error' : gap.coverage < 0.6 ? 'warning' : 'success'}
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No content gaps identified
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Original Metrics Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        📈 Detailed Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Legacy metrics cards */}
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

export default EnhancedMetricsDashboard;
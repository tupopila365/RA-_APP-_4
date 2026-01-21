import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Button,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Pending,
  Payment,
  Assignment,
  Warning,
  TrendingUp,
  Schedule,
  DirectionsCar,
} from '@mui/icons-material';
import { getDashboardStats, VehicleRegStatus, VehicleRegApplication } from '../../services/vehicle.service';

const VehicleDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<VehicleRegStatus, number>;
    recentApplications: VehicleRegApplication[];
    paymentOverdue: number;
    monthlyStats: { month: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      setStats(response.data.stats);
    } catch (err: any) {
      console.error('Error fetching vehicle registration stats:', err);
      setError(err.response?.data?.error?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: VehicleRegStatus) => {
    const colors: Record<VehicleRegStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      SUBMITTED: 'info',
      UNDER_REVIEW: 'warning',
      APPROVED: 'success',
      DECLINED: 'error',
      PAYMENT_PENDING: 'warning',
      PAID: 'success',
      REGISTERED: 'success',
      EXPIRED: 'error',
    };
    return colors[status] || 'default';
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total || 0,
      icon: <Description sx={{ fontSize: 48, color: 'primary.main' }} />,
      color: '#00B4E6',
      onClick: () => navigate('/vehicle-reg/applications'),
    },
    {
      title: 'Submitted',
      value: stats?.byStatus.SUBMITTED || 0,
      icon: <Pending sx={{ fontSize: 48, color: 'warning.main' }} />,
      color: '#FFA500',
      onClick: () => navigate('/vehicle-reg/applications?status=SUBMITTED'),
    },
    {
      title: 'Under Review',
      value: stats?.byStatus.UNDER_REVIEW || 0,
      icon: <Assignment sx={{ fontSize: 48, color: 'info.main' }} />,
      color: '#3498DB',
      onClick: () => navigate('/vehicle-reg/applications?status=UNDER_REVIEW'),
    },
    {
      title: 'Payment Pending',
      value: stats?.byStatus.PAYMENT_PENDING || 0,
      icon: <Payment sx={{ fontSize: 48, color: 'warning.main' }} />,
      color: '#F39C12',
      onClick: () => navigate('/vehicle-reg/applications?status=PAYMENT_PENDING'),
    },
    {
      title: 'Paid',
      value: stats?.byStatus.PAID || 0,
      icon: <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />,
      color: '#27AE60',
      onClick: () => navigate('/vehicle-reg/applications?status=PAID'),
    },
    {
      title: 'Registered',
      value: stats?.byStatus.REGISTERED || 0,
      icon: <DirectionsCar sx={{ fontSize: 48, color: 'success.main' }} />,
      color: '#27AE60',
      onClick: () => navigate('/vehicle-reg/applications?status=REGISTERED'),
    },
    {
      title: 'Payment Overdue',
      value: stats?.paymentOverdue || 0,
      icon: <Warning sx={{ fontSize: 48, color: 'error.main' }} />,
      color: '#E74C3C',
      onClick: () => navigate('/vehicle-reg/applications?status=PAYMENT_PENDING'),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Vehicle Registration Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of Vehicle Registration applications
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={card.onClick}
            >
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {card.icon}
                  <Typography variant="h4" component="div" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Applications
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/vehicle-reg/applications')}
                >
                  View All
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference ID</TableCell>
                      <TableCell>Applicant</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentApplications?.map((app) => (
                      <TableRow key={app.id || app._id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {app.referenceId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {app.businessName || `${app.surname || ''} ${app.initials || ''}`.trim() || app.fullName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {app.make} {app.seriesName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={app.status.replace(/_/g, ' ')}
                            color={getStatusColor(app.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate(`/vehicle-reg/applications/${app.id || app._id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!stats?.recentApplications || stats.recentApplications.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No recent applications
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Statistics */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Monthly Applications</Typography>
              </Box>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {stats?.monthlyStats?.map((stat, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < (stats.monthlyStats.length - 1) ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">
                      {new Date(stat.month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </Typography>
                    <Chip label={stat.count} size="small" />
                  </Box>
                ))}
                {(!stats?.monthlyStats || stats.monthlyStats.length === 0) && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Pending />}
                  onClick={() => navigate('/vehicle-reg/applications?status=SUBMITTED')}
                >
                  Review Submitted ({stats?.byStatus.SUBMITTED || 0})
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/vehicle-reg/applications?status=PAYMENT_PENDING')}
                >
                  Payment Pending ({stats?.byStatus.PAYMENT_PENDING || 0})
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<DirectionsCar />}
                  onClick={() => navigate('/vehicle-reg/applications?status=PAID')}
                >
                  Ready to Register ({stats?.byStatus.PAID || 0})
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/vehicle-reg/applications')}
                >
                  View All Applications
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleDashboardPage;

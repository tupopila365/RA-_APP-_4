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
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Pending,
  Payment,
  Inventory,
  Assignment,
} from '@mui/icons-material';
import { getDashboardStats, PLNStatus } from '../../services/pln.service';

const PLNDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<PLNStatus, number>;
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
      console.error('Error fetching PLN stats:', err);
      setError(err.response?.data?.error?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total || 0,
      icon: <Description sx={{ fontSize: 48, color: 'primary.main' }} />,
      color: '#00B4E6',
      onClick: () => navigate('/pln/applications'),
    },
    {
      title: 'Submitted',
      value: stats?.byStatus.SUBMITTED || 0,
      icon: <Pending sx={{ fontSize: 48, color: 'warning.main' }} />,
      color: '#FFA500',
      onClick: () => navigate('/pln/applications?status=SUBMITTED'),
    },
    {
      title: 'Under Review',
      value: stats?.byStatus.UNDER_REVIEW || 0,
      icon: <Assignment sx={{ fontSize: 48, color: 'info.main' }} />,
      color: '#3498DB',
      onClick: () => navigate('/pln/applications?status=UNDER_REVIEW'),
    },
    {
      title: 'Approved',
      value: stats?.byStatus.APPROVED || 0,
      icon: <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />,
      color: '#27AE60',
      onClick: () => navigate('/pln/applications?status=APPROVED'),
    },
    {
      title: 'Payment Pending',
      value: stats?.byStatus.PAYMENT_PENDING || 0,
      icon: <Payment sx={{ fontSize: 48, color: 'warning.main' }} />,
      color: '#F39C12',
      onClick: () => navigate('/pln/applications?status=PAYMENT_PENDING'),
    },
    {
      title: 'Paid',
      value: stats?.byStatus.PAID || 0,
      icon: <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />,
      color: '#27AE60',
      onClick: () => navigate('/pln/applications?status=PAID'),
    },
    {
      title: 'Plates Ordered',
      value: stats?.byStatus.PLATES_ORDERED || 0,
      icon: <Inventory sx={{ fontSize: 48, color: 'info.main' }} />,
      color: '#3498DB',
      onClick: () => navigate('/pln/applications?status=PLATES_ORDERED'),
    },
    {
      title: 'Ready for Collection',
      value: stats?.byStatus.READY_FOR_COLLECTION || 0,
      icon: <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />,
      color: '#27AE60',
      onClick: () => navigate('/pln/applications?status=READY_FOR_COLLECTION'),
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
          PLN Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of Personalized Number Plate applications
        </Typography>
      </Box>

      <Grid container spacing={3}>
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
    </Box>
  );
};

export default PLNDashboardPage;







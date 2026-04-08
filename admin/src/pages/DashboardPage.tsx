import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Layout } from '../components/Layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Chip,
} from '@mui/material';
import {
  Description,
  Article,
  ViewCarousel,
  LocationOn,
  HelpOutline,
  People,
  DirectionsCar,
  Warning as PotholeIcon,
  ChatBubble as ChatbotIcon,
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const handleModuleClick = (moduleId: string) => {
    navigate(`/${moduleId}`);
  };

  const getModuleIcon = (iconName: string) => {
    const iconProps = { sx: { fontSize: 48, color: 'primary.main' } };
    switch (iconName) {
      case 'news':
        return <Article {...iconProps} />;
      case 'banners':
        return <ViewCarousel {...iconProps} />;
      case 'locations':
        return <LocationOn {...iconProps} />;
      case 'faqs':
        return <HelpOutline {...iconProps} />;
      case 'users':
        return <People {...iconProps} />;
      case 'pln':
        return <DirectionsCar {...iconProps} />;
      case 'procurement':
        return <Description {...iconProps} />;
      case 'pothole-reports':
        return <PotholeIcon {...iconProps} />;
      case 'chatbot':
        return <ChatbotIcon {...iconProps} />;
      default:
        return null;
    }
  };

  // Define available modules based on permissions
  const modules = [
    {
      id: 'news',
      name: 'News',
      description: 'Create and manage news articles',
      icon: 'news',
      permission: 'news:manage' as const,
    },
    {
      id: 'banners',
      name: 'Banners',
      description: 'Manage homepage banners',
      icon: 'banners',
      permission: 'banners:manage' as const,
    },
    {
      id: 'locations',
      name: 'Locations',
      description: 'Manage office locations',
      icon: 'locations',
      permission: 'locations:manage' as const,
    },
    {
      id: 'faqs',
      name: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: 'faqs',
      permission: 'faqs:manage' as const,
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Manage admin users (Super-admin only)',
      icon: 'users',
      permission: 'users:manage' as const,
    },
    {
      id: 'pln',
      name: 'PLN',
      description: 'Manage Personalized Number Plate applications',
      icon: 'pln',
      permission: 'pln:manage' as const,
    },
    {
      id: 'pothole-reports',
      name: 'Pothole Reports',
      description: 'Manage pothole reports from users',
      icon: 'pothole-reports',
      permission: 'pothole-reports:manage' as const,
    },
    {
      id: 'chatbot-interactions',
      name: 'Chatbot Interactions',
      description: 'View and manage chatbot interactions',
      icon: 'chatbot',
      permission: null, // Available to all authenticated users
    },
  ];

  // Filter modules based on user permissions
  const accessibleModules = modules.filter((module) => {
    return module.permission === null || hasPermission(module.permission);
  });

  const quickStats = [
    { label: 'Accessible Modules', value: accessibleModules.length },
    { label: 'Total Modules', value: modules.length },
    { label: 'Role', value: user?.role === 'super-admin' ? 'Super Admin' : 'Admin' },
  ];

  return (
    <Layout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        <Card
          sx={{
            mb: 3,
            borderRadius: 2.5,
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(27,41,70,1) 0%, rgba(62,91,149,1) 100%)',
            color: 'common.white',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    component="img"
                    src="/assets/ra-logo.png"
                    alt="Roads Authority Namibia Logo"
                    sx={{ width: 64, height: 64, objectFit: 'contain' }}
                  />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'common.white' }}>
                      Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                      Roads Authority administration overview
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', maxWidth: 760 }}>
                  Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Manage all operational
                  modules from one place with a clear, consistent government-grade interface.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1.2 }}>
                      Active Session
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'common.white', mb: 1 }}>
                      {user?.email}
                    </Typography>
                    <Chip
                      label={user?.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'common.white' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {quickStats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 2.2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.8 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 2.2 }}>
          <Typography variant="h5">Modules</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Select a module to open its administration workspace.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {accessibleModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  },
                }}
              >
                <CardActionArea onClick={() => handleModuleClick(module.id)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1.5,
                          bgcolor: 'grey.100',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Box sx={{ '& svg': { fontSize: 24, color: 'primary.main' } }}>{getModuleIcon(module.icon)}</Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {module.name}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {module.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {accessibleModules.length === 0 && (
          <Card sx={{ mt: 2.5, borderStyle: 'dashed', borderWidth: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 0.8 }}>
                No modules accessible
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No modules are available for your account permissions. Contact a super admin for access.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
};

export default DashboardPage;

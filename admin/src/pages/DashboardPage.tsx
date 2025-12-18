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
} from '@mui/material';
import {
  Description,
  Article,
  Work,
  Gavel,
  ViewCarousel,
  LocationOn,
  HelpOutline,
  People,
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
      case 'documents':
        return <Description {...iconProps} />;
      case 'news':
        return <Article {...iconProps} />;
      case 'vacancies':
        return <Work {...iconProps} />;
      case 'tenders':
        return <Gavel {...iconProps} />;
      case 'banners':
        return <ViewCarousel {...iconProps} />;
      case 'locations':
        return <LocationOn {...iconProps} />;
      case 'faqs':
        return <HelpOutline {...iconProps} />;
      case 'users':
        return <People {...iconProps} />;
      default:
        return null;
    }
  };

  // Define available modules based on permissions
  const modules = [
    {
      id: 'documents',
      name: 'Documents',
      description: 'Upload and manage PDF documents for chatbot',
      icon: 'documents',
      permission: 'documents:upload' as const,
    },
    {
      id: 'news',
      name: 'News',
      description: 'Create and manage news articles',
      icon: 'news',
      permission: 'news:manage' as const,
    },
    {
      id: 'vacancies',
      name: 'Vacancies',
      description: 'Manage job vacancies and opportunities',
      icon: 'vacancies',
      permission: 'vacancies:manage' as const,
    },
    {
      id: 'tenders',
      name: 'Tenders',
      description: 'Manage tenders and procurement',
      icon: 'tenders',
      permission: 'tenders:manage' as const,
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
  ];

  // Filter modules based on user permissions
  const accessibleModules = modules.filter((module) => {
    return hasPermission(module.permission);
  });

  return (
    <Layout>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome back, {user?.email?.split('@')[0]}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a module below to access its administrative functions.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {accessibleModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleModuleClick(module.id)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      {getModuleIcon(module.icon)}
                      <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                        {module.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {accessibleModules.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No modules accessible with your current permissions.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please contact your administrator for access.
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default DashboardPage;

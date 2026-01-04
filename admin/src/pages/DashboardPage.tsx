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
  DirectionsCar,
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
      case 'pln':
        return <DirectionsCar {...iconProps} />;
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
    {
      id: 'pln',
      name: 'PLN',
      description: 'Manage Personalized Number Plate applications',
      icon: 'pln',
      permission: 'pln:manage' as const,
    },
  ];

  // Filter modules based on user permissions
  const accessibleModules = modules.filter((module) => {
    return hasPermission(module.permission);
  });

  return (
    <Layout>
      <Box>
        {/* Hero Welcome Section */}
        <Box
          sx={{
            mb: 5,
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(0, 180, 230, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            border: '1px solid rgba(0, 180, 230, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 180, 230, 0.1) 0%, transparent 70%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00B4E6 0%, #0090C0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: '1.125rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Select a module below to access its administrative functions.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {accessibleModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0px 12px 32px rgba(0, 180, 230, 0.2), 0px 6px 16px rgba(0, 0, 0, 0.1)',
                    borderColor: 'primary.main',
                    '& .module-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleModuleClick(module.id)}
                  sx={{
                    height: '100%',
                    p: 3,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* Icon Background */}
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, rgba(0, 180, 230, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '1px solid rgba(0, 180, 230, 0.2)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        className="module-icon-container"
                      >
                        <Box
                          className="module-icon"
                          sx={{
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& svg': {
                              fontSize: 48,
                              background: 'linear-gradient(135deg, #00B4E6 0%, #0090C0 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            },
                          }}
                        >
                          {getModuleIcon(module.icon)}
                        </Box>
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          mt: 1,
                          mb: 1.5,
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '1.25rem',
                        }}
                      >
                        {module.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          fontSize: '0.9375rem',
                        }}
                      >
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
              py: 10,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'grey.300',
              background: 'linear-gradient(135deg, rgba(0, 180, 230, 0.02) 0%, rgba(255, 215, 0, 0.02) 100%)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: 1,
              }}
            >
              No modules accessible
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
              No modules accessible with your current permissions.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Please contact your administrator for access.
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default DashboardPage;

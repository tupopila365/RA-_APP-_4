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
  Warning as PotholeIcon,
  ReportProblem as IncidentIcon,
  ChatBubble as ChatbotIcon,
  ListAlt as RegisterIcon,
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
      case 'procurement':
        return <Description {...iconProps} />;
      case 'pothole-reports':
        return <PotholeIcon {...iconProps} />;
      case 'incidents':
        return <IncidentIcon {...iconProps} />;
      case 'chatbot':
        return <ChatbotIcon {...iconProps} />;
      case 'bids-rfqs':
        return <RegisterIcon {...iconProps} />;
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
    {
      id: 'procurement-legislation',
      name: 'Procurement Legislation',
      description: 'Manage procurement legislation documents',
      icon: 'procurement',
      permission: 'procurement:legislation:manage' as const,
    },
    {
      id: 'procurement-plan',
      name: 'Procurement Plan',
      description: 'Manage annual procurement plans',
      icon: 'procurement',
      permission: 'procurement:plan:manage' as const,
    },
    {
      id: 'procurement-awards',
      name: 'Procurement Awards',
      description: 'Manage procurement awards and notices',
      icon: 'procurement',
      permission: 'procurement:awards:manage' as const,
    },
    {
      id: 'procurement-opening-register',
      name: 'Opening Register',
      description: 'Manage procurement opening register items',
      icon: 'procurement',
      permission: 'procurement:opening-register:manage' as const,
    },
    {
      id: 'bids-rfqs',
      name: 'Bids / RFQs',
      description: 'Manage bids and request for quotations',
      icon: 'bids-rfqs',
      permission: 'procurement:opening-register:manage' as const,
    },
    {
      id: 'pothole-reports',
      name: 'Pothole Reports',
      description: 'Manage pothole reports from users',
      icon: 'pothole-reports',
      permission: 'pothole-reports:manage' as const,
    },
    {
      id: 'incidents',
      name: 'Incidents',
      description: 'Manage road incidents and reports',
      icon: 'incidents',
      permission: 'incidents:manage' as const,
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

  return (
    <Layout>
      <Box sx={{ 
        width: '100%', 
        maxWidth: '100%',
        margin: 0,
        padding: 0,
      }}>
        {/* RA Logo and App Info Section */}
          <Box
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 2,
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
            }}
          >
          <Box
            component="img"
            src="/assets/ra-logo.png"
            alt="Roads Authority Namibia Logo"
            sx={{
              width: 100,
              height: 100,
              objectFit: 'contain',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
              Roads Authority Namibia
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                mb: 1.5,
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.7,
              }}
            >
              Welcome to the RA App Administration Portal. Manage news, procurement, vacancies, 
              tenders, and all Road Authority services. Select a module below to get started.
            </Typography>
          </Box>
        </Box>

        {/* Welcome Section */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 2,
            background: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 1,
            }}
          >
            Welcome back, {user?.email?.split('@')[0] || 'Admin'}! 👋
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            You have access to {accessibleModules.length} module{accessibleModules.length !== 1 ? 's' : ''}. 
            Select a module below to access its administrative functions.
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={3}
          sx={{ 
            width: '100%',
            maxWidth: 'none',
            margin: 0,
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          {accessibleModules.map((module) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              xl={3} 
              key={module.id}
            >
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#FFFFFF',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
                    borderColor: 'primary.main',
                    '& .module-icon': {
                      transform: 'scale(1.02)',
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
                          width: 72,
                          height: 72,
                          borderRadius: 2,
                          background: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '1px solid rgba(30, 58, 138, 0.1)',
                          transition: 'all 0.2s ease',
                        }}
                        className="module-icon-container"
                      >
                        <Box
                          className="module-icon"
                          sx={{
                            transition: 'transform 0.2s ease',
                            '& svg': {
                              fontSize: 40,
                              color: 'primary.main',
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
                          fontWeight: 600,
                          color: 'text.primary',
                          fontSize: '1.125rem',
                        }}
                      >
                        {module.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          fontSize: '0.875rem',
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

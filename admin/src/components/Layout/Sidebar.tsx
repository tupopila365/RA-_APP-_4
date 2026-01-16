import React, { useMemo } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ChatBubble as ChatbotIcon,
  Article as NewsIcon,
  Work as VacancyIcon,
  Gavel as TenderIcon,
  ViewCarousel as BannerIcon,
  LocationOn as LocationIcon,
  HelpOutline as FAQIcon,
  People as UsersIcon,
  Warning as PotholeIcon,
  Traffic as RoadStatusIcon,
  ReportProblem as IncidentIcon,
  Description as ProcurementIcon,
  ListAlt as RegisterIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  permission: Permission | null;
}

/**
 * Sidebar component with dynamic navigation based on user permissions
 */
const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isSuperAdmin } = usePermissions();

  /**
   * Navigation items array with permission checks
   * Items with null permission are visible to all authenticated users
   */
  const navigationItems: NavigationItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        permission: null,
      },
      {
        label: 'Chatbot Interactions',
        path: '/chatbot-interactions',
        icon: <ChatbotIcon />,
        permission: null,
      },
      {
        label: 'News',
        path: '/news',
        icon: <NewsIcon />,
        permission: 'news:manage',
      },
      {
        label: 'Vacancies',
        path: '/vacancies',
        icon: <VacancyIcon />,
        permission: 'vacancies:manage',
      },
      {
        label: 'Tenders',
        path: '/tenders',
        icon: <TenderIcon />,
        permission: 'tenders:manage',
      },
      {
        label: 'Banners',
        path: '/banners',
        icon: <BannerIcon />,
        permission: 'banners:manage',
      },
      {
        label: 'Locations',
        path: '/locations',
        icon: <LocationIcon />,
        permission: 'locations:manage',
      },
      {
        label: 'FAQs',
        path: '/faqs',
        icon: <FAQIcon />,
        permission: 'faqs:manage',
      },
      {
        label: 'Pothole Reports',
        path: '/pothole-reports',
        icon: <PotholeIcon />,
        permission: 'pothole-reports:manage',
      },
      {
        label: 'Road Status',
        path: '/road-status',
        icon: <RoadStatusIcon />,
        permission: 'road-status:manage',
      },
      {
        label: 'Incidents',
        path: '/incidents',
        icon: <IncidentIcon />,
        permission: 'incidents:manage',
      },
      {
        label: 'Procurement Legislation',
        path: '/procurement-legislation',
        icon: <ProcurementIcon />,
        permission: 'procurement:legislation:manage',
      },
      {
        label: 'Procurement Plan',
        path: '/procurement-plan',
        icon: <ProcurementIcon />,
        permission: 'procurement:plan:manage',
      },
      {
        label: 'Procurement Awards',
        path: '/procurement-awards',
        icon: <ProcurementIcon />,
        permission: 'procurement:awards:manage',
      },
      {
        label: 'Forms & Documents',
        path: '/forms',
        icon: <ProcurementIcon />,
        permission: 'procurement:awards:manage',
      },
      {
        label: 'Opening Register',
        path: '/procurement-opening-register',
        icon: <ProcurementIcon />,
        permission: 'procurement:opening-register:manage',
      },
      {
        label: 'Bids / RFQs',
        path: '/bids-rfqs',
        icon: <RegisterIcon />,
        permission: 'procurement:opening-register:manage',
      },
      {
        label: 'Users',
        path: '/users',
        icon: <UsersIcon />,
        permission: 'users:manage',
      },
    ],
    []
  );

  /**
   * Filter navigation items based on user permissions
   */
  const visibleNavigationItems = useMemo(() => {
    return navigationItems.filter((item) => {
      // Items with no permission requirement are visible to all
      if (item.permission === null) return true;

      // Check if user has the required permission
      return hasPermission(item.permission);
    });
  }, [navigationItems, hasPermission]);

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile drawer after navigation
    if (mobileOpen) {
      onDrawerToggle();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background: '#1E3A8A', // Navy blue
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Toolbar
        sx={{
          py: 2,
          px: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#1E40AF', // Slightly lighter navy for header
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/assets/ra-logo.png"
            alt="RA Logo"
            sx={{
              width: 40,
              height: 40,
              objectFit: 'contain',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                color: 'white',
                fontSize: '0.9375rem',
                letterSpacing: '0.01em',
                lineHeight: 1.2,
              }}
            >
              Roads Authority
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
                fontWeight: 400,
              }}
            >
              Admin Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List
        sx={{
          flexGrow: 1,
          pt: 1,
          px: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {visibleNavigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.25,
                mx: 1,
                py: 1.25,
                px: 2,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: '#3B82F6', // Lighter blue for selected
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#2563EB',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    backgroundColor: '#EFF6FF',
                    borderRadius: '0 2px 2px 0',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  minWidth: 36,
                  transition: 'color 0.15s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 500 : 400,
                  fontSize: '0.875rem',
                  color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.85)',
                  letterSpacing: '0.01em',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isSuperAdmin && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
          <Box
            sx={{
              px: 2,
              py: 1.25,
              mx: 1,
              mb: 1,
              borderRadius: 1,
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#0EA5E9',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.6875rem',
              }}
            >
              SUPER ADMIN
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="navigation menu"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

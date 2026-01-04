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
  ReportProblem as IncidentIcon,
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
        label: 'Incidents',
        path: '/incidents',
        icon: <IncidentIcon />,
        permission: 'incidents:manage',
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
        background: 'linear-gradient(180deg, rgba(0, 180, 230, 0.95) 0%, rgba(0, 144, 192, 0.98) 100%)',
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>
              RA
            </Typography>
          </Box>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: '1.25rem',
              letterSpacing: '0.02em',
            }}
          >
            Admin
          </Typography>
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
                borderRadius: 2,
                mb: 0.5,
                mx: 0.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateX(4px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    backgroundColor: '#FFD700',
                    borderRadius: '0 4px 4px 0',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  minWidth: 40,
                  transition: 'color 0.2s',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.9375rem',
                  color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.9)',
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
              py: 1.5,
              mx: 1,
              mb: 1,
              borderRadius: 2,
              background: 'rgba(255, 215, 0, 0.2)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#FFD700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.7rem',
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
            borderRight: 'none',
            boxShadow: '4px 0 16px rgba(0, 0, 0, 0.15)',
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
            borderRight: 'none',
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

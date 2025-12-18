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
  Description as DocumentIcon,
  Article as NewsIcon,
  Work as VacancyIcon,
  Gavel as TenderIcon,
  ViewCarousel as BannerIcon,
  LocationOn as LocationIcon,
  HelpOutline as FAQIcon,
  People as UsersIcon,
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
        label: 'Documents',
        path: '/documents',
        icon: <DocumentIcon />,
        permission: 'documents:upload',
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
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              RA
            </Typography>
          </Box>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            Admin
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {visibleNavigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isSuperAdmin && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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

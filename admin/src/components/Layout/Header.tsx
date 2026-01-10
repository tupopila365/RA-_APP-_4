import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

/**
 * Header component with user info and logout button
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick, drawerWidth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  const getRoleDisplay = () => {
    if (!user?.role) return '';
    return user.role === 'super-admin' ? 'Super Admin' : 'Admin';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#1E3A8A', // Navy blue to match sidebar
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            display: { sm: 'none' },
            transition: 'background-color 0.15s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: '#FFFFFF',
            fontSize: '1rem',
          }}
        >
          Roads Authority Admin
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                fontSize: '0.875rem',
              }}
            >
              {user?.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {getRoleDisplay()}
            </Typography>
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            size="small"
            aria-controls={anchorEl ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
            sx={{
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#EFF6FF',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#1E3A8A',
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          TransitionProps={{
            timeout: { enter: 200, exit: 150 },
          }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              '& .MuiMenuItem-root': {
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                },
              },
            },
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              background: '#F8FAFC',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {user?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {getRoleDisplay()}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              py: 1.5,
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              py: 1.5,
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2.5,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Logout fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

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
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'rgba(0, 180, 230, 0.85)',
        background: 'linear-gradient(135deg, rgba(0, 180, 230, 0.9) 0%, rgba(0, 144, 192, 0.9) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.1)',
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
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0px 4px 12px rgba(255, 215, 0, 0.4)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'secondary.main',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1A202C',
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
            elevation: 8,
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              '& .MuiMenuItem-root': {
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(0, 180, 230, 0.08)',
                },
              },
            },
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              background: 'linear-gradient(135deg, rgba(0, 180, 230, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
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

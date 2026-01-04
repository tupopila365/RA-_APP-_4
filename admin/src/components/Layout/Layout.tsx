import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

/**
 * Main layout wrapper component
 * Provides consistent layout structure with header and sidebar
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.grey[50],
          backgroundImage: 'linear-gradient(135deg, rgba(0, 180, 230, 0.02) 0%, rgba(255, 215, 0, 0.02) 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(0, 180, 230, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

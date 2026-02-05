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
      <Toolbar
        sx={{
          flexGrow: 1,
          flexDirection: 'column',
          minHeight: 0,
          p: 0,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            maxWidth: '100%',
            minHeight: '100vh',
            backgroundColor: '#F8FAFC', // Clean light gray background - banking style
            position: 'relative',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Box sx={{ 
            position: 'relative', 
            zIndex: 1, 
            width: '100%', 
            maxWidth: '100%',
            margin: 0,
            padding: 0,
          }}>
            {children}
          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Layout;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { Box, Card, CardContent, Typography } from '@mui/material';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  /**
   * Redirect to dashboard if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  /**
   * Show loading spinner while checking authentication
   */
  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  /**
   * Don't render login form if already authenticated
   */
  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        backgroundColor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/assets/ra-logo.png"
              alt="Roads Authority Namibia Logo"
              sx={{ width: 88, height: 88, objectFit: 'contain', mb: 1.5 }}
            />
            <Typography variant="h4" sx={{ mb: 0.75 }}>
              Roads Authority
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </Box>

          <LoginForm />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            © {new Date().getFullYear()} Roads Authority Namibia. All rights reserved.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

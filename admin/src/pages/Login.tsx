import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';
import LoadingSpinner from '../components/LoadingSpinner';

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
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img
            src="/assets/ra-logo.png"
            alt="Roads Authority Namibia Logo"
            className="ra-logo"
          />
          <h1 className="app-title">Roads Authority</h1>
          <p className="app-subtitle">Admin Portal</p>
        </div>

        <LoginForm />

        <div className="login-footer">
          <p className="login-footer-text">
            © {new Date().getFullYear()} Roads Authority Namibia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

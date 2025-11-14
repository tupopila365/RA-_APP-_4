import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const result = await login(username.trim(), password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemoCredentials = (cred) => {
    setUsername(cred.username);
    setPassword(cred.password);
    setError('');
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', department: 'Administration' },
    { username: 'comm_user', password: 'comm123', department: 'Communications' },
    { username: 'frontdesk_user', password: 'front123', department: 'Front Desk' },
    { username: 'proc_user', password: 'proc123', department: 'Procurement' },
    { username: 'hr_user', password: 'hr123', department: 'HR' },
  ];

  if (isLoading) {
    return <LoadingSpinner message="Signing in..." />;
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

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '24px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <h4 className="demo-title">Demo Credentials:</h4>
          {demoCredentials.map((cred, index) => (
            <div key={index} className="demo-item">
              <span className="demo-text">
                {cred.username} - {cred.department}
              </span>
              <button
                className="demo-button"
                onClick={() => fillDemoCredentials(cred)}
                type="button"
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
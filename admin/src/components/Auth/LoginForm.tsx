import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!password.trim()) {
      setError('Password is required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:45',message:'Login form submitted',data:{email:email.trim(),hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Validate inputs
    if (!validateForm()) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:52',message:'Form validation failed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    setIsSubmitting(true);

    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:57',message:'Calling login service',data:{email:email.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      await login(email.trim(), password);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:59',message:'Login successful, navigating',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default: navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:66',message:'Login error caught',data:{errorMessage:err?.message,errorType:err?.constructor?.name,hasResponse:!!err?.response,responseStatus:err?.response?.status,responseData:err?.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
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
          disabled={isSubmitting}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;

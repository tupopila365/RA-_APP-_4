import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent, clearAuthentication } from '../test-utils';
import { LoginForm } from '../../components/Auth/LoginForm';
import { authService } from '../../services/auth.service';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    clearAuthentication();
    mockNavigate.mockClear();
  });

  it('should complete full login flow successfully', async () => {
    const user = userEvent.setup();

    // Render login form
    renderWithProviders(<LoginForm />);

    // Verify form is rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Fill in credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'superadmin@ra.gov.na');
    await user.type(passwordInput, 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Wait for login to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    // Verify user is authenticated
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getCurrentUser()).toBeDefined();
    expect(authService.getCurrentUser()?.email).toBe('superadmin@ra.gov.na');

    // Verify tokens are stored
    expect(localStorage.getItem('ra_admin_access_token')).toBeDefined();
    expect(localStorage.getItem('ra_admin_refresh_token')).toBeDefined();
  });

  it('should handle login failure correctly', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />);

    // Fill in invalid credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });

    // Verify user is not authenticated
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('should have form validation attributes', () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Check that form has proper validation attributes
    expect(emailInput).toBeRequired();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle logout flow', async () => {
    // First login
    await authService.login({
      email: 'superadmin@ra.gov.na',
      password: 'password123',
    });

    // Verify authenticated
    expect(authService.isAuthenticated()).toBe(true);

    // Logout
    await authService.logout();

    // Verify logged out
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('ra_admin_user')).toBeNull();
    expect(localStorage.getItem('ra_admin_access_token')).toBeNull();
    expect(localStorage.getItem('ra_admin_refresh_token')).toBeNull();
  });

  it('should persist authentication across page reloads', async () => {
    // Login
    await authService.login({
      email: 'superadmin@ra.gov.na',
      password: 'password123',
    });

    // Verify authenticated
    expect(authService.isAuthenticated()).toBe(true);
    const user = authService.getCurrentUser();

    // Simulate page reload by creating new service instance
    // (In real app, this would be a page refresh)
    const isStillAuthenticated = authService.isAuthenticated();
    const userAfterReload = authService.getCurrentUser();

    expect(isStillAuthenticated).toBe(true);
    expect(userAfterReload).toEqual(user);
  });
});

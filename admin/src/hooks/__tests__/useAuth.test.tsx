import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../useAuth';
import { setupAuthenticatedUser, clearAuthentication, mockSuperAdmin } from '../../test/test-utils';

describe('useAuth', () => {
  beforeEach(() => {
    clearAuthentication();
  });

  it('should return initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should load authenticated user from localStorage on mount', async () => {
    setupAuthenticatedUser(mockSuperAdmin);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockSuperAdmin);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login successfully with valid credentials', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.login('superadmin@ra.gov.na', 'password123');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual(mockSuperAdmin);
  });

  it('should throw error on login with invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      result.current.login('invalid@example.com', 'wrongpassword')
    ).rejects.toThrow();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should logout successfully', async () => {
    setupAuthenticatedUser(mockSuperAdmin);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('ra_admin_user')).toBeNull();
  });

  it('should handle token refresh', async () => {
    setupAuthenticatedUser(mockSuperAdmin);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await expect(result.current.refreshToken()).resolves.not.toThrow();
  });
});

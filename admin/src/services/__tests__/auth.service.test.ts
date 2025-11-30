import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth.service';
import { clearAuthentication, mockSuperAdmin, mockTokens } from '../../test/test-utils';

describe('AuthService', () => {
  beforeEach(() => {
    clearAuthentication();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await authService.login({
        email: 'superadmin@ra.gov.na',
        password: 'password123',
      });

      expect(result.user).toEqual(mockSuperAdmin);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);

      // Check tokens are stored
      expect(localStorage.getItem('ra_admin_access_token')).toBe(mockTokens.accessToken);
      expect(localStorage.getItem('ra_admin_refresh_token')).toBe(mockTokens.refreshToken);

      // Check user is stored
      const storedUser = JSON.parse(localStorage.getItem('ra_admin_user') || '{}');
      expect(storedUser).toEqual(mockSuperAdmin);
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        authService.login({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      // Setup existing tokens
      localStorage.setItem('ra_admin_refresh_token', mockTokens.refreshToken);

      const result = await authService.refreshAccessToken();

      expect(result.accessToken).toBe('new-access-token');
      expect(localStorage.getItem('ra_admin_access_token')).toBe('new-access-token');
    });

    it('should throw error when no refresh token available', async () => {
      await expect(authService.refreshAccessToken()).rejects.toThrow(
        'No refresh token available'
      );
    });
  });

  describe('logout', () => {
    it('should clear tokens and user data on logout', async () => {
      // Setup authenticated state
      localStorage.setItem('ra_admin_user', JSON.stringify(mockSuperAdmin));
      localStorage.setItem('ra_admin_access_token', mockTokens.accessToken);
      localStorage.setItem('ra_admin_refresh_token', mockTokens.refreshToken);

      await authService.logout();

      expect(localStorage.getItem('ra_admin_user')).toBeNull();
      expect(localStorage.getItem('ra_admin_access_token')).toBeNull();
      expect(localStorage.getItem('ra_admin_refresh_token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      localStorage.setItem('ra_admin_user', JSON.stringify(mockSuperAdmin));
      localStorage.setItem('ra_admin_access_token', mockTokens.accessToken);

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from localStorage', () => {
      localStorage.setItem('ra_admin_user', JSON.stringify(mockSuperAdmin));

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockSuperAdmin);
    });

    it('should return null when no user in localStorage', () => {
      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when user data is invalid JSON', () => {
      localStorage.setItem('ra_admin_user', 'invalid-json');

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true for super-admin with any permission', () => {
      localStorage.setItem('ra_admin_user', JSON.stringify(mockSuperAdmin));

      expect(authService.hasPermission('news:manage')).toBe(true);
      expect(authService.hasPermission('users:manage')).toBe(true);
      expect(authService.hasPermission('any:permission')).toBe(true);
    });

    it('should check specific permissions for regular admin', () => {
      const admin = {
        ...mockSuperAdmin,
        role: 'admin' as const,
        permissions: ['news:manage'],
      };
      localStorage.setItem('ra_admin_user', JSON.stringify(admin));

      expect(authService.hasPermission('news:manage')).toBe(true);
      expect(authService.hasPermission('users:manage')).toBe(false);
    });

    it('should return false when not authenticated', () => {
      expect(authService.hasPermission('news:manage')).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true for super-admin', () => {
      localStorage.setItem('ra_admin_user', JSON.stringify(mockSuperAdmin));

      expect(authService.isSuperAdmin()).toBe(true);
    });

    it('should return false for regular admin', () => {
      const admin = { ...mockSuperAdmin, role: 'admin' as const };
      localStorage.setItem('ra_admin_user', JSON.stringify(admin));

      expect(authService.isSuperAdmin()).toBe(false);
    });

    it('should return false when not authenticated', () => {
      expect(authService.isSuperAdmin()).toBe(false);
    });
  });
});

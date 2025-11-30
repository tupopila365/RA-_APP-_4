import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import { usePermissions } from '../usePermissions';
import { setupAuthenticatedUser, clearAuthentication, mockSuperAdmin, mockAdmin } from '../../test/test-utils';

describe('usePermissions', () => {
  beforeEach(() => {
    clearAuthentication();
  });

  it('should return false for all permissions when not authenticated', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasPermission('news:manage')).toBe(false);
    expect(result.current.hasAnyPermission(['news:manage', 'users:manage'])).toBe(false);
    expect(result.current.hasAllPermissions(['news:manage', 'users:manage'])).toBe(false);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.permissions).toEqual([]);
  });

  it('should return true for all permissions for super-admin', async () => {
    setupAuthenticatedUser(mockSuperAdmin);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuperAdmin).toBe(true);
    });

    expect(result.current.hasPermission('news:manage')).toBe(true);
    expect(result.current.hasPermission('users:manage')).toBe(true);
    expect(result.current.hasPermission('tenders:manage')).toBe(true);
    expect(result.current.hasAnyPermission(['news:manage', 'users:manage'])).toBe(true);
    expect(result.current.hasAllPermissions(['news:manage', 'users:manage'])).toBe(true);
  });

  it('should check specific permissions for regular admin', async () => {
    setupAuthenticatedUser(mockAdmin);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuperAdmin).toBe(false);
    });

    // Admin has news:manage and documents:upload
    expect(result.current.hasPermission('news:manage')).toBe(true);
    expect(result.current.hasPermission('documents:upload')).toBe(true);

    // Admin doesn't have users:manage
    expect(result.current.hasPermission('users:manage')).toBe(false);
    expect(result.current.hasPermission('tenders:manage')).toBe(false);
  });

  it('should check if user has any of the specified permissions', async () => {
    setupAuthenticatedUser(mockAdmin);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.permissions.length).toBeGreaterThan(0);
    });

    // Has at least one of these permissions
    expect(result.current.hasAnyPermission(['news:manage', 'users:manage'])).toBe(true);

    // Doesn't have any of these permissions
    expect(result.current.hasAnyPermission(['users:manage', 'tenders:manage'])).toBe(false);
  });

  it('should check if user has all of the specified permissions', async () => {
    setupAuthenticatedUser(mockAdmin);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.permissions.length).toBeGreaterThan(0);
    });

    // Has both permissions
    expect(result.current.hasAllPermissions(['news:manage', 'documents:upload'])).toBe(true);

    // Doesn't have all permissions
    expect(result.current.hasAllPermissions(['news:manage', 'users:manage'])).toBe(false);
  });

  it('should return user permissions array', async () => {
    setupAuthenticatedUser(mockAdmin);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.permissions).toEqual(['news:manage', 'documents:upload']);
    });
  });
});

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { Permission } from '../types';

interface PermissionCheck {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isSuperAdmin: boolean;
  permissions: string[];
}

/**
 * Custom hook for checking user permissions
 */
export const usePermissions = (): PermissionCheck => {
  const { user } = useAuth();

  const permissionCheck = useMemo<PermissionCheck>(() => {
    if (!user) {
      return {
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        isSuperAdmin: false,
        permissions: [],
      };
    }

    const isSuperAdmin = user.role === 'super-admin';

    return {
      /**
       * Check if user has a specific permission
       */
      hasPermission: (permission: Permission): boolean => {
        // Super-admin has all permissions
        if (isSuperAdmin) return true;

        // Check if user has the specific permission
        return user.permissions.includes(permission);
      },

      /**
       * Check if user has any of the specified permissions
       */
      hasAnyPermission: (permissions: Permission[]): boolean => {
        // Super-admin has all permissions
        if (isSuperAdmin) return true;

        // Check if user has at least one of the permissions
        return permissions.some((permission) => user.permissions.includes(permission));
      },

      /**
       * Check if user has all of the specified permissions
       */
      hasAllPermissions: (permissions: Permission[]): boolean => {
        // Super-admin has all permissions
        if (isSuperAdmin) return true;

        // Check if user has all the permissions
        return permissions.every((permission) => user.permissions.includes(permission));
      },

      /**
       * Check if user is super-admin
       */
      isSuperAdmin,

      /**
       * Get user's permissions array
       */
      permissions: user.permissions,
    };
  }, [user]);

  return permissionCheck;
};

export default usePermissions;

import apiClient, { tokenManager } from './api';
import { IUser, IApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const response = await apiClient.post<IApiResponse<LoginResult>>('/auth/login', credentials);

      if (!response.data.success) {
        throw new Error('Login failed');
      }

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken);

      // Store user data
      localStorage.setItem('ra_admin_user', JSON.stringify(user));

      return { user, accessToken, refreshToken };
    } catch (error: any) {
      // Handle API error responses
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Login failed');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<RefreshResult> {
    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<IApiResponse<RefreshResult>>('/auth/refresh', {
        refreshToken,
      });

      if (!response.data.success) {
        throw new Error('Token refresh failed');
      }

      const { accessToken } = response.data.data;

      // Update access token
      tokenManager.setTokens(accessToken, refreshToken);

      return { accessToken };
    } catch (error: any) {
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      localStorage.removeItem('ra_admin_user');

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Token refresh failed');
      }
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate refresh token on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      tokenManager.clearTokens();
      localStorage.removeItem('ra_admin_user');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.hasValidToken() && !!this.getCurrentUser();
  }

  /**
   * Get current user from local storage
   */
  getCurrentUser(): IUser | null {
    try {
      const userJson = localStorage.getItem('ra_admin_user');
      if (!userJson) return null;

      return JSON.parse(userJson) as IUser;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super-admin has all permissions
    if (user.role === 'super-admin') return true;

    // Check if user has the specific permission
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has super-admin role
   */
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super-admin';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

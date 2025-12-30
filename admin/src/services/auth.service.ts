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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:23',message:'AuthService.login called',data:{email:credentials.email,hasPassword:!!credentials.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:25',message:'Making API request to /auth/login',data:{baseURL:import.meta.env.VITE_API_BASE_URL||'http://localhost:5000'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const response = await apiClient.post<IApiResponse<LoginResult>>('/auth/login', credentials);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:27',message:'API response received',data:{status:response.status,success:response.data?.success,hasData:!!response.data?.data,hasUser:!!response.data?.data?.user,hasTokens:!!(response.data?.data?.accessToken&&response.data?.data?.refreshToken)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (!response.data.success) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:28',message:'Response success is false',data:{responseData:response.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw new Error('Login failed');
      }

      const { user, accessToken, refreshToken } = response.data.data;

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:34',message:'Storing tokens and user data',data:{hasAccessToken:!!accessToken,hasRefreshToken:!!refreshToken,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken);

      // Store user data
      localStorage.setItem('ra_admin_user', JSON.stringify(user));

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:39',message:'Login completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      return { user, accessToken, refreshToken };
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:40',message:'AuthService.login error',data:{errorMessage:error?.message,errorType:error?.constructor?.name,isAxiosError:error?.isAxiosError,responseStatus:error?.response?.status,responseData:error?.response?.data,code:error?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
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

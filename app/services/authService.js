import { ApiClient } from './api';
import * as SecureStore from 'expo-secure-store';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;
const ACCESS_TOKEN_KEY = 'app_access_token';
const REFRESH_TOKEN_KEY = 'app_refresh_token';
const USER_KEY = 'app_user';

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} fullName - User full name (optional)
   * @param {string} phoneNumber - User phone number (optional)
   */
  async register(email, password, fullName = null, phoneNumber = null) {
    try {
      // Use longer timeout for registration (30 seconds)
      const response = await ApiClient.requestWithTimeout(
        '/app-users/register',
        30000,
        {
          method: 'POST',
          body: {
            email: email.trim(),
            password,
            fullName: fullName?.trim() || undefined,
            phoneNumber: phoneNumber?.trim() || undefined,
          },
        }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }

      // Store tokens and user data
      await this.storeTokens(response.data.accessToken, response.data.refreshToken);
      await this.storeUser(response.data.user);

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const fullUrl = `${API_BASE_URL}/app-users/register`;
      
      if (error.status === 408 || error.details?.timeout) {
        throw new Error(
          `Connection timeout. The server at ${API_BASE_URL} is not responding. ` +
          `Please check:\n` +
          `1. Backend server is running\n` +
          `2. Correct IP address in config/env.js\n` +
          `3. Firewall is not blocking the connection`
        );
      }
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(
          `Cannot connect to server at ${API_BASE_URL}. ` +
          `Please check your internet connection and ensure the backend is running.`
        );
      }
      
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async login(email, password) {
    try {
      // Use longer timeout for login (30 seconds)
      const response = await ApiClient.requestWithTimeout(
        '/app-users/login',
        30000,
        {
          method: 'POST',
          body: {
            email: email.trim(),
            password,
          },
        }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Login failed');
      }

      // Store tokens and user data
      await this.storeTokens(response.data.accessToken, response.data.refreshToken);
      await this.storeUser(response.data.user);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const fullUrl = `${API_BASE_URL}/app-users/login`;
      
      if (error.status === 408 || error.details?.timeout) {
        throw new Error(
          `Connection timeout. The server at ${API_BASE_URL} is not responding. ` +
          `Please check:\n` +
          `1. Backend server is running\n` +
          `2. Correct IP address in config/env.js\n` +
          `3. Firewall is not blocking the connection`
        );
      }
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(
          `Cannot connect to server at ${API_BASE_URL}. ` +
          `Please check your internet connection and ensure the backend is running.`
        );
      }
      
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      // Call logout endpoint if we have a refresh token
      if (refreshToken) {
        try {
          await ApiClient.post('/app-users/logout', {}, {
            headers: {
              Authorization: `Bearer ${await this.getAccessToken()}`,
            },
          });
        } catch (error) {
          console.warn('Logout API call failed, clearing local tokens anyway:', error);
        }
      }

      // Clear stored tokens and user data
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to clear local storage
      try {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await ApiClient.post('/app-users/refresh', {
        refreshToken,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Token refresh failed');
      }

      // Store new access token
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.data.accessToken);

      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear all tokens (user needs to login again)
      await this.logout();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }

      const response = await ApiClient.get('/app-users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to get user profile');
      }

      // Update stored user data
      await this.storeUser(response.data.user);

      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      // If 401, try to refresh token
      if (error.status === 401) {
        try {
          await this.refreshToken();
          // Retry getting user
          return await this.getCurrentUser();
        } catch (refreshError) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Update user profile
   * @param {Object} updates - Profile updates (fullName, phoneNumber)
   */
  async updateProfile(updates) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await ApiClient.put('/app-users/me', updates, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update profile');
      }

      // Update stored user data
      await this.storeUser(response.data.user);

      return response.data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.status === 401) {
        try {
          await this.refreshToken();
          return await this.updateProfile(updates);
        } catch (refreshError) {
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }

  /**
   * Change password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await ApiClient.put('/app-users/me/password', {
        oldPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to change password');
      }

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      if (error.status === 401) {
        try {
          await this.refreshToken();
          return await this.changePassword(oldPassword, newPassword);
        } catch (refreshError) {
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const accessToken = await this.getAccessToken();
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stored access token
   */
  async getAccessToken() {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUser() {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  /**
   * Store tokens
   */
  async storeTokens(accessToken, refreshToken) {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Store user data
   */
  async storeUser(user) {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  /**
   * Get stored tokens (for API client)
   */
  async getStoredTokens() {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   */
  async verifyEmail(token) {
    try {
      const response = await ApiClient.post('/app-users/verify-email', {
        token,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Email verification failed');
      }

      // Update stored user data if available
      if (response.data.user) {
        await this.storeUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Verify email error:', error);
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email address
   */
  async resendVerificationEmail(email) {
    try {
      const response = await ApiClient.post('/app-users/resend-verification', {
        email: email.trim(),
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to resend verification email');
      }

      return response.data;
    } catch (error) {
      console.error('Resend verification email error:', error);
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Check email verification status
   * @returns {Promise<boolean>} - True if email is verified
   */
  async checkEmailVerificationStatus() {
    try {
      const user = await this.getCurrentUser();
      return user ? user.isEmailVerified === true : false;
    } catch (error) {
      console.error('Check email verification status error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();


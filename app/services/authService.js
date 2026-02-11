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
   * @param {string} phoneNumber - User phone number (required for phone verification)
   * @param {string} verificationMethod - 'email' | 'phone' (default: 'email')
   * @returns {Promise<Object>} - May include needEmailVerification, needPhoneVerification, or tokens
   */
  async register(email, password, fullName = null, phoneNumber = null, verificationMethod = 'email') {
    try {
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
            verificationMethod,
          },
        }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }

      // If phone verification needed - return for OTP step
      if (response.data.needPhoneVerification) {
        return response.data;
      }

      // If email verification needed - navigate to email verification screen
      if (response.data.needEmailVerification) {
        return response.data;
      }

      // Registration complete with tokens
      if (response.data.accessToken && response.data.user) {
        await this.storeTokens(response.data.accessToken, response.data.refreshToken);
        await this.storeUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const fullUrl = `${API_BASE_URL}/app-users/register`;
      
      // Handle HTTP 409 - User already exists
      if (error.status === 409) {
        // The error message is already extracted by ApiError, but check details as fallback
        const errorMessage = error.message || 
                            error.details?.error?.message || 
                            error.details?.message || 
                            'An account with this email already exists. Please try logging in instead.';
        throw new Error(errorMessage);
      }
      
      // Handle timeout errors
      if (error.status === 408 || error.details?.timeout) {
        throw new Error(
          `Connection timeout. The server at ${API_BASE_URL} is not responding. ` +
          `Please check:\n` +
          `1. Backend server is running\n` +
          `2. Correct IP address in config/env.js\n` +
          `3. Firewall is not blocking the connection`
        );
      }
      
      // Handle network errors
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(
          `Cannot connect to server at ${API_BASE_URL}. ` +
          `Please check your internet connection and ensure the backend is running.`
        );
      }
      
      // Extract error message from API response if available
      if (error.details?.error?.message) {
        throw new Error(error.details.error.message);
      }
      
      // Use the error message if available, otherwise provide a generic one
      throw new Error(error.message || 'Registration failed. Please try again.');
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
      // If 401, try to refresh token once
      if (error.status === 401) {
        try {
          console.log('Token expired, attempting refresh...');
          await this.refreshToken();
          
          // Retry getting user with new token
          const accessToken = await this.getAccessToken();
          if (!accessToken) {
            console.log('No access token after refresh');
            return null;
          }

          const response = await ApiClient.get('/app-users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.success && response.data.user) {
            await this.storeUser(response.data.user);
            return response.data.user;
          }
          
          return null;
        } catch (refreshError) {
          console.log('Token refresh failed, user needs to login again');
          // Clear invalid tokens
          await this.logout();
          return null;
        }
      }
      
      console.error('Get current user error:', error.message || error);
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
   * Send OTP for change password (verifies current password, sends OTP to registered phone)
   * @param {string} currentPassword - Current password
   * @returns {Promise<{ phoneMasked: string }>}
   */
  async sendChangePasswordOtp(currentPassword) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await ApiClient.post('/app-users/me/password/send-otp', {
        currentPassword,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to send verification code');
      }

      return response.data || {};
    } catch (error) {
      console.error('Send change password OTP error:', error);
      if (error.status === 401) {
        try {
          await this.refreshToken();
          return await this.sendChangePasswordOtp(currentPassword);
        } catch (refreshError) {
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }

  /**
   * Change password with OTP (after sendChangePasswordOtp)
   * @param {string} otp - Verification code from SMS
   * @param {string} newPassword - New password
   */
  async changePassword(otp, newPassword) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await ApiClient.put('/app-users/me/password', {
        otp,
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
          return await this.changePassword(otp, newPassword);
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

      // Store tokens and user for auto-login
      if (response.data.accessToken && response.data.refreshToken) {
        await this.storeTokens(response.data.accessToken, response.data.refreshToken);
      }
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
   * Complete registration after phone OTP verification
   * @param {string} email - User email
   * @param {string} phone - User phone number
   * @param {string} otp - 6-digit verification code
   * @param {string} password - User password
   */
  async registerVerifyOtp(email, phone, otp, password) {
    try {
      const response = await ApiClient.post('/app-users/register/verify-otp', {
        email: email.trim(),
        phone: phone.trim(),
        otp: otp.toString().trim(),
        password,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Verification failed');
      }

      if (response.data.accessToken && response.data.user) {
        await this.storeTokens(response.data.accessToken, response.data.refreshToken);
        await this.storeUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Register verify OTP error:', error);
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

  /**
   * Request password reset - send OTP to registered phone
   * @param {string} email - User email
   * @returns {Promise<{phoneMasked: string}>}
   */
  async forgotPassword(email) {
    try {
      const response = await ApiClient.post('/app-users/forgot-password', {
        email: email.trim(),
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to send verification code');
      }

      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Verify OTP and get reset token
   * @param {string} phone - User phone number
   * @param {string} otp - 6-digit verification code
   * @returns {Promise<{resetToken: string}>}
   */
  async verifyOtpForReset(phone, otp) {
    try {
      const response = await ApiClient.post('/app-users/verify-otp', {
        phone: phone.trim(),
        otp: otp.toString().trim(),
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Invalid or expired verification code');
      }

      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} resetToken - Token from verifyOtpForReset
   * @param {string} newPassword - New password
   */
  async resetPassword(resetToken, newPassword) {
    try {
      const response = await ApiClient.post('/app-users/reset-password', {
        resetToken: resetToken.trim(),
        newPassword,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to reset password');
      }

      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();


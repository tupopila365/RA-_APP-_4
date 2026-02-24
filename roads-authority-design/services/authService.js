import { ApiClient } from './api';
import * as storage from './storage';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;
const ACCESS_TOKEN_KEY = 'ra_design_access_token';
const REFRESH_TOKEN_KEY = 'ra_design_refresh_token';
const USER_KEY = 'ra_design_user';

class AuthService {
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
            verificationMethod: verificationMethod || 'email',
          },
        }
      );
      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }
      if (response.data?.needPhoneVerification || response.data?.needEmailVerification) {
        return response.data;
      }
      if (response.data?.accessToken && response.data?.user) {
        await this.storeTokens(response.data.accessToken, response.data.refreshToken);
        await this.storeUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      if (error.status === 409) {
        throw new Error(error.message || 'An account with this email already exists.');
      }
      if (error.status === 408 || error.details?.timeout) {
        throw new Error('Connection timeout. Ensure the backend is running.');
      }
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Check backend and config.');
      }
      throw new Error(error.message || 'Registration failed.');
    }
  }

  async registerVerifyOtp(email, phone, otp, password) {
    try {
      const response = await ApiClient.post('/app-users/register/verify-otp', {
        email: email.trim(),
        phone: phone.trim(),
        otp: String(otp).trim(),
        password,
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Verification failed');
      }
      if (response.data?.accessToken && response.data?.user) {
        await this.storeTokens(response.data.accessToken, response.data.refreshToken);
        await this.storeUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Check backend and config.');
      }
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await ApiClient.requestWithTimeout(
        '/app-users/login',
        30000,
        {
          method: 'POST',
          body: { email: email.trim(), password },
        }
      );
      if (!response.success) {
        throw new Error(response.error?.message || 'Login failed');
      }
      await this.storeTokens(response.data.accessToken, response.data.refreshToken);
      await this.storeUser(response.data.user);
      return response.data;
    } catch (error) {
      if (error.status === 408 || error.details?.timeout) {
        throw new Error('Connection timeout. Ensure the backend is running.');
      }
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Check backend and config.');
      }
      throw error;
    }
  }

  async logout() {
    try {
      const token = await this.getAccessToken();
      if (token) {
        try {
          await ApiClient.post('/app-users/logout', {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (_) {}
      }
      await storage.removeItem(ACCESS_TOKEN_KEY);
      await storage.removeItem(REFRESH_TOKEN_KEY);
      await storage.removeItem(USER_KEY);
    } catch (e) {
      await storage.removeItem(ACCESS_TOKEN_KEY);
      await storage.removeItem(REFRESH_TOKEN_KEY);
      await storage.removeItem(USER_KEY);
    }
  }

  async getAccessToken() {
    try {
      return await storage.getItem(ACCESS_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  }

  async getRefreshToken() {
    try {
      return await storage.getItem(REFRESH_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  }

  async getStoredUser() {
    try {
      const json = await storage.getItem(USER_KEY);
      return json ? JSON.parse(json) : null;
    } catch (_) {
      return null;
    }
  }

  async storeTokens(accessToken, refreshToken) {
    await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  async storeUser(user) {
    await storage.setItem(USER_KEY, JSON.stringify(user));
  }

  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export const authService = new AuthService();

import { ApiClient } from './api';
import { getOrCreateDeviceId } from './deviceIdService';
import { authService } from './authService';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

class PotholeReportsService {
  /**
   * Test backend connectivity
   */
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Get headers with device ID and optional auth token
   */
  async getHeaders() {
    const deviceId = await getOrCreateDeviceId();
    const headers = {
      'X-Device-ID': deviceId,
    };
    
    // Add auth token if user is logged in
    try {
      const accessToken = await authService.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    } catch (error) {
      // User not logged in - continue without auth token
      console.log('No auth token available (user not logged in)');
    }
    
    return headers;
  }

  /**
   * Create a new pothole report
   * @param {Object} reportData - Report data
   * @param {Object} reportData.location - Location object with latitude and longitude
   * @param {string} reportData.roadName - Road name (optional)
   * @param {string} reportData.townName - Town name (optional)
   * @param {string} reportData.streetName - Street name (optional)
   * @param {string} reportData.severity - Severity: 'small', 'medium', 'dangerous'
   * @param {string} reportData.description - Optional description
   * @param {string} photoUri - Local URI of the photo
   */
  async createReport(reportData, photoUri) {
    try {
      const deviceId = await getOrCreateDeviceId();
      const url = `${API_BASE_URL}/pothole-reports`;
      
      console.log('Creating report:', {
        url,
        deviceId,
        hasPhoto: !!photoUri,
        location: reportData.location,
        roadName: reportData.roadName,
      });

      // Validate required fields
      if (!reportData.location || !reportData.location.latitude || !reportData.location.longitude) {
        throw new Error('Location is required');
      }
      if (!photoUri) {
        throw new Error('Photo is required');
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add photo - React Native FormData format
      // For React Native, we need to handle the file URI properly
      // Check if photoUri is a valid file URI
      if (!photoUri || (typeof photoUri === 'string' && !photoUri.startsWith('file://') && !photoUri.startsWith('content://') && !photoUri.startsWith('http'))) {
        console.warn('Invalid photo URI:', photoUri);
        throw new Error('Invalid photo URI. Please take or select a photo.');
      }

      const photoFile = {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      };
      formData.append('photo', photoFile);

      // Add report data
      formData.append('location', JSON.stringify(reportData.location));
      if (reportData.roadName) {
        formData.append('roadName', reportData.roadName);
      }
      if (reportData.townName) {
        formData.append('townName', reportData.townName);
      }
      if (reportData.streetName) {
        formData.append('streetName', reportData.streetName);
      }
      formData.append('severity', reportData.severity);
      if (reportData.description) {
        formData.append('description', reportData.description);
      }

      console.log('Sending request to:', url);
      console.log('FormData entries:', {
        hasPhoto: !!photoUri,
        photoUri: photoUri?.substring(0, 50) + '...',
        location: reportData.location,
        roadName: reportData.roadName,
        townName: reportData.townName,
        streetName: reportData.streetName,
        severity: reportData.severity,
      });
      
      // Add timeout to fetch request (120 seconds for photo uploads)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Request timeout after 120 seconds');
        controller.abort();
      }, 120000); // 120 second timeout for photo uploads
      
      // Get headers with device ID and optional auth token
      const headers = await this.getHeaders();
      // Don't set Content-Type for FormData - let fetch set it with boundary
      delete headers['Content-Type'];
      
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle abort/timeout errors
        if (fetchError.name === 'AbortError' || controller.signal.aborted) {
          throw new Error(
            'Request timed out. The photo upload is taking too long.\n\n' +
            'Possible causes:\n' +
            '1. Photo file is too large (max 5MB)\n' +
            '2. Slow network connection\n' +
            '3. Backend is processing slowly\n\n' +
            'Please try:\n' +
            '- Use a smaller photo\n' +
            '- Check your network connection\n' +
            '- Try again later'
          );
        }
        
        // Re-throw other fetch errors
        throw fetchError;
      }

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create report`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          console.error('Error response:', JSON.stringify(errorData, null, 2));
          
          // Extract error message from different possible formats
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          }
          
          errorDetails = errorData;
        } catch (e) {
          const text = await response.text().catch(() => '');
          console.error('Error response text:', text);
          errorMessage = text || errorMessage;
        }
        
        // Create error with details
        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      const data = await response.json();
      console.log('Report created successfully:', data);
      return data.data.report;
    } catch (error) {
      console.error('Error creating pothole report:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Handle abort/timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('timed out')) {
        throw new Error(
          'Request timed out. The photo upload is taking too long.\n\n' +
          'Possible causes:\n' +
          '1. Photo file is too large (max 5MB)\n' +
          '2. Slow network connection\n' +
          '3. Backend is processing slowly\n\n' +
          'Please try:\n' +
          '- Use a smaller photo\n' +
          '- Check your network connection\n' +
          '- Try again later'
        );
      }
      
      // Provide more helpful error messages
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        // Test backend connectivity
        const isConnected = await this.testConnection();
        if (!isConnected) {
          throw new Error(
            'Cannot connect to backend server.\n\n' +
            'Please verify:\n' +
            '1. Backend is running: cd backend && npm run dev\n' +
            '2. Port forwarding: Run forward-ports.bat\n' +
            '3. Backend URL: ' + API_BASE_URL + '\n\n' +
            'If using a physical device, ensure:\n' +
            '- Device and computer are on the same network\n' +
            '- Or use USB connection with port forwarding'
          );
        }
        throw new Error(
          'Network request failed. Backend is reachable but request failed.\n' +
          'Possible causes:\n' +
          '1. Photo file is too large (max 5MB)\n' +
          '2. Invalid photo format\n' +
          '3. Network timeout\n' +
          'Check backend logs for errors.'
        );
      }
      
      throw error;
    }
  }

  /**
   * Get user's reports (by email if logged in, or device ID if not)
   * @param {string} status - Optional status filter
   */
  async getMyReports(status = null) {
    try {
      const headers = await this.getHeaders();
      const params = status ? `?status=${status}` : '';
      
      const response = await ApiClient.get(`/pothole-reports/my-reports${params}`, {
        headers,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch reports');
      }

      return response.data.reports;
    } catch (error) {
      console.error('Error fetching my reports:', error);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   * @param {string} reportId - Report ID
   */
  async getReportById(reportId) {
    try {
      const response = await ApiClient.get(`/pothole-reports/${reportId}`);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch report');
      }

      return response.data.report;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }
}

export const potholeReportsService = new PotholeReportsService();


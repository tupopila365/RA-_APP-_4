import { ApiClient } from './api';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

class PLNService {
  /**
   * Submit a new PLN application
   * @param {Object} applicationData - Application data
   * @param {string} applicationData.fullName - Full name
   * @param {string} applicationData.idNumber - ID number
   * @param {string} applicationData.phoneNumber - Phone number
   * @param {Array} applicationData.plateChoices - Array of 3 plate choices with text and meaning
   * @param {string} documentUri - Local URI of the certified ID document (PDF or image)
   */
  async submitApplication(applicationData, documentUri) {
    try {
      const url = `${API_BASE_URL}/pln/applications`;

      console.log('Submitting PLN application:', {
        url,
        fullName: applicationData.fullName,
        hasDocument: !!documentUri,
      });

      // Validate required fields
      if (!applicationData.fullName || !applicationData.fullName.trim()) {
        throw new Error('Full name is required');
      }
      if (!applicationData.idNumber || !applicationData.idNumber.trim()) {
        throw new Error('ID number is required');
      }
      if (!applicationData.phoneNumber || !applicationData.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }
      if (!applicationData.plateChoices || applicationData.plateChoices.length !== 3) {
        throw new Error('Exactly 3 plate choices are required');
      }
      if (!documentUri) {
        throw new Error('Certified ID document is required');
      }

      // Validate document URI
      if (
        !documentUri ||
        (typeof documentUri === 'string' &&
          !documentUri.startsWith('file://') &&
          !documentUri.startsWith('content://') &&
          !documentUri.startsWith('http'))
      ) {
        console.warn('Invalid document URI:', documentUri);
        throw new Error('Invalid document URI. Please select a document.');
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Determine file type and name
      const isPDF = documentUri.toLowerCase().endsWith('.pdf') || documentUri.includes('pdf');
      const documentFile = {
        uri: documentUri,
        type: isPDF ? 'application/pdf' : 'image/jpeg',
        name: isPDF ? 'document.pdf' : 'document.jpg',
      };
      formData.append('document', documentFile);

      // Add application data
      formData.append('fullName', applicationData.fullName.trim());
      formData.append('idNumber', applicationData.idNumber.trim());
      formData.append('phoneNumber', applicationData.phoneNumber.trim());
      formData.append('plateChoices', JSON.stringify(applicationData.plateChoices));

      console.log('Sending request to:', url);

      // Add timeout to fetch request (120 seconds for document uploads)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Request timeout after 120 seconds');
        controller.abort();
      }, 120000); // 120 second timeout

      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            // Don't set Content-Type, let fetch set it with boundary for FormData
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Handle abort/timeout errors
        if (fetchError.name === 'AbortError' || controller.signal.aborted) {
          throw new Error(
            'Request timed out. The document upload is taking too long.\n\n' +
              'Possible causes:\n' +
              '1. Document file is too large (max 10MB)\n' +
              '2. Slow network connection\n' +
              '3. Backend is processing slowly\n\n' +
              'Please try:\n' +
              '- Use a smaller document\n' +
              '- Check your network connection\n' +
              '- Try again later'
          );
        }

        // Re-throw other fetch errors
        throw fetchError;
      }

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to submit application`;
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
            errorMessage =
              typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
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
      console.log('Application submitted successfully:', data);
      return data.data.application;
    } catch (error) {
      console.error('Error submitting PLN application:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);

      // Handle abort/timeout errors
      if (
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('timed out')
      ) {
        throw new Error(
          'Request timed out. The document upload is taking too long.\n\n' +
            'Possible causes:\n' +
            '1. Document file is too large (max 10MB)\n' +
            '2. Slow network connection\n' +
            '3. Backend is processing slowly\n\n' +
            'Please try:\n' +
            '- Use a smaller document\n' +
            '- Check your network connection\n' +
            '- Try again later'
        );
      }

      // Provide more helpful error messages
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(
          'Network request failed.\n\n' +
            'Please verify:\n' +
            '1. Backend is running\n' +
            '2. Network connection is stable\n' +
            '3. Backend URL: ' +
            API_BASE_URL +
            '\n\n' +
            'If using a physical device, ensure:\n' +
            '- Device and computer are on the same network\n' +
            '- Or use USB connection with port forwarding'
        );
      }

      throw error;
    }
  }

  /**
   * Track application by reference ID and ID number
   * @param {string} referenceId - Application reference ID
   * @param {string} idNumber - Applicant ID number
   */
  async trackApplication(referenceId, idNumber) {
    try {
      if (!referenceId || !referenceId.trim()) {
        throw new Error('Reference ID is required');
      }
      if (!idNumber || !idNumber.trim()) {
        throw new Error('ID number is required');
      }

      const response = await ApiClient.get(`/pln/track/${referenceId.trim()}/${idNumber.trim()}`);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to track application');
      }

      return response.data.application;
    } catch (error) {
      console.error('Error tracking application:', error);
      throw error;
    }
  }
}

export const plnService = new PLNService();



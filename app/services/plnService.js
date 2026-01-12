import { ApiClient } from './api';
import ENV from '../config/env';
import { SecurityUtils } from '../utils/securityUtils';

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

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plnService.js:16',message:'Service received applicationData',data:{hasIdType:!!applicationData.idType,hasSurname:!!applicationData.surname,hasPostalAddress:!!applicationData.postalAddress,hasFullName:!!applicationData.fullName,hasIdNumber:!!applicationData.idNumber,hasPhoneNumber:!!applicationData.phoneNumber},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      console.log('Submitting PLN application:', {
        url,
        fullName: applicationData.fullName,
        hasDocument: !!documentUri,
      });

      // Check if new structure (has idType) or legacy structure
      const isNewStructure = applicationData.idType && applicationData.surname && applicationData.postalAddress;

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plnService.js:25',message:'Structure check result',data:{isNewStructure,hasIdType:!!applicationData.idType,hasSurname:!!applicationData.surname,hasPostalAddress:!!applicationData.postalAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // Validate based on structure
      if (!isNewStructure) {
        // Legacy structure validation
        if (!applicationData.fullName || !applicationData.fullName.trim()) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plnService.js:30',message:'Legacy validation failed - fullName missing',data:{hasFullName:!!applicationData.fullName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          throw new Error('Full name is required');
        }
        if (!applicationData.idNumber || !applicationData.idNumber.trim()) {
          throw new Error('ID number is required');
        }
        if (!applicationData.phoneNumber || !applicationData.phoneNumber.trim()) {
          throw new Error('Phone number is required');
        }
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

      // Add application data (new comprehensive structure)
      // Section A
      if (applicationData.idType) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'plnService.js:69',message:'Adding new structure fields to FormData',data:{idType:applicationData.idType,hasSurname:!!applicationData.surname,hasPostalAddress:!!applicationData.postalAddress,postalAddressStr:JSON.stringify(applicationData.postalAddress)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        formData.append('idType', applicationData.idType);
        if (applicationData.trafficRegisterNumber) {
          formData.append('trafficRegisterNumber', applicationData.trafficRegisterNumber);
        }
        if (applicationData.businessRegNumber) {
          formData.append('businessRegNumber', applicationData.businessRegNumber);
        }
        formData.append('surname', applicationData.surname);
        formData.append('initials', applicationData.initials);
        if (applicationData.businessName) {
          formData.append('businessName', applicationData.businessName);
        }
        formData.append('postalAddress', JSON.stringify(applicationData.postalAddress));
        formData.append('streetAddress', JSON.stringify(applicationData.streetAddress));
        if (applicationData.telephoneHome) {
          formData.append('telephoneHome', JSON.stringify(applicationData.telephoneHome));
        }
        if (applicationData.telephoneDay) {
          formData.append('telephoneDay', JSON.stringify(applicationData.telephoneDay));
        }
        if (applicationData.cellNumber) {
          formData.append('cellNumber', JSON.stringify(applicationData.cellNumber));
        }
        if (applicationData.email) {
          formData.append('email', applicationData.email);
        }
      } else {
        // Legacy fields for backward compatibility
        if (applicationData.fullName) {
          formData.append('fullName', applicationData.fullName.trim());
        }
        if (applicationData.idNumber) {
          formData.append('idNumber', applicationData.idNumber.trim());
        }
        if (applicationData.phoneNumber) {
          formData.append('phoneNumber', applicationData.phoneNumber.trim());
        }
      }
      
      // Section B
      if (applicationData.plateFormat) {
        formData.append('plateFormat', applicationData.plateFormat);
      }
      if (applicationData.quantity) {
        formData.append('quantity', applicationData.quantity.toString());
      }
      formData.append('plateChoices', JSON.stringify(applicationData.plateChoices));
      
      // Section C
      if (applicationData.hasRepresentative) {
        formData.append('hasRepresentative', 'true');
        if (applicationData.representativeIdType) {
          formData.append('representativeIdType', applicationData.representativeIdType);
        }
        if (applicationData.representativeIdNumber) {
          formData.append('representativeIdNumber', applicationData.representativeIdNumber);
        }
        if (applicationData.representativeSurname) {
          formData.append('representativeSurname', applicationData.representativeSurname);
        }
        if (applicationData.representativeInitials) {
          formData.append('representativeInitials', applicationData.representativeInitials);
        }
      }
      
      // Section D
      if (applicationData.currentLicenceNumber) {
        formData.append('currentLicenceNumber', applicationData.currentLicenceNumber);
      }
      if (applicationData.vehicleRegisterNumber) {
        formData.append('vehicleRegisterNumber', applicationData.vehicleRegisterNumber);
      }
      if (applicationData.chassisNumber) {
        formData.append('chassisNumber', applicationData.chassisNumber);
      }
      if (applicationData.vehicleMake) {
        formData.append('vehicleMake', applicationData.vehicleMake);
      }
      if (applicationData.seriesName) {
        formData.append('seriesName', applicationData.seriesName);
      }
      
      // Section E
      if (applicationData.declarationAccepted !== undefined) {
        formData.append('declarationAccepted', applicationData.declarationAccepted.toString());
      }
      if (applicationData.declarationPlace) {
        formData.append('declarationPlace', applicationData.declarationPlace);
      }
      if (applicationData.declarationRole) {
        formData.append('declarationRole', applicationData.declarationRole);
      }

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

  /**
   * Get the URL for downloading the blank PLN form PDF
   * @returns {string} URL to download the form PDF
   */
  getFormDownloadUrl() {
    return `${API_BASE_URL}/pln/form`;
  }
}

export const plnService = new PLNService();




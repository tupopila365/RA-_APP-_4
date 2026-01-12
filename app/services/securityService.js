import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export class SecurityService {
  static CSRF_TOKEN_KEY = 'csrf_token';
  static FORM_SESSION_KEY = 'form_session';

  /**
   * Get CSRF token from server
   */
  static async getCSRFToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pln/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        await SecureStore.setItemAsync(this.CSRF_TOKEN_KEY, data.token);
        return data.token;
      }
      
      throw new Error('Failed to get CSRF token');
    } catch (error) {
      console.error('CSRF token error:', error);
      throw error;
    }
  }

  /**
   * Generate form session ID for tracking
   */
  static async generateFormSession() {
    const sessionId = await Crypto.randomUUID();
    await SecureStore.setItemAsync(this.FORM_SESSION_KEY, sessionId);
    return sessionId;
  }

  /**
   * Validate form data before submission
   */
  static validateFormData(formData) {
    const errors = {};

    // Validate required fields
    if (!formData.surname?.trim()) {
      errors.surname = 'Surname is required';
    }

    if (!formData.initials?.trim()) {
      errors.initials = 'Initials are required';
    }

    if (!formData.idType) {
      errors.idType = 'ID type is required';
    }

    // Validate ID number based on type
    if (formData.idType === 'Traffic Register Number' && !formData.trafficRegisterNumber?.trim()) {
      errors.trafficRegisterNumber = 'Traffic Register Number is required';
    }

    if (formData.idType === 'Business Reg. No' && !formData.businessRegNumber?.trim()) {
      errors.businessRegNumber = 'Business Registration Number is required';
    }

    // Validate addresses
    if (!formData.postalAddress?.line1?.trim()) {
      errors.postalAddress = 'Postal address is required';
    }

    if (!formData.streetAddress?.line1?.trim()) {
      errors.streetAddress = 'Street address is required';
    }

    // Validate contact information
    const hasContact = formData.cellNumber?.number || 
                      formData.telephoneDay?.number || 
                      formData.telephoneHome?.number || 
                      formData.email?.trim();
    
    if (!hasContact) {
      errors.contact = 'At least one contact method is required';
    }

    // Validate plate choices
    if (!formData.plateChoices || formData.plateChoices.length !== 3) {
      errors.plateChoices = 'Three plate choices are required';
    }

    // Validate declaration
    if (!formData.declarationAccepted) {
      errors.declaration = 'Declaration must be accepted';
    }

    if (!formData.declarationPlace?.trim()) {
      errors.declarationPlace = 'Declaration place is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Sanitize form data before submission
   */
  static sanitizeFormData(formData) {
    const sanitized = { ...formData };

    // Sanitize text fields
    const textFields = ['surname', 'initials', 'businessName', 'email', 'declarationPlace'];
    textFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = sanitized[field].trim().replace(/[<>]/g, '');
      }
    });

    // Sanitize ID numbers (alphanumeric only)
    const idFields = ['trafficRegisterNumber', 'businessRegNumber'];
    idFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = sanitized[field].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }
    });

    // Sanitize phone numbers
    const phoneFields = ['cellNumber', 'telephoneDay', 'telephoneHome'];
    phoneFields.forEach(field => {
      if (sanitized[field]?.number) {
        sanitized[field].number = sanitized[field].number.replace(/[^\d+]/g, '');
      }
    });

    // Sanitize plate choices
    if (sanitized.plateChoices) {
      sanitized.plateChoices = sanitized.plateChoices.map(choice => ({
        ...choice,
        text: choice.text?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8),
        meaning: choice.meaning?.trim().replace(/[<>]/g, '').slice(0, 100),
      }));
    }

    return sanitized;
  }

  /**
   * Prepare secure form submission
   */
  static async prepareSecureSubmission(formData, documentFile, captchaToken) {
    try {
      // Get CSRF token
      const csrfToken = await this.getCSRFToken();
      
      // Generate form session
      const sessionId = await this.generateFormSession();
      
      // Validate form data
      const validation = this.validateFormData(formData);
      if (!validation.isValid) {
        throw new Error('Form validation failed');
      }
      
      // Sanitize form data
      const sanitizedData = this.sanitizeFormData(formData);
      
      // Create FormData for submission
      const formDataToSubmit = new FormData();
      
      // Add all form fields
      Object.keys(sanitizedData).forEach(key => {
        const value = sanitizedData[key];
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formDataToSubmit.append(key, JSON.stringify(value));
          } else {
            formDataToSubmit.append(key, value.toString());
          }
        }
      });
      
      // Add document file
      if (documentFile) {
        formDataToSubmit.append('document', documentFile);
      }
      
      // Add security tokens
      formDataToSubmit.append('captchaToken', captchaToken);
      formDataToSubmit.append('sessionId', sessionId);
      
      return {
        formData: formDataToSubmit,
        headers: {
          'X-CSRF-Token': csrfToken,
          'X-Form-Session': sessionId,
        },
      };
    } catch (error) {
      console.error('Security preparation error:', error);
      throw error;
    }
  }
}
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

/**
 * Security utilities for mobile app
 */
export class SecurityUtils {
  /**
   * Validate file before upload
   */
  static validateFile(fileUri, maxSize = 10 * 1024 * 1024) {
    if (!fileUri) {
      throw new Error('No file selected');
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const extension = fileUri.toLowerCase().split('.').pop();
    
    if (!allowedExtensions.includes(`.${extension}`)) {
      throw new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
    }

    // Note: File size validation will be done on the server
    // as React Native doesn't provide reliable file size info
    
    return true;
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate ID number format
   */
  static validateIdNumber(idNumber) {
    if (!idNumber) return false;
    
    // Remove spaces and special characters
    const cleaned = idNumber.replace(/[^a-zA-Z0-9]/g, '');
    
    // Check length (adjust based on your requirements)
    if (cleaned.length < 5 || cleaned.length > 20) {
      return false;
    }
    
    return true;
  }

  /**
   * Validate phone number
   */
  static validatePhoneNumber(phone) {
    if (!phone) return false;
    
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Basic phone number validation (adjust regex as needed)
    const phoneRegex = /^(\+?264)?[0-9]{8,9}$/; // Namibian phone format
    
    return phoneRegex.test(cleaned);
  }

  /**
   * Validate email format
   */
  static validateEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
  }

  /**
   * Generate secure random string for client-side use
   */
  static async generateSecureRandom(length = 16) {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(length);
      return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error generating secure random:', error);
      // Fallback to less secure method
      return Math.random().toString(36).substring(2, length + 2);
    }
  }

  /**
   * Securely store sensitive data
   */
  static async storeSecurely(key, value) {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw new Error('Failed to store sensitive data');
    }
  }

  /**
   * Securely retrieve sensitive data
   */
  static async getSecurely(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  /**
   * Clear sensitive data
   */
  static async clearSecureData(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error clearing secure data:', error);
    }
  }

  /**
   * Validate PLN application data before submission
   */
  static validatePLNData(applicationData) {
    const errors = [];

    // Check required fields based on structure
    const isNewStructure = applicationData.idType && applicationData.surname;

    if (isNewStructure) {
      if (!applicationData.surname?.trim()) {
        errors.push('Surname is required');
      }
      if (!applicationData.initials?.trim()) {
        errors.push('Initials are required');
      }
      if (!applicationData.idType) {
        errors.push('ID type is required');
      }
    } else {
      if (!applicationData.fullName?.trim()) {
        errors.push('Full name is required');
      }
      if (!applicationData.idNumber?.trim()) {
        errors.push('ID number is required');
      }
      if (!applicationData.phoneNumber?.trim()) {
        errors.push('Phone number is required');
      }
    }

    // Validate plate choices
    if (!applicationData.plateChoices || applicationData.plateChoices.length !== 3) {
      errors.push('Exactly 3 plate choices are required');
    } else {
      applicationData.plateChoices.forEach((choice, index) => {
        if (!choice.text?.trim()) {
          errors.push(`Plate choice ${index + 1} text is required`);
        }
        if (!choice.meaning?.trim()) {
          errors.push(`Plate choice ${index + 1} meaning is required`);
        }
      });
    }

    // Validate contact information
    if (applicationData.email && !this.validateEmail(applicationData.email)) {
      errors.push('Invalid email format');
    }

    if (applicationData.phoneNumber && !this.validatePhoneNumber(applicationData.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare secure form data for submission
   */
  static prepareSecureFormData(applicationData, documentUri) {
    // Sanitize all text inputs
    const sanitizedData = {};
    
    Object.keys(applicationData).forEach(key => {
      const value = applicationData[key];
      
      if (typeof value === 'string') {
        sanitizedData[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects (addresses, phone numbers, etc.)
        sanitizedData[key] = {};
        Object.keys(value).forEach(nestedKey => {
          if (typeof value[nestedKey] === 'string') {
            sanitizedData[key][nestedKey] = this.sanitizeInput(value[nestedKey]);
          } else {
            sanitizedData[key][nestedKey] = value[nestedKey];
          }
        });
      } else {
        sanitizedData[key] = value;
      }
    });

    return sanitizedData;
  }

  /**
   * Check if app is running in secure environment
   */
  static isSecureEnvironment() {
    // In production, you might want to check for:
    // - Root/jailbreak detection
    // - Debug mode detection
    // - Emulator detection
    
    return __DEV__ ? false : true; // Simplified check
  }

  /**
   * Log security events (for monitoring)
   */
  static logSecurityEvent(event, details = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      details,
      platform: 'mobile',
    };

    console.log('Security Event:', logData);
    
    // In production, send to monitoring service
    // this.sendToMonitoringService(logData);
  }
}
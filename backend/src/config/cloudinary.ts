import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import { env } from './env';
import { logger } from '../utils/logger';

export const configureCloudinary = (): void => {
  // Check if Cloudinary credentials are provided
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    logger.warn('Cloudinary credentials not provided. Image upload functionality will be disabled.');
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  logger.info('Cloudinary configured successfully');
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};

/**
 * Validate that a URL is accessible via HTTP HEAD request
 * @param url - The URL to validate
 * @returns Promise<boolean> - true if URL is accessible (returns 2xx status), false otherwise
 */
export const validateURLAccess = async (url: string): Promise<boolean> => {
  try {
    logger.info('Validating URL accessibility', { url });
    
    const response = await axios.head(url, {
      timeout: 5000, // 5 second timeout
      validateStatus: (status) => status >= 200 && status < 400, // Accept 2xx and 3xx
    });
    
    const isAccessible = response.status >= 200 && response.status < 400;
    
    logger.info('URL validation result', {
      url,
      status: response.status,
      accessible: isAccessible,
    });
    
    return isAccessible;
  } catch (error: any) {
    // Log validation failure with details
    logger.error('URL validation failed', {
      url,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    return false;
  }
};

/**
 * Generate a signed URL for Cloudinary resources
 * @param publicId - The Cloudinary public ID of the resource
 * @param options - Optional configuration for the signed URL
 * @returns string - The signed URL with authentication parameters
 */
export const generateSignedURL = (
  publicId: string,
  options?: {
    expiresIn?: number; // Seconds until expiration (default: never expires)
    resourceType?: 'image' | 'video' | 'raw' | 'auto'; // Resource type (default: 'raw' for PDFs)
    type?: 'upload' | 'authenticated'; // Delivery type (default: 'upload' for public files)
    transformation?: string; // Optional transformations
  }
): string => {
  try {
    const resourceType = options?.resourceType ?? 'raw'; // Default to 'raw' for PDFs
    const deliveryType = options?.type ?? 'upload'; // Default to 'upload' for public files

    logger.info('Generating signed URL', {
      publicId,
      resourceType,
      deliveryType,
      expiresIn: options?.expiresIn ?? 'never',
    });

    // Generate signed URL using Cloudinary SDK
    // The SDK handles signature generation automatically
    // For public files (type: 'upload'), the signature ensures URL integrity
    // but the file remains publicly accessible
    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: deliveryType, // Use 'upload' for public files, 'authenticated' for private
      sign_url: true, // Enable URL signing - adds cryptographic signature
      secure: true, // Use HTTPS
      ...(options?.transformation && { transformation: options.transformation }),
    });

    logger.info('Signed URL generated successfully', {
      publicId,
      resourceType,
      deliveryType,
      urlLength: signedUrl.length,
      hasSignature: signedUrl.includes('s--'),
    });

    return signedUrl;
  } catch (error: any) {
    logger.error('Failed to generate signed URL', {
      publicId,
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

export { cloudinary };

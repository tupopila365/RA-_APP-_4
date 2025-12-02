import { v2 as cloudinary } from 'cloudinary';
export declare const configureCloudinary: () => void;
/**
 * Check if Cloudinary is configured
 */
export declare const isCloudinaryConfigured: () => boolean;
/**
 * Validate that a URL is accessible via HTTP HEAD request
 * @param url - The URL to validate
 * @returns Promise<boolean> - true if URL is accessible (returns 2xx status), false otherwise
 */
export declare const validateURLAccess: (url: string) => Promise<boolean>;
/**
 * Generate a signed URL for Cloudinary resources
 * @param publicId - The Cloudinary public ID of the resource
 * @param options - Optional configuration for the signed URL
 * @returns string - The signed URL with authentication parameters
 */
export declare const generateSignedURL: (publicId: string, options?: {
    expiresIn?: number;
    resourceType?: "image" | "video" | "raw" | "auto";
    type?: "upload" | "authenticated";
    transformation?: string;
}) => string;
export { cloudinary };
//# sourceMappingURL=cloudinary.d.ts.map
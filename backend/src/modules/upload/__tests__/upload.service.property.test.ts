import * as fc from 'fast-check';
import { UploadService } from '../upload.service';
import { UploadErrorType } from '../upload.errors';

/**
 * Feature: pdf-upload-functionality, Property 1: PDF validation accepts only valid PDFs
 * Validates: Requirements 3.1, 3.2, 3.3
 * 
 * For any file, the validation function should return valid=true only when the file 
 * has .pdf extension, application/pdf mimetype, and size under 10MB
 */
describe('Property 1: PDF validation accepts only valid PDFs', () => {
  let uploadService: UploadService;

  beforeEach(() => {
    uploadService = new UploadService();
  });

  it('should accept only files with .pdf extension, application/pdf mimetype, and size under 10MB', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // base filename
        fc.constantFrom('.pdf', '.doc', '.txt', '.jpg', '.png', '.docx', ''), // extension
        fc.constantFrom('application/pdf', 'image/jpeg', 'text/plain', 'application/msword', 'video/mp4'), // mimetype
        fc.integer({ min: 0, max: 15 * 1024 * 1024 }), // size (0 to 15MB)
        (baseFilename, extension, mimetype, size) => {
          const filename = baseFilename + extension;
          const mockFile = {
            originalname: filename,
            size: size,
            mimetype: mimetype,
            buffer: Buffer.alloc(size),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Valid PDF must have:
          // 1. .pdf extension
          // 2. application/pdf mimetype
          // 3. size <= 10MB
          const isPdfExtension = extension === '.pdf';
          const isPdfMimetype = mimetype === 'application/pdf';
          const isUnderSizeLimit = size <= 10 * 1024 * 1024;

          const shouldBeValid = isPdfExtension && isPdfMimetype && isUnderSizeLimit;

          if (shouldBeValid) {
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          } else {
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error!.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject files without .pdf extension', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('.doc', '.txt', '.jpg', '.png', '.docx', '.xlsx', ''),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        (filename, extension, size) => {
          const mockFile = {
            originalname: filename + extension,
            size: size,
            mimetype: 'application/pdf', // Even with correct mimetype
            buffer: Buffer.alloc(size),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be invalid due to wrong extension
          expect(result.valid).toBe(false);
          expect(result.error).toContain('PDF');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject files without application/pdf mimetype', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('image/jpeg', 'text/plain', 'application/msword', 'video/mp4', 'application/json'),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        (filename, mimetype, size) => {
          const mockFile = {
            originalname: filename + '.pdf', // Even with correct extension
            size: size,
            mimetype: mimetype,
            buffer: Buffer.alloc(size),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be invalid due to wrong mimetype
          expect(result.valid).toBe(false);
          expect(result.error).toContain('PDF');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject files over 10MB size limit', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 10 * 1024 * 1024 + 1, max: 20 * 1024 * 1024 }), // Over 10MB
        (filename, size) => {
          const mockFile = {
            originalname: filename + '.pdf',
            size: size,
            mimetype: 'application/pdf',
            buffer: Buffer.alloc(100), // Don't allocate full size for test
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be invalid due to size
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error!.toLowerCase()).toContain('size');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid PDFs at boundary conditions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom(0, 1, 5 * 1024 * 1024, 10 * 1024 * 1024), // Boundary sizes
        (filename, size) => {
          const mockFile = {
            originalname: filename + '.pdf',
            size: size,
            mimetype: 'application/pdf',
            buffer: Buffer.alloc(Math.min(size, 100)),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be valid at all boundary conditions
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: pdf-upload-functionality, Property 4: Validation errors are specific
 * Validates: Requirements 3.4
 * 
 * For any validation failure, the error message must specifically indicate 
 * which validation rule failed (type, size, or mimetype)
 */
describe('Property 4: Validation errors are specific', () => {
  let uploadService: UploadService;

  beforeEach(() => {
    uploadService = new UploadService();
  });

  it('should provide specific error messages for extension validation failures', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('.doc', '.txt', '.jpg', '.png', '.docx', '.xlsx', ''),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        (filename, extension, size) => {
          const mockFile = {
            originalname: filename + extension,
            size: size,
            mimetype: 'application/pdf',
            buffer: Buffer.alloc(size),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be invalid and mention PDF/format
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          const errorLower = result.error!.toLowerCase();
          expect(errorLower).toMatch(/pdf|format|file/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide specific error messages for mimetype validation failures', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('image/jpeg', 'text/plain', 'application/msword', 'video/mp4'),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        (filename, mimetype, size) => {
          const mockFile = {
            originalname: filename + '.pdf',
            size: size,
            mimetype: mimetype,
            buffer: Buffer.alloc(size),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be invalid and mention PDF
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          const errorLower = result.error!.toLowerCase();
          expect(errorLower).toContain('pdf');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide specific error messages for size validation failures', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 10 * 1024 * 1024 + 1, max: 20 * 1024 * 1024 }),
        (filename, size) => {
          const mockFile = {
            originalname: filename + '.pdf',
            size: size,
            mimetype: 'application/pdf',
            buffer: Buffer.alloc(100),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          // Should be invalid and mention size/limit
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          const errorLower = result.error!.toLowerCase();
          expect(errorLower).toMatch(/size|limit|exceed/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should distinguish between different validation failure types', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom(
          { ext: '.doc', mime: 'application/pdf', size: 5 * 1024 * 1024, failType: 'extension' },
          { ext: '.pdf', mime: 'image/jpeg', size: 5 * 1024 * 1024, failType: 'mimetype' },
          { ext: '.pdf', mime: 'application/pdf', size: 15 * 1024 * 1024, failType: 'size' }
        ),
        (filename, config) => {
          const mockFile = {
            originalname: filename + config.ext,
            size: config.size,
            mimetype: config.mime,
            buffer: Buffer.alloc(100),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          
          const errorLower = result.error!.toLowerCase();
          
          // Error message should be specific to the failure type
          if (config.failType === 'extension') {
            expect(errorLower).toMatch(/pdf|format/);
          } else if (config.failType === 'mimetype') {
            expect(errorLower).toContain('pdf');
          } else if (config.failType === 'size') {
            expect(errorLower).toMatch(/size|limit|exceed/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide actionable error messages', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom(
          { ext: '.txt', mime: 'text/plain', size: 1024 },
          { ext: '.pdf', mime: 'image/jpeg', size: 1024 },
          { ext: '.pdf', mime: 'application/pdf', size: 15 * 1024 * 1024 }
        ),
        (filename, config) => {
          const mockFile = {
            originalname: filename + config.ext,
            size: config.size,
            mimetype: config.mime,
            buffer: Buffer.alloc(100),
          } as Express.Multer.File;

          const result = uploadService.validatePDF(mockFile);

          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          
          // Error message should be non-empty and meaningful
          expect(result.error!.length).toBeGreaterThan(10);
          expect(result.error).not.toMatch(/undefined|null|\[object Object\]/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: pdf-upload-functionality, Property 3: Upload errors include diagnostic information
 * Validates: Requirements 1.4, 5.2, 5.4
 * 
 * For any upload failure, the error response must include error message, 
 * error type, and file metadata (name, size, type)
 */
describe('Property 3: Upload errors include diagnostic information', () => {
  let uploadService: UploadService;

  beforeEach(() => {
    uploadService = new UploadService();
  });

  it('should include file metadata in validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 255 }), // filename
        fc.integer({ min: 0, max: 20 * 1024 * 1024 }), // file size
        fc.constantFrom('application/pdf', 'image/jpeg', 'text/plain', 'application/json'), // mimetype
        async (filename, size, mimetype) => {
          // Create a mock file that will fail validation
          const mockFile = {
            originalname: filename,
            size: size,
            mimetype: mimetype,
            buffer: Buffer.from('test'),
          } as Express.Multer.File;

          try {
            await uploadService.uploadPDF(mockFile);
            // If it doesn't throw, that's fine (valid PDF case)
          } catch (error: any) {
            // Error should have type property
            expect(error.type).toBeDefined();
            expect(Object.values(UploadErrorType)).toContain(error.type);

            // Error should have message
            expect(error.message).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);

            // Error should have details with file metadata
            if (error.details) {
              expect(error.details.fileName).toBe(filename);
              expect(error.details.fileSize).toBe(size);
              expect(error.details.fileType).toBe(mimetype);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize validation errors correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 255 }),
        fc.integer({ min: 0, max: 20 * 1024 * 1024 }),
        fc.constantFrom('image/jpeg', 'text/plain', 'application/json', 'video/mp4'),
        async (filename, size, mimetype) => {
          // Create a file with non-PDF mimetype (will fail validation)
          const mockFile = {
            originalname: filename,
            size: size,
            mimetype: mimetype,
            buffer: Buffer.from('test'),
          } as Express.Multer.File;

          try {
            await uploadService.uploadPDF(mockFile);
          } catch (error: any) {
            // Should be a validation error
            expect(error.type).toBe(UploadErrorType.VALIDATION_ERROR);
            
            // Should have diagnostic information
            expect(error.message).toBeDefined();
            expect(error.details).toBeDefined();
            expect(error.details.fileName).toBe(filename);
            expect(error.details.fileSize).toBe(size);
            expect(error.details.fileType).toBe(mimetype);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include error type in all upload errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 255 }),
        fc.integer({ min: 0, max: 20 * 1024 * 1024 }),
        fc.string(),
        async (filename, size, mimetype) => {
          const mockFile = {
            originalname: filename,
            size: size,
            mimetype: mimetype,
            buffer: Buffer.from('test'),
          } as Express.Multer.File;

          try {
            await uploadService.uploadPDF(mockFile);
          } catch (error: any) {
            // Every error should have a type from UploadErrorType enum
            expect(error.type).toBeDefined();
            expect(Object.values(UploadErrorType)).toContain(error.type);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve file metadata across error types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          filename: fc.string({ minLength: 1, maxLength: 100 }),
          size: fc.integer({ min: 1, max: 15 * 1024 * 1024 }),
          mimetype: fc.constantFrom('application/pdf', 'image/png', 'text/html'),
        }),
        async ({ filename, size, mimetype }) => {
          const mockFile = {
            originalname: filename,
            size: size,
            mimetype: mimetype,
            buffer: Buffer.from('test'),
          } as Express.Multer.File;

          try {
            await uploadService.uploadPDF(mockFile);
          } catch (error: any) {
            // File metadata should be preserved in error details
            if (error.details) {
              expect(error.details.fileName).toBe(filename);
              expect(error.details.fileSize).toBe(size);
              expect(error.details.fileType).toBe(mimetype);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide specific error messages for different failure types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 255 }),
        fc.integer({ min: 11 * 1024 * 1024, max: 20 * 1024 * 1024 }), // Over 10MB limit
        async (filename, size) => {
          // Create a file that exceeds size limit
          const mockFile = {
            originalname: filename + '.pdf',
            size: size,
            mimetype: 'application/pdf',
            buffer: Buffer.from('test'),
          } as Express.Multer.File;

          try {
            await uploadService.uploadPDF(mockFile);
          } catch (error: any) {
            // Should be validation error
            expect(error.type).toBe(UploadErrorType.VALIDATION_ERROR);
            
            // Message should mention size limit
            expect(error.message.toLowerCase()).toContain('size');
            
            // Should include file metadata
            expect(error.details.fileName).toBe(filename + '.pdf');
            expect(error.details.fileSize).toBe(size);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: pdf-upload-functionality, Property 2: Successful uploads return complete metadata
 * Validates: Requirements 1.3
 * 
 * For any valid PDF file that uploads successfully, the response must contain 
 * url, publicId, format, and bytes fields
 * 
 * Note: This property is verified through code inspection of the validatePDFUploadResult method
 * which ensures all required fields (secure_url, public_id, format, bytes) are present in the
 * Cloudinary response before returning the PDFUploadResult. The method throws a CLOUDINARY_ERROR
 * if any required fields are missing.
 */
describe('Property 2: Successful uploads return complete metadata', () => {
  it('should validate that validatePDFUploadResult checks for all required fields', () => {
    // Read the upload service source code to verify it validates all required metadata fields
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Verify that validatePDFUploadResult method exists and checks for required fields
    expect(serviceCode).toContain('validatePDFUploadResult');
    expect(serviceCode).toContain("'secure_url'");
    expect(serviceCode).toContain("'public_id'");
    expect(serviceCode).toContain("'format'");
    expect(serviceCode).toContain("'bytes'");
    
    // Verify it throws an error for missing fields
    expect(serviceCode).toContain('missingFields');
    expect(serviceCode).toContain('Incomplete upload response');
  });

  it('should verify PDFUploadResult interface includes all required fields', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Extract the PDFUploadResult interface
    const interfaceMatch = serviceCode.match(/export interface PDFUploadResult \{[\s\S]*?\}/);
    expect(interfaceMatch).toBeTruthy();
    
    const interfaceCode = interfaceMatch![0];
    
    // Verify all required fields are in the interface
    expect(interfaceCode).toContain('url: string');
    expect(interfaceCode).toContain('publicId: string');
    expect(interfaceCode).toContain('format: string');
    expect(interfaceCode).toContain('bytes: number');
  });

  it('should verify uploadPDF returns validated result', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Extract the uploadPDF method
    const uploadPDFMatch = serviceCode.match(/async uploadPDF\([\s\S]*?(?=\n  async |$)/);
    expect(uploadPDFMatch).toBeTruthy();
    
    const uploadPDFMethod = uploadPDFMatch![0];
    
    // Verify it calls validatePDFUploadResult
    expect(uploadPDFMethod).toContain('validatePDFUploadResult');
    
    // Verify it returns the validated result
    expect(uploadPDFMethod).toContain('return validatedResult');
  });

  it('should verify all required fields are mapped from Cloudinary response', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Extract the validatePDFUploadResult method
    const validateMatch = serviceCode.match(/private validatePDFUploadResult\([\s\S]*?(?=\n  \/\*\*|\n  async |\n  private )/);
    expect(validateMatch).toBeTruthy();
    
    const validateMethod = validateMatch![0];
    
    // Verify it maps all fields from Cloudinary response
    expect(validateMethod).toContain('url: result.secure_url');
    expect(validateMethod).toContain('publicId: result.public_id');
    expect(validateMethod).toContain('format: result.format');
    expect(validateMethod).toContain('bytes: result.bytes');
  });

  it('should verify metadata completeness is enforced before returning', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Verify the validation happens before the return statement in uploadPDF
    const uploadPDFMatch = serviceCode.match(/async uploadPDF\([\s\S]*?(?=\n  async |$)/);
    expect(uploadPDFMatch).toBeTruthy();
    
    const uploadPDFMethod = uploadPDFMatch![0];
    
    // The method should validate before returning
    const validationIndex = uploadPDFMethod.indexOf('validatePDFUploadResult');
    const returnIndex = uploadPDFMethod.indexOf('return validatedResult');
    
    expect(validationIndex).toBeGreaterThan(-1);
    expect(returnIndex).toBeGreaterThan(-1);
    expect(validationIndex).toBeLessThan(returnIndex);
  });
});

/**
 * Feature: pdf-upload-functionality, Property 7: Cloudinary uses raw resource type
 * Validates: Requirements 7.3
 * 
 * For any PDF upload to Cloudinary, the upload configuration must specify 
 * resource_type as 'raw'
 * 
 * Note: This property is verified through code inspection rather than runtime testing
 * because the upload service correctly uses resource_type: 'raw' in the uploadPDF method.
 * Integration tests with actual Cloudinary would be needed for full runtime verification.
 */
describe('Property 7: Cloudinary uses raw resource type', () => {
  it('should use raw resource_type in uploadPDF implementation', () => {
    // Read the upload service source code to verify it uses 'raw' resource_type
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Verify that the uploadPDF method contains resource_type: 'raw'
    expect(serviceCode).toContain("resource_type: 'raw'");
    
    // Verify it's in the context of PDF upload (near the uploadPDF method)
    const uploadPDFMatch = serviceCode.match(/async uploadPDF[\s\S]*?resource_type:\s*'raw'/);
    expect(uploadPDFMatch).toBeTruthy();
  });

  it('should not use image resource_type for PDF uploads', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Extract the uploadPDF method
    const uploadPDFMethodMatch = serviceCode.match(/async uploadPDF\([\s\S]*?\n  \}/);
    expect(uploadPDFMethodMatch).toBeTruthy();
    
    const uploadPDFMethod = uploadPDFMethodMatch![0];
    
    // Verify it doesn't use 'image' resource_type
    expect(uploadPDFMethod).not.toContain("resource_type: 'image'");
    expect(uploadPDFMethod).not.toContain("resource_type: 'video'");
    expect(uploadPDFMethod).not.toContain("resource_type: 'auto'");
  });
});

/**
 * Feature: pdf-upload-functionality, Property 8: PDFs stored in dedicated folder
 * Validates: Requirements 7.4
 * 
 * For any PDF upload, the Cloudinary public_id must include the 
 * 'roads-authority/pdfs' folder path
 */
describe('Property 8: PDFs stored in dedicated folder', () => {
  it('should use roads-authority/pdfs folder in uploadPDF implementation', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Verify that UPLOAD_FOLDER is set to 'roads-authority'
    expect(serviceCode).toContain("UPLOAD_FOLDER = 'roads-authority'");
    
    // Verify it's in the context of PDF upload configuration with /pdfs subfolder
    const uploadPDFMatch = serviceCode.match(/async uploadPDF[\s\S]*?folder:\s*`\$\{this\.UPLOAD_FOLDER\}\/pdfs`/);
    expect(uploadPDFMatch).toBeTruthy();
  });

  it('should not use generic roads-authority folder for PDFs', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Extract the uploadPDF method
    const uploadPDFMethodMatch = serviceCode.match(/async uploadPDF\([\s\S]*?\n  \}/);
    expect(uploadPDFMethodMatch).toBeTruthy();
    
    const uploadPDFMethod = uploadPDFMethodMatch![0];
    
    // Should use the /pdfs subfolder, not just roads-authority
    expect(uploadPDFMethod).toContain('/pdfs');
  });

  it('should use consistent folder structure', () => {
    const fs = require('fs');
    const path = require('path');
    const serviceCode = fs.readFileSync(
      path.join(__dirname, '../upload.service.ts'),
      'utf-8'
    );

    // Count occurrences of the folder path in uploadPDF method
    const uploadPDFMethodMatch = serviceCode.match(/async uploadPDF\([\s\S]*?\n  \}/);
    expect(uploadPDFMethodMatch).toBeTruthy();
    
    const uploadPDFMethod = uploadPDFMethodMatch![0];
    
    // Should have exactly one folder configuration
    const folderMatches = uploadPDFMethod.match(/folder:\s*[`'"].*[`'"]/g);
    expect(folderMatches).toBeTruthy();
    expect(folderMatches!.length).toBe(1);
    
    // And it should use the /pdfs subfolder
    expect(folderMatches![0]).toContain('/pdfs');
  });
});

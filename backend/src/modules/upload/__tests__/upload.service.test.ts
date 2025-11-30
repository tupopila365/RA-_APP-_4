import { UploadService } from '../upload.service';

describe('UploadService', () => {
  let uploadService: UploadService;

  beforeEach(() => {
    uploadService = new UploadService();
  });

  describe('validateImage', () => {
    it('should reject file with no file provided', () => {
      const result = uploadService.validateImage(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should reject file exceeding size limit', () => {
      const mockFile = {
        originalname: 'test.jpg',
        size: 6 * 1024 * 1024, // 6MB
        mimetype: 'image/jpeg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum limit');
    });

    it('should reject invalid file format', () => {
      const mockFile = {
        originalname: 'test.txt',
        size: 1024,
        mimetype: 'text/plain',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });

    it('should reject non-image mimetype', () => {
      const mockFile = {
        originalname: 'test.jpg',
        size: 1024,
        mimetype: 'application/pdf',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must be an image');
    });

    it('should accept valid JPEG image', () => {
      const mockFile = {
        originalname: 'test.jpg',
        size: 1024 * 1024, // 1MB
        mimetype: 'image/jpeg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG image', () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2 * 1024 * 1024, // 2MB
        mimetype: 'image/png',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP image', () => {
      const mockFile = {
        originalname: 'test.webp',
        size: 3 * 1024 * 1024, // 3MB
        mimetype: 'image/webp',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid GIF image', () => {
      const mockFile = {
        originalname: 'test.gif',
        size: 4 * 1024 * 1024, // 4MB
        mimetype: 'image/gif',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validateImage(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validatePDF', () => {
    it('should reject file with no file provided', () => {
      const result = uploadService.validatePDF(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should reject file exceeding size limit', () => {
      const mockFile = {
        originalname: 'test.pdf',
        size: 11 * 1024 * 1024, // 11MB
        mimetype: 'application/pdf',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validatePDF(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum limit');
    });

    it('should reject invalid file format', () => {
      const mockFile = {
        originalname: 'test.doc',
        size: 1024,
        mimetype: 'application/msword',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validatePDF(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });

    it('should reject non-PDF mimetype', () => {
      const mockFile = {
        originalname: 'test.pdf',
        size: 1024,
        mimetype: 'image/jpeg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validatePDF(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must be a PDF');
    });

    it('should accept valid PDF', () => {
      const mockFile = {
        originalname: 'test.pdf',
        size: 5 * 1024 * 1024, // 5MB
        mimetype: 'application/pdf',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const result = uploadService.validatePDF(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

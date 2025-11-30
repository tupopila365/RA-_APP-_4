import * as fc from 'fast-check';
import { documentDownloadService } from '../documentDownloadService';

/**
 * Feature: mobile-document-download, Property 8: Filename safety and structure
 * 
 * Property: For any input string used to generate a filename, the resulting filename
 * SHALL contain only safe characters (alphanumeric, hyphens, underscores, and periods),
 * SHALL include the tender title or reference number, and SHALL preserve the PDF extension.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3
 */
describe('Property-Based Tests: Document Download Service', () => {
  describe('Property 8: Filename safety and structure', () => {
    it('should generate filenames with only safe characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 1: Filename should only contain safe characters
            // Safe characters: alphanumeric, hyphens, underscores, and periods
            const safeCharacterPattern = /^[a-zA-Z0-9\-_.]+$/;
            expect(filename).toMatch(safeCharacterPattern);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve the PDF extension', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 2: Filename should end with .pdf extension
            expect(filename).toMatch(/\.pdf$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle various extensions correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.constantFrom('pdf', 'doc', 'txt', 'jpg', 'png'),
          (inputTitle, extension) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, extension);
            
            // Property 3: Filename should end with the specified extension
            const expectedPattern = new RegExp(`\\.${extension}$`);
            expect(filename).toMatch(expectedPattern);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate non-empty filenames for any input', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 4: Filename should never be empty
            expect(filename.length).toBeGreaterThan(0);
            
            // Property 5: Filename should have at least the extension
            expect(filename.length).toBeGreaterThan(4); // At minimum: "x.pdf"
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should limit filename length appropriately', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 6: Filename should not exceed reasonable length
            // Max 100 chars for name + 4 for ".pdf" = 104 total
            expect(filename.length).toBeLessThanOrEqual(104);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters by removing or replacing them', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 7: No special characters that could cause file system issues
            const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
            expect(filename).not.toMatch(dangerousChars);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle strings with only special characters', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}', '<', '>', '?', '/', '\\', '|'), { minLength: 1, maxLength: 50 }),
          (specialCharsArray) => {
            const specialCharsOnly = specialCharsArray.join('');
            const filename = documentDownloadService.generateSafeFilename(specialCharsOnly, 'pdf');
            
            // Property 8: Should generate a valid filename even with only special chars
            expect(filename).toMatch(/^[a-zA-Z0-9\-_.]+$/);
            expect(filename).toMatch(/\.pdf$/);
            expect(filename.length).toBeGreaterThan(4);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle whitespace correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 9: No spaces in filename (should be replaced with underscores)
            expect(filename).not.toMatch(/\s/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not have consecutive underscores', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Property 10: No consecutive underscores (cleaned up)
            expect(filename).not.toMatch(/__/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not start or end with underscores (before extension)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (inputTitle) => {
            const filename = documentDownloadService.generateSafeFilename(inputTitle, 'pdf');
            
            // Remove extension to check the base name
            const baseName = filename.replace(/\.pdf$/, '');
            
            // Property 11: Should not start with underscore
            expect(baseName).not.toMatch(/^_/);
            
            // Property 12: Should not end with underscore
            expect(baseName).not.toMatch(/_$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

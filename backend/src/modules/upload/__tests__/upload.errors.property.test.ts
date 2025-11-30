import * as fc from 'fast-check';
import { safeSerialize, createUploadError, UploadErrorType } from '../upload.errors';

/**
 * Feature: pdf-upload-functionality, Property 11: Unknown errors are serialized
 * Validates: Requirements 5.5
 * 
 * For any error that is not an instance of Error, the system must serialize 
 * the complete error object and include it in logs
 */
describe('Property 11: Unknown errors are serialized', () => {
  it('should serialize any object without throwing errors', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary objects including circular references
        fc.anything(),
        (obj) => {
          // The safeSerialize function should handle any input without throwing
          expect(() => safeSerialize(obj)).not.toThrow();
          
          const result = safeSerialize(obj);
          
          // Result should be serializable to JSON string (or be undefined/primitive)
          expect(() => JSON.stringify(result)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle circular references by replacing with [Circular]', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer(),
        (str, num) => {
          // Create an object with circular reference
          const obj: any = { name: str, value: num };
          obj.self = obj;
          
          const result = safeSerialize(obj);
          
          // Should serialize successfully
          expect(result).toBeDefined();
          expect(result.name).toBe(str);
          expect(result.value).toBe(num);
          expect(result.self).toBe('[Circular]');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve non-circular object structures', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          age: fc.integer(),
          active: fc.boolean(),
          tags: fc.array(fc.string()),
        }),
        (obj) => {
          const result = safeSerialize(obj);
          
          // All properties should be preserved
          expect(result.name).toBe(obj.name);
          expect(result.age).toBe(obj.age);
          expect(result.active).toBe(obj.active);
          expect(result.tags).toEqual(obj.tags);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle nested objects with circular references', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (str) => {
          // Create nested structure with circular reference
          const parent: any = { name: 'parent', value: str };
          const child: any = { name: 'child', parent: parent };
          parent.child = child;
          child.self = child;
          
          const result = safeSerialize(parent);
          
          // Should serialize successfully
          expect(result).toBeDefined();
          expect(result.name).toBe('parent');
          expect(result.value).toBe(str);
          expect(result.child).toBeDefined();
          expect(result.child.name).toBe('child');
          // Circular references should be marked
          expect(result.child.parent).toBe('[Circular]');
          expect(result.child.self).toBe('[Circular]');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle Error objects', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (message) => {
          const error = new Error(message);
          const result = safeSerialize(error);
          
          // Should serialize successfully
          expect(result).toBeDefined();
          expect(() => JSON.stringify(result)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle arrays with circular references', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (numbers) => {
          const arr: any = [...numbers];
          arr.push(arr); // Create circular reference
          
          const result = safeSerialize(arr);
          
          // Should serialize successfully
          expect(result).toBeDefined();
          expect(Array.isArray(result)).toBe(true);
          // Original numbers should be preserved
          for (let i = 0; i < numbers.length; i++) {
            expect(result[i]).toBe(numbers[i]);
          }
          // Circular reference should be marked
          expect(result[numbers.length]).toBe('[Circular]');
        }
      ),
      { numRuns: 100 }
    );
  });
});

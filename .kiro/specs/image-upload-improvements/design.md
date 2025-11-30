# Design Document

## Overview

This design document outlines the implementation approach for improving image upload functionality in the Roads Authority application. The solution provides real-time upload progress feedback, image previews, proper error handling, and ensures images display correctly across both admin dashboard and mobile applications.

## Architecture

### Component Structure

```
Admin Dashboard (React/TypeScript)
├── ImageUploadField Component
│   ├── File Input
│   ├── Progress Bar
│   ├── Image Preview
│   └── Error Display
├── Image Upload Service
│   ├── Cloudinary Integration
│   ├── Progress Tracking
│   └── Error Handling
└── Image Display Components
    ├── Thumbnail Component
    ├── Loading Skeleton
    └── Placeholder Image

Mobile App (React Native)
├── Image Component with Loading
├── Image Cache Manager
└── Placeholder Fallback
```

### Data Flow

1. User selects image file
2. Client validates file (type, size)
3. Upload begins with progress tracking
4. Cloudinary processes and stores image
5. Server receives and stores image URL
6. Client displays preview/confirmation
7. Mobile app fetches and caches images

## Components and Interfaces

### Admin Dashboard Components

#### ImageUploadField Component

```typescript
interface ImageUploadFieldProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  label?: string;
  required?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
}
```

#### ImageThumbnail Component

```typescript
interface ImageThumbnailProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  onError?: () => void;
  loading?: boolean;
}
```

### Mobile App Components

#### CachedImage Component

```typescript
interface CachedImageProps {
  uri: string;
  style?: ImageStyle;
  placeholder?: ImageSourcePropType;
  onLoad?: () => void;
  onError?: () => void;
}
```

### Service Interfaces

#### Image Upload Service

```typescript
interface ImageUploadService {
  uploadImage(
    file: File,
    onProgress: (progress: number) => void
  ): Promise<UploadResult>;
  
  validateImage(file: File): ValidationResult;
  
  deleteImage(publicId: string): Promise<void>;
}

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

## Data Models

### Image Upload Response

```typescript
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Upload progress monotonicity
*For any* image upload, the progress percentage should only increase or stay the same, never decrease
**Validates: Requirements 1.1**

### Property 2: Upload completion consistency
*For any* successful upload, when progress reaches 100%, an image URL must be returned
**Validates: Requirements 1.3**

### Property 3: File validation before upload
*For any* file selection, validation must complete before upload begins
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 4: Image URL persistence
*For any* uploaded image, the returned URL must be accessible and return the correct image
**Validates: Requirements 2.4, 3.1, 4.1**

### Property 5: Error state recovery
*For any* upload failure, the system must return to a state where a new upload can be attempted
**Validates: Requirements 1.4, 6.4**

### Property 6: Preview accuracy
*For any* uploaded image, the preview must display the same image that will be saved
**Validates: Requirements 2.1, 2.2**

## Error Handling

### Error Types

1. **Validation Errors**
   - Invalid file type
   - File size exceeds limit
   - No file selected

2. **Upload Errors**
   - Network failure
   - Cloudinary service unavailable
   - Authentication failure
   - Timeout

3. **Display Errors**
   - Image URL invalid
   - Image load failure
   - CORS issues

### Error Recovery Strategies

- **Validation Errors**: Display inline error, allow user to select different file
- **Network Errors**: Provide retry button with exponential backoff
- **Service Errors**: Display error message with support contact
- **Display Errors**: Show placeholder image, log error for debugging

## Testing Strategy

### Unit Tests

- File validation logic (type, size)
- Progress calculation
- Error message formatting
- URL validation

### Integration Tests

- Complete upload flow from file selection to preview
- Error handling for various failure scenarios
- Image display with loading states
- Cache functionality in mobile app

### Property-Based Tests

Each correctness property will be tested using property-based testing:

- **Property 1**: Generate random upload progress sequences, verify monotonicity
- **Property 2**: Test various upload scenarios, verify URL returned at 100%
- **Property 3**: Generate random files, verify validation runs first
- **Property 4**: Upload random images, verify URLs are accessible
- **Property 5**: Simulate random failures, verify recovery to initial state
- **Property 6**: Upload random images, verify preview matches saved image

### Manual Testing

- Upload various image formats (JPEG, PNG, GIF, WebP)
- Test with different file sizes (small, medium, large, over limit)
- Test on slow network connections
- Test with Cloudinary unavailable
- Verify images display correctly on mobile devices

## Implementation Notes

### Cloudinary Configuration

```typescript
// Cloudinary upload preset configuration
const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  uploadPreset: 'roads_authority_admin',
  folder: 'roads-authority',
  transformation: [
    { width: 1200, height: 800, crop: 'limit' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
};
```

### Progress Tracking

Use XMLHttpRequest or Axios with progress events:

```typescript
const uploadWithProgress = (file: File, onProgress: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  return axios.post(cloudinaryUrl, formData, {
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(progress);
    }
  });
};
```

### Image Caching (Mobile)

Use React Native Fast Image or Expo Image with caching:

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  cachePolicy="memory-disk"
  placeholder={placeholderImage}
  transition={200}
/>
```

### Performance Considerations

- Lazy load images in lists
- Use thumbnail transformations for list views
- Implement progressive image loading
- Cache images aggressively on mobile
- Use WebP format when supported
- Implement image compression before upload

### Security Considerations

- Validate file types on both client and server
- Implement file size limits
- Use signed upload URLs for Cloudinary
- Sanitize filenames
- Implement rate limiting for uploads
- Verify user authentication before upload

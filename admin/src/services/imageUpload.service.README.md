# Image Upload Service

The Image Upload Service provides a complete solution for uploading images to Cloudinary with automatic optimization, progress tracking, and validation.

## Features

- ✅ File validation (type and size)
- ✅ Upload progress tracking
- ✅ Automatic image optimization
- ✅ Error handling with user-friendly messages
- ✅ Thumbnail generation
- ✅ Optimized URL generation

## Configuration

Add the following environment variables to your `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Usage

### Basic Upload

```typescript
import { imageUploadService } from '@/services/imageUpload.service';

const handleFileUpload = async (file: File) => {
  try {
    const result = await imageUploadService.uploadImage(file);
    console.log('Uploaded image URL:', result.url);
    console.log('Public ID:', result.publicId);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Upload with Progress Tracking

```typescript
import { imageUploadService } from '@/services/imageUpload.service';

const handleFileUpload = async (file: File) => {
  try {
    const result = await imageUploadService.uploadImage(
      file,
      (progress) => {
        console.log(`Upload progress: ${progress}%`);
        // Update your UI with the progress
      }
    );
    console.log('Upload complete:', result.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### File Validation

```typescript
import { imageUploadService } from '@/services/imageUpload.service';

const validateFile = (file: File) => {
  const validation = imageUploadService.validateImage(file);
  
  if (!validation.valid) {
    alert(validation.error);
    return false;
  }
  
  return true;
};
```

### Generate Optimized URLs

```typescript
import { imageUploadService } from '@/services/imageUpload.service';

// Get optimized URL with default settings
const optimizedUrl = imageUploadService.getOptimizedImageUrl(publicId);

// Get optimized URL with custom settings
const customUrl = imageUploadService.getOptimizedImageUrl(publicId, {
  width: 800,
  height: 600,
  quality: '80',
  format: 'webp',
  crop: 'fill',
});
```

### Generate Thumbnails

```typescript
import { imageUploadService } from '@/services/imageUpload.service';

// Small thumbnail (100x100)
const smallThumb = imageUploadService.getThumbnailUrl(publicId, 'small');

// Medium thumbnail (200x200) - default
const mediumThumb = imageUploadService.getThumbnailUrl(publicId);

// Large thumbnail (400x400)
const largeThumb = imageUploadService.getThumbnailUrl(publicId, 'large');
```

## Validation Rules

### Supported File Types
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

### File Size Limit
- Maximum: 5MB

## Automatic Optimizations

The service automatically applies the following optimizations to uploaded images:

1. **Size Limiting**: Images are limited to 1200x800 pixels while maintaining aspect ratio
2. **Quality Optimization**: Cloudinary automatically selects the best quality/size balance
3. **Format Conversion**: Automatically converts to the best format for the user's browser (e.g., WebP when supported)

## Error Handling

The service provides user-friendly error messages for common scenarios:

- **Validation Errors**: "Invalid file type" or "File size exceeds 5MB limit"
- **Network Errors**: "Network error. Please check your connection."
- **Timeout Errors**: "Upload timeout. Please try again."
- **Authentication Errors**: "Upload authentication failed. Please contact support."
- **Generic Errors**: "Upload failed. Please try again."

## TypeScript Types

```typescript
interface UploadResult {
  url: string;        // Secure HTTPS URL of uploaded image
  publicId: string;   // Cloudinary public ID for transformations
  width: number;      // Image width in pixels
  height: number;     // Image height in pixels
  format: string;     // Image format (jpg, png, etc.)
  bytes: number;      // File size in bytes
}

interface ValidationResult {
  valid: boolean;     // Whether the file is valid
  error?: string;     // Error message if invalid
}
```

## Integration with Forms

Example integration with a form component:

```typescript
import { useState } from 'react';
import { imageUploadService } from '@/services/imageUpload.service';

const MyForm = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = imageUploadService.validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Upload
    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const result = await imageUploadService.uploadImage(file, setProgress);
      setImageUrl(result.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <div>Uploading: {progress}%</div>}
      {error && <div className="error">{error}</div>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
};
```

## Best Practices

1. **Always validate files** before attempting upload
2. **Show progress feedback** to users during upload
3. **Handle errors gracefully** with user-friendly messages
4. **Use thumbnails** for list views to improve performance
5. **Store the publicId** along with the URL for future transformations
6. **Disable submit buttons** during upload to prevent duplicate submissions

## Testing

The service includes comprehensive unit tests covering:
- File validation (all supported formats and error cases)
- Upload functionality with progress tracking
- Error handling (network, timeout, authentication)
- URL generation (optimized and thumbnail URLs)

Run tests with:
```bash
npm test imageUpload.service.test.ts
```

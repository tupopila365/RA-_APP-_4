# Upload Module

## Overview
This module handles image uploads to Cloudinary with validation, progress support, and error handling.

## Files
- `upload.service.ts` - Core upload logic and validation
- `upload.controller.ts` - HTTP request handlers
- `upload.routes.ts` - Route definitions
- `__tests__/upload.service.test.ts` - Unit tests

## API Endpoints

### Upload Image
```
POST /api/upload/image
```

**Authentication:** Required (Bearer token)

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` field with file

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "roads-authority/abc123",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "bytes": 245678
  }
}
```

### Delete Image
```
DELETE /api/upload/image
```

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "publicId": "roads-authority/abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Validation Rules

- **Allowed formats:** JPEG, PNG, GIF, WebP
- **Max file size:** 5MB
- **Mimetype check:** Must be image/*

## Image Transformations

Cloudinary automatically applies:
- Max dimensions: 1200x800 (maintains aspect ratio)
- Quality: auto (optimized)
- Format: auto (WebP when supported)

## Error Handling

Common errors:
- `No file provided` - Missing file in request
- `File size exceeds maximum limit of 5MB` - File too large
- `Invalid file format` - Unsupported file type
- `File must be an image` - Invalid mimetype
- `Cloudinary is not configured` - Missing credentials

## Testing

Run tests:
```bash
npm test -- upload.service.test.ts
```

## Usage Example

```typescript
// Frontend upload example
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.url); // Cloudinary URL
```

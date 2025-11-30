# ImageUploadField Component

A comprehensive image upload component with drag-and-drop support, progress tracking, preview, and error handling.

## Features

- ✅ **Drag-and-Drop Support**: Users can drag and drop images directly onto the upload area
- ✅ **File Validation**: Validates file type (JPEG, PNG, GIF, WebP) and size (configurable, default 5MB)
- ✅ **Upload Progress**: Real-time progress bar showing upload percentage
- ✅ **Image Preview**: Displays uploaded image thumbnail with filename and size
- ✅ **Error Handling**: Comprehensive error messages with retry functionality
- ✅ **Network Resilience**: Handles timeouts, network errors, and service unavailability
- ✅ **Cancellation Support**: Allows canceling ongoing uploads
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Requirements Validation

This component validates the following requirements from the specification:

- **Requirement 1.1**: Upload progress indicator showing percentage
- **Requirement 1.2**: Submit button disabled during upload
- **Requirement 1.3**: Success message and image preview on completion
- **Requirement 1.4**: Clear error messages on failure
- **Requirement 2.1**: Thumbnail preview of uploaded image
- **Requirement 2.2**: Display filename and file size
- **Requirement 2.3**: Remove and re-upload option
- **Requirement 5.1**: File type validation (JPEG, PNG, GIF, WebP)
- **Requirement 5.2**: File size validation (max 5MB)
- **Requirement 5.3**: Specific error messages for validation failures
- **Requirement 6.3**: Error message when Cloudinary unavailable
- **Requirement 6.4**: Retry functionality for network errors
- **Requirement 6.5**: Timeout handling with user notification

## Usage

### Basic Usage

```tsx
import { ImageUploadField } from '../../components/common';

function MyForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUploadField
      value={imageUrl}
      onChange={setImageUrl}
      label="Upload Image"
    />
  );
}
```

### With All Options

```tsx
import { ImageUploadField } from '../../components/common';

function MyForm() {
  const [imageUrl, setImageUrl] = useState('');

  const handleError = (error: Error) => {
    console.error('Upload failed:', error);
    // Show notification to user
  };

  return (
    <ImageUploadField
      value={imageUrl}
      onChange={setImageUrl}
      onError={handleError}
      label="Featured Image"
      required
      maxSizeMB={5}
      acceptedFormats={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
      disabled={false}
    />
  );
}
```

### In a Form with React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { ImageUploadField } from '../../components/common';

interface FormData {
  title: string;
  imageUrl: string;
}

function NewsForm() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="imageUrl"
        control={control}
        rules={{ required: 'Image is required' }}
        render={({ field, fieldState }) => (
          <ImageUploadField
            value={field.value}
            onChange={field.onChange}
            label="Featured Image"
            required
            error={fieldState.error?.message}
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Current image URL |
| `onChange` | `(url: string) => void` | **Required** | Callback when image is uploaded |
| `onError` | `(error: Error) => void` | `undefined` | Callback when upload fails |
| `maxSizeMB` | `number` | `5` | Maximum file size in megabytes |
| `acceptedFormats` | `string[]` | `['.jpg', '.jpeg', '.png', '.gif', '.webp']` | Accepted file extensions |
| `label` | `string` | `'Upload Image'` | Label text |
| `required` | `boolean` | `false` | Show required indicator |
| `disabled` | `boolean` | `false` | Disable the component |

## Validation

The component performs client-side validation before uploading:

### File Type Validation
- Accepts: JPEG, PNG, GIF, WebP
- Error message: "Invalid file type. Please upload .jpg, .jpeg, .png, .gif, .webp files only."

### File Size Validation
- Default max size: 5MB (configurable)
- Error message: "File size exceeds {maxSizeMB}MB limit. Please choose a smaller file."

## Error Handling

The component handles various error scenarios:

### Network Errors
- **Timeout**: "Upload timeout. Please check your connection and try again."
- **Network failure**: "Network error. Please check your connection and try again."
- **Service unavailable**: "Image service is temporarily unavailable. Please try again later."

### User Actions
- **Cancel**: "Upload cancelled."
- **Retry**: Clicking the retry button re-attempts the upload with the same file

## Upload Flow

1. **File Selection**: User selects file via browse button or drag-and-drop
2. **Validation**: File type and size are validated
3. **Upload Start**: Progress bar appears, browse button is disabled
4. **Progress Tracking**: Progress percentage updates in real-time
5. **Completion**: Image preview is displayed with remove option
6. **Error Handling**: If upload fails, error message and retry button appear

## Backend Integration

The component expects a backend endpoint at `/api/upload/image` that:

- Accepts `multipart/form-data` with field name `image`
- Requires authentication (Bearer token)
- Returns response in format:
  ```json
  {
    "data": {
      "url": "https://cloudinary.com/path/to/image.jpg"
    }
  }
  ```

## Styling

The component uses Material-UI components and follows the application theme. Key visual states:

- **Default**: Dashed border, hover effect
- **Dragging**: Highlighted border, background color change
- **Uploading**: Progress bar with percentage
- **Preview**: Image thumbnail with remove button
- **Error**: Red border, error alert with retry button
- **Disabled**: Grayed out, cursor not-allowed

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Error announcements
- Required field indicators

## Performance Considerations

- Upload timeout: 60 seconds
- Progress updates throttled by browser
- Image preview uses browser's native image rendering
- Cancel token allows aborting ongoing uploads

## Browser Support

- Modern browsers with File API support
- Drag-and-drop API support
- FormData API support
- XMLHttpRequest Level 2 (for progress events)

## Testing

See `ImageUploadField.test.tsx` for comprehensive test coverage including:
- File validation
- Upload progress
- Error handling
- Retry functionality
- Preview display
- Remove functionality

## Example

See `ImageUploadField.example.tsx` for a complete working example.

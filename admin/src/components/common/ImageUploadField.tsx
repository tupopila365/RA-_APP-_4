import React, { useCallback, useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { imageUploadService } from '../../services/imageUpload.service';
import { errorLogger } from '../../services/errorLogger.service';

interface ImageUploadFieldProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const DEFAULT_MAX_SIZE_MB = 5;

/**
 * ImageUploadField component with drag-and-drop, progress tracking, and preview
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 6.3, 6.4, 6.5
 */
const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  onError,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = ACCEPTED_EXTENSIONS,
  label = 'Upload Image',
  required = false,
  disabled = false,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    previewUrl: value || null,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file type and size using imageUploadService
   * Validates: Requirements 5.1, 5.2, 5.3
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validation = imageUploadService.validateImage(file);
    return validation;
  };

  /**
   * Upload image to Cloudinary with progress tracking
   * Validates: Requirements 1.1, 1.3, 6.3, 6.4, 6.5
   */
  const uploadImage = async (file: File): Promise<void> => {
    try {
      setUploadState({
        uploading: true,
        progress: 0,
        error: null,
        previewUrl: null,
      });

      const result = await imageUploadService.uploadImage(file, (progress) => {
        setUploadState((prev) => ({
          ...prev,
          progress,
        }));
      });

      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        previewUrl: result.url,
      });

      onChange(result.url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      // Error is already logged in imageUploadService, but we log it here with component context
      errorLogger.logUploadFailure(errorObj, file, {
        component: 'ImageUploadField',
        label,
        maxSizeMB,
      });

      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        previewUrl: null,
      });

      if (onError) {
        onError(errorObj);
      }
    }
  };

  /**
   * Handle file selection
   * Validates: Requirements 1.1, 5.1, 5.2, 5.3
   */
  const handleFileSelect = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      setSelectedFile(file);

      // Validate file before upload
      const validation = validateFile(file);
      if (!validation.valid) {
        // Validation errors are already logged in imageUploadService
        setUploadState({
          uploading: false,
          progress: 0,
          error: validation.error || 'Invalid file',
          previewUrl: null,
        });
        return;
      }

      // Start upload
      await uploadImage(file);
    },
    [maxSizeMB]
  );

  /**
   * Drag and drop handlers
   * Validates: Requirements 1.1
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !uploadState.uploading) {
        setIsDragging(true);
      }
    },
    [disabled, uploadState.uploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || uploadState.uploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0] || null);
      }
    },
    [disabled, uploadState.uploading, handleFileSelect]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0] || null);
    }
  };

  /**
   * Handle remove/re-upload
   * Validates: Requirements 2.3
   */
  const handleRemove = () => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      previewUrl: null,
    });
    setSelectedFile(null);
    onChange('');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle retry after error
   * Validates: Requirements 1.4, 6.4
   */
  const handleRetry = () => {
    if (selectedFile) {
      uploadImage(selectedFile);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isDisabled = disabled || uploadState.uploading;

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}

      <Paper
        variant="outlined"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: isDragging
            ? 'action.hover'
            : isDisabled
            ? 'action.disabledBackground'
            : 'background.paper',
          borderColor: uploadState.error
            ? 'error.main'
            : isDragging
            ? 'primary.main'
            : 'divider',
          borderWidth: 2,
          borderStyle: 'dashed',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: isDisabled ? 'action.disabledBackground' : 'action.hover',
          },
        }}
      >
        {/* Image Preview - Validates: Requirements 2.1, 2.2 */}
        {uploadState.previewUrl ? (
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                component="img"
                src={uploadState.previewUrl}
                alt="Preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
              {selectedFile && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" noWrap>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
              )}
              {!isDisabled && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={handleRemove}
                >
                  Remove Image
                </Button>
              )}
            </Box>
          </Box>
        ) : uploadState.uploading ? (
          /* Upload Progress - Validates: Requirements 1.1, 1.2 */
          <Box>
            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Uploading... {uploadState.progress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadState.progress}
              sx={{ mt: 2, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Please wait while your image is being uploaded
            </Typography>
          </Box>
        ) : (
          /* File Input - Validates: Requirements 1.1 */
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drag and drop an image here or click to browse
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleInputChange}
              style={{ display: 'none' }}
              id="image-upload-input"
              disabled={isDisabled}
            />
            <label htmlFor="image-upload-input">
              <Button
                variant="contained"
                component="span"
                disabled={isDisabled}
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 1 }}
              >
                Browse Files
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
              Accepted formats: {acceptedFormats.join(', ')} • Max size: {maxSizeMB}MB
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Error Display with Retry - Validates: Requirements 1.4, 6.3, 6.4, 6.5 */}
      {uploadState.error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            selectedFile && (
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
              >
                Retry
              </Button>
            )
          }
        >
          {uploadState.error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUploadField;

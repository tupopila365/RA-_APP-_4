import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  label?: string;
  helperText?: string;
  error?: string | undefined;
  disabled?: boolean;
}

/**
 * Reusable file upload component with drag-and-drop support
 */
const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf',
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFileSelect,
  selectedFile,
  label = 'Upload File',
  helperText = 'Drag and drop a file here or click to browse',
  error,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`;
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.includes(fileExtension)) {
        return `Only ${accept} files are allowed`;
      }
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    setFileError('');

    if (!file) {
      onFileSelect(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      onFileSelect(null);
      return;
    }

    onFileSelect(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

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

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileChange(files[0] || null);
      }
    },
    [disabled]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0] || null);
    }
  };

  const handleRemoveFile = () => {
    handleFileChange(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const displayError = error || fileError;

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
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
            : disabled
            ? 'action.disabledBackground'
            : 'background.paper',
          borderColor: displayError
            ? 'error.main'
            : isDragging
            ? 'primary.main'
            : 'divider',
          borderWidth: 2,
          borderStyle: 'dashed',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: disabled ? 'action.disabledBackground' : 'action.hover',
          },
        }}
      >
        {selectedFile ? (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <FileIcon color="primary" />
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body2" noWrap>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
              {!disabled && (
                <IconButton
                  size="small"
                  onClick={handleRemoveFile}
                  aria-label="Remove file"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
            />
            <Typography variant="body1" gutterBottom>
              {helperText}
            </Typography>
            <input
              type="file"
              accept={accept}
              onChange={handleInputChange}
              style={{ display: 'none' }}
              id="file-upload-input"
              disabled={disabled}
            />
            <label htmlFor="file-upload-input">
              <Button
                variant="contained"
                component="span"
                disabled={disabled}
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 1 }}
              >
                Browse Files
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
              Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
            </Typography>
          </Box>
        )}
      </Paper>

      {displayError && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {displayError}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;

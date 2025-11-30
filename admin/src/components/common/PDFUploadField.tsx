import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import pdfUploadService, { PDFUploadResult } from '../../services/pdfUpload.service';
import PDFPreview from './PDFPreview';

interface PDFUploadFieldProps {
  value?: string; // Current PDF URL
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

interface DocumentInfo {
  filename: string;
  size: number;
  url: string;
}

/**
 * PDFUploadField Component
 * Handles PDF file upload with validation, progress tracking, and preview
 */
const PDFUploadField: React.FC<PDFUploadFieldProps> = ({
  value,
  onChange,
  onError,
  maxSizeMB = 10,
  label = 'Upload PDF Document',
  required = false,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(value || null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Validate file
    const validation = pdfUploadService.validatePDF(file);
    if (!validation.valid) {
      const errorMsg = validation.error || 'Invalid file';
      setError(errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
      return;
    }

    // Start upload
    setUploading(true);
    setProgress(0);

    try {
      const result: PDFUploadResult = await pdfUploadService.uploadPDF(
        file,
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );

      // Upload successful
      setDocumentUrl(result.url);
      setDocumentInfo({
        filename: file.name,
        size: result.bytes,
        url: result.url,
      });
      onChange(result.url);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed. Please try again.';
      setError(errorMsg);
      if (onError) {
        onError(err);
      }
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setDocumentUrl(null);
    setDocumentInfo(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}

      {/* Show upload area if no document is uploaded */}
      {!documentUrl && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: error ? 'error.main' : 'divider',
            backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: disabled || uploading ? undefined : 'action.hover',
            },
          }}
          onClick={!disabled && !uploading ? handleBrowseClick : undefined}
        >
          <CloudUploadIcon
            sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
          />
          <Typography variant="body1" gutterBottom>
            Click to browse or drag and drop a PDF file
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Maximum file size: {maxSizeMB}MB
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Only PDF files are accepted
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled || uploading}
          />

          {!uploading && (
            <Button
              variant="contained"
              component="span"
              disabled={disabled}
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Files
            </Button>
          )}
        </Paper>
      )}

      {/* Show upload progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Uploading... {progress}%
              </Typography>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {/* Show uploaded document */}
      {documentUrl && documentInfo && !uploading && (
        <Box sx={{ mt: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              backgroundColor: 'grey.50',
            }}
          >
            <PdfIcon color="error" sx={{ fontSize: 40 }} />

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {documentInfo.filename}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(documentInfo.size)}
              </Typography>
            </Box>

            {!disabled && (
              <IconButton
                size="small"
                onClick={handleRemove}
                aria-label="Remove document"
                color="error"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Paper>

          {/* Show preview component */}
          <Box sx={{ mt: 2 }}>
            <PDFPreview
              url={documentUrl}
              filename={documentInfo.filename}
              onRemove={!disabled ? handleRemove : undefined}
            />
          </Box>
        </Box>
      )}

      {/* Show existing document URL (if value provided but no documentInfo) */}
      {documentUrl && !documentInfo && !uploading && (
        <Box sx={{ mt: 2 }}>
          <PDFPreview
            url={documentUrl}
            onRemove={!disabled ? handleRemove : undefined}
          />
        </Box>
      )}

      {/* Show error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default PDFUploadField;

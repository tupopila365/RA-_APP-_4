import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface BulkFileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  disabled?: boolean;
}

const BulkFileUpload: React.FC<BulkFileUploadProps> = ({
  onUpload,
  accept = '.pdf',
  maxFiles = 10,
  maxSizeMB = 10,
  label = 'Upload Files',
  disabled = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.includes(fileExtension)) {
        return `File "${file.name}" is not a valid type. Allowed: ${accept}`;
      }
    }

    return null;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);
    setSuccess(false);

    if (files.length === 0) {
      return;
    }

    // Check total file count
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum of ${maxFiles} files allowed. You already have ${selectedFiles.length} selected.`);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFiles, maxFiles, maxSizeMB, accept]);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFiles);

      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      setSelectedFiles([]);

      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, onUpload]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{label}</Typography>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleBrowseClick}
            disabled={disabled || uploading || selectedFiles.length >= maxFiles}
          >
            Add Files
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Maximum {maxFiles} files, {maxSizeMB}MB per file. Accepted formats: {accept}
        </Typography>

        {selectedFiles.length > 0 && (
          <List dense>
            {selectedFiles.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Uploading... {progress}%
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Files uploaded successfully!
          </Alert>
        )}

        {selectedFiles.length > 0 && !uploading && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={disabled || uploading}
              fullWidth
            >
              Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedFiles([])}
              disabled={disabled || uploading}
            >
              Clear
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BulkFileUpload;


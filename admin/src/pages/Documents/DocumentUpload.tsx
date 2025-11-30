import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, CloudUpload as CloudUploadIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import FileUpload from '../../components/common/FileUpload';
import { uploadDocument, getIndexingProgress } from '../../services/documents.service';

const CATEGORIES = [
  { value: 'policy', label: 'Policy' },
  { value: 'tender', label: 'Tender' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
];

/**
 * Document Upload Page
 * Allows admins to upload PDF documents with metadata
 */
const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'indexing' | 'complete'>('idle');
  const [indexingMessage, setIndexingMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'policy' as 'policy' | 'tender' | 'report' | 'other',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors['title'] = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors['description'] = 'Description is required';
    }

    if (!selectedFile) {
      errors['file'] = 'Please select a PDF file to upload';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    setUploadStage('idle');

    if (!validateForm()) {
      return;
    }

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setUploadStage('uploading');

    try {
      // Stage 1: Uploading file (0-70%)
      const response = await uploadDocument(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          file: selectedFile,
        },
        (progress) => {
          // Map upload progress to 0-70% range
          const uploadPercentage = Math.round((progress.percentage * 70) / 100);
          setUploadProgress(uploadPercentage);
        }
      );

      // Upload complete, start indexing stage
      setUploadProgress(70);
      setUploadStage('indexing');
      setIndexingMessage('Starting indexing process...');

      // Stage 2: Poll for real indexing progress from RAG service
      const documentId = response.data._id;
      let indexingComplete = false;
      let pollAttempts = 0;
      const maxPollAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
      let useSimulatedProgress = false;
      let simulatedProgress = 70;

      while (!indexingComplete && pollAttempts < maxPollAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
          
          // Try to get real progress from backend
          try {
            const progressData = await getIndexingProgress(documentId);
            
            if (progressData.data) {
              const { status, percentage, message } = progressData.data;
              
              // Check if progress is available
              if (status === 'not_found' || status === 'unknown') {
                // Progress not available yet, use simulated progress
                useSimulatedProgress = true;
              } else {
                // Real progress available
                useSimulatedProgress = false;
                
                // Map RAG progress (0-100%) to our range (70-100%)
                const mappedProgress = 70 + Math.round((percentage * 30) / 100);
                setUploadProgress(mappedProgress);
                setIndexingMessage(message || 'Processing document...');
                
                if (status === 'completed') {
                  indexingComplete = true;
                  setUploadProgress(100);
                  setUploadStage('complete');
                  setSuccess(true);
                } else if (status === 'failed') {
                  throw new Error(message || 'Indexing failed');
                }
              }
            }
          } catch (progressError) {
            console.warn('Could not fetch progress, using simulated progress:', progressError);
            useSimulatedProgress = true;
          }
          
          // Use simulated progress if real progress not available
          if (useSimulatedProgress && !indexingComplete) {
            simulatedProgress = Math.min(95, simulatedProgress + 2);
            setUploadProgress(simulatedProgress);
            setIndexingMessage('Processing document and creating embeddings...');
          }
          
          pollAttempts++;
        } catch (pollError) {
          console.error('Progress polling error:', pollError);
          pollAttempts++;
        }
      }

      // If polling timed out but no error, assume success
      if (!indexingComplete) {
        setUploadProgress(100);
        setUploadStage('complete');
        setSuccess(true);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'policy',
      });
      setSelectedFile(null);

      // Navigate to document list after a short delay
      setTimeout(() => {
        navigate('/documents');
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error?.message ||
          'Failed to upload document. Please try again.'
      );
      setUploadStage('idle');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/documents');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back to Documents
        </Button>
        <Typography variant="h4" component="h1">
          Upload Document
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Document uploaded successfully! The document will be indexed for the chatbot.
          Redirecting...
        </Alert>
      )}

      {loading && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {uploadStage === 'uploading' && (
                <>
                  <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Uploading document...
                  </Typography>
                </>
              )}
              {uploadStage === 'indexing' && (
                <>
                  <AutoAwesomeIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Indexing document for AI chatbot...
                  </Typography>
                </>
              )}
              {uploadStage === 'complete' && (
                <>
                  <AutoAwesomeIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                    Complete!
                  </Typography>
                </>
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }} 
            />
            <Typography variant="body2" color="text.secondary" align="right">
              {uploadProgress}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {uploadStage === 'uploading' && 'Uploading file to cloud storage...'}
              {uploadStage === 'indexing' && (indexingMessage || 'Processing document and creating embeddings for AI search...')}
              {uploadStage === 'complete' && 'Document is ready for chatbot queries!'}
            </Typography>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              fullWidth
              error={!!formErrors['title']}
              helperText={formErrors['title']}
              disabled={loading}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              fullWidth
              multiline
              rows={4}
              error={!!formErrors['description']}
              helperText={formErrors['description']}
              disabled={loading}
            />

            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              select
              required
              fullWidth
              disabled={loading}
            >
              {CATEGORIES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <FileUpload
              accept=".pdf"
              maxSize={10 * 1024 * 1024}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              label="PDF Document *"
              helperText="Drag and drop a PDF file here or click to browse"
              error={formErrors['file']}
              disabled={loading}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DocumentUpload;

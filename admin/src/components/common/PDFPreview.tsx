import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface PDFPreviewProps {
  // For inline display (upload field)
  url?: string;
  filename?: string;
  onRemove?: () => void;
  showPreview?: boolean;
  
  // For dialog display (document list)
  open?: boolean;
  onClose?: () => void;
  fileUrl?: string;
  title?: string;
}

/**
 * PDF Preview Component
 * Shows PDF information and provides preview/view options
 * Can be used in two modes:
 * 1. Inline mode: Shows a card with buttons (for upload fields)
 * 2. Dialog mode: Shows as a dialog (for document lists)
 */
const PDFPreview: React.FC<PDFPreviewProps> = ({
  url,
  filename,
  onRemove,
  showPreview = true,
  // Dialog mode props
  open: externalOpen,
  onClose: externalOnClose,
  fileUrl,
  title,
}) => {
  // Determine which mode we're in
  const isDialogMode = externalOpen !== undefined;
  const pdfUrl = fileUrl || url || '';
  const pdfFilename = title || filename || '';
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const actualOpen = isDialogMode ? externalOpen : previewOpen;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [useDirectEmbed, setUseDirectEmbed] = useState(false);

  useEffect(() => {
    // Check if URL is from Cloudinary
    if (pdfUrl && pdfUrl.includes('cloudinary.com')) {
      setUseDirectEmbed(true);
    }
  }, [pdfUrl]);

  const handleOpenPreview = () => {
    setPreviewOpen(true);
    setLoading(true);
    setError(false);
    setErrorMessage('');
  };

  const handleClosePreview = () => {
    if (isDialogMode && externalOnClose) {
      externalOnClose();
    } else {
      setPreviewOpen(false);
    }
    setError(false);
    setErrorMessage('');
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = getFilename();
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
    setErrorMessage('Unable to load PDF preview. The file may require authentication or may not be publicly accessible.');
  };

  const getFilename = () => {
    if (pdfFilename) return pdfFilename;
    try {
      const urlObj = new URL(pdfUrl);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || 'document.pdf';
    } catch {
      return 'document.pdf';
    }
  };

  // If in dialog mode, only render the dialog
  if (isDialogMode) {
    return (
      <Dialog
        open={actualOpen || false}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PdfIcon color="error" />
            <Typography variant="h6">PDF Preview</Typography>
          </Box>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2, position: 'relative', backgroundColor: 'grey.100' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Preview not available in browser.</strong> Click "Open in New Tab" to view the PDF directly, or "Download" to save it to your device.
            </Typography>
          </Alert>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              gap: 2,
            }}
          >
            <PdfIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h6" gutterBottom>
              {getFilename()}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom align="center">
              PDF files from Cloudinary cannot be previewed directly in the browser due to security restrictions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenInNewTab}
              >
                Open in New Tab
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={handleOpenInNewTab} startIcon={<OpenInNewIcon />}>
            Open in New Tab
          </Button>
          <Button onClick={handleClosePreview} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Inline mode - render card with dialog
  return (
    <>
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
            {getFilename()}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pdfUrl}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenInNewTab}
          >
            Open
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
          {onRemove && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={onRemove}
            >
              Remove
            </Button>
          )}
        </Box>
      </Paper>

      {/* Preview Dialog (for inline mode) */}
      {!isDialogMode && (
        <Dialog
          open={actualOpen || false}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PdfIcon color="error" />
              <Typography variant="h6">PDF Preview</Typography>
            </Box>
            <IconButton onClick={handleClosePreview} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 2, position: 'relative', backgroundColor: 'grey.100' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Preview not available in browser.</strong> Click "Open in New Tab" to view the PDF directly, or "Download" to save it to your device.
              </Typography>
            </Alert>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 2,
              }}
            >
              <PdfIcon sx={{ fontSize: 80, color: 'error.main' }} />
              <Typography variant="h6" gutterBottom>
                {getFilename()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                PDF files from Cloudinary cannot be previewed directly in the browser due to security restrictions.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
              Download
            </Button>
            <Button onClick={handleOpenInNewTab} startIcon={<OpenInNewIcon />}>
              Open in New Tab
            </Button>
            <Button onClick={handleClosePreview} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default PDFPreview;

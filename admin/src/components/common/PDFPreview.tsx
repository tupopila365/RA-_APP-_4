import React, { useState } from 'react';
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
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface PDFPreviewProps {
  url: string;
  filename?: string;
  onRemove?: () => void;
  showPreview?: boolean;
}

/**
 * PDF Preview Component
 * Shows PDF information and provides preview/view options
 */
const PDFPreview: React.FC<PDFPreviewProps> = ({
  url,
  filename,
  onRemove,
  showPreview = true,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleOpenPreview = () => {
    setPreviewOpen(true);
    setLoading(true);
    setError(false);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setError(false);
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const getFilename = () => {
    if (filename) return filename;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || 'document.pdf';
    } catch {
      return 'document.pdf';
    }
  };

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
            {url}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {showPreview && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={handleOpenPreview}
            >
              Preview
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenInNewTab}
          >
            Open
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

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
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

        <DialogContent sx={{ p: 0, position: 'relative', backgroundColor: 'grey.100' }}>
          {loading && !error && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {error ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 4,
              }}
            >
              <PdfIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Failed to load PDF preview
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                The PDF could not be displayed in the preview window.
              </Typography>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenInNewTab}
                sx={{ mt: 2 }}
              >
                Open in New Tab
              </Button>
            </Box>
          ) : (
            <iframe
              src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: loading ? 'none' : 'block',
              }}
              title="PDF Preview"
              onLoad={() => setLoading(false)}
              onError={handleIframeError}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleOpenInNewTab} startIcon={<OpenInNewIcon />}>
            Open in New Tab
          </Button>
          <Button onClick={handleClosePreview} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PDFPreview;

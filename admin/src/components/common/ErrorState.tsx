import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorStateProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  variant?: 'default' | 'alert';
}

/**
 * Reusable error state component with optional retry button
 * 
 * @example
 * ```tsx
 * <ErrorState 
 *   title="Failed to load data"
 *   message="Unable to fetch data from the server. Please try again."
 *   onRetry={fetchData}
 * />
 * 
 * <ErrorState 
 *   message="An error occurred"
 *   variant="alert"
 * />
 * ```
 */
const ErrorState = ({
  message = 'An error occurred while loading data',
  title = 'Error',
  onRetry,
  fullScreen = false,
  variant = 'default',
}: ErrorStateProps) => {
  if (variant === 'alert') {
    return (
      <Alert 
        severity="error" 
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          )
        }
      >
        {message}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        gap: 2,
        p: 3,
      }}
    >
      <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="h6" color="text.primary" align="center">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;

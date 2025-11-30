import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { Box } from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info' | 'success';
  loading?: boolean;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

/**
 * Reusable confirmation dialog component for delete confirmations and other actions
 * 
 * @example
 * ```tsx
 * const [dialogOpen, setDialogOpen] = useState(false);
 * const [loading, setLoading] = useState(false);
 * 
 * const handleDelete = async () => {
 *   setLoading(true);
 *   try {
 *     await deleteItem(itemId);
 *     setDialogOpen(false);
 *   } catch (error) {
 *     // Handle error
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 * 
 * <ConfirmDialog
 *   open={dialogOpen}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   onConfirm={handleDelete}
 *   onCancel={() => setDialogOpen(false)}
 *   severity="error"
 *   loading={loading}
 * />
 * ```
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
  confirmColor,
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getIcon = () => {
    const iconProps = { sx: { fontSize: 48, mb: 2 } };
    
    switch (severity) {
      case 'error':
        return <ErrorIcon {...iconProps} color="error" />;
      case 'warning':
        return <WarningIcon {...iconProps} color="warning" />;
      case 'info':
        return <InfoIcon {...iconProps} color="info" />;
      case 'success':
        return <SuccessIcon {...iconProps} color="success" />;
      default:
        return <WarningIcon {...iconProps} color="warning" />;
    }
  };

  const getConfirmColor = () => {
    if (confirmColor) {
      return confirmColor;
    }
    
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          {getIcon()}
          <DialogContentText sx={{ textAlign: 'center' }}>
            {message}
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          color={getConfirmColor()}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

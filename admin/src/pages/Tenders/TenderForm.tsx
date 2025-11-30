import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import {
  createTender,
  updateTender,
  getTenderById,
  TenderFormData,
} from '../../services/tenders.service';
import PDFUploadField from '../../components/common/PDFUploadField';

const tenderSchema = z.object({
  referenceNumber: z.string().min(1, 'Reference number is required').max(50, 'Reference number must be less than 50 characters'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  value: z.number().optional().or(z.string().transform((val) => val === '' ? undefined : Number(val))),
  status: z.enum(['open', 'closed', 'upcoming'], {
    required_error: 'Status is required',
  }),
  openingDate: z.string().min(1, 'Opening date is required'),
  closingDate: z.string().min(1, 'Closing date is required'),
  pdfUrl: z.string().min(1, 'PDF document is required'),
  published: z.boolean(),
});

type TenderFormValues = z.infer<typeof tenderSchema>;

const TenderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TenderFormValues>({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      referenceNumber: '',
      title: '',
      description: '',
      category: '',
      value: undefined,
      status: 'upcoming',
      openingDate: '',
      closingDate: '',
      pdfUrl: '',
      published: false,
    },
  });

  const pdfUrl = watch('pdfUrl');

  useEffect(() => {
    if (isEditMode && id) {
      fetchTender();
    }
  }, [id, isEditMode]);

  const fetchTender = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getTenderById(id);
      const tenderData = response.data.tender;

      setValue('referenceNumber', tenderData.referenceNumber);
      setValue('title', tenderData.title);
      setValue('description', tenderData.description);
      setValue('category', tenderData.category);
      setValue('value', tenderData.value);
      setValue('status', tenderData.status);
      setValue('openingDate', tenderData.openingDate.split('T')[0]);
      setValue('closingDate', tenderData.closingDate.split('T')[0]);
      setValue('pdfUrl', tenderData.pdfUrl);
      setValue('published', tenderData.published);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch tender');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFChange = (url: string) => {
    setValue('pdfUrl', url);
    if (url) {
      setSuccess('PDF uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handlePDFError = (err: Error) => {
    setError(err.message || 'Failed to upload PDF');
  };

  const onSubmit = async (data: TenderFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData: TenderFormData = {
        referenceNumber: data.referenceNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        value: data.value as number | undefined,
        status: data.status,
        openingDate: data.openingDate,
        closingDate: data.closingDate,
        pdfUrl: data.pdfUrl,
        published: data.published,
      };

      if (isEditMode && id) {
        await updateTender(id, formData);
        setSuccess('Tender updated successfully');
      } else {
        await createTender(formData);
        setSuccess('Tender created successfully');
      }

      setTimeout(() => {
        navigate('/tenders');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save tender');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/tenders');
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Tender' : 'Create Tender'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="referenceNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reference Number"
                    fullWidth
                    error={!!errors.referenceNumber}
                    helperText={errors.referenceNumber?.message || 'e.g., TND-2024-001'}
                    required
                  />
                )}
              />

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Category"
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message || 'e.g., Construction, Consulting'}
                    required
                  />
                )}
              />
            </Box>

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tender Title"
                  fullWidth
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  required
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  required
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tender Value (optional)"
                    type="number"
                    fullWidth
                    error={!!errors.value}
                    helperText={errors.value?.message || 'Estimated value in NAD'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">N$</InputAdornment>,
                    }}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status} required>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                    {errors.status && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="openingDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.openingDate}
                    helperText={errors.openingDate?.message}
                    required
                  />
                )}
              />

              <Controller
                name="closingDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Closing Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.closingDate}
                    helperText={errors.closingDate?.message}
                    required
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tender Document (Required)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload tender document. Max file size: 10MB. This is required.
            </Typography>

            <PDFUploadField
              value={pdfUrl}
              onChange={handlePDFChange}
              onError={handlePDFError}
              maxSizeMB={10}
              label=""
              required={true}
              disabled={loading}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Publishing Options
            </Typography>

            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Publish immediately"
                />
              )}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              {watch('published')
                ? 'This tender will be visible to mobile app users'
                : 'This tender will be saved as a draft'}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TenderForm;

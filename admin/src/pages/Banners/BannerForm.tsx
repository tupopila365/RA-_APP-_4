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
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import ImageUploadField from '../../components/common/ImageUploadField';
import { createBanner, updateBanner, getBannerById, BannerFormData } from '../../services/banners.service';

const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  imageUrl: z.string().min(1, 'Image is required').url('Must be a valid URL'),
  linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  order: z.number().min(1, 'Order must be at least 1'),
  active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

const BannerForm = () => {
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
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      order: 1,
      active: true,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchBanner();
    }
  }, [id, isEditMode]);

  const fetchBanner = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getBannerById(id);
      const bannerData = response.data;

      setValue('title', bannerData.title);
      setValue('description', bannerData.description || '');
      setValue('imageUrl', bannerData.imageUrl);
      setValue('linkUrl', bannerData.linkUrl || '');
      setValue('order', bannerData.order);
      setValue('active', bannerData.active);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch banner');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData: BannerFormData = {
        title: data.title,
        description: data.description ? data.description : undefined,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl ? data.linkUrl : undefined,
        order: data.order,
        active: data.active,
      };

      if (isEditMode && id) {
        await updateBanner(id, formData);
        setSuccess('Banner updated successfully');
      } else {
        await createBanner(formData);
        setSuccess('Banner created successfully');
      }

      setTimeout(() => {
        navigate('/banners');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/banners');
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
          {isEditMode ? 'Edit Banner' : 'Create Banner'}
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

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
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
                  rows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message || 'Optional brief description'}
                />
              )}
            />

            <Controller
              name="linkUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Link URL"
                  fullWidth
                  margin="normal"
                  error={!!errors.linkUrl}
                  helperText={errors.linkUrl?.message || 'Optional URL to open when banner is tapped'}
                  placeholder="https://example.com"
                />
              )}
            />

            <Controller
              name="order"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Display Order"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.order}
                  helperText={errors.order?.message || 'Lower numbers appear first'}
                  required
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Banner Image
            </Typography>

            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploadField
                  value={field.value}
                  onChange={field.onChange}
                  onError={(error) => setError(error.message)}
                  label="Upload Banner Image"
                  maxSizeMB={5}
                  required={true}
                />
              )}
            />

            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Recommended size: 1200x400px. Images will be automatically optimized for web delivery.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Display Options
            </Typography>

            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Active"
                />
              )}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              {watch('active')
                ? 'This banner will be visible in the mobile app'
                : 'This banner will be hidden from the mobile app'}
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

export default BannerForm;

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
  Paper,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import RichTextEditor from '../../components/common/RichTextEditor';
import ImageUploadField from '../../components/common/ImageUploadField';
import { createNews, updateNews, getNewsById, NewsFormData } from '../../services/news.service';

const newsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  author: z.string().min(1, 'Author is required'),
  imageUrl: z.string().optional(),
  published: z.boolean(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

const NewsForm = () => {
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
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      author: '',
      imageUrl: '',
      published: false,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchNews();
    }
  }, [id, isEditMode]);

  const fetchNews = async () => {
    if (!id) return;

    try {
      setLoading(true);
      console.log('Fetching news with ID:', id);
      const response = await getNewsById(id);
      console.log('Received response:', response);
      
      const newsData = response.data;
      console.log('News data:', newsData);

      setValue('title', newsData.title || '');
      setValue('excerpt', newsData.excerpt || '');
      setValue('content', newsData.content || '');
      setValue('category', newsData.category || '');
      setValue('author', newsData.author || '');
      setValue('imageUrl', newsData.imageUrl || '');
      setValue('published', newsData.published || false);
      
      console.log('Form values set successfully');
    } catch (err: any) {
      console.error('Fetch news error:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: NewsFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData: NewsFormData = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: data.author,
        imageUrl: data.imageUrl,
        published: data.published,
      };

      if (isEditMode && id) {
        await updateNews(id, formData);
        setSuccess('News article updated successfully');
      } else {
        await createNews(formData);
        setSuccess('News article created successfully');
      }

      setTimeout(() => {
        navigate('/news');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/news');
  };

  if (loading && isEditMode) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary">
          Loading article...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{
            mr: { xs: 0, sm: 2 },
            fontWeight: 600,
          }}
        >
          Back
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00B4E6 0%, #0090C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {isEditMode ? 'Edit News Article' : 'Create News Article'}
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
        <Card
          sx={{
            mb: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
                fontSize: '1.25rem',
                pb: 2,
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
              }}
            >
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
              name="excerpt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Excerpt"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  error={!!errors.excerpt}
                  helperText={errors.excerpt?.message || 'Brief summary of the article'}
                  required
                />
              )}
            />

            <Box sx={{ mt: 2 }}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    label="Content"
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    placeholder="Write your news article content here..."
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category} required>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                      <MenuItem value="Safety">Safety</MenuItem>
                      <MenuItem value="Announcements">Announcements</MenuItem>
                    </Select>
                    {errors.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.category.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Author"
                    fullWidth
                    error={!!errors.author}
                    helperText={errors.author?.message}
                    required
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
                fontSize: '1.25rem',
                pb: 2,
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
              }}
            >
              Featured Image
            </Typography>

            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploadField
                  value={field.value}
                  onChange={field.onChange}
                  onError={(error) => setError(error.message)}
                  label="Upload Featured Image"
                  maxSizeMB={5}
                  required={false}
                />
              )}
            />

            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Recommended size: 1200x630px. Images will be automatically optimized for web delivery.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
                fontSize: '1.25rem',
                pb: 2,
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
              }}
            >
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
                ? 'This article will be visible to mobile app users'
                : 'This article will be saved as a draft'}
            </Typography>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
            sx={{
              fontWeight: 600,
              px: 4,
            }}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default NewsForm;

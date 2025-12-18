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
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { createFAQ, updateFAQ, getFAQById, FAQFormData } from '../../services/faqs.service';

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().optional(),
  order: z.number().min(0, 'Order must be 0 or greater').optional(),
});

type FAQFormValues = z.infer<typeof faqSchema>;

const FAQForm = () => {
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
  } = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: '',
      order: 0,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchFAQ();
    }
  }, [id, isEditMode]);

  const fetchFAQ = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getFAQById(id);
      const faqData = response.data.faq;

      setValue('question', faqData.question || '');
      setValue('answer', faqData.answer || '');
      setValue('category', faqData.category || '');
      setValue('order', faqData.order || 0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch FAQ');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FAQFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData: FAQFormData = {
        question: data.question,
        answer: data.answer,
        category: data.category || undefined,
        order: data.order || 0,
      };

      if (isEditMode && id) {
        await updateFAQ(id, formData);
        setSuccess('FAQ updated successfully');
      } else {
        await createFAQ(formData);
        setSuccess('FAQ created successfully');
      }

      setTimeout(() => {
        navigate('/faqs');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/faqs');
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
          {isEditMode ? 'Edit FAQ' : 'Create FAQ'}
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
              FAQ Information
            </Typography>

            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Question"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.question}
                  helperText={errors.question?.message}
                  required
                />
              )}
            />

            <Controller
              name="answer"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Answer"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={6}
                  error={!!errors.answer}
                  helperText={errors.answer?.message}
                  required
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="Licensing">Licensing</MenuItem>
                      <MenuItem value="Registration">Registration</MenuItem>
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="Payments">Payments</MenuItem>
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
                name="order"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Order"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.order}
                    helperText={errors.order?.message || 'Display order (lower numbers appear first)'}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value || 0}
                  />
                )}
              />
            </Box>
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

export default FAQForm;


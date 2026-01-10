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
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  createVacancy,
  updateVacancy,
  getVacancyById,
  VacancyFormData,
  DepartmentType,
} from '../../services/vacancies.service';
import PDFUploadField from '../../components/common/PDFUploadField';

// Predefined departments for Roads Authority
const DEPARTMENTS: { value: DepartmentType; label: string }[] = [
  // Core Departments
  { value: 'Construction & Renewal', label: 'Construction & Renewal' },
  { value: 'Road Maintenance', label: 'Road Maintenance' },
  { value: 'Road Traffic Planning & Advisory', label: 'Road Traffic Planning & Advisory' },
  { value: 'Road Management (RMS)', label: 'Road Management (RMS)' },
  { value: 'Transport Information & Regulatory Services (NaTIS)', label: 'Transport Information & Regulatory Services (NaTIS)' },
  { value: 'Road & Transport Monitoring/Inspectorate', label: 'Road & Transport Monitoring/Inspectorate' },
  // Support Departments
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Finance / Accounting', label: 'Finance / Accounting' },
  { value: 'Corporate Communications', label: 'Corporate Communications' },
  { value: 'Administration / Corporate Services', label: 'Administration / Corporate Services' },
  { value: 'Legal / Compliance', label: 'Legal / Compliance' },
  { value: 'ICT / Business Systems', label: 'ICT / Business Systems' },
  { value: 'Procurement', label: 'Procurement' },
  { value: "CEO's Office", label: "CEO's Office" },
];

const vacancySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.enum(['full-time', 'part-time', 'bursary', 'internship'], {
    required_error: 'Type is required',
  }),
  department: z.enum([
    'Construction & Renewal',
    'Road Maintenance',
    'Road Traffic Planning & Advisory',
    'Road Management (RMS)',
    'Transport Information & Regulatory Services (NaTIS)',
    'Road & Transport Monitoring/Inspectorate',
    'Human Resources',
    'Finance / Accounting',
    'Corporate Communications',
    'Administration / Corporate Services',
    'Legal / Compliance',
    'ICT / Business Systems',
    'Procurement',
    "CEO's Office",
  ], {
    required_error: 'Department is required',
  }),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  salary: z.string().optional(),
  closingDate: z.string().min(1, 'Closing date is required'),
  pdfUrl: z.string().optional(),
  published: z.boolean(),
  // Contact information
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  contactTelephone: z.string().optional(),
  submissionLink: z.string().url('Invalid URL format').optional().or(z.literal('')),
  submissionEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  submissionInstructions: z.string().max(500, 'Instructions must be less than 500 characters').optional(),
});

type VacancyFormValues = z.infer<typeof vacancySchema>;

const VacancyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: '',
      type: 'full-time',
      department: 'Human Resources', // Default to a valid department
      location: '',
      description: '',
      requirements: [],
      responsibilities: [],
      salary: '',
      closingDate: '',
      pdfUrl: '',
      published: false,
      // Contact information
      contactName: '',
      contactEmail: '',
      contactTelephone: '',
      submissionLink: '',
      submissionEmail: '',
      submissionInstructions: '',
    },
  });

  const requirements = watch('requirements');
  const responsibilities = watch('responsibilities');
  const pdfUrl = watch('pdfUrl');

  useEffect(() => {
    if (isEditMode && id) {
      fetchVacancy();
    }
  }, [id, isEditMode]);

  const fetchVacancy = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getVacancyById(id);
      const vacancyData = response.data.vacancy;

      setValue('title', vacancyData.title);
      setValue('type', vacancyData.type);
      setValue('department', vacancyData.department);
      setValue('location', vacancyData.location);
      setValue('description', vacancyData.description);
      setValue('requirements', vacancyData.requirements);
      setValue('responsibilities', vacancyData.responsibilities);
      setValue('salary', vacancyData.salary || '');
      setValue('closingDate', vacancyData.closingDate.split('T')[0]);
      setValue('pdfUrl', vacancyData.pdfUrl || '');
      setValue('published', vacancyData.published);
      // Contact information
      setValue('contactName', vacancyData.contactName || '');
      setValue('contactEmail', vacancyData.contactEmail || '');
      setValue('contactTelephone', vacancyData.contactTelephone || '');
      setValue('submissionLink', vacancyData.submissionLink || '');
      setValue('submissionEmail', vacancyData.submissionEmail || '');
      setValue('submissionInstructions', vacancyData.submissionInstructions || '');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch vacancy');
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

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setValue('requirements', [...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setValue(
      'requirements',
      requirements.filter((_, i) => i !== index)
    );
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setValue('responsibilities', [...responsibilities, newResponsibility.trim()]);
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setValue(
      'responsibilities',
      responsibilities.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: VacancyFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData: VacancyFormData = {
        title: data.title,
        type: data.type,
        department: data.department,
        location: data.location,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        salary: data.salary,
        closingDate: data.closingDate,
        pdfUrl: data.pdfUrl,
        published: data.published,
        // Contact information
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactTelephone: data.contactTelephone,
        submissionLink: data.submissionLink,
        submissionEmail: data.submissionEmail,
        submissionInstructions: data.submissionInstructions,
      };

      if (isEditMode && id) {
        await updateVacancy(id, formData);
        setSuccess('Vacancy updated successfully');
      } else {
        await createVacancy(formData);
        setSuccess('Vacancy created successfully');
      }

      setTimeout(() => {
        navigate('/vacancies');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save vacancy');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/vacancies');
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
          {isEditMode ? 'Edit Vacancy' : 'Create Vacancy'}
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
                  label="Job Title"
                  fullWidth
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  required
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type} required>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      <MenuItem value="full-time">Full-time</MenuItem>
                      <MenuItem value="part-time">Part-time</MenuItem>
                      <MenuItem value="bursary">Bursary</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                    {errors.type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.department} required>
                    <InputLabel>Department</InputLabel>
                    <Select {...field} label="Department">
                      {DEPARTMENTS.map((dept) => (
                        <MenuItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.department && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.department.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                    required
                  />
                )}
              />

              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Salary (optional)"
                    fullWidth
                    error={!!errors.salary}
                    helperText={errors.salary?.message || 'e.g., N$50,000 - N$70,000'}
                  />
                )}
              />
            </Box>

            <Controller
              name="closingDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Closing Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.closingDate}
                  helperText={errors.closingDate?.message}
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
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Requirement"
                fullWidth
                size="small"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRequirement}
                disabled={!newRequirement.trim()}
              >
                Add
              </Button>
            </Box>

            {errors.requirements && (
              <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                {errors.requirements.message}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {requirements.map((req, index) => (
                <Chip
                  key={index}
                  label={req}
                  onDelete={() => handleRemoveRequirement(index)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Responsibilities
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Responsibility"
                fullWidth
                size="small"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddResponsibility();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddResponsibility}
                disabled={!newResponsibility.trim()}
              >
                Add
              </Button>
            </Box>

            {errors.responsibilities && (
              <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                {errors.responsibilities.message}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {responsibilities.map((resp, index) => (
                <Chip
                  key={index}
                  label={resp}
                  onDelete={() => handleRemoveResponsibility(index)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Application Form (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload application form or additional information. Max file size: 10MB
            </Typography>

            <PDFUploadField
              value={pdfUrl}
              onChange={handlePDFChange}
              onError={handlePDFError}
              maxSizeMB={10}
              label=""
              required={false}
              disabled={loading}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Contact Information & Application Submission
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Provide contact details and application submission options for candidates
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Controller
                name="contactName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Person Name"
                    fullWidth
                    error={!!errors.contactName}
                    helperText={errors.contactName?.message}
                  />
                )}
              />

              <Controller
                name="contactTelephone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Telephone"
                    fullWidth
                    error={!!errors.contactTelephone}
                    helperText={errors.contactTelephone?.message}
                    placeholder="e.g., +264 61 123 4567"
                  />
                )}
              />
            </Box>

            <Controller
              name="contactEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail?.message}
                  placeholder="e.g., hr@ra.gov.na"
                />
              )}
            />

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Application Submission Options
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Provide at least one way for candidates to submit their applications
            </Typography>

            <Controller
              name="submissionEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Application Submission Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.submissionEmail}
                  helperText={errors.submissionEmail?.message || 'Email address where candidates should send applications'}
                  placeholder="e.g., applications@ra.gov.na"
                />
              )}
            />

            <Controller
              name="submissionLink"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Online Application Link"
                  type="url"
                  fullWidth
                  margin="normal"
                  error={!!errors.submissionLink}
                  helperText={errors.submissionLink?.message || 'Link to online application form or portal'}
                  placeholder="e.g., https://careers.ra.gov.na/apply"
                />
              )}
            />

            <Controller
              name="submissionInstructions"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Application Instructions"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.submissionInstructions}
                  helperText={errors.submissionInstructions?.message || 'Additional instructions for how to apply (max 500 characters)'}
                  placeholder="e.g., Please submit CV, cover letter, and certified copies of qualifications..."
                />
              )}
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
                ? 'This vacancy will be visible to mobile app users'
                : 'This vacancy will be saved as a draft'}
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

export default VacancyForm;

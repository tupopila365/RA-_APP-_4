import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { createUser, updateUser, getUserById } from '../../services/users.service';
import { Permission, Role } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

const AVAILABLE_PERMISSIONS: { value: Permission; label: string; description: string }[] = [
  {
    value: 'news:manage',
    label: 'News Manager',
    description: 'Create, edit, and delete news articles',
  },
  {
    value: 'tenders:manage',
    label: 'Tenders Manager',
    description: 'Create, edit, and delete tenders',
  },
  {
    value: 'vacancies:manage',
    label: 'Vacancies Manager',
    description: 'Create, edit, and delete job vacancies',
  },
  {
    value: 'documents:upload',
    label: 'PDF Uploader',
    description: 'Upload and manage PDF documents',
  },
  {
    value: 'banners:manage',
    label: 'Banner Manager',
    description: 'Create, edit, and delete homepage banners',
  },
  {
    value: 'locations:manage',
    label: 'Locations Manager',
    description: 'Create, edit, and delete office locations',
  },
];

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as Role,
    permissions: [] as Permission[],
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // Check if user has permission to manage users
  useEffect(() => {
    if (!hasPermission('users:manage')) {
      navigate('/');
    }
  }, [hasPermission, navigate]);

  // Fetch user data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchUser(id);
    }
  }, [id, isEditMode]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      const user = response.data;
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
        permissions: user.permissions as Permission[],
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation (only for create mode or if password is provided in edit mode)
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handlePermissionToggle = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const submitData = {
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        ...(formData.password && { password: formData.password }),
      };

      if (isEditMode && id) {
        await updateUser(id, submitData);
        setSuccess('User updated successfully');
      } else {
        await createUser(submitData as any);
        setSuccess('User created successfully');
      }

      // Navigate back to list after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit User' : 'Create User'}
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

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={Boolean(errors.password)}
                      helperText={errors.password || 'Minimum 8 characters'}
                      required={!isEditMode}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        label="Role"
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="super-admin">Super Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                  fullWidth
                >
                  {submitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                </Button>
                <Button variant="outlined" onClick={handleCancel} fullWidth disabled={submitting}>
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.role === 'super-admin'
                    ? 'Super admins have all permissions by default.'
                    : 'Select the permissions for this admin user.'}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <FormGroup>
                  <Grid container spacing={2}>
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <Grid item xs={12} sm={6} key={permission.value}>
                        <Card variant="outlined">
                          <CardContent>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.permissions.includes(permission.value)}
                                  onChange={() => handlePermissionToggle(permission.value)}
                                  disabled={formData.role === 'super-admin'}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {permission.label}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default UserForm;

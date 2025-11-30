import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { getLocationsList, deleteLocation, Location } from '../../services/locations.service';

const LocationsList = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [regions, setRegions] = useState<string[]>([]);

  const fetchLocations = async (region?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLocationsList(region);
      setLocations(response.data.locations);

      // Extract unique regions for filter
      const uniqueRegions = Array.from(
        new Set(response.data.locations.map((loc) => loc.region))
      ).sort();
      setRegions(uniqueRegions);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateNew = () => {
    navigate('/locations/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/locations/edit/${id}`);
  };

  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await deleteLocation(locationToDelete.id);
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
      fetchLocations(regionFilter || undefined);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete location');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLocationToDelete(null);
  };

  const handleRegionFilterChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setRegionFilter(value);
    fetchLocations(value || undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openInMaps = (location: Location) => {
    const { latitude, longitude } = location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Office Locations
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Add Location
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Region</InputLabel>
              <Select
                value={regionFilter}
                label="Filter by Region"
                onChange={handleRegionFilterChange}
              >
                <MenuItem value="">
                  <em>All Regions</em>
                </MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {regionFilter && (
              <Typography variant="body2" color="text.secondary">
                Showing {locations.length} location(s) in {regionFilter}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : locations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {regionFilter
                ? `No locations found in ${regionFilter}`
                : 'No locations found. Add your first location to get started.'}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Coordinates</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {location.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">{location.address}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={location.region} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => openInMaps(location)}
                      sx={{ textTransform: 'none' }}
                    >
                      {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {location.contactNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="caption">{location.contactNumber}</Typography>
                      </Box>
                    )}
                    {location.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="caption">{location.email}</Typography>
                      </Box>
                    )}
                    {!location.contactNumber && !location.email && (
                      <Typography variant="caption" color="text.secondary">
                        No contact info
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(location.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(location.id)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(location)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{locationToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationsList;

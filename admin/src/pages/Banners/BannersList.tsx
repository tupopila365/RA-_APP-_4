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
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getBannersList, deleteBanner, updateBannerOrder, updateBanner, Banner } from '../../services/banners.service';
import { ImageThumbnail } from '../../components/common';

const BannersList = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [reordering, setReordering] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBannersList();
      // Sort by order
      const sortedBanners = response.data.banners.sort((a, b) => a.order - b.order);
      setBanners(sortedBanners);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateNew = () => {
    navigate('/banners/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/banners/edit/${id}`);
  };

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;

    try {
      await deleteBanner(bannerToDelete._id);
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
      fetchBanners();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete banner');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBannerToDelete(null);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateBanner(banner._id, {
        title: banner.title,
        description: banner.description ? banner.description : undefined,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl ? banner.linkUrl : undefined,
        order: banner.order,
        active: !banner.active,
      });
      fetchBanners();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update banner');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    if (!reorderedItem) return;
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setBanners(updatedItems);

    try {
      setReordering(true);
      await updateBannerOrder(
        updatedItems.map((item) => ({
          id: item._id,
          order: item.order,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update banner order');
      fetchBanners(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Banner Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Create Banner
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {reordering && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Updating banner order...
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Drag and drop banners to reorder them. The order determines how they appear in the mobile app.
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : banners.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No banners found. Create your first banner to get started.
            </Typography>
          </Box>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="banners">
              {(provided) => (
                <Table {...provided.droppableProps} ref={provided.innerRef}>
                  <TableHead>
                    <TableRow>
                      <TableCell width={50}></TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Preview</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Link URL</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {banners.map((banner, index) => (
                      <Draggable key={banner._id} draggableId={banner._id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            hover
                            sx={{
                              backgroundColor: snapshot.isDragging ? 'action.hover' : 'inherit',
                            }}
                          >
                            <TableCell {...provided.dragHandleProps}>
                              <DragIcon sx={{ cursor: 'grab', color: 'action.active' }} />
                            </TableCell>
                            <TableCell>
                              <Chip label={banner.order} size="small" />
                            </TableCell>
                            <TableCell>
                              <ImageThumbnail
                                src={banner.imageUrl}
                                alt={banner.title}
                                size="medium"
                                sx={{
                                  width: 100,
                                  height: 60,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {banner.title}
                              </Typography>
                              {banner.description && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {banner.description.substring(0, 50)}
                                  {banner.description.length > 50 ? '...' : ''}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {banner.linkUrl ? (
                                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                  {banner.linkUrl.substring(0, 30)}
                                  {banner.linkUrl.length > 30 ? '...' : ''}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No link
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={banner.active}
                                onChange={() => handleToggleActive(banner)}
                                size="small"
                              />
                              <Typography variant="caption" display="block">
                                {banner.active ? 'Active' : 'Inactive'}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatDate(banner.createdAt)}</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleEdit(banner._id)} title="Edit">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(banner)}
                                title="Delete"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{bannerToDelete?.title}"? This action cannot be undone.
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

export default BannersList;

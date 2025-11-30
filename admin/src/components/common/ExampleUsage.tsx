/**
 * Example usage of common components
 * This file demonstrates how to use the reusable components together
 * 
 * NOTE: This is for reference only and should not be imported in production code
 */

import { useState } from 'react';
import { Box, Button, IconButton, Chip, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import DataTable, { Column } from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import ErrorState from './ErrorState';
import LoadingSpinner from '../LoadingSpinner';

interface ExampleItem {
  _id: string;
  title: string;
  status: 'active' | 'inactive';
  category: string;
  createdAt: string;
}

const ExampleUsage = () => {
  // State management
  const [items, setItems] = useState<ExampleItem[]>([
    {
      _id: '1',
      title: 'Example Item 1',
      status: 'active',
      category: 'Category A',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Example Item 2',
      status: 'inactive',
      category: 'Category B',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExampleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Define table columns
  const columns: Column<ExampleItem>[] = [
    {
      id: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      id: 'category',
      label: 'Category',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      format: (value) => (
        <Chip
          label={value}
          color={value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Handlers
  const handleEdit = (id: string) => {
    console.log('Edit item:', id);
  };

  const handleDeleteClick = (item: ExampleItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setItems(items.filter((item) => item._id !== itemToDelete._id));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const handleSort = (column: keyof ExampleItem | string, direction: 'asc' | 'desc') => {
    console.log('Sort by', column, direction);
    // Implement sorting logic here
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Data would be fetched here
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading && items.length === 0) {
    return <LoadingSpinner message="Loading items..." />;
  }

  // Render error state
  if (error && items.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Items"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Example Items</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Item
        </Button>
      </Box>

      {/* Error alert */}
      {error && <ErrorState message={error} variant="alert" />}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={items.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSort={handleSort}
        emptyMessage="No items found"
        actions={(row) => (
          <>
            <IconButton size="small" onClick={() => handleEdit(row._id)} title="Edit">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row)}
              title="Delete"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        severity="error"
        loading={deleting}
      />
    </Box>
  );
};

export default ExampleUsage;

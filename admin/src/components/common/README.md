# Common Components

This directory contains reusable UI components for the admin dashboard.

## Components

### DataTable

A powerful, reusable data table component with sorting, pagination, and search support.

**Features:**
- Sortable columns
- Pagination with customizable rows per page
- Loading states
- Error handling
- Empty state messages
- Custom cell formatting
- Row actions
- Row click handlers

**Example Usage:**

```tsx
import { DataTable, Column } from '@/components/common';
import { IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const columns: Column<User>[] = [
    { 
      id: 'name', 
      label: 'Name', 
      sortable: true 
    },
    { 
      id: 'email', 
      label: 'Email' 
    },
    { 
      id: 'role', 
      label: 'Role',
      format: (value) => <Chip label={value} size="small" />
    },
    { 
      id: 'createdAt', 
      label: 'Created',
      format: (value) => new Date(value).toLocaleDateString()
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      total={total}
      onPageChange={setPage}
      onRowsPerPageChange={setRowsPerPage}
      onSort={(column, direction) => {
        console.log('Sort by', column, direction);
      }}
      actions={(row) => (
        <>
          <IconButton size="small" onClick={() => handleEdit(row._id)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(row._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      )}
    />
  );
};
```

### ConfirmDialog

A reusable confirmation dialog for delete operations and other critical actions.

**Features:**
- Multiple severity levels (warning, error, info, success)
- Loading states during async operations
- Customizable button text and colors
- Icon indicators
- Prevents accidental dismissal during loading

**Example Usage:**

```tsx
import { ConfirmDialog } from '@/components/common';
import { useState } from 'react';

const MyComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItem(itemId);
      setDialogOpen(false);
      // Show success message
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>Delete</Button>
      
      <ConfirmDialog
        open={dialogOpen}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDialogOpen(false)}
        severity="error"
        loading={loading}
      />
    </>
  );
};
```

### FileUpload

A drag-and-drop file upload component with validation.

**Features:**
- Drag and drop support
- File type validation
- File size validation
- Preview of selected file
- Error messages
- Disabled state

**Example Usage:**

```tsx
import { FileUpload } from '@/components/common';
import { useState } from 'react';

const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <FileUpload
      accept=".pdf"
      maxSize={10 * 1024 * 1024} // 10MB
      onFileSelect={setFile}
      selectedFile={file}
      label="Upload PDF Document"
      helperText="Drag and drop a PDF file here or click to browse"
    />
  );
};
```

### RichTextEditor

A simple rich text editor for content editing.

**Example Usage:**

```tsx
import { RichTextEditor } from '@/components/common';
import { useState } from 'react';

const NewsForm = () => {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      label="Article Content"
      placeholder="Enter article content here..."
    />
  );
};
```

### ErrorState

A reusable error state component with retry functionality.

**Features:**
- Default and alert variants
- Optional retry button
- Customizable messages
- Full screen option

**Example Usage:**

```tsx
import { ErrorState } from '@/components/common';

// Default variant
<ErrorState
  title="Failed to Load Data"
  message="Unable to fetch data from the server. Please try again."
  onRetry={fetchData}
/>

// Alert variant
<ErrorState
  message="An error occurred while saving"
  variant="alert"
  onRetry={handleSave}
/>
```

### LoadingSpinner

A simple loading spinner with optional message.

**Example Usage:**

```tsx
import LoadingSpinner from '@/components/LoadingSpinner';

// Basic usage
<LoadingSpinner message="Loading data..." />

// Full screen
<LoadingSpinner message="Initializing..." fullScreen />

// Custom size
<LoadingSpinner size={60} />
```

### PDFPreview

A PDF preview component using PDF.js.

**Features:**
- Page navigation
- Loading states
- Error handling
- Responsive design

**Example Usage:**

```tsx
import { PDFPreview } from '@/components/common';
import { useState } from 'react';

const DocumentList = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  return (
    <>
      <Button onClick={() => {
        setSelectedDoc(document);
        setPreviewOpen(true);
      }}>
        Preview
      </Button>

      <PDFPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={selectedDoc?.fileUrl || ''}
        title={selectedDoc?.title || ''}
      />
    </>
  );
};
```

## Complete Example: List Page with All Components

Here's a complete example showing how to use multiple components together:

```tsx
import { useState, useEffect } from 'react';
import { Box, Button, IconButton, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  DataTable,
  Column,
  ConfirmDialog,
  ErrorState,
} from '@/components/common';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Item {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

const ItemsList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getItems({ page: page + 1, limit: rowsPerPage });
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, rowsPerPage]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await deleteItem(itemToDelete._id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Item>[] = [
    { id: 'title', label: 'Title', sortable: true },
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

  if (loading && items.length === 0) {
    return <LoadingSpinner message="Loading items..." />;
  }

  if (error && items.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Items"
        message={error}
        onRetry={fetchItems}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1>Items</h1>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Item
        </Button>
      </Box>

      {error && <ErrorState message={error} variant="alert" />}

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        actions={(row) => (
          <>
            <IconButton size="small" onClick={() => handleEdit(row._id)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                setItemToDelete(row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
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

export default ItemsList;
```

## Best Practices

1. **Always handle loading states**: Use the `loading` prop on DataTable or LoadingSpinner component
2. **Always handle errors**: Use ErrorState component or error alerts
3. **Use TypeScript**: Define proper interfaces for your data
4. **Provide meaningful messages**: Customize error and empty state messages
5. **Use confirmation dialogs**: Always confirm destructive actions like delete
6. **Handle async operations**: Show loading states during API calls
7. **Provide retry functionality**: Allow users to retry failed operations

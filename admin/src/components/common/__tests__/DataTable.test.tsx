import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../../test/test-utils';
import DataTable, { Column } from '../DataTable';

interface TestData {
  id: string;
  name: string;
  email: string;
  status: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

const mockColumns: Column<TestData>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'status', label: 'Status' },
];

describe('DataTable', () => {
  it('should render table with data', () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
  });

  it('should show loading state', () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={[]} loading={true} />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error message', () => {
    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={[]}
        error="Failed to load data"
      />
    );

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should show empty message when no data', () => {
    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={[]}
        emptyMessage="No records found"
      />
    );

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('should handle sorting', async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onSort={onSort}
      />
    );

    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);

    expect(onSort).toHaveBeenCalledWith('name', 'asc');

    // Click again to sort descending
    await user.click(nameHeader);
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('should handle pagination', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        page={0}
        rowsPerPage={10}
        total={30}
        onPageChange={onPageChange}
      />
    );

    // Find and click next page button
    const nextButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should handle rows per page change', async () => {
    const onRowsPerPageChange = vi.fn();
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        page={0}
        rowsPerPage={10}
        total={30}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    );

    // Find rows per page select
    const select = screen.getByRole('combobox');
    await user.click(select);

    // Select 25 rows per page
    const option25 = screen.getByRole('option', { name: '25' });
    await user.click(option25);

    expect(onRowsPerPageChange).toHaveBeenCalledWith(25);
    expect(onPageChange).toHaveBeenCalledWith(0); // Reset to first page
  });

  it('should handle row click', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    const row = screen.getByText('John Doe').closest('tr');
    if (row) {
      await user.click(row);
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    }
  });

  it('should render custom formatted cells', () => {
    const columnsWithFormat: Column<TestData>[] = [
      {
        id: 'name',
        label: 'Name',
        format: (value) => <strong>{value}</strong>,
      },
      {
        id: 'status',
        label: 'Status',
        format: (value) => (
          <span className={`status-${value}`}>{value.toUpperCase()}</span>
        ),
      },
    ];

    renderWithProviders(
      <DataTable columns={columnsWithFormat} data={mockData} />
    );

    const nameCell = screen.getByText('John Doe');
    expect(nameCell.tagName).toBe('STRONG');

    expect(screen.getAllByText('ACTIVE').length).toBeGreaterThan(0);
  });

  it('should render action buttons', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={(row) => (
          <>
            <button onClick={() => handleEdit(row.id)}>Edit</button>
            <button onClick={() => handleDelete(row.id)}>Delete</button>
          </>
        )}
      />
    );

    expect(screen.getAllByText('Edit')).toHaveLength(3);
    expect(screen.getAllByText('Delete')).toHaveLength(3);
  });

  it('should handle nested property access', () => {
    interface NestedData {
      id: string;
      user: {
        name: string;
        profile: {
          email: string;
        };
      };
    }

    const nestedData: NestedData[] = [
      {
        id: '1',
        user: {
          name: 'John',
          profile: { email: 'john@example.com' },
        },
      },
    ];

    const nestedColumns: Column<NestedData>[] = [
      { id: 'user.name', label: 'Name' },
      { id: 'user.profile.email', label: 'Email' },
    ];

    renderWithProviders(
      <DataTable columns={nestedColumns} data={nestedData} />
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});

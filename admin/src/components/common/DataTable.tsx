import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  page?: number;
  rowsPerPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (column: keyof T | string, direction: 'asc' | 'desc') => void;
  sortColumn?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string | number;
  actions?: (row: T) => React.ReactNode;
}

/**
 * Reusable data table component with sorting, pagination, and search support
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { id: 'name', label: 'Name', sortable: true },
 *     { id: 'email', label: 'Email' },
 *     { id: 'status', label: 'Status', format: (value) => <Chip label={value} /> }
 *   ]}
 *   data={users}
 *   loading={loading}
 *   page={page}
 *   rowsPerPage={rowsPerPage}
 *   total={total}
 *   onPageChange={setPage}
 *   onRowsPerPageChange={setRowsPerPage}
 *   actions={(row) => (
 *     <>
 *       <IconButton onClick={() => handleEdit(row.id)}><EditIcon /></IconButton>
 *       <IconButton onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
 *     </>
 *   )}
 * />
 * ```
 */
function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  page = 0,
  rowsPerPage = 10,
  total,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  rowsPerPageOptions = [5, 10, 25, 50],
  emptyMessage = 'No data available',
  onRowClick,
  getRowId = (row: T) => row['id'] || row['_id'],
  actions,
}: DataTableProps<T>) {
  const [localSortColumn, setLocalSortColumn] = useState<keyof T | string | undefined>(sortColumn);
  const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>(sortDirection);

  const handleSort = (column: keyof T | string) => {
    const isAsc = localSortColumn === column && localSortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    
    setLocalSortColumn(column);
    setLocalSortDirection(newDirection);
    
    if (onSort) {
      onSort(column, newDirection);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    }
    if (onPageChange) {
      onPageChange(0);
    }
  };

  const getCellValue = (row: T, columnId: keyof T | string): any => {
    // Handle nested properties (e.g., 'user.name')
    if (typeof columnId === 'string' && columnId.includes('.')) {
      const keys = columnId.split('.');
      let value: any = row;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      return value;
    }
    return row[columnId as keyof T];
  };

  const renderCell = (row: T, column: Column<T>) => {
    const value = getCellValue(row, column.id);
    
    if (column.format) {
      return column.format(value, row);
    }
    
    return value !== null && value !== undefined ? String(value) : '-';
  };

  const hasActions = !!actions;
  const totalCount = total !== undefined ? total : data.length;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false && onSort ? (
                    <TableSortLabel
                      active={localSortColumn === column.id}
                      direction={localSortColumn === column.id ? localSortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                return (
                  <TableRow
                    key={rowId}
                    hover={!!onRowClick}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.id)} align={column.align || 'left'}>
                        {renderCell(row, column)}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {(onPageChange || onRowsPerPageChange) && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </Box>
  );
}

export default DataTable;

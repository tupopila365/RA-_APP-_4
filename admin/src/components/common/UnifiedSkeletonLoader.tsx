import { Skeleton, TableCell, TableRow } from '@mui/material';

type UnifiedSkeletonLoaderProps = {
  rows?: number;
  columns?: number;
  showActions?: boolean;
};

/**
 * Consistent skeleton loader for admin table/list views.
 * Keeps loading states uniform across FAQs and future admin pages.
 */
const UnifiedSkeletonLoader = ({
  rows = 5,
  columns = 4,
  showActions = true,
}: UnifiedSkeletonLoaderProps) => {
  const columnWidths = ['90%', '60%', '40%', '70%'];

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
              <Skeleton
                variant="text"
                width={columnWidths[colIndex] || '80%'}
                height={24}
              />
            </TableCell>
          ))}
          {showActions && (
            <TableCell align="right">
              <Skeleton
                variant="rectangular"
                width={96}
                height={32}
                sx={{ borderRadius: 1, display: 'inline-block' }}
              />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
};

export default UnifiedSkeletonLoader;



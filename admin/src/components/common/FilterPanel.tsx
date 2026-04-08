import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import PageSectionCard from './PageSectionCard';

interface FilterPanelProps {
  children: ReactNode;
}

const FilterPanel = ({ children }: FilterPanelProps) => (
  <PageSectionCard>
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  </PageSectionCard>
);

export default FilterPanel;


import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <Box
    sx={{
      mb: 3,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: 2,
      flexWrap: 'wrap',
    }}
  >
    <Box>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
    {actions ? <Box>{actions}</Box> : null}
  </Box>
);

export default PageHeader;


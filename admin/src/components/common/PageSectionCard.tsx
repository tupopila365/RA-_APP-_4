import { Card, CardContent } from '@mui/material';
import type { ReactNode } from 'react';

interface PageSectionCardProps {
  children: ReactNode;
  noPadding?: boolean;
}

const PageSectionCard = ({ children, noPadding = false }: PageSectionCardProps) => (
  <Card sx={{ mb: 3 }}>
    {noPadding ? children : <CardContent>{children}</CardContent>}
  </Card>
);

export default PageSectionCard;


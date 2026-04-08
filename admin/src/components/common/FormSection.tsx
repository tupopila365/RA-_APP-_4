import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const FormSection = ({ title, subtitle, children }: FormSectionProps) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Divider sx={{ my: 2 }} />
      {children}
    </CardContent>
  </Card>
);

interface FormActionsBarProps {
  children: ReactNode;
}

export const FormActionsBar = ({ children }: FormActionsBarProps) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1.5,
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      mt: 2,
    }}
  >
    {children}
  </Box>
);


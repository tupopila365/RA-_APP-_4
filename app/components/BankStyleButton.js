import React from 'react';
import { UnifiedButton } from './UnifiedButton';

export const BankStyleButton = ({ title, icon, variant = 'primary', ...props }) => {
  const mappedVariant = variant === 'text' ? 'ghost' : variant;

  return (
    <UnifiedButton
      label={title}
      iconName={icon}
      variant={mappedVariant}
      {...props}
    />
  );
};


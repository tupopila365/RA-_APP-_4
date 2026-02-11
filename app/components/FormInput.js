import React from 'react';
import { UnifiedFormInput } from './UnifiedFormInput';

export const FormInput = React.memo(function FormInput({
  textArea = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}) {
  const isMultiline = textArea || multiline;

  return (
    <UnifiedFormInput
      multiline={isMultiline}
      numberOfLines={isMultiline ? Math.max(numberOfLines, 4) : numberOfLines}
      {...props}
    />
  );
});



import { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string | undefined;
  placeholder?: string;
}

/**
 * Simple rich text editor component using a textarea
 * For a production app, consider using a library like TinyMCE, Quill, or Draft.js
 */
const RichTextEditor = ({
  value,
  onChange,
  label = 'Content',
  error = false,
  helperText,
  placeholder = 'Enter content here...',
}: RichTextEditorProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Paper variant="outlined" sx={{ p: 0 }}>
        <TextField
          fullWidth
          multiline
          rows={12}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />
      </Paper>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default RichTextEditor;

import { Box, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { ReactNode } from 'react';

interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rightContent?: ReactNode;
}

const SearchToolbar = ({
  value,
  onChange,
  placeholder = 'Search...',
  rightContent,
}: SearchToolbarProps) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <TextField
      label="Search"
      variant="outlined"
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
      }}
      sx={{ flexGrow: 1, minWidth: 220 }}
    />
    {rightContent}
  </Box>
);

export default SearchToolbar;


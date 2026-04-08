import { createTheme } from '@mui/material/styles';
import { colorTokens } from './tokens';
import { getComponentOverrides } from './components';

const baseTheme = createTheme({
  palette: {
    primary: {
      main: colorTokens.brand[700],
      light: colorTokens.brand[500],
      dark: colorTokens.brand[900],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colorTokens.accent[500],
      light: '#9A8968',
      dark: colorTokens.accent[600],
      contrastText: '#FFFFFF',
    },
    background: {
      default: colorTokens.neutral[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: colorTokens.neutral[900],
      secondary: colorTokens.neutral[600],
    },
    success: {
      main: '#157347',
    },
    warning: {
      main: '#B7791F',
    },
    error: {
      main: '#B42318',
    },
    info: {
      main: colorTokens.brand[600],
    },
    divider: colorTokens.neutral[200],
    grey: {
      50: colorTokens.neutral[50],
      100: colorTokens.neutral[100],
      200: colorTokens.neutral[200],
      300: colorTokens.neutral[300],
      400: colorTokens.neutral[400],
      500: colorTokens.neutral[500],
      600: colorTokens.neutral[600],
      700: colorTokens.neutral[700],
      800: colorTokens.neutral[800],
      900: colorTokens.neutral[900],
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.015em' },
    h2: { fontWeight: 700, letterSpacing: '-0.012em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const adminTheme = createTheme(baseTheme, {
  components: getComponentOverrides(baseTheme),
});

export default adminTheme;


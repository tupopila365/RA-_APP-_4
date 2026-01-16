/**
 * OFFICIAL NAMIBIAN GOVERNMENT THEME FOR ADMIN PANEL
 * 
 * This theme ensures consistency with the mobile app and follows
 * Namibian government branding guidelines with WCAG accessibility standards.
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Government Brand Colors
const GOVERNMENT_BRAND = {
  primary: '#00B4E6',
  primaryLight: '#33C4ED',
  primaryDark: '#0099CC',
  secondary: '#FFD700',
  secondaryLight: '#FFDF33',
  secondaryDark: '#E6C200',
  accent: '#0EA5E9',
};

// Status Colors (WCAG AA Compliant)
const STATUS_COLORS = {
  success: '#059669',
  successLight: '#10B981',
  successDark: '#047857',
  warning: '#D97706',
  warningLight: '#F59E0B',
  warningDark: '#B45309',
  error: '#DC2626',
  errorLight: '#EF4444',
  errorDark: '#B91C1C',
  info: '#0284C7',
  infoLight: '#0EA5E9',
  infoDark: '#0369A1',
};

// Neutral Colors
const NEUTRAL_COLORS = {
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',
};

// Light Theme Configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: GOVERNMENT_BRAND.primary,
      light: GOVERNMENT_BRAND.primaryLight,
      dark: GOVERNMENT_BRAND.primaryDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    secondary: {
      main: GOVERNMENT_BRAND.secondary,
      light: GOVERNMENT_BRAND.secondaryLight,
      dark: GOVERNMENT_BRAND.secondaryDark,
      contrastText: NEUTRAL_COLORS.gray900,
    },
    success: {
      main: STATUS_COLORS.success,
      light: STATUS_COLORS.successLight,
      dark: STATUS_COLORS.successDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    warning: {
      main: STATUS_COLORS.warning,
      light: STATUS_COLORS.warningLight,
      dark: STATUS_COLORS.warningDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    error: {
      main: STATUS_COLORS.error,
      light: STATUS_COLORS.errorLight,
      dark: STATUS_COLORS.errorDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    info: {
      main: STATUS_COLORS.info,
      light: STATUS_COLORS.infoLight,
      dark: STATUS_COLORS.infoDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    background: {
      default: NEUTRAL_COLORS.gray50,
      paper: NEUTRAL_COLORS.white,
    },
    text: {
      primary: NEUTRAL_COLORS.gray900,
      secondary: NEUTRAL_COLORS.gray600,
      disabled: NEUTRAL_COLORS.gray400,
    },
    divider: NEUTRAL_COLORS.gray200,
    grey: {
      50: NEUTRAL_COLORS.gray50,
      100: NEUTRAL_COLORS.gray100,
      200: NEUTRAL_COLORS.gray200,
      300: NEUTRAL_COLORS.gray300,
      400: NEUTRAL_COLORS.gray400,
      500: NEUTRAL_COLORS.gray500,
      600: NEUTRAL_COLORS.gray600,
      700: NEUTRAL_COLORS.gray700,
      800: NEUTRAL_COLORS.gray800,
      900: NEUTRAL_COLORS.gray900,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: NEUTRAL_COLORS.gray900,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: NEUTRAL_COLORS.gray900,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: NEUTRAL_COLORS.gray900,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: NEUTRAL_COLORS.gray900,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: NEUTRAL_COLORS.gray900,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: NEUTRAL_COLORS.gray900,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: NEUTRAL_COLORS.gray700,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: NEUTRAL_COLORS.gray600,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none' as const,
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: NEUTRAL_COLORS.gray500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
          '&:focus': {
            boxShadow: `0 0 0 2px ${GOVERNMENT_BRAND.primaryLight}`,
          },
        },
        containedPrimary: {
          backgroundColor: GOVERNMENT_BRAND.primary,
          color: NEUTRAL_COLORS.white,
          '&:hover': {
            backgroundColor: GOVERNMENT_BRAND.primaryDark,
          },
          '&:disabled': {
            backgroundColor: NEUTRAL_COLORS.gray400,
            color: NEUTRAL_COLORS.white,
          },
        },
        containedSecondary: {
          backgroundColor: NEUTRAL_COLORS.gray100,
          color: NEUTRAL_COLORS.gray900,
          '&:hover': {
            backgroundColor: NEUTRAL_COLORS.gray200,
          },
        },
        outlinedPrimary: {
          borderColor: GOVERNMENT_BRAND.primary,
          color: GOVERNMENT_BRAND.primary,
          '&:hover': {
            borderColor: GOVERNMENT_BRAND.primaryDark,
            backgroundColor: `${GOVERNMENT_BRAND.primary}08`,
          },
        },
        textPrimary: {
          color: GOVERNMENT_BRAND.primary,
          '&:hover': {
            backgroundColor: `${GOVERNMENT_BRAND.primary}08`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: NEUTRAL_COLORS.gray300,
            },
            '&:hover fieldset': {
              borderColor: NEUTRAL_COLORS.gray400,
            },
            '&.Mui-focused fieldset': {
              borderColor: GOVERNMENT_BRAND.primary,
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: STATUS_COLORS.error,
            },
          },
          '& .MuiInputLabel-root': {
            color: NEUTRAL_COLORS.gray600,
            '&.Mui-focused': {
              color: GOVERNMENT_BRAND.primary,
            },
            '&.Mui-error': {
              color: STATUS_COLORS.error,
            },
          },
          '& .MuiInputBase-input': {
            color: NEUTRAL_COLORS.gray900,
            '&::placeholder': {
              color: NEUTRAL_COLORS.gray500,
              opacity: 1,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${NEUTRAL_COLORS.gray200}`,
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: GOVERNMENT_BRAND.primary,
          color: NEUTRAL_COLORS.white,
        },
        colorSecondary: {
          backgroundColor: NEUTRAL_COLORS.gray100,
          color: NEUTRAL_COLORS.gray900,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: `${STATUS_COLORS.success}10`,
          color: STATUS_COLORS.successDark,
          '& .MuiAlert-icon': {
            color: STATUS_COLORS.success,
          },
        },
        standardWarning: {
          backgroundColor: `${STATUS_COLORS.warning}10`,
          color: STATUS_COLORS.warningDark,
          '& .MuiAlert-icon': {
            color: STATUS_COLORS.warning,
          },
        },
        standardError: {
          backgroundColor: `${STATUS_COLORS.error}10`,
          color: STATUS_COLORS.errorDark,
          '& .MuiAlert-icon': {
            color: STATUS_COLORS.error,
          },
        },
        standardInfo: {
          backgroundColor: `${STATUS_COLORS.info}10`,
          color: STATUS_COLORS.infoDark,
          '& .MuiAlert-icon': {
            color: STATUS_COLORS.info,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: NEUTRAL_COLORS.gray50,
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: NEUTRAL_COLORS.gray700,
            borderBottom: `2px solid ${NEUTRAL_COLORS.gray200}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: NEUTRAL_COLORS.gray50,
          },
          '&.Mui-selected': {
            backgroundColor: `${GOVERNMENT_BRAND.primary}08`,
            '&:hover': {
              backgroundColor: `${GOVERNMENT_BRAND.primary}12`,
            },
          },
        },
      },
    },
  },
};

// Dark Theme Configuration
const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: GOVERNMENT_BRAND.primary,
      light: GOVERNMENT_BRAND.primaryLight,
      dark: GOVERNMENT_BRAND.primaryDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    secondary: {
      main: GOVERNMENT_BRAND.secondary,
      light: GOVERNMENT_BRAND.secondaryLight,
      dark: GOVERNMENT_BRAND.secondaryDark,
      contrastText: NEUTRAL_COLORS.gray900,
    },
    success: {
      main: STATUS_COLORS.success,
      light: STATUS_COLORS.successLight,
      dark: STATUS_COLORS.successDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    warning: {
      main: STATUS_COLORS.warning,
      light: STATUS_COLORS.warningLight,
      dark: STATUS_COLORS.warningDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    error: {
      main: STATUS_COLORS.error,
      light: STATUS_COLORS.errorLight,
      dark: STATUS_COLORS.errorDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    info: {
      main: STATUS_COLORS.info,
      light: STATUS_COLORS.infoLight,
      dark: STATUS_COLORS.infoDark,
      contrastText: NEUTRAL_COLORS.white,
    },
    background: {
      default: NEUTRAL_COLORS.gray900,
      paper: NEUTRAL_COLORS.gray800,
    },
    text: {
      primary: NEUTRAL_COLORS.gray100,
      secondary: NEUTRAL_COLORS.gray300,
      disabled: NEUTRAL_COLORS.gray500,
    },
    divider: NEUTRAL_COLORS.gray700,
  },
};

// Create and export themes
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Export government colors for direct use
export const governmentColors = {
  brand: GOVERNMENT_BRAND,
  status: STATUS_COLORS,
  neutral: NEUTRAL_COLORS,
};

// Export default theme (light)
export default lightTheme;
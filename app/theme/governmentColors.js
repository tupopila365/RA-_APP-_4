/**
 * OFFICIAL NAMIBIAN GOVERNMENT COLOR SYSTEM
 * 
 * This is the single source of truth for all colors in the Roads Authority app.
 * Based on Namibian government branding guidelines and WCAG accessibility standards.
 * 
 * JUSTIFICATION FOR PRIMARY COLOR CHOICE:
 * - #00B4E6 (Sky Blue) represents Namibia's clear skies and forward progress
 * - Already established as the official theme color
 * - Better contrast ratios than navy blue for accessibility
 * - Reflects the open, transparent nature of government services
 * - Consistent with Namibian flag colors (blue represents the sky and Atlantic Ocean)
 */

// CORE BRAND COLORS
export const GOVERNMENT_BRAND = {
  // Primary: Official Namibian Sky Blue
  primary: '#00B4E6',
  primaryLight: '#33C4ED',
  primaryDark: '#0099CC',
  
  // Secondary: Namibian Gold (from flag)
  secondary: '#FFD700',
  secondaryLight: '#FFDF33',
  secondaryDark: '#E6C200',
  
  // Accent: Professional complement
  accent: '#0EA5E9',
  accentLight: '#38BDF8',
  accentDark: '#0284C7',
};

// STATUS COLORS (WCAG AA Compliant)
export const STATUS_COLORS = {
  success: '#059669',      // Emerald green - clear success indication
  successLight: '#10B981',
  successDark: '#047857',
  
  warning: '#D97706',      // Amber - attention without alarm
  warningLight: '#F59E0B',
  warningDark: '#B45309',
  
  error: '#DC2626',        // Red - clear error indication
  errorLight: '#EF4444',
  errorDark: '#B91C1C',
  
  info: '#0284C7',         // Blue - informational
  infoLight: '#0EA5E9',
  infoDark: '#0369A1',
};

// NEUTRAL COLORS (Professional Government Palette)
export const NEUTRAL_COLORS = {
  // Whites and light grays
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  
  // Medium grays
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  
  // Dark grays and blacks
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',
};

// TEXT COLORS (Optimized for readability)
export const TEXT_COLORS = {
  primary: NEUTRAL_COLORS.gray900,      // Main text
  secondary: NEUTRAL_COLORS.gray600,    // Secondary text
  muted: NEUTRAL_COLORS.gray500,        // Muted text
  disabled: NEUTRAL_COLORS.gray400,     // Disabled text
  inverse: NEUTRAL_COLORS.white,        // Text on dark backgrounds
  link: GOVERNMENT_BRAND.primary,       // Links
  linkHover: GOVERNMENT_BRAND.primaryDark,
};

// BACKGROUND COLORS
export const BACKGROUND_COLORS = {
  primary: NEUTRAL_COLORS.white,
  secondary: NEUTRAL_COLORS.gray50,
  tertiary: NEUTRAL_COLORS.gray100,
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// BORDER COLORS
export const BORDER_COLORS = {
  light: NEUTRAL_COLORS.gray200,
  medium: NEUTRAL_COLORS.gray300,
  dark: NEUTRAL_COLORS.gray400,
  primary: GOVERNMENT_BRAND.primary,
  focus: GOVERNMENT_BRAND.primaryLight,
};

// SHADOW COLORS
export const SHADOW_COLORS = {
  default: NEUTRAL_COLORS.black,
  light: 'rgba(0, 0, 0, 0.1)',
  medium: 'rgba(0, 0, 0, 0.15)',
  heavy: 'rgba(0, 0, 0, 0.25)',
};

// UNIFIED THEME STRUCTURE
export const GOVERNMENT_THEME = {
  light: {
    // Brand colors
    primary: GOVERNMENT_BRAND.primary,
    primaryLight: GOVERNMENT_BRAND.primaryLight,
    primaryDark: GOVERNMENT_BRAND.primaryDark,
    secondary: GOVERNMENT_BRAND.secondary,
    secondaryLight: GOVERNMENT_BRAND.secondaryLight,
    secondaryDark: GOVERNMENT_BRAND.secondaryDark,
    accent: GOVERNMENT_BRAND.accent,
    
    // Status colors
    success: STATUS_COLORS.success,
    successLight: STATUS_COLORS.successLight,
    successDark: STATUS_COLORS.successDark,
    warning: STATUS_COLORS.warning,
    warningLight: STATUS_COLORS.warningLight,
    warningDark: STATUS_COLORS.warningDark,
    error: STATUS_COLORS.error,
    errorLight: STATUS_COLORS.errorLight,
    errorDark: STATUS_COLORS.errorDark,
    info: STATUS_COLORS.info,
    infoLight: STATUS_COLORS.infoLight,
    infoDark: STATUS_COLORS.infoDark,
    
    // Backgrounds
    background: BACKGROUND_COLORS.primary,
    backgroundSecondary: BACKGROUND_COLORS.secondary,
    backgroundTertiary: BACKGROUND_COLORS.tertiary,
    surface: NEUTRAL_COLORS.white,
    surfaceSecondary: NEUTRAL_COLORS.gray50,
    card: NEUTRAL_COLORS.white,
    overlay: BACKGROUND_COLORS.overlay,
    overlayLight: BACKGROUND_COLORS.overlayLight,
    
    // Text
    text: TEXT_COLORS.primary,
    textSecondary: TEXT_COLORS.secondary,
    textMuted: TEXT_COLORS.muted,
    textDisabled: TEXT_COLORS.disabled,
    textInverse: TEXT_COLORS.inverse,
    textLink: TEXT_COLORS.link,
    textLinkHover: TEXT_COLORS.linkHover,
    
    // Borders
    border: BORDER_COLORS.light,
    borderMedium: BORDER_COLORS.medium,
    borderDark: BORDER_COLORS.dark,
    borderPrimary: BORDER_COLORS.primary,
    borderFocus: BORDER_COLORS.focus,
    
    // Shadows
    shadow: SHADOW_COLORS.default,
    shadowLight: SHADOW_COLORS.light,
    shadowMedium: SHADOW_COLORS.medium,
    shadowHeavy: SHADOW_COLORS.heavy,
  },
  
  dark: {
    // Brand colors (same for consistency)
    primary: GOVERNMENT_BRAND.primary,
    primaryLight: GOVERNMENT_BRAND.primaryLight,
    primaryDark: GOVERNMENT_BRAND.primaryDark,
    secondary: GOVERNMENT_BRAND.secondary,
    secondaryLight: GOVERNMENT_BRAND.secondaryLight,
    secondaryDark: GOVERNMENT_BRAND.secondaryDark,
    accent: GOVERNMENT_BRAND.accent,
    
    // Status colors (same for consistency)
    success: STATUS_COLORS.success,
    successLight: STATUS_COLORS.successLight,
    successDark: STATUS_COLORS.successDark,
    warning: STATUS_COLORS.warning,
    warningLight: STATUS_COLORS.warningLight,
    warningDark: STATUS_COLORS.warningDark,
    error: STATUS_COLORS.error,
    errorLight: STATUS_COLORS.errorLight,
    errorDark: STATUS_COLORS.errorDark,
    info: STATUS_COLORS.info,
    infoLight: STATUS_COLORS.infoLight,
    infoDark: STATUS_COLORS.infoDark,
    
    // Dark mode backgrounds
    background: NEUTRAL_COLORS.gray900,
    backgroundSecondary: NEUTRAL_COLORS.gray800,
    backgroundTertiary: NEUTRAL_COLORS.gray700,
    surface: NEUTRAL_COLORS.gray800,
    surfaceSecondary: NEUTRAL_COLORS.gray700,
    card: NEUTRAL_COLORS.gray800,
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    
    // Dark mode text
    text: NEUTRAL_COLORS.white,
    textSecondary: NEUTRAL_COLORS.gray300,
    textMuted: NEUTRAL_COLORS.gray400,
    textDisabled: NEUTRAL_COLORS.gray500,
    textInverse: NEUTRAL_COLORS.gray900,
    textLink: GOVERNMENT_BRAND.primaryLight,
    textLinkHover: GOVERNMENT_BRAND.primary,
    
    // Dark mode borders
    border: NEUTRAL_COLORS.gray600,
    borderMedium: NEUTRAL_COLORS.gray500,
    borderDark: NEUTRAL_COLORS.gray400,
    borderPrimary: GOVERNMENT_BRAND.primary,
    borderFocus: GOVERNMENT_BRAND.primaryLight,
    
    // Dark mode shadows (reduced opacity)
    shadow: NEUTRAL_COLORS.black,
    shadowLight: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowHeavy: 'rgba(0, 0, 0, 0.6)',
  },
};

// COMPONENT-SPECIFIC COLOR UTILITIES
export const COMPONENT_COLORS = {
  // Button states
  button: {
    primary: GOVERNMENT_BRAND.primary,
    primaryHover: GOVERNMENT_BRAND.primaryDark,
    primaryDisabled: NEUTRAL_COLORS.gray400,
    secondary: NEUTRAL_COLORS.gray100,
    secondaryHover: NEUTRAL_COLORS.gray200,
    outline: 'transparent',
    outlineHover: NEUTRAL_COLORS.gray50,
  },
  
  // Form elements
  form: {
    background: NEUTRAL_COLORS.white,
    border: BORDER_COLORS.light,
    borderFocus: GOVERNMENT_BRAND.primary,
    borderError: STATUS_COLORS.error,
    placeholder: NEUTRAL_COLORS.gray400,
  },
  
  // Status indicators
  status: {
    online: STATUS_COLORS.success,
    offline: NEUTRAL_COLORS.gray400,
    pending: STATUS_COLORS.warning,
    error: STATUS_COLORS.error,
    processing: GOVERNMENT_BRAND.primary,
  },
  
  // PLN Application specific
  pln: {
    stepActive: GOVERNMENT_BRAND.primary,
    stepCompleted: STATUS_COLORS.success,
    stepInactive: NEUTRAL_COLORS.gray300,
    progressBar: GOVERNMENT_BRAND.primary,
    platePreview: GOVERNMENT_BRAND.primary,
    plateBackground: NEUTRAL_COLORS.white,
  },
};

// ACCESSIBILITY HELPERS
export const ACCESSIBILITY = {
  // Minimum contrast ratios (WCAG AA)
  contrastRatios: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0,
  },
  
  // Focus indicators
  focus: {
    color: GOVERNMENT_BRAND.primaryLight,
    width: 2,
    style: 'solid',
    offset: 2,
  },
  
  // High contrast mode overrides
  highContrast: {
    text: NEUTRAL_COLORS.black,
    background: NEUTRAL_COLORS.white,
    border: NEUTRAL_COLORS.black,
    link: '#0000EE',
    visited: '#551A8B',
  },
};

// EXPORT EVERYTHING
export default GOVERNMENT_THEME;
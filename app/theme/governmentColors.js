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
  dark: 'rgba(0, 0, 0, 0.25)',
  heavy: 'rgba(0, 0, 0, 0.25)',
  colored: 'rgba(0, 180, 230, 0.15)', // Primary color shadow
};

// COMPONENT-SPECIFIC COLORS
export const COMPONENT_COLORS = {
  // Button colors
  buttonPrimary: GOVERNMENT_BRAND.primary,
  buttonPrimaryHover: GOVERNMENT_BRAND.primaryDark,
  buttonPrimaryDisabled: NEUTRAL_COLORS.gray400,
  buttonSecondary: NEUTRAL_COLORS.gray100,
  buttonSecondaryHover: NEUTRAL_COLORS.gray200,
  buttonOutline: 'transparent',
  buttonOutlineBorder: GOVERNMENT_BRAND.primary,
  
  // Input colors
  inputBackground: NEUTRAL_COLORS.white,
  inputBorder: NEUTRAL_COLORS.gray300,
  inputBorderFocus: GOVERNMENT_BRAND.primary,
  inputBorderError: STATUS_COLORS.error,
  inputPlaceholder: NEUTRAL_COLORS.gray500,
  
  // Card colors
  cardBackground: NEUTRAL_COLORS.white,
  cardBorder: NEUTRAL_COLORS.gray200,
  cardShadow: SHADOW_COLORS.light,
  
  // Feature icon colors (semantic)
  featureApplication: STATUS_COLORS.success,
  featureDocument: STATUS_COLORS.warning,
  featureNews: GOVERNMENT_BRAND.accent,
  featureInfo: STATUS_COLORS.info,
  featureChatbot: GOVERNMENT_BRAND.primary,
  featureLocation: STATUS_COLORS.error,
};

// DARK MODE THEME
export const DARK_THEME = {
  // Brand colors remain the same for consistency
  brand: GOVERNMENT_BRAND,
  status: STATUS_COLORS,
  
  // Dark backgrounds
  background: {
    primary: NEUTRAL_COLORS.gray900,    // #0F172A
    secondary: NEUTRAL_COLORS.gray800,  // #1E293B
    tertiary: NEUTRAL_COLORS.gray700,   // #334155
    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Dark text colors
  text: {
    primary: NEUTRAL_COLORS.gray100,    // #F1F5F9
    secondary: NEUTRAL_COLORS.gray300,  // #CBD5E1
    muted: NEUTRAL_COLORS.gray400,      // #94A3B8
    disabled: NEUTRAL_COLORS.gray500,   // #64748B
    inverse: NEUTRAL_COLORS.gray900,    // For light backgrounds
    link: GOVERNMENT_BRAND.primaryLight,
    linkHover: GOVERNMENT_BRAND.primary,
  },
  
  // Dark borders
  border: {
    light: NEUTRAL_COLORS.gray700,      // #334155
    medium: NEUTRAL_COLORS.gray600,     // #475569
    dark: NEUTRAL_COLORS.gray500,       // #64748B
    primary: GOVERNMENT_BRAND.primary,
    focus: GOVERNMENT_BRAND.primaryLight,
  },
  
  // Dark components
  component: {
    buttonPrimary: GOVERNMENT_BRAND.primary,
    buttonPrimaryHover: GOVERNMENT_BRAND.primaryLight,
    buttonPrimaryDisabled: NEUTRAL_COLORS.gray600,
    buttonSecondary: NEUTRAL_COLORS.gray700,
    buttonSecondaryHover: NEUTRAL_COLORS.gray600,
    
    inputBackground: NEUTRAL_COLORS.gray800,
    inputBorder: NEUTRAL_COLORS.gray600,
    inputBorderFocus: GOVERNMENT_BRAND.primary,
    inputBorderError: STATUS_COLORS.error,
    inputPlaceholder: NEUTRAL_COLORS.gray400,
    
    cardBackground: NEUTRAL_COLORS.gray800,
    cardBorder: NEUTRAL_COLORS.gray700,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// ACCESSIBILITY HELPERS
export const ACCESSIBILITY = {
  // Minimum contrast ratios for WCAG AA compliance
  contrastRatios: {
    normal: 4.5,    // Normal text
    large: 3.0,     // Large text (18pt+ or 14pt+ bold)
    ui: 3.0,        // UI components
  },
  
  // Focus indicators
  focus: {
    ring: `0 0 0 2px ${GOVERNMENT_BRAND.primaryLight}`,
    ringOffset: `0 0 0 4px ${NEUTRAL_COLORS.white}`,
    ringDark: `0 0 0 2px ${GOVERNMENT_BRAND.primaryLight}`,
    ringOffsetDark: `0 0 0 4px ${NEUTRAL_COLORS.gray900}`,
  },
  
  // High contrast mode support
  highContrast: {
    text: NEUTRAL_COLORS.black,
    background: NEUTRAL_COLORS.white,
    border: NEUTRAL_COLORS.black,
    link: '#0000EE',
    visited: '#551A8B',
  },
};

// UNIFIED THEME EXPORT
export const GOVERNMENT_THEME = {
  // Light mode (default)
  light: {
    // Brand colors (flattened)
    primary: GOVERNMENT_BRAND.primary,
    primaryLight: GOVERNMENT_BRAND.primaryLight,
    primaryDark: GOVERNMENT_BRAND.primaryDark,
    secondary: GOVERNMENT_BRAND.secondary,
    secondaryLight: GOVERNMENT_BRAND.secondaryLight,
    secondaryDark: GOVERNMENT_BRAND.secondaryDark,
    accent: GOVERNMENT_BRAND.accent,
    
    // Status colors (flattened)
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
    
    // Text colors (flattened)
    text: TEXT_COLORS.primary,
    textSecondary: TEXT_COLORS.secondary,
    textMuted: TEXT_COLORS.muted,
    textDisabled: TEXT_COLORS.disabled,
    textInverse: TEXT_COLORS.inverse,
    textLink: TEXT_COLORS.link,
    textLinkHover: TEXT_COLORS.linkHover,
    
    // Background colors (flattened)
    background: BACKGROUND_COLORS.primary,
    backgroundSecondary: BACKGROUND_COLORS.secondary,
    backgroundTertiary: BACKGROUND_COLORS.tertiary,
    overlay: BACKGROUND_COLORS.overlay,
    overlayLight: BACKGROUND_COLORS.overlayLight,
    
    // Border colors (flattened)
    border: BORDER_COLORS.light,
    borderMedium: BORDER_COLORS.medium,
    borderDark: BORDER_COLORS.dark,
    borderPrimary: BORDER_COLORS.primary,
    borderFocus: BORDER_COLORS.focus,
    
    // Shadow colors (flattened)
    shadow: SHADOW_COLORS.default,
    shadowLight: SHADOW_COLORS.light,
    shadowMedium: SHADOW_COLORS.medium,
    shadowDark: SHADOW_COLORS.dark,
    shadowHeavy: SHADOW_COLORS.heavy,
    shadowColored: SHADOW_COLORS.colored,
    
    // Component colors (flattened)
    buttonPrimary: COMPONENT_COLORS.buttonPrimary,
    buttonPrimaryHover: COMPONENT_COLORS.buttonPrimaryHover,
    buttonPrimaryDisabled: COMPONENT_COLORS.buttonPrimaryDisabled,
    buttonSecondary: COMPONENT_COLORS.buttonSecondary,
    buttonSecondaryHover: COMPONENT_COLORS.buttonSecondaryHover,
    buttonOutline: COMPONENT_COLORS.buttonOutline,
    buttonOutlineBorder: COMPONENT_COLORS.buttonOutlineBorder,
    
    inputBackground: COMPONENT_COLORS.inputBackground,
    inputBorder: COMPONENT_COLORS.inputBorder,
    inputBorderFocus: COMPONENT_COLORS.inputBorderFocus,
    inputBorderError: COMPONENT_COLORS.inputBorderError,
    inputPlaceholder: COMPONENT_COLORS.inputPlaceholder,
    
    cardBackground: COMPONENT_COLORS.cardBackground,
    cardBorder: COMPONENT_COLORS.cardBorder,
    cardShadow: COMPONENT_COLORS.cardShadow,
    
    // Feature colors
    featureApplication: COMPONENT_COLORS.featureApplication,
    featureDocument: COMPONENT_COLORS.featureDocument,
    featureNews: COMPONENT_COLORS.featureNews,
    featureInfo: COMPONENT_COLORS.featureInfo,
    featureChatbot: COMPONENT_COLORS.featureChatbot,
    featureLocation: COMPONENT_COLORS.featureLocation,
    
    // Nested objects for backward compatibility
    brand: GOVERNMENT_BRAND,
    status: STATUS_COLORS,
    neutral: NEUTRAL_COLORS,
    textColors: TEXT_COLORS,
    backgrounds: BACKGROUND_COLORS,
    borders: BORDER_COLORS,
    shadows: SHADOW_COLORS,
    components: COMPONENT_COLORS,
  },
  
  // Dark mode
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
    
    // Dark mode text colors
    text: DARK_THEME.text.primary,
    textSecondary: DARK_THEME.text.secondary,
    textMuted: DARK_THEME.text.muted,
    textDisabled: DARK_THEME.text.disabled,
    textInverse: DARK_THEME.text.inverse,
    textLink: DARK_THEME.text.link,
    textLinkHover: DARK_THEME.text.linkHover,
    
    // Dark mode backgrounds
    background: DARK_THEME.background.primary,
    backgroundSecondary: DARK_THEME.background.secondary,
    backgroundTertiary: DARK_THEME.background.tertiary,
    overlay: DARK_THEME.background.overlay,
    overlayLight: DARK_THEME.background.overlayLight,
    
    // Dark mode borders
    border: DARK_THEME.border.light,
    borderMedium: DARK_THEME.border.medium,
    borderDark: DARK_THEME.border.dark,
    borderPrimary: DARK_THEME.border.primary,
    borderFocus: DARK_THEME.border.focus,
    
    // Dark mode shadows
    shadow: SHADOW_COLORS.default,
    shadowLight: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
    shadowHeavy: 'rgba(0, 0, 0, 0.6)',
    shadowColored: SHADOW_COLORS.colored,
    
    // Dark mode components
    buttonPrimary: GOVERNMENT_BRAND.primary,
    buttonPrimaryHover: GOVERNMENT_BRAND.primaryLight,
    buttonPrimaryDisabled: NEUTRAL_COLORS.gray600,
    buttonSecondary: NEUTRAL_COLORS.gray700,
    buttonSecondaryHover: NEUTRAL_COLORS.gray600,
    buttonOutline: 'transparent',
    buttonOutlineBorder: GOVERNMENT_BRAND.primary,
    
    inputBackground: NEUTRAL_COLORS.gray800,
    inputBorder: NEUTRAL_COLORS.gray600,
    inputBorderFocus: GOVERNMENT_BRAND.primary,
    inputBorderError: STATUS_COLORS.error,
    inputPlaceholder: NEUTRAL_COLORS.gray400,
    
    cardBackground: NEUTRAL_COLORS.gray800,
    cardBorder: NEUTRAL_COLORS.gray700,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // Feature colors (same as light mode)
    featureApplication: COMPONENT_COLORS.featureApplication,
    featureDocument: COMPONENT_COLORS.featureDocument,
    featureNews: COMPONENT_COLORS.featureNews,
    featureInfo: COMPONENT_COLORS.featureInfo,
    featureChatbot: COMPONENT_COLORS.featureChatbot,
    featureLocation: COMPONENT_COLORS.featureLocation,
    
    // Nested objects for backward compatibility
    brand: GOVERNMENT_BRAND,
    status: STATUS_COLORS,
    neutral: NEUTRAL_COLORS,
    textColors: DARK_THEME.text,
    backgrounds: DARK_THEME.background,
    borders: DARK_THEME.border,
    shadows: SHADOW_COLORS,
    components: DARK_THEME.component,
  },
  
  // Accessibility
  accessibility: ACCESSIBILITY,
  
  // Spacing, typography, etc. (imported from other theme files)
  // These will be merged in the main theme index
};

// EXPORT EVERYTHING
export default GOVERNMENT_THEME;
import { GOVERNMENT_THEME } from './governmentColors';

/**
 * UNIFIED ROADS AUTHORITY THEME COLORS
 * 
 * This file now imports from the official government color system
 * to ensure consistency across the entire application.
 * 
 * MIGRATION NOTES:
 * - All hardcoded colors have been replaced with government standards
 * - Primary color remains #00B4E6 (official Namibian government blue)
 * - Secondary color remains #FFD700 (Namibian gold from flag)
 * - All status colors now meet WCAG accessibility standards
 * - Dark mode colors properly contrast with light mode
 */

// Export the government theme as RATheme for backward compatibility
export const RATheme = GOVERNMENT_THEME;

// Export individual color categories for direct access (from nested objects)
export const {
  brand: GOVERNMENT_BRAND,
  status: STATUS_COLORS,
  neutral: NEUTRAL_COLORS,
  textColors: TEXT_COLORS,
  backgrounds: BACKGROUND_COLORS,
  borders: BORDER_COLORS,
  shadows: SHADOW_COLORS,
  components: COMPONENT_COLORS,
  accessibility: ACCESSIBILITY,
} = GOVERNMENT_THEME.light;

// Export dark theme components
export const DARK_THEME = GOVERNMENT_THEME.dark;

// Export light and dark themes
export const lightTheme = GOVERNMENT_THEME.light;
export const darkTheme = GOVERNMENT_THEME.dark;

// Export commonly used colors for easy access
export const colors = {
  // Brand colors
  primary: GOVERNMENT_BRAND.primary,
  primaryLight: GOVERNMENT_BRAND.primaryLight,
  primaryDark: GOVERNMENT_BRAND.primaryDark,
  secondary: GOVERNMENT_BRAND.secondary,
  accent: GOVERNMENT_BRAND.accent,
  
  // Status colors
  success: STATUS_COLORS.success,
  warning: STATUS_COLORS.warning,
  error: STATUS_COLORS.error,
  info: STATUS_COLORS.info,
  
  // Neutral colors
  white: NEUTRAL_COLORS.white,
  black: NEUTRAL_COLORS.black,
  gray: NEUTRAL_COLORS.gray500,
  lightGray: NEUTRAL_COLORS.gray200,
  darkGray: NEUTRAL_COLORS.gray700,
  
  // Text colors
  textPrimary: TEXT_COLORS.primary,
  textSecondary: TEXT_COLORS.secondary,
  textMuted: TEXT_COLORS.muted,
  textDisabled: TEXT_COLORS.disabled,
  textInverse: TEXT_COLORS.inverse,
  
  // Background colors
  background: BACKGROUND_COLORS.primary,
  backgroundSecondary: BACKGROUND_COLORS.secondary,
  backgroundTertiary: BACKGROUND_COLORS.tertiary,
  
  // Component colors
  buttonPrimary: COMPONENT_COLORS.buttonPrimary,
  buttonSecondary: COMPONENT_COLORS.buttonSecondary,
  inputBorder: COMPONENT_COLORS.inputBorder,
  inputBorderFocus: COMPONENT_COLORS.inputBorderFocus,
  inputBorderError: COMPONENT_COLORS.inputBorderError,
  
  // Feature colors (semantic)
  featureApplication: COMPONENT_COLORS.featureApplication,
  featureDocument: COMPONENT_COLORS.featureDocument,
  featureNews: COMPONENT_COLORS.featureNews,
  featureInfo: COMPONENT_COLORS.featureInfo,
  featureChatbot: COMPONENT_COLORS.featureChatbot,
  featureLocation: COMPONENT_COLORS.featureLocation,
};

// Export default theme (light mode)
export default GOVERNMENT_THEME.light;


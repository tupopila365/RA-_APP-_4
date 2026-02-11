import { spacing } from './spacing';
import { borderRadius as radii } from './borderRadius';
import { shadows } from './shadows';
import { RATheme } from './colors';
import { typography } from './typography';

/**
 * Design Tokens - Unified Design System
 * 
 * Centralized design tokens for consistent styling across the application.
 * Combines spacing, border radius, shadows, and other design primitives.
 */

// Re-export spacing
export { spacing };

// Re-export border radius as radii (common naming convention)
export { radii };

// Re-export shadows
export { shadows };
export { typography };

// Size tokens for common UI elements
export const sizes = {
  // Touch targets
  touch: 44,
  touchSm: 36,
  touchLg: 52,
  
  // Markers
  markerSm: 24,
  markerMd: 32,
  markerLg: 40,
  
  // Icons
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  
  // Avatars
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 80,
};

// Export colors helper (will be used with theme context)
export const getColors = (colorScheme = 'light') => {
  return RATheme[colorScheme] || RATheme.light;
};

// Export all tokens as a single object
export const designTokens = {
  spacing,
  radii,
  shadows,
  typography,
  sizes,
};

export default designTokens;

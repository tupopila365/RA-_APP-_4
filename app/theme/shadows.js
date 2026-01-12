import { SHADOW_COLORS } from './governmentColors';

/**
 * GOVERNMENT-STANDARD SHADOW SYSTEM
 * 
 * Updated to use the official government color system
 * for consistent shadow colors across all components.
 */

export const shadows = {
  sm: {
    shadowColor: SHADOW_COLORS.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: SHADOW_COLORS.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: SHADOW_COLORS.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: SHADOW_COLORS.default,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const getShadow = (size = 'md') => shadows[size] || shadows.md;

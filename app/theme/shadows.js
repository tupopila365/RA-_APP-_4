import { Platform } from 'react-native';

/**
 * ANDROID-SAFE SHADOW SYSTEM
 * 
 * Updated to prevent Android UI regression issues:
 * - Maximum elevation of 2 for Android
 * - Consistent shadow colors
 * - Platform-specific optimizations
 * - Bank-grade professional appearance
 */

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1, // Android-safe
      },
    }),
  },
  md: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2, // Android-safe maximum
      },
    }),
  },
  // Removed lg and xl variants to prevent excessive elevation
  // Use border-based separation instead for stronger visual hierarchy
};

export const getShadow = (size = 'sm') => shadows[size] || shadows.sm;

// Android-safe elevation helper
export const getAndroidSafeElevation = (desiredElevation) => {
  return Platform.select({
    ios: desiredElevation,
    android: Math.min(desiredElevation, 2), // Cap at 2 for Android
  });
};

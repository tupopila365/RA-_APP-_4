/**
 * Unified Design System - Roads Authority Namibia
 * 
 * This file exports all unified components that enforce the approved design system
 * across the entire application. These components ensure bank-grade, government-ready
 * consistency and must be used instead of custom implementations.
 * 
 * Based on the approved design from locked pages:
 * - HomeScreen, LoginScreen, SettingsScreen
 * - ChatbotScreen, NotificationsScreen, ApplicationsScreen
 * - Welcome/Onboarding screens, Procurement, Create Account
 */

// Core Components
export { GlobalHeader } from './GlobalHeader';
export { UnifiedFormInput } from './UnifiedFormInput';
export { UnifiedCard } from './UnifiedCard';
export { UnifiedButton } from './UnifiedButton';
export { UnifiedSkeletonLoader } from './UnifiedSkeletonLoader';

// Android-Safe Components
export { AndroidSafeCard } from './AndroidSafeCard';

// Theme and Design Tokens
export { useTheme } from '../hooks/useTheme';
export { RATheme } from '../theme/colors';
export { typography } from '../theme/typography';
export { spacing } from '../theme/spacing';

/**
 * Design System Usage Guidelines:
 * 
 * 1. ALWAYS use GlobalHeader for page headers
 * 2. ALWAYS use UnifiedFormInput for all form inputs
 * 3. ALWAYS use UnifiedCard for content containers
 * 4. ALWAYS use UnifiedButton for all buttons
 * 5. ALWAYS use UnifiedSkeletonLoader for loading states
 * 6. ALWAYS use design tokens (colors, typography, spacing)
 * 
 * DO NOT create custom components that duplicate this functionality.
 * DO NOT use hardcoded colors, fonts, or spacing values.
 * DO NOT modify the locked pages or their design patterns.
 */

// Component Import Pattern for Screens:
/*
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  useTheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
*/
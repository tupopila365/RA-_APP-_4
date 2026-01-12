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

// Export individual color categories for direct access
export const {
  GOVERNMENT_BRAND,
  STATUS_COLORS,
  NEUTRAL_COLORS,
  TEXT_COLORS,
  BACKGROUND_COLORS,
  BORDER_COLORS,
  SHADOW_COLORS,
  COMPONENT_COLORS,
  ACCESSIBILITY,
} = require('./governmentColors');


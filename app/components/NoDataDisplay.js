import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from './EmptyState';
import { spacing } from '../theme/spacing';

/**
 * Preset configurations for common "no data" scenarios.
 * Use the preset name to get icon, title, and message automatically.
 */
export const NO_DATA_PRESETS = {
  reports: {
    icon: 'document-outline',
    title: 'No reports yet',
    message: 'You haven\'t submitted any reports yet.',
  },
  news: {
    icon: 'newspaper-outline',
    title: 'No news available',
    message: 'No news articles found.',
  },
  applications: {
    icon: 'document-text-outline',
    title: 'No applications yet',
    message: 'You haven\'t submitted any applications yet.',
  },
  search: {
    icon: 'search-outline',
    title: 'No results found',
    message: 'No items match your search or filters.',
  },
  forms: {
    icon: 'document-text-outline',
    title: 'No forms available',
    message: 'No forms match your criteria.',
  },
  vacancies: {
    icon: 'briefcase-outline',
    title: 'No vacancies available',
    message: 'No job vacancies are currently available.',
  },
  notifications: {
    icon: 'notifications-outline',
    title: 'No notifications',
    message: 'You don\'t have any notifications yet.',
  },
  services: {
    icon: 'construct-outline',
    title: 'No services available',
    message: 'No services match your search.',
  },
  faqs: {
    icon: 'help-circle-outline',
    title: 'No FAQs available',
    message: 'No FAQs match your search.',
  },
  general: {
    icon: 'inbox-outline',
    title: 'No data to display',
    message: 'There is nothing to show here yet.',
  },
};

/**
 * NoDataDisplay - Reusable empty state component for pages with no data
 *
 * Display when a list, table, or content area has no items to show.
 * Can be used with presets or fully customized props.
 *
 * @example
 * // Using a preset
 * <NoDataDisplay preset="reports" />
 *
 * @example
 * // Using a preset with custom action
 * <NoDataDisplay
 *   preset="reports"
 *   actionLabel="Report Road Damage"
 *   onAction={() => navigation.navigate('ReportPothole')}
 * />
 *
 * @example
 * // Fully custom
 * <NoDataDisplay
 *   icon="folder-outline"
 *   title="No documents"
 *   message="Upload documents to get started."
 * />
 *
 * @param {Object} props
 * @param {string} [props.preset] - Preset name (reports, news, applications, search, etc.)
 * @param {string} [props.icon] - Ionicons icon name (overrides preset)
 * @param {string} [props.title] - Title text (overrides preset)
 * @param {string} [props.message] - Message text (overrides preset)
 * @param {string} [props.actionLabel] - Primary button label
 * @param {Function} [props.onAction] - Primary button handler
 * @param {string} [props.secondaryLabel] - Secondary button label
 * @param {Function} [props.onSecondaryAction] - Secondary button handler
 * @param {Object} [props.style] - Container style override
 * @param {string} [props.testID] - Test identifier
 * @param {string} [props.accessibilityLabel] - Accessibility label
 */
export function NoDataDisplay({
  preset,
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  style,
  testID,
  accessibilityLabel,
}) {
  const { colors } = useTheme();

  const presetConfig = preset ? NO_DATA_PRESETS[preset] || NO_DATA_PRESETS.general : null;
  const merged = {
    icon: icon ?? presetConfig?.icon ?? 'inbox-outline',
    title: title ?? presetConfig?.title ?? null,
    message: message ?? presetConfig?.message ?? 'No data to display',
  };

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <EmptyState
        icon={merged.icon}
        title={merged.title}
        message={merged.message}
        primaryActionLabel={actionLabel}
        onPrimaryAction={onAction}
        secondaryActionLabel={secondaryLabel}
        onSecondaryAction={onSecondaryAction}
        accessibilityLabel={accessibilityLabel ?? merged.message}
      />
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 280,
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.lg,
    },
  });

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { LoadingOverlay } from './LoadingOverlay';
import { SpinnerCore } from './SpinnerCore';

/**
 * LoadingIndicator - Reusable loading component with custom enterprise spinner
 *
 * @param {Object} props
 * @param {string} props.size - Size of the spinner ('small' | 'medium' | 'large' | number)
 * @param {string} props.message - Optional message to display below spinner
 * @param {boolean} props.fullScreen - Whether to show as full screen overlay
 * @param {boolean} props.overlay - Whether to show as blocking overlay (banking app style)
 * @param {boolean} props.loading - Controls visibility when overlay is true (default: true)
 * @param {string} props.testID - Test identifier
 * @param {string} props.color - Custom color for spinner (defaults to primary blue)
 *
 * @example
 * <LoadingIndicator />
 * <LoadingIndicator message="Loading data..." />
 * <LoadingIndicator fullScreen size="large" />
 * <LoadingIndicator overlay loading={isLoading} message="Processing..." />
 */
export function LoadingIndicator({
  size = 'large',
  message,
  fullScreen = false,
  overlay = false,
  loading = true,
  testID,
  color,
}) {
  if (overlay) {
    return (
      <LoadingOverlay
        loading={loading}
        message={message}
        size={size}
        color={color}
        testID={testID}
      />
    );
  }

  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;
  const styles = getStyles(colors);

  const content = (
    <View style={styles.container}>
      <SpinnerCore size={size} color={spinnerColor} testID={testID} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return content;
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
    },
    fullScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    message: {
      marginTop: spacing.lg,
      ...typography.body,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

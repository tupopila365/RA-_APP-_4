/**
 * LoadingSpinner - Custom animated loading indicator (enterprise design)
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { SpinnerCore } from './SpinnerCore';
import { LoadingOverlay } from './LoadingOverlay';

export function LoadingSpinner({
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

  const content = (
    <View style={styles.container}>
      <SpinnerCore size={size} color={spinnerColor} testID={testID} />
      {message && <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing.lg,
    ...typography.body,
    fontWeight: '500',
  },
});

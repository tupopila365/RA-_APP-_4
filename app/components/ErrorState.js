import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { UnifiedButton } from './UnifiedButton';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  icon = 'alert-circle',
  testID,
  fullScreen = false,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const content = (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <UnifiedButton
          label="Try Again"
          onPress={onRetry}
          variant="primary"
          style={styles.button}
          accessibilityLabel="Retry loading content"
        />
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <View style={styles.containerOnly} testID={testID} accessibilityLiveRegion="polite">
      {content}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    containerOnly: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.lg,
    },
    fullScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    message: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    button: {
      marginTop: spacing.md,
    },
  });

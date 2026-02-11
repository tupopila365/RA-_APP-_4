import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { UnifiedButton } from './UnifiedButton';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function EmptyState({
  title,
  message = 'No items found',
  icon = 'inbox-outline',
  testID,
  accessibilityLabel,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="none"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={icon} size={64} color={colors.textSecondary} />
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        {primaryActionLabel && onPrimaryAction && (
          <UnifiedButton
            label={primaryActionLabel}
            onPress={onPrimaryAction}
            variant="primary"
            size="medium"
            fullWidth
          />
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <UnifiedButton
            label={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="outline"
            size="medium"
            fullWidth
            style={styles.secondaryButton}
          />
        )}
      </View>
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
    },
    title: {
      marginTop: spacing.sm,
      ...typography.h5,
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      marginTop: spacing.sm,
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    actions: {
      width: '100%',
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    secondaryButton: {
      marginTop: 4,
    },
  });

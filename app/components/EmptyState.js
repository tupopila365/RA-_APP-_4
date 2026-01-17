import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { UnifiedButton } from './UnifiedButton';

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
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="text"
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
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    title: {
      marginTop: 12,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      marginTop: 15,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    actions: {
      width: '100%',
      marginTop: 20,
      gap: 10,
    },
    secondaryButton: {
      marginTop: 4,
    },
  });

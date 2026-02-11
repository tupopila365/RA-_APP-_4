import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedCard } from './UnifiedDesignSystem';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * QuickStatsCard - Displays a single statistic with icon, value, and label
 * Used in the Executive Dashboard for at-a-glance metrics
 * Vertical layout and larger type for readability.
 */
export function QuickStatsCard({ icon, value, label, color, onPress, style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors, color);

  const Content = (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.value} maxFontSizeMultiplier={1.4}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
        <UnifiedCard variant="elevated" padding="large">
          {Content}
        </UnifiedCard>
      </TouchableOpacity>
    );
  }

  return (
    <UnifiedCard variant="elevated" padding="large" style={style}>
      {Content}
    </UnifiedCard>
  );
}

function getStyles(colors, accentColor) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 88,
    },
    iconContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    value: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      paddingHorizontal: spacing.xs,
    },
  });
}

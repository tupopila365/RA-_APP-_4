import React from 'react';
import { Text, StyleSheet, useColorScheme, View } from 'react-native';
import { RATheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function SectionTitle({ title, subtitle, style, containerStyle }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, style]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
  });
























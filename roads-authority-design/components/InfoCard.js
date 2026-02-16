import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { DESIGN_V2_HEADER } from '../designTokens';

export function InfoCard({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  title: {
    ...typography.h5,
    color: DESIGN_V2_HEADER.primary,
    marginBottom: spacing.sm,
  },
  content: {},
});

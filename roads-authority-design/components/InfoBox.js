import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';
import { typography } from '../theme/typography';
import { DESIGN_V2 } from '../designTokens';

export function InfoBox({ children, style }) {
  return <View style={[styles.box, style]}><Text style={styles.text}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: DESIGN_V2.infoBoxBg,
    borderWidth: 1,
    borderColor: DESIGN_V2.infoBoxBorder,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  text: {
    ...typography.bodySmall,
    color: '#1E293B',
  },
});

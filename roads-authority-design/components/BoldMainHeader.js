import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

export function BoldMainHeader({ title, style, titleStyle }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 54,
    lineHeight: 72,
    color: NEUTRAL_COLORS.white,
    textAlign: 'center',
    paddingBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  underline: {
    width: 62,
    height: 4,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.sm,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

export function PLNApplicationInfoScreen({ onBack, onStartApplication }) {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="document-text-outline" size={40} color={PRIMARY} />
      </View>
      <Text style={styles.title}>PLN Application</Text>
      <Text style={styles.subtitle}>
        Apply for a Public Road Transport Permit (PLN) with the Roads Authority.
      </Text>

      <Text style={styles.sectionTitle}>What you need</Text>
      <View style={styles.bulletList}>
        <BulletItem text="Completed application form" />
        <BulletItem text="Vehicle type and seating capacity details" />
        <BulletItem text="Route description or taxi rank information" />
        <BulletItem text="Motivation letter" />
        <BulletItem text="Certified ID and certificate of conduct" />
        <BulletItem text="Application fee payment" />
      </View>

      <Text style={styles.sectionTitle}>Permit types</Text>
      <Text style={styles.body}>
        Domestic road transport, cross-border transport, and abnormal load permits. Applications are processed via a gazette process; objections may be submitted within 21 days of publication.
      </Text>

      <Text style={styles.note}>
        You can submit at any NaTIS regional office or the Windhoek permits office. For enquiries: 061 444 450 or permits@ra.org.na
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => (onStartApplication ? onStartApplication() : onBack?.())}
      >
        <Text style={styles.primaryButtonText}>Start application</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function BulletItem({ text }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name="ellipse" size={6} color={PRIMARY} style={styles.bulletIcon} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  body: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    lineHeight: 22,
  },
  bulletList: {
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bulletIcon: {
    marginRight: spacing.sm,
  },
  bulletText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
  },
  note: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.xxl,
  },
  primaryButtonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
});

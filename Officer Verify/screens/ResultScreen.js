import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ScreenContainer,
  VerifierHeader,
  VerificationBadge,
  LicenceResultCard,
  PrimaryButton,
  SecondaryButton,
} from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

export function ResultScreen({ result, onScanAgain, onDone }) {
  if (!result) return null;

  const { success, message, licence, verifiedAt, scanId, method } = result;

  return (
    <View style={styles.root}>
      <VerifierHeader title="Verification result" onBack={onDone} />
      <ScreenContainer contentContainerStyle={styles.content}>
        <VerificationBadge result={result.result} success={success} />

        <Text style={[styles.message, success ? styles.messageOk : styles.messageBad]}>
          {message}
        </Text>

        {licence ? <LicenceResultCard licence={licence} method={method} /> : null}

        {!success && !licence ? (
          <View style={styles.failCard}>
            <Text style={styles.failTitle}>What to do next</Text>
            <Text style={styles.failItem}>• Ask the driver to generate a new QR code</Text>
            <Text style={styles.failItem}>• Check the countdown is still running</Text>
            <Text style={styles.failItem}>• Request the plastic licence if unsure</Text>
            <Text style={styles.failItem}>• Try manual lookup as a fallback</Text>
          </View>
        ) : null}

        {success && licence ? (
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>Officer check</Text>
            <Text style={styles.reminderText}>
              Confirm the photo and name match the person in front of you before clearing them.
            </Text>
          </View>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>Verified at: {verifiedAt}</Text>
          <Text style={styles.metaText}>Scan ID: {scanId}</Text>
        </View>

        <PrimaryButton label="Scan again" onPress={onScanAgain} enabled />
        <SecondaryButton label="Back to home" onPress={onDone} />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  content: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  messageOk: {
    color: '#166534',
  },
  messageBad: {
    color: '#991B1B',
  },
  failCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    padding: spacing.lg,
  },
  failTitle: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  failItem: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xs,
  },
  reminderCard: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: spacing.lg,
  },
  reminderTitle: {
    ...typography.h5,
    color: '#166534',
    marginBottom: spacing.xs,
  },
  reminderText: {
    ...typography.bodySmall,
    color: '#166534',
  },
  meta: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  OfficialBanner,
  HomeActionCard,
  VerifierHeader,
} from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, OFFICER_HEADER } from '../theme/colors';

export function HomeScreen({ officer, onScan, onManualLookup, onLogout }) {
  return (
    <View style={styles.root}>
      <OfficialBanner />
      <VerifierHeader
        title="RA Verifier"
        includeSafeTop={false}
        rightAction={
          <Pressable onPress={onLogout} hitSlop={12}>
            <Ionicons name="log-out-outline" size={22} color={NEUTRAL_COLORS.white} />
          </Pressable>
        }
      />

      <ScreenContainer contentContainerStyle={styles.content}>
        <View style={styles.officerCard}>
          <View style={styles.officerIcon}>
            <Ionicons name="person-circle-outline" size={40} color={OFFICER_HEADER} />
          </View>
          <View style={styles.officerInfo}>
            <Text style={styles.officerName}>{officer?.name}</Text>
            <Text style={styles.officerMeta}>
              {officer?.organisation} · {officer?.unit}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Verify a licence</Text>

        <HomeActionCard
          icon="qr-code-outline"
          title="Scan QR code"
          subtitle="Scan the live code from the driver's myRA app"
          onPress={onScan}
          accent={PRIMARY}
        />
        <HomeActionCard
          icon="search-outline"
          title="Manual lookup"
          subtitle="Enter licence number if QR scan fails"
          onPress={onManualLookup}
          accent={OFFICER_HEADER}
        />

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={20} color={OFFICER_HEADER} />
          <Text style={styles.tipText}>
            Ask the driver to tap Officer verification only and keep the countdown running.
            Compare their photo with the person in front of you.
          </Text>
        </View>
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
  },
  officerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  officerIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
  },
  officerMeta: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray800,
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  tipText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
  },
});

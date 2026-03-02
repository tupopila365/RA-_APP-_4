import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';

// Mock data – not connected to backend
const MOCK_DRIVER_LICENCE = {
  type: 'Driver licence',
  licenceNumber: '•••• 2847',
  expiryDate: '2026-06-15', // YYYY-MM-DD
};

const MOCK_VEHICLE_LICENCE = {
  type: 'Vehicle licence',
  plateNumber: 'NA 12345',
  expiryDate: '2025-11-30',
};

function daysUntilExpiry(expiryDateStr) {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatExpiryDisplay(expiryDateStr) {
  if (!expiryDateStr) return '—';
  const d = new Date(expiryDateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ExpiryBadge({ daysLeft }) {
  if (daysLeft === null) return null;
  let label;
  let color;
  if (daysLeft > 30) {
    label = `${daysLeft} days left`;
    color = NEUTRAL_COLORS.gray700;
  } else if (daysLeft > 0) {
    label = `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
    color = RA_YELLOW;
  } else if (daysLeft === 0) {
    label = 'Expires today';
    color = RA_YELLOW;
  } else {
    label = `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`;
    color = '#B91C1C';
  }
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function LicenceCard({ iconName, title, subtitle, expiryDate }) {
  const daysLeft = daysUntilExpiry(expiryDate);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={24} color={PRIMARY} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.expiryRow}>
        <Text style={styles.expiryLabel}>Expiry date</Text>
        <Text style={styles.expiryValue}>{formatExpiryDisplay(expiryDate)}</Text>
      </View>
      <ExpiryBadge daysLeft={daysLeft} />
    </View>
  );
}

export function MyLicencesScreen({ onBack }) {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Your driver licence and vehicle licence with days left until expiry. (Demo data – not connected to backend.)
      </Text>

      <LicenceCard
        iconName="id-card-outline"
        title="My licence"
        subtitle={MOCK_DRIVER_LICENCE.licenceNumber}
        expiryDate={MOCK_DRIVER_LICENCE.expiryDate}
      />

      <LicenceCard
        iconName="car-outline"
        title="My car"
        subtitle={MOCK_VEHICLE_LICENCE.plateNumber}
        expiryDate={MOCK_VEHICLE_LICENCE.expiryDate}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 2,
  },
  expiryRow: {
    marginBottom: spacing.sm,
  },
  expiryLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginBottom: 2,
  },
  expiryValue: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray800,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 0,
  },
  badgeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

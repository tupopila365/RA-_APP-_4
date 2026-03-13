import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

// Pure front-end mock data for the NaTIS-style licence card
const MOCK_LICENCE_CARD = {
  cardNumber: '1057 0000 2847',
  cardStatusChanged: '2024-08-21',
  licenceExpiryDate: '2026-08-21',
  licenceStatus: 'Ready for collection',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function LicenceStatusCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopBar}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="id-card-outline" size={22} color={PRIMARY} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Driving licence status</Text>
        </View>
        <Text style={styles.cardSubheading}>Latest Driving Licence status</Text>
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Card Number</Text>
          <Text style={styles.fieldValue}>{MOCK_LICENCE_CARD.cardNumber}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Card Status Changed</Text>
          <Text style={styles.fieldValue}>{formatDate(MOCK_LICENCE_CARD.cardStatusChanged)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Licence Expiry Date</Text>
          <Text style={styles.fieldValue}>{formatDate(MOCK_LICENCE_CARD.licenceExpiryDate)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Licence Status</Text>
          <Text style={[styles.fieldValue, styles.statusValue]}>{MOCK_LICENCE_CARD.licenceStatus}</Text>
        </View>
      </View>
    </View>
  );
}

export function MyLicencesScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <LicenceStatusCard />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: NEUTRAL_COLORS.gray50,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTopBar: {
    marginBottom: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
  },
  cardSubheading: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
  },
  fieldGroup: {
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },
  fieldValue: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    marginLeft: spacing.lg,
  },
  statusValue: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

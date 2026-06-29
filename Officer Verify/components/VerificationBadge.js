import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  NEUTRAL_COLORS,
  VERIFY_VALID,
  VERIFY_VALID_BG,
  VERIFY_INVALID,
  VERIFY_INVALID_BG,
  VERIFY_WARNING,
  VERIFY_WARNING_BG,
} from '../theme/colors';

const STATUS_CONFIG = {
  valid: {
    label: 'VALID',
    icon: 'checkmark-circle',
    color: VERIFY_VALID,
    background: VERIFY_VALID_BG,
  },
  expired: {
    label: 'EXPIRED',
    icon: 'time-outline',
    color: VERIFY_WARNING,
    background: VERIFY_WARNING_BG,
  },
  suspended: {
    label: 'SUSPENDED',
    icon: 'ban-outline',
    color: VERIFY_INVALID,
    background: VERIFY_INVALID_BG,
  },
  revoked: {
    label: 'REVOKED',
    icon: 'close-circle',
    color: VERIFY_INVALID,
    background: VERIFY_INVALID_BG,
  },
  token_expired: {
    label: 'QR EXPIRED',
    icon: 'time-outline',
    color: VERIFY_WARNING,
    background: VERIFY_WARNING_BG,
  },
  token_used: {
    label: 'QR USED',
    icon: 'refresh-outline',
    color: VERIFY_WARNING,
    background: VERIFY_WARNING_BG,
  },
  licence_not_found: {
    label: 'NOT FOUND',
    icon: 'search-outline',
    color: VERIFY_INVALID,
    background: VERIFY_INVALID_BG,
  },
  invalid_format: {
    label: 'INVALID QR',
    icon: 'qr-code-outline',
    color: VERIFY_INVALID,
    background: VERIFY_INVALID_BG,
  },
};

export function VerificationBadge({ result, success }) {
  const key = String(result || '').toLowerCase();
  const config =
    STATUS_CONFIG[key] ||
    (success
      ? STATUS_CONFIG.valid
      : {
          label: 'INVALID',
          icon: 'alert-circle-outline',
          color: VERIFY_INVALID,
          background: VERIFY_INVALID_BG,
        });

  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Ionicons name={config.icon} size={32} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    gap: spacing.sm,
  },
  label: {
    ...typography.h3,
    letterSpacing: 2,
  },
});

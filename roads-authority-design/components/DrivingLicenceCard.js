import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { CoatOfArms } from './CoatOfArms';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';
import {
  buildVerificationPayload,
  formatVerificationTime,
  getRemainingSeconds,
  serializeVerificationPayload,
} from '../services/licenceVerificationService';

const LICENCE = {
  licenceNumber: 'NAM 879912 PE84',
  firstName: 'Peter',
  lastName: 'Kyle',
  age: 'Over 18',
  expiryDate: '21 August 2026',
  code: 'B',
};

const DETAIL_FIELDS = [
  { label: 'Card Number', value: '4832 7195 6604' },
  { label: 'Card Status Changed', value: '21 Aug 2024' },
  { label: 'Licence Expiry Date', value: '21 Aug 2026' },
  { label: 'Licence Status', value: 'Ready for collection' },
  { label: 'Licence Code', value: 'B' },
];

function SecurityPattern() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="diagonalLines" patternUnits="userSpaceOnUse" width={12} height={12} patternTransform="rotate(35)">
          <Line x1={0} y1={0} x2={0} y2={12} stroke={PRIMARY} strokeWidth={1} strokeOpacity={0.06} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#diagonalLines)" />
    </Svg>
  );
}

function Field({ label, value, compact = false }) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function DrivingLicenceCard() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [verificationPayload, setVerificationPayload] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const qrValue = useMemo(
    () => (verificationPayload ? serializeVerificationPayload(verificationPayload) : ''),
    [verificationPayload]
  );

  const generateQr = useCallback(() => {
    const payload = buildVerificationPayload(LICENCE);
    setVerificationPayload(payload);
    setRemainingSeconds(getRemainingSeconds(payload.exp));
    setQrVisible(true);
  }, []);

  useEffect(() => {
    if (!qrVisible || !verificationPayload) return undefined;

    const tick = () => {
      const seconds = getRemainingSeconds(verificationPayload.exp);
      setRemainingSeconds(seconds);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [qrVisible, verificationPayload]);

  const qrExpired = remainingSeconds <= 0;

  return (
    <View style={styles.card}>

      <LinearGradient
        colors={['#007EA4', PRIMARY, '#33C4ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        <View style={styles.headerRow}>
          <CoatOfArms size={42} style={styles.headerCoatOfArms} />
          <View style={styles.headerTextBlock}>
            <Text style={styles.cardHeaderEyebrow}>Republic of Namibia</Text>
            <Text style={styles.cardHeaderText}>Namibian driving licence</Text>
          </View>
          <Image
            source={require('../assets/Flag_of_Namibia.svg.png')}
            style={styles.headerFlag}
            resizeMode="cover"
            accessibilityLabel="Namibia flag"
          />
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        <SecurityPattern />
        <View style={styles.decorOrb} />

        <View style={styles.licencePlate}>
          <View style={styles.licenceNumberBlock}>
            <Text style={styles.fieldLabel}>Licence number</Text>
            <Text style={styles.licenceNumber}>{LICENCE.licenceNumber}</Text>
          </View>
          <View style={styles.validChip}>
            <Ionicons name="shield-checkmark" size={14} color={PRIMARY} />
            <Text style={styles.validChipText}>Valid</Text>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.photoFrame}>
            <Image
              source={require('../assets/passport.jpg')}
              style={styles.photo}
              resizeMode="cover"
              accessibilityLabel="Licence holder photo"
            />
          </View>
          <View style={styles.mainFields}>
            <View style={styles.fieldCard}>
              <Field label="First name" value={LICENCE.firstName} compact />
            </View>
            <View style={styles.fieldCard}>
              <Field label="Last name" value={LICENCE.lastName} compact />
            </View>
          </View>
        </View>

        <View style={styles.bottomFields}>
          <View style={[styles.fieldCard, styles.halfField]}>
            <Field label="Age" value={LICENCE.age} compact />
          </View>
          <View style={[styles.fieldCard, styles.halfField]}>
            <Field label="Date of expiry" value={LICENCE.expiryDate} compact />
          </View>
        </View>

        <Pressable
          style={styles.generateQrButton}
          onPress={generateQr}
          accessibilityRole="button"
          accessibilityLabel="Generate QR code for officer verification"
        >
          <Ionicons name="qr-code-outline" size={18} color={PRIMARY} />
          <Text style={styles.generateQrButtonText}>Generate QR code</Text>
        </Pressable>
        <Text style={styles.generateQrHint}>
          For official verification by traffic officers only.
        </Text>

        <View style={styles.divider} />

        <Pressable
          style={styles.detailsToggle}
          onPress={() => setDetailsOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={detailsOpen ? 'Hide details' : 'Show details'}
        >
          <View style={styles.detailsIconWrap}>
            <Ionicons
              name={detailsOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={NEUTRAL_COLORS.white}
            />
          </View>
          <Text style={styles.detailsToggleText}>
            {detailsOpen ? 'Hide details' : 'Show details'}
          </Text>
        </Pressable>

        {detailsOpen ? (
          <View style={styles.detailsBlock}>
            {DETAIL_FIELDS.map((field, index) => (
              <View key={field.label}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{field.label}</Text>
                  <Text style={styles.detailValue}>{field.value}</Text>
                </View>
                {index < DETAIL_FIELDS.length - 1 ? <View style={styles.detailDivider} /> : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footerDivider} />

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <CoatOfArms size={44} />
            <View style={styles.footerMeta}>
              <Text style={styles.footerTitle}>NaTIS</Text>
              <Text style={styles.footerSubtitle}>Roads Authority Namibia</Text>
            </View>
          </View>
          <View style={styles.hologram}>
            <CoatOfArms size={26} />
          </View>
        </View>
      </View>

      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <View style={styles.qrModalBackdrop}>
          <View style={styles.qrModalCard}>
            <Text style={styles.qrModalTitle}>Officer verification</Text>
            <Text style={styles.qrModalSubtitle}>
              Ask the officer to scan this code with the NaTIS Verify app.
            </Text>

            <View style={[styles.qrFrame, qrExpired && styles.qrFrameExpired]}>
              {qrValue && !qrExpired ? (
                <QRCode value={qrValue} size={220} color={NEUTRAL_COLORS.gray900} backgroundColor={NEUTRAL_COLORS.white} />
              ) : (
                <View style={styles.qrExpiredState}>
                  <Ionicons name="time-outline" size={42} color={NEUTRAL_COLORS.gray500} />
                  <Text style={styles.qrExpiredText}>QR code expired</Text>
                </View>
              )}
            </View>

            <Text style={styles.qrLicenceNumber}>{LICENCE.licenceNumber}</Text>

            {verificationPayload ? (
              <Text style={styles.qrMetaText}>
                Generated at {formatVerificationTime(verificationPayload.iat)}
              </Text>
            ) : null}

            <Text style={[styles.qrCountdown, qrExpired && styles.qrCountdownExpired]}>
              {qrExpired ? 'Expired' : `Expires in 0:${String(remainingSeconds).padStart(2, '0')}`}
            </Text>

            <Pressable
              style={[styles.qrPrimaryButton, !qrExpired && styles.qrPrimaryButtonDisabled]}
              onPress={qrExpired ? generateQr : undefined}
              disabled={!qrExpired}
            >
              <Text style={[styles.qrPrimaryButtonText, !qrExpired && styles.qrPrimaryButtonTextDisabled]}>
                {qrExpired ? 'Generate new QR code' : 'QR active'}
              </Text>
            </Pressable>

            <Pressable style={styles.qrCloseButton} onPress={() => setQrVisible(false)}>
              <Text style={styles.qrCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#003D52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  cardHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCoatOfArms: {
    flexShrink: 0,
  },
  headerTextBlock: {
    flex: 1,
  },
  cardHeaderEyebrow: {
    ...typography.caption,
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardHeaderText: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
    fontSize: 17,
    lineHeight: 24,
  },
  headerFlag: {
    width: 48,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cardBody: {
    backgroundColor: '#E8F6FC',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  decorOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: RA_YELLOW + '18',
    top: -30,
    right: -35,
  },
  licencePlate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: PRIMARY + '30',
    gap: spacing.sm,
  },
  licenceNumberBlock: {
    flex: 1,
  },
  licenceNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    lineHeight: 28,
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 1,
    marginTop: 2,
  },
  validChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY + '14',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY + '35',
  },
  validChipText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: PRIMARY,
  },
  mainRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoFrame: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  photo: {
    width: 84,
    height: 104,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  mainFields: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  bottomFields: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  generateQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: NEUTRAL_COLORS.white,
    marginBottom: spacing.xs,
  },
  generateQrButtonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
  },
  generateQrHint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  fieldCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 10,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  field: {
    gap: 2,
  },
  fieldCompact: {
    gap: 1,
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 11,
    color: NEUTRAL_COLORS.gray500,
    fontFamily: 'Poppins_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldValue: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: NEUTRAL_COLORS.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: PRIMARY + '25',
    marginBottom: spacing.md,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailsIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsToggleText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_500Medium',
    color: NEUTRAL_COLORS.gray800,
  },
  detailsBlock: {
    marginTop: spacing.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: PRIMARY + '22',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    flex: 1,
  },
  detailValue: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_500Medium',
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'right',
    flex: 1,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  footerDivider: {
    height: 1,
    backgroundColor: PRIMARY + '20',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  footerMeta: {
    flex: 1,
  },
  footerTitle: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.6,
  },
  footerSubtitle: {
    ...typography.caption,
    fontSize: 10,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 1,
  },
  hologram: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY + '12',
    borderWidth: 1,
    borderColor: PRIMARY + '30',
  },
  qrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  qrModalTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.xs,
  },
  qrModalSubtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  qrFrame: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.md,
  },
  qrFrameExpired: {
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderColor: NEUTRAL_COLORS.gray300,
  },
  qrExpiredState: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  qrExpiredText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontFamily: 'Poppins_500Medium',
  },
  qrLicenceNumber: {
    ...typography.body,
    fontFamily: 'Poppins_700Bold',
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  qrMetaText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xs,
  },
  qrCountdown: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
    marginBottom: spacing.md,
  },
  qrCountdownExpired: {
    color: '#B45309',
  },
  qrPrimaryButton: {
    minHeight: 44,
    width: '100%',
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  qrPrimaryButtonDisabled: {
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  qrPrimaryButtonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
  },
  qrPrimaryButtonTextDisabled: {
    color: NEUTRAL_COLORS.gray600,
  },
  qrCloseButton: {
    paddingVertical: spacing.sm,
  },
  qrCloseButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontFamily: 'Poppins_500Medium',
  },
});

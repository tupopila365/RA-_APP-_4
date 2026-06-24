import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const NOTICE_LINES = [
  'The screen below provides particulars of a vehicle/s that are due to be renewed.',
  'Important to note: You may ONLY renew a motor vehicle licence of which you are the registered OWNER.',
  'Should no vehicle be listed below, you may search for the vehicle by entering the vehicle register number or the vehicle licence number (number plate).',
  'If your motor vehicle licence has expired, it will also display on the screen below.',
  'If you have moved to another province, you must apply in person, at the Appropriate Registrating Authority for the licensing of your vehicle, where you will be issued with a new licence number (mark) applicable to your new province.',
  'The Annual Renewal of Personalised Licence Number (PLN) and Mass Distance Charges fee (MDC) must be paid before continuing with the renewal of vehicle licence disc. Failure to renew will result in no issuance of the vehicle disc.',
];

export function VehiclesDueForRenewalScreen() {
  const [noticeExpanded, setNoticeExpanded] = React.useState(true);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerWrap}>
        <Text style={styles.pageTitle}>Vehicle Disk Renewal</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.pageSubtitle}>Vehicles due for renewal</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.noticeBox}>
          <Pressable
            style={({ pressed }) => [styles.noticeHeader, pressed && styles.noticeHeaderPressed]}
            onPress={() => setNoticeExpanded((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Toggle vehicle renewal notice"
          >
            <Text style={styles.noticeTitle}>Motor Vehicle Licence Renewal Notice:</Text>
            <Ionicons
              name={noticeExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={NEUTRAL_COLORS.gray500}
            />
          </Pressable>
          {noticeExpanded ? (
            <View style={styles.noticeBody}>
              {NOTICE_LINES.map((line) => (
                <View key={line} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.filterBox}>
          <Text style={styles.filterText}>
            Filter using either register number, vin/chassis number, licence number
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, styles.makeCol]}>Make</Text>
            <Text style={[styles.headerCell, styles.modelCol]}>Model</Text>
            <Text style={[styles.headerCell, styles.licenceCol]}>Licence Number</Text>
            <Text style={[styles.headerCell, styles.registerCol]}>Register number</Text>
            <Text style={[styles.headerCell, styles.chassisCol]}>Chassis Number</Text>
            <Text style={[styles.headerCell, styles.expiryCol]}>Licence Expiry Date</Text>
            <Text style={[styles.headerCell, styles.checkboxCol]}> </Text>
          </View>

          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={26} color={NEUTRAL_COLORS.gray500} />
            <Text style={styles.emptyTitle}>No vehicles due for renewal</Text>
            <Text style={styles.emptyCaption}>Check back later or add new vehicles.</Text>
          </View>

          <View style={styles.tableFooter}>
            <Text style={styles.footerText}>Items per page: </Text>
            <View style={styles.pageSizeBadge}>
              <Text style={styles.pageSizeText}>30</Text>
              <Ionicons name="chevron-down" size={14} color={NEUTRAL_COLORS.gray600} />
            </View>
            <Text style={styles.footerText}>0 of 0</Text>
            <Ionicons name="play-skip-back" size={14} color={NEUTRAL_COLORS.gray400} />
            <Ionicons name="chevron-back" size={14} color={NEUTRAL_COLORS.gray400} />
            <Ionicons name="chevron-forward" size={14} color={NEUTRAL_COLORS.gray400} />
            <Ionicons name="play-skip-forward" size={14} color={NEUTRAL_COLORS.gray400} />
          </View>
        </View>

        <View style={styles.renewBtn}>
          <Text style={styles.renewBtnText}>Renew selected vehicles</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    ...typography.h3,
    color: NEUTRAL_COLORS.gray800,
  },
  titleUnderline: {
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray600,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 8,
    padding: spacing.md,
  },
  noticeBox: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  noticeHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noticeHeaderPressed: {
    opacity: 0.82,
  },
  noticeTitle: {
    ...typography.bodySmall,
    color: '#E11D48',
    fontFamily: 'Poppins_600SemiBold',
  },
  noticeBody: {
    marginTop: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    marginRight: 6,
    marginTop: 2,
  },
  bulletText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
    lineHeight: 18,
  },
  filterBox: {
    backgroundColor: '#E8EDF5',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  filterText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
  table: {
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    minHeight: 36,
  },
  headerCell: {
    ...typography.caption,
    color: NEUTRAL_COLORS.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: 6,
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  makeCol: { flex: 1.1 },
  modelCol: { flex: 1.1 },
  licenceCol: { flex: 1.25 },
  registerCol: { flex: 1.25 },
  chassisCol: { flex: 1.4 },
  expiryCol: { flex: 1.5 },
  checkboxCol: {
    width: 28,
    textAlign: 'center',
  },
  emptyState: {
    minHeight: 170,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray700,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  emptyCaption: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
  },
  tableFooter: {
    minHeight: 42,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
  },
  pageSizeBadge: {
    minWidth: 52,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pageSizeText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
  },
  renewBtn: {
    marginTop: spacing.md,
    marginLeft: 'auto',
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  renewBtnText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    fontFamily: 'Poppins_500Medium',
  },
});


import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard, UnifiedButton } from '../components';
import { GlobalHeader } from '../components/UnifiedDesignSystem';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Debit / Credit Card', icon: 'card-outline' },
  { id: 'mobile', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { id: 'bank', label: 'Bank Transfer', icon: 'business-outline' },
];

const PLN_AMOUNT = 2000;

export default function PaymentScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route?.params || {};

  const referenceId = params.referenceId || '';
  const amount = params.amount != null ? Number(params.amount) : PLN_AMOUNT;
  const description = params.description || 'Personalised Number Plates (PLN)';

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);
  const bg = colors.backgroundSecondary || colors.background;

  const handlePay = async () => {
    if (!selectedMethod) return;
    setProcessing(true);
    // Simulate payment processing - replace with real payment gateway integration
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setSuccess(true);
  };

  const handleBackToApplications = () => {
    navigation.navigate('MyApplications');
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
        <GlobalHeader
          title="Payment"
          subtitle="Complete"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.successScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successWrap}>
            <View style={[styles.successIconWrap, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Payment submitted</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Your payment of N${amount.toLocaleString()} has been received. Your application will be processed and you will be notified when your plates are ready for collection.
            </Text>
            {referenceId ? (
              <Text style={[styles.refText, { color: colors.textMuted }]}>Reference: {referenceId}</Text>
            ) : null}
            <UnifiedCard variant="outlined" padding="large" style={styles.successActionsCard}>
              <UnifiedButton
                label="Back to My Applications"
                variant="primary"
                size="medium"
                onPress={handleBackToApplications}
                iconName="arrow-back"
                iconPosition="left"
                fullWidth
                style={styles.successButton}
              />
              <UnifiedButton
                label="Done"
                variant="outline"
                size="medium"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                iconName="home-outline"
                iconPosition="left"
                fullWidth
                style={styles.successButtonSecondary}
              />
            </UnifiedCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <GlobalHeader
        title="Payment"
        subtitle="Roads Authority · Secure"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageIntro}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Complete payment</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Official payment for Roads Authority services. Select a method and confirm below.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionLabelFirst, { color: colors.textMuted }]}>PAYMENT SUMMARY</Text>
        <UnifiedCard variant="default" padding="large" style={styles.summaryCard}>
          {referenceId ? (
            <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Reference</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]} selectable numberOfLines={1}>
                {referenceId}
              </Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Description</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>{description}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>Amount due</Text>
            <Text style={[styles.amountValue, { color: colors.primary }]}>N$ {amount.toLocaleString()}</Text>
          </View>
        </UnifiedCard>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PAYMENT METHOD</Text>
        <UnifiedCard variant="default" padding="none" style={styles.methodsCard}>
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selectedMethod === method.id;
            const isLast = index === PAYMENT_METHODS.length - 1;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.7}
                onPress={() => setSelectedMethod(method.id)}
                style={[
                  styles.methodRow,
                  !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  isSelected && { backgroundColor: colors.primary + '0C' },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={[styles.methodIconWrap, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name={method.icon} size={22} color={isSelected ? colors.primary : colors.textSecondary} />
                </View>
                <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : (
                  <View style={styles.methodRadio} />
                )}
              </TouchableOpacity>
            );
          })}
        </UnifiedCard>

        <View style={[styles.trustBar, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>
            Secured by Roads Authority. Your payment details are protected and not stored.
          </Text>
        </View>

        <UnifiedButton
          label={processing ? 'Processing…' : `Pay N$ ${amount.toLocaleString()}`}
          onPress={handlePay}
          variant="primary"
          size="large"
          loading={processing}
          disabled={!selectedMethod || processing}
          iconName="lock-closed"
          iconPosition="left"
          fullWidth
          style={styles.payButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: spacing.xxl,
      paddingBottom: spacing.xxxl * 2,
    },
    pageIntro: {
      marginBottom: spacing.xxl,
    },
    pageTitle: {
      ...typography.h4,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    pageSubtitle: {
      ...typography.bodySmall,
      lineHeight: 22,
    },
    sectionLabel: {
      ...typography.label,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      marginTop: spacing.xl,
    },
    sectionLabelFirst: {
      marginTop: spacing.lg,
    },
    summaryCard: {
      marginBottom: 0,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: 0,
    },
    summaryKey: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      flex: 0,
      marginRight: spacing.md,
    },
    summaryValue: {
      ...typography.body,
      fontWeight: '500',
      flex: 1,
      textAlign: 'right',
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.lg,
      marginTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    amountLabel: {
      ...typography.body,
      fontWeight: '600',
    },
    amountValue: {
      ...typography.h4,
      fontWeight: '700',
    },
    methodsCard: {
      marginBottom: 0,
      overflow: 'hidden',
    },
    methodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      minHeight: 56,
    },
    methodIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    methodLabel: {
      ...typography.body,
      fontWeight: '500',
      flex: 1,
    },
    methodRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
    },
    trustBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
      borderRadius: 10,
      gap: spacing.sm,
    },
    trustText: {
      ...typography.caption,
      flex: 1,
      lineHeight: 18,
    },
    payButton: {
      marginTop: spacing.sm,
    },
    successScrollContent: {
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: spacing.xxxl * 2,
    },
    successWrap: {
      alignItems: 'center',
      paddingTop: spacing.xxl,
    },
    successIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    successTitle: {
      ...typography.h3,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    successMessage: {
      ...typography.body,
      textAlign: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
      lineHeight: 22,
    },
    refText: {
      ...typography.caption,
      marginBottom: spacing.xl,
    },
    successActionsCard: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    successButton: {
      marginBottom: spacing.sm,
    },
    successButtonSecondary: {
      marginBottom: 0,
    },
  });
}

PaymentScreen.options = {
  headerShown: false,
};

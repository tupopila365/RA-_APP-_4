import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { FormInput } from '../components/FormInput';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { confirmPayment } from '../services/plnService';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCardNumber(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

function formatCvv(value) {
  return (value || '').replace(/\D/g, '').slice(0, 4);
}

export function PaymentScreen({ application, onBack, onPaymentSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  if (!application) return null;

  const amount = application.paymentAmount != null && application.paymentAmount > 0
    ? `N$ ${Number(application.paymentAmount).toFixed(2)}`
    : 'As per notification';

  const validate = () => {
    const next = {};
    const digitsOnly = cardNumber.replace(/\s/g, '');
    if (digitsOnly.length < 16) next.cardNumber = 'Enter a valid card number';
    if (!expiry || expiry.length < 5) next.expiry = 'Enter MM/YY';
    if (!cvv || cvv.length < 3) next.cvv = 'Required';
    if (!cardholderName?.trim()) next.cardholderName = 'Enter cardholder name';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    setSubmitError(null);
    try {
      // In production you would first call your payment gateway, then confirm with backend after success
      await confirmPayment(application.id);
      setPaymentComplete(true);
    } catch (err) {
      setSubmitError(err.message || 'Payment could not be recorded. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToApplication = () => {
    if (onPaymentSuccess) onPaymentSuccess();
    else onBack();
  };

  if (paymentComplete) {
    return (
      <ScreenContainer contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={72} color={PRIMARY} />
          </View>
          <Text style={styles.successTitle}>Payment submitted</Text>
          <Text style={styles.successMessage}>
            Your payment for application {application.referenceNumber} has been recorded. You can track status under My Applications.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={handleBackToApplication}
          >
            <Text style={styles.primaryButtonText}>Back to application</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.secureRow}>
              <Ionicons name="lock-closed" size={18} color={NEUTRAL_COLORS.gray600} />
              <Text style={styles.secureText}>Secure payment</Text>
            </View>

            <Text style={styles.sectionTitle}>Order summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Reference</Text>
              <Text style={styles.summaryValue} selectable>{application.referenceNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Description</Text>
              <Text style={styles.summaryValue}>{application.type || 'PLN Application'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount due</Text>
              <Text style={[styles.summaryValue, styles.amountValue]}>{amount}</Text>
            </View>
            {application.paymentDeadline ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pay by</Text>
                <Text style={styles.summaryValue}>{formatDate(application.paymentDeadline)}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Card details</Text>
            <FormInput
              label="Card number"
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
              error={errors.cardNumber}
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <FormInput
                  label="Expiry (MM/YY)"
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  error={errors.expiry}
                />
              </View>
              <View style={styles.half}>
                <FormInput
                  label="CVV"
                  value={cvv}
                  onChangeText={(t) => setCvv(formatCvv(t))}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  error={errors.cvv}
                />
              </View>
            </View>
            <FormInput
              label="Cardholder name"
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="As on card"
              autoCapitalize="words"
              error={errors.cardholderName}
            />

            {submitError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={NEUTRAL_COLORS.white} />
                <Text style={styles.errorBannerText}>{submitError}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (submitting || pressed) && styles.buttonPressed,
                submitting && styles.primaryButtonDisabled,
              ]}
              onPress={handlePay}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={NEUTRAL_COLORS.white} />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color={NEUTRAL_COLORS.white} />
                  <Text style={styles.primaryButtonText}>Pay {amount}</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.disclaimer}>
              Your payment is processed securely. In production this would connect to a certified payment gateway.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={PRIMARY} />
          <Text style={styles.backButtonText}>Back to application</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.xxxl },
  keyboardView: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  secureText: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray600 },
  sectionTitle: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray600 },
  summaryValue: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray900, flex: 1, marginLeft: spacing.md, textAlign: 'right' },
  amountValue: { fontWeight: '700', fontSize: 18 },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: PRIMARY,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    marginTop: spacing.md,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { ...typography.button, color: NEUTRAL_COLORS.white },
  buttonPressed: { opacity: 0.85 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#B91C1C',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  errorBannerText: { ...typography.bodySmall, color: NEUTRAL_COLORS.white, flex: 1 },
  disclaimer: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  backButtonText: { ...typography.body, fontWeight: '600', color: PRIMARY },
  successIconWrap: { alignItems: 'center', marginBottom: spacing.lg },
  successTitle: { ...typography.h4, color: NEUTRAL_COLORS.gray900, textAlign: 'center', marginBottom: spacing.sm },
  successMessage: { ...typography.body, color: NEUTRAL_COLORS.gray600, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
});

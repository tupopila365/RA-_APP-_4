import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { validate, getErrorMessage } from '../utils/validation';
import { authService } from '../services/authService';
import { GlobalHeader } from '../components/GlobalHeader';
import { UnifiedFormInput } from '../components/UnifiedFormInput';
import { UnifiedCard } from '../components/UnifiedCard';
import { UnifiedButton } from '../components/UnifiedButton';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const STEP_SEND_OTP = 1;
const STEP_VERIFY_AND_CHANGE = 2;

export default function ChangePasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(STEP_SEND_OTP);
  const [currentPassword, setCurrentPassword] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const validateField = (fieldName, value, rules) => {
    const fieldErrors = validate(value, rules);
    if (fieldErrors.length === 0) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
      return true;
    }
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    let errorRule = 'required';
    if (rules.required && (!trimmedValue || trimmedValue.length === 0)) {
      errorRule = 'required';
    } else if (rules.minLength && trimmedValue && trimmedValue.length < rules.minLength) {
      errorRule = 'minLength';
    }
    setErrors((prev) => ({
      ...prev,
      [fieldName]: getErrorMessage(fieldName, errorRule),
    }));
    return false;
  };

  const validateStep1 = () => {
    return validateField('Current password', currentPassword, { required: true });
  };

  const validateStep2 = () => {
    let isValid = true;
    isValid = validateField('Verification code', otp, { required: true }) && isValid;
    isValid = validateField('New password', newPassword, { required: true, minLength: 8 }) && isValid;
    isValid = validateField('Confirm password', confirmPassword, { required: true }) && isValid;

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, 'Confirm password': 'Passwords do not match' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, 'Confirm password': null }));
    }

    if (newPassword && currentPassword && newPassword === currentPassword) {
      setErrors((prev) => ({
        ...prev,
        'New password': 'New password must be different from current password',
      }));
      isValid = false;
    }

    return isValid;
  };

  const handleSendOtp = async () => {
    if (!validateStep1()) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const data = await authService.sendChangePasswordOtp(currentPassword);
      setPhoneMasked(data.phoneMasked || 'your phone');
      setStep(STEP_VERIFY_AND_CHANGE);
      setOtp('');
    } catch (error) {
      const message = error.message || 'Failed to send verification code.';
      if (message.toLowerCase().includes('current') || message.toLowerCase().includes('incorrect')) {
        setErrors((prev) => ({ ...prev, 'Current password': 'Current password is incorrect' }));
      } else if (message.toLowerCase().includes('phone')) {
        Alert.alert('Error', message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!currentPassword.trim()) return;
    setResendLoading(true);
    setErrors({});
    try {
      const data = await authService.sendChangePasswordOtp(currentPassword);
      setPhoneMasked(data.phoneMasked || 'your phone');
      Alert.alert('Code sent', 'A new verification code has been sent to your phone.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validateStep2()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authService.changePassword(otp.trim(), newPassword);
      Alert.alert(
        'Password changed',
        'Your password has been updated successfully. Use your new password the next time you sign in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      const message = error.message || 'Failed to change password. Please try again.';
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('expired')) {
        setErrors((prev) => ({ ...prev, 'Verification code': 'Invalid or expired code. Request a new one.' }));
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === STEP_VERIFY_AND_CHANGE) {
      setStep(STEP_SEND_OTP);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } else {
      navigation.goBack();
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <GlobalHeader
          title="Change password"
          showBackButton
          onBackPress={handleBack}
          variant="light"
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome section */}
            <View style={styles.welcomeSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Update your password securely</Text>
              <Text style={styles.welcomeSubtitle}>
                {step === STEP_SEND_OTP
                  ? 'We’ll verify your identity with a code sent to your registered phone.'
                  : `Enter the 6-digit code we sent to ${phoneMasked} and choose your new password.`}
              </Text>

              {/* Step indicator */}
              <View style={styles.stepIndicator}>
                <View style={[styles.stepPill, step === STEP_SEND_OTP && styles.stepPillActive]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={step >= STEP_SEND_OTP ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.stepText, step === STEP_SEND_OTP && styles.stepTextActive]}>
                    Step 1
                  </Text>
                </View>
                <View style={styles.stepConnector} />
                <View style={[styles.stepPill, step === STEP_VERIFY_AND_CHANGE && styles.stepPillActive]}>
                  <Ionicons
                    name={step === STEP_VERIFY_AND_CHANGE ? 'keypad' : 'keypad-outline'}
                    size={16}
                    color={step === STEP_VERIFY_AND_CHANGE ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.stepText, step === STEP_VERIFY_AND_CHANGE && styles.stepTextActive]}>
                    Step 2
                  </Text>
                </View>
              </View>
            </View>

            {/* Form card */}
            <View style={styles.formWrapper}>
              <UnifiedCard variant="elevated" padding="large">
                {step === STEP_SEND_OTP ? (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: 0 }]}>Verify identity</Text>
                    <UnifiedFormInput
                      label="Current password"
                      value={currentPassword}
                      onChangeText={(text) => {
                        setCurrentPassword(text);
                        validateField('Current password', text, { required: true });
                      }}
                      placeholder="Enter current password"
                      error={errors['Current password']}
                      secureTextEntry
                      leftIcon="lock-closed-outline"
                      required
                    />

                    <UnifiedButton
                      label="Send verification code"
                      onPress={handleSendOtp}
                      variant="primary"
                      size="large"
                      iconName="phone-portrait-outline"
                      iconPosition="right"
                      loading={loading}
                      disabled={loading}
                      fullWidth
                      style={styles.primaryButton}
                    />
                  </>
                ) : (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: 0 }]}>Verification code</Text>
                    <UnifiedFormInput
                      label="6-digit code"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text.replace(/\D/g, '').slice(0, 6));
                        validateField('Verification code', text, { required: true });
                      }}
                      placeholder="000000"
                      error={errors['Verification code']}
                      keyboardType="number-pad"
                      maxLength={6}
                      leftIcon="keypad-outline"
                      required
                    />

                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={resendLoading}
                      style={styles.resendButton}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={18}
                        color={resendLoading ? colors.textSecondary : colors.primary}
                      />
                      <Text
                        style={[
                          styles.resendText,
                          resendLoading && styles.resendTextDisabled,
                        ]}
                      >
                        {resendLoading ? 'Sending…' : 'Resend code'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>New password</Text>
                    <Text style={styles.hint}>At least 8 characters</Text>
                    <UnifiedFormInput
                      label="New password"
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        validateField('New password', text, { required: true, minLength: 8 });
                      }}
                      placeholder="Enter new password"
                      error={errors['New password']}
                      secureTextEntry
                      leftIcon="lock-closed-outline"
                      required
                    />

                    <UnifiedFormInput
                      label="Confirm new password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors((prev) => ({
                          ...prev,
                          'Confirm password': text && text !== newPassword ? 'Passwords do not match' : null,
                        }));
                      }}
                      placeholder="Re-enter new password"
                      error={errors['Confirm password']}
                      secureTextEntry
                      leftIcon="lock-closed-outline"
                      required
                    />

                    <UnifiedButton
                      label="Update password"
                      onPress={handleChangePassword}
                      variant="primary"
                      size="large"
                      iconName="checkmark-circle-outline"
                      iconPosition="right"
                      loading={loading}
                      disabled={loading}
                      fullWidth
                      style={styles.primaryButton}
                    />
                  </>
                )}
              </UnifiedCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl + 24,
    },
    welcomeSection: {
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
      alignItems: 'center',
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface || colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    welcomeTitle: {
      ...typography.h4,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    welcomeSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    stepPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 20,
      backgroundColor: colors.surface || colors.background,
    },
    stepPillActive: {
      backgroundColor: colors.primary + '18',
    },
    stepText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    stepTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    stepConnector: {
      width: 24,
      height: 2,
      backgroundColor: colors.border,
      borderRadius: 1,
    },
    formWrapper: {
      maxWidth: 420,
      width: '100%',
      alignSelf: 'center',
    },
    sectionLabel: {
      ...typography.label,
      fontSize: 13,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.lg,
      marginHorizontal: -spacing.lg,
    },
    primaryButton: {
      marginTop: spacing.xl,
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.lg,
    },
    resendText: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: '600',
    },
    resendTextDisabled: {
      color: colors.textSecondary,
    },
  });
}

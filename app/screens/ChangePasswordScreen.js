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
import { useTheme } from '../hooks/useTheme';
import { validate, getErrorMessage } from '../utils/validation';
import { authService } from '../services/authService';
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

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

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Change password"
        subtitle={step === STEP_SEND_OTP ? 'Verify your identity with a code' : 'Enter code and new password'}
        showBackButton
        onBackPress={() => (step === STEP_VERIFY_AND_CHANGE ? setStep(STEP_SEND_OTP) : navigation.goBack())}
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
          <View style={styles.formContainer}>
            <UnifiedCard variant="elevated" padding="large">
              {step === STEP_SEND_OTP ? (
                <>
                  <Text
                    style={[
                      typography.body,
                      {
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginBottom: spacing.xl,
                        lineHeight: 22,
                      },
                    ]}
                  >
                    Enter your current password. We&apos;ll send a verification code to your registered phone to confirm it&apos;s you.
                  </Text>

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
                    style={{ marginTop: spacing.lg }}
                  />
                </>
              ) : (
                <>
                  <Text
                    style={[
                      typography.body,
                      {
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginBottom: spacing.lg,
                        lineHeight: 22,
                      },
                    ]}
                  >
                    We sent a 6-digit code to {phoneMasked}. Enter it below along with your new password.
                  </Text>

                  <UnifiedFormInput
                    label="Verification code"
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
                    style={styles.resendLink}
                  >
                    <Text style={[typography.bodySmall, { color: colors.primary, fontWeight: '600' }]}>
                      {resendLoading ? 'Sending…' : 'Resend code'}
                    </Text>
                  </TouchableOpacity>

                  <UnifiedFormInput
                    label="New password"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      validateField('New password', text, { required: true, minLength: 8 });
                    }}
                    placeholder="At least 8 characters"
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
                    placeholder="Confirm new password"
                    error={errors['Confirm password']}
                    secureTextEntry
                    leftIcon="lock-closed-outline"
                    required
                  />

                  <UnifiedButton
                    label="Change password"
                    onPress={handleChangePassword}
                    variant="primary"
                    size="large"
                    iconName="checkmark-circle-outline"
                    iconPosition="right"
                    loading={loading}
                    disabled={loading}
                    fullWidth
                    style={{ marginTop: spacing.lg }}
                  />
                </>
              )}
            </UnifiedCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl || 32,
    },
    formContainer: {
      maxWidth: 400,
      width: '100%',
      alignSelf: 'center',
    },
    resendLink: {
      alignSelf: 'flex-end',
      marginBottom: spacing.lg,
    },
  });
}

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { validate, getErrorMessage, validators } from '../utils/validation';
import { authService } from '../services/authService';

import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const styles = createStyles(colors);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
    } else if (rules.email && trimmedValue && !validators.email(trimmedValue)) {
      errorRule = 'email';
    }
    setErrors((prev) => ({
      ...prev,
      [fieldName]: getErrorMessage(fieldName, errorRule),
    }));
    return false;
  };

  const handleRequestReset = async () => {
    if (!validateField('Email', email, { required: true, email: true })) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setOtpError('');
    try {
      const result = await authService.forgotPassword(email.trim());
      if (result.phone) {
        setPhone(result.phone);
        setPhoneMasked(result.phoneMasked || `***${result.phone.slice(-3)}`);
        setStep(2);
        setCountdown(30);
      } else {
        Alert.alert(
          'Check Your Email',
          'If an account exists with this email, a verification code has been sent to your registered phone number.'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleRequestReset();
    setCountdown(30);
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    if (!otpCode || otpCode.length !== 6) return;
    if (!phone) {
      setOtpError('Session expired. Please start over.');
      return;
    }

    setLoading(true);
    setOtpError('');
    try {
      const result = await authService.verifyOtpForReset(phone, otpCode);
      navigation.replace('ResetPassword', { resetToken: result.resetToken });
    } catch (error) {
      setOtpError(error.message || 'Invalid or expired code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Reset Password"
        subtitle="Verify your identity"
        showBackButton={true}
        onBackPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
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
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {step === 1 && (
              <UnifiedCard variant="elevated" padding="large">
                <Text
                  style={[
                    typography.h3,
                    { color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
                  ]}
                >
                  Forgot Password
                </Text>
                <Text
                  style={[
                    typography.body,
                    {
                      color: colors.textSecondary,
                      textAlign: 'center',
                      marginBottom: spacing.xl,
                      lineHeight: 20,
                    },
                  ]}
                >
                  Enter your email address. We'll send a verification code to your registered phone.
                </Text>

                <UnifiedFormInput
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField('Email', text, { required: true, email: true });
                  }}
                  placeholder="Enter your email"
                  error={errors.Email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                  required
                />

                <UnifiedButton
                  label="Send Verification Code"
                  onPress={handleRequestReset}
                  variant="primary"
                  size="large"
                  iconName="send-outline"
                  iconPosition="right"
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  style={{ marginTop: spacing.lg }}
                />
              </UnifiedCard>
            )}

            {step === 2 && (
              <UnifiedCard variant="elevated" padding="large">
                <Text
                  style={[
                    typography.h3,
                    { color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
                  ]}
                >
                  Enter Verification Code
                </Text>
                <Text
                  style={[
                    typography.body,
                    {
                      color: colors.textSecondary,
                      textAlign: 'center',
                      marginBottom: spacing.xl,
                      lineHeight: 20,
                    },
                  ]}
                >
                  We sent a 6-digit code to your phone ending in {phoneMasked}. Enter it below.
                </Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpRefs.current[index] = ref)}
                      style={[styles.otpInput, otpError && styles.otpInputError]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                    />
                  ))}
                </View>

                {otpError ? (
                  <Text style={[typography.body, { color: colors.error, marginTop: spacing.sm }]}>
                    {otpError}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOtp}
                  disabled={countdown > 0}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: countdown > 0 ? colors.textSecondary : colors.primary,
                        textDecorationLine: 'underline',
                      },
                    ]}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>

                {loading && (
                  <View style={styles.loadingContainer}>
                    <Text style={[typography.body, { color: colors.textSecondary }]}>
                      Verifying...
                    </Text>
                  </View>
                )}
              </UnifiedCard>
            )}

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text
                  style={[typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}
                >
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.brandingContainer}>
              <Text
                style={[
                  typography.h2,
                  { color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
                ]}
              >
                Roads Authority
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
                ]}
              >
                Digital Services Portal
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
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
      padding: spacing.xl,
      paddingBottom: spacing.xxxl + spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.sm,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    formContainer: {
      flex: 1,
      alignItems: 'center',
      maxWidth: 500,
      alignSelf: 'center',
      width: '100%',
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginVertical: spacing.lg,
    },
    otpInput: {
      width: 44,
      height: 52,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 8,
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    otpInputError: {
      borderColor: colors.error,
    },
    resendButton: {
      alignSelf: 'center',
      marginTop: spacing.md,
    },
    loadingContainer: {
      alignSelf: 'center',
      marginTop: spacing.md,
    },
    footerLinks: {
      alignItems: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.xxxl,
    },
    brandingContainer: {
      alignItems: 'center',
      marginTop: 'auto',
    },
  });

ForgotPasswordScreen.options = {
  headerShown: false,
};

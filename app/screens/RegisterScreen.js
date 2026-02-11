import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  useColorScheme,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { validate, getErrorMessage, validators } from '../utils/validation';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { RATheme } from '../theme/colors';

// Import Unified Design System Components
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAppContext();
  const colorScheme = useColorScheme();
  const themeColors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Professional styles using design system
  const styles = createStyles(themeColors);

  const validateField = (fieldName, value, rules) => {
    // Clear error immediately if validation passes
    const fieldErrors = validate(value, rules);
    if (fieldErrors.length === 0) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return true;
    }
    
    // Determine which error message to show (prioritize more specific errors)
    const ruleKeys = Object.keys(rules);
    let errorRule = ruleKeys[0]; // Default to first rule
    
    // Check each rule in priority order
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    
    // If value is empty or whitespace, show required error
    if (rules.required && (!trimmedValue || trimmedValue.length === 0)) {
      errorRule = 'required';
    } else if (rules.minLength && trimmedValue && trimmedValue.length < rules.minLength) {
      errorRule = 'minLength';
    } else if (rules.email && trimmedValue && !validators.email(trimmedValue)) {
      errorRule = 'email';
    } else if (rules.phone && trimmedValue && !validators.phone(trimmedValue)) {
      errorRule = 'phone';
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: getErrorMessage(fieldName, errorRule),
    }));
    return false;
  };

  const validateForm = () => {
    let isValid = true;

    // Full name is optional, but if provided, validate it
    if (fullName.trim()) {
      isValid = validateField('Full Name', fullName, { minLength: 2 }) && isValid;
    }

    isValid = validateField('Email', email, { required: true, email: true }) && isValid;
    isValid = validateField('Password', password, { required: true, minLength: 8 }) && isValid;
    isValid = validateField('Confirm Password', confirmPassword, { required: true }) && isValid;

    // Check password match
    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
    }

    // Phone required when using phone verification
    if (verificationMethod === 'phone') {
      isValid = validateField('Phone Number', phoneNumber, { required: true, phone: true }) && isValid;
    } else if (phoneNumber.trim()) {
      isValid = validateField('Phone Number', phoneNumber, { phone: true }) && isValid;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      setFormError('Please correct the highlighted fields before continuing.');
      return;
    }

    setFormError('');
    setLoading(true);
    setOtpError('');
    try {
      const result = await authService.register(
        email.trim(),
        password,
        fullName.trim() || null,
        phoneNumber.trim() || null,
        verificationMethod
      );

      if (result.needPhoneVerification) {
        setPhoneMasked(result.phoneMasked || `***${phoneNumber.slice(-3)}`);
        setStep(2);
        setCountdown(30);
        return;
      }

      if (result.needEmailVerification) {
        navigation.replace('EmailVerification', { email: result.user.email });
        return;
      }

      if (result.user && result.accessToken) {
        await login(result.user);
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('User with this email')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (errorMessage.includes('Password') && errorMessage.includes('8 characters')) {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (errorMessage.includes('Email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      if (errorMessage.includes('already exists')) {
        setFormError(`${errorMessage} Use the Sign In screen if you already have an account.`);
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    if (!otpCode || otpCode.length !== 6) return;
    setLoading(true);
    setOtpError('');
    try {
      const result = await authService.registerVerifyOtp(
        email,
        phoneNumber,
        otpCode,
        password
      );
      await login(result.user);
      navigation.replace('MainTabs');
    } catch (error) {
      setOtpError(error.message || 'Invalid or expired code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleRegister();
    setCountdown(30);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <GlobalHeader
        title="Create Account"
        subtitle="Join Roads Authority Digital Services"
        showBackButton={true}
        onBackPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* RA Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Main Form Card */}
            <View style={styles.cardContainer}>
              <UnifiedCard variant="elevated" padding="large">
              <Text style={[typography.h3, { color: themeColors.text, textAlign: 'center', marginBottom: spacing.sm }]}>
                {step === 1 ? 'Create Account' : 'Verify Your Phone'}
              </Text>
              <Text style={[typography.body, { color: themeColors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 }]}>
                {step === 1 ? 'Join Roads Authority Digital Services' : 'Enter the code sent to your phone'}
              </Text>
              {!!formError && step === 1 && (
                <Text style={styles.formErrorText} accessibilityLiveRegion="polite">
                  {formError}
                </Text>
              )}

              {step === 1 && (
              <>
              <UnifiedFormInput
                label="Full Name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (text.trim()) {
                    validateField('Full Name', text, { minLength: 2 });
                  } else {
                    setErrors((prev) => ({ ...prev, 'Full Name': null }));
                  }
                }}
                placeholder="Enter your full name"
                error={errors['Full Name']}
                autoCapitalize="words"
                leftIcon="person-outline"
                helperText="Optional - helps us personalize your experience"
              />

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

              <UnifiedFormInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validateField('Password', text, { required: true, minLength: 8 });
                  // Re-validate confirm password if it's already filled
                  if (confirmPassword) {
                    if (text !== confirmPassword) {
                      setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
                    } else {
                      setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
                    }
                  }
                }}
                placeholder="Enter password (min 8 characters)"
                error={errors.Password}
                secureTextEntry
                leftIcon="lock-closed-outline"
                helperText="Minimum 8 characters required"
                required
              />

              <UnifiedFormInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateField('Confirm Password', text, { required: true });
                  if (text !== password) {
                    setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
                  } else {
                    setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
                  }
                }}
                placeholder="Confirm your password"
                error={errors['Confirm Password']}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />

              <UnifiedFormInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (text.trim()) {
                    validateField('Phone Number', text, verificationMethod === 'phone' ? { required: true, phone: true } : { phone: true });
                  } else {
                    setErrors((prev) => ({ ...prev, 'Phone Number': null }));
                  }
                }}
                placeholder="e.g. 0812345678"
                error={errors['Phone Number']}
                keyboardType="phone-pad"
                leftIcon="call-outline"
                helperText={verificationMethod === 'phone' ? 'Required for verification' : 'Optional'}
                required={verificationMethod === 'phone'}
              />

              <Text style={[typography.body, { color: themeColors.textSecondary, marginBottom: spacing.sm }]}>
                Verify your account via
              </Text>
              <View style={styles.verificationOptions}>
                <TouchableOpacity
                  style={[
                    styles.verificationOption,
                    verificationMethod === 'email' && styles.verificationOptionSelected,
                  ]}
                  onPress={() => setVerificationMethod('email')}
                >
                  <Ionicons
                    name={verificationMethod === 'email' ? 'mail' : 'mail-outline'}
                    size={24}
                    color={verificationMethod === 'email' ? themeColors.primary : themeColors.textSecondary}
                  />
                  <Text style={[typography.body, { color: themeColors.text, marginLeft: spacing.sm }]}>
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.verificationOption,
                    verificationMethod === 'phone' && styles.verificationOptionSelected,
                  ]}
                  onPress={() => setVerificationMethod('phone')}
                >
                  <Ionicons
                    name={verificationMethod === 'phone' ? 'call' : 'call-outline'}
                    size={24}
                    color={verificationMethod === 'phone' ? themeColors.primary : themeColors.textSecondary}
                  />
                  <Text style={[typography.body, { color: themeColors.text, marginLeft: spacing.sm }]}>
                    Phone (SMS)
                  </Text>
                </TouchableOpacity>
              </View>

              <UnifiedButton
                label="Create Account"
                onPress={handleRegister}
                variant="primary"
                size="large"
                iconName="person-add-outline"
                iconPosition="right"
                loading={loading}
                disabled={loading}
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
              </>
              )}

              {step === 2 && (
                <View style={styles.otpSection}>
                  <Text style={[typography.body, { color: themeColors.textSecondary, textAlign: 'center', marginBottom: spacing.md }]}>
                    Enter the 6-digit code sent to {phoneMasked}
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
                    <Text style={[typography.body, { color: themeColors.error, marginTop: spacing.sm }]}>
                      {otpError}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendOtp}
                    disabled={countdown > 0}
                  >
                    <Text style={[typography.body, { color: countdown > 0 ? themeColors.textSecondary : themeColors.primary }]}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                  {loading && (
                    <Text style={[typography.body, { color: themeColors.textSecondary, marginTop: spacing.sm }]}>
                      Verifying...
                    </Text>
                  )}
                </View>
              )}
              </UnifiedCard>
            </View>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[typography.body, { color: themeColors.primary, textDecorationLine: 'underline' }]}>
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Government Portal Branding */}
            <View style={styles.brandingContainer}>
              <Text style={[typography.h2, { color: themeColors.primary, textAlign: 'center', marginBottom: spacing.xs }]}>
                Roads Authority
              </Text>
              <Text style={[typography.body, { color: themeColors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                Digital Services Portal
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Professional government-standard styling using design system
const createStyles = (colors) => StyleSheet.create({
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
    flexGrow: 1,
    paddingBottom: spacing.xl,
    padding: spacing.lg,
  },
  
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  
  // Form Container
  formContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Card Container - matches award card spacing
  cardContainer: {
    padding: 0,
    marginBottom: spacing.md,
  },
  formErrorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  verificationOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  verificationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  verificationOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  otpSection: {
    marginTop: spacing.md,
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
  
  // Footer Links
  footerLinks: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    marginTop: spacing.md,
  },
  
  // Government Branding
  brandingContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    marginTop: spacing.md,
  },
});

// Screen options to hide the default header since we use GlobalHeader
RegisterScreen.options = {
  headerShown: false,
};

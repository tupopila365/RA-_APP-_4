import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer, FormInput, DropdownSelector } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { authService } from '../services/authService';

const MIN_PASSWORD_LENGTH = 8; // Backend requires at least 8 characters

const VERIFICATION_OPTIONS = [
  { value: 'email', label: 'Verify by email' },
  { value: 'phone', label: 'Verify by phone (SMS)' },
];

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str || '');
}

export function SignUpScreen({ onBack, onSignUpSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address';
    if (verificationMethod === 'phone' && !phoneNumber.trim()) {
      next.phoneNumber = 'Phone number is required for phone verification';
    }
    if (!password) next.password = 'Password is required';
    else if (password.length < MIN_PASSWORD_LENGTH) next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    else if (!confirmPassword) next.confirmPassword = 'Confirm your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const result = await authService.register(
        email.trim(),
        password,
        fullName.trim(),
        phoneNumber.trim() || null,
        verificationMethod
      );
      if (result.needPhoneVerification) {
        setPendingRegistration({ email: email.trim(), phone: phoneNumber.trim(), password });
        setOtpStep(true);
        setOtp('');
        setOtpError('');
      } else if (result.needEmailVerification) {
        Alert.alert(
          'Verify your email',
          'Please check your email and follow the link to verify your account. Then you can sign in.',
          [{ text: 'OK', onPress: onBack }]
        );
      } else if (result.user) {
        const user = await authService.getStoredUser();
        onSignUpSuccess?.(user);
        Alert.alert('Account created', 'You can now sign in with your email and password.', [
          { text: 'OK', onPress: onBack },
        ]);
      }
    } catch (err) {
      Alert.alert('Registration failed', err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmed = otp.trim();
    if (!trimmed || trimmed.length < 4) {
      setOtpError('Enter the verification code sent to your phone');
      return;
    }
    if (!pendingRegistration) return;
    setOtpError('');
    setSubmitting(true);
    try {
      await authService.registerVerifyOtp(
        pendingRegistration.email,
        pendingRegistration.phone,
        trimmed,
        pendingRegistration.password
      );
      const user = await authService.getStoredUser();
      onSignUpSuccess?.(user);
      Alert.alert('Account created', 'You can now sign in with your email and password.', [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (otpStep && pendingRegistration) {
    return (
      <ScreenContainer ref={scrollViewRef} contentContainerStyle={styles.content} keyboardAware>
        <Text style={styles.title}>Verify your phone</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your phone to complete registration.
        </Text>
        <FormInput
          label="Verification code"
          required
          value={otp}
          onChangeText={(v) => { setOtp(v); setOtpError(''); }}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          error={otpError}
        />
        <Pressable
          style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
          onPress={handleVerifyOtp}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'Verifying…' : 'Verify and create account'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => { setOtpStep(false); setPendingRegistration(null); setOtp(''); setOtpError(''); }}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer ref={scrollViewRef} contentContainerStyle={styles.content} keyboardAware>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View ref={contentRef} collapsable={false}>
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>
            Create a Roads Authority account to submit applications, track reports, and more.
          </Text>

          <FormInput
            label="Full name"
            required
            value={fullName}
            onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: undefined })); }}
            placeholder="Your full name"
            autoCapitalize="words"
            error={errors.fullName}
            onFocusWithRef={onFocusWithRef}
          />
          <FormInput
            label="Email"
            required
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            onFocusWithRef={onFocusWithRef}
          />
          <DropdownSelector
            label="Verification method"
            placeholder="Choose how to verify"
            options={VERIFICATION_OPTIONS}
            value={verificationMethod}
            onSelect={(v) => { setVerificationMethod(v); setErrors((e) => ({ ...e, phoneNumber: undefined })); }}
          />
          {verificationMethod === 'phone' && (
            <FormInput
              label="Phone number"
              required
              value={phoneNumber}
              onChangeText={(v) => { setPhoneNumber(v); setErrors((e) => ({ ...e, phoneNumber: undefined })); }}
              placeholder="e.g. +264 81 234 5678"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              onFocusWithRef={onFocusWithRef}
            />
          )}
          <FormInput
            label="Password"
            required
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, confirmPassword: undefined })); }}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            secureTextEntry
            error={errors.password}
            onFocusWithRef={onFocusWithRef}
          />
          <FormInput
            label="Confirm password"
            required
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: undefined })); }}
            placeholder="Re-enter your password"
            secureTextEntry
            error={errors.confirmPassword}
            onFocusWithRef={onFocusWithRef}
          />

          <Pressable
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleSignUp}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>{submitting ? 'Creating account…' : 'Create account'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  keyboard: {
    flex: 1,
  },
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '600',
  },
});

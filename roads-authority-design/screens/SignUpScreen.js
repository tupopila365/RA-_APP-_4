import React, { useState } from 'react';
import { Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer, FormInput } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str || '');
}

export function SignUpScreen({ onBack }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address';
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
    try {
      // Replace with your registration API call
      await new Promise((r) => setTimeout(r, 600));
      Alert.alert('Sign up', 'Registration is not connected to a server yet. Connect your auth API to enable sign up.', [
        { text: 'OK' },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
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
        />
        <FormInput
          label="Password"
          required
          value={password}
          onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, confirmPassword: undefined })); }}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          secureTextEntry
          error={errors.password}
        />
        <FormInput
          label="Confirm password"
          required
          value={confirmPassword}
          onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: undefined })); }}
          placeholder="Re-enter your password"
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Pressable
          style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
          onPress={handleSignUp}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'Creating account…' : 'Create account'}</Text>
        </Pressable>
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
});

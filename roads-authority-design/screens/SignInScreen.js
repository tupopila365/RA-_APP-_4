import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer, FormInput } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { authService } from '../services/authService';

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str || '');
}

export function SignInScreen({ onBack, onSignInSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authService.login(email.trim(), password);
      const user = await authService.getStoredUser();
      onSignInSuccess?.(user);
      Alert.alert('Signed in', 'You are now signed in.', [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (err) {
      Alert.alert('Sign in failed', err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot password', 'Reset password can be added here (e.g. open reset link or screen).');
  };

  return (
    <ScreenContainer ref={scrollViewRef} contentContainerStyle={styles.content} keyboardAware>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View ref={contentRef} collapsable={false}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Sign in to your Roads Authority account to access applications and reports.
          </Text>

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
          <FormInput
            label="Password"
            required
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
            onFocusWithRef={onFocusWithRef}
          />

          <Pressable style={styles.forgotWrap} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleSignIn}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
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
  forgotWrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  forgotText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '600',
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

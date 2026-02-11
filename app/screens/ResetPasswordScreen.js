import React, { useState, useEffect } from 'react';
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

export default function ResetPasswordScreen({ navigation, route }) {
  const { colors } = useTheme();
  const resetToken = route?.params?.resetToken;

  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const styles = createStyles(colors);

  useEffect(() => {
    if (!resetToken) {
      Alert.alert('Invalid Link', 'Please request a new password reset.', [
        { text: 'OK', onPress: () => navigation.replace('ForgotPassword') },
      ]);
    }
  }, [resetToken, navigation]);

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

  const validateForm = () => {
    let isValid = true;
    isValid = validateField('New Password', newPassword, { required: true, minLength: 8 }) && isValid;
    isValid =
      validateField('Confirm Password', confirmPassword, { required: true }) && isValid;

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!resetToken) {
      Alert.alert('Error', 'Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      Alert.alert('Success', 'Your password has been reset. You can now sign in with your new password.', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Set New Password"
        subtitle="Create a secure password"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
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

            <UnifiedCard variant="elevated" padding="large">
              <Text
                style={[
                  typography.h3,
                  { color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
                ]}
              >
                Create New Password
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
                Your password must be at least 8 characters long.
              </Text>

              <UnifiedFormInput
                label="New Password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  validateField('New Password', text, { required: true, minLength: 8 });
                }}
                placeholder="Enter new password"
                error={errors['New Password']}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />

              <UnifiedFormInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({
                    ...prev,
                    'Confirm Password':
                      text && text !== newPassword ? 'Passwords do not match' : null,
                  }));
                }}
                placeholder="Confirm new password"
                error={errors['Confirm Password']}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />

              <UnifiedButton
                label="Reset Password"
                onPress={handleResetPassword}
                variant="primary"
                size="large"
                iconName="checkmark-circle-outline"
                iconPosition="right"
                loading={loading}
                disabled={loading}
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </UnifiedCard>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text
                  style={[
                    typography.body,
                    { color: colors.primary, textDecorationLine: 'underline' },
                  ]}
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

ResetPasswordScreen.options = {
  headerShown: false,
};

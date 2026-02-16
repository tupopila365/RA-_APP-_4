import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard } from './UnifiedCard';
import { UnifiedFormInput } from './UnifiedFormInput';
import { UnifiedButton } from './UnifiedButton';

/**
 * Modal that prompts the user to enter their password before accessing sensitive features.
 * Used for My Applications and PLN Application flows.
 */
export function PasswordVerificationModal({
  visible,
  title = 'Verify Your Identity',
  message = 'Enter your password to continue.',
  userEmail,
  onVerified,
  onCancel,
}) {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!password || !password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (!userEmail) {
      setError('Session expired. Please log in again.');
      onCancel?.();
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { authService } = require('../services/authService');
      await authService.login(userEmail, password.trim());
      setPassword('');
      onVerified?.();
    } catch (err) {
      setError(err.message || 'Invalid password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel?.();
  };

  const styles = getStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <View style={styles.modalContent}>
          <UnifiedCard variant="elevated" padding="large">
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="lock-closed" size={32} color={colors.primary} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            <UnifiedFormInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              placeholder="Enter your password"
              error={error}
              secureTextEntry
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="lock-closed-outline"
            />

            <View style={styles.buttons}>
              <UnifiedButton
                label="Continue"
                variant="primary"
                size="medium"
                onPress={handleVerify}
                loading={loading}
                disabled={loading}
                style={styles.primaryButton}
              />
              <UnifiedButton
                label="Cancel"
                variant="outline"
                size="medium"
                onPress={handleCancel}
                disabled={loading}
                style={styles.cancelButton}
              />
            </View>
          </UnifiedCard>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '94%',
      maxWidth: 400,
      marginHorizontal: spacing.lg,
      alignSelf: 'stretch',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h4,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttons: {
      flexDirection: 'column',
      marginTop: spacing.lg,
      width: '100%',
      gap: spacing.sm,
    },
    primaryButton: {
      width: '100%',
    },
    cancelButton: {
      width: '100%',
    },
  });
}

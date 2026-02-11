/**
 * ConfirmationCard
 *
 * In-app modal confirmation/alert component. Replaces system Alert.alert()
 * with a custom, themed card overlay that fits the enterprise design system.
 *
 * Use for:
 * - Confirmations (e.g. "Submit report?", "Remove item?")
 * - Alerts (e.g. "Location outside Namibia", "Error: Please select a location")
 * - Warnings (e.g. "Location too far")
 *
 * @example Single-button alert
 *   <ConfirmationCard
 *     visible={showError}
 *     title="Error"
 *     message="Please select a location on the map."
 *     confirmLabel="OK"
 *     onConfirm={() => setShowError(false)}
 *     variant="error"
 *   />
 *
 * @example Two-button confirmation
 *   <ConfirmationCard
 *     visible={showConfirm}
 *     title="Confirm Report"
 *     message="Submit this report?"
 *     confirmLabel="Submit"
 *     cancelLabel="Cancel"
 *     onConfirm={handleSubmit}
 *     onCancel={() => setShowConfirm(false)}
 *     variant="info"
 *   />
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard } from './UnifiedCard';
import { UnifiedButton } from './UnifiedButton';

const VARIANT_CONFIG = {
  info: {
    icon: 'information-circle',
    colorKey: 'primary',
  },
  success: {
    icon: 'checkmark-circle',
    colorKey: 'success',
  },
  warning: {
    icon: 'warning',
    colorKey: 'warning',
  },
  error: {
    icon: 'alert-circle',
    colorKey: 'error',
  },
};

export function ConfirmationCard({
  visible = false,
  title,
  message,
  variant = 'info',
  confirmLabel = 'OK',
  cancelLabel,
  tertiaryLabel,
  onConfirm,
  onCancel,
  onTertiary,
  onRequestClose,
  dismissOnBackdrop = true,
  icon,
  scrollable = false,
}) {
  const { colors } = useTheme();
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const accentColor = colors[config.colorKey] || colors.primary;
  const iconName = icon ?? config.icon;

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onCancel?.() ?? onRequestClose?.() ?? onConfirm?.();
    }
  };

  const handleRequestClose = () => {
    onCancel?.() ?? onRequestClose?.() ?? onConfirm?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.() ?? onRequestClose?.();
  };

  const handleTertiary = () => {
    onTertiary?.();
  };

  if (!visible) return null;

  const styles = getStyles(colors, accentColor);
  const hasCancel = Boolean(cancelLabel && (onCancel || onRequestClose));
  const hasTertiary = Boolean(tertiaryLabel && onTertiary);
  const useVerticalButtons = hasTertiary;

  const content = (
    <View style={styles.content}>
      <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={iconName} size={32} color={accentColor} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );

  const messageContent = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <View style={styles.modalContent} pointerEvents="box-none">
          <UnifiedCard variant="elevated" padding="large">
            {messageContent}
            <View style={[styles.buttons, useVerticalButtons && styles.buttonsVertical]}>
              {hasTertiary ? (
                <>
                  <UnifiedButton
                    label={confirmLabel}
                    variant="primary"
                    size="medium"
                    onPress={handleConfirm}
                    style={styles.verticalButton}
                  />
                  <UnifiedButton
                    label={tertiaryLabel}
                    variant="outline"
                    size="medium"
                    onPress={handleTertiary}
                    style={styles.verticalButton}
                  />
                  {hasCancel && (
                    <UnifiedButton
                      label={cancelLabel}
                      variant="outline"
                      size="medium"
                      onPress={handleCancel}
                      style={styles.verticalButton}
                    />
                  )}
                </>
              ) : (
                <>
                  {hasCancel && (
                    <UnifiedButton
                      label={cancelLabel}
                      variant="outline"
                      size="medium"
                      onPress={handleCancel}
                      style={styles.cancelButton}
                    />
                  )}
                  <UnifiedButton
                    label={confirmLabel}
                    variant="primary"
                    size="medium"
                    onPress={handleConfirm}
                    style={hasCancel ? styles.confirmButton : styles.singleButton}
                  />
                </>
              )}
            </View>
          </UnifiedCard>
        </View>
      </View>
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
      width: '90%',
      maxWidth: 400,
      marginHorizontal: spacing.xl,
      alignSelf: 'center',
    },
    content: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    scrollView: {
      maxHeight: 200,
    },
    scrollContent: {
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h4,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      ...typography.body,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: spacing.sm,
    },
    buttons: {
      flexDirection: 'row',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    buttonsVertical: {
      flexDirection: 'column',
    },
    verticalButton: {
      width: '100%',
    },
    cancelButton: {
      flex: 1,
    },
    confirmButton: {
      flex: 1,
    },
    singleButton: {
      flex: 1,
    },
  });
}

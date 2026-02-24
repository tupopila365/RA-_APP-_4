import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

/**
 * Full-screen success confirmation after a submission (e.g. road damage report, PLN application).
 * Shows a checkmark, title, message, primary action button, and optional secondary button (e.g. "Show on map").
 */
export function SuccessScreen({ title, message, buttonText = 'Done', onDone, secondaryButtonText, onSecondary }) {
  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={80} color={PRIMARY} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {secondaryButtonText && onSecondary ? (
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.buttonPressed]}
            onPress={onSecondary}
          >
            <View style={styles.buttonInner}>
              <Ionicons name="map-outline" size={20} color={PRIMARY} />
              <Text style={styles.buttonTextSecondary}>{secondaryButtonText}</Text>
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onDone}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onDone}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
  buttonRow: {
    width: '100%',
    maxWidth: 280,
    gap: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonTextSecondary: {
    ...typography.button,
    color: PRIMARY,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MachinePressable } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, CONTENT_BACKGROUND } from '../theme/colors';

/**
 * Full-screen success confirmation — no app header; content is self-contained.
 */
export function SuccessScreen({
  title = 'Submission successful',
  message,
  buttonText = 'Done',
  onDone,
  secondaryButtonText,
  onSecondary,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={44} color={NEUTRAL_COLORS.white} />
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        <View style={styles.actions}>
          {secondaryButtonText && onSecondary ? (
            <>
              <MachinePressable
                style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.buttonPressed]}
                onPress={onSecondary}
              >
                <View style={styles.buttonInner}>
                  <Ionicons name="map-outline" size={20} color={PRIMARY} />
                  <Text style={styles.buttonTextSecondary}>{secondaryButtonText}</Text>
                </View>
              </MachinePressable>
              <MachinePressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={onDone}
                heavy
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </MachinePressable>
            </>
          ) : (
            <MachinePressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={onDone}
              heavy
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </MachinePressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#16A34A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h5,
    fontFamily: 'Poppins_700Bold',
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  button: {
    backgroundColor: PRIMARY,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
  },
  buttonSecondary: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonTextSecondary: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
  },
});

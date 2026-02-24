import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

export function HeaderMenu({ visible, onClose, isLoggedIn, onSignIn, onSignUp, onSignOut }) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.sm);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.menuContainer, { top: paddingTop + 50 }]} onPress={() => {}}>
          {isLoggedIn ? (
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={() => { onSignOut?.(); onClose(); }}
            >
              <Ionicons name="log-out-outline" size={22} color={PRIMARY} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Sign out</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={() => { onSignIn?.(); onClose(); }}
              >
                <Ionicons name="log-in-outline" size={22} color={PRIMARY} style={styles.menuIcon} />
                <Text style={styles.menuItemText}>Sign in</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={() => { onSignUp?.(); onClose(); }}
              >
                <Ionicons name="person-add-outline" size={22} color={PRIMARY} style={styles.menuIcon} />
                <Text style={styles.menuItemText}>Sign up</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  menuContainer: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: PRIMARY,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
  pressed: {
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuItemText: {
    ...typography.body,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
  },
});

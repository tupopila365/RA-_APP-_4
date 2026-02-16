import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

export function HeaderMenu({ visible, onClose, onSignIn, onSignUp, onFeedback }) {
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
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => { onSignIn(); onClose(); }}
          >
            <Ionicons name="log-in-outline" size={22} color={PRIMARY} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Sign in</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => { onSignUp(); onClose(); }}
          >
            <Ionicons name="person-add-outline" size={22} color={PRIMARY} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Sign up</Text>
          </Pressable>
          {onFeedback ? (
            <Pressable
              style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, pressed && styles.pressed]}
              onPress={() => { onFeedback(); onClose(); }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={PRIMARY} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Feedback</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  menuContainer: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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

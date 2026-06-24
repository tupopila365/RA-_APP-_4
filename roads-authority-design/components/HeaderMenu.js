import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

export function HeaderMenu({ visible, onClose, isLoggedIn, onSignOut }) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.sm);

  if (!visible || !isLoggedIn) return null;

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
            onPress={() => { onSignOut?.(); onClose(); }}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="log-out-outline" size={18} color={PRIMARY} style={styles.menuIcon} />
            </View>
            <Text style={styles.menuItemText}>Sign out</Text>
          </Pressable>
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: PRIMARY + '12',
  },
  menuIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIcon: {
    marginRight: 0,
  },
  menuItemText: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'normal',
    color: NEUTRAL_COLORS.gray900,
  },
});

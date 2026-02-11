import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useDrawer } from '../context/DrawerContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * NavigationHeader - Default header with back button and hamburger menu
 *
 * Complete UI redesign for the upper navigation:
 * - Left: Back button (when can go back) or placeholder
 * - Center: Screen title
 * - Right: Hamburger menu (opens global drawer)
 *
 * Enterprise/government-grade, professional appearance.
 */
export function NavigationHeader({ navigation, route, options, back }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();
  const styles = getStyles(colors, insets);

  const title = options?.title ?? route?.name ?? '';
  const canGoBack = !!back;

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <View style={styles.content}>
        <View style={styles.leftSlot}>
          {canGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButtonPlaceholder} />
          )}
        </View>

        <View style={styles.titleSlot}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSlot}>
          {options?.headerRight?.({ tintColor: '#FFFFFF' })}
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.iconButton}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors, insets) {
  const topInset = insets?.top ?? 0;
  return StyleSheet.create({
    header: {
      paddingTop: topInset + spacing.sm,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.md,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    leftSlot: {
      width: 44,
      alignItems: 'flex-start',
    },
    rightSlot: {
      minWidth: 44,
      alignItems: 'flex-end',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButtonPlaceholder: {
      width: 44,
      height: 44,
    },
    titleSlot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    title: {
      ...typography.h5,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
}

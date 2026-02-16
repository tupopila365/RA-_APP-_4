import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NavBarSvgBackground } from './NavBarSvgBackground';

const NAV_HEIGHT = 56;

export function BottomNavBar({ items = [], activeKey }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPadding }]}>
      <NavBarSvgBackground />
      {items.map((item) => {
        const isActive = activeKey === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.pressed,
              isActive && styles.itemActive,
            ]}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={item.iconName}
              size={24}
              color="#FFFFFF"
              style={isActive ? styles.iconActive : undefined}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    minHeight: NAV_HEIGHT,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  pressed: { opacity: 0.8 },
  itemActive: {},
  iconActive: { opacity: 1 },
  labelActive: { fontWeight: '600' },
  label: {
    ...typography.caption,
    color: '#FFFFFF',
    marginTop: 2,
    fontSize: 11,
  },
});

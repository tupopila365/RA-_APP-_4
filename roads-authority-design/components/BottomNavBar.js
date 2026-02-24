import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const NAV_HEIGHT = 56;
const INACTIVE_COLOR = NEUTRAL_COLORS.gray500;

export function BottomNavBar({ items = [], activeKey }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPadding }]}>
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const iconName = isActive && item.iconNameActive ? item.iconNameActive : item.iconName;
        return (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.pressed,
            ]}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isActive ? PRIMARY : INACTIVE_COLOR}
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
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: NEUTRAL_COLORS.gray200,
    borderRadius: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  pressed: { opacity: 0.8 },
  label: {
    ...typography.caption,
    color: INACTIVE_COLOR,
    marginTop: 2,
    fontSize: 11,
    fontWeight: '400',
  },
  labelActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
});

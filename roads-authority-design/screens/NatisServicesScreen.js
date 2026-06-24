import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, MenuHeader } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const NATIS_MENU_ITEMS = [
  { key: 'view-driving-licence', iconName: 'id-card-outline', label: 'Driving Licence', action: 'View' },
  { key: 'driving-test', iconName: 'car-sport-outline', label: 'Driving Licence Test', action: 'Book now' },
  { key: 'learner-test', iconName: 'time-outline', label: "Learner's Licence Test", action: 'Book now' },
  { key: 'renew-vehicle', iconName: 'refresh-circle-outline', label: 'Renew Motor Vehicle Licence', action: 'Renew' },
  { key: 'forms', iconName: 'document-text-outline', label: 'Forms', action: 'View' },
  { key: 'faqs', iconName: 'help-circle-outline', label: 'FAQs', action: 'View' },
];

export function NatisServicesScreen({ onMenuItemPress }) {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <MenuHeader title="Licensing & Vehicle Services" />

        <View style={styles.grid}>
          {NATIS_MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => onMenuItemPress?.(item.key)}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.iconName} size={32} color={PRIMARY} />
              </View>
              <Text style={styles.label} numberOfLines={2}>
                {item.label}
              </Text>
              <View style={styles.underline} />
              <Text style={styles.action}>{item.action}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.xl,
    marginTop: spacing.md,
  },
  tile: {
    width: '47%',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 14,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    shadowColor: NEUTRAL_COLORS.gray800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.menuItemTitle,
    fontSize: 14,
    lineHeight: 20,
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  underline: {
    width: 40,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  action: {
    ...typography.menuItemAction,
    fontSize: 13,
    lineHeight: 18,
    color: PRIMARY,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontFamily: 'Poppins_500Medium',
  },
});

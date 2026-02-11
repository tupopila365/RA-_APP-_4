import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Global Header Component - Roads Authority Namibia
 * Consistent header across all screens with support for primary (branded) or light variant.
 */
export function GlobalHeader({
  title,
  subtitle,
  icon,
  onIconPress,
  variant = 'primary', // 'primary' | 'light'
  gradient, // deprecated: use variant. gradient={false} => variant="light"
  testID,
  accessibilityLabel,
  showBackButton = false,
  onBackPress,
  rightActions = [],
  logo,
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const resolvedVariant = gradient === false ? 'light' : variant;
  const styles = getStyles(colors, insets, resolvedVariant);
  const isLight = resolvedVariant === 'light';
  const iconColor = isLight ? colors.text : colors.textInverse || '#FFFFFF';

  const headerContent = (
    <View style={styles.headerContent}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.actionButton, isLight && styles.actionButtonLight]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        )}
        <View style={[styles.textContainer, showBackButton && styles.textContainerWithBack]}>
          {logo && !title ? (
            <View style={styles.logoRow}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          ) : (
            <>
              {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
            </>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            style={[styles.actionButton, isLight && styles.actionButtonLight]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel || action.icon}
          >
            <Ionicons name={action.icon} size={22} color={iconColor} />
          </TouchableOpacity>
        ))}
        {icon && (
          <TouchableOpacity
            onPress={onIconPress}
            style={[styles.actionButton, isLight && styles.actionButtonLight]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
          >
            <Ionicons name={icon} size={22} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.header} testID={testID}>
      {headerContent}
    </View>
  );
}

const getStyles = (colors, insets, variant) => {
  const isLight = variant === 'light';
  const headerBg = isLight ? (colors.backgroundSecondary || colors.background) : colors.primary;
  const titleColor = isLight ? colors.text : (colors.textInverse || '#FFFFFF');
  const subtitleColor = isLight ? colors.textSecondary : (colors.textInverse || '#FFFFFF');

  return StyleSheet.create({
    header: {
      paddingTop: Math.max(insets.top, spacing.md) + spacing.sm,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
      backgroundColor: headerBg,
      borderBottomWidth: isLight ? 1 : 0,
      borderBottomColor: colors.border,
      ...Platform.select({
        ios: isLight
          ? {}
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
            },
        android: isLight ? {} : { elevation: 4 },
      }),
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isLight ? 'transparent' : 'rgba(255, 255, 255, 0.18)',
    },
    actionButtonLight: {
      backgroundColor: 'transparent',
    },
    textContainer: {
      flex: 1,
      marginLeft: spacing.md,
      minWidth: 0,
    },
    textContainerWithBack: {
      marginLeft: spacing.sm,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logo: {
      width: 32,
      height: 32,
    },
    title: {
      color: titleColor,
      ...typography.h3,
      fontWeight: '600',
      marginBottom: 2,
    },
    subtitle: {
      color: subtitleColor,
      ...typography.caption,
      fontSize: 13,
      opacity: isLight ? 1 : 0.92,
    },
  });
};
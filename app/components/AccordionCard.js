import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedCard } from './UnifiedDesignSystem';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * AccordionCard - Collapsible card with header and expandable content
 * Used in the Executive Dashboard for My Services section
 */
export function AccordionCard({
  title,
  icon,
  badge,
  children,
  defaultExpanded = false,
  onToggle,
  style,
}) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const styles = getStyles(colors);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <UnifiedCard variant="elevated" padding="none" style={style}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${title}, ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
          )}
          <Text style={styles.title} maxFontSizeMultiplier={1.3}>
            {title}
          </Text>
          {badge !== undefined && badge !== null && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText} maxFontSizeMultiplier={1.3}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.divider} />
          {children}
        </View>
      )}
    </UnifiedCard>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.sm,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...typography.h5,
      color: colors.text,
      fontWeight: '600',
      flex: 1,
    },
    badge: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      paddingHorizontal: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      ...typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
  });
}

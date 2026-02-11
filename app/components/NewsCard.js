import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedCard } from './UnifiedDesignSystem';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * NewsCard - Horizontal card displaying news article with thumbnail
 * Used in the Executive Dashboard for Latest News section
 */
export function NewsCard({ title, excerpt, thumbnail, date, category, onPress, style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
      <UnifiedCard variant="elevated" padding="medium">
        <View style={styles.container}>
          {thumbnail && (
            <Image
              source={{ uri: thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
          <View style={styles.content}>
            <View style={styles.header}>
              {category && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>
                    {category}
                  </Text>
                </View>
              )}
              {date && (
                <View style={styles.dateContainer}>
                  <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.date} maxFontSizeMultiplier={1.3}>
                    {date}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {title}
            </Text>
            {excerpt && (
              <Text style={styles.excerpt} numberOfLines={2} maxFontSizeMultiplier={1.3}>
                {excerpt}
              </Text>
            )}
          </View>
        </View>
      </UnifiedCard>
    </TouchableOpacity>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
    },
    categoryText: {
      ...typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    date: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    title: {
      ...typography.h5,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
      lineHeight: 22,
    },
    excerpt: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}

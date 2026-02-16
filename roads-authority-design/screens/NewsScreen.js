import React, { useState, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { NEWS } from '../data/news';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function filterNews(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q)
  );
}

export function NewsScreen({ onBack, onSelectArticle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredNews = useMemo(() => filterNews(NEWS, searchQuery), [searchQuery]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>News & updates</Text>
      <Text style={styles.subtitle}>
        Latest from the Roads Authority.
      </Text>
      <SearchBar
        placeholder="Search news"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
        {filteredNews.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={48} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>No articles match your search.</Text>
          </View>
        ) : (
          filteredNews.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => onSelectArticle?.(item)}
            >
              <View style={styles.imageWrap}>
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              </View>
              <View style={styles.cardHeader}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
              </View>
              <Text style={styles.headline}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  list: {
    marginTop: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  imageWrap: {
    width: '100%',
    height: 140,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  category: {
    ...typography.caption,
    color: PRIMARY,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
  },
  headline: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  summary: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function NewsDetailScreen({ article, onBack }) {
  if (!article) return null;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: article.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.meta}>
        <Text style={styles.category}>{article.category}</Text>
        <Text style={styles.date}>{formatDate(article.date)}</Text>
      </View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.body}>{article.body}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  imageWrap: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  title: {
    ...typography.h4,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.lg,
    lineHeight: 28,
  },
  body: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray700,
    lineHeight: 24,
  },
});

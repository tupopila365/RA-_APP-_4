import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { FAQS } from '../data/faqs';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

export function FAQsScreen({ onBack }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>Frequently asked questions</Text>
      <Text style={styles.subtitle}>
        Tap a question to see the answer.
      </Text>
      {FAQS.map((faq) => {
        const isExpanded = expandedId === faq.id;
        return (
          <Pressable
            key={faq.id}
            style={[styles.card, isExpanded && styles.cardExpanded]}
            onPress={() => toggle(faq.id)}
          >
            <View style={styles.questionRow}>
              <Text style={styles.question} numberOfLines={isExpanded ? undefined : 2}>
                {faq.question}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={PRIMARY}
                style={styles.chevron}
              />
            </View>
            {isExpanded && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </Pressable>
        );
      })}
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
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardExpanded: {
    borderColor: PRIMARY,
    borderTopWidth: 3,
    borderTopColor: PRIMARY,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  question: {
    ...typography.body,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
    flex: 1,
    marginRight: spacing.sm,
  },
  chevron: {
    marginTop: 2,
  },
  answer: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    lineHeight: 22,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
});

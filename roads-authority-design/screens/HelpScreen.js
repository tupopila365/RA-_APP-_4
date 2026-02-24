import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { getFaqs, HELP_CATEGORIES } from '../services/faqService';
import { RA_CONTACTS } from '../data/contacts';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function filterFaqs(faqs, query) {
  if (!query || !query.trim()) return faqs;
  const q = query.trim().toLowerCase();
  return faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(q) ||
      (faq.answer && faq.answer.toLowerCase().includes(q)) ||
      (faq.category && faq.category.toLowerCase().includes(q))
  );
}

function groupByCategory(faqs) {
  const groups = {};
  HELP_CATEGORIES.forEach((cat) => { groups[cat] = []; });
  faqs.forEach((faq) => {
    const cat = faq.category || 'Contact & Support';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(faq);
  });
  return HELP_CATEGORIES.map((cat) => ({ category: cat, faqs: groups[cat] || [] })).filter(
    (g) => g.faqs.length > 0
  );
}

function formatPhoneForTel(phone) {
  return (phone || '').replace(/\s/g, '');
}

export function HelpScreen({ onBack, onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFaqs()
      .then((list) => { if (!cancelled) setFaqs(list || []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load help topics'); setFaqs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredFaqs = useMemo(() => filterFaqs(faqs, searchQuery), [faqs, searchQuery]);
  const grouped = useMemo(() => groupByCategory(filteredFaqs), [filteredFaqs]);

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${formatPhoneForTel(phone)}`);
  };
  const handleEmail = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Find answers, browse by topic, or contact support.
      </Text>

      <SearchBar
        placeholder="Search help topics..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search help"
      />
      <View style={styles.searchSpacer} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading help topics…</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={48} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.emptyText}>{error}</Text>
          <Text style={styles.emptyHint}>Use the contact options below to reach support.</Text>
        </View>
      ) : grouped.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.emptyText}>
            {searchQuery.trim() ? 'No topics match your search.' : 'No help topics available.'}
          </Text>
          <Text style={styles.emptyHint}>Use the contact options below to reach support.</Text>
        </View>
      ) : (
        grouped.map(({ category, faqs }) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {faqs.map((faq) => {
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
          </View>
        ))
      )}

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact & support</Text>
        <Text style={styles.contactIntro}>
          Need to speak to someone? Use one of the options below.
        </Text>

        <Pressable
          style={styles.contactRow}
          onPress={() => handleCall(RA_CONTACTS.headOffice.phone)}
        >
          <Ionicons name="call-outline" size={22} color={PRIMARY} style={styles.contactIcon} />
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{RA_CONTACTS.headOffice.phone}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={NEUTRAL_COLORS.gray400} />
        </Pressable>

        <Pressable
          style={styles.contactRow}
          onPress={() => handleEmail(RA_CONTACTS.headOffice.email)}
        >
          <Ionicons name="mail-outline" size={22} color={PRIMARY} style={styles.contactIcon} />
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{RA_CONTACTS.headOffice.email}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={NEUTRAL_COLORS.gray400} />
        </Pressable>

        {onOpenChat ? (
          <Pressable style={styles.contactRow} onPress={onOpenChat}>
            <Ionicons name="chatbubble-outline" size={22} color={PRIMARY} style={styles.contactIcon} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Live chat</Text>
              <Text style={styles.contactValue}>Chat with us in the app</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={NEUTRAL_COLORS.gray400} />
          </Pressable>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  searchSpacer: {
    height: spacing.md,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
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
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyHint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  contactSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
  contactIntro: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactIcon: {
    marginRight: spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
  },
  contactValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
    marginTop: 2,
  },
});

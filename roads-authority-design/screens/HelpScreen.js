import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { ChatScreen } from './ChatScreen';
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

function ContactRow({ icon, label, value, onPress, href }) {
  const handlePress = () => {
    if (onPress) onPress();
    else if (href) Linking.openURL(href);
  };
  if (!value && !href) return null;
  return (
    <Pressable style={styles.contactRow} onPress={handlePress} disabled={!onPress && !href}>
      <Ionicons name={icon} size={22} color={PRIMARY} style={styles.contactIcon} />
      <View style={styles.contactText}>
        <Text style={styles.contactLabel}>{label}</Text>
        {value ? <Text style={styles.contactValue}>{value}</Text> : null}
      </View>
      <Ionicons name="open-outline" size={18} color={NEUTRAL_COLORS.gray400} />
    </Pressable>
  );
}

function ContactCard({ title, children }) {
  return (
    <View style={styles.contactCard}>
      <Text style={styles.contactCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function HelpScreen({ onBack, onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

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
  const handleOpenChat = () => {
    if (onOpenChat) onOpenChat();
    else setChatVisible(true);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Pressable style={styles.chatbotEntry} onPress={handleOpenChat}>
        <View style={styles.chatbotIconWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={PRIMARY} />
        </View>
        <View style={styles.chatbotTextWrap}>
          <Text style={styles.chatbotTitle}>Ask our chatbot</Text>
          <Text style={styles.chatbotHint}>Tap to chat instantly</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={NEUTRAL_COLORS.gray400} />
      </Pressable>
      <View style={styles.chatbotSpacer} />

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
        <ContactCard title={RA_CONTACTS.headOffice.name}>
          <ContactRow
            icon="location-outline"
            label="Address"
            value={RA_CONTACTS.headOffice.address}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RA_CONTACTS.headOffice.address + ', Namibia')}`}
          />
          <ContactRow
            icon="call-outline"
            label="Telephone"
            value={RA_CONTACTS.headOffice.phone}
            onPress={() => handleCall(RA_CONTACTS.headOffice.phone)}
          />
          <ContactRow
            icon="mail-outline"
            label="Email"
            value={RA_CONTACTS.headOffice.email}
            onPress={() => handleEmail(RA_CONTACTS.headOffice.email)}
          />
          <ContactRow
            icon="globe-outline"
            label="Website"
            value="www.ra.org.na"
            href={RA_CONTACTS.headOffice.website}
          />
        </ContactCard>

        <ContactCard title={RA_CONTACTS.permits.name}>
          <ContactRow
            icon="call-outline"
            label="Telephone"
            value={RA_CONTACTS.permits.phone}
            onPress={() => handleCall(RA_CONTACTS.permits.phone)}
          />
          <ContactRow
            icon="mail-outline"
            label="Email"
            value={RA_CONTACTS.permits.email}
            onPress={() => handleEmail(RA_CONTACTS.permits.email)}
          />
        </ContactCard>

        <ContactCard title={RA_CONTACTS.fraudHotline.name}>
          <ContactRow
            icon="call-outline"
            label="Hotline"
            value={RA_CONTACTS.fraudHotline.phone}
            onPress={() => handleCall(RA_CONTACTS.fraudHotline.phone)}
          />
          <ContactRow
            icon="mail-outline"
            label="Email"
            value={RA_CONTACTS.fraudHotline.email}
            onPress={() => handleEmail(RA_CONTACTS.fraudHotline.email)}
          />
          {RA_CONTACTS.fraudHotline.note ? (
            <Text style={styles.note}>{RA_CONTACTS.fraudHotline.note}</Text>
          ) : null}
        </ContactCard>
      </View>
      <Modal
        visible={chatVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.chatModal}>
          <View style={styles.chatModalHeader}>
            <Text style={styles.chatModalTitle}>Chatbot</Text>
            <Pressable onPress={() => setChatVisible(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={NEUTRAL_COLORS.white} />
            </Pressable>
          </View>
          <View style={styles.chatModalBody}>
            <ChatScreen />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  chatbotEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
  },
  chatbotIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  chatbotTextWrap: {
    flex: 1,
  },
  chatbotTitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
  },
  chatbotHint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 2,
  },
  chatbotSpacer: {
    height: spacing.md,
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
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.md,
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
    backgroundColor: PRIMARY + '06',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  question: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
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
    marginTop: spacing.md,
  },
  contactCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  contactCardTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NEUTRAL_COLORS.gray200,
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
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    marginTop: 2,
  },
  note: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  chatModal: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    backgroundColor: PRIMARY,
  },
  chatModalTitle: {
    ...typography.h5,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
  },
  chatModalBody: {
    flex: 1,
  },
});

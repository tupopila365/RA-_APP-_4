import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { FORMS } from '../data/forms';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function filterForms(forms, query) {
  if (!query || !query.trim()) return forms;
  const q = query.trim().toLowerCase();
  return forms.filter(
    (f) =>
      f.title.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );
}

export function FormsScreen({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredForms = useMemo(
    () => filterForms(FORMS, searchQuery),
    [searchQuery]
  );

  const handleDownloadPdf = (pdfUrl) => {
    if (pdfUrl) Linking.openURL(pdfUrl);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>Forms & documents</Text>
      <Text style={styles.subtitle}>
        Official forms and documents from the Roads Authority website. Open or download as PDF.
      </Text>
      <SearchBar
        placeholder="Search forms"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
        {filteredForms.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>No forms match your search.</Text>
          </View>
        ) : (
          filteredForms.map((form) => (
            <View key={form.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Ionicons name="document-outline" size={24} color={PRIMARY} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.category}>{form.category}</Text>
                  <Text style={styles.formTitle}>{form.title}</Text>
                  <Text style={styles.description}>{form.description}</Text>
                </View>
              </View>
              <Pressable
                style={styles.downloadButton}
                onPress={() => handleDownloadPdf(form.pdfUrl)}
              >
                <Ionicons name="download-outline" size={20} color={NEUTRAL_COLORS.white} style={styles.downloadIcon} />
                <Text style={styles.downloadButtonText}>Download PDF</Text>
              </Pressable>
            </View>
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
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  category: {
    ...typography.caption,
    color: PRIMARY,
    fontWeight: '600',
    marginBottom: 2,
  },
  formTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    lineHeight: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  downloadIcon: {
    marginRight: spacing.sm,
  },
  downloadButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
});

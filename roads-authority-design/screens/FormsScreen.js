import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { getForms } from '../services/formsService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function filterForms(forms, query) {
  if (!query || !query.trim()) return forms;
  const q = query.trim().toLowerCase();
  return forms.filter(
    (f) =>
      (f.title && f.title.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (f.category && f.category.toLowerCase().includes(q))
  );
}

export function FormsScreen({ onBack }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { items } = await getForms();
        if (!cancelled) setForms(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load downloads');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredForms = useMemo(
    () => filterForms(forms, searchQuery),
    [forms, searchQuery]
  );

  const handleDownloadPdf = (pdfUrl) => {
    if (pdfUrl) Linking.openURL(pdfUrl);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Official forms and documents from the Roads Authority. Open or download as PDF.
      </Text>
      <SearchBar
        placeholder="Search downloads"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading downloads…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredForms.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={NEUTRAL_COLORS.gray400} />
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? 'No downloads match your search.' : 'No downloads available.'}
              </Text>
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
                    <Text style={styles.description}>{form.description || ''}</Text>
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
      )}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.md,
    textAlign: 'center',
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
    borderRadius: 0,
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
    borderRadius: 0,
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

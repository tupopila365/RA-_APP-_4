import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from './SearchBar';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const TYPE_ICONS = {
  faq: 'help-circle-outline',
  news: 'newspaper-outline',
  form: 'document-text-outline',
  service: 'construct-outline',
  road: 'trail-sign-outline',
  office: 'location-outline',
};

const TYPE_LABELS = {
  faq: 'FAQ',
  news: 'News',
  form: 'Form',
  service: 'Service',
  road: 'Road',
  office: 'Office',
};

export function HomeSearchWithSuggestions({
  value,
  onChangeText,
  getSuggestions,
  onSelectSuggestion,
}) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = (value || '').trim();
    if (!q || typeof getSuggestions !== 'function') return [];
    return getSuggestions(q);
  }, [value, getSuggestions]);

  const showSuggestions = focused && suggestions.length > 0;

  const handleSelect = (result) => {
    Keyboard.dismiss();
    onSelectSuggestion?.(result);
  };

  return (
    <View style={styles.wrap}>
      <SearchBar
        placeholder="Search the RA app"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {showSuggestions && (
        <View style={styles.suggestionsCard}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsScroll}
            nestedScrollEnabled
          >
            {suggestions.map((result) => (
              <Pressable
                key={`${result.type}-${result.id}`}
                onPress={() => handleSelect(result)}
                style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
              >
                <Ionicons
                  name={TYPE_ICONS[result.type] || 'document-outline'}
                  size={22}
                  color={PRIMARY}
                  style={styles.suggestionIcon}
                />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {result.title}
                  </Text>
                  {result.subtitle ? (
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {result.subtitle}
                    </Text>
                  ) : null}
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{TYPE_LABELS[result.type] || result.type}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
    zIndex: 10,
  },
  suggestionsCard: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    maxHeight: 280,
    overflow: 'hidden',
    shadowColor: NEUTRAL_COLORS.gray800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 20,
  },
  suggestionsScroll: {
    maxHeight: 276,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  suggestionRowPressed: {
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  suggestionIcon: {
    marginRight: spacing.md,
  },
  suggestionText: {
    flex: 1,
    minWidth: 0,
  },
  suggestionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
  },
  suggestionSubtitle: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: PRIMARY + '20',
  },
  typeBadgeText: {
    ...typography.label,
    fontSize: 10,
    color: PRIMARY,
  },
});

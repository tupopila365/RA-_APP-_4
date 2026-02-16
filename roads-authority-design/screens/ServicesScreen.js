import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { SERVICES } from '../data/services';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function filterServices(services, query) {
  if (!query || !query.trim()) return services;
  const q = query.trim().toLowerCase();
  return services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
  );
}

export function ServicesScreen({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredServices = useMemo(
    () => filterServices(SERVICES, searchQuery),
    [searchQuery]
  );

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>Roads Authority services</Text>
      <Text style={styles.subtitle}>
        Browse services for permits, reporting, and road information.
      </Text>
      <SearchBar
        placeholder="Search services"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
      {filteredServices.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.emptyText}>No services match your search.</Text>
        </View>
      ) : (
      filteredServices.map((service) => (
        <View key={service.id} style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={service.iconName} size={28} color={PRIMARY} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.category}>{service.category}</Text>
            <Text style={styles.name}>{service.name}</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
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
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
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
  name: {
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
});

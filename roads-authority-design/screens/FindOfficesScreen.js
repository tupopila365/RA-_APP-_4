import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { OFFICES } from '../data/offices';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function filterOffices(offices, query) {
  if (!query || !query.trim()) return offices;
  const q = query.trim().toLowerCase();
  return offices.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.region.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q)
  );
}

function formatPhoneForTel(phone) {
  return phone.replace(/\s/g, '');
}

export function FindOfficesScreen({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredOffices = useMemo(
    () => filterOffices(OFFICES, searchQuery),
    [searchQuery]
  );

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${formatPhoneForTel(phone)}`);
  };

  const handleNavigate = (address) => {
    if (!address) return;
    const query = encodeURIComponent(`${address}, Namibia`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    Linking.openURL(url);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find offices</Text>
      <Text style={styles.subtitle}>
        Roads Authority offices and service points across Namibia.
      </Text>
      <SearchBar
        placeholder="Search by name, region or address"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
        {filteredOffices.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={48} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>No offices match your search.</Text>
          </View>
        ) : (
          filteredOffices.map((office) => (
            <View key={office.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name="business-outline" size={24} color={PRIMARY} />
                </View>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.officeName}>{office.name}</Text>
                  <Text style={styles.region}>{office.region}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={16} color={NEUTRAL_COLORS.gray500} style={styles.rowIcon} />
                <Text style={styles.address}>{office.address}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={16} color={NEUTRAL_COLORS.gray500} style={styles.rowIcon} />
                <Text style={styles.hours}>{office.hours}</Text>
              </View>
              {office.phone ? (
                <Pressable
                  style={styles.phoneRow}
                  onPress={() => handleCall(office.phone)}
                >
                  <Ionicons name="call-outline" size={16} color={PRIMARY} style={styles.rowIcon} />
                  <Text style={styles.phone}>{office.phone}</Text>
                </Pressable>
              ) : null}
              {Array.isArray(office.services) && office.services.length > 0 ? (
                <View style={styles.servicesSection}>
                  <Text style={styles.servicesLabel}>Services</Text>
                  <View style={styles.servicesWrap}>
                    {office.services.map((s, i) => (
                      <View key={i} style={styles.serviceChip}>
                        <Text style={styles.serviceChipText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
              <Pressable
                style={styles.navigateButton}
                onPress={() => handleNavigate(office.address)}
              >
                <Ionicons name="navigate-outline" size={20} color={NEUTRAL_COLORS.white} style={styles.navBtnIcon} />
                <Text style={styles.navigateButtonText}>Navigate</Text>
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
  cardHeader: {
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
  cardTitleWrap: {
    flex: 1,
  },
  officeName: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
  },
  region: {
    ...typography.caption,
    color: PRIMARY,
    fontWeight: '600',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  rowIcon: {
    marginRight: spacing.sm,
  },
  address: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
  },
  hours: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    flex: 1,
  },
  phone: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '600',
    flex: 1,
  },
  servicesSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  servicesLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.sm,
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceChip: {
    backgroundColor: NEUTRAL_COLORS.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  serviceChipText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  navBtnIcon: {
    marginRight: spacing.sm,
  },
  navigateButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
});

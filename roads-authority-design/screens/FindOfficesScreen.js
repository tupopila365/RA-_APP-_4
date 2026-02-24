import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { getOffices } from '../services/officesService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';

function filterOffices(offices, query) {
  if (!query || !query.trim()) return offices;
  const q = query.trim().toLowerCase();
  return offices.filter(
    (o) =>
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.region && o.region.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q))
  );
}

function formatPhoneForTel(phone) {
  return phone.replace(/\s/g, '');
}

export function FindOfficesScreen({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOffices()
      .then((list) => { if (!cancelled) setOffices(list || []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load offices'); setOffices([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredOffices = useMemo(
    () => filterOffices(offices, searchQuery),
    [offices, searchQuery]
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

  const handleEmail = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Roads Authority offices and service points across Namibia.
      </Text>
      <SearchBar
        placeholder="Search by name, region or address"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Loading offices…</Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={48} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : filteredOffices.length === 0 ? (
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
              {(office.hours != null && office.hours !== '') ? (
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={16} color={NEUTRAL_COLORS.gray500} style={styles.rowIcon} />
                  <Text style={styles.hours}>{office.hours}</Text>
                </View>
              ) : null}
              {(office.closedDays != null && office.closedDays !== '') ? (
                <View style={styles.row}>
                  <Ionicons name="calendar-outline" size={16} color={NEUTRAL_COLORS.gray500} style={styles.rowIcon} />
                  <Text style={styles.extraHours}>{office.closedDays}</Text>
                </View>
              ) : null}
              {(office.specialHours != null && office.specialHours !== '') ? (
                <View style={styles.row}>
                  <Ionicons name="information-circle-outline" size={16} color={NEUTRAL_COLORS.gray500} style={styles.rowIcon} />
                  <Text style={styles.specialHoursText}>{office.specialHours}</Text>
                </View>
              ) : null}
              {office.phone ? (
                <Pressable
                  style={styles.phoneRow}
                  onPress={() => handleCall(office.phone)}
                >
                  <Ionicons name="call-outline" size={16} color={PRIMARY} style={styles.rowIcon} />
                  <Text style={styles.phone}>{office.phone}</Text>
                </Pressable>
              ) : null}
              {office.email ? (
                <Pressable
                  style={styles.phoneRow}
                  onPress={() => handleEmail(office.email)}
                >
                  <Ionicons name="mail-outline" size={16} color={PRIMARY} style={styles.rowIcon} />
                  <Text style={styles.email}>{office.email}</Text>
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
                <Ionicons name="navigate-outline" size={20} color={NEUTRAL_COLORS.gray900} style={styles.navBtnIcon} />
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
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  list: {
    marginTop: spacing.md,
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
  cardHeader: {
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
  extraHours: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    flex: 1,
  },
  specialHoursText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
    fontWeight: '700',
  },
  phone: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '600',
    flex: 1,
  },
  email: {
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
    borderRadius: 0,
  },
  serviceChipText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RA_YELLOW,
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
    color: NEUTRAL_COLORS.gray900,
  },
});

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { OFFICES } from '../data/offices';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

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

  const handleEmail = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
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
    ...Platform.select({
      ios: {
        shadowColor: NEUTRAL_COLORS.gray800,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY + '1A',
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
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  email: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  servicesSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  servicesLabel: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
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
    borderRadius: 999,
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
    borderRadius: 999,
    marginTop: spacing.xs,
  },
  navBtnIcon: {
    marginRight: spacing.sm,
  },
  navigateButtonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function FindOfficesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const officeTypes = ['All', 'RA Offices', 'NATIS Offices'];

  const offices = [
    {
      id: 1,
      name: 'Roads Authority Head Office',
      type: 'RA Offices',
      address: '123 Independence Avenue, Windhoek',
      phone: '+264 61 123 4567',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      latitude: -22.5609,
      longitude: 17.0658,
    },
    {
      id: 2,
      name: 'NATIS Office - Windhoek',
      type: 'NATIS Offices',
      address: '45 Sam Nujoma Drive, Windhoek',
      phone: '+264 61 234 5678',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      latitude: -22.5709,
      longitude: 17.0758,
    },
    {
      id: 3,
      name: 'Roads Authority - Swakopmund',
      type: 'RA Offices',
      address: '78 Main Street, Swakopmund',
      phone: '+264 64 123 4567',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      latitude: -22.6783,
      longitude: 14.5269,
    },
    {
      id: 4,
      name: 'NATIS Office - Swakopmund',
      type: 'NATIS Offices',
      address: '12 Hage Geingob Street, Swakopmund',
      phone: '+264 64 234 5678',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      latitude: -22.6883,
      longitude: 14.5369,
    },
    {
      id: 5,
      name: 'Roads Authority - Oshakati',
      type: 'RA Offices',
      address: '34 Independence Road, Oshakati',
      phone: '+264 65 123 4567',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      latitude: -17.7874,
      longitude: 15.6984,
    },
    {
      id: 6,
      name: 'NATIS Office - Oshakati',
      type: 'NATIS Offices',
      address: '56 Main Road, Oshakati',
      phone: '+264 65 234 5678',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      latitude: -17.7974,
      longitude: 15.7084,
    },
  ];

  const filteredOffices = offices.filter((office) => {
    const matchesSearch = office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || office.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (office) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${office.latitude},${office.longitude}`;
    Linking.openURL(url);
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search offices..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Office Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {officeTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              selectedType === type && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.filterText,
                selectedType === type && { color: '#FFFFFF' },
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Offices List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredOffices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No offices found</Text>
          </View>
        ) : (
          filteredOffices.map((office) => (
            <View key={office.id} style={styles.officeCard}>
              <View style={styles.officeHeader}>
                <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.typeText, { color: colors.primary }]}>
                    {office.type}
                  </Text>
                </View>
              </View>
              <Text style={styles.officeName}>{office.name}</Text>
              <View style={styles.officeDetail}>
                <Ionicons name="location" size={18} color={colors.textSecondary} />
                <Text style={styles.officeAddress}>{office.address}</Text>
              </View>
              <View style={styles.officeDetail}>
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.officeHours}>{office.hours}</Text>
              </View>
              <View style={styles.officeActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                  onPress={() => handleCall(office.phone)}
                >
                  <Ionicons name="call" size={18} color={colors.success} />
                  <Text style={[styles.actionButtonText, { color: colors.success }]}>
                    Call
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => handleDirections(office)}
                >
                  <Ionicons name="navigate" size={18} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Directions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      margin: 15,
      borderRadius: 25,
      paddingHorizontal: 15,
      height: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    filtersContainer: {
      maxHeight: 50,
    },
    filtersContent: {
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      padding: 15,
    },
    officeCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    officeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    typeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    officeName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    officeDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    officeAddress: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    officeHours: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    officeActions: {
      flexDirection: 'row',
      marginTop: 15,
      gap: 10,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
      gap: 5,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 15,
    },
  });
}


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Linking,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { LoadingSpinner, ErrorState } from '../components';
import { useOfficesViewModel } from '../src/presentation/viewModels/useOfficesViewModel';
import { useOfficeUseCases } from '../src/presentation/di/DependencyContext';

export default function FindOfficesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Get use cases from dependency injection
  const { getOfficesUseCase, searchOfficesUseCase } = useOfficeUseCases();
  
  // Use view model for state management
  const {
    offices,
    groupedOffices,
    regions,
    loading,
    refreshing,
    error,
    searchQuery,
    selectedRegion,
    setSearchQuery,
    setSelectedRegion,
    refresh,
    retry,
    isEmpty,
    hasError,
  } = useOfficesViewModel({ getOfficesUseCase, searchOfficesUseCase });

  const handleCall = (office) => {
    if (!office.hasContactNumber()) {
      Alert.alert('No Phone Number', 'This location does not have a contact number.');
      return;
    }
    Linking.openURL(`tel:${office.contactNumber}`);
  };

  const handleDirections = (office) => {
    if (!office.hasCoordinates()) {
      Alert.alert('No Coordinates', 'This location does not have map coordinates available.');
      return;
    }

    const { latitude, longitude } = office.coordinates;
    const label = encodeURIComponent(office.name || 'Location');
    
    // Open in device's default maps app
    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    
    const url = Platform.select({
      ios: scheme,
      android: scheme,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (hasError && isEmpty) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState
          message={error?.message || 'Failed to load offices'}
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Search and Filters */}
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Region Filters */}
        <View style={styles.filterLabel}>
          <Text style={styles.filterLabelText}>Region:</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {regions.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.filterChip,
                selectedRegion === region && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedRegion(region)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedRegion === region && { color: '#FFFFFF' },
                ]}
              >
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Locations List - Grouped by Region */}
      <ScrollView 
        style={styles.contentScrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No locations found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'No locations available'}
            </Text>
          </View>
        ) : (
          Object.keys(groupedOffices).sort().map((region) => (
            <View key={region} style={styles.regionSection}>
              <Text style={styles.regionHeader}>{region}</Text>
              {groupedOffices[region].map((office) => (
                <View key={office.id} style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <View style={[styles.regionBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="location" size={14} color={colors.primary} />
                      <Text style={[styles.regionBadgeText, { color: colors.primary }]}>
                        {office.region}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.locationName}>{office.name}</Text>
                  
                  <View style={styles.locationDetail}>
                    <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.locationAddress}>{office.address}</Text>
                  </View>
                  
                  {office.hasContactNumber() && (
                    <View style={styles.locationDetail}>
                      <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.locationContact}>{office.contactNumber}</Text>
                    </View>
                  )}
                  
                  {office.hasEmail() && (
                    <View style={styles.locationDetail}>
                      <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.locationContact}>{office.email}</Text>
                    </View>
                  )}
                  
                  <View style={styles.locationActions}>
                    {office.hasContactNumber() && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                        onPress={() => handleCall(office)}
                      >
                        <Ionicons name="call" size={18} color={colors.success} />
                        <Text style={[styles.actionButtonText, { color: colors.success }]}>
                          Call
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {office.hasCoordinates() && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                        onPress={() => handleDirections(office)}
                      >
                        <Ionicons name="navigate" size={18} color={colors.primary} />
                        <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                          Directions
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 15,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 15,
      marginBottom: 10,
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
      marginBottom: 10,
    },
    filtersContent: {
      paddingHorizontal: 15,
      paddingVertical: 5,
    },
    filterLabel: {
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    filterLabelText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    contentScrollView: {
      flex: 1,
    },
    content: {
      padding: 15,
      paddingBottom: 25,
    },
    regionSection: {
      marginBottom: 20,
    },
    regionHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      paddingHorizontal: 5,
    },
    locationCard: {
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
    locationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    regionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 5,
    },
    regionBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    locationName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    locationDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    locationAddress: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    locationContact: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    locationActions: {
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
      fontWeight: '600',
      color: colors.text,
      marginTop: 15,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
  });
}


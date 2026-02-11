import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../hooks/useTheme';
import { ErrorState, SearchInput, UnifiedCard, FilterDropdownBox, LocationFilterBadge } from '../components';
import { NoDataDisplay } from '../components/NoDataDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useOfficesViewModel } from '../src/presentation/viewModels/useOfficesViewModel';
import { useOfficeUseCases } from '../src/presentation/di/DependencyContext';

export default function FindOfficesScreen() {
  const { colors } = useTheme();
  
  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [sortBy, setSortBy] = useState('region'); // 'region', 'distance', 'name'
  
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

  // Request location permission and get user location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        getUserLocation();
      }
    } catch (error) {
      console.warn('Error requesting location permission:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      setLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.warn('Error getting user location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Helper functions to check office properties (since offices might be plain objects)
  const hasContactNumber = (office) => {
    return office && office.contactNumber && office.contactNumber.trim() !== '';
  };

  const hasEmail = (office) => {
    return office && office.email && office.email.trim() !== '';
  };

  const hasCoordinates = (office) => {
    return (
      office &&
      office.coordinates &&
      typeof office.coordinates.latitude === 'number' &&
      typeof office.coordinates.longitude === 'number' &&
      !isNaN(office.coordinates.latitude) &&
      !isNaN(office.coordinates.longitude)
    );
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate distance for offices if user location is available
  const officesWithDistance = React.useMemo(() => {
    if (!userLocation || !offices.length) return offices;
    
    return offices.map(office => {
      if (hasCoordinates(office)) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          office.coordinates.latitude,
          office.coordinates.longitude
        );
        return { ...office, distance };
      }
      return office;
    });
  }, [offices, userLocation]);

  // Sort offices based on selected criteria
  const sortedOffices = React.useMemo(() => {
    const officesToSort = [...officesWithDistance];
    
    switch (sortBy) {
      case 'distance':
        return officesToSort.sort((a, b) => {
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
      case 'name':
        return officesToSort.sort((a, b) => a.name.localeCompare(b.name));
      case 'region':
      default:
        return officesToSort.sort((a, b) => {
          const regionCompare = a.region.localeCompare(b.region);
          if (regionCompare !== 0) return regionCompare;
          return a.name.localeCompare(b.name);
        });
    }
  }, [officesWithDistance, sortBy]);

  // Group sorted offices by region for display
  const groupedSortedOffices = React.useMemo(() => {
    if (sortBy === 'distance' && userLocation) {
      // For distance sorting, don't group by region
      return { 'All Offices': sortedOffices };
    }
    
    return sortedOffices.reduce((groups, office) => {
      const region = office.region || 'Other';
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(office);
      return groups;
    }, {});
  }, [sortedOffices, sortBy, userLocation]);

  const handleCall = (office) => {
    if (!hasContactNumber(office)) {
      Alert.alert('No Phone Number', 'This location does not have a contact number.');
      return;
    }
    Linking.openURL(`tel:${office.contactNumber}`);
  };

  const handleDirections = (office) => {
    if (!hasCoordinates(office)) {
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

  const formatDistance = (distance) => {
    if (!distance) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const styles = useMemo(() => getStyles(colors), [colors]);
  const bg = colors.backgroundSecondary || colors.background;

  if (loading && offices.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <LoadingSpinner fullScreen message="Loading offices..." />
      </SafeAreaView>
    );
  }

  if (hasError && isEmpty) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <ErrorState
          message={error?.message || 'Failed to load offices'}
          onRetry={retry}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeTitle}>Find Offices</Text>
          <Text style={styles.welcomeSubtitle}>
            Locate Roads Authority offices across Namibia
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <SearchInput
            placeholder="Search offices, regions, or services..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search offices"
            accessibilityHint="Search by name, region, or services"
          />
        </View>

        {/* Filter by Region & Sort (same design as Road Status page) */}
        {!loading && offices.length > 0 && (
          <View style={styles.filterBySection}>
            <View style={styles.regionFilterHeader}>
              <LocationFilterBadge
                isDetectingLocation={loadingLocation}
                isFilteredByLocation={!!userLocation && sortBy === 'distance'}
                onUseLocation={requestLocationPermission}
                testID="location-filter-badge"
              />
            </View>
            <View style={styles.filterDropdownRow}>
              <FilterDropdownBox
                label="Sort by"
                placeholder="Sort by"
                value={sortBy === 'region' ? 'Region' : sortBy === 'name' ? 'Name' : sortBy === 'distance' ? 'Distance' : 'Region'}
                options={userLocation ? ['Region', 'Name', 'Distance'] : ['Region', 'Name']}
                nullMapsToOption="Region"
                onSelect={(item) => setSortBy(item.toLowerCase())}
                onClear={() => setSortBy('region')}
                accessibilityLabel="Sort offices"
                testID="filter-sort"
              />
              {sortBy !== 'distance' && (
                <FilterDropdownBox
                  label="Region"
                  placeholder="Region"
                  value={selectedRegion}
                  options={['All Regions', ...regions]}
                  nullMapsToOption="All Regions"
                  onSelect={(item) => setSelectedRegion(item === 'All Regions' ? null : item)}
                  onClear={() => setSelectedRegion(null)}
                  accessibilityLabel="Region filter"
                  testID="filter-region"
                />
              )}
            </View>
          </View>
        )}
        {/* Results Count */}
        {!isEmpty && (searchQuery.trim() || selectedRegion) && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount} maxFontSizeMultiplier={1.3}>
              {sortedOffices.length} {sortedOffices.length === 1 ? 'office' : 'offices'} found
            </Text>
          </View>
        )}

        {/* Offices List */}
        {isEmpty ? (
          <NoDataDisplay
            icon="location-outline"
            title={searchQuery || selectedRegion ? 'No offices found' : 'No offices available'}
            message={searchQuery || selectedRegion ? 'No offices match your search or filters.' : 'Office locations will appear here when available.'}
            accessibilityLabel="No offices found"
          />
        ) : (
          <View style={styles.content}>
            {Object.keys(groupedSortedOffices).sort().map((region) => (
            <View key={region} style={styles.regionSection}>
              {sortBy !== 'distance' && (
                <Text style={styles.regionHeader} maxFontSizeMultiplier={1.3}>{region}</Text>
              )}
              {groupedSortedOffices[region].map((office) => (
                <UnifiedCard key={office.id} variant="default" padding="none" style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <View style={styles.locationHeaderLeft}>
                      {office.region && (
                        <View style={[styles.regionBadge, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}>
                          <Ionicons name="location" size={14} color={colors.primary} />
                          <Text style={[styles.regionBadgeText, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>
                            {office.region}
                          </Text>
                        </View>
                      )}
                      {office.distance && (
                        <View style={[styles.distanceBadge, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.success }]}>
                          <Ionicons name="navigate" size={12} color={colors.success} />
                          <Text style={[styles.distanceBadgeText, { color: colors.success }]} maxFontSizeMultiplier={1.3}>
                            {formatDistance(office.distance)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.locationName} maxFontSizeMultiplier={1.3}>{office.name}</Text>
                  
                  <View style={styles.locationDetail}>
                    <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.locationAddress} maxFontSizeMultiplier={1.3}>{office.address}</Text>
                  </View>
                  
                  {hasContactNumber(office) && (
                    <View style={styles.locationDetail}>
                      <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.locationContact} maxFontSizeMultiplier={1.3}>{office.contactNumber}</Text>
                    </View>
                  )}
                  
                  {hasEmail(office) && (
                    <View style={styles.locationDetail}>
                      <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.locationContact} maxFontSizeMultiplier={1.3}>{office.email}</Text>
                    </View>
                  )}
                  
                  {/* NATIS Services */}
                  {office.services && office.services.length > 0 && (
                    <View style={styles.servicesSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="list-outline" size={16} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>
                          Services Available
                        </Text>
                      </View>
                      <View style={styles.servicesContainer}>
                        {office.services.map((service, index) => (
                          <View key={index} style={[styles.serviceTag, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                            <Text style={[styles.serviceText, { color: colors.primary }]} maxFontSizeMultiplier={1.2}>
                              {service}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {/* Operating Hours */}
                  {office.operatingHours && (
                    <View style={styles.hoursSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="time-outline" size={16} color={colors.info} />
                        <Text style={[styles.sectionTitle, { color: colors.info }]} maxFontSizeMultiplier={1.3}>
                          Operating Hours
                        </Text>
                      </View>
                      <View style={styles.hoursContainer}>
                        {office.operatingHours.weekdays && office.operatingHours.weekdays.open && (
                          <View style={styles.hoursRow}>
                            <Text style={[styles.hoursLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                              Mon-Fri:
                            </Text>
                            <Text style={[styles.hoursTime, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                              {office.operatingHours.weekdays.open} - {office.operatingHours.weekdays.close}
                            </Text>
                          </View>
                        )}
                        {office.operatingHours.weekends && office.operatingHours.weekends.open && (
                          <View style={styles.hoursRow}>
                            <Text style={[styles.hoursLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                              Weekends:
                            </Text>
                            <Text style={[styles.hoursTime, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                              {office.operatingHours.weekends.open} - {office.operatingHours.weekends.close}
                            </Text>
                          </View>
                        )}
                        {office.operatingHours.publicHolidays && office.operatingHours.publicHolidays.open && (
                          <View style={styles.hoursRow}>
                            <Text style={[styles.hoursLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                              Public Holidays:
                            </Text>
                            <Text style={[styles.hoursTime, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                              {office.operatingHours.publicHolidays.open} - {office.operatingHours.publicHolidays.close}
                            </Text>
                          </View>
                        )}
                        {office.closedDays && office.closedDays.length > 0 && (
                          <View style={styles.hoursRow}>
                            <Text style={[styles.hoursLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                              Closed:
                            </Text>
                            <Text style={[styles.hoursTime, { color: colors.warning }]} maxFontSizeMultiplier={1.2}>
                              {office.closedDays.join(', ')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  
                  {/* Special Hours & Holidays */}
                  {office.specialHours && office.specialHours.length > 0 && (
                    <View style={styles.specialHoursSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="calendar-outline" size={16} color={colors.warning} />
                        <Text style={[styles.sectionTitle, { color: colors.warning }]} maxFontSizeMultiplier={1.3}>
                          Special Hours & Holidays
                        </Text>
                      </View>
                      <View style={styles.specialHoursContainer}>
                        {office.specialHours.slice(0, 2).map((specialDay, index) => {
                          const date = new Date(specialDay.date);
                          const isUpcoming = date >= new Date();
                          const formattedDate = date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          });
                          
                          return (
                            <View key={index} style={[
                              styles.specialHourItem, 
                              { 
                                backgroundColor: isUpcoming ? colors.warning + '10' : colors.textSecondary + '10',
                                borderColor: isUpcoming ? colors.warning + '30' : colors.textSecondary + '30'
                              }
                            ]}>
                              <View style={styles.specialHourHeader}>
                                <Text style={[
                                  styles.specialHourDate, 
                                  { color: isUpcoming ? colors.warning : colors.textSecondary }
                                ]} maxFontSizeMultiplier={1.2}>
                                  {formattedDate}
                                </Text>
                                <Text style={[
                                  styles.specialHourStatus,
                                  { color: specialDay.closed ? colors.error : colors.success }
                                ]} maxFontSizeMultiplier={1.1}>
                                  {specialDay.closed ? 'CLOSED' : 'SPECIAL HOURS'}
                                </Text>
                              </View>
                              <Text style={[styles.specialHourReason, { color: colors.text }]} maxFontSizeMultiplier={1.1}>
                                {specialDay.reason}
                              </Text>
                              {!specialDay.closed && specialDay.hours && (
                                <Text style={[styles.specialHourTime, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.1}>
                                  {specialDay.hours.open} - {specialDay.hours.close}
                                </Text>
                              )}
                            </View>
                          );
                        })}
                        {office.specialHours.length > 2 && (
                          <Text style={[styles.moreSpecialHours, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.1}>
                            +{office.specialHours.length - 2} more special days
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.locationActions}>
                    {hasContactNumber(office) && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success, borderColor: colors.success }]}
                        onPress={() => handleCall(office)}
                      >
                        <Ionicons name="call" size={18} color={ '#FFFFFF'} />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]} maxFontSizeMultiplier={1.3}>
                          Call
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {hasCoordinates(office) && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => handleDirections(office)}
                      >
                        <Ionicons name="navigate" size={18} color={'#FFFFFF'} />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]} maxFontSizeMultiplier={1.3}>
                          Directions
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </UnifiedCard>
              ))}
            </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary || colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    welcomeRow: {
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    welcomeTitle: {
      ...typography.h3,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    welcomeSubtitle: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    searchInput: {
      margin: 0,
    },
    filterBySection: {
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    regionFilterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingHorizontal: 0,
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    filterDropdownRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    resultsCountContainer: {
      paddingHorizontal: 0,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    resultsCount: {
      ...typography.caption,
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    emptyStateContainer: {
      padding: spacing.xl,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 0,
    },
    regionSection: {
      marginBottom: spacing.xl,
    },
    regionHeader: {
      ...typography.h4,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    locationCard: {
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    locationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    locationHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    regionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    regionBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 3,
    },
    distanceBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    locationName: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 24,
    },
    locationDetail: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
      gap: 10,
    },
    locationAddress: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
    locationContact: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    locationActions: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 10,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 6,
      borderWidth: 1,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // NATIS Services styles
    servicesSection: {
      marginTop: 12,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    servicesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    serviceTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    serviceText: {
      fontSize: 11,
      fontWeight: '500',
    },
    // Operating Hours styles
    hoursSection: {
      marginTop: 12,
      marginBottom: 8,
    },
    hoursContainer: {
      gap: 4,
    },
    hoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hoursLabel: {
      fontSize: 12,
      fontWeight: '500',
      minWidth: 70,
    },
    hoursTime: {
      fontSize: 12,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    // Special Hours & Holidays styles
    specialHoursSection: {
      marginTop: 12,
      marginBottom: 8,
    },
    specialHoursContainer: {
      gap: 8,
    },
    specialHourItem: {
      padding: 10,
      borderRadius: 6,
      borderWidth: 1,
    },
    specialHourHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    specialHourDate: {
      fontSize: 12,
      fontWeight: '600',
    },
    specialHourStatus: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    specialHourReason: {
      fontSize: 11,
      fontWeight: '500',
      marginBottom: 2,
    },
    specialHourTime: {
      fontSize: 11,
      fontWeight: '600',
    },
    moreSpecialHours: {
      fontSize: 11,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 4,
    },
  });
}


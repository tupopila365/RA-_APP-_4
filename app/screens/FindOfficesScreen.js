import React, { useState, useEffect } from 'react';
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
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { RATheme } from '../theme/colors';
import { SkeletonLoader, ListScreenSkeleton, ErrorState, EmptyState, FilterBar } from '../components';
import { useOfficesViewModel } from '../src/presentation/viewModels/useOfficesViewModel';
import { useOfficeUseCases } from '../src/presentation/di/DependencyContext';

export default function FindOfficesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [sortBy, setSortBy] = useState('region'); // 'region', 'distance', 'name'
  const [showSortModal, setShowSortModal] = useState(false);
  
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

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]} maxFontSizeMultiplier={1.3}>Sort Offices</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'region' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => {
              setSortBy('region');
              setShowSortModal(false);
            }}
          >
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={[styles.sortOptionText, { color: colors.text }]} maxFontSizeMultiplier={1.3}>By Region</Text>
            {sortBy === 'region' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'name' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => {
              setSortBy('name');
              setShowSortModal(false);
            }}
          >
            <Ionicons name="text-outline" size={20} color={colors.text} />
            <Text style={[styles.sortOptionText, { color: colors.text }]} maxFontSizeMultiplier={1.3}>By Name</Text>
            {sortBy === 'name' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
          
          {userLocation && (
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'distance' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
              onPress={() => {
                setSortBy('distance');
                setShowSortModal(false);
              }}
            >
              <Ionicons name="navigate-outline" size={20} color={colors.text} />
              <Text style={[styles.sortOptionText, { color: colors.text }]} maxFontSizeMultiplier={1.3}>By Distance</Text>
              {sortBy === 'distance' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ListScreenSkeleton count={5} />
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
      {/* Header with Search and Controls */}
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search offices, regions, or services..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Location Status */}
          <View style={styles.locationStatus}>
            {loadingLocation ? (
              <View style={styles.locationIndicator}>
                <SkeletonLoader type="text" width={120} height={16} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>Getting location...</Text>
              </View>
            ) : userLocation ? (
              <View style={styles.locationIndicator}>
                <Ionicons name="location" size={16} color={colors.success} />
                <Text style={[styles.locationText, { color: colors.success }]} maxFontSizeMultiplier={1.3}>Location enabled</Text>
              </View>
            ) : locationPermission === 'denied' ? (
              <TouchableOpacity style={styles.locationIndicator} onPress={requestLocationPermission}>
                <Ionicons name="location-outline" size={16} color={colors.warning} />
                <Text style={[styles.locationText, { color: colors.warning }]} maxFontSizeMultiplier={1.3}>Enable location</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Button */}
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="funnel-outline" size={16} color={colors.primary} />
            <Text style={[styles.sortButtonText, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>
              {sortBy === 'distance' ? 'Distance' : sortBy === 'name' ? 'Name' : 'Region'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Region Filters */}
        {sortBy !== 'distance' && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel} maxFontSizeMultiplier={1.3}>Region:</Text>
            <FilterBar
              filters={regions}
              selectedFilter={selectedRegion}
              onFilterChange={setSelectedRegion}
              testID="offices-filter-bar"
              accessibilityLabel="Office region filters"
            />
          </View>
        )}
      </View>

      {/* Locations List */}
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
          <EmptyState
            icon="location-outline"
            message={searchQuery ? 'No offices found matching your search' : 'No offices available'}
            accessibilityLabel="No offices found"
          />
        ) : (
          Object.keys(groupedSortedOffices).sort().map((region) => (
            <View key={region} style={styles.regionSection}>
              {sortBy !== 'distance' && (
                <Text style={styles.regionHeader} maxFontSizeMultiplier={1.3}>{region}</Text>
              )}
              {groupedSortedOffices[region].map((office) => (
                <View key={office.id} style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <View style={styles.locationHeaderLeft}>
                      <View style={[styles.regionBadge, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}>
                        <Ionicons name="location" size={14} color={colors.primary} />
                        <Text style={[styles.regionBadgeText, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>
                          {office.region}
                        </Text>
                      </View>
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
                        {office.services.slice(0, 3).map((service, index) => (
                          <View key={index} style={[styles.serviceTag, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                            <Text style={[styles.serviceText, { color: colors.primary }]} maxFontSizeMultiplier={1.2}>
                              {service}
                            </Text>
                          </View>
                        ))}
                        {office.services.length > 3 && (
                          <View style={[styles.serviceTag, { backgroundColor: colors.card, borderColor: colors.textSecondary }]}>
                            <Text style={[styles.serviceText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                              +{office.services.length - 3} more
                            </Text>
                          </View>
                        )}
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
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Sort Modal */}
      {renderSortModal()}
    </SafeAreaView>
  );
}

function getStyles(colors) {
  const { width } = Dimensions.get('window');
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 15,
      paddingBottom: 10,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 15,
      marginBottom: 12,
      borderRadius: 8,
      paddingHorizontal: 15,
      height: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginBottom: 12,
    },
    locationStatus: {
      flex: 1,
    },
    locationIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationText: {
      fontSize: 12,
      fontWeight: '500',
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    sortButtonText: {
      fontSize: 12,
      fontWeight: '600',
    },
    filterSection: {
      paddingHorizontal: 15,
    },
    filterLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
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
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 14,
      paddingHorizontal: 5,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    locationCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
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
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 14,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
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
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingBottom: 30,
      maxHeight: '50%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    sortOptionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
  });
}


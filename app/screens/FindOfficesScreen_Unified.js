import React, { useState, useEffect } from 'react';
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
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../hooks/useTheme';
import { GlobalHeader } from '../components/GlobalHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { UnifiedFormInput } from '../components/UnifiedFormInput';
import { UnifiedSkeletonLoader } from '../components/UnifiedSkeletonLoader';
import { ErrorState, EmptyState, FilterBar } from '../components';
import { useOfficesViewModel } from '../src/presentation/viewModels/useOfficesViewModel';
import { useOfficeUseCases } from '../src/presentation/di/DependencyContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function FindOfficesScreen({ navigation }) {
  const { colors } = useTheme();
  
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

  // Helper functions to check office properties
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
        <UnifiedCard style={styles.modalContent} variant="elevated" padding="large">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} maxFontSizeMultiplier={1.3}>Sort Offices</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'region' && styles.sortOptionActive]}
            onPress={() => {
              setSortBy('region');
              setShowSortModal(false);
            }}
          >
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={styles.sortOptionText} maxFontSizeMultiplier={1.3}>By Region</Text>
            {sortBy === 'region' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
            onPress={() => {
              setSortBy('name');
              setShowSortModal(false);
            }}
          >
            <Ionicons name="text-outline" size={20} color={colors.text} />
            <Text style={styles.sortOptionText} maxFontSizeMultiplier={1.3}>By Name</Text>
            {sortBy === 'name' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
          
          {userLocation && (
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'distance' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('distance');
                setShowSortModal(false);
              }}
            >
              <Ionicons name="navigate-outline" size={20} color={colors.text} />
              <Text style={styles.sortOptionText} maxFontSizeMultiplier={1.3}>By Distance</Text>
              {sortBy === 'distance' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        </UnifiedCard>
      </View>
    </Modal>
  );

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <GlobalHeader
          title="Find Offices"
          subtitle="Locate NATIS offices near you"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <UnifiedSkeletonLoader type="list-item" count={5} animated={true} />
      </SafeAreaView>
    );
  }

  if (hasError && isEmpty) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <GlobalHeader
          title="Find Offices"
          subtitle="Locate NATIS offices near you"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <ErrorState
          message={error?.message || 'Failed to load offices'}
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GlobalHeader
        title="Find Offices"
        subtitle="Locate NATIS offices near you"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { 
            icon: 'funnel-outline', 
            onPress: () => setShowSortModal(true), 
            accessibilityLabel: 'Sort offices' 
          }
        ]}
      />

      <ScrollView 
        style={styles.scrollView} 
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
        {/* Search Input */}
        <UnifiedFormInput
          placeholder="Search offices, regions, or services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Location Status */}
          <View style={styles.locationStatus}>
            {loadingLocation ? (
              <View style={styles.locationIndicator}>
                <UnifiedSkeletonLoader type="text-line" width={120} height={16} />
                <Text style={styles.locationText} maxFontSizeMultiplier={1.3}>Getting location...</Text>
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
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="funnel-outline" size={16} color={colors.primary} />
            <Text style={styles.sortButtonText} maxFontSizeMultiplier={1.3}>
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

        {/* Offices List */}
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
                <UnifiedCard
                  key={office.id}
                  style={styles.officeCard}
                  variant="default"
                  padding="large"
                >
                  <View style={styles.officeHeader}>
                    <View style={styles.officeHeaderLeft}>
                      <View style={styles.regionBadge}>
                        <Ionicons name="location" size={14} color={colors.primary} />
                        <Text style={styles.regionBadgeText} maxFontSizeMultiplier={1.3}>
                          {office.region}
                        </Text>
                      </View>
                      {office.distance && (
                        <View style={styles.distanceBadge}>
                          <Ionicons name="navigate" size={12} color={colors.success} />
                          <Text style={styles.distanceBadgeText} maxFontSizeMultiplier={1.3}>
                            {formatDistance(office.distance)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.officeName} maxFontSizeMultiplier={1.3}>{office.name}</Text>
                  
                  <View style={styles.officeDetail}>
                    <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.officeAddress} maxFontSizeMultiplier={1.3}>{office.address}</Text>
                  </View>
                  
                  {hasContactNumber(office) && (
                    <View style={styles.officeDetail}>
                      <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.officeContact} maxFontSizeMultiplier={1.3}>{office.contactNumber}</Text>
                    </View>
                  )}
                  
                  {hasEmail(office) && (
                    <View style={styles.officeDetail}>
                      <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.officeContact} maxFontSizeMultiplier={1.3}>{office.email}</Text>
                    </View>
                  )}
                  
                  {/* NATIS Services */}
                  {office.services && office.services.length > 0 && (
                    <View style={styles.servicesSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="list-outline" size={16} color={colors.primary} />
                        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                          Services Available
                        </Text>
                      </View>
                      <View style={styles.servicesContainer}>
                        {office.services.slice(0, 3).map((service, index) => (
                          <View key={index} style={styles.serviceTag}>
                            <Text style={styles.serviceText} maxFontSizeMultiplier={1.2}>
                              {service}
                            </Text>
                          </View>
                        ))}
                        {office.services.length > 3 && (
                          <View style={[styles.serviceTag, styles.serviceTagMore]}>
                            <Text style={[styles.serviceText, styles.serviceTextMore]} maxFontSizeMultiplier={1.2}>
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
                        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                          Operating Hours
                        </Text>
                      </View>
                      <View style={styles.hoursContainer}>
                        {office.operatingHours.weekdays && office.operatingHours.weekdays.open && (
                          <View style={styles.hoursRow}>
                            <Text style={styles.hoursLabel} maxFontSizeMultiplier={1.2}>
                              Mon-Fri:
                            </Text>
                            <Text style={styles.hoursTime} maxFontSizeMultiplier={1.2}>
                              {office.operatingHours.weekdays.open} - {office.operatingHours.weekdays.close}
                            </Text>
                          </View>
                        )}
                        {office.operatingHours.weekends && office.operatingHours.weekends.open && (
                          <View style={styles.hoursRow}>
                            <Text style={styles.hoursLabel} maxFontSizeMultiplier={1.2}>
                              Weekends:
                            </Text>
                            <Text style={styles.hoursTime} maxFontSizeMultiplier={1.2}>
                              {office.operatingHours.weekends.open} - {office.operatingHours.weekends.close}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.officeActions}>
                    {hasContactNumber(office) && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.callButton]}
                        onPress={() => handleCall(office)}
                      >
                        <Ionicons name="call" size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.3}>
                          Call
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {hasCoordinates(office) && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.directionsButton]}
                        onPress={() => handleDirections(office)}
                      >
                        <Ionicons name="navigate" size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.3}>
                          Directions
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </UnifiedCard>
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
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    searchInput: {
      marginBottom: spacing.lg,
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    locationStatus: {
      flex: 1,
    },
    locationIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    locationText: {
      ...typography.caption,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
      gap: spacing.xs,
    },
    sortButtonText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    filterSection: {
      marginBottom: spacing.lg,
    },
    filterLabel: {
      ...typography.caption,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    regionSection: {
      marginBottom: spacing.xl,
    },
    regionHeader: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    officeCard: {
      marginBottom: spacing.md,
    },
    officeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    officeHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    regionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      backgroundColor: colors.primary + '15',
      borderWidth: 1,
      borderColor: colors.primary + '30',
      gap: spacing.xs,
    },
    regionBadgeText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 10,
      backgroundColor: colors.success + '15',
      borderWidth: 1,
      borderColor: colors.success + '30',
      gap: 3,
    },
    distanceBadgeText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.success,
    },
    officeName: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.md,
    },
    officeDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    officeAddress: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    officeContact: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
    },
    servicesSection: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    sectionTitle: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.primary,
    },
    servicesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    serviceTag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    serviceTagMore: {
      backgroundColor: colors.card,
      borderColor: colors.textSecondary,
    },
    serviceText: {
      ...typography.caption,
      color: colors.primary,
    },
    serviceTextMore: {
      color: colors.textSecondary,
    },
    hoursSection: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    hoursContainer: {
      gap: spacing.xs,
    },
    hoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hoursLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    hoursTime: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '500',
    },
    officeActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
      gap: spacing.xs,
    },
    callButton: {
      backgroundColor: colors.success,
    },
    directionsButton: {
      backgroundColor: colors.primary,
    },
    actionButtonText: {
      ...typography.bodySmall,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      ...typography.h4,
      color: colors.text,
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: 8,
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    sortOptionActive: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    sortOptionText: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
  });
}
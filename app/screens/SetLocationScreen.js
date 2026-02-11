/**
 * Set Location Screen
 *
 * Standalone screen for selecting a damage location on the map.
 * Used when reporting road damage from ReportPotholeScreen.
 * Navigate here with params: { initialLocation, currentLocation, roadworks }
 * On confirm, navigates back to ReportPothole with locationResult in params.
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SearchInput } from '../components/SearchInput';
import MapComponent, { isMapAvailable } from '../components/MapComponent';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

let Location = null;
try {
  Location = require('expo-location');
} catch (error) {
  console.warn('Location module not available:', error.message);
}

const CONFIG = {
  MAX_DISTANCE_KM: 100,
  DEFAULT_MAP_ZOOM: 0.01,
  NAMIBIA_BOUNDS: {
    minLat: -28.97,
    maxLat: -16.96,
    minLng: 11.73,
    maxLng: 25.27,
  },
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isWithinNamibia = (latitude, longitude) =>
  latitude >= CONFIG.NAMIBIA_BOUNDS.minLat &&
  latitude <= CONFIG.NAMIBIA_BOUNDS.maxLat &&
  longitude >= CONFIG.NAMIBIA_BOUNDS.minLng &&
  longitude <= CONFIG.NAMIBIA_BOUNDS.maxLng;

const getAddressFromCoordinates = async (latitude, longitude) => {
  if (!Location) return null;
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results?.length > 0) {
      const a = results[0];
      const street = a.street || a.name || '';
      const city = a.city || a.district || a.subregion || '';
      const region = a.region || a.country || '';
      const fullAddress = `${street}, ${city}, ${region}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
      return {
        fullAddress: fullAddress || 'Address not found',
        street: street || undefined,
        city: city || undefined,
        region: region || undefined,
      };
    }
  } catch (e) {
    console.error('Reverse geocode error:', e);
  }
  return null;
};

/** Parse address string to extract town, street, road for form fields */
const parseAddressForForm = (address) => {
  if (!address) return {};
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    return { townName: parts[0], streetName: '', roadName: parts[0] };
  }
  if (parts.length === 2) {
    return { townName: parts[1], streetName: parts[0], roadName: parts[0] };
  }
  const last = (parts[parts.length - 1] || '').toLowerCase();
  if (last.includes('namibia') || last.includes('region')) {
    return { townName: parts[0], streetName: '', roadName: '' };
  }
  return { townName: parts[1] || parts[0], streetName: parts[0], roadName: parts[0] };
};

// Fake locations in Namibia (fallback when geocode API is unavailable)
const FAKE_LOCATIONS = [
  { address: 'Windhoek, Khomas, Namibia', latitude: -22.5597, longitude: 17.0832 },
  { address: 'Swakopmund, Erongo, Namibia', latitude: -22.6833, longitude: 14.5333 },
  { address: 'Walvis Bay, Erongo, Namibia', latitude: -22.9575, longitude: 14.5053 },
  { address: 'Ondangwa, Oshana, Namibia', latitude: -17.7833, longitude: 15.9667 },
  { address: 'Rundu, Kavango East, Namibia', latitude: -17.9167, longitude: 19.7667 },
  { address: 'Tsumeb, Oshikoto, Namibia', latitude: -19.2333, longitude: 17.7167 },
  { address: 'Otjiwarongo, Otjozondjupa, Namibia', latitude: -20.4667, longitude: 16.6500 },
  { address: 'Keetmanshoop, ǁKaras, Namibia', latitude: -26.5833, longitude: 18.1333 },
  { address: 'Lüderitz, ǁKaras, Namibia', latitude: -26.6472, longitude: 15.1589 },
  { address: 'Grootfontein, Otjozondjupa, Namibia', latitude: -19.5667, longitude: 18.1167 },
  { address: 'B1 Highway, Windhoek', latitude: -22.5600, longitude: 17.0840 },
  { address: 'Independence Avenue, Windhoek', latitude: -22.5615, longitude: 17.0815 },
  { address: 'Sam Nujoma Drive, Windhoek', latitude: -22.5620, longitude: 17.0820 },
];

const fetchGeocodeSuggestions = async (query) => {
  if (!query?.trim() || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  // Try real geocode API first (when available)
  if (Location) {
    try {
      const results = await Location.geocodeAsync(query.trim());
      if (results?.length > 0) {
        return results.slice(0, 5).map((r) => {
          const parts = [r.name, r.street, r.city, r.region, r.country].filter(Boolean);
          const address = parts.length > 0 ? parts.join(', ') : `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`;
          return { address, latitude: r.latitude, longitude: r.longitude };
        });
      }
    } catch (e) {
      console.warn('Geocode API unavailable, using fake data:', e.message);
    }
  }

  // Fallback: filter fake locations by search query
  return FAKE_LOCATIONS.filter((loc) =>
    loc.address.toLowerCase().includes(q)
  ).slice(0, 5);
};

export default function SetLocationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const initialLocation = route.params?.initialLocation ?? null;
  const currentLocation = route.params?.currentLocation ?? null;
  const roadworks = route.params?.roadworks ?? [];

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [locationAddress, setLocationAddress] = useState(route.params?.locationAddress ?? '');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  const mapRegion = initialLocation
    ? {
        ...initialLocation,
        latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
        longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
      }
    : currentLocation
      ? {
          ...currentLocation,
          latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
          longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
        }
      : {
          latitude: -22.5597,
          longitude: 17.0832,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };

  useEffect(() => {
    if (initialLocation && !locationAddress) {
      getAddressFromCoordinates(initialLocation.latitude, initialLocation.longitude).then(
        (addr) => addr && setLocationAddress(addr.fullAddress)
      );
    }
  }, []);

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    const addr = await getAddressFromCoordinates(latitude, longitude);
    if (addr) setLocationAddress(addr.fullAddress);
  };

  const handleMarkerDragEnd = async (coords) => {
    if (coords?.latitude == null || coords?.longitude == null) return;
    setSelectedLocation(coords);
    const addr = await getAddressFromCoordinates(coords.latitude, coords.longitude);
    if (addr) setLocationAddress(addr.fullAddress);
  };

  const handleMapSearch = async (query) => {
    setMapSearchQuery(query || '');
    if (!query?.trim() || query.trim().length < 2) {
      setAddressSuggestions([]);
      return;
    }
    const results = await fetchGeocodeSuggestions(query);
    setAddressSuggestions(results);
  };

  const handleAddressSelect = async (suggestion) => {
    const item = addressSuggestions.find((s) => s.address === suggestion);
    if (!item) return;
    const coords = { latitude: item.latitude, longitude: item.longitude };
    if (!isWithinNamibia(coords.latitude, coords.longitude)) {
      Alert.alert('Location Outside Namibia', 'Please select a location within Namibia.', [{ text: 'OK' }]);
      return;
    }
    setSelectedLocation(coords);
    setMapSearchQuery('');
    setAddressSuggestions([]);
    const addr = await getAddressFromCoordinates(coords.latitude, coords.longitude);
    setLocationAddress(addr ? addr.fullAddress : item.address);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { ...coords, latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM, longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM },
        500
      );
    }
  };

  const handleUseMyLocation = () => {
    if (!currentLocation) return;
    setSelectedLocation(currentLocation);
    getAddressFromCoordinates(currentLocation.latitude, currentLocation.longitude).then(
      (addr) => addr && setLocationAddress(addr.fullAddress)
    );
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { ...currentLocation, latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM, longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM },
        500
      );
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    if (!isWithinNamibia(selectedLocation.latitude, selectedLocation.longitude)) {
      Alert.alert('Invalid Location', 'Please select a location within Namibia.', [{ text: 'OK' }]);
      return;
    }
    if (currentLocation) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      if (distance > CONFIG.MAX_DISTANCE_KM) {
        Alert.alert(
          'Location Too Far',
          `The selected location is ${distance.toFixed(0)} km from your current location. Please select within ${CONFIG.MAX_DISTANCE_KM} km.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }
    const formFields = parseAddressForForm(locationAddress);
    navigation.navigate('ReportPothole', {
      locationResult: {
        selectedLocation,
        locationAddress,
        locationSource: 'map_selected',
        formFields,
      },
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const styles = getStyles(colors, insets);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            Set damage location
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Search or tap the map to place pin
          </Text>
        </View>
      </View>

      {/* Search — using SearchInput component */}
      <View style={styles.searchWrapper}>
        <SearchInput
          placeholder="Search address, street, or landmark..."
          onSearch={handleMapSearch}
          onClear={() => { setMapSearchQuery(''); setAddressSuggestions([]); }}
          debounceDelay={400}
          suggestions={addressSuggestions.map((s) => s.address)}
          showSuggestions={addressSuggestions.length > 0}
          onSuggestionSelect={handleAddressSelect}
          value={mapSearchQuery}
          onChangeTextImmediate={setMapSearchQuery}
          accessibilityLabel="Search for address"
          accessibilityHint="Type to find an address in Namibia"
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapComponent
          ref={mapRef}
          mode="select"
          initialRegion={mapRegion}
          onPress={handleMapPress}
          roadworks={roadworks}
          selectedLocation={selectedLocation}
          onMarkerDragEnd={handleMarkerDragEnd}
          showRoadworks={true}
          showSelectedMarker={true}
          markerTitle="Damage Location"
          markerDescription="Drag to adjust"
          style={styles.map}
        />

        {currentLocation && isMapAvailable && (
          <TouchableOpacity style={styles.myLocationBtn} onPress={handleUseMyLocation} activeOpacity={0.8}>
            <Ionicons name="locate" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        {!selectedLocation && (
          <View style={styles.tapHint}>
            <Ionicons name="navigate" size={18} color={colors.textSecondary} />
            <Text style={styles.tapHintText}>Tap the map to place the pin</Text>
          </View>
        )}
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        {selectedLocation ? (
          <>
            <View style={styles.bottomContent}>
              <View style={[styles.bottomIconWrap, { backgroundColor: colors.success + '18' }]}>
                <Ionicons name="location" size={22} color={colors.success} />
              </View>
              <View style={styles.bottomText}>
                {locationAddress ? <Text style={[styles.bottomAddress, { color: colors.text }]}>{locationAddress}</Text> : null}
                <Text style={[styles.bottomCoords, { color: colors.textSecondary }]}>
                  {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Use this location</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.bottomEmpty}>
            <Text style={[styles.bottomEmptyText, { color: colors.textSecondary }]}>Select a point on the map</Text>
            <Text style={[styles.bottomEmptyHint, { color: colors.textSecondary }]}>Tap anywhere or search for an address</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function getStyles(colors, insets) {
  const bottomInset = insets?.bottom || 0;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: 1,
      minHeight: 56,
      ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 }, android: { elevation: 2 } }),
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    headerContent: { flex: 1, minWidth: 0, marginHorizontal: spacing.sm },
    title: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
    subtitle: { fontSize: 13, lineHeight: 18 },
    searchWrapper: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      zIndex: 2000,
    },
    mapContainer: { flex: 1, zIndex: 1 },
    map: { flex: 1 },
    myLocationBtn: {
      position: 'absolute',
      bottom: 24,
      right: spacing.lg,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 }, android: { elevation: 4 } }),
    },
    tapHint: {
      position: 'absolute',
      top: spacing.lg,
      left: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    tapHintText: { fontSize: 14, color: colors.textSecondary },
    bottomSheet: {
      padding: spacing.lg,
      paddingBottom: bottomInset + spacing.lg,
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: { elevation: 8 } }),
    },
    bottomContent: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
    bottomIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    bottomText: { flex: 1 },
    bottomAddress: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    bottomCoords: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 }, android: { elevation: 4 } }),
    },
    confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    bottomEmpty: { paddingVertical: spacing.sm },
    bottomEmptyText: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    bottomEmptyHint: { fontSize: 14 },
  });
}

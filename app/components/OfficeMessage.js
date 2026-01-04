import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const OfficeMessage = ({ office, colors }) => {
  const [mapError, setMapError] = useState(false);

  const getStaticMapUrl = () => {
    if (!office.coordinates || !office.coordinates.latitude || !office.coordinates.longitude) {
      return null;
    }

    const { latitude, longitude } = office.coordinates;
    const width = 300;
    const height = 150;
    const zoom = 14;

    // Use OpenStreetMap static map service (free, no API key required)
    // Alternative: Can switch to Google Maps Static API or Mapbox if needed
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=${latitude},${longitude},lightblue1`;
  };
  const handleDirections = () => {
    if (!office.coordinates || !office.coordinates.latitude || !office.coordinates.longitude) {
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

  const handleCall = () => {
    if (!office.contactNumber) {
      Alert.alert('No Phone Number', 'This location does not have a contact number.');
      return;
    }
    
    Linking.openURL(`tel:${office.contactNumber}`).catch((err) => {
      console.error('Error opening phone:', err);
      Alert.alert('Error', 'Could not make phone call');
    });
  };

  const handleEmail = () => {
    if (!office.email) {
      Alert.alert('No Email', 'This location does not have an email address.');
      return;
    }
    
    Linking.openURL(`mailto:${office.email}`).catch((err) => {
      console.error('Error opening email:', err);
      Alert.alert('Error', 'Could not open email client');
    });
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <Text style={styles.name}>{office.name}</Text>
      </View>
      
      <Text style={styles.address}>
        {office.address}, {office.region}
      </Text>
      
      {office.distance !== undefined && (
        <Text style={styles.distance}>
          📏 {office.distance.toFixed(1)} km away
        </Text>
      )}
      
      {office.coordinates && office.coordinates.latitude && office.coordinates.longitude && !mapError && (
        <TouchableOpacity
          style={styles.mapPreviewContainer}
          onPress={handleDirections}
          activeOpacity={0.8}
          accessibilityLabel="Map preview, tap to open in Maps app"
          accessibilityRole="button"
        >
          <Image
            source={{ uri: getStaticMapUrl() }}
            style={styles.mapPreview}
            resizeMode="cover"
            onError={() => setMapError(true)}
          />
          <View style={styles.mapOverlay}>
            <Ionicons name="map" size={16} color="#FFFFFF" />
            <Text style={styles.mapOverlayText}>Tap to open in Maps</Text>
          </View>
        </TouchableOpacity>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={handleDirections}
          accessibilityLabel="Get directions to this office"
          accessibilityRole="button"
        >
          <Ionicons name="navigate" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Directions</Text>
        </TouchableOpacity>
        
        {office.contactNumber && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
            onPress={handleCall}
            accessibilityLabel={`Call ${office.contactNumber}`}
            accessibilityRole="button"
          >
            <Ionicons name="call" size={18} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>Call</Text>
          </TouchableOpacity>
        )}
        
        {office.email && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleEmail}
            accessibilityLabel={`Email ${office.email}`}
            accessibilityRole="button"
          >
            <Ionicons name="mail" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Email</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: colors.text,
  },
  address: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.primary,
  },
  mapPreviewContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    position: 'relative',
  },
  mapPreview: {
    width: '100%',
    height: 150,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});


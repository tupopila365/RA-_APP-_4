import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const DEFAULT_REGION = {
  latitude: -22.0,
  longitude: 17.0,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

function isValidCoords(loc) {
  return loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number';
}

export function ReportDamageMapScreen({ location: storedLocation, onBack }) {
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(() =>
    isValidCoords(storedLocation) ? storedLocation : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function autoDetectLocation() {
      setError(null);
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setError('Location permission denied.');
          if (isValidCoords(storedLocation)) setCoords(storedLocation);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch (e) {
        if (!cancelled) {
          setError('Could not get location.');
          if (isValidCoords(storedLocation)) setCoords(storedLocation);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    autoDetectLocation();
    return () => { cancelled = true; };
  }, []);

  const initialRegion = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        400
      );
    }
  }, [coords?.latitude, coords?.longitude]);

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.container}>
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={false}
        >
          {coords && (
            <Marker
              coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
              title="Report location"
              description="Road damage reported here"
              pinColor={PRIMARY}
            />
          )}
        </MapView>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Detecting location…</Text>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.label}>Report location</Text>
        {error && !coords && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        <Text style={styles.hint}>
          {coords
            ? 'Your road damage report has been submitted. This marker shows where you reported the issue.'
            : 'Location is used to show your report on the map.'}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  mapWrap: {
    flex: 1,
    minHeight: 280,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
  errorText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  label: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
});

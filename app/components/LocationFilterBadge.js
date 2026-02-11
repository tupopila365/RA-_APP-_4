import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * LocationFilterBadge - Reusable location filter status/action badge
 *
 * Displays one of three states in a consistent pill/button style:
 * - Detecting: "Detecting your location" with spinner (while fetching)
 * - Filtered: "Filtered by your location" (when location-based filter is active)
 * - Action: "Use My Location" (tappable button when no location)
 *
 * Can be imported by Road Status, Report Pothole, and other screens that filter by location.
 */
export function LocationFilterBadge({
  isDetectingLocation = false,
  isFilteredByLocation = false,
  onUseLocation,
  testID,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (isDetectingLocation) {
    return (
      <View style={styles.badge} accessible accessibilityLabel="Detecting your location">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary }]}>Detecting your location</Text>
      </View>
    );
  }

  if (isFilteredByLocation) {
    return (
      <View style={styles.badge} accessible accessibilityLabel="Filtered by your location">
        <Ionicons name="location" size={14} color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary }]}>Filtered by your location</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.badge}
      onPress={onUseLocation}
      accessibilityLabel="Use my location to filter"
      accessibilityRole="button"
      activeOpacity={0.7}
      testID={testID}
    >
      <Ionicons name="location-outline" size={16} color={colors.primary} />
      <Text style={[styles.text, { color: colors.primary }]}>Use My Location</Text>
    </TouchableOpacity>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    text: {
      ...typography.caption,
      fontSize: 12,
      fontWeight: '500',
    },
  });
}

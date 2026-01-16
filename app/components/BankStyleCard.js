import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const BankStyleCard = ({ 
  children, 
  style, 
  elevation = 1, // Reduced default elevation for Android safety
  borderRadius = 12,
  padding = 16,
  margin = 0,
  backgroundColor,
  ...props 
}) => {
  const { colors, isDark } = useTheme();
  
  // Always use solid white for bank-grade consistency
  const cardBackgroundColor = backgroundColor || '#FFFFFF';
  
  return (
    <View
      style={[
        styles.card,
        {
          borderRadius,
          padding,
          margin,
          backgroundColor: cardBackgroundColor,
          // Android-safe elevation (max 2)
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: Math.min(elevation, 2) },
              shadowOpacity: isDark ? 0 : 0.1,
              shadowRadius: Math.min(elevation * 2, 4),
            },
            android: {
              elevation: isDark ? 0 : Math.min(elevation, 2),
            },
          }),
          // Always include border for consistency
          borderWidth: 1,
          borderColor: isDark ? colors.border : '#E6EAF0',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Remove default shadow properties to avoid conflicts
  },
});
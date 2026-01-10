import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const BankStyleCard = ({ 
  children, 
  style, 
  elevation = 3,
  borderRadius = 12,
  padding = 16,
  margin = 0,
  backgroundColor,
  ...props 
}) => {
  const { colors, isDark } = useTheme();
  
  const cardBackgroundColor = backgroundColor || colors.card;
  
  return (
    <View
      style={[
        styles.card,
        {
          elevation: Platform.OS === 'android' ? (isDark ? 0 : elevation) : 0,
          borderRadius,
          padding,
          margin,
          backgroundColor: cardBackgroundColor,
          shadowOpacity: Platform.OS === 'ios' ? (isDark ? 0 : 0.25) : 0,
          shadowRadius: Platform.OS === 'ios' ? elevation : 0,
          shadowOffset: Platform.OS === 'ios' ? { width: 0, height: elevation } : { width: 0, height: 0 },
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
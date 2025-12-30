import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export function IconContainer({
  icon,
  iconName,
  color,
  backgroundColor,
  size = 40,
  style,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const bgColor = backgroundColor || color + '20';
  const iconColor = color || colors.primary;
  const iconSize = size * 0.6; // Icon is 60% of container size

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      {iconName && (
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      )}
      {icon && icon}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });





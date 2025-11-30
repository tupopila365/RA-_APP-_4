import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export function EmptyState({
  message = 'No items found',
  icon = 'inbox-outline',
  testID,
  accessibilityLabel,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="text"
    >
      <Ionicons name={icon} size={64} color={colors.textSecondary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    message: {
      marginTop: 15,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
  });

import React from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme, Text } from 'react-native';
import { RATheme } from '../theme/colors';
import { LoadingOverlay } from './LoadingOverlay';

export function LoadingSpinner({ 
  size = 'large', 
  message,
  fullScreen = false,
  overlay = false,
  loading = true,
  testID,
}) {
  // If overlay prop is true, use LoadingOverlay component
  if (overlay) {
    return (
      <LoadingOverlay
        loading={loading}
        message={message}
        size={size}
        testID={testID}
      />
    );
  }

  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const content = (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={colors.primary}
        testID={testID}
        accessible={true}
        accessibilityLabel="Loading content"
        accessibilityRole="progressbar"
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        {content}
      </View>
    );
  }

  return content;
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    fullScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    message: {
      marginTop: 15,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
  });

import React from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme, Text } from 'react-native';
import { RATheme } from '../theme/colors';

/**
 * LoadingIndicator - A reusable loading component with blue circle spinner
 * 
 * @param {Object} props
 * @param {string} props.size - Size of the spinner ('small' | 'large' | number)
 * @param {string} props.message - Optional message to display below spinner
 * @param {boolean} props.fullScreen - Whether to show as full screen overlay
 * @param {string} props.testID - Test identifier
 * @param {string} props.color - Custom color for spinner (defaults to primary blue)
 * 
 * @example
 * <LoadingIndicator />
 * <LoadingIndicator message="Loading data..." />
 * <LoadingIndicator fullScreen size="large" />
 */
export function LoadingIndicator({ 
  size = 'large', 
  message,
  fullScreen = false,
  testID,
  color,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);
  const spinnerColor = color || colors.primary; // Default to blue primary color

  const content = (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
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
      textAlign: 'center',
    },
  });
























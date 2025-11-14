import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { Button } from './Button';

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  icon = 'alert-circle',
  testID,
  fullScreen = false,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const content = (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          label="Try Again"
          onPress={onRetry}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <View style={styles.containerOnly} testID={testID}>
      {content}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    containerOnly: {
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
      marginHorizontal: 20,
    },
    button: {
      marginTop: 20,
    },
  });

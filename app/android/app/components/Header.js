import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export function Header({
  title,
  subtitle,
  icon,
  onIconPress,
  gradient = true,
  testID,
  accessibilityLabel,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const headerContent = (
    <View style={styles.headerContent}>
      <View style={styles.textContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {icon && (
        <TouchableOpacity 
          onPress={onIconPress}
          style={styles.iconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.header}
        testID={testID}
      >
        {headerContent}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.header, styles.headerNoGradient]} testID={testID}>
      {headerContent}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerNoGradient: {
      backgroundColor: colors.primary,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    subtitle: {
      color: '#FFFFFF',
      fontSize: 14,
      opacity: 0.9,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

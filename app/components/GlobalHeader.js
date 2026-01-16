import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Global Header Component - Bank-grade, government-ready
 * Used across all screens for consistency
 * Based on approved design from locked pages
 */
export function GlobalHeader({
  title,
  subtitle,
  icon,
  onIconPress,
  gradient = true,
  testID,
  accessibilityLabel,
  showBackButton = false,
  onBackPress,
  rightActions = [],
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const headerContent = (
    <View style={styles.headerContent}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={onBackPress}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {rightActions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            onPress={action.onPress}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
          >
            <Ionicons name={action.icon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ))}
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
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primary]}
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
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    headerNoGradient: {
      backgroundColor: colors.primary,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 5,
      ...typography.h2,
    },
    subtitle: {
      color: '#FFFFFF',
      fontSize: 14,
      opacity: 0.9,
      ...typography.bodySmall,
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
  });
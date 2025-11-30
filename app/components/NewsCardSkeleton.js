import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';

export function NewsCardSkeleton() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.categoryBadge, { opacity }]} />
        <Animated.View style={[styles.date, { opacity }]} />
      </View>
      <Animated.View style={[styles.title, { opacity }]} />
      <Animated.View style={[styles.titleShort, { opacity }]} />
      <Animated.View style={[styles.excerpt, { opacity }]} />
      <Animated.View style={[styles.excerptShort, { opacity }]} />
      <Animated.View style={[styles.readMore, { opacity }]} />
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryBadge: {
      width: 80,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    date: {
      width: 70,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.border,
    },
    title: {
      width: '100%',
      height: 18,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginBottom: 8,
    },
    titleShort: {
      width: '60%',
      height: 18,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    excerpt: {
      width: '100%',
      height: 14,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginBottom: 6,
    },
    excerptShort: {
      width: '80%',
      height: 14,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    readMore: {
      width: 90,
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
  });

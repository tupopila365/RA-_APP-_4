/**
 * SpinnerCore - Custom animated loading ring (enterprise design)
 * Pure rotation animation, no external dependencies.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const SIZE_MAP = {
  small: 20,
  medium: 32,
  large: 48,
};

const DOT_COUNT = 12;

export function SpinnerCore({ size = 'large', color = '#00B4E6', testID }) {
  const ringSize = typeof size === 'number' ? size : (SIZE_MAP[size] ?? SIZE_MAP.large);
  const dotSize = Math.max(2, Math.floor(ringSize / 12));
  const radius = (ringSize - dotSize) / 2;

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dots = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (i / DOT_COUNT) * 2 * Math.PI - Math.PI / 2;
    const opacity = 0.2 + (1 - i / DOT_COUNT) * 0.8;
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            opacity,
            left: ringSize / 2 + radius * Math.cos(angle) - dotSize / 2,
            top: ringSize / 2 + radius * Math.sin(angle) - dotSize / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[styles.container, { width: ringSize, height: ringSize }]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    >
      <Animated.View style={[styles.ring, { width: ringSize, height: ringSize, transform: [{ rotate }] }]}>
        {dots}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
  },
});

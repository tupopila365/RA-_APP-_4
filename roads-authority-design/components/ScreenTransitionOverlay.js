import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { PRIMARY, NEUTRAL_COLORS } from '../theme/colors';

export function ScreenTransitionOverlay({ visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true;
      setMounted(true);
      opacity.setValue(0);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      spin.setValue(0);
      const loop = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 850,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }

    if (!wasVisibleRef.current) return undefined;
    wasVisibleRef.current = false;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
    return undefined;
  }, [visible, opacity, spin]);

  if (!mounted) {
    return null;
  }

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.overlay, { opacity }]}
    >
      <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
    </Animated.View>
  );
}

const RING_SIZE = 64;
const RING_THICKNESS = 7;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: 'rgba(235, 238, 243, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_THICKNESS,
    borderColor: NEUTRAL_COLORS.gray200,
    borderTopColor: PRIMARY,
  },
});


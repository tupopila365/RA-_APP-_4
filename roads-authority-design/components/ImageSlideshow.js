import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_INTERVAL_MS = 4000;

/**
 * Horizontal image slideshow with auto-advance and dot indicators.
 * @param {{ images: Array<number> }} images - Array of require()'d image sources
 * @param {{ height?: number, borderRadius?: number }} style overrides
 */
export function ImageSlideshow({ images, height = 160, borderRadius = 12 }) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images?.length]);

  useEffect(() => {
    if (!images || images.length <= 1 || !scrollRef.current) return;
    scrollRef.current.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  }, [index, images?.length]);

  if (!images || images.length === 0) return null;

  return (
    <View style={[styles.wrap, { borderRadius }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          if (i >= 0 && i < images.length) setIndex(i);
        }}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((source, i) => (
          <Image
            key={i}
            source={source}
            style={[styles.slide, { width: SCREEN_WIDTH, height }]}
            resizeMode="cover"
            accessibilityLabel={`Slide ${i + 1} of ${images.length}`}
          />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  slide: {
    flexGrow: 0,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS, CONTENT_BACKGROUND } from '../theme/colors';

const CAROUSEL_IMAGES = [require('../assets/carousel-1.png')];
const CAROUSEL_ASPECT_RATIO = 3960 / 990;

export function HomeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const slideWidth = width || 320;
  const slideHeight = slideWidth / CAROUSEL_ASPECT_RATIO;
  const showDots = CAROUSEL_IMAGES.length > 1;

  return (
    <View
      style={styles.section}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const { contentOffset, layoutMeasurement } = event.nativeEvent;
          const nextIndex = Math.round(contentOffset.x / Math.max(layoutMeasurement.width, 1));
          setActiveIndex(nextIndex);
        }}
      >
        {CAROUSEL_IMAGES.map((imageSource, index) => (
          <View
            key={String(index)}
            style={[styles.slide, { width: slideWidth, height: slideHeight }]}
          >
            <Image
              source={imageSource}
              style={[styles.image, { height: slideHeight }]}
              resizeMode="cover"
              accessibilityLabel="NaTIS operating hours banner"
            />
          </View>
        ))}
      </ScrollView>
      {showDots ? (
        <View style={styles.dots}>
          {CAROUSEL_IMAGES.map((_, index) => (
            <View
              key={String(index)}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: CONTENT_BACKGROUND,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  slide: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  dots: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: NEUTRAL_COLORS.gray300,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#00B4E6',
  },
});

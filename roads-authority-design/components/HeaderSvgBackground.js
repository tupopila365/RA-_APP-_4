import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
} from 'react-native-svg';

/**
 * Home header backdrop.
 *
 * Design intent: one calm, intentional motif rather than a collage of shapes.
 * A refined brand-blue gradient grounds the header; a soft glow lifts the logo
 * area; and a single family of concentric "ripple" rings — anchored off the
 * bottom-right corner — adds quiet movement (a subtle nod to roads radiating
 * outward). Everything is low-contrast and tonal so foreground content always
 * stays the hero.
 */
export function HeaderSvgBackground({ style }) {
  const [layout, setLayout] = useState({ width: 400, height: 320 });
  const { width, height } = layout;

  // Ripple rings anchored just past the bottom-right corner.
  const ringCx = width * 0.96;
  const ringCy = height * 1.02;
  const ringRadii = [width * 0.28, width * 0.46, width * 0.66, width * 0.88];

  return (
    <View
      style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }, style]}
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        if (w > 0 && h > 0) setLayout({ width: w, height: h });
      }}
    >
      <Svg width={width} height={height}>
        <Defs>
          {/* Brand gradient — gentle diagonal, deeper at the top-left so the
              status bar feels anchored, easing into a lighter sky tone. */}
          <LinearGradient id="hdrBrand" x1="0%" y1="0%" x2="85%" y2="100%">
            <Stop offset="0%" stopColor="#0094C4" />
            <Stop offset="48%" stopColor="#00ACDD" />
            <Stop offset="100%" stopColor="#2DBFEC" />
          </LinearGradient>

          {/* Soft glow that sits behind the logo/greeting to draw the eye. */}
          <RadialGradient id="hdrGlow" cx="50%" cy="34%" r="62%">
            <Stop offset="0%" stopColor="#BDEBFB" stopOpacity="0.34" />
            <Stop offset="55%" stopColor="#BDEBFB" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#BDEBFB" stopOpacity="0" />
          </RadialGradient>

          {/* Quiet vignette toward the lower edge for depth and grounding. */}
          <LinearGradient id="hdrShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#004F69" stopOpacity="0" />
            <Stop offset="100%" stopColor="#004F69" stopOpacity="0.16" />
          </LinearGradient>
        </Defs>

        {/* Base */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#hdrBrand)" />

        {/* Concentric ripple rings (the single motif). */}
        {ringRadii.map((r, i) => (
          <Circle
            key={`ring-${i}`}
            cx={ringCx}
            cy={ringCy}
            r={r}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.16 - i * 0.03}
            strokeWidth={1.5}
          />
        ))}

        {/* A large, very soft highlight bleeding off the top-left — adds a
            hand-placed sense of light without any hard edges. */}
        <Ellipse
          cx={width * 0.06}
          cy={height * 0.04}
          rx={width * 0.5}
          ry={height * 0.42}
          fill="#FFFFFF"
          fillOpacity={0.05}
        />

        {/* Glow behind the brand block + grounding shade. */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#hdrGlow)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#hdrShade)" />
      </Svg>
    </View>
  );
}

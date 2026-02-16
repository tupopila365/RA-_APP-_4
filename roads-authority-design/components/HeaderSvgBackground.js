import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Rect,
  Ellipse,
  Circle,
  Polygon,
} from 'react-native-svg';

/**
 * Enterprise Header – Stronger Visual Presence
 * Same design, more visible shapes, still premium.
 */
export function HeaderSvgBackground({ style }) {
  const [layout, setLayout] = useState({ width: 400, height: 150 });
  const { width, height } = layout;

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
          <LinearGradient id="headerBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0099CC" />
            <Stop offset="50%" stopColor="#00B4E6" />
            <Stop offset="100%" stopColor="#33C4ED" />
          </LinearGradient>

          {/* Stronger glow */}
          <RadialGradient id="headerOrb" cx="50%" cy="40%" r="70%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Base gradient */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#headerBg)" />

        {/* Enhanced glow */}
        <Ellipse
          cx={width * 0.55}
          cy={height * 0.35}
          rx={width * 0.55}
          ry={height * 0.7}
          fill="url(#headerOrb)"
        />

        {/* Large cropped left circle */}
        <Circle
          cx={-width * 0.05}
          cy={height * 0.25}
          r={height * 0.95}
          fill="#FFFFFF"
          fillOpacity={0.12}
          stroke="#FFFFFF"
          strokeOpacity={0.25}
          strokeWidth={1.5}
        />

        {/* Right background circle */}
        <Circle
          cx={width * 0.95}
          cy={height * 0.8}
          r={height * 0.7}
          fill="#FFFFFF"
          fillOpacity={0.1}
          stroke="#FFFFFF"
          strokeOpacity={0.22}
          strokeWidth={1.2}
        />

        {/* More visible structured triangle */}
        <Polygon
          points={`${width * 0.75},0 ${width},${height * 0.5} ${width * 0.6},${height * 0.5}`}
          fill="#FFFFFF"
          opacity={0.12}
        />

      </Svg>
    </View>
  );
}
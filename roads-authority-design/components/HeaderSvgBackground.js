import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Rect,
  Polygon,
} from 'react-native-svg';

const DARK = '#006B8F';
const DARK_STROKE = '#005A7A';

/**
 * Corporate header: clean geometric shapes – bars, angled panels, chevrons.
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
          <RadialGradient id="headerOrb" cx="50%" cy="40%" r="70%">
            <Stop offset="0%" stopColor={DARK} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={DARK} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#headerBg)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#headerOrb)" />

        {/* Top accent bar */}
        <Rect x={0} y={0} width={width} height={height * 0.04} fill={DARK} fillOpacity={0.25} />
        {/* Bottom accent bar */}
        <Rect x={0} y={height * 0.96} width={width} height={height * 0.04} fill={DARK} fillOpacity={0.2} />

        {/* Left diagonal stripe panel */}
        <Polygon
          points={`0,0 ${width * 0.35},0 ${width * 0.22},${height} 0,${height}`}
          fill={DARK}
          fillOpacity={0.12}
        />
        {/* Right diagonal stripe panel */}
        <Polygon
          points={`${width * 0.65},0 ${width},0 ${width},${height} ${width * 0.78},${height}`}
          fill={DARK}
          fillOpacity={0.1}
        />

        {/* Chevron – right side, corporate forward-motion */}
        <Polygon
          points={`${width * 0.72},${height * 0.25} ${width * 0.92},${height * 0.5} ${width * 0.72},${height * 0.75}`}
          fill={DARK}
          fillOpacity={0.18}
          stroke={DARK_STROKE}
          strokeOpacity={0.25}
          strokeWidth={1}
        />

        {/* Narrow vertical bar – left */}
        <Rect x={width * 0.06} y={height * 0.2} width={width * 0.02} height={height * 0.6} fill={DARK} fillOpacity={0.2} />
        {/* Narrow vertical bar – right */}
        <Rect x={width * 0.92} y={height * 0.15} width={width * 0.02} height={height * 0.7} fill={DARK} fillOpacity={0.15} />

        {/* Horizontal band – mid */}
        <Rect x={width * 0.15} y={height * 0.42} width={width * 0.7} height={height * 0.06} fill={DARK} fillOpacity={0.14} />
        {/* Horizontal band – lower */}
        <Rect x={width * 0.25} y={height * 0.78} width={width * 0.5} height={height * 0.04} fill={DARK} fillOpacity={0.12} />

        {/* Small trapezoid – top right corner */}
        <Polygon
          points={`${width * 0.8},0 ${width},0 ${width},${height * 0.2} ${width * 0.85},${height * 0.18}`}
          fill={DARK}
          fillOpacity={0.15}
        />
        {/* Small trapezoid – bottom left */}
        <Polygon
          points={`0,${height * 0.75} 0,${height} ${width * 0.2},${height} ${width * 0.15},${height * 0.78}`}
          fill={DARK}
          fillOpacity={0.12}
        />
      </Svg>
    </View>
  );
}
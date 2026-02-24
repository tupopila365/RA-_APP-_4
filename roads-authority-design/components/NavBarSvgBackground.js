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
 * Lower navigation – same corporate shapes as header: bars, angled panels, chevrons.
 */
export function NavBarSvgBackground({ style }) {
  const [layout, setLayout] = useState({ width: 400, height: 80 });
  const { width, height } = layout;

  return (
    <View
      style={[
        { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
        style,
      ]}
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        if (w > 0 && h > 0) setLayout({ width: w, height: h });
      }}
    >
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <Defs>
          <LinearGradient id="navBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0099CC" />
            <Stop offset="50%" stopColor="#00B4E6" />
            <Stop offset="100%" stopColor="#33C4ED" />
          </LinearGradient>
          <RadialGradient id="navOrb" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={DARK} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={DARK} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#navBg)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#navOrb)" />

        {/* Bottom accent bar */}
        <Rect x={0} y={height * 0.92} width={width} height={height * 0.08} fill={DARK} fillOpacity={0.22} />

        {/* Left diagonal panel */}
        <Polygon
          points={`0,0 ${width * 0.4},0 ${width * 0.25},${height} 0,${height}`}
          fill={DARK}
          fillOpacity={0.12}
        />
        {/* Right diagonal panel */}
        <Polygon
          points={`${width * 0.6},0 ${width},0 ${width},${height} ${width * 0.75},${height}`}
          fill={DARK}
          fillOpacity={0.1}
        />

        {/* Chevron – center-right */}
        <Polygon
          points={`${width * 0.7},${height * 0.15} ${width * 0.88},${height * 0.5} ${width * 0.7},${height * 0.85}`}
          fill={DARK}
          fillOpacity={0.18}
          stroke={DARK_STROKE}
          strokeOpacity={0.24}
          strokeWidth={0.8}
        />

        {/* Narrow vertical bar – left */}
        <Rect x={width * 0.08} y={height * 0.15} width={width * 0.018} height={height * 0.7} fill={DARK} fillOpacity={0.2} />
        {/* Narrow vertical bar – right */}
        <Rect x={width * 0.91} y={height * 0.1} width={width * 0.018} height={height * 0.8} fill={DARK} fillOpacity={0.16} />

        {/* Horizontal band – mid */}
        <Rect x={width * 0.2} y={height * 0.38} width={width * 0.6} height={height * 0.12} fill={DARK} fillOpacity={0.14} />

        {/* Trapezoid – top right corner */}
        <Polygon
          points={`${width * 0.82},0 ${width},0 ${width},${height * 0.35} ${width * 0.88},${height * 0.3}`}
          fill={DARK}
          fillOpacity={0.14}
        />
        {/* Trapezoid – bottom left */}
        <Polygon
          points={`0,${height * 0.65} 0,${height} ${width * 0.18},${height} ${width * 0.12},${height * 0.68}`}
          fill={DARK}
          fillOpacity={0.12}
        />
      </Svg>
    </View>
  );
}
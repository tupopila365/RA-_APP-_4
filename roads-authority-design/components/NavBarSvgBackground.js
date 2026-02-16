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
  Path,
} from 'react-native-svg';

/**
 * Lower navigation SVG design – matches header style.
 * RA blue gradient, soft orb, decorative circles + triangle, subtle wave, gold bottom band.
 */
export function NavBarSvgBackground({ style }) {
  const [layout, setLayout] = useState({ width: 400, height: 80 });
  const { width, height } = layout;

  const goldHeight = height * 0.12;
  const orbY = height * 0.35;

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
          {/* Same palette as header */}
          <LinearGradient id="navBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0099CC" />
            <Stop offset="50%" stopColor="#00B4E6" />
            <Stop offset="100%" stopColor="#33C4ED" />
          </LinearGradient>

          <RadialGradient id="navOrb" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
            <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>

          {/* Gold accent band at bottom */}
          <LinearGradient id="navGold" x1="0%" y1="0%" x2="0%" y2="1">
            <Stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <Stop offset="40%" stopColor="#FFD700" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#FFD700" stopOpacity="0.1" />
          </LinearGradient>

          <RadialGradient id="navTexture" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.03" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#navBg)" />

        <Ellipse
          cx={width * 0.5}
          cy={orbY}
          rx={width * 0.45}
          ry={height * 0.55}
          fill="url(#navOrb)"
          opacity={0.88}
        />

        <Circle
          cx={width * 0.12}
          cy={height * 0.4}
          r={height * 0.3}
          fill="#FFFFFF"
          fillOpacity={0.1}
          stroke="#FFFFFF"
          strokeOpacity={0.15}
          strokeWidth={0.8}
        />

        <Circle
          cx={width * 0.88}
          cy={height * 0.6}
          r={height * 0.26}
          fill="#FFFFFF"
          fillOpacity={0.08}
          stroke="#FFFFFF"
          strokeOpacity={0.12}
          strokeWidth={0.8}
        />

        <Polygon
          points={`${width * 0.7},${height * 0.2} ${width * 0.9},${height * 0.5} ${width * 0.6},${height * 0.5}`}
          fill="#FFFFFF"
          opacity={0.035}
        />

        {/* Subtle top wave – echoes header */}
        <Path
          d={`M0 ${height * 0.25} Q ${width * 0.25} ${height * 0.15} ${width * 0.5} ${height * 0.25} T ${width} ${height * 0.2}`}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.06}
          strokeWidth={1.5}
        />

        <Rect
          x={0}
          y={height - goldHeight}
          width={width}
          height={goldHeight}
          fill="url(#navGold)"
        />

        <Rect x={0} y={0} width={width} height={height} fill="url(#navTexture)" opacity={0.7} />
      </Svg>
    </View>
  );
}
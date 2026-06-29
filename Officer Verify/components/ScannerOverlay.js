import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

export function ScannerOverlay() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.dimTop} />
      <View style={styles.middleRow}>
        <View style={styles.dimSide} />
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <View style={styles.dimSide} />
      </View>
      <View style={styles.dimBottom}>
        <Text style={styles.hint}>Align the live QR code within the frame</Text>
        <Text style={styles.subhint}>Ask them to open Officer verification in myRA</Text>
      </View>
    </View>
  );
}

const FRAME = 260;
const CORNER = 28;
const BORDER = 4;

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  dimTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME,
  },
  dimSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  frame: {
    width: FRAME,
    height: FRAME,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#FFFFFF',
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER,
    borderLeftWidth: BORDER,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER,
    borderRightWidth: BORDER,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER,
    borderLeftWidth: BORDER,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER,
    borderRightWidth: BORDER,
  },
  dimBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  hint: {
    ...typography.body,
    color: NEUTRAL_COLORS.white,
    textAlign: 'center',
  },
  subhint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray300,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

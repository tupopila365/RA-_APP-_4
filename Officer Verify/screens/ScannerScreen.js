import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScannerOverlay, VerifierHeader } from '../components';
import { verifyByQr } from '../services/licenceVerifyService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

export function ScannerScreen({ onBack, onResult }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scannedRef = useRef(false);

  useEffect(() => {
    scannedRef.current = false;
    setProcessing(false);
  }, []);

  const handleBarcode = useCallback(
    async ({ data }) => {
      if (scannedRef.current || processing || !data) return;
      scannedRef.current = true;
      setProcessing(true);
      try {
        const result = await verifyByQr(data);
        onResult?.(result);
      } finally {
        setProcessing(false);
      }
    },
    [onResult, processing]
  );

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.root}>
        <VerifierHeader title="Scan QR" onBack={onBack} />
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={48} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            RA Verifier needs the camera to scan licence QR codes.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Allow camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={processing ? undefined : handleBarcode}
      />
      <ScannerOverlay />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={onBack} style={styles.topBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={NEUTRAL_COLORS.white} />
        </Pressable>
        <Text style={styles.topTitle}>Scan licence QR</Text>
        <Pressable onPress={() => setTorch((t) => !t)} style={styles.topBtn} hitSlop={12}>
          <Ionicons
            name={torch ? 'flashlight' : 'flashlight-outline'}
            size={24}
            color={NEUTRAL_COLORS.white}
          />
        </Pressable>
      </View>

      {processing ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color={NEUTRAL_COLORS.white} />
          <Text style={styles.processingText}>Verifying…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.black,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  permissionTitle: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginTop: spacing.lg,
  },
  permissionText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  permissionBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
  },
  permissionBtnText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topBtn: {
    width: 44,
    alignItems: 'center',
  },
  topTitle: {
    flex: 1,
    ...typography.h5,
    color: NEUTRAL_COLORS.white,
    textAlign: 'center',
  },
  processing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  processingText: {
    ...typography.body,
    color: NEUTRAL_COLORS.white,
  },
});

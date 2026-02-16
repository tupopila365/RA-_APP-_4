import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import { useDrawer } from '../context/DrawerContext';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const RALogo = require('../assets/icon.png');
const NATIS_URL = 'https://natis.nra.org.na/';
const E_RECRUITMENT_URL = 'https://recruitment.nra.org.na/';

function DrawerItem({ icon, label, sublabel, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.drawerItemIcon, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.drawerItemText}>
        <Text style={[styles.drawerItemLabel, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.drawerItemSublabel, { color: colors.textMuted }]}>{sublabel}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function navigate(name, params) {
  if (navigationRef.isReady() && navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function GlobalDrawer() {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const { isOpen, closeDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const userName = user?.fullName?.split(' ')[0] || 'Guest';

  const openLink = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      try {
        const { Linking } = require('react-native');
        await Linking.openURL(url);
      } catch (e) {
        console.warn('Could not open URL:', url);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false));
    }
  }, [isOpen, slideAnim, fadeAnim]);

  const drawerSlide = slideAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: [-320, 0],
  });

  const handleItemPress = (fn) => {
    closeDrawer();
    fn();
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { backgroundColor: colors.overlay, opacity: fadeAnim }]}
          pointerEvents="auto"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.background,
              transform: [{ translateX: drawerSlide }],
            },
          ]}
        >
          <View
            style={[
              styles.drawerHeader,
              {
                backgroundColor: colors.primary,
                paddingTop: Math.max(insets.top, 24) + spacing.md,
              },
            ]}
          >
            <View style={styles.drawerHeaderTop}>
              <Image
                source={RALogo}
                style={styles.drawerHeaderLogo}
                resizeMode="contain"
                {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
              />
              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.drawerCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.drawerGreeting}>Hello, {userName}</Text>
            <Text style={styles.drawerOrg}>Roads Authority Namibia</Text>
          </View>

          <ScrollView
            style={styles.drawerMenu}
            contentContainerStyle={styles.drawerMenuContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionLabel, styles.sectionLabelFirst, { color: colors.textMuted }]}>
              SERVICES
            </Text>
            <DrawerItem
              icon="grid-outline"
              label="RA Services"
              sublabel="Browse all services"
              onPress={() => handleItemPress(() => navigate('RAServices'))}
              colors={colors}
            />
            <DrawerItem
              icon="folder-open-outline"
              label="Applications"
              onPress={() => handleItemPress(() => navigate('Applications'))}
              colors={colors}
            />
            <DrawerItem
              icon="location-outline"
              label="Find Offices"
              onPress={() => handleItemPress(() => navigate('Offices'))}
              colors={colors}
            />
            <DrawerItem
              icon="settings-outline"
              label="Settings"
              onPress={() => handleItemPress(() => navigate('Settings'))}
              colors={colors}
            />
            <DrawerItem
              icon="help-circle-outline"
              label="FAQs"
              sublabel="Frequently asked questions"
              onPress={() => handleItemPress(() => navigate('FAQs'))}
              colors={colors}
            />

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>EXTERNAL LINKS</Text>
            <DrawerItem
              icon="car-outline"
              label="NATIS Online"
              sublabel="Vehicle registration"
              onPress={() => handleItemPress(() => openLink(NATIS_URL))}
              colors={colors}
            />
            <DrawerItem
              icon="people-outline"
              label="E-Recruitment"
              sublabel="Careers portal"
              onPress={() => handleItemPress(() => openLink(E_RECRUITMENT_URL))}
              colors={colors}
            />
          </ScrollView>

          <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
            <Image
              source={RALogo}
              style={styles.drawerFooterLogo}
              resizeMode="contain"
              {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
            />
            <Text style={[styles.drawerFooterText, { color: colors.textMuted }]}>
              Roads Authority Namibia
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: 300,
    maxWidth: '85%',
    flex: 1,
  },
  drawerHeader: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  drawerHeaderLogo: {
    width: 48,
    height: 48,
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerGreeting: {
    ...typography.h4,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  drawerOrg: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  drawerMenu: {
    flex: 1,
  },
  drawerMenuContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.label,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionLabelFirst: {
    paddingTop: spacing.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemText: {
    flex: 1,
  },
  drawerItemLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  drawerItemSublabel: {
    ...typography.caption,
    marginTop: 2,
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderTopWidth: 1,
  },
  drawerFooterLogo: {
    width: 20,
    height: 20,
  },
  drawerFooterText: {
    ...typography.caption,
  },
});

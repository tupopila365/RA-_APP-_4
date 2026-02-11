/**
 * HomeScreen - Dashboard-style home
 * - Header: Hamburger + User name + Road Status, Report Road Damage links
 * - Dashboard: Applications, NATIS, E-Recruitment
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import { useDrawer } from '../context/DrawerContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard, NewsCard } from '../components';
import { useNewsUseCases } from '../src/presentation/di/DependencyContext';
import { useNewsViewModel } from '../src/presentation/viewModels/useNewsViewModel';

import { plnService } from '../services/plnService';

const RALogo = require('../assets/icon.png');

const NATIS_URL = 'https://natis.nra.org.na/';
const E_RECRUITMENT_URL = 'https://recruitment.nra.org.na/';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [myApplicationsCount, setMyApplicationsCount] = useState(null);

  const { getNewsUseCase, searchNewsUseCase } = useNewsUseCases();
  const { allNews: newsItems, refresh: refreshNews } = useNewsViewModel({
    getNewsUseCase,
    searchNewsUseCase,
  });
  const latestNews = newsItems.slice(0, 3);

  const loadData = useCallback(async () => {
    try {
      if (user) {
        try {
          const apps = await plnService.getMyApplications();
          setMyApplicationsCount(Array.isArray(apps) ? apps.length : 0);
        } catch {
          setMyApplicationsCount(0);
        }
      } else {
        setMyApplicationsCount(null);
      }
    } catch (err) {
      console.warn('HomeScreen data load:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    refreshNews();
  }, [loadData, refreshNews]);

  const openLink = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      try {
        await Linking.openURL(url);
      } catch (e) {
        console.warn('Could not open URL:', url);
      }
    }
  };

  const userName = user?.fullName?.split(' ')[0] || 'Guest';

  const styles = getStyles(colors, insets);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={openDrawer}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerBrand}>
            <Image
              source={RALogo}
              style={styles.headerLogo}
              resizeMode="contain"
              {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
            />
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName || 'Guest'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>Hello, {userName}</Text>
            <Text style={styles.subtitle}>Roads Authority Digital Portal</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Most used services</Text>

          <UnifiedCard
            variant="elevated"
            padding="large"
            onPress={() => navigation.navigate('RoadStatus')}
            accessible
            accessibilityLabel="View road status"
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionContent}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: colors.primary + '25' }]}>
                <Ionicons name="map" size={32} color={colors.primary} />
              </View>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>Road Status</Text>
                <Text style={styles.quickActionMeta}>Real-time road conditions & closures</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </View>
          </UnifiedCard>

          <UnifiedCard
            variant="elevated"
            padding="large"
            onPress={() => navigation.navigate('ReportPothole')}
            accessible
            accessibilityLabel="Report road damage"
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionContent}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: colors.error + '25' }]}>
                <Ionicons name="warning" size={32} color={colors.error} />
              </View>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>Report Road Damage</Text>
                <Text style={styles.quickActionMeta}>Potholes, hazards & road issues</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </View>
          </UnifiedCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <Text style={styles.sectionSubtitle}>Stay informed</Text>

          {latestNews.length > 0 ? (
            latestNews.map((item) => (
              <NewsCard
                key={item.id}
                title={item.title}
                excerpt={item.getShortExcerpt?.() || item.excerpt}
                thumbnail={item.hasImage?.() ? item.imageUrl : null}
                date={item.getTimeAgo?.() || item.getFormattedDate?.()}
                category={item.category}
                onPress={() =>
                  navigation.navigate('News', {
                    screen: 'NewsDetail',
                    params: { article: item },
                  })
                }
                style={styles.newsCard}
              />
            ))
          ) : null}
          <UnifiedCard
            variant="outlined"
            padding="medium"
            onPress={() => navigation.navigate('News', { screen: 'NewsList' })}
            accessible
            accessibilityLabel="View all news"
            style={styles.viewAllCard}
          >
            <View style={styles.linkRow}>
              <Ionicons name="newspaper-outline" size={22} color={colors.primary} />
              <Text style={styles.linkLabel}>View all news</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </UnifiedCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>

          <UnifiedCard
            variant="elevated"
            padding="large"
            onPress={() => navigation.navigate('Applications')}
            accessible
            accessibilityLabel="Applications portal"
          >
            <View style={styles.serviceRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="folder-open-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.serviceText}>
                <Text style={styles.serviceTitle}>Applications</Text>
                <Text style={styles.serviceMeta}>
                  PLN, vehicle registration & more
                  {myApplicationsCount !== null && myApplicationsCount > 0 && (
                    <Text style={styles.badgeText}> · {myApplicationsCount} yours</Text>
                  )}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </UnifiedCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>External Links</Text>

          <UnifiedCard
            variant="outlined"
            padding="medium"
            onPress={() => openLink(NATIS_URL)}
            accessible
            accessibilityLabel="Open NATIS Online"
          >
            <View style={styles.linkRow}>
              <Ionicons name="car-outline" size={22} color={colors.primary} />
              <Text style={styles.linkLabel}>NATIS Online</Text>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </View>
          </UnifiedCard>

          <UnifiedCard
            variant="outlined"
            padding="medium"
            onPress={() => openLink(E_RECRUITMENT_URL)}
            accessible
            accessibilityLabel="Open E-Recruitment"
          >
            <View style={styles.linkRow}>
              <Ionicons name="people-outline" size={22} color={colors.primary} />
              <Text style={styles.linkLabel}>E-Recruitment</Text>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </View>
          </UnifiedCard>
        </View>

        <View style={styles.footer}>
          <Image
            source={RALogo}
            style={styles.footerLogo}
            resizeMode="contain"
            {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
          />
          <Text style={styles.footerText}>Roads Authority Namibia</Text>
        </View>
      </ScrollView>

    </View>
  );
}

function SideDrawer({ visible, onClose, userName, navigation, openLink, colors, RALogo }) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(-1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
  }, [visible, slideAnim, fadeAnim]);

  const drawerSlide = slideAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: [-320, 0],
  });

  const handleItemPress = (fn) => {
    onClose();
    fn();
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <View style={sideDrawerStyles.overlay}>
        <Animated.View
          style={[sideDrawerStyles.backdrop, { backgroundColor: colors.overlay, opacity: fadeAnim }]}
          pointerEvents="auto"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            sideDrawerStyles.drawer,
            {
              backgroundColor: colors.background,
              transform: [{ translateX: drawerSlide }],
            },
          ]}
        >
          <View
            style={[
              sideDrawerStyles.header,
              {
                backgroundColor: colors.primary,
                paddingTop: Math.max(insets.top, 24) + spacing.md,
              },
            ]}
          >
            <View style={sideDrawerStyles.headerTop}>
              <Image
                source={RALogo}
                style={sideDrawerStyles.headerLogo}
                resizeMode="contain"
                {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
              />
              <TouchableOpacity onPress={onClose} style={sideDrawerStyles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={sideDrawerStyles.headerGreeting}>Hello, {userName}</Text>
            <Text style={sideDrawerStyles.headerOrg}>Roads Authority Namibia</Text>
          </View>

          <ScrollView
            style={sideDrawerStyles.menu}
            contentContainerStyle={sideDrawerStyles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[sideDrawerStyles.sectionLabel, sideDrawerStyles.sectionLabelFirst, { color: colors.textMuted }]}>
              SERVICES
            </Text>
            <DrawerItem
              icon="folder-open-outline"
              label="Applications"
              onPress={() => handleItemPress(() => navigation.navigate('Applications'))}
              colors={colors}
            />
            <DrawerItem
              icon="location-outline"
              label="Find Offices"
              onPress={() => handleItemPress(() => navigation.navigate('Offices'))}
              colors={colors}
            />
            <DrawerItem
              icon="settings-outline"
              label="Settings"
              onPress={() => handleItemPress(() => navigation.navigate('Settings'))}
              colors={colors}
            />

            <Text style={[sideDrawerStyles.sectionLabel, { color: colors.textMuted }]}>EXTERNAL LINKS</Text>
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

          <View style={[sideDrawerStyles.footer, { borderTopColor: colors.border }]}>
            <Image
              source={RALogo}
              style={sideDrawerStyles.footerLogo}
              resizeMode="contain"
              {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
            />
            <Text style={[sideDrawerStyles.footerText, { color: colors.textMuted }]}>
              Roads Authority Namibia
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

SideDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  openLink: PropTypes.func.isRequired,
  colors: PropTypes.object.isRequired,
  RALogo: PropTypes.any.isRequired,
};

const sideDrawerStyles = StyleSheet.create({
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
  header: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLogo: {
    width: 36,
    height: 36,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -12,
  },
  headerGreeting: {
    ...typography.h4,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerOrg: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  menu: {
    flex: 1,
  },
  menuContent: {
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderTopWidth: 1,
  },
  footerLogo: {
    width: 20,
    height: 20,
  },
  footerText: {
    ...typography.caption,
  },
});

function DrawerItem({ icon, label, sublabel, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[drawerItemStyles.item, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[drawerItemStyles.iconWrap, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={drawerItemStyles.textWrap}>
        <Text style={[drawerItemStyles.label, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[drawerItemStyles.sublabel, { color: colors.textMuted }]}>{sublabel}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

DrawerItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sublabel: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  colors: PropTypes.object.isRequired,
};

const drawerItemStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  sublabel: {
    ...typography.caption,
    marginTop: 2,
  },
});

function getStyles(colors, insets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: Math.max(insets?.top ?? 0, 16) + spacing.md,
      paddingBottom: spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      gap: spacing.sm,
    },
    headerLogo: {
      width: 28,
      height: 28,
    },
    userName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 1,
    },
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.xxl,
      paddingBottom: 160,
    },
    welcomeRow: {
      marginBottom: spacing.xxl,
    },
    welcomeText: {
      flex: 1,
    },
    greeting: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
    },
    loadingRow: {
      paddingVertical: spacing.md,
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionTitle: {
      ...typography.h5,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.lg,
    },
    newsCard: {
      marginBottom: spacing.lg,
    },
    viewAllCard: {
      marginBottom: 0,
    },
    quickActionCard: {
      marginBottom: spacing.lg,
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    quickActionIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionText: {
      flex: 1,
    },
    quickActionTitle: {
      ...typography.h5,
      color: colors.text,
      marginBottom: 2,
    },
    quickActionMeta: {
      ...typography.caption,
      color: colors.textMuted,
    },
    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceText: {
      flex: 1,
    },
    serviceTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    serviceMeta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    badgeText: {
      color: colors.primary,
      fontWeight: '600',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    linkLabel: {
      ...typography.body,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xl,
    },
    footerLogo: {
      width: 24,
      height: 24,
    },
    footerText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
}

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

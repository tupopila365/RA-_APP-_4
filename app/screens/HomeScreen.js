import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import { UnifiedSkeletonLoader, SearchInput } from '../components';
import { Card, Badge } from '../components';
import { bannersService } from '../services/bannersService';
import { notificationsService } from '../services/notificationsService';
import RAIcon from '../assets/icon.png';
import Poster1 from '../assets/poster-1.png';
import Poster2 from '../assets/poster-2.png';
import Poster3 from '../assets/poster-3.png';
import HomepageBanner from '../assets/banner_images/homepage.png';

// Responsive breakpoints (in dp)
const BREAKPOINTS = {
  PHONE: 600,
  TABLET: 840,
  LARGE_TABLET: 1024,
};

// Minimum touch target size (Material Design & iOS guidelines)
const MIN_TOUCH_TARGET = 48;

/**
 * Determine device type and get responsive values based on screen width
 */
const getResponsiveConfig = (screenWidth, screenHeight) => {
  const isLandscape = screenWidth > screenHeight;
  const isPhone = screenWidth < BREAKPOINTS.PHONE;
  const isTablet = screenWidth >= BREAKPOINTS.PHONE && screenWidth < BREAKPOINTS.TABLET;
  const isLargeTablet = screenWidth >= BREAKPOINTS.TABLET;
  
  // Column counts based on device type and orientation
  // Phones: Always 3 columns for optimal fit
  // Tablets: More columns for better space utilization
  let primaryColumns, secondaryColumns;
  
  if (isPhone) {
    // Phones: Always 3 columns regardless of orientation for consistent layout
    primaryColumns = 3;
    secondaryColumns = 3;
  } else if (isTablet) {
    primaryColumns = isLandscape ? 4 : 3;
    secondaryColumns = isLandscape ? 5 : 4;
  } else {
    // Large tablets/iPads
    primaryColumns = isLandscape ? 5 : 4;
    secondaryColumns = isLandscape ? 6 : 5;
  }
  
  // Scale factor for icons and spacing
  const scaleFactor = Math.min(screenWidth / 375, 1.5); // Base width 375dp (iPhone SE)
  
  return {
    isPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    primaryColumns,
    secondaryColumns,
    scaleFactor,
    screenWidth,
    screenHeight,
  };
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago", "Yesterday")
 */
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get icon name for notification type
 */
const getNotificationIcon = (type) => {
  const iconMap = {
    news: 'newspaper-outline',
    tender: 'document-text-outline',
    vacancy: 'briefcase-outline',
    general: 'notifications-outline',
  };
  return iconMap[type] || 'notifications-outline';
};

export default function HomeScreen({ navigation, showMenuOnly = false }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Get responsive configuration based on current screen dimensions
  const responsiveConfig = useMemo(
    () => getResponsiveConfig(screenWidth, screenHeight),
    [screenWidth, screenHeight]
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);
  
  // Calculate item width based on columns and spacing
  const getItemWidth = (columns, horizontalPadding = 20, gap = 8) => {
    const totalPadding = horizontalPadding * 2;
    const totalGap = gap * (columns - 1);
    return (screenWidth - totalPadding - totalGap) / columns;
  };
  
  // Calculate responsive icon sizes (available for use in render)
  // Default values to prevent errors if responsiveConfig is not yet available
  const scaleFactor = responsiveConfig?.scaleFactor || 1;
  const isLargeTablet = responsiveConfig?.isLargeTablet || false;
  const primaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(72 * scaleFactor, isLargeTablet ? 80 : 72));
  const secondaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));

  const handleNatisOnline = async () => {
    await WebBrowser.openBrowserAsync('https://online.ra.org.na/#/');
  };

  const handleERecruitment = async () => {
    await WebBrowser.openBrowserAsync('https://erec.ra.org.na/#/');
  };

  // Fetch banners from API
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const fetchedBanners = await bannersService.getActiveBanners();
      
      // If we have API banners, use them; otherwise fall back to default posters
      if (fetchedBanners && fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
      } else {
        // Fallback to default posters if no banners from API
        setBanners(defaultPosterBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // On error, use default posters
      setBanners(defaultPosterBanners);
    } finally {
      setLoadingBanners(false);
    }
  };

  // Default poster banners (fallback)
  const defaultPosterBanners = [
    {
      id: 'poster-1',
      source: Poster1,
      title: 'Roads Authority Namibia',
      description: 'Safe Roads to Prosperity',
      isLocal: true,
    },
    {
      id: 'poster-2',
      source: Poster2,
      title: 'Contact the NaTIS Office in Your Town',
      description: '#WeBuildTheJourney',
      isLocal: true,
    },
    {
      id: 'poster-3',
      source: Poster3,
      title: 'Serving Namibia with Purpose',
      description: '#WeBuildTheJourney',
      isLocal: true,
    },
  ];

  // Handle banner press (open link if available)
  const handleBannerPress = async (banner) => {
    if (banner.linkUrl) {
      try {
        await WebBrowser.openBrowserAsync(banner.linkUrl);
      } catch (error) {
        console.error('Error opening banner link:', error);
      }
    }
  };

  // Primary actions - most important, larger emphasis
  const primaryMenuItems = [
    {
      id: 1,
      title: 'NATIS Online',
      icon: 'car-outline',
      color: colors.primary,
      backgroundColor: '#E3F2FD',
      isPrimary: true,
      onPress: handleNatisOnline,
    },
    {
      id: 2.5,
      title: 'Report Road Damage',
      icon: 'alert-circle-outline',
      color: colors.primary,
      backgroundColor: '#E3F2FD',
      isPrimary: true,
      onPress: () => navigation?.navigate('ReportPothole'),
    },
    {
      id: 8.5,
      title: 'Road Status',
      icon: 'map-outline',
      color: colors.primary,
      backgroundColor: '#E3F2FD',
      isPrimary: true,
      onPress: () => navigation?.navigate('RoadStatus'),
    },
  ];

  // Secondary actions - standard size, neutral styling
  const secondaryMenuItems = [
    {
      id: 1,
      title: 'E-Recruitment',
      icon: 'briefcase-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: handleERecruitment,
    },
    {
      id: 2,
      title: 'News',
      icon: 'newspaper-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('News'),
    },
    {
      id: 3,
      title: 'Careers',
      icon: 'document-text-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('Vacancies'),
    },
    {
      id: 4,
      title: 'Procurement',
      icon: 'business-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('Procurement'),
    },
    {
      id: 5,
      title: 'RA Services',
      icon: 'construct-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('RAServices'),
    },
    {
      id: 6,
      title: 'FAQs',
      icon: 'help-circle-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('FAQs'),
    },
    {
      id: 7,
      title: 'Find Offices',
      icon: 'location-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('Find Offices'),
    },
    {
      id: 8,
      title: 'Settings',
      icon: 'settings-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('MainTabs', { screen: 'Settings' }),
    },
    {
      id: 8.5,
      title: 'Alerts',
      icon: 'notifications-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('Notifications'),
    },
    {
      id: 9,
      title: 'Chat',
      icon: 'chatbubble-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('MainTabs', { screen: 'Chatbot' }),
    },
    {
      id: 10,
      title: 'Applications',
      icon: 'document-text-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      isPrimary: false,
      onPress: () => navigation?.navigate('Applications'),
    },
  ];

  // Combine all items for filtering/search
  const menuItems = [...primaryMenuItems, ...secondaryMenuItems];

  // Generate responsive styles based on current screen dimensions
  const styles = useMemo(
    () => getStyles(colors, responsiveConfig),
    [colors, responsiveConfig]
  );
  const headerBackgroundSource = useMemo(() => {
    // Use the homepage banner image as the header background
    return HomepageBanner;
  }, []);

  const handleNotificationPress = (notification) => {
    // Navigate based on notification type
    if (notification.type === 'news') {
      navigation?.navigate('News');
    } else if (notification.type === 'vacancy') {
      navigation?.navigate('Vacancies');
    } else {
      // Navigate to Notifications tab
      const tabNavigator = navigation?.getParent('MainTabs');
      if (tabNavigator) {
        tabNavigator.navigate('Notifications');
      } else {
        navigation?.navigate('MainTabs', { screen: 'Notifications' });
      }
    }
  };

  if (showMenuOnly) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={item.isPrimary ? styles.menuItemPrimary : styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[
                  item.isPrimary ? styles.menuIconContainerPrimary : styles.menuIconContainer, 
                  { backgroundColor: item.backgroundColor || '#F5F5F7' }
                ]}>
                  <Ionicons name={item.icon} size={item.isPrimary ? 40 : 32} color={item.color} />
                </View>
                <Text style={item.isPrimary ? styles.menuItemTextPrimary : styles.menuItemText} maxFontSizeMultiplier={1.3}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#00B4E6', '#0090C0', '#0078A3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <ImageBackground
            source={headerBackgroundSource}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
            <View style={styles.brandContainer}>
              <View style={styles.brandLogoWrapper}>
                <Image 
                  source={RAIcon} 
                  style={styles.brandLogo}
                  resizeMode="contain"
                  {...Platform.select({
                    android: {
                      renderToHardwareTextureAndroid: true,
                    },
                  })}
                />
              </View>
              <View style={styles.brandTextContainer}>
                {user?.fullName ? (
                  <Text style={[styles.welcomeLabel, { color: colors.secondary }]} maxFontSizeMultiplier={1.3}>
                    Welcome, {user.fullName}
                  </Text>
                ) : (
                  <Text style={styles.welcomeLabel} maxFontSizeMultiplier={1.3}>WELCOME TO</Text>
                )}
                <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>Roads Authority Namibia</Text>
                <Text style={styles.subtitleText} maxFontSizeMultiplier={1.3}>Safe Roads to Prosperity</Text>
                <Text style={styles.taglineText} maxFontSizeMultiplier={1.3}>
                  Your gateway to safer roads and essential services in Namibia.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => {
                // Always drive to alerts/notifications screen
                const tabNavigator = navigation?.getParent('MainTabs');
                if (tabNavigator?.navigate) {
                  tabNavigator.navigate('Notifications');
                } else {
                  navigation?.navigate('Notifications');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications" size={24} color={colors.primary} />
              {notifications.filter(n => !dismissedNotificationIds.includes(n.id)).length > 0 && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText} maxFontSizeMultiplier={1.3}>
                    {notifications.filter(n => !dismissedNotificationIds.includes(n.id)).length > 9 
                      ? '9+' 
                      : notifications.filter(n => !dismissedNotificationIds.includes(n.id)).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onSearch={setSearchQuery}
              onChangeTextImmediate={setSearchQuery}
              onClear={() => setSearchQuery('')}
              accessibilityLabel="Search services"
              accessibilityHint="Search all services and quick actions"
            />
          </View>
          </SafeAreaView>
        </ImageBackground>
      </LinearGradient>

        <View style={styles.content}>
        {/* Recent Alerts Section */}
        {!searchQuery.trim() && 
         !loadingNotifications && 
         notifications.filter(n => !dismissedNotificationIds.includes(n.id)).length > 0 && (
          <View style={styles.notificationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Recent Alerts</Text>
              <TouchableOpacity onPress={() => {
                // Navigate to Notifications tab in MainTabs
                const tabNavigator = navigation?.getParent('MainTabs');
                if (tabNavigator) {
                  tabNavigator.navigate('Notifications');
                } else {
                  navigation?.navigate('MainTabs', { screen: 'Notifications' });
                }
              }}>
                <Text style={[styles.viewAllText, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notificationsList}>
              {notifications
                .filter(n => !dismissedNotificationIds.includes(n.id))
                .slice(0, 3)
                .map((notification, index, array) => (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                  >
                    <Card style={[
                      styles.notificationCard,
                      index < array.length - 1 && { 
                        borderBottomWidth: 1, 
                        borderBottomColor: colors.border,
                        borderRadius: 0 
                      },
                      index === array.length - 1 && { 
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20 
                      },
                      index === 0 && {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20
                      }
                    ]}>
                      <View style={styles.notificationContent}>
                        <View style={[styles.notificationIconContainer, { backgroundColor: colors.secondary }]}>
                          <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            color={colors.secondary}
                          />
                        </View>
                        <View style={styles.notificationTextContainer}>
                          <View style={styles.notificationHeaderRow}>
                            <Text style={styles.notificationTitle} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                              {notification.title}
                            </Text>
                            <Badge
                              label={notification.type}
                              variant={notification.type === 'news' ? 'info' : notification.type === 'vacancy' ? 'success' : 'default'}
                            />
                          </View>
                          <Text style={styles.notificationBody} numberOfLines={2} maxFontSizeMultiplier={1.3}>
                            {notification.body}
                          </Text>
                          <Text style={styles.notificationTime} maxFontSizeMultiplier={1.3}>
                            {formatTimeAgo(notification.sentAt)}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* Primary Actions Section */}
        {!searchQuery.trim() && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Quick Actions</Text>
            <View style={styles.menuGrid}>
              {primaryMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItemPrimary}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainerPrimary, { backgroundColor: item.backgroundColor }]}>
                    <Ionicons 
                      name={item.icon} 
                      size={Math.max(32, Math.min(primaryIconSize - 8, 40))} 
                      color={item.color} 
                    />
                  </View>
                  <Text style={styles.menuItemTextPrimary} maxFontSizeMultiplier={1.3}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Services Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>{searchQuery.trim() ? 'Search Results' : 'All Services'}</Text>
          <View style={styles.menuGrid}>
            {(searchQuery.trim() ? menuItems : secondaryMenuItems)
              .filter((item) => {
                if (!searchQuery.trim()) return true;
                return item.title.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.backgroundColor || '#F5F5F7' }]}>
                    <Ionicons 
                      name={item.icon} 
                      size={Math.max(24, Math.min(secondaryIconSize - 8, 32))} 
                      color={item.color} 
                    />
                  </View>
                  <Text style={styles.menuItemText} maxFontSizeMultiplier={1.3}>{item.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
          {searchQuery.trim() && menuItems.filter((item) => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <Text style={styles.noResultsText} maxFontSizeMultiplier={1.3}>No results found for "{searchQuery}"</Text>
          )}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getStyles(colors, config) {
  const {
    isPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    primaryColumns,
    secondaryColumns,
    scaleFactor,
    screenWidth,
  } = config;
  
  // Responsive spacing and sizing
  // Reduced padding on phones to maximize usable space
  const horizontalPadding = isPhone ? 12 : isTablet ? 24 : 32;
  const verticalPadding = isPhone ? 12 : 20;
  const gridGap = isPhone ? 6 : 12; // Smaller gap on phones to fit items better
  
  // Calculate item widths dynamically
  const primaryItemWidth = (screenWidth - horizontalPadding * 2 - gridGap * (primaryColumns - 1)) / primaryColumns;
  const secondaryItemWidth = (screenWidth - horizontalPadding * 2 - gridGap * (secondaryColumns - 1)) / secondaryColumns;
  
  // Icon sizes are calculated in component scope, calculate containers here
  // Note: primaryIconSize and secondaryIconSize are defined in component scope above
  // These need to be passed in or recalculated here
  const calculatedPrimaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(72 * scaleFactor, isLargeTablet ? 80 : 72));
  const calculatedSecondaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));
  const iconContainerPrimary = calculatedPrimaryIconSize + 8; // Add padding
  const iconContainerSecondary = calculatedSecondaryIconSize + 8;
  
  // Responsive font sizes with accessibility support
  const baseFontSize = isPhone ? 12 : isTablet ? 13 : 14;
  const titleFontSize = isPhone ? 22 : isTablet ? 24 : 26;
  const sectionFontSize = isPhone ? 20 : isTablet ? 22 : 24;
  
  // Banner height responsive to screen size
  // Shorter hero height to reduce header space
  const bannerHeight = isPhone ? (isLandscape ? 100 : 130) : isTablet ? (isLandscape ? 150 : 170) : 180;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      borderBottomLeftRadius: isPhone ? 24 : 32,
      borderBottomRightRadius: isPhone ? 24 : 32,
      backgroundColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    headerContent: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isPhone ? 12 : 14,
      position: 'relative',
      paddingHorizontal: horizontalPadding,
    },
    brandContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      width: '100%',
    },
    brandTextContainer: {
      marginTop: isPhone ? 2 : 4,
      width: '100%',
      alignItems: 'center',
    },
    brandLogoWrapper: {
      width: isPhone ? 80 : isTablet ? 88 : 96,
      height: isPhone ? 80 : isTablet ? 88 : 96,
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isPhone ? 10 : 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    brandLogo: {
      width: '100%',
      height: '100%',
      borderRadius: 999,
    },
    welcomeLabel: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : 13,
      letterSpacing: 1.2,
      fontWeight: '700',
      marginBottom: 6,
    },
    titleText: {
      color: '#FFFFFF',
      fontSize: titleFontSize + 2,
      fontWeight: '700',
      marginTop: 0,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    subtitleText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 15 : 17,
      ...Platform.select({
        ios: {
          opacity: 0.9,
        },
        android: {},
      }),
      marginTop: 2,
      fontWeight: '600',
      textAlign: 'center',
    },
    taglineText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : 13,
      opacity: 0.9,
      marginTop: isPhone ? 6 : 8,
      textAlign: 'center',
      lineHeight: isPhone ? 16 : 18,
      paddingHorizontal: 0,
    },
    alertButton: {
      width: Math.max(MIN_TOUCH_TARGET, 44 * scaleFactor),
      height: Math.max(MIN_TOUCH_TARGET, 44 * scaleFactor),
      borderRadius: Math.max(MIN_TOUCH_TARGET, 44 * scaleFactor) / 2,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      right: horizontalPadding,
      top: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    alertBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: '#FF4444',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    alertBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },

    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: isPhone ? 80 : 100,
    },
    content: {
      padding: horizontalPadding,
      paddingBottom: isPhone ? 80 : 100,
      paddingTop: isPhone ? 12 : 20, // Reduced top padding on phones
    },
    searchContainer: {
      marginBottom: isPhone ? 12 : 16,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },
    headerBackground: {
      width: '100%',
      borderBottomLeftRadius: isPhone ? 24 : 32,
      borderBottomRightRadius: isPhone ? 24 : 32,
      overflow: 'hidden',
      minHeight: bannerHeight + verticalPadding * 1.2,
      paddingTop: isPhone ? 14 : 18,
      paddingBottom: isPhone ? 12 : 16,
      paddingHorizontal: horizontalPadding,
    },
    headerBackgroundImage: {
      opacity: 0.5,
      resizeMode: 'cover',
    },
    menuSection: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: sectionFontSize,
      fontWeight: '700',
      color: colors.text,
      marginBottom: isPhone ? 12 : 18, // Reduced margin on phones
      letterSpacing: -0.3,
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gridGap,
    },
    // Primary menu items - larger, more prominent, responsive width
    menuItemPrimary: {
      width: primaryItemWidth,
      minWidth: MIN_TOUCH_TARGET * 2, // Ensure minimum usable size
      backgroundColor: '#FFFFFF', // Solid white background
      borderRadius: isPhone ? 14 : 20,
      padding: isPhone ? 12 : 20, // Reduced padding on phones
      marginBottom: isPhone ? 10 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E6EAF0',
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 1, // Reduced from 5 to 1
        },
      }),
    },
    menuIconContainerPrimary: {
      width: iconContainerPrimary,
      height: iconContainerPrimary,
      minWidth: MIN_TOUCH_TARGET,
      minHeight: MIN_TOUCH_TARGET,
      borderRadius: isPhone ? 14 : 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isPhone ? 8 : 14, // Reduced margin on phones
      // Remove shadow/elevation from icon containers to prevent double layering
    },
    menuItemTextPrimary: {
      fontSize: baseFontSize,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.2,
      lineHeight: baseFontSize + 4,
    },
    // Secondary menu items - standard size, neutral, responsive width
    menuItem: {
      width: secondaryItemWidth,
      minWidth: MIN_TOUCH_TARGET * 1.8,
      backgroundColor: '#FFFFFF', // Solid white background
      borderRadius: isPhone ? 12 : 16,
      padding: isPhone ? 10 : 14, // Reduced padding on phones
      marginBottom: isPhone ? 10 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E6EAF0',
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1, // Reduced from 2 to 1
        },
      }),
    },
    menuIconContainer: {
      width: iconContainerSecondary,
      height: iconContainerSecondary,
      minWidth: MIN_TOUCH_TARGET,
      minHeight: MIN_TOUCH_TARGET,
      borderRadius: isPhone ? 12 : 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isPhone ? 6 : 10, // Reduced margin on phones
      // Remove shadow/elevation from icon containers to prevent double layering
    },
    menuItemText: {
      fontSize: isPhone ? 10 : 11,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.1,
      lineHeight: (isPhone ? 10 : 11) + 3,
      // Support dynamic text sizing (accessibility)
      ...(Platform.OS === 'ios' && {
        allowFontScaling: true,
      }),
    },
    notificationsSection: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    notificationsList: {
      gap: 0,
      marginHorizontal: -20,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF', // Solid white background
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 1, // Reduced from 4 to 1
        },
      }),
      borderWidth: 1,
      borderColor: '#E6EAF0',
    },
    notificationCard: {
      padding: 16,
      marginBottom: 0,
      borderRadius: 0,
      marginHorizontal: 0,
      borderBottomWidth: 0,
    },
    notificationContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    notificationIconContainer: {
      width: Math.max(MIN_TOUCH_TARGET, 40 * scaleFactor),
      height: Math.max(MIN_TOUCH_TARGET, 40 * scaleFactor),
      borderRadius: isPhone ? 10 : 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      // Remove shadow/elevation from icon containers to prevent double layering
    },
    notificationTextContainer: {
      flex: 1,
    },
    notificationHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
      gap: 8,
    },
    notificationTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.2,
      lineHeight: 20,
    },
    notificationBody: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: 6,
      marginTop: 2,
    },
    notificationTime: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    noResultsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });
}

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  showMenuOnly: PropTypes.bool,
};



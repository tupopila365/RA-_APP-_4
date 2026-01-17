import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../hooks/useTheme';
import { SearchInput } from '../components/SearchInput';
import RAIcon from '../assets/icon.png';
import ApplicationImage1 from '../form_images/image.png';
import ApplicationImage2 from '../form_images/images.png';

// Responsive breakpoints (in dp)
const BREAKPOINTS = {
  PHONE: 600,
  TABLET: 840,
  LARGE_TABLET: 1024,
};

// Minimum touch target size (Material Design & iOS guidelines)
const MIN_TOUCH_TARGET = 48;
const WELCOME_HEADER_COLORS = ['#00B4E6', '#0090C0', '#0078A3'];

/**
 * Determine device type and get responsive values based on screen width
 */
const getResponsiveConfig = (screenWidth, screenHeight) => {
  const isLandscape = screenWidth > screenHeight;
  const isPhone = screenWidth < BREAKPOINTS.PHONE;
  const isTablet = screenWidth >= BREAKPOINTS.PHONE && screenWidth < BREAKPOINTS.TABLET;
  const isLargeTablet = screenWidth >= BREAKPOINTS.TABLET;
  
  // Column counts based on device type and orientation
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

export default function ApplicationsScreen({ navigation }) {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  
  // Get responsive configuration based on current screen dimensions
  const responsiveConfig = useMemo(
    () => getResponsiveConfig(screenWidth, screenHeight),
    [screenWidth, screenHeight]
  );

  // Calculate responsive icon sizes
  const scaleFactor = responsiveConfig?.scaleFactor || 1;
  const isLargeTablet = responsiveConfig?.isLargeTablet || false;
  const primaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(72 * scaleFactor, isLargeTablet ? 80 : 72));
  const secondaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));

  // Applications slideshow banners
  const applicationBanners = [
    {
      id: 'application-1',
      source: ApplicationImage1,
      title: 'Roads Authority Applications',
      description: 'Apply for Services Online',
      isLocal: true,
    },
    {
      id: 'application-2',
      source: ApplicationImage2,
      title: 'Digital Forms & Services',
      description: 'Complete Applications Digitally',
      isLocal: true,
    },
  ];

  useEffect(() => {
    if (!applicationBanners || applicationBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % applicationBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [applicationBanners]);

  const heroBanner = applicationBanners.length > 0 ? applicationBanners[activeBannerIndex % applicationBanners.length] : null;
  const heroImageSource = heroBanner ? heroBanner.source : ApplicationImage1;

  // Handle external links
  const handleExternalLink = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening external link:', error);
    }
  };

  // Handle NATIS Online navigation
  const handleNatisOnline = () => {
    handleExternalLink('https://natis.nra.org.na/');
  };

  // Handle E-Recruitment navigation
  const handleERecruitment = () => {
    handleExternalLink('https://recruitment.nra.org.na/');
  };

  const primaryIconColor = colors.primary;
  const secondaryIconBg = '#F5F5F7';

  // Application services - only the three specified items
  const applicationMenuItems = [
    {
      id: 1,
      title: 'Personalized Number Plates',
      icon: 'card-outline',
      color: primaryIconColor,
      backgroundColor: secondaryIconBg,
      onPress: () => navigation?.navigate('PLNInfo'),
    },
    {
      id: 2,
      title: 'Track PLN Application',
      icon: 'search-outline',
      color: primaryIconColor,
      backgroundColor: secondaryIconBg,
      onPress: () => navigation?.navigate('PLNTracking'),
    },
    {
      id: 3,
      title: 'My Reports',
      icon: 'list-outline',
      color: primaryIconColor,
      backgroundColor: secondaryIconBg,
      onPress: () => navigation?.navigate('MyReports'),
    },
    {
      id: 4,
      title: 'Forms',
      icon: 'document-text-outline',
      color: primaryIconColor,
      backgroundColor: secondaryIconBg,
      onPress: () => navigation?.navigate('Procurement', { screen: 'Forms' }),
    },
  ];

  // Filter menu items based on search query
  const filteredApplicationItems = applicationMenuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate responsive styles based on current screen dimensions
  const styles = useMemo(
    () => getStyles(colors, responsiveConfig),
    [colors, responsiveConfig]
  );

  // Loading state
  if (!responsiveConfig) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header matching home page hero */}
      <View style={styles.header}>
        <ImageBackground
          source={heroImageSource}
          style={styles.heroCard}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={WELCOME_HEADER_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroOverlay}
          />
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={[styles.alertButton, styles.heroAlertButton]}
                onPress={() => {
                  const tabNavigator = navigation?.getParent('MainTabs');
                  if (tabNavigator) {
                    tabNavigator.navigate('Notifications');
                  } else {
                    navigation?.navigate('MainTabs', { screen: 'Notifications' });
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications" size={24} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.heroLogoWrapper}>
                <Image source={RAIcon} style={styles.brandLogoHero} resizeMode="contain" />
              </View>

              <View style={styles.heroTextContainer}>
                <Text style={styles.welcomeText} maxFontSizeMultiplier={1.3}>Roads Authority</Text>
                <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>Applications</Text>
                <Text style={styles.subtitleText} maxFontSizeMultiplier={1.3}>Services & Forms</Text>
                <Text style={styles.heroDescription} maxFontSizeMultiplier={1.3}>
                  Apply, track, and manage your RA services in one place.
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search applications..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            accessibilityLabel="Search applications"
            accessibilityHint="Type to filter available applications"
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {/* All Services Section - Only Application Services */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>{searchQuery.trim() ? 'Search Results' : 'All Services'}</Text>
          <View style={styles.menuGrid}>
            {(searchQuery.trim() ? filteredApplicationItems : applicationMenuItems)
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
          {searchQuery.trim() && filteredApplicationItems.length === 0 && (
            <Text style={styles.noResultsText} maxFontSizeMultiplier={1.3}>No results found for "{searchQuery}"</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Responsive styles function
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
  const horizontalPadding = isPhone ? 12 : isTablet ? 24 : 32;
  const verticalPadding = isPhone ? 12 : 20;
  const gridGap = isPhone ? 6 : 12;
  
  // Calculate item widths dynamically
  const secondaryItemWidth = (screenWidth - horizontalPadding * 2 - gridGap * (secondaryColumns - 1)) / secondaryColumns;
  
  // Icon sizes
  const calculatedSecondaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));
  const iconContainerSecondary = calculatedSecondaryIconSize + 8;
  
  // Responsive font sizes
  const baseFontSize = isPhone ? 12 : isTablet ? 13 : 14;
  const titleFontSize = isPhone ? 22 : isTablet ? 24 : 26;
  const sectionFontSize = isPhone ? 20 : isTablet ? 22 : 24;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: isPhone ? 20 : 24,
      gap: isPhone ? 12 : 16,
      backgroundColor: colors.background,
    },
    headerContent: {
      paddingHorizontal: horizontalPadding,
      paddingTop: isPhone ? 16 : 22,
      paddingBottom: isPhone ? 24 : 30,
      position: 'relative',
      alignItems: 'center',
      gap: isPhone ? 10 : 12,
    },
    heroCard: {
      width: '100%',
      alignSelf: 'stretch',
      borderRadius: 0,
      overflow: 'hidden',
      minHeight: isPhone ? 300 : 340,
      justifyContent: 'flex-end',
    },
    heroImage: {
      borderRadius: 0,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.9,
    },
    alertButton: {
      width: Math.max(MIN_TOUCH_TARGET, 44 * scaleFactor),
      height: Math.max(MIN_TOUCH_TARGET, 44 * scaleFactor),
      borderRadius: Math.max(MIN_TOUCH_TARGET, 44 * scaleFactor) / 2,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    heroAlertButton: {
      position: 'absolute',
      top: isPhone ? 16 : 18,
      right: isPhone ? 16 : 18,
      zIndex: 2,
    },
    heroLogoWrapper: {
      alignSelf: 'center',
      width: isPhone ? 96 : 108,
      height: isPhone ? 96 : 108,
      borderRadius: isPhone ? 48 : 54,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isPhone ? 6 : 10,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.5)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.14,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    brandLogoHero: {
      width: isPhone ? 72 : 80,
      height: isPhone ? 72 : 80,
      resizeMode: 'contain',
    },
    heroTextContainer: {
      gap: isPhone ? 4 : 6,
      alignItems: 'center',
    },
    welcomeText: {
      color: '#EAF7FF',
      fontSize: isPhone ? 13 : 14,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    titleText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 26 : 30,
      fontWeight: '800',
      marginTop: 2,
      letterSpacing: -0.6,
      lineHeight: isPhone ? 32 : 36,
      textAlign: 'center',
    },
    subtitleText: {
      color: '#E3F5FF',
      fontSize: isPhone ? 16 : 18,
      marginTop: 0,
      fontWeight: '700',
      letterSpacing: -0.2,
      textAlign: 'center',
    },
    heroDescription: {
      color: '#EAF7FF',
      fontSize: isPhone ? 13 : 14,
      opacity: 0.92,
      marginTop: 2,
      lineHeight: isPhone ? 20 : 22,
      fontWeight: '500',
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: horizontalPadding,
      paddingBottom: isPhone ? 80 : 100,
      paddingTop: isPhone ? 4 : 8,
    },
    searchContainer: {
      marginTop: isPhone ? -28 : -34,
      paddingHorizontal: horizontalPadding,
      marginBottom: isPhone ? 6 : 10,
    },
    menuSection: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: sectionFontSize,
      fontWeight: '700',
      color: colors.text,
      marginBottom: isPhone ? 12 : 18,
      letterSpacing: -0.3,
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gridGap,
    },
    // Menu items - standard size, responsive width
    menuItem: {
      width: secondaryItemWidth,
      minWidth: MIN_TOUCH_TARGET * 1.8,
      backgroundColor: '#FFFFFF',
      borderRadius: isPhone ? 12 : 16,
      padding: isPhone ? 10 : 14,
      marginBottom: isPhone ? 10 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E6EAF0',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
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
      marginBottom: isPhone ? 6 : 10,
    },
    menuItemText: {
      fontSize: isPhone ? 10 : 11,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.1,
      lineHeight: (isPhone ? 10 : 11) + 3,
      ...(Platform.OS === 'ios' && {
        allowFontScaling: true,
      }),
    },
    noResultsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });
}
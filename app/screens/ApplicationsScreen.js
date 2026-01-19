import { useState, useMemo } from 'react';
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

  // Application services - only the three specified items
  const applicationMenuItems = [
    {
      id: 1,
      title: 'Personalized Number Plates',
      icon: 'card-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('PLNInfo'),
    },
    {
      id: 2,
      title: 'Track PLN Application',
      icon: 'search-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('PLNTracking'),
    },
    {
      id: 3,
      title: 'My Reports',
      icon: 'list-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('MyReports'),
    },
    {
      id: 4,
      title: 'Forms',
      icon: 'document-text-outline',
      color: colors.primary,
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('Forms'),
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
      <LinearGradient
        colors={['#00B4E6', '#0090C0', '#0078A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <ImageBackground
          source={ApplicationImage1}
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
                <Text style={styles.welcomeLabel} maxFontSizeMultiplier={1.3}>WELCOME TO</Text>
                <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>Roads Authority Namibia</Text>
                <Text style={styles.subtitleText} maxFontSizeMultiplier={1.3}>Applications & Services</Text>
                <Text style={styles.taglineText} maxFontSizeMultiplier={1.3}>
                  Access digital forms and application services.
                </Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search applications..."
              value={searchQuery}
              onSearch={setSearchQuery}
              onChangeTextImmediate={setSearchQuery}
              onClear={() => setSearchQuery('')}
              accessibilityLabel="Search applications"
              accessibilityHint="Type to filter available applications"
            />
          </View>
          </SafeAreaView>
        </ImageBackground>
      </LinearGradient>

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
  
  // Banner height responsive to screen size
  // Match home header compact height
  const bannerHeight = isPhone ? (isLandscape ? 120 : 160) : isTablet ? (isLandscape ? 180 : 200) : 220;
  
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
      marginBottom: 16,
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
      marginTop: 4,
      width: '100%',
      alignItems: 'center',
    },
    brandLogoWrapper: {
      width: isPhone ? 96 : isTablet ? 104 : 112,
      height: isPhone ? 96 : isTablet ? 104 : 112,
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
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
      fontSize: isPhone ? 13 : 14,
      opacity: 0.9,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: isPhone ? 18 : 20,
      paddingHorizontal: 0,
    },
    headerBackground: {
      width: '100%',
      borderBottomLeftRadius: isPhone ? 24 : 32,
      borderBottomRightRadius: isPhone ? 24 : 32,
      overflow: 'hidden',
      minHeight: bannerHeight + (verticalPadding * 2),
      paddingTop: isPhone ? 24 : 30,
      paddingBottom: isPhone ? 20 : 25,
      paddingHorizontal: horizontalPadding,
    },
    headerBackgroundImage: {
      opacity: 0.35,
      resizeMode: 'cover',
    },
    searchContainer: {
      marginBottom: isPhone ? 12 : 16,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: horizontalPadding,
      paddingBottom: isPhone ? 80 : 100,
      paddingTop: isPhone ? 12 : 20,
    },
    bannerContainer: {
      marginBottom: 24,
      position: 'relative',
    },
    bannerScrollContent: {
      paddingRight: horizontalPadding,
    },
    banner: {
      width: screenWidth - horizontalPadding * 2,
      height: bannerHeight,
      borderRadius: isPhone ? 16 : 20,
      overflow: 'hidden',
      marginRight: gridGap,
      justifyContent: 'flex-end',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
      borderWidth: 1,
      borderColor: '#E6EAF0',
    },
    bannerImage: {
      borderRadius: isPhone ? 16 : 20,
      resizeMode: 'cover',
    },
    bannerOverlay: {
      backgroundColor: '#000000',
      opacity: 0.6,
      padding: 20,
      borderBottomLeftRadius: isPhone ? 16 : 20,
      borderBottomRightRadius: isPhone ? 16 : 20,
    },
    bannerText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.3,
      lineHeight: 26,
    },
    bannerSubtext: {
      color: '#FFFFFF',
      fontSize: 13,
      marginTop: 8,
      opacity: 0.95,
      fontWeight: '500',
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.textSecondary,
      opacity: 0.3,
    },
    paginationDotActive: {
      backgroundColor: colors.primary,
      opacity: 1,
      width: 28,
      height: 8,
      borderRadius: 4,
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
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
import { useTheme } from '../hooks/useTheme';
import { SearchInput } from '../components/SearchInput';
import RAIcon from '../assets/icon.png';
import ProcurementImage1 from '../procument_images/image.png';
import ProcurementImage2 from '../procument_images/imagp.png';

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

export default function ProcurementScreen({ navigation }) {
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

  // Procurement slideshow banners
  const procurementBanners = [
    {
      id: 'procurement-1',
      source: ProcurementImage1,
      title: 'Procurement Services',
      description: 'Transparent and Efficient Procurement',
      isLocal: true,
    },
    {
      id: 'procurement-2',
      source: ProcurementImage2,
      title: 'Tender Opportunities',
      description: 'Open and Fair Bidding Process',
      isLocal: true,
    },
  ];

  // All procurement services using secondary style
  const menuItems = [
    {
      id: 1,
      title: 'Procurement Plan',
      icon: 'calendar-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('ProcurementPlan'),
    },
    {
      id: 2,
      title: 'Bids & RFQs',
      icon: 'document-text-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('OpeningRegister'),
    },
    {
      id: 3,
      title: 'Awards',
      icon: 'trophy-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('ProcurementAwards'),
    },
    {
      id: 4,
      title: 'Opening Register',
      icon: 'list-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('OpeningRegister'),
    },
    {
      id: 5,
      title: 'Legislation',
      icon: 'library-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation?.navigate('ProcurementLegislation'),
    },
  ];

  // Generate responsive styles based on current screen dimensions
  const styles = useMemo(
    () => getStyles(colors, responsiveConfig),
    [colors, responsiveConfig]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.brandContainer}>
              <Image source={RAIcon} style={styles.brandLogo} />
              <View style={styles.brandTextContainer}>
                <Text style={styles.welcomeText}>Roads Authority</Text>
                <Text style={styles.titleText}>Procurement</Text>
                <Text style={styles.subtitleText}>Services & Information</Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <SearchInput
            placeholder="Search procurement services..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            accessibilityLabel="Search procurement services"
            accessibilityHint="Type to filter available procurement options"
          />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled
            contentContainerStyle={styles.bannerScrollContent}
            onScroll={(event) => {
              const scrollPosition = event.nativeEvent.contentOffset.x;
              const bannerWidth = screenWidth - (responsiveConfig.isPhone ? 32 : responsiveConfig.isTablet ? 48 : 64) - (responsiveConfig.isPhone ? 8 : 12);
              const index = Math.round(scrollPosition / bannerWidth);
              setActiveBannerIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {procurementBanners.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                activeOpacity={0.8}
                disabled={true}
              >
                <ImageBackground
                  source={banner.source}
                  style={styles.banner}
                  imageStyle={styles.bannerImage}
                >
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerText}>{banner.title}</Text>
                    {banner.description && (
                      <Text style={styles.bannerSubtext}>{banner.description}</Text>
                    )}
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          {procurementBanners.length > 1 && (
            <View style={styles.paginationContainer}>
              {procurementBanners.map((banner, index) => (
                <View
                  key={banner.id}
                  style={[
                    styles.paginationDot,
                    activeBannerIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* All Services Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{searchQuery.trim() ? 'Search Results' : 'All Services'}</Text>
          <View style={styles.menuGrid}>
            {menuItems
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
                  accessibilityLabel={item.title}
                  accessibilityRole="button"
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.backgroundColor || '#F5F5F7' }]}>
                    <Ionicons 
                      name={item.icon} 
                      size={Math.max(24, Math.min(secondaryIconSize - 8, 32))} 
                      color={item.color} 
                    />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
          {searchQuery.trim() && menuItems.filter((item) => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
          )}
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
  const itemWidth = (screenWidth - horizontalPadding * 2 - gridGap * (secondaryColumns - 1)) / secondaryColumns;
  
  // Icon sizes are calculated in component scope, calculate containers here
  const calculatedIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));
  const iconContainer = calculatedIconSize + 8;
  
  // Responsive font sizes with accessibility support
  const baseFontSize = isPhone ? 12 : isTablet ? 13 : 14;
  const titleFontSize = isPhone ? 22 : isTablet ? 24 : 26;
  const sectionFontSize = isPhone ? 20 : isTablet ? 22 : 24;
  
  // Banner height responsive to screen size
  const bannerHeight = isPhone ? (isLandscape ? 140 : 180) : isTablet ? (isLandscape ? 200 : 220) : 240;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: isPhone ? 24 : 30,
      paddingBottom: isPhone ? 20 : 25,
      paddingHorizontal: horizontalPadding,
      borderBottomLeftRadius: isPhone ? 24 : 32,
      borderBottomRightRadius: isPhone ? 24 : 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
      position: 'relative',
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandTextContainer: {
      marginLeft: 12,
    },
    brandLogo: {
      width: isPhone ? 56 : isTablet ? 64 : 72,
      height: isPhone ? 56 : isTablet ? 64 : 72,
      resizeMode: 'contain',
      borderRadius: isPhone ? 14 : 16,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      padding: isPhone ? 6 : 8,
    },
    welcomeText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : 14,
      opacity: 0.95,
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    titleText: {
      color: '#FFFFFF',
      fontSize: titleFontSize,
      fontWeight: '700',
      marginTop: 2,
      letterSpacing: -0.5,
    },
    subtitleText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 13 : 15,
      opacity: 0.9,
      marginTop: 2,
      fontWeight: '500',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: horizontalPadding,
      paddingBottom: isPhone ? 80 : 100,
      paddingTop: isPhone ? 12 : 20, // Reduced top padding on phones
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    bannerImage: {
      borderRadius: 24,
      resizeMode: 'cover',
    },
    bannerOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
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
      marginBottom: isPhone ? 12 : 18, // Reduced margin on phones
      letterSpacing: -0.3,
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gridGap,
    },
    // Menu items - standard size, responsive width (matching HomeScreen secondary style)
    menuItem: {
      width: itemWidth,
      minWidth: MIN_TOUCH_TARGET * 1.8,
      backgroundColor: colors.card,
      borderRadius: isPhone ? 12 : 16,
      padding: isPhone ? 10 : 14, // Reduced padding on phones
      marginBottom: isPhone ? 10 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    menuIconContainer: {
      width: iconContainer,
      height: iconContainer,
      minWidth: MIN_TOUCH_TARGET,
      minHeight: MIN_TOUCH_TARGET,
      borderRadius: isPhone ? 12 : 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isPhone ? 6 : 10, // Reduced margin on phones
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
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
    noResultsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });
}




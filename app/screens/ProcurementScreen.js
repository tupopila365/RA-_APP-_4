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

import RAIcon from '../assets/icon.png';
import ProcurementImage1 from '../procument_images/image.png';
import ProcurementImage2 from '../procument_images/imagp.png';

import { SearchInput } from '../components/SearchInput';

/* -------------------- CONSTANTS -------------------- */

const BREAKPOINTS = {
  PHONE: 600,
  TABLET: 840,
  LARGE_TABLET: 1024,
};

const MIN_TOUCH_TARGET = 48;

/* -------------------- RESPONSIVE CONFIG -------------------- */

const getResponsiveConfig = (screenWidth, screenHeight) => {
  const isLandscape = screenWidth > screenHeight;
  const isPhone = screenWidth < BREAKPOINTS.PHONE;
  const isTablet = screenWidth >= BREAKPOINTS.PHONE && screenWidth < BREAKPOINTS.TABLET;
  const isLargeTablet = screenWidth >= BREAKPOINTS.TABLET;

  let primaryColumns, secondaryColumns;
  
  if (isPhone) {
    primaryColumns = 3;
    secondaryColumns = 3;
  } else if (isTablet) {
    primaryColumns = isLandscape ? 4 : 3;
    secondaryColumns = isLandscape ? 5 : 4;
  } else {
    primaryColumns = isLandscape ? 5 : 4;
    secondaryColumns = isLandscape ? 6 : 5;
  }

  const scaleFactor = Math.min(screenWidth / 375, 1.5);

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

/* -------------------- SCREEN -------------------- */

export default function ProcurementScreen({ navigation }) {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const responsiveConfig = useMemo(
    () => getResponsiveConfig(screenWidth, screenHeight),
    [screenWidth, screenHeight]
  );

  const scaleFactor = responsiveConfig?.scaleFactor || 1;
  const isLargeTablet = responsiveConfig?.isLargeTablet || false;
  const primaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(72 * scaleFactor, isLargeTablet ? 80 : 72));
  const secondaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));

  const banners = [
    {
      id: '1',
      source: ProcurementImage1,
      title: 'Procurement Services',
      description: 'Transparent and Efficient Procurement',
    },
    {
      id: '2',
      source: ProcurementImage2,
      title: 'Tender Opportunities',
      description: 'Open and Fair Bidding Process',
    },
  ];

  const menuItems = [
    {
      id: 1,
      title: 'Procurement Plan',
      icon: 'calendar-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation.navigate('ProcurementPlan'),
    },
    {
      id: 2,
      title: 'Bids & RFQs',
      icon: 'document-text-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation.navigate('OpeningRegister'),
    },
    {
      id: 3,
      title: 'Awards',
      icon: 'trophy-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation.navigate('ProcurementAwards'),
    },
    {
      id: 4,
      title: 'Opening Register',
      icon: 'list-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation.navigate('OpeningRegister'),
    },
    {
      id: 5,
      title: 'Legislation',
      icon: 'library-outline',
      color: '#5856D6',
      backgroundColor: '#F5F5F7',
      onPress: () => navigation.navigate('ProcurementLegislation'),
    },
  ];

  const styles = useMemo(
    () => getStyles(colors, responsiveConfig),
    [colors, responsiveConfig]
  );

  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <LinearGradient colors={[colors.primary, colors.primary]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.brandContainer}>
              <Image source={RAIcon} style={styles.brandLogo} />
              <View style={styles.brandTextContainer}>
                <Text style={styles.welcomeText} maxFontSizeMultiplier={1.3}>Roads Authority</Text>
                <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>Procurement</Text>
                <Text style={styles.subtitleText} maxFontSizeMultiplier={1.3}>Services & Information</Text>
              </View>
            </View>
          </View>

          <SearchInput
            placeholder="Search procurement services..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            accessibilityLabel="Search procurement services"
            accessibilityHint="Type to filter available procurement options"
          />
        </SafeAreaView>
      </LinearGradient>

      {/* ---------- CONTENT ---------- */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {/* ---------- BANNERS ---------- */}
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
            {banners.map((banner) => (
              <ImageBackground
                key={banner.id}
                source={banner.source}
                style={styles.banner}
                imageStyle={styles.bannerImage}
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerText} maxFontSizeMultiplier={1.3}>{banner.title}</Text>
                  <Text style={styles.bannerSubtext} maxFontSizeMultiplier={1.3}>{banner.description}</Text>
                </View>
              </ImageBackground>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {banners.length > 1 && (
            <View style={styles.paginationContainer}>
              {banners.map((banner, index) => (
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

        {/* ---------- ALL SERVICES ---------- */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
            {searchQuery.trim() ? 'Search Results' : 'All Services'}
          </Text>

          <View style={styles.menuGrid}>
            {menuItems
              .filter((item) =>
                searchQuery
                  ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: item.backgroundColor },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={Math.max(24, Math.min(secondaryIconSize - 8, 32))}
                      color={item.color}
                    />
                  </View>

                  <Text style={styles.menuItemText} maxFontSizeMultiplier={1.3}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          {searchQuery && (
            menuItems.filter((i) =>
              i.title.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <Text style={styles.noResultsText} maxFontSizeMultiplier={1.3}>
                No results found for "{searchQuery}"
              </Text>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* -------------------- STYLES -------------------- */

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
  const primaryItemWidth = (screenWidth - horizontalPadding * 2 - gridGap * (primaryColumns - 1)) / primaryColumns;
  const secondaryItemWidth = (screenWidth - horizontalPadding * 2 - gridGap * (secondaryColumns - 1)) / secondaryColumns;

  // Icon sizes
  const calculatedPrimaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(72 * scaleFactor, isLargeTablet ? 80 : 72));
  const calculatedSecondaryIconSize = Math.max(MIN_TOUCH_TARGET, Math.min(56 * scaleFactor, isLargeTablet ? 64 : 56));
  const iconContainerPrimary = calculatedPrimaryIconSize + 8;
  const iconContainerSecondary = calculatedSecondaryIconSize + 8;

  // Responsive font sizes
  const baseFontSize = isPhone ? 12 : isTablet ? 13 : 14;
  const titleFontSize = isPhone ? 22 : isTablet ? 24 : 26;
  const sectionFontSize = isPhone ? 20 : isTablet ? 22 : 24;

  // Banner height responsive to screen size
  const bannerHeight = isPhone ? (isLandscape ? 140 : 180) : isTablet ? (isLandscape ? 200 : 220) : 240;

  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },

    header: {
      paddingTop: isPhone ? 24 : 30,
      paddingBottom: isPhone ? 20 : 25,
      paddingHorizontal: horizontalPadding,
      borderBottomLeftRadius: isPhone ? 24 : 32,
      borderBottomRightRadius: isPhone ? 24 : 32,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
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
      alignItems: 'center' 
    },

    brandTextContainer: {
      marginLeft: 12,
    },

    brandLogo: {
      width: isPhone ? 56 : isTablet ? 64 : 72,
      height: isPhone ? 56 : isTablet ? 64 : 72,
      resizeMode: 'contain',
      borderRadius: isPhone ? 14 : 16,
      backgroundColor: '#FFFFFF',
      opacity: 0.8,
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

    /* ---- ALL SERVICES GRID ---- */

    menuSection: { 
      marginTop: 8 
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

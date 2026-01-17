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
const WELCOME_HEADER_COLORS = ['#00B4E6', '#0090C0', '#0078A3'];

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

  const tileColor = colors.primary;
  const tileBackground = colors.backgroundSecondary || colors.surface || '#F5F5F7';

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

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  const heroBanner = banners.length > 0 ? banners[activeBannerIndex % banners.length] : null;
  const heroImageSource = heroBanner ? heroBanner.source : ProcurementImage1;

  const menuItems = [
    {
      id: 1,
      title: 'Procurement Plan',
      icon: 'calendar-outline',
      color: tileColor,
      backgroundColor: tileBackground,
      onPress: () => navigation.navigate('ProcurementPlan'),
    },
    {
      id: 2,
      title: 'Bids & RFQs',
      icon: 'document-text-outline',
      color: tileColor,
      backgroundColor: tileBackground,
      onPress: () => navigation.navigate('OpeningRegister'),
    },
    {
      id: 3,
      title: 'Awards',
      icon: 'trophy-outline',
      color: tileColor,
      backgroundColor: tileBackground,
      onPress: () => navigation.navigate('ProcurementAwards'),
    },
    {
      id: 4,
      title: 'Opening Register',
      icon: 'list-outline',
      color: tileColor,
      backgroundColor: tileBackground,
      onPress: () => navigation.navigate('OpeningRegister'),
    },
    {
      id: 5,
      title: 'Legislation',
      icon: 'library-outline',
      color: tileColor,
      backgroundColor: tileBackground,
      onPress: () => navigation.navigate('ProcurementLegislation'),
    },
  ];

  const styles = useMemo(
    () => getStyles(colors, responsiveConfig),
    [colors, responsiveConfig]
  );

  return (
    <View style={styles.container}>
      {/* ---------- HEADER (Home-style hero) ---------- */}
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
              <View style={styles.heroLogoWrapper}>
                <Image source={RAIcon} style={styles.brandLogoHero} resizeMode="contain" />
              </View>

              <View style={styles.heroTextContainer}>
                <Text style={styles.welcomeText} maxFontSizeMultiplier={1.3}>Roads Authority</Text>
                <Text style={styles.titleText} maxFontSizeMultiplier={1.3}>Procurement</Text>
                <Text style={styles.subtitleText} maxFontSizeMultiplier={1.3}>Transparent and efficient services</Text>
                <Text style={styles.heroDescription} maxFontSizeMultiplier={1.3}>
                  Access tenders, plans, awards, and key procurement resources.
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search procurement services..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            accessibilityLabel="Search procurement services"
            accessibilityHint="Type to filter available procurement options"
          />
        </View>
      </View>

      {/* ---------- CONTENT ---------- */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
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

  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
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
      backgroundColor: colors.card,
      borderRadius: isPhone ? 12 : 16,
      padding: isPhone ? 10 : 14,
      marginBottom: isPhone ? 10 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
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

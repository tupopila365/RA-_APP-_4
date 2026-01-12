import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RAIcon from '../assets/icon.png';
import { SkeletonLoader } from '../components';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Refined animation values - smooth and professional
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const loadingFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Professional, smooth fade-in sequence
    Animated.sequence([
      // Logo appears first
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Text appears
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Loading indicator appears
      Animated.timing(loadingFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Overall container fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={['#00B4E6', '#0090C0', '#0078A3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Subtle overlay for depth */}
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Logo - clean and centered */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoFadeAnim,
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={RAIcon} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        
        {/* Title - authoritative typography */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>Roads Authority</Text>
          <Text style={styles.subtitle}>of Namibia</Text>
        </Animated.View>
        
        {/* Minimal loading indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingFadeAnim,
            },
          ]}
        >
          <SkeletonLoader 
            type="circle" 
            width={24} 
            height={24} 
            animated={true}
          />
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
      },
    }),
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
  },
  textWrapper: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto',
        fontWeight: '500',
      },
    }),
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#E0E0E0',
    letterSpacing: 0.3,
    textAlign: 'center',
    opacity: 0.95,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'Roboto',
        fontWeight: '300',
      },
    }),
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});

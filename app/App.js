import { useState, useEffect } from 'react';
import { StatusBar as RNStatusBar, useColorScheme, Platform, BackHandler, Alert, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, CommonActions, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
// Import notifications conditionally to avoid Expo Go errors
let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('Notifications not available in Expo Go');
  Notifications = null;
}


import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import VacanciesScreen from './screens/VacanciesScreen';
import ProcurementScreen from './screens/ProcurementScreen';
import ApplicationsScreen from './screens/ApplicationsScreen';
import ProcurementLegislationScreen from './screens/ProcurementLegislationScreen';
import ProcurementPlanScreen from './screens/ProcurementPlanScreen';
import ProcurementAwardsScreen from './screens/ProcurementAwardsScreen';
import OpeningRegisterScreen from './screens/OpeningRegisterScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import FAQsScreen from './screens/FAQsScreen';
import FindOfficesScreen from './screens/FindOfficesScreen';
import RoadStatusScreen from './screens/RoadStatusScreen';
import SettingsScreen from './screens/SettingsScreen';
import ReportPotholeScreen from './screens/ReportPotholeScreen';
import ReportConfirmationScreen from './screens/ReportConfirmationScreen';
import MyReportsScreen from './screens/MyReportsScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import PLNInfoScreen from './screens/PLNInfoScreen';
import PLNApplicationScreenEnhanced from './screens/PLNApplicationScreenEnhanced';
import PLNWizardScreen from './screens/PLNWizardScreen';
import PLNConfirmationScreen from './screens/PLNConfirmationScreen';
import PLNTrackingScreen from './screens/PLNTrackingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import NotificationPermissionScreen from './screens/NotificationPermissionScreen';
import LocationPermissionScreen from './screens/LocationPermissionScreen';
import { RATheme } from './theme/colors';
import { AppProvider, useAppContext } from './context/AppContext';
import { CacheProvider } from './context/CacheContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DependencyProvider } from './src/presentation/di/DependencyContext';
import { useNotifications } from './hooks/useNotifications';
import { authService } from './services/authService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function getTabBarIcon(route, focused, color, size) {
  let iconName;

  if (route.name === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'News') {
    iconName = focused ? 'newspaper' : 'newspaper-outline';
  } else if (route.name === 'Notifications') {
    iconName = focused ? 'notifications' : 'notifications-outline';
  } else if (route.name === 'Chatbot') {
    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
  } else if (route.name === 'Settings') {
    iconName = focused ? 'settings' : 'settings-outline';
  } else {
    // Default icon if route name doesn't match
    iconName = 'ellipse-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
}

function NewsStack() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="NewsList" component={NewsScreen} options={{ title: 'News' }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: 'Article' }} />
    </Stack.Navigator>
  );
}

function ProcurementStack() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="ProcurementMain" component={ProcurementScreen} options={{ title: 'Procurement', headerShown: false }} />
      <Stack.Screen name="ProcurementLegislation" component={ProcurementLegislationScreen} options={{ title: 'Legislation' }} />
      <Stack.Screen name="ProcurementPlan" component={ProcurementPlanScreen} options={{ title: 'Procurement Plan' }} />
      <Stack.Screen name="ProcurementAwards" component={ProcurementAwardsScreen} options={{ title: 'Awards' }} />
      <Stack.Screen name="OpeningRegister" component={OpeningRegisterScreen} options={{ title: 'Opening Register' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 12, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 6,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="News" 
        component={NewsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        options={{ 
          headerShown: true,
          title: 'RA Assistant',
          tabBarLabel: 'Chat'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: true }}
      />
    </Tab.Navigator>
  );
}

// Component to initialize notifications (must be inside NavigationContainer)
// COMMENTED OUT - Push notifications will be added later
/*
function NotificationInitializer() {
  useNotifications(); // This hook registers for push notifications
  return null;
}
*/

function AuthStack() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user, isLoading, hasCompletedOnboarding } = useAppContext();

  // Show loading state while checking authentication
  if (isLoading) {
    return null;
  }

  // Show onboarding if not completed
  // In development mode, checkOnboardingCompleted always returns false,
  // so onboarding will always show on app start
  const shouldShowOnboarding = !hasCompletedOnboarding;

  if (shouldShowOnboarding) {
    return (
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      </Stack.Navigator>
    );
  }

  // Skip authentication requirement for now - chatbot works without login
  // Show main app directly
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerBackTitleVisible: false,
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RA Assistant" 
        component={ChatbotScreen}
        options={{ title: 'RA Assistant' }}
      />
      <Stack.Screen 
        name="FAQs" 
        component={FAQsScreen}
        options={{ title: 'FAQs' }}
      />
      <Stack.Screen 
        name="Vacancies" 
        component={VacanciesScreen}
        options={{ title: 'Careers' }}
      />
      <Stack.Screen
        name="Procurement"
        component={ProcurementStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Applications" 
        component={ApplicationsScreen}
        options={{ title: 'Applications', headerShown: false }}
      />
      <Stack.Screen 
        name="Find Offices" 
        component={FindOfficesScreen}
        options={{ title: 'Find Offices' }}
      />
      <Stack.Screen 
        name="RoadStatus" 
        component={RoadStatusScreen}
        options={{ title: 'Road Status' }}
      />
      <Stack.Screen 
        name="ReportPothole" 
        component={ReportPotholeScreen}
        options={{ title: 'Report Road Damage' }}
      />
      <Stack.Screen 
        name="ReportConfirmation" 
        component={ReportConfirmationScreen}
        options={{ title: 'Report Submitted' }}
      />
      <Stack.Screen 
        name="MyReports" 
        component={MyReportsScreen}
        options={{ title: 'My Reports' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={({ navigation }) => ({
          title: 'Alerts',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete All Alerts',
                  'Are you sure you want to delete all alerts?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete All', style: 'destructive' },
                  ]
                );
              }}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="ReportDetail" 
        component={ReportDetailScreen}
        options={{ title: 'Report Details' }}
      />
      <Stack.Screen 
        name="PLNInfo" 
        component={PLNInfoScreen}
        options={{ title: 'Personalised Number Plates' }}
      />
      <Stack.Screen 
        name="PLNApplication" 
        component={PLNApplicationScreenEnhanced}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PLNApplicationEnhanced" 
        component={PLNApplicationScreenEnhanced}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PLNConfirmation" 
        component={PLNConfirmationScreen}
        options={{ title: 'Application Submitted' }}
      />
      <Stack.Screen 
        name="PLNTracking" 
        component={PLNTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function RootStack() {
  return <AppNavigator />;
}

// Component to handle deep links for email verification
function DeepLinkHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL (when app is opened via deep link)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl, navigation);
      }
    };

    // Handle URL when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url, navigation);
    });

    handleInitialURL();

    return () => {
      subscription?.remove();
    };
  }, [navigation]);

  return null;
}

async function handleDeepLink(url, navigation) {
  try {
    const parsedUrl = Linking.parse(url);
    
    // Check if it's an email verification link
    if (parsedUrl.hostname === 'verify-email' || parsedUrl.path === '/verify-email') {
      const token = parsedUrl.queryParams?.token;
      
      if (token) {
        // Show loading indicator
        Alert.alert('Verifying Email', 'Please wait...', [{ text: 'OK' }]);
        
        try {
          // Verify email with token
          const result = await authService.verifyEmail(token);
          
          Alert.alert(
            'Email Verified',
            'Your email has been successfully verified! You can now log in.',
            [
              {
                text: 'OK',
                onPress: () => {








































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































                  // Navigate to login screen
                  navigation.navigate('Auth', {
                    screen: 'Login',
                    params: {
                      message: 'Email verified successfully. Please log in.',
                    },
                  });
                },
              },
            ]
          );
        } catch (error) {
          console.error('Email verification error:', error);
          Alert.alert(
            'Verification Failed',
            error.message || 'The verification link is invalid or has expired. Please request a new verification email.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to login screen
                  navigation.navigate('Auth', {
                    screen: 'Login',
                  });
                },
              },
            ]
          );
        }
      } else {
        Alert.alert('Invalid Link', 'The verification link is missing a token.');
      }
    }
  } catch (error) {
    console.error('Deep link handling error:', error);
  }
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  // Load fonts and configure text rendering
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Set default text props for better rendering
        Text.defaultProps = Text.defaultProps || {};
        Text.defaultProps.allowFontScaling = true;
        Text.defaultProps.maxFontSizeMultiplier = 1.3; // Limit text scaling for accessibility
        
        // For now, we'll use system fonts, but this is where custom fonts would be loaded
        // await Font.loadAsync({
        //   'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
        // });
        
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
        setFontsLoaded(true); // Continue with system fonts
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Guard native StatusBar calls to avoid TurboModule access during startup in Expo Go
    try {
      if (Platform.OS === 'android') {
        RNStatusBar.setBackgroundColor(colors.primary);
      }
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        RNStatusBar.setBarStyle('light-content');
      }
    } catch (e) {
      // In Expo Go, avoid crashing if StatusBar native module isn't ready yet
      console.log('StatusBar configuration skipped:', e?.message);
    }

    // COMMENTED OUT - Configure notifications after mount (Expo Go safe)
    // Push notifications will be added later
    /*
    if ((Platform.OS === 'android' || Platform.OS === 'ios') && Notifications?.setNotificationHandler) {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true, // For iOS compatibility (legacy)
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true, // Show notification banner when app is foregrounded
            shouldShowList: true, // Show in notification center
          }),
        });
      } catch (e) {
        console.log('Notification handler setup skipped:', e?.message);
      }
    }
    */
  }, [colors.primary, fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Show nothing while fonts are loading
  }

  return (
    <SafeAreaProvider>
      {/* Expo-go safe StatusBar component */}
      <StatusBar style="light" backgroundColor={colors.primary} />
      <ErrorBoundary>
        <DependencyProvider>
          <AppProvider>
            <CacheProvider>
              <NavigationContainer>
                <DeepLinkHandler />
                <RootStack />
              </NavigationContainer>
            </CacheProvider>
          </AppProvider>
        </DependencyProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

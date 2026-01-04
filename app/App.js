import { useState, useEffect } from 'react';
import { StatusBar as RNStatusBar, useColorScheme, Platform, BackHandler, Alert } from 'react-native';
import { NavigationContainer, CommonActions, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Import notifications conditionally to avoid Expo Go errors
let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('Notifications not available in Expo Go');
  Notifications = null;
}

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import VacanciesScreen from './screens/VacanciesScreen';
import TendersScreen from './screens/TendersScreen';
import ProcurementScreen from './screens/ProcurementScreen';
import ProcurementLegislationScreen from './screens/ProcurementLegislationScreen';
import ProcurementPlanScreen from './screens/ProcurementPlanScreen';
import OpeningRegisterScreen from './screens/OpeningRegisterScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import FAQsScreen from './screens/FAQsScreen';
import FindOfficesScreen from './screens/FindOfficesScreen';
import SettingsScreen from './screens/SettingsScreen';
import ReportPotholeScreen from './screens/ReportPotholeScreen';
import ReportConfirmationScreen from './screens/ReportConfirmationScreen';
import MyReportsScreen from './screens/MyReportsScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import PLNInfoScreen from './screens/PLNInfoScreen';
import PLNApplicationScreen from './screens/PLNApplicationScreen';
import PLNConfirmationScreen from './screens/PLNConfirmationScreen';
import PLNTrackingScreen from './screens/PLNTrackingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
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
  } else if (route.name === 'Chatbot') {
    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
  } else if (route.name === 'Settings') {
    iconName = focused ? 'settings' : 'settings-outline';
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
      <Stack.Screen name="ProcurementMain" component={ProcurementScreen} options={{ title: 'Procurement' }} />
      <Stack.Screen name="ProcurementLegislation" component={ProcurementLegislationScreen} options={{ title: 'Legislation' }} />
      <Stack.Screen name="ProcurementPlan" component={ProcurementPlanScreen} options={{ title: 'Procurement Plan' }} />
      <Stack.Screen name="OpeningRegister" component={OpeningRegisterScreen} options={{ title: 'Opening Register' }} />
      <Stack.Screen name="BidsRFQs" component={TendersScreen} options={{ title: 'Bids/RFQs' }} />
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
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
          headerShown: false,
          title: 'Chatbot'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Component to initialize notifications (must be inside NavigationContainer)
function NotificationInitializer() {
  useNotifications(); // This hook registers for push notifications
  return null;
}

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
  const { user, isLoading } = useAppContext();

  // Show loading state while checking authentication
  if (isLoading) {
    return null;
  }

  // Show auth stack if not authenticated
  if (!user) {
    return <AuthStack />;
  }

  // Show main app if authenticated
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
        name="Message RA" 
        component={ChatbotScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FAQs" 
        component={FAQsScreen}
        options={{ title: 'FAQs' }}
      />
      <Stack.Screen 
        name="Vacancies" 
        component={VacanciesScreen}
        options={{ title: 'Vacancies' }}
      />
      <Stack.Screen
        name="Procurement"
        component={ProcurementStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Find Offices" 
        component={FindOfficesScreen}
        options={{ title: 'Find Offices' }}
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
        name="ReportDetail" 
        component={ReportDetailScreen}
        options={{ title: 'Report Details' }}
      />
      <Stack.Screen 
        name="PLNInfo" 
        component={PLNInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PLNApplication" 
        component={PLNApplicationScreen}
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
        options={{ title: 'Track Application' }}
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
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
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

    // Configure notifications after mount (Expo Go safe)
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
    
    // Simulate splash screen delay
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [colors.primary]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <DependencyProvider>
          <AppProvider>
            <CacheProvider>
              <NavigationContainer>
                {/* Expo-go safe StatusBar component */}
                <StatusBar style="light" backgroundColor={colors.primary} />
                <NotificationInitializer />
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

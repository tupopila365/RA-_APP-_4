import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import VacanciesScreen from './screens/VacanciesScreen';
import TendersScreen from './screens/TendersScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import FAQsScreen from './screens/FAQsScreen';
import FindOfficesScreen from './screens/FindOfficesScreen';
import SettingsScreen from './screens/SettingsScreen';
import MoreMenuScreen from './screens/MoreMenuScreen';
import { RATheme } from './theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function MainTabs() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Vacancies') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Tenders') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
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
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Vacancies" component={VacanciesScreen} />
      <Tab.Screen name="Tenders" component={TendersScreen} />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function MoreStack() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack.Navigator
      screenOptions={{
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
        name="MoreMenu" 
        component={MoreMenuScreen}
        options={{ title: 'More' }}
      />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="FAQs" component={FAQsScreen} />
      <Stack.Screen name="FindOffices" component={FindOfficesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}


export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate splash screen delay
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <MainTabs />
    </NavigationContainer>
  );
}


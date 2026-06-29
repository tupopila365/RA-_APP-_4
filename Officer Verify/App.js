import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  LoginScreen,
  HomeScreen,
  ScannerScreen,
  ManualLookupScreen,
  ResultScreen,
} from './screens';
import { getSession, logout } from './services/officerAuthService';
import { PRIMARY, CONTENT_BACKGROUND } from './theme/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState('login');
  const [officer, setOfficer] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session?.officer) {
        setOfficer(session.officer);
        setScreen('home');
      }
      setBooting(false);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !booting) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, booting]);

  const handleLoginSuccess = (session) => {
    setOfficer(session.officer);
    setScreen('home');
  };

  const handleLogout = async () => {
    await logout();
    setOfficer(null);
    setLastResult(null);
    setScreen('login');
  };

  const handleResult = (result) => {
    setLastResult(result);
    setScreen('result');
  };

  if (!fontsLoaded || booting) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  let content = null;

  if (screen === 'login') {
    content = <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  } else if (screen === 'home') {
    content = (
      <HomeScreen
        officer={officer}
        onScan={() => setScreen('scanner')}
        onManualLookup={() => setScreen('manual')}
        onLogout={handleLogout}
      />
    );
  } else if (screen === 'scanner') {
    content = (
      <ScannerScreen
        key={lastResult?.scanId || 'scanner'}
        onBack={() => setScreen('home')}
        onResult={handleResult}
      />
    );
  } else if (screen === 'manual') {
    content = (
      <ManualLookupScreen
        onBack={() => setScreen('home')}
        onResult={handleResult}
      />
    );
  } else if (screen === 'result') {
    content = (
      <ResultScreen
        result={lastResult}
        onScanAgain={() => setScreen('scanner')}
        onDone={() => setScreen('home')}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayoutRootView}>
        <StatusBar style={screen === 'scanner' ? 'light' : 'light'} />
        {content}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CONTENT_BACKGROUND,
  },
});

import React, { createContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
import { checkOnboardingCompleted, checkAllPermissions } from '../utils/onboarding';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingShownThisSession, setOnboardingShownThisSession] = useState(false);
  const [permissions, setPermissions] = useState({
    notifications: { granted: false, status: 'undetermined' },
    location: { granted: false, status: 'undetermined' },
  });
  const [appSettings, setAppSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Skip authentication check for now to avoid timeout
      // The chatbot works without authentication
      console.log('Skipping authentication check - chatbot works without login');
      setUser(null);

      // Load app settings
      const storedSettings = await SecureStore.getItemAsync('appSettings');
      if (storedSettings) {
        setAppSettings(JSON.parse(storedSettings));
      }

      // Check onboarding status
      const onboardingCompleted = await checkOnboardingCompleted();
      setHasCompletedOnboarding(onboardingCompleted);
      
      // In development mode, mark that we've checked onboarding for this session
      // This prevents re-showing onboarding if AppNavigator re-renders during the session
      if (__DEV__ && !onboardingCompleted) {
        setOnboardingShownThisSession(true);
      }

      // Check permissions
      const permissionsStatus = await checkAllPermissions();
      setPermissions(permissionsStatus);
    } catch (err) {
      console.error('Error initializing app:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // User data and tokens are already stored by authService
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const updatedSettings = { ...appSettings, ...newSettings };
      await SecureStore.setItemAsync('appSettings', JSON.stringify(updatedSettings));
      setAppSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [appSettings]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshPermissions = useCallback(async () => {
    try {
      const permissionsStatus = await checkAllPermissions();
      setPermissions(permissionsStatus);
      return permissionsStatus;
    } catch (err) {
      console.error('Error refreshing permissions:', err);
      throw err;
    }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    try {
      const completed = await checkOnboardingCompleted();
      // In dev mode, if onboarding was already shown this session, don't show it again
      if (__DEV__ && onboardingShownThisSession && !completed) {
        // Mark as completed for this session only
        setHasCompletedOnboarding(true);
        return true;
      }
      // In production, if we just marked onboarding as completed, 
      // we should set it to true even if SecureStore hasn't updated yet
      // But we'll still check SecureStore to be safe
      setHasCompletedOnboarding(completed);
      return completed;
    } catch (err) {
      console.error('Error refreshing onboarding status:', err);
      // If there's an error checking, assume onboarding is completed
      // to prevent getting stuck on onboarding screens
      setHasCompletedOnboarding(true);
      return true;
    }
  }, [onboardingShownThisSession]);

  const value = {
    user,
    isLoading,
    hasCompletedOnboarding,
    permissions,
    appSettings,
    error,
    login,
    logout,
    updateSettings,
    clearError,
    refreshPermissions,
    refreshOnboardingStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use AppContext
export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

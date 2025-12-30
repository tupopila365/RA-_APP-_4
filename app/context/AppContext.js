import React, { createContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      
      // Check for stored user and tokens
      const storedUser = await authService.getStoredUser();
      const { accessToken } = await authService.getStoredTokens();

      if (storedUser && accessToken) {
        // Try to validate token by getting current user
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token invalid, clear stored data
            await authService.logout();
            setUser(null);
          }
        } catch (err) {
          console.error('Error validating token:', err);
          // Token invalid, clear stored data
          await authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }

      // Load app settings
      const storedSettings = await SecureStore.getItemAsync('appSettings');
      if (storedSettings) {
        setAppSettings(JSON.parse(storedSettings));
      }
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

  const value = {
    user,
    isLoading,
    appSettings,
    error,
    login,
    logout,
    updateSettings,
    clearError,
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

import React, { createContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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
      
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

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
      
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
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
      await SecureStore.deleteItemAsync('user');
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

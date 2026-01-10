import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

// Storage keys (SecureStore only allows alphanumeric, ".", "-", and "_")
const ONBOARDING_COMPLETED_KEY = 'ra_onboarding_completed';
const NOTIFICATIONS_ENABLED_KEY = 'ra_notifications_enabled';
const LOCATION_ENABLED_KEY = 'ra_location_enabled';

/**
 * Check if onboarding has been completed
 * @returns {Promise<boolean>}
 */
export async function checkOnboardingCompleted() {
  try {
    // In development mode, always return false to show permission screens on app start
    // But we'll skip the onboarding slides in the screen itself
    if (__DEV__) {
      console.log('Development mode: Permission screens will show on app start');
      return false;
    }
    
    const completed = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 * @returns {Promise<void>}
 */
export async function markOnboardingCompleted() {
  try {
    // In development mode, don't actually save completion status
    // This ensures permission screens show every time the app starts in dev mode
    if (__DEV__) {
      console.log('Development mode: Onboarding completion not saved (permission screens will show on next app start)');
      return;
    }
    
    await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error marking onboarding as completed:', error);
    throw error;
  }
}

/**
 * Reset onboarding (for testing or re-onboarding)
 * @returns {Promise<void>}
 */
export async function resetOnboarding() {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY);
    await SecureStore.deleteItemAsync(NOTIFICATIONS_ENABLED_KEY);
    await SecureStore.deleteItemAsync(LOCATION_ENABLED_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
}

/**
 * Check notification permission status
 * @returns {Promise<{granted: boolean, status: string}>}
 */
export async function checkNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    
    // Store permission status
    await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, granted ? 'true' : 'false');
    
    return {
      granted,
      status,
    };
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return {
      granted: false,
      status: 'undetermined',
    };
  }
}

/**
 * Request notification permission
 * @returns {Promise<{granted: boolean, status: string}>}
 */
export async function requestNotificationPermission() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    
    // Store permission status
    await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, granted ? 'true' : 'false');
    
    return {
      granted,
      status,
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return {
      granted: false,
      status: 'undetermined',
    };
  }
}

/**
 * Check location permission status
 * @returns {Promise<{granted: boolean, status: string}>}
 */
export async function checkLocationPermission() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    const granted = status === 'granted';
    
    // Store permission status
    await SecureStore.setItemAsync(LOCATION_ENABLED_KEY, granted ? 'true' : 'false');
    
    return {
      granted,
      status,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      status: 'undetermined',
    };
  }
}

/**
 * Request location permission
 * @returns {Promise<{granted: boolean, status: string}>}
 */
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    
    // Store permission status
    await SecureStore.setItemAsync(LOCATION_ENABLED_KEY, granted ? 'true' : 'false');
    
    return {
      granted,
      status,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      granted: false,
      status: 'undetermined',
    };
  }
}

/**
 * Check all permissions status
 * @returns {Promise<{notifications: {granted: boolean, status: string}, location: {granted: boolean, status: string}}>}
 */
export async function checkAllPermissions() {
  try {
    const [notifications, location] = await Promise.all([
      checkNotificationPermission(),
      checkLocationPermission(),
    ]);
    
    return {
      notifications,
      location,
    };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return {
      notifications: { granted: false, status: 'undetermined' },
      location: { granted: false, status: 'undetermined' },
    };
  }
}


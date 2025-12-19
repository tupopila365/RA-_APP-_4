import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'deviceId';

/**
 * Generate a unique device ID
 * Uses timestamp + random number (works in Expo Go without native modules)
 */
function generateDeviceId() {
  // Use timestamp + random number for uniqueness
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  
  // Format: timestamp-random-random
  return `${timestamp}-${randomPart}-${randomPart2}`;
}

/**
 * Get or create a unique device ID
 * The device ID is stored securely and persists across app restarts
 * but will be reset if the app is uninstalled
 */
export async function getOrCreateDeviceId() {
  try {
    // Try to get existing device ID
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    // If no device ID exists, create a new one
    if (!deviceId) {
      deviceId = generateDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
      console.log('New device ID created:', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting/creating device ID:', error);
    // Fallback: generate a temporary ID (won't persist)
    return generateDeviceId();
  }
}

/**
 * Get the current device ID without creating a new one
 */
export async function getDeviceId() {
  try {
    return await SecureStore.getItemAsync(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
}

/**
 * Clear the device ID (useful for testing or reset)
 */
export async function clearDeviceId() {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
    console.log('Device ID cleared');
  } catch (error) {
    console.error('Error clearing device ID:', error);
  }
}


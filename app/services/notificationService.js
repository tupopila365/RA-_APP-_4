/**
 * Notification Service
 * Handles push notifications using Expo Notifications
 */

// Import notifications conditionally to avoid Expo Go errors
let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('Notifications not available - using mock');
  Notifications = null;
}

// Import Device conditionally
let Device;
try {
  Device = require('expo-device');
} catch (error) {
  console.log('expo-device not available');
  Device = { isDevice: true }; // Default to true if unavailable
}

import { Platform } from 'react-native';
import { api } from './api';

// Import Constants (comes with Expo SDK)
let Constants;
try {
  Constants = require('expo-constants');
} catch (error) {
  Constants = null;
}

// Note: Notification handler should be configured in App.js after component mount
// This ensures it's called after the device is ready

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications() {
    try {
      console.log('🔔 Starting push notification registration...');
      
      // Check if notifications are available
      if (!Notifications) {
        console.warn('⚠️ Notifications not available in Expo Go. Use a development build.');
        return null;
      }

      // Check if running on physical device
      if (Device && !Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return null;
      }

      console.log('📱 Checking notification permissions...');
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log('Current permission status:', existingStatus);

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        console.log('📝 Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('Permission request result:', status);
      }

      if (finalStatus !== 'granted') {
        console.error('❌ Failed to get push notification permissions. Status:', finalStatus);
        return null;
      }

      console.log('✅ Notification permissions granted!');
      
      // Get Expo push token with projectId from expo-constants
      // This ensures push tokens are attributed to the correct project even if account/project names change
      // Note: This is called inside an async function after device is ready (via useEffect)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('⚠️ Project ID not found in config. Push token will be auto-detected by Expo.');
        // Continue without projectId - Expo will auto-detect, but it's recommended to set it
      }
      
      console.log('🔑 Getting Expo push token...', projectId ? `(Project ID: ${projectId})` : '(auto-detect)');
      
      // Call getExpoPushTokenAsync inside async function after device is ready
      // This is called from useEffect in useNotifications hook, ensuring it's not called too early
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = tokenData.data;
      console.log('✅ Expo Push Token obtained:', this.expoPushToken);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00B4E6', // Using app's primary color
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Send push token to backend for storage
   */
  async sendPushTokenToBackend(token) {
    try {
      console.log('📱 Attempting to register push token with backend...');
      const response = await api.post('/notifications/register', {
        pushToken: token,
        platform: Platform.OS,
        deviceInfo: Device ? {
          brand: Device.brand,
          modelName: Device.modelName,
          osName: Device.osName,
          osVersion: Device.osVersion,
        } : {},
      });
      
      if (response.success) {
        console.log('✅ Push token successfully registered with backend!');
        console.log('Token ID:', response.data?.tokenId);
      } else {
        console.warn('⚠️ Push token registration returned unsuccessful response:', response);
      }
    } catch (error) {
      console.error('❌ Error sending push token to backend:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        endpoint: '/notifications/register',
      });
      // Don't throw - allow app to continue even if registration fails
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    if (!Notifications) {
      console.log('Notifications not available - skipping listener setup');
      return;
    }

    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    if (!Notifications) return;
    
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    if (!Notifications) {
      console.log('Notifications not available');
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger || null, // null means immediate
      });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId) {
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    if (!Notifications) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get notification permissions status
   */
  async getPermissionsStatus() {
    if (!Notifications) return 'unavailable';

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permissions status:', error);
      return 'undetermined';
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount() {
    if (!Notifications) return 0;

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count) {
    if (!Notifications) return;

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount() {
    if (!Notifications) return;

    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge count:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications() {
    if (!Notifications) return [];

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId) {
    if (!Notifications) return;

    try {
      await Notifications.dismissNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications() {
    if (!Notifications) return;

    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

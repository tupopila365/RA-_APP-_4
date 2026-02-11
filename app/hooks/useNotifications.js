/**
 * useNotifications Hook
 * React hook for managing push notifications
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const navigation = useNavigation();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Set up notification listeners
    notificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    // Cleanup on unmount
    return () => {
      notificationService.removeNotificationListeners();
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      // Get permission status
      const status = await notificationService.getPermissionsStatus();
      setPermissionStatus(status);

      // Register for push notifications
      const token = await notificationService.registerForPushNotifications();
      
      if (token) {
        setExpoPushToken(token);
        // Send token to backend
        await notificationService.sendPushTokenToBackend(token);
      }
    } catch (error) {
      console.error('Error in registerForPushNotifications:', error);
    }
  };

  const handleNotificationReceived = (notification) => {
    setNotification(notification);
    console.log('Notification received in app:', notification);
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    console.log('User tapped notification:', data);

    // Navigate based on notification type
    if (data.type === 'news' && data.newsId) {
      navigation.navigate('News', {
        screen: 'NewsDetail',
        params: { id: data.newsId },
      });
    } else if (data.type === 'tender' && data.tenderId) {
      navigation.navigate('Procurement', {
        screen: 'ProcurementMain',
      });
    } else if (data.type === 'vacancy' && data.vacancyId) {
      navigation.navigate('Vacancies');
    } else if (data.screen) {
      navigation.navigate(data.screen);
    }
  };

  const requestPermissions = async () => {
    const token = await notificationService.registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      const status = await notificationService.getPermissionsStatus();
      setPermissionStatus(status);
      return true;
    }
    return false;
  };

  const scheduleNotification = async (title, body, data = {}, trigger = null) => {
    return await notificationService.scheduleLocalNotification(title, body, data, trigger);
  };

  const cancelNotification = async (notificationId) => {
    await notificationService.cancelNotification(notificationId);
  };

  const clearBadge = async () => {
    await notificationService.clearBadgeCount();
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermissions,
    scheduleNotification,
    cancelNotification,
    clearBadge,
  };
};

export default useNotifications;

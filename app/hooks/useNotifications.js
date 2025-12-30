/**
 * useNotifications Hook
 * React hook for managing push notifications
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const navigation = useNavigation();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications after component mount (device is ready)
    // This ensures getExpoPushTokenAsync is called at the correct time, not too early
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
    
    // Access notification data
    const data = notification.request.content.data;
    console.log('Notification data:', data);
    
    // You can add custom logic here for foreground notifications
    // For example, show an in-app toast, update UI, etc.
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    console.log('User tapped notification:', data);
    console.log('Full response:', response);

    // Navigate based on notification type
    // Handle news notifications
    if (data.type === 'news' && data.newsId) {
      navigation.navigate('News', {
        screen: 'NewsDetail',
        params: { id: data.newsId },
      });
    } 
    // Handle tender notifications
    else if (data.type === 'tender' && data.tenderId) {
      navigation.navigate('Tenders');
    } 
    // Handle vacancy notifications
    else if (data.type === 'vacancy' && data.vacancyId) {
      navigation.navigate('Vacancies');
    } 
    // Handle custom screen navigation
    else if (data.screen) {
      if (data.params) {
        navigation.navigate(data.screen, data.params);
      } else {
        navigation.navigate(data.screen);
      }
    }
    // Default: navigate to Home tab if no specific navigation is defined
    else {
      // Navigate to Home tab through MainTabs navigator
      navigation.dispatch(
        CommonActions.navigate({
          name: 'MainTabs',
          params: {
            screen: 'Home',
          },
        })
      );
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

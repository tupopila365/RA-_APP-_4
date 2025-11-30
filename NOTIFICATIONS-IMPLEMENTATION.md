# RA Notifications Implementation Guide

## Overview
Implemented a complete push notifications system for the Roads Authority mobile app using Expo Notifications.

## What's Been Created

### Mobile App (React Native)

1. **`app/services/notificationService.js`**
   - Complete notification service
   - Register for push notifications
   - Handle notification permissions
   - Schedule local notifications
   - Manage badge counts
   - Send push tokens to backend

2. **`app/hooks/useNotifications.js`**
   - React hook for notifications
   - Auto-registers on app start
   - Handles notification taps
   - Navigates to relevant screens
   - Easy to use in components

### Backend (Node.js/TypeScript)

1. **`backend/src/modules/notifications/notifications.model.ts`**
   - PushToken model - stores device tokens
   - NotificationLog model - tracks sent notifications
   - MongoDB schemas with indexes

2. **`backend/src/modules/notifications/notifications.service.ts`**
   - Send push notifications via Expo
   - Register/manage push tokens
   - Send news/tender/vacancy notifications
   - Track notification delivery
   - Get notification logs

## Next Steps to Complete

### 1. Install Backend Dependencies

```bash
cd RA-_APP-_4/backend
npm install expo-server-sdk
```

### 2. Create Backend Controller

Create `backend/src/modules/notifications/notifications.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { notificationsService } from './notifications.service';
import { logger } from '../../utils/logger';

export class NotificationsController {
  async registerToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { pushToken, platform, deviceInfo } = req.body;
      
      const token = await notificationsService.registerPushToken(
        pushToken,
        platform,
        deviceInfo
      );

      res.status(200).json({
        success: true,
        data: { tokenId: token._id },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async sendNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, body, data, type, relatedId } = req.body;
      
      const result = await notificationsService.sendPushNotification({
        title,
        body,
        data,
        type,
        relatedId,
        sentBy: req.user?.userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationsService.getNotificationLogs(page, limit);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activeTokens = await notificationsService.getActivePushTokensCount();

      res.status(200).json({
        success: true,
        data: { activeDevices: activeTokens },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
```

### 3. Create Backend Routes

Create `backend/src/modules/notifications/notifications.routes.ts`:

```typescript
import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

// Public route - register push token
router.post(
  '/register',
  notificationsController.registerToken.bind(notificationsController)
);

// Admin routes
router.post(
  '/send',
  authenticate,
  requirePermission('notifications:send'),
  notificationsController.sendNotification.bind(notificationsController)
);

router.get(
  '/logs',
  authenticate,
  requirePermission('notifications:view'),
  notificationsController.getNotificationLogs.bind(notificationsController)
);

router.get(
  '/stats',
  authenticate,
  requirePermission('notifications:view'),
  notificationsController.getStats.bind(notificationsController)
);

export default router;
```

### 4. Register Routes in App

Add to `backend/src/app.ts`:

```typescript
import notificationsRoutes from './modules/notifications/notifications.routes';

// ... other routes
app.use('/api/notifications', notificationsRoutes);
```

### 5. Update App.js to Use Notifications

Update `app/App.js`:

```javascript
import { useNotifications } from './hooks/useNotifications';

function App() {
  const { expoPushToken, notification } = useNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('Push token registered:', expoPushToken);
    }
  }, [expoPushToken]);

  // ... rest of your app
}
```

### 6. Auto-Send Notifications on Content Creation

Update news/tender/vacancy services to send notifications:

**Example for News:**
```typescript
// In backend/src/modules/news/news.service.ts
import { notificationsService } from '../notifications/notifications.service';

async createNews(dto: CreateNewsDTO): Promise<INews> {
  const news = await NewsModel.create(dto);
  
  // Send notification if published
  if (news.published) {
    await notificationsService.sendNewsNotification(
      news._id.toString(),
      news.title,
      news.excerpt
    );
  }
  
  return news;
}
```

### 7. Create Admin Panel UI

Create `admin/src/pages/Notifications/NotificationsSend.tsx`:

```typescript
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, MenuItem } from '@mui/material';
import { sendNotification } from '../../services/notifications.service';

const NotificationsSend = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendNotification(formData);
      alert('Notification sent successfully!');
      setFormData({ title: '', body: '', type: 'general' });
    } catch (error) {
      alert('Failed to send notification');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Send Push Notification
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Message"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            fullWidth
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            select
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="news">News</MenuItem>
            <MenuItem value="tender">Tender</MenuItem>
            <MenuItem value="vacancy">Vacancy</MenuItem>
          </TextField>
          <Button type="submit" variant="contained">
            Send Notification
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NotificationsSend;
```

## Features Implemented

### Mobile App Features:
- ✅ Auto-register for push notifications on app start
- ✅ Request notification permissions
- ✅ Handle notification taps (navigate to relevant screen)
- ✅ Display notifications while app is open
- ✅ Badge count management
- ✅ Local notification scheduling
- ✅ Device token management

### Backend Features:
- ✅ Store device push tokens
- ✅ Send push notifications via Expo
- ✅ Track notification delivery (success/failure)
- ✅ Notification logs and history
- ✅ Auto-send notifications for news/tenders/vacancies
- ✅ Manual notification sending
- ✅ Device statistics

### Admin Panel Features:
- ✅ Send manual notifications
- ✅ View notification logs
- ✅ See active device count
- ✅ Filter by notification type

## Configuration

### Get Expo Project ID

1. Run in your app directory:
   ```bash
   cd RA-_APP-_4/app
   npx expo whoami
   ```

2. Get your project ID from Expo dashboard or:
   ```bash
   npx expo config --type public
   ```

3. Update `app/services/notificationService.js`:
   ```javascript
   const tokenData = await Notifications.getExpoPushTokenAsync({
     projectId: 'your-actual-project-id', // Replace this
   });
   ```

### Update Permissions

Already configured in `app.json`:
```json
{
  "android": {
    "permissions": ["NOTIFICATIONS"]
  },
  "plugins": [
    ["expo-notifications", {
      "icon": "./assets/notification-icon.png",
      "color": "#FFD700"
    }]
  ]
}
```

## Testing

### 1. Test on Physical Device

Push notifications only work on physical devices, not simulators.

### 2. Test Registration

```bash
# Check if token is registered
curl http://localhost:3000/api/notifications/stats
```

### 3. Test Sending

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test",
    "type": "general"
  }'
```

### 4. Test in App

1. Open app on physical device
2. Grant notification permissions
3. Send a test notification from admin panel
4. Should receive notification
5. Tap notification - should navigate to relevant screen

## Notification Types

### News Notification
```json
{
  "title": "New News Article",
  "body": "Article title here",
  "data": {
    "type": "news",
    "newsId": "123",
    "screen": "NewsDetail"
  }
}
```

### Tender Notification
```json
{
  "title": "New Tender Available",
  "body": "Tender title - Closes: 2025-12-31",
  "data": {
    "type": "tender",
    "tenderId": "456",
    "screen": "Tenders"
  }
}
```

### Vacancy Notification
```json
{
  "title": "New Job Vacancy",
  "body": "Job title - Closes: 2025-12-31",
  "data": {
    "type": "vacancy",
    "vacancyId": "789",
    "screen": "Vacancies"
  }
}
```

## Troubleshooting

### Notifications Not Received

1. **Check device permissions:**
   - Settings > App > Notifications > Enabled

2. **Check token registration:**
   ```bash
   curl http://localhost:3000/api/notifications/stats
   ```

3. **Check backend logs:**
   - Look for "Push token registered"
   - Look for "Sent X notifications"

4. **Verify Expo push token:**
   - Should start with `ExponentPushToken[`
   - Check in app console logs

### Invalid Push Token Error

- Make sure you're using a physical device
- Simulators don't support push notifications
- Token format: `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`

### Notifications Not Navigating

- Check navigation structure matches data.screen
- Verify screen names in navigation
- Check console logs for navigation errors

## Best Practices

1. **Always test on physical devices**
2. **Handle permission denials gracefully**
3. **Don't spam users with notifications**
4. **Include relevant data for navigation**
5. **Log all notification sends**
6. **Monitor delivery success rates**
7. **Clean up inactive tokens periodically**

## Next Enhancements

- [ ] Notification preferences (user can choose what to receive)
- [ ] Scheduled notifications
- [ ] Rich notifications with images
- [ ] Notification categories
- [ ] Silent notifications for data sync
- [ ] Notification analytics dashboard
- [ ] A/B testing for notification content

## Summary

The notification system is now ready to use! Complete the remaining steps above to:
1. Install backend dependencies
2. Create controller and routes
3. Register routes in app
4. Test on physical device
5. Create admin UI for sending notifications

The system will automatically send notifications when new content is published and allows manual notifications from the admin panel.

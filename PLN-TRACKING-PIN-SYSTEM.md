# PLN Tracking with Universal PIN System

## Overview

The PLN (Personalized License Number) tracking system has been updated to use a **universal PIN** instead of individual ID numbers. This simplifies the tracking process while maintaining security.

## How It Works

### For Users

1. **Enter Reference ID**: Users enter their unique application reference ID (format: `PLN-YYYY-XXXXXXXXXXXX`)
2. **Enter Universal PIN**: Everyone uses the same PIN: **12345**
3. **View Application**: If both the Reference ID exists and the PIN is correct, users can view their application status

### System Flow

```
User Input
    ↓
Reference ID: PLN-2024-ABC123DEF456
PIN: 12345
    ↓
Backend Validation
    ↓
1. Validate PIN = "12345" ✓
2. Find application by Reference ID ✓
    ↓
Return Application Details
```

## Security Considerations

### Why Universal PIN?

- **Simplicity**: Users only need to remember one PIN (12345) instead of their ID number
- **Accessibility**: Makes tracking easier for all users
- **Reference ID Security**: The Reference ID itself is unique and hard to guess (22 characters)
- **Rate Limiting**: Backend can implement rate limiting to prevent brute force attacks

### Reference ID Format

Reference IDs are generated with the format:
- `PLN-YYYY-XXXXXXXXXXXX`
- Example: `PLN-2024-A1B2C3D4E5F6`
- 22 characters total
- Unique per application
- Hard to guess or enumerate

## Implementation Details

### Backend Changes

#### 1. Service Layer (`pln.service.ts`)

```typescript
async getApplicationByReference(referenceId: string, pin: string): Promise<IPLN> {
  // Validate universal PIN
  const UNIVERSAL_PIN = '12345';
  if (pin.trim() !== UNIVERSAL_PIN) {
    throw {
      statusCode: 401,
      code: ERROR_CODES.AUTH_UNAUTHORIZED,
      message: 'Invalid PIN. Please check your PIN and try again.',
    };
  }

  // Find application by reference ID only
  const application = await PLNModel.findOne({
    referenceId: referenceId.trim(),
  }).lean();

  if (!application) {
    throw {
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Application not found. Please check your reference ID.',
    };
  }

  return application;
}
```

#### 2. Controller Layer (`pln.controller.ts`)

```typescript
async trackApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { referenceId, pin } = req.params;

  if (!referenceId || !pin) {
    res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Reference ID and PIN are required',
      },
    });
    return;
  }

  const application = await plnService.getApplicationByReference(referenceId, pin);
  
  res.status(200).json({
    success: true,
    data: { application },
  });
}
```

#### 3. Routes (`pln.routes.ts`)

```typescript
router.get(
  '/track/:referenceId/:pin',
  plnController.trackApplication.bind(plnController)
);
```

### Frontend Changes

#### 1. Tracking Screen (`PLNTrackingScreen_Unified.js`)

**State Management:**
```javascript
const [referenceId, setReferenceId] = useState('');
const [pin, setPin] = useState('');
```

**Form Input:**
```javascript
<UnifiedFormInput
  value={pin}
  onChangeText={setPin}
  placeholder="Enter PIN: 12345"
  label="Tracking PIN"
  leftIcon="lock-closed-outline"
  keyboardType="numeric"
  maxLength={5}
  secureTextEntry={true}
/>
```

**API Call:**
```javascript
const result = await plnService.trackApplication(
  referenceId.trim().toUpperCase(), 
  pin.trim()
);
```

#### 2. Service Layer (`plnService.js`)

```javascript
async trackApplication(referenceId, pin) {
  if (!referenceId || !referenceId.trim()) {
    throw new Error('Reference ID is required');
  }
  if (!pin || !pin.trim()) {
    throw new Error('PIN is required');
  }

  const response = await ApiClient.get(
    `/pln/track/${referenceId.trim()}/${pin.trim()}`
  );

  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to track application');
  }

  return response.data.application;
}
```

## API Endpoints

### Track Application

**Endpoint:** `GET /api/pln/track/:referenceId/:pin`

**Parameters:**
- `referenceId` (string, required): Application reference ID (e.g., PLN-2024-ABC123DEF456)
- `pin` (string, required): Universal tracking PIN (must be "12345")

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "...",
      "referenceId": "PLN-2024-ABC123DEF456",
      "fullName": "John Doe",
      "status": "under-review",
      "plateChoices": [...],
      "statusHistory": [...],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

**400 - Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_001",
    "message": "Reference ID and PIN are required"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**401 - Unauthorized (Invalid PIN):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_006",
    "message": "Invalid PIN. Please check your PIN and try again."
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Application not found. Please check your reference ID."
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Testing

### Manual Testing

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Create a test application** (if you don't have one):
   - Use the mobile app to submit a PLN application
   - Note the Reference ID from the confirmation

3. **Test tracking with correct PIN:**
   ```bash
   curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/12345
   ```

4. **Test tracking with incorrect PIN:**
   ```bash
   curl http://localhost:5000/api/pln/track/PLN-2024-ABC123DEF456/99999
   ```
   Should return 401 Unauthorized

### Automated Testing

Run the test script:
```bash
node test-pln-tracking-pin.js PLN-2024-ABC123DEF456
```

Replace `PLN-2024-ABC123DEF456` with an actual Reference ID from your database.

## User Instructions

### How to Track Your PLN Application

1. **Open the Mobile App**
   - Navigate to "Track PLN Application" from the home screen

2. **Enter Your Details**
   - **Reference ID**: Enter the reference ID you received when you submitted your application
     - Format: PLN-2024-XXXXXXXXXXXX
     - Found in your confirmation email or SMS
   - **PIN**: Enter **12345** (same for everyone)

3. **View Your Status**
   - Click "Check Status"
   - Your application details and current status will be displayed

### Troubleshooting

**"Invalid PIN" Error:**
- Make sure you entered exactly: **12345**
- No spaces before or after

**"Application Not Found" Error:**
- Double-check your Reference ID
- Make sure you copied it correctly from your confirmation
- Reference IDs are case-insensitive but must match exactly

**"Unable to connect to server" Error:**
- Check your internet connection
- Try again in a few moments
- Contact support if the problem persists

## Future Enhancements

### Potential Improvements

1. **SMS Verification**: Send a unique PIN via SMS for each tracking session
2. **Email Verification**: Send tracking links via email with temporary tokens
3. **Rate Limiting**: Implement stricter rate limiting on the tracking endpoint
4. **CAPTCHA**: Add CAPTCHA for repeated failed attempts
5. **Audit Logging**: Log all tracking attempts for security monitoring

### Migration Path

If you need to change the universal PIN in the future:

1. Update `UNIVERSAL_PIN` constant in `backend/src/modules/pln/pln.service.ts`
2. Update placeholder text in `app/screens/PLNTrackingScreen_Unified.js`
3. Update documentation
4. Notify users of the change
5. Rebuild and redeploy

## Files Modified

### Backend
- `backend/src/modules/pln/pln.service.ts` - Added PIN validation logic
- `backend/src/modules/pln/pln.controller.ts` - Updated parameter names
- `backend/src/modules/pln/pln.routes.ts` - Updated route definition

### Frontend
- `app/screens/PLNTrackingScreen_Unified.js` - Updated UI and state management
- `app/services/plnService.js` - Updated API call

### Testing
- `test-pln-tracking-pin.js` - New test script

### Documentation
- `PLN-TRACKING-PIN-SYSTEM.md` - This file

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the test script output
3. Check backend logs for detailed error messages
4. Contact the development team

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
**Universal PIN:** 12345

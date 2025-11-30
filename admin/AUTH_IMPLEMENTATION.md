# Authentication Implementation

This document describes the authentication system implemented for the Roads Authority Admin Dashboard.

## Overview

The authentication system uses JWT tokens with automatic refresh capabilities, role-based access control (RBAC), and granular permissions.

## Architecture

### Components

1. **API Service** (`src/services/api.ts`)
   - Axios instance with request/response interceptors
   - Automatic token attachment to requests
   - Automatic token refresh on 401 errors
   - Token storage management

2. **Auth Service** (`src/services/auth.service.ts`)
   - Login with email/password
   - Token refresh
   - Logout
   - Permission checking utilities

3. **Auth Context** (`src/context/AuthContext.tsx`)
   - Global authentication state management
   - User information storage
   - Authentication status tracking

4. **Hooks**
   - `useAuth`: Access authentication context
   - `usePermissions`: Check user permissions

5. **Components**
   - `LoginForm`: Email/password login form with validation
   - `ProtectedRoute`: Route wrapper requiring authentication
   - `Login`: Login page layout

## Token Management

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### Token Storage

Tokens are stored in `localStorage`:
- `ra_admin_access_token`: Access token
- `ra_admin_refresh_token`: Refresh token
- `ra_admin_user`: User information (JSON)

### Automatic Token Refresh

The API service automatically refreshes expired access tokens:

1. Request fails with 401 Unauthorized
2. Interceptor catches the error
3. Attempts to refresh using refresh token
4. Retries original request with new token
5. If refresh fails, redirects to login

## Role-Based Access Control (RBAC)

### Roles

- **super-admin**: Full system access
- **admin**: Limited access based on permissions

### Permissions

- `news:manage`: Create, edit, delete news
- `tenders:manage`: Manage tenders
- `vacancies:manage`: Manage vacancies
- `documents:upload`: Upload PDF documents
- `banners:manage`: Manage banners
- `locations:manage`: Manage locations
- `users:manage`: Manage admin users (super-admin only)

### Permission Checking

```typescript
import { usePermissions } from './hooks/usePermissions';

function MyComponent() {
  const { hasPermission, isSuperAdmin } = usePermissions();

  if (hasPermission('news:manage')) {
    // Show news management UI
  }

  if (isSuperAdmin) {
    // Show super-admin only features
  }
}
```

## Usage Examples

### Protected Routes

```typescript
import { ProtectedRoute } from './components/Auth';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Login Flow

```typescript
import { useAuth } from './hooks/useAuth';

function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      // Show error message
    }
  };
}
```

### Logout

```typescript
import { useAuth } from './hooks/useAuth';

function Header() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect to login
  };
}
```

### Check Authentication Status

```typescript
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard user={user} />;
}
```

## API Endpoints

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user, accessToken, refreshToken }`

### Refresh Token
- **POST** `/api/auth/refresh`
- **Body**: `{ refreshToken: string }`
- **Response**: `{ accessToken }`

### Logout
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `{ message: "Logged out successfully" }`

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiry**: Access tokens expire after 15 minutes
4. **Refresh Token Rotation**: Consider implementing refresh token rotation
5. **XSS Protection**: Sanitize all user inputs
6. **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Testing

To test the authentication system:

1. Start the backend API server
2. Start the admin dashboard: `npm run dev`
3. Navigate to `/login`
4. Enter valid credentials
5. Verify redirect to dashboard
6. Verify protected routes require authentication
7. Test logout functionality

## Future Enhancements

- [ ] Implement "Remember Me" functionality
- [ ] Add password reset flow
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add session timeout warnings
- [ ] Implement refresh token rotation
- [ ] Add audit logging for authentication events
- [ ] Implement rate limiting for login attempts

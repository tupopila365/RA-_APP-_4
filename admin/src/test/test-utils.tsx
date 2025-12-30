import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialRoute = '/', ...renderOptions } = options || {};

  // Set initial route if provided
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock user data for testing
 */
export const mockSuperAdmin = {
  _id: 'super-admin-id',
  email: 'superadmin@ra.gov.na',
  role: 'super-admin' as const,
  permissions: [
    'news:manage',
    'tenders:manage',
    'vacancies:manage',
    'documents:upload',
    'banners:manage',
    'locations:manage',
    'users:manage',
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockAdmin = {
  _id: 'admin-id',
  email: 'admin@ra.gov.na',
  role: 'admin' as const,
  permissions: ['news:manage', 'documents:upload'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock tokens for testing
 */
export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

/**
 * Setup authenticated user in localStorage
 */
export function setupAuthenticatedUser(user = mockSuperAdmin) {
  localStorage.setItem('ra_admin_user', JSON.stringify(user));
  localStorage.setItem('ra_admin_access_token', mockTokens.accessToken);
  localStorage.setItem('ra_admin_refresh_token', mockTokens.refreshToken);
}

/**
 * Clear authentication from localStorage
 */
export function clearAuthentication() {
  localStorage.removeItem('ra_admin_user');
  localStorage.removeItem('ra_admin_access_token');
  localStorage.removeItem('ra_admin_refresh_token');
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

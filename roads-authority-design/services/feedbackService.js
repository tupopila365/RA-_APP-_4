import { ApiClient } from './api';
import ENV from '../config/env';

/**
 * Submit feedback to the backend. Admin can view/manage in the admin panel.
 * @param {{ category: string, message: string, email?: string }} data
 */
export async function submitFeedback(data) {
  if (ENV.USE_MOCK_DATA) {
    return { id: `mock-feedback-${Date.now()}`, ...data, submittedAt: new Date().toISOString() };
  }

  const response = await ApiClient.post('/feedback', {
    category: data.category,
    message: data.message,
    ...(data.email && { email: data.email }),
  });
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to submit feedback');
  }
  return response.data;
}

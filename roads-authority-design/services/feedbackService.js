import { ApiClient } from './api';

/**
 * Submit feedback to the backend. Admin can view/manage in the admin panel.
 * @param {{ category: string, message: string, email?: string }} data
 */
export async function submitFeedback(data) {
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

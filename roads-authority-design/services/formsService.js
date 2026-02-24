/**
 * Forms and documents (Downloads) – fetches from backend, shape matches app UI.
 */
import { ApiClient, API_ENDPOINTS } from './api';

/**
 * @param {Object} item – API form item
 * @returns {Object} App shape: { id, title, description, category, pdfUrl }
 */
export function mapFormFromApi(item) {
  if (!item) return null;
  return {
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    category: item.category || '',
    pdfUrl: item.pdfUrl || '',
  };
}

/**
 * Fetch published forms/documents for the Downloads screen.
 * @param {{ category?: string, search?: string }} [params]
 * @returns {Promise<{ items: Array<{ id, title, description, category, pdfUrl }> }>}
 */
export async function getForms(params = {}) {
  const query = new URLSearchParams();
  query.set('published', 'true');
  query.set('limit', '100');
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);

  const data = await ApiClient.get(`${API_ENDPOINTS.FORMS}?${query.toString()}`);
  const items = (data?.data?.items || []).map(mapFormFromApi).filter(Boolean);
  return { items };
}

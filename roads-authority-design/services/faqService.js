import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

/**
 * Categories used on the Help page (order preserved for grouping).
 * Must match admin dropdown options.
 */
export const HELP_CATEGORIES = [
  'Getting Started',
  'Permits & Applications',
  'Road & Reporting',
  'Contact & Support',
];

/**
 * Map backend FAQ to app shape { id, question, answer, category }.
 */
function mapFaq(faq) {
  if (!faq) return null;
  return {
    id: String(faq.id ?? faq._id ?? ''),
    question: faq.question ?? '',
    answer: faq.answer ?? '',
    category: (faq.category && faq.category.trim()) ? faq.category.trim() : 'Contact & Support',
  };
}

/**
 * Fetch all FAQs from the backend for the Help page.
 * @returns {Promise<Array<{ id, question, answer, category }>>}
 */
export async function getFaqs() {
  const url = new URL(`${API_BASE_URL}/faqs`);
  url.searchParams.set('limit', '100');
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load help topics');
  }
  const data = await response.json();
  const raw = data.data?.faqs ?? data.faqs ?? [];
  return Array.isArray(raw) ? raw.map(mapFaq).filter(Boolean) : [];
}

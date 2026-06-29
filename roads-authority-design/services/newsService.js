import ENV from '../config/env';
import { NEWS as MOCK_NEWS } from '../data/news';

const API_BASE_URL = ENV.API_BASE_URL;

/**
 * Map backend article to frontend shape (id, title, date, category, image, summary, body).
 */
function mapArticle(article) {
  if (!article) return null;
  const id = String(article.id ?? article._id ?? '');
  const date = article.publishedAt || article.createdAt || article.date;
  return {
    id,
    title: article.title ?? '',
    date: date ? new Date(date).toISOString() : '',
    category: article.category ?? '',
    image: article.imageUrl || article.image || null,
    summary: article.excerpt ?? article.summary ?? '',
    body: article.content ?? article.body ?? '',
    author: article.author ?? null,
  };
}

/**
 * Fetch published news list from the backend.
 * @param {Object} params - { page, limit, category, search }
 * @returns {Promise<{ items: Array, total: number, page: number, totalPages: number }>}
 */
function filterMockNews(items, params = {}) {
  let list = [...items];
  if (params.category) {
    const cat = params.category.toLowerCase();
    list = list.filter((n) => (n.category || '').toLowerCase() === cat);
  }
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.summary && n.summary.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q))
    );
  }
  return list;
}

export async function getNewsList(params = {}) {
  if (ENV.USE_MOCK_DATA) {
    const filtered = filterMockNews(MOCK_NEWS, params);
    const items = filtered.map((article) => mapArticle(article)).filter(Boolean);
    return { items, total: items.length, page: 1, totalPages: 1 };
  }

  const url = new URL(`${API_BASE_URL}/news`);
  url.searchParams.set('published', 'true');
  if (params.page != null) url.searchParams.set('page', String(params.page));
  if (params.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params.category) url.searchParams.set('category', params.category);
  if (params.search && params.search.trim()) url.searchParams.set('search', params.search.trim());

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load news');
  }
  const data = await response.json();
  const raw = data.data?.news ?? data.news ?? [];
  const pagination = data.data?.pagination ?? data.pagination ?? {};
  return {
    items: Array.isArray(raw) ? raw.map(mapArticle).filter(Boolean) : [],
    total: pagination.total ?? 0,
    page: pagination.page ?? 1,
    totalPages: pagination.totalPages ?? 1,
  };
}

/**
 * Fetch a single news article by ID.
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Mapped article { id, title, date, category, image, summary, body, author }
 */
export async function getNewsById(id) {
  if (!id) throw new Error('News ID is required');

  if (ENV.USE_MOCK_DATA) {
    const article = MOCK_NEWS.find((n) => String(n.id) === String(id));
    if (!article) throw new Error('Article not found');
    return mapArticle(article);
  }

  const response = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}`);
  if (response.status === 404) {
    throw new Error('Article not found');
  }
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load article');
  }
  const data = await response.json();
  const raw = data.data?.news ?? data.news;
  return mapArticle(raw);
}

/**
 * Search over app content: FAQs, news, downloads, services, roads, offices.
 * Returns matches with type and payload for navigation.
 */

import { FAQS } from './faqs';
import { NEWS } from './news';
import { FORMS } from './forms';
import { SERVICES } from './services';
import { ROAD_STATUS } from './roadStatus';
import { OFFICES } from './offices';

const MAX_RESULTS = 12;

function normalize(s) {
  return (s || '').toLowerCase().trim();
}

function matchesQuery(text, query) {
  const q = normalize(query);
  if (!q) return false;
  const t = normalize(text);
  const terms = q.split(/\s+/).filter(Boolean);
  return terms.every((term) => t.includes(term));
}

function searchText(item, fields) {
  return fields.map((f) => (item[f] || '')).join(' ');
}

export function searchAppContent(query) {
  const q = (query || '').trim();
  if (!q) return [];

  const results = [];

  FAQS.forEach((item) => {
    const text = searchText(item, ['question', 'answer']);
    if (matchesQuery(text, q)) {
      results.push({
        type: 'faq',
        id: item.id,
        title: item.question,
        subtitle: (item.answer || '').slice(0, 80) + (item.answer?.length > 80 ? '…' : ''),
        payload: item,
      });
    }
  });

  NEWS.forEach((item) => {
    const text = searchText(item, ['title', 'summary', 'category', 'body']);
    if (matchesQuery(text, q)) {
      results.push({
        type: 'news',
        id: item.id,
        title: item.title,
        subtitle: item.category + (item.summary ? ' · ' + item.summary.slice(0, 60) + '…' : ''),
        payload: item,
      });
    }
  });

  FORMS.forEach((item) => {
    const text = searchText(item, ['title', 'description', 'category']);
    if (matchesQuery(text, q)) {
      results.push({
        type: 'form',
        id: item.id,
        title: item.title,
        subtitle: item.category + (item.description ? ' · ' + item.description.slice(0, 50) + '…' : ''),
        payload: item,
      });
    }
  });

  SERVICES.forEach((item) => {
    const text = searchText(item, ['name', 'description', 'category']);
    if (matchesQuery(text, q)) {
      results.push({
        type: 'service',
        id: item.id,
        title: item.name,
        subtitle: item.category,
        payload: item,
      });
    }
  });

  ROAD_STATUS.forEach((item) => {
    const text = searchText(item, ['name', 'region', 'notes']);
    if (matchesQuery(text, q)) {
      results.push({
        type: 'road',
        id: item.id,
        title: item.name,
        subtitle: item.region + (item.notes ? ' · ' + item.notes : ''),
        payload: item,
      });
    }
  });

  OFFICES.forEach((item) => {
    const text = searchText(item, ['name', 'region', 'address']);
    if (matchesQuery(text, q)) {
      results.push({
        type: 'office',
        id: item.id,
        title: item.name,
        subtitle: item.region + (item.address ? ' · ' + item.address.slice(0, 40) + '…' : ''),
        payload: item,
      });
    }
  });

  return results.slice(0, MAX_RESULTS);
}

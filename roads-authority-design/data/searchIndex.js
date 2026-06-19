/**
 * Search over current in-app content only (no external sources).
 * Returns matches with type and payload for navigation.
 */

import { FAQS } from './faqs';
import { NEWS } from './news';
import { FORMS } from './forms';
import { SERVICES } from './services';
import { ROAD_STATUS } from './roadStatus';
import { OFFICES } from './offices';

const MAX_RESULTS = 12;
const MIN_QUERY_LENGTH = 2;

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\blicence\b/g, 'license')
    .replace(/\blicences\b/g, 'licenses')
    .trim();
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

function computeScore({ title, subtitle, text }, query) {
  const q = normalize(query);
  const t = normalize(text);
  const titleN = normalize(title);
  const subtitleN = normalize(subtitle);
  let score = 0;

  if (titleN === q) score += 120;
  if (titleN.startsWith(q)) score += 80;
  if (titleN.includes(q)) score += 45;
  if (subtitleN.includes(q)) score += 24;
  if (t.includes(q)) score += 16;

  const terms = q.split(/\s+/).filter(Boolean);
  terms.forEach((term) => {
    if (titleN.startsWith(term)) score += 10;
    else if (titleN.includes(term)) score += 6;
    else if (t.includes(term)) score += 3;
  });

  return score;
}

export function searchAppContent(query) {
  const q = (query || '').trim();
  if (!q || q.length < MIN_QUERY_LENGTH) return [];

  const results = [];
  const pushResult = (result, text) => {
    results.push({
      ...result,
      score: computeScore(
        {
          title: result.title,
          subtitle: result.subtitle,
          text,
        },
        q
      ),
    });
  };

  FAQS.forEach((item) => {
    // Restrict to visible FAQ metadata/content.
    const text = searchText(item, ['question', 'category']);
    if (matchesQuery(text, q)) {
      pushResult({
        type: 'faq',
        id: item.id,
        title: item.question,
        subtitle: item.category,
        payload: item,
      }, text);
    }
  });

  NEWS.forEach((item) => {
    // Use in-app list fields, avoid indexing long article body.
    const text = searchText(item, ['title', 'summary', 'category']);
    if (matchesQuery(text, q)) {
      pushResult({
        type: 'news',
        id: item.id,
        title: item.title,
        subtitle: item.category + (item.summary ? ' · ' + item.summary.slice(0, 60) + '…' : ''),
        payload: item,
      }, text);
    }
  });

  FORMS.forEach((item) => {
    const text = searchText(item, ['title', 'description', 'category']);
    if (matchesQuery(text, q)) {
      pushResult({
        type: 'form',
        id: item.id,
        title: item.title,
        subtitle: item.category + (item.description ? ' · ' + item.description.slice(0, 50) + '…' : ''),
        payload: item,
      }, text);
    }
  });

  SERVICES.forEach((item) => {
    // Keep service search to fields shown in app cards/lists.
    const text = searchText(item, ['name', 'category', 'description']);
    if (matchesQuery(text, q)) {
      pushResult({
        type: 'service',
        id: item.id,
        title: item.name,
        subtitle: item.category,
        payload: item,
      }, text);
    }
  });

  ROAD_STATUS.forEach((item) => {
    const text = searchText(item, ['name', 'region', 'status', 'notes']);
    if (matchesQuery(text, q)) {
      pushResult({
        type: 'road',
        id: item.id,
        title: item.name,
        subtitle: item.region + (item.notes ? ' · ' + item.notes : ''),
        payload: item,
      }, text);
    }
  });

  OFFICES.forEach((item) => {
    const text = searchText(item, ['name', 'region', 'address']);
    if (matchesQuery(text, q)) {
      pushResult({
        type: 'office',
        id: item.id,
        title: item.name,
        subtitle: item.region + (item.address ? ' · ' + item.address.slice(0, 40) + '…' : ''),
        payload: item,
      }, text);
    }
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ score, ...rest }) => rest);
}

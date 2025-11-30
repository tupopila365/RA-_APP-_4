/**
 * Mapper Utilities
 * 
 * Common utility functions for data transformation.
 */

export function parseDate(dateValue, fallback = null) {
  if (!dateValue) {
    return fallback;
  }

  if (dateValue instanceof Date) {
    return dateValue;
  }

  try {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function formatDate(dateValue, fallback = null) {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return isNaN(date.getTime()) ? fallback : date.toISOString();
  } catch {
    return fallback;
  }
}

export function parseNumber(value, fallback = 0) {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

export function parseInt(value, fallback = 0) {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

export function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return fallback;
}

export function parseString(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value !== null && value !== undefined) {
    return String(value).trim();
  }

  return fallback;
}

export function parseArray(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
  }

  return fallback;
}

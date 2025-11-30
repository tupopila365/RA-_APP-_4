import React, { createContext, useState, useCallback } from 'react';

export const CacheContext = createContext();

const CACHE_DURATION = 5 * 60 * 1000;

export function CacheProvider({ children }) {
  const [cache, setCache] = useState({});

  const getFromCache = useCallback((key) => {
    const cached = cache[key];
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      setCache((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      return null;
    }

    return cached.data;
  }, [cache]);

  const setInCache = useCallback((key, data) => {
    setCache((prev) => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const clearCache = useCallback((key) => {
    if (key) {
      setCache((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } else {
      setCache({});
    }
  }, []);

  const value = {
    getFromCache,
    setInCache,
    clearCache,
  };

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

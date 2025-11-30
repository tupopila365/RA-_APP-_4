import { useState, useCallback, useContext, useEffect } from 'react';
import { ApiError } from '../services/api';
import { CacheContext } from '../context/CacheContext';

export function useApi(apiFunction, options = {}) {
  const { immediate = true, cacheKey = null } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheContext = useContext(CacheContext);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        if (cacheKey && cacheContext) {
          const cached = cacheContext.getFromCache(cacheKey);
          if (cached) {
            setData(cached);
            setLoading(false);
            return cached;
          }
        }

        const result = await apiFunction(...args);
        setData(result);

        if (cacheKey && cacheContext) {
          cacheContext.setInCache(cacheKey, result);
        }

        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError(err.message);
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, cacheKey, cacheContext]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const retry = useCallback(() => execute(), [execute]);

  const clearCache = useCallback(() => {
    if (cacheKey && cacheContext) {
      cacheContext.clearCache(cacheKey);
    }
    setData(null);
  }, [cacheKey, cacheContext]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    clearCache,
  };
}

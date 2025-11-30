import { useState, useEffect, useCallback } from 'react';
import { GetNewsUseCase } from '../../domain/useCases/GetNewsUseCase';
import { SearchNewsUseCase } from '../../domain/useCases/SearchNewsUseCase';

/**
 * News View Model Hook
 * 
 * Manages state and business logic for news screens.
 * Coordinates between UI and use cases following MVVM pattern.
 * 
 * @param {Object} dependencies - Injected dependencies
 * @param {GetNewsUseCase} dependencies.getNewsUseCase - Use case for fetching news
 * @param {SearchNewsUseCase} dependencies.searchNewsUseCase - Use case for searching news
 * 
 * @returns {Object} View model state and actions
 * 
 * @example
 * const {
 *   news,
 *   loading,
 *   error,
 *   searchQuery,
 *   selectedCategory,
 *   setSearchQuery,
 *   setSelectedCategory,
 *   refresh,
 *   retry,
 * } = useNewsViewModel({ getNewsUseCase, searchNewsUseCase });
 */
export function useNewsViewModel({ getNewsUseCase, searchNewsUseCase }) {
  // State
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  /**
   * Load news from use case
   */
  const loadNews = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await getNewsUseCase.execute({
        published: true,
        forceRefresh,
      });

      if (result.isSuccess()) {
        const newsData = result.value;
        setNews(newsData);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(newsData.map(item => item.category))];
        setCategories(uniqueCategories);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getNewsUseCase]);

  /**
   * Search news
   */
  const searchNews = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await searchNewsUseCase.execute(query, {
        published: true,
      });

      if (result.isSuccess()) {
        setFilteredNews(result.value);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [searchNewsUseCase]);

  /**
   * Filter news by category and search query
   */
  useEffect(() => {
    let filtered = [...news];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply search filter (client-side for now)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }

    setFilteredNews(filtered);
  }, [news, selectedCategory, searchQuery]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  /**
   * Refresh news (pull to refresh)
   */
  const refresh = useCallback(() => {
    loadNews(true);
  }, [loadNews]);

  /**
   * Retry after error
   */
  const retry = useCallback(() => {
    loadNews();
  }, [loadNews]);

  /**
   * Handle search query change
   */
  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
    
    // Optionally trigger server-side search for better results
    // if (query.trim().length >= 3) {
    //   searchNews(query);
    // }
  }, []);

  /**
   * Handle category change
   */
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    // Data
    news: filteredNews,
    allNews: news,
    categories,
    
    // State
    loading,
    refreshing,
    error,
    searchQuery,
    selectedCategory,
    
    // Actions
    setSearchQuery: handleSearchQueryChange,
    setSelectedCategory: handleCategoryChange,
    clearSearch,
    refresh,
    retry,
    
    // Computed
    hasNews: filteredNews.length > 0,
    isEmpty: !loading && filteredNews.length === 0,
    hasError: error !== null,
  };
}

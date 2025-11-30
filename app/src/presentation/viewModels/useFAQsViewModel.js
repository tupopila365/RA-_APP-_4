import { useState, useEffect, useCallback } from 'react';
import { GetFAQsUseCase } from '../../domain/useCases/GetFAQsUseCase';
import { SearchFAQsUseCase } from '../../domain/useCases/SearchFAQsUseCase';

/**
 * FAQs View Model Hook
 * 
 * Manages state and business logic for FAQs screens.
 */
export function useFAQsViewModel({ getFAQsUseCase, searchFAQsUseCase }) {
  // State
  const [faqs, setFaqs] = useState([]);
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  /**
   * Load FAQs from use case
   */
  const loadFAQs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getFAQsUseCase.execute();

      if (result.isSuccess()) {
        setFaqs(result.value);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getFAQsUseCase]);

  /**
   * Filter FAQs by search query
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFAQs(faqs);
      return;
    }

    // Client-side filtering using entity method
    const filtered = faqs.filter(faq => faq.matchesQuery(searchQuery));
    setFilteredFAQs(filtered);
  }, [faqs, searchQuery]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  /**
   * Toggle FAQ expansion
   */
  const toggleExpanded = useCallback((id) => {
    setExpandedId(prevId => prevId === id ? null : id);
  }, []);

  /**
   * Handle search query change
   */
  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
    // Reset expanded when searching
    setExpandedId(null);
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  /**
   * Retry after error
   */
  const retry = useCallback(() => {
    loadFAQs();
  }, [loadFAQs]);

  return {
    // Data
    faqs: filteredFAQs,
    allFAQs: faqs,
    expandedId,
    
    // State
    loading,
    error,
    searchQuery,
    
    // Actions
    setSearchQuery: handleSearchQueryChange,
    clearSearch,
    toggleExpanded,
    retry,
    
    // Computed
    hasFAQs: filteredFAQs.length > 0,
    isEmpty: !loading && filteredFAQs.length === 0,
    hasError: error !== null,
  };
}

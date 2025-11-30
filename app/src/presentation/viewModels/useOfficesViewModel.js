import { useState, useEffect, useCallback } from 'react';
import { GetOfficesUseCase } from '../../domain/useCases/GetOfficesUseCase';
import { SearchOfficesUseCase } from '../../domain/useCases/SearchOfficesUseCase';

/**
 * Offices View Model Hook
 * 
 * Manages state and business logic for office/location screens.
 */
export function useOfficesViewModel({ getOfficesUseCase, searchOfficesUseCase }) {
  // State
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [regions, setRegions] = useState(['All']);

  /**
   * Load offices from use case
   */
  const loadOffices = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await getOfficesUseCase.execute({
        forceRefresh,
      });

      if (result.isSuccess()) {
        const officesData = result.value;
        setOffices(officesData);
        
        // Extract unique regions
        const uniqueRegions = ['All', ...new Set(officesData.map(item => item.region))];
        setRegions(uniqueRegions);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getOfficesUseCase]);

  /**
   * Filter offices by region and search query
   */
  useEffect(() => {
    let filtered = [...offices];

    // Apply region filter
    if (selectedRegion !== 'All') {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }

    // Apply search filter (client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        item.region.toLowerCase().includes(query)
      );
    }

    setFilteredOffices(filtered);
  }, [offices, selectedRegion, searchQuery]);

  /**
   * Group offices by region
   */
  const groupedOffices = useCallback(() => {
    return filteredOffices.reduce((acc, office) => {
      const region = office.region || 'Other';
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(office);
      return acc;
    }, {});
  }, [filteredOffices]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  /**
   * Refresh offices (pull to refresh)
   */
  const refresh = useCallback(() => {
    loadOffices(true);
  }, [loadOffices]);

  /**
   * Retry after error
   */
  const retry = useCallback(() => {
    loadOffices();
  }, [loadOffices]);

  /**
   * Handle search query change
   */
  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /**
   * Handle region change
   */
  const handleRegionChange = useCallback((region) => {
    setSelectedRegion(region);
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    // Data
    offices: filteredOffices,
    allOffices: offices,
    groupedOffices: groupedOffices(),
    regions,
    
    // State
    loading,
    refreshing,
    error,
    searchQuery,
    selectedRegion,
    
    // Actions
    setSearchQuery: handleSearchQueryChange,
    setSelectedRegion: handleRegionChange,
    clearSearch,
    refresh,
    retry,
    
    // Computed
    hasOffices: filteredOffices.length > 0,
    isEmpty: !loading && filteredOffices.length === 0,
    hasError: error !== null,
  };
}

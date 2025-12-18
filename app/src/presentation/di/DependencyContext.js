import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

// Data Sources
import { NewsApiDataSource } from '../../data/dataSources/NewsApiDataSource';
import { OfficeApiDataSource } from '../../data/dataSources/OfficeApiDataSource';
import { FAQApiDataSource } from '../../data/dataSources/FAQApiDataSource';
import { CacheDataSource } from '../../data/dataSources/CacheDataSource';

// Mappers
import { NewsMapper } from '../../data/mappers/NewsMapper';
import { OfficeMapper } from '../../data/mappers/OfficeMapper';
import { FAQMapper } from '../../data/mappers/FAQMapper';

// Repositories
import { NewsRepository } from '../../data/repositories/NewsRepository';
import { OfficeRepository } from '../../data/repositories/OfficeRepository';
import { FAQRepository } from '../../data/repositories/FAQRepository';

// Use Cases
import { GetNewsUseCase } from '../../domain/useCases/GetNewsUseCase';
import { SearchNewsUseCase } from '../../domain/useCases/SearchNewsUseCase';
import { GetOfficesUseCase } from '../../domain/useCases/GetOfficesUseCase';
import { SearchOfficesUseCase } from '../../domain/useCases/SearchOfficesUseCase';
import { GetFAQsUseCase } from '../../domain/useCases/GetFAQsUseCase';
import { SearchFAQsUseCase } from '../../domain/useCases/SearchFAQsUseCase';

/**
 * Dependency Injection Context
 * 
 * Provides all repositories and use cases to the application.
 * Follows dependency injection pattern for better testability.
 */
const DependencyContext = createContext(null);

/**
 * Dependency Provider Component
 * 
 * Initializes and provides all dependencies to child components.
 * 
 * @example
 * <DependencyProvider>
 *   <App />
 * </DependencyProvider>
 */
export function DependencyProvider({ children }) {
  const dependencies = useMemo(() => {
    // Initialize data sources
    const newsApiDataSource = new NewsApiDataSource();
    const officeApiDataSource = new OfficeApiDataSource();
    const faqApiDataSource = new FAQApiDataSource();
    const cacheDataSource = new CacheDataSource();
    
    // Initialize mappers
    const newsMapper = new NewsMapper();
    const officeMapper = new OfficeMapper();
    const faqMapper = new FAQMapper();
    
    // Initialize repositories
    const newsRepository = new NewsRepository(
      newsApiDataSource,
      cacheDataSource,
      newsMapper
    );
    
    const officeRepository = new OfficeRepository(
      officeApiDataSource,
      cacheDataSource,
      officeMapper
    );
    
    const faqRepository = new FAQRepository(
      faqApiDataSource,
      faqMapper
    );
    
    // Initialize use cases
    const getNewsUseCase = new GetNewsUseCase(newsRepository);
    const searchNewsUseCase = new SearchNewsUseCase(newsRepository);
    const getOfficesUseCase = new GetOfficesUseCase(officeRepository);
    const searchOfficesUseCase = new SearchOfficesUseCase(officeRepository);
    const getFAQsUseCase = new GetFAQsUseCase(faqRepository);
    const searchFAQsUseCase = new SearchFAQsUseCase(faqRepository);
    
    return {
      // Data Sources
      newsApiDataSource,
      officeApiDataSource,
      faqApiDataSource,
      cacheDataSource,
      
      // Repositories
      newsRepository,
      officeRepository,
      faqRepository,
      
      // Use Cases
      getNewsUseCase,
      searchNewsUseCase,
      getOfficesUseCase,
      searchOfficesUseCase,
      getFAQsUseCase,
      searchFAQsUseCase,
    };
  }, []);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}

DependencyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access dependencies
 * 
 * @returns {Object} All dependencies
 * @throws {Error} If used outside DependencyProvider
 */
export function useDependencies() {
  const context = useContext(DependencyContext);
  
  if (!context) {
    throw new Error('useDependencies must be used within DependencyProvider');
  }
  
  return context;
}

/**
 * Hook to access news use cases
 * 
 * @returns {Object} News use cases
 */
export function useNewsUseCases() {
  const { getNewsUseCase, searchNewsUseCase } = useDependencies();
  
  return {
    getNewsUseCase,
    searchNewsUseCase,
  };
}

/**
 * Hook to access news repository
 * 
 * @returns {NewsRepository} News repository
 */
export function useNewsRepository() {
  const { newsRepository } = useDependencies();
  return newsRepository;
}

/**
 * Hook to access office use cases
 * 
 * @returns {Object} Office use cases
 */
export function useOfficeUseCases() {
  const { getOfficesUseCase, searchOfficesUseCase } = useDependencies();
  
  return {
    getOfficesUseCase,
    searchOfficesUseCase,
  };
}

/**
 * Hook to access office repository
 * 
 * @returns {OfficeRepository} Office repository
 */
export function useOfficeRepository() {
  const { officeRepository } = useDependencies();
  return officeRepository;
}

/**
 * Hook to access FAQ use cases
 * 
 * @returns {Object} FAQ use cases
 */
export function useFAQUseCases() {
  const { getFAQsUseCase, searchFAQsUseCase } = useDependencies();
  
  return {
    getFAQsUseCase,
    searchFAQsUseCase,
  };
}

/**
 * Hook to access FAQ repository
 * 
 * @returns {FAQRepository} FAQ repository
 */
export function useFAQRepository() {
  const { faqRepository } = useDependencies();
  return faqRepository;
}

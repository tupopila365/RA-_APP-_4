# Design Document: Clean Architecture Refactor

## Overview

This design transforms the Roads Authority mobile app from a service-based architecture to a clean architecture with clear separation of concerns. The refactoring establishes three distinct layers (Presentation, Domain, Data) with unidirectional dependencies, implements the repository pattern for data access, introduces use cases for business logic, and creates view models for UI state management.

The architecture follows the Dependency Rule: dependencies point inward, with outer layers depending on inner layers, never the reverse. This ensures the core business logic remains independent of frameworks, UI, and external services.

## Architecture

### Layer Structure

```
src/
├── domain/              # Business logic layer (innermost)
│   ├── entities/        # Core business objects
│   ├── repositories/    # Repository interfaces
│   ├── useCases/        # Business logic operations
│   └── errors/          # Domain-specific errors
│
├── data/                # Data access layer (middle)
│   ├── repositories/    # Repository implementations
│   ├── dataSources/     # API clients, local storage
│   ├── models/          # DTOs and API response models
│   └── mappers/         # Transform DTOs to entities
│
└── presentation/        # UI layer (outermost)
    ├── screens/         # Screen components
    ├── components/      # Reusable UI components
    ├── viewModels/      # Screen state management hooks
    ├── navigation/      # Navigation configuration
    ├── theme/           # Styling and theming
    └── di/              # Dependency injection setup
```

### Dependency Flow

```
Presentation Layer (UI)
       ↓ depends on
Domain Layer (Business Logic)
       ↓ depends on
Data Layer (Data Access)
```

### Key Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Testability**: Each layer can be tested in isolation
4. **Flexibility**: Easy to swap implementations (e.g., mock API, different cache strategy)
5. **Maintainability**: Clear structure makes code easy to understand and modify

## Components and Interfaces

### 1. Domain Layer

#### Entities

Core business objects that represent the application's data model.

**NewsEntity**:
```typescript
interface NewsEntity {
  id: string;
  title: string;
  date: Date;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: number;
  tags: string[];
}
```

**FAQEntity**:
```typescript
interface FAQEntity {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
```

**OfficeEntity**:
```typescript
interface OfficeEntity {
  id: string;
  name: string;
  type: 'RA Offices' | 'NATIS Offices';
  address: string;
  phone: string;
  hours: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
```

#### Repository Interfaces

Abstract interfaces that define data operations without implementation details.

**INewsRepository**:
```typescript
interface INewsRepository {
  getAll(): Promise<NewsEntity[]>;
  getById(id: string): Promise<NewsEntity>;
  search(query: string): Promise<NewsEntity[]>;
  getByCategory(category: string): Promise<NewsEntity[]>;
}
```

**IFAQRepository**:
```typescript
interface IFAQRepository {
  getAll(): Promise<FAQEntity[]>;
  search(query: string): Promise<FAQEntity[]>;
}
```

**IOfficeRepository**:
```typescript
interface IOfficeRepository {
  getAll(): Promise<OfficeEntity[]>;
  getByType(type: string): Promise<OfficeEntity[]>;
  search(query: string): Promise<OfficeEntity[]>;
}
```

#### Use Cases

Single-purpose business operations that orchestrate data flow.

**GetNewsUseCase**:
```typescript
class GetNewsUseCase {
  constructor(private newsRepository: INewsRepository) {}
  
  async execute(): Promise<Result<NewsEntity[], Error>> {
    try {
      const news = await this.newsRepository.getAll();
      return Result.success(news);
    } catch (error) {
      return Result.failure(new DomainError('Failed to fetch news'));
    }
  }
}
```

**SearchNewsUseCase**:
```typescript
class SearchNewsUseCase {
  constructor(private newsRepository: INewsRepository) {}
  
  async execute(query: string): Promise<Result<NewsEntity[], Error>> {
    if (!query || query.trim().length === 0) {
      return Result.failure(new ValidationError('Search query cannot be empty'));
    }
    
    try {
      const results = await this.newsRepository.search(query);
      return Result.success(results);
    } catch (error) {
      return Result.failure(new DomainError('Search failed'));
    }
  }
}
```

**GetOfficesUseCase**:
```typescript
class GetOfficesUseCase {
  constructor(private officeRepository: IOfficeRepository) {}
  
  async execute(filters?: { type?: string; searchQuery?: string }): Promise<Result<OfficeEntity[], Error>> {
    try {
      let offices: OfficeEntity[];
      
      if (filters?.type && filters.type !== 'All') {
        offices = await this.officeRepository.getByType(filters.type);
      } else {
        offices = await this.officeRepository.getAll();
      }
      
      if (filters?.searchQuery) {
        offices = offices.filter(office =>
          office.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          office.address.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
      }
      
      return Result.success(offices);
    } catch (error) {
      return Result.failure(new DomainError('Failed to fetch offices'));
    }
  }
}
```

### 2. Data Layer

#### Data Sources

Handle raw API communication and local storage.

**NewsApiDataSource**:
```typescript
class NewsApiDataSource {
  constructor(private apiClient: ApiClient) {}
  
  async fetchNews(): Promise<NewsDTO[]> {
    const response = await this.apiClient.get(API_ENDPOINTS.NEWS);
    return response.data;
  }
  
  async fetchNewsById(id: string): Promise<NewsDTO> {
    const response = await this.apiClient.get(API_ENDPOINTS.NEWS_DETAIL(id));
    return response.data;
  }
}
```

**CacheDataSource**:
```typescript
class CacheDataSource {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

#### Repository Implementations

Concrete implementations of repository interfaces.

**NewsRepository**:
```typescript
class NewsRepository implements INewsRepository {
  constructor(
    private apiDataSource: NewsApiDataSource,
    private cacheDataSource: CacheDataSource,
    private newsMapper: NewsMapper
  ) {}
  
  async getAll(): Promise<NewsEntity[]> {
    const cacheKey = 'news_all';
    const cached = this.cacheDataSource.get<NewsEntity[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const dtos = await this.apiDataSource.fetchNews();
    const entities = dtos.map(dto => this.newsMapper.toEntity(dto));
    
    this.cacheDataSource.set(cacheKey, entities, 300000); // 5 min TTL
    return entities;
  }
  
  async getById(id: string): Promise<NewsEntity> {
    const cacheKey = `news_${id}`;
    const cached = this.cacheDataSource.get<NewsEntity>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const dto = await this.apiDataSource.fetchNewsById(id);
    const entity = this.newsMapper.toEntity(dto);
    
    this.cacheDataSource.set(cacheKey, entity);
    return entity;
  }
  
  async search(query: string): Promise<NewsEntity[]> {
    const allNews = await this.getAll();
    return allNews.filter(news =>
      news.title.toLowerCase().includes(query.toLowerCase()) ||
      news.category.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  async getByCategory(category: string): Promise<NewsEntity[]> {
    const allNews = await this.getAll();
    return allNews.filter(news => news.category === category);
  }
}
```

#### Mappers

Transform DTOs to domain entities.

**NewsMapper**:
```typescript
class NewsMapper {
  toEntity(dto: NewsDTO): NewsEntity {
    return {
      id: dto.id.toString(),
      title: dto.title,
      date: new Date(dto.date),
      category: dto.category,
      excerpt: dto.excerpt || '',
      content: dto.content,
      author: dto.author || 'Unknown',
      readTime: dto.read_time || 5,
      tags: dto.tags || [],
    };
  }
  
  toDTO(entity: NewsEntity): NewsDTO {
    return {
      id: parseInt(entity.id),
      title: entity.title,
      date: entity.date.toISOString(),
      category: entity.category,
      excerpt: entity.excerpt,
      content: entity.content,
      author: entity.author,
      read_time: entity.readTime,
      tags: entity.tags,
    };
  }
}
```

### 3. Presentation Layer

#### View Models

Custom hooks that manage screen state and coordinate with use cases.

**useNewsViewModel**:
```typescript
function useNewsViewModel() {
  const getNewsUseCase = useGetNewsUseCase();
  const searchNewsUseCase = useSearchNewsUseCase();
  
  const [news, setNews] = useState<NewsEntity[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getNewsUseCase.execute();
    
    if (result.isSuccess()) {
      setNews(result.value);
      setFilteredNews(result.value);
    } else {
      setError(result.error.message);
    }
    
    setLoading(false);
  }, [getNewsUseCase]);
  
  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredNews(news);
      return;
    }
    
    const result = await searchNewsUseCase.execute(query);
    
    if (result.isSuccess()) {
      setFilteredNews(result.value);
    } else {
      setError(result.error.message);
    }
  }, [news, searchNewsUseCase]);
  
  const refresh = useCallback(() => {
    return loadNews();
  }, [loadNews]);
  
  useEffect(() => {
    loadNews();
  }, [loadNews]);
  
  return {
    news: filteredNews,
    loading,
    error,
    searchQuery,
    search,
    refresh,
  };
}
```

**useOfficesViewModel**:
```typescript
function useOfficesViewModel() {
  const getOfficesUseCase = useGetOfficesUseCase();
  
  const [offices, setOffices] = useState<OfficeEntity[]>([]);
  const [filteredOffices, setFilteredOffices] = useState<OfficeEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadOffices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getOfficesUseCase.execute({
      type: selectedType,
      searchQuery,
    });
    
    if (result.isSuccess()) {
      setOffices(result.value);
      setFilteredOffices(result.value);
    } else {
      setError(result.error.message);
    }
    
    setLoading(false);
  }, [getOfficesUseCase, selectedType, searchQuery]);
  
  const filterByType = useCallback((type: string) => {
    setSelectedType(type);
  }, []);
  
  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  useEffect(() => {
    loadOffices();
  }, [loadOffices]);
  
  return {
    offices: filteredOffices,
    loading,
    error,
    selectedType,
    searchQuery,
    filterByType,
    search,
  };
}
```

#### Dependency Injection

Provide dependencies through React Context.

**DependencyContext**:
```typescript
interface Dependencies {
  newsRepository: INewsRepository;
  faqRepository: IFAQRepository;
  officeRepository: IOfficeRepository;
  getNewsUseCase: GetNewsUseCase;
  searchNewsUseCase: SearchNewsUseCase;
  getFAQsUseCase: GetFAQsUseCase;
  getOfficesUseCase: GetOfficesUseCase;
}

const DependencyContext = createContext<Dependencies | null>(null);

function DependencyProvider({ children }: { children: ReactNode }) {
  const dependencies = useMemo(() => {
    // Initialize data sources
    const apiClient = new ApiClient();
    const cacheDataSource = new CacheDataSource();
    
    // Initialize data sources
    const newsApiDataSource = new NewsApiDataSource(apiClient);
    const faqApiDataSource = new FAQApiDataSource(apiClient);
    const officeApiDataSource = new OfficeApiDataSource(apiClient);
    
    // Initialize mappers
    const newsMapper = new NewsMapper();
    const faqMapper = new FAQMapper();
    const officeMapper = new OfficeMapper();
    
    // Initialize repositories
    const newsRepository = new NewsRepository(newsApiDataSource, cacheDataSource, newsMapper);
    const faqRepository = new FAQRepository(faqApiDataSource, cacheDataSource, faqMapper);
    const officeRepository = new OfficeRepository(officeApiDataSource, cacheDataSource, officeMapper);
    
    // Initialize use cases
    const getNewsUseCase = new GetNewsUseCase(newsRepository);
    const searchNewsUseCase = new SearchNewsUseCase(newsRepository);
    const getFAQsUseCase = new GetFAQsUseCase(faqRepository);
    const getOfficesUseCase = new GetOfficesUseCase(officeRepository);
    
    return {
      newsRepository,
      faqRepository,
      officeRepository,
      getNewsUseCase,
      searchNewsUseCase,
      getFAQsUseCase,
      getOfficesUseCase,
    };
  }, []);
  
  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}
```

## Data Models

### DTOs (Data Transfer Objects)

**NewsDTO**:
```typescript
interface NewsDTO {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  content: string;
  author?: string;
  read_time?: number;
  tags?: string[];
}
```

### Domain Entities

See "Components and Interfaces" section above for entity definitions.

### Result Type

A functional approach to error handling:

```typescript
class Result<T, E> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _isSuccess: boolean
  ) {}
  
  static success<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined, true);
  }
  
  static failure<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error, false);
  }
  
  isSuccess(): boolean {
    return this._isSuccess;
  }
  
  isFailure(): boolean {
    return !this._isSuccess;
  }
  
  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }
  
  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }
}
```

## Error Handling

### Error Hierarchy

```typescript
class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

### Error Handling Strategy

1. **Data Layer**: Catch API errors, transform to domain errors
2. **Domain Layer**: Validate inputs, return Result types
3. **Presentation Layer**: Display user-friendly error messages

## Testing Strategy

### Unit Testing

**Domain Layer**:
- Test use cases with mocked repositories
- Test business logic in isolation
- Verify error handling

**Data Layer**:
- Test repositories with mocked data sources
- Test mappers for correct transformations
- Test caching logic

**Presentation Layer**:
- Test view models with mocked use cases
- Test component rendering
- Test user interactions

### Integration Testing

- Test data flow from API to UI
- Test navigation between screens
- Test error scenarios end-to-end

### Example Test

```typescript
describe('GetNewsUseCase', () => {
  it('should return news entities when repository succeeds', async () => {
    const mockRepository: INewsRepository = {
      getAll: jest.fn().mockResolvedValue([
        { id: '1', title: 'Test News', /* ... */ }
      ]),
      // ... other methods
    };
    
    const useCase = new GetNewsUseCase(mockRepository);
    const result = await useCase.execute();
    
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toHaveLength(1);
    expect(result.value[0].title).toBe('Test News');
  });
  
  it('should return error when repository fails', async () => {
    const mockRepository: INewsRepository = {
      getAll: jest.fn().mockRejectedValue(new Error('API Error')),
      // ... other methods
    };
    
    const useCase = new GetNewsUseCase(mockRepository);
    const result = await useCase.execute();
    
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeInstanceOf(DomainError);
  });
});
```

## Migration Strategy

### Phase 1: Setup Infrastructure
- Create folder structure
- Implement Result type
- Create error classes
- Setup dependency injection

### Phase 2: Migrate News Feature
- Create NewsEntity
- Implement NewsRepository
- Create news use cases
- Refactor NewsScreen to use view model

### Phase 3: Migrate Offices Feature
- Create OfficeEntity
- Implement OfficeRepository
- Create office use cases
- Refactor FindOfficesScreen

### Phase 4: Migrate FAQs Feature
- Create FAQEntity
- Implement FAQRepository
- Create FAQ use cases
- Refactor FAQsScreen

### Phase 5: Cleanup
- Remove old service layer
- Update documentation
- Add tests
- Code review

## Performance Considerations

1. **Caching**: Repository-level caching reduces API calls
2. **Memoization**: Use React.useMemo for expensive computations
3. **Lazy Loading**: Load use cases only when needed
4. **Code Splitting**: Split by feature for smaller bundles

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear structure makes code easy to understand
3. **Flexibility**: Easy to swap implementations (mock API, different cache)
4. **Scalability**: New features follow established patterns
5. **Team Collaboration**: Clear boundaries reduce merge conflicts
6. **Type Safety**: Strong typing catches errors at compile time
7. **Reusability**: Use cases can be shared across different UIs

## Trade-offs

1. **Initial Complexity**: More files and abstractions upfront
2. **Learning Curve**: Team needs to understand clean architecture
3. **Boilerplate**: More code for simple operations
4. **Migration Effort**: Refactoring existing code takes time

However, these trade-offs are worthwhile for a maintainable, scalable application.

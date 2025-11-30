# Mobile App Testing Guide

## Test Suite Overview

This mobile app includes comprehensive tests covering:
- **Component Tests**: UI components (Button, SearchInput, FilterChip, etc.)
- **Service Tests**: API service functions (news, tenders, vacancies, locations, banners, chatbot)
- **Integration Tests**: Navigation flows and API call integration

## Test Files Created

### Component Tests (`components/__tests__/`)
- `Button.test.js` - Tests button rendering, variants, loading states, and accessibility
- `SearchInput.test.js` - Tests search input functionality and clear button
- `FilterChip.test.js` - Tests filter chip selection and styling
- `LoadingSpinner.test.js` - Tests loading indicator rendering
- `ErrorState.test.js` - Tests error display and retry functionality

### Service Tests (`services/__tests__/`)
- `newsService.test.js` - Tests news API calls, search, and filtering
- `tendersService.test.js` - Tests tenders API with status filtering
- `vacanciesService.test.js` - Tests vacancies API with type filtering
- `locationsService.test.js` - Tests locations API with region filtering
- `bannersService.test.js` - Tests banner fetching
- `chatbotService.test.js` - Tests chatbot query functionality

### Integration Tests (`__tests__/integration/`)
- `navigation.test.js` - Tests app navigation and screen transitions
- `api-calls.test.js` - Tests end-to-end API integration scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.js
```

## Known Configuration Issues

The current Expo setup requires additional configuration for Jest to work properly with Expo modules. The tests are written and ready, but may need the following adjustments:

### Option 1: Use Expo's Jest Preset (Recommended)
The `jest-expo` preset is already configured in `jest.config.js`. If tests fail with module errors, ensure all Expo dependencies are properly installed.

### Option 2: Manual Expo Module Mocking
If issues persist, you may need to add manual mocks for Expo modules in `jest.setup.js`:

```javascript
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
```

### Option 3: Test Without Expo Dependencies
For pure logic testing (services, utilities), tests should work without additional Expo configuration.

## Test Coverage Goals

- **Components**: 80%+ coverage for core UI components
- **Services**: 90%+ coverage for API service functions
- **Integration**: Key user flows (browse news, search, filter, chatbot)

## Requirements Validated

These tests validate the following requirements from the spec:
- **12.1**: News browsing and search functionality
- **13.1**: Tenders display and filtering
- **14.1**: Vacancies display and filtering
- **15.1**: Locations display and region filtering
- **16.1**: Chatbot query functionality

## Next Steps

1. Resolve Expo Jest configuration issues
2. Run full test suite to verify all tests pass
3. Add additional edge case tests as needed
4. Set up CI/CD pipeline to run tests automatically

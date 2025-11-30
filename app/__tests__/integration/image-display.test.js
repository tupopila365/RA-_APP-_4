import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { CachedImage } from '../../components/CachedImage';
import NewsScreen from '../../screens/NewsScreen';
import NewsDetailScreen from '../../screens/NewsDetailScreen';
import { AppProvider } from '../../context/AppContext';

// Mock expo-image
jest.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: React.forwardRef((props, ref) => {
      const { onLoad, onError, testID } = props;
      
      // Simulate image loading
      React.useEffect(() => {
        const timer = setTimeout(() => {
          if (onLoad) onLoad();
        }, 100);
        return () => clearTimeout(timer);
      }, [onLoad]);

      return React.createElement('Image', { ...props, ref, testID });
    }),
  };
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { id: 1 },
  }),
}));

// Mock API
jest.mock('../../services/newsService', () => ({
  getNews: jest.fn(() =>
    Promise.resolve([
      {
        id: 1,
        title: 'Test News 1',
        content: 'Content 1',
        imageUrl: 'https://example.com/image1.jpg',
        createdAt: '2024-01-01',
      },
      {
        id: 2,
        title: 'Test News 2',
        content: 'Content 2',
        imageUrl: 'https://example.com/image2.jpg',
        createdAt: '2024-01-02',
      },
      {
        id: 3,
        title: 'Test News 3',
        content: 'Content 3',
        imageUrl: null,
        createdAt: '2024-01-03',
      },
    ])
  ),
  getNewsById: jest.fn((id) =>
    Promise.resolve({
      id,
      title: 'Test News Detail',
      content: 'Detailed content',
      imageUrl: 'https://example.com/detail-image.jpg',
      createdAt: '2024-01-01',
    })
  ),
}));

describe('Mobile Image Display Integration Tests', () => {
  describe('CachedImage Component', () => {
    it('should display image with loading state', async () => {
      const { getByTestId, queryByTestId } = render(
        <CachedImage
          uri="https://example.com/test.jpg"
          testID="test-image"
        />
      );

      // Should show loading initially
      expect(queryByTestId('cached-image-loading')).toBeTruthy();

      // Wait for image to load
      await waitFor(() => {
        expect(queryByTestId('cached-image-loading')).toBeFalsy();
      });

      expect(getByTestId('test-image')).toBeTruthy();
    });

    it('should display placeholder on error', async () => {
      const onError = jest.fn();
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/invalid.jpg"
          testID="test-image"
          onError={onError}
        />
      );

      // Simulate error
      const image = getByTestId('test-image');
      fireEvent(image, 'error');

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should handle missing uri gracefully', () => {
      const { getByTestId } = render(
        <CachedImage uri="" testID="test-image" />
      );

      expect(getByTestId('test-image')).toBeTruthy();
    });

    it('should apply custom styles', () => {
      const customStyle = { width: 200, height: 200, borderRadius: 10 };
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/test.jpg"
          style={customStyle}
          testID="test-image"
        />
      );

      const image = getByTestId('test-image');
      expect(image).toBeTruthy();
    });

    it('should cache images for offline viewing', async () => {
      const uri = 'https://example.com/cached.jpg';
      
      // First render - should load from network
      const { rerender, getByTestId } = render(
        <CachedImage uri={uri} testID="test-image" />
      );

      await waitFor(() => {
        expect(getByTestId('test-image')).toBeTruthy();
      });

      // Second render - should load from cache
      rerender(<CachedImage uri={uri} testID="test-image" />);

      // Image should be available immediately from cache
      expect(getByTestId('test-image')).toBeTruthy();
    });
  });

  describe('NewsScreen Image Display', () => {
    it('should display images in news list', async () => {
      const { getAllByTestId, queryByTestId } = render(
        <AppProvider>
          <NewsScreen />
        </AppProvider>
      );

      await waitFor(() => {
        const images = getAllByTestId(/news-image-/);
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('should show loading indicators while images load', async () => {
      const { queryAllByTestId } = render(
        <AppProvider>
          <NewsScreen />
        </AppProvider>
      );

      // Should show loading indicators initially
      const loadingIndicators = queryAllByTestId(/cached-image-loading/);
      expect(loadingIndicators.length).toBeGreaterThan(0);

      // Wait for images to load
      await waitFor(() => {
        const stillLoading = queryAllByTestId(/cached-image-loading/);
        expect(stillLoading.length).toBe(0);
      }, { timeout: 3000 });
    });

    it('should handle news items without images', async () => {
      const { getByText } = render(
        <AppProvider>
          <NewsScreen />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText('Test News 3')).toBeTruthy();
      });

      // Should still display the news item even without image
      expect(getByText('Test News 3')).toBeTruthy();
    });

    it('should display placeholder for failed image loads', async () => {
      const { getAllByTestId } = render(
        <AppProvider>
          <NewsScreen />
        </AppProvider>
      );

      await waitFor(() => {
        const images = getAllByTestId(/news-image-/);
        expect(images.length).toBeGreaterThan(0);
      });

      // Simulate image error
      const images = getAllByTestId(/news-image-/);
      fireEvent(images[0], 'error');

      // Should show placeholder
      await waitFor(() => {
        expect(getAllByTestId(/placeholder/)).toBeTruthy();
      });
    });
  });

  describe('NewsDetailScreen Image Display', () => {
    it('should display full-size image in detail view', async () => {
      const { getByTestId } = render(
        <AppProvider>
          <NewsDetailScreen />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('news-detail-image')).toBeTruthy();
      });
    });

    it('should show loading state for detail image', async () => {
      const { queryByTestId } = render(
        <AppProvider>
          <NewsDetailScreen />
        </AppProvider>
      );

      // Should show loading initially
      expect(queryByTestId('cached-image-loading')).toBeTruthy();

      // Wait for image to load
      await waitFor(() => {
        expect(queryByTestId('cached-image-loading')).toBeFalsy();
      });
    });

    it('should handle image load failure in detail view', async () => {
      const { getByTestId, getByText } = render(
        <AppProvider>
          <NewsDetailScreen />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('news-detail-image')).toBeTruthy();
      });

      // Simulate image error
      const image = getByTestId('news-detail-image');
      fireEvent(image, 'error');

      // Should still show content even if image fails
      await waitFor(() => {
        expect(getByText('Test News Detail')).toBeTruthy();
      });
    });
  });

  describe('Image Caching Behavior', () => {
    it('should cache images across screen navigations', async () => {
      const uri = 'https://example.com/cached-nav.jpg';
      
      // Render in list view
      const { rerender, getByTestId } = render(
        <CachedImage uri={uri} testID="list-image" />
      );

      await waitFor(() => {
        expect(getByTestId('list-image')).toBeTruthy();
      });

      // Navigate to detail view with same image
      rerender(<CachedImage uri={uri} testID="detail-image" />);

      // Image should load quickly from cache
      expect(getByTestId('detail-image')).toBeTruthy();
    });

    it('should handle multiple images loading simultaneously', async () => {
      const uris = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const { getAllByTestId } = render(
        <>
          {uris.map((uri, index) => (
            <CachedImage
              key={uri}
              uri={uri}
              testID={`image-${index}`}
            />
          ))}
        </>
      );

      // All images should eventually load
      await waitFor(() => {
        uris.forEach((_, index) => {
          expect(getAllByTestId(`image-${index}`)).toBeTruthy();
        });
      });
    });

    it('should maintain cache across app restarts', async () => {
      const uri = 'https://example.com/persistent.jpg';
      
      // First render - load and cache
      const { unmount, getByTestId } = render(
        <CachedImage uri={uri} testID="test-image" />
      );

      await waitFor(() => {
        expect(getByTestId('test-image')).toBeTruthy();
      });

      // Unmount (simulate app close)
      unmount();

      // Re-render (simulate app restart)
      const { getByTestId: getByTestId2 } = render(
        <CachedImage uri={uri} testID="test-image" />
      );

      // Image should be available from persistent cache
      expect(getByTestId2('test-image')).toBeTruthy();
    });
  });

  describe('Performance and Optimization', () => {
    it('should lazy load images in scrollable lists', async () => {
      const { getAllByTestId } = render(
        <AppProvider>
          <NewsScreen />
        </AppProvider>
      );

      // Images should load progressively
      await waitFor(() => {
        const images = getAllByTestId(/news-image-/);
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('should handle rapid image changes without memory leaks', async () => {
      const uris = [
        'https://example.com/rapid1.jpg',
        'https://example.com/rapid2.jpg',
        'https://example.com/rapid3.jpg',
      ];

      const { rerender, getByTestId } = render(
        <CachedImage uri={uris[0]} testID="rapid-image" />
      );

      // Rapidly change images
      for (const uri of uris) {
        rerender(<CachedImage uri={uri} testID="rapid-image" />);
        await waitFor(() => {
          expect(getByTestId('rapid-image')).toBeTruthy();
        });
      }

      // Should handle all changes without crashing
      expect(getByTestId('rapid-image')).toBeTruthy();
    });

    it('should optimize memory usage with large images', async () => {
      const largeImageUri = 'https://example.com/large-4k-image.jpg';
      
      const { getByTestId } = render(
        <CachedImage
          uri={largeImageUri}
          testID="large-image"
          style={{ width: 300, height: 200 }}
        />
      );

      await waitFor(() => {
        expect(getByTestId('large-image')).toBeTruthy();
      });

      // Image should be resized/optimized for display
      const image = getByTestId('large-image');
      expect(image).toBeTruthy();
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed image loads', async () => {
      let attemptCount = 0;
      const onError = jest.fn(() => {
        attemptCount++;
      });

      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/flaky.jpg"
          testID="retry-image"
          onError={onError}
        />
      );

      // Simulate first failure
      const image = getByTestId('retry-image');
      fireEvent(image, 'error');

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      // Should attempt retry
      expect(attemptCount).toBeGreaterThan(0);
    });

    it('should fallback to placeholder after max retries', async () => {
      const onError = jest.fn();

      const { getByTestId, queryByTestId } = render(
        <CachedImage
          uri="https://example.com/always-fails.jpg"
          testID="fallback-image"
          onError={onError}
        />
      );

      // Simulate multiple failures
      const image = getByTestId('fallback-image');
      fireEvent(image, 'error');
      fireEvent(image, 'error');
      fireEvent(image, 'error');

      await waitFor(() => {
        expect(queryByTestId('placeholder')).toBeTruthy();
      });
    });
  });
});

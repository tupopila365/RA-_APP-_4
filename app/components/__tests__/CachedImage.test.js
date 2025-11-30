import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { CachedImage } from '../CachedImage';
import { errorLogger } from '../../services/errorLogger';

// Mock errorLogger
jest.mock('../../services/errorLogger', () => ({
  errorLogger: {
    logImageLoadFailure: jest.fn(),
  },
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

describe('CachedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading indicator initially', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
        />
      );

      expect(getByTestId('test-image-loading')).toBeTruthy();
    });

    it('should hide loading indicator after image loads', async () => {
      const onLoad = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
          onLoad={onLoad}
        />
      );

      // Simulate image load
      const image = getByTestId('test-image');
      image.props.onLoad();

      await waitFor(() => {
        expect(queryByTestId('test-image-loading')).toBeNull();
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show placeholder on error', async () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/broken-image.jpg"
          testID="test-image"
        />
      );

      // Simulate error
      const image = getByTestId('test-image');
      image.props.onError({ error: 'Failed to load' });

      await waitFor(() => {
        expect(getByTestId('test-image-error')).toBeTruthy();
      });
    });

    it('should log error when image fails to load', async () => {
      const uri = 'https://example.com/broken-image.jpg';
      const { getByTestId } = render(
        <CachedImage
          uri={uri}
          testID="test-image"
          accessibilityLabel="Test Image"
        />
      );

      // Simulate error
      const image = getByTestId('test-image');
      image.props.onError({ error: 'Network error' });

      await waitFor(() => {
        expect(errorLogger.logImageLoadFailure).toHaveBeenCalledWith(
          uri,
          'Network error',
          expect.objectContaining({
            component: 'CachedImage',
            accessibilityLabel: 'Test Image',
            testID: 'test-image',
          })
        );
      });
    });

    it('should call onError callback when provided', async () => {
      const onError = jest.fn();
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/broken-image.jpg"
          testID="test-image"
          onError={onError}
        />
      );

      // Simulate error
      const image = getByTestId('test-image');
      const errorEvent = { error: 'Failed to load' };
      image.props.onError(errorEvent);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorEvent);
      });
    });

    it('should show custom placeholder when provided', async () => {
      const placeholder = { uri: 'placeholder.png' };
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/broken-image.jpg"
          testID="test-image"
          placeholder={placeholder}
        />
      );

      // Simulate error
      const image = getByTestId('test-image');
      image.props.onError({ error: 'Failed to load' });

      await waitFor(() => {
        const errorContainer = getByTestId('test-image-error');
        expect(errorContainer).toBeTruthy();
      });
    });
  });

  describe('Caching', () => {
    it('should use memory-disk cache policy', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.cachePolicy).toBe('memory-disk');
    });

    it('should have transition animation', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
          transition={300}
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.transition).toBe(300);
    });

    it('should use default transition of 200ms', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.transition).toBe(200);
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
          accessibilityLabel="Profile Picture"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.accessibilityLabel).toBe('Profile Picture');
    });

    it('should use default accessibility label', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.accessibilityLabel).toBe('Image');
    });

    it('should be accessible', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.accessible).toBe(true);
    });
  });

  describe('Resize Modes', () => {
    it('should use cover resize mode by default', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.contentFit).toBe('cover');
    });

    it('should accept custom resize mode', () => {
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
          resizeMode="contain"
        />
      );

      const image = getByTestId('test-image');
      expect(image.props.contentFit).toBe('contain');
    });
  });

  describe('Style Props', () => {
    it('should apply custom styles', () => {
      const customStyle = { width: 200, height: 200, borderRadius: 10 };
      const { getByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
          style={customStyle}
        />
      );

      const container = getByTestId('test-image');
      expect(container.props.style).toContainEqual(customStyle);
    });
  });

  describe('Image Source', () => {
    it('should load image from URI', () => {
      const uri = 'https://example.com/image.jpg';
      const { getByTestId } = render(
        <CachedImage uri={uri} testID="test-image" />
      );

      const image = getByTestId('test-image');
      expect(image.props.source).toEqual({ uri });
    });
  });

  describe('Loading Lifecycle', () => {
    it('should handle complete loading lifecycle', async () => {
      const onLoad = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          testID="test-image"
          onLoad={onLoad}
        />
      );

      // Initially loading
      expect(getByTestId('test-image-loading')).toBeTruthy();

      // Simulate load start
      const image = getByTestId('test-image');
      image.props.onLoadStart();

      // Still loading
      expect(getByTestId('test-image-loading')).toBeTruthy();

      // Simulate load complete
      image.props.onLoad();

      // Loading complete
      await waitFor(() => {
        expect(queryByTestId('test-image-loading')).toBeNull();
        expect(onLoad).toHaveBeenCalled();
      });
    });

    it('should reset error state on new load', async () => {
      const { getByTestId, queryByTestId, rerender } = render(
        <CachedImage
          uri="https://example.com/broken-image.jpg"
          testID="test-image"
        />
      );

      // Simulate error
      const image = getByTestId('test-image');
      image.props.onError({ error: 'Failed' });

      await waitFor(() => {
        expect(getByTestId('test-image-error')).toBeTruthy();
      });

      // Rerender with new URI
      rerender(
        <CachedImage
          uri="https://example.com/new-image.jpg"
          testID="test-image"
        />
      );

      // Simulate load start for new image
      const newImage = getByTestId('test-image');
      newImage.props.onLoadStart();

      // Error state should be cleared
      await waitFor(() => {
        expect(queryByTestId('test-image-error')).toBeNull();
        expect(getByTestId('test-image-loading')).toBeTruthy();
      });
    });
  });
});

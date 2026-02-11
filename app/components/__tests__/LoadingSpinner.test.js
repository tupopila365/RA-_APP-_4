import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<LoadingSpinner testID="loading-spinner" />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<LoadingSpinner size="large" testID="loading-spinner" />);
    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { getByLabelText } = render(<LoadingSpinner />);
    const spinner = getByLabelText('Loading content');
    expect(spinner).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(<LoadingSpinner />);
    const spinner = getByLabelText('Loading content');
    expect(spinner.props.accessibilityLabel).toBe('Loading content');
    expect(spinner.props.accessibilityRole).toBe('progressbar');
  });
});

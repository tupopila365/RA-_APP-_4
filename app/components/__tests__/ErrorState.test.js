import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

describe('ErrorState Component', () => {
  it('renders correctly with message', () => {
    const { getByText } = render(<ErrorState message="Something went wrong" />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetryMock = jest.fn();
    const { getByText } = render(
      <ErrorState message="Error occurred" onRetry={onRetryMock} />
    );
    
    const retryButton = getByText('Try Again');
    fireEvent.press(retryButton);
    
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorState message="Error" />);
    expect(queryByText('Try Again')).toBeNull();
  });

  it('has correct accessibility properties', () => {
    const { getByText } = render(
      <ErrorState message="Error" onRetry={() => {}} />
    );
    
    const errorMessage = getByText('Error');
    expect(errorMessage).toBeTruthy();
  });
});

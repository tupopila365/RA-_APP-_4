import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchInput } from '../SearchInput';

describe('SearchInput Component', () => {
  it('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchInput placeholder="Search..." onSearch={() => {}} />
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onSearch when text changes', async () => {
    const onSearchMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchInput placeholder="Search" onSearch={onSearchMock} debounceDelay={100} />
    );
    
    const input = getByPlaceholderText('Search');
    fireEvent.changeText(input, 'test query');
    
    // Wait for debounce to complete
    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith('test query');
    }, { timeout: 200 });
  });

  it('calls onClear when clear button is pressed', () => {
    const onClearMock = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <SearchInput 
        placeholder="Search" 
        onSearch={() => {}} 
        onClear={onClearMock}
      />
    );
    
    // Type something first
    const input = getByPlaceholderText('Search');
    fireEvent.changeText(input, 'test');
    
    // Then clear
    const clearButton = getByTestId('search-clear-button');
    fireEvent.press(clearButton);
    
    expect(onClearMock).toHaveBeenCalled();
  });

  it('has correct accessibility properties', () => {
    const { getByPlaceholderText } = render(
      <SearchInput 
        placeholder="Search" 
        onSearch={() => {}}
        accessibilityLabel="Search input"
        accessibilityHint="Type to search"
      />
    );
    
    const input = getByPlaceholderText('Search');
    expect(input.props.accessibilityLabel).toBe('Search input');
    expect(input.props.accessibilityHint).toBe('Type to search');
  });
});

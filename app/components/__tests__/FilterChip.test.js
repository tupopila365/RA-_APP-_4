import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterChip } from '../FilterChip';

describe('FilterChip Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(
      <FilterChip label="Category" selected={false} onPress={() => {}} />
    );
    expect(getByText('Category')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <FilterChip label="Filter" selected={false} onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Filter'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders differently when selected', () => {
    const { getByText, rerender } = render(
      <FilterChip label="Test" selected={false} onPress={() => {}} />
    );
    
    const chip = getByText('Test').parent;
    const unselectedStyle = chip.props.style;
    
    rerender(<FilterChip label="Test" selected={true} onPress={() => {}} />);
    const selectedStyle = getByText('Test').parent.props.style;
    
    expect(selectedStyle).not.toEqual(unselectedStyle);
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText, getByRole } = render(
      <FilterChip 
        label="Accessible Chip" 
        selected={false} 
        onPress={() => {}}
        accessibilityLabel="Filter by category"
      />
    );
    
    const chip = getByLabelText('Filter by category');
    expect(chip).toBeTruthy();
    expect(chip.props.accessibilityRole).toBe('button');
  });
});

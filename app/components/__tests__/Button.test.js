import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(<Button label="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Press Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button label="Disabled Button" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading text when loading', () => {
    const { getByText, queryByText } = render(
      <Button label="Submit" onPress={() => {}} loading={true} />
    );
    
    expect(getByText('Loading...')).toBeTruthy();
    expect(queryByText('Submit')).toBeNull();
  });

  it('renders with different variants', () => {
    const { rerender, getByText } = render(
      <Button label="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(<Button label="Secondary" onPress={() => {}} variant="secondary" />);
    expect(getByText('Secondary')).toBeTruthy();

    rerender(<Button label="Ghost" onPress={() => {}} variant="ghost" />);
    expect(getByText('Ghost')).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByRole } = render(
      <Button 
        label="Accessible Button" 
        onPress={() => {}} 
        accessibilityLabel="Custom Label"
        accessibilityHint="Custom Hint"
      />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Custom Label');
    expect(button.props.accessibilityHint).toBe('Custom Hint');
  });
});

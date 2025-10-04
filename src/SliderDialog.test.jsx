import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SliderDialog from './SliderDialog';

describe('SliderDialog', () => {
  const defaultProps = {
    title: 'Opacity',
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    onChange: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders correctly when a title is provided', () => {
    render(<SliderDialog {...defaultProps} />);
    expect(screen.getByText('Opacity')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByText('0.50')).toBeInTheDocument();
  });

  it('does not render when title is null', () => {
    const { container } = render(<SliderDialog {...defaultProps} title={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onChange when the slider value changes', () => {
    render(<SliderDialog {...defaultProps} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(0.8);
  });

  it('calls onChange with the default value when reset is clicked', () => {
    render(<SliderDialog {...defaultProps} />);
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetButton);
    expect(defaultProps.onChange).toHaveBeenCalledWith(0.5);
  });

  it('calls onClose when the close button is clicked', () => {
    render(<SliderDialog {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: 'Done' });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when the overlay is clicked', () => {
    render(<SliderDialog {...defaultProps} />);
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
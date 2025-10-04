import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AzNavRail from './AzNavRail';

// Mock child components to isolate the AzNavRail component
vi.mock('./MenuItem', () => ({
  default: ({ item }) => <div data-testid={`menu-item-${item.id}`}>{item.text}</div>,
}));

vi.mock('./AzNavRailButton', () => ({
  default: ({ item }) => <div data-testid={`rail-button-${item.id}`}>{item.text}</div>,
}));

describe('AzNavRail', () => {
  const mockContent = [
    { id: 'item1', text: 'Item 1', isRailItem: true, onClick: vi.fn() },
    { id: 'item2', text: 'Item 2', isRailItem: false, onClick: vi.fn() },
    { id: 'item3', text: 'Item 3', isRailItem: true, onClick: vi.fn() },
  ];

  const mockSettings = {
    appName: 'TestApp',
    displayAppNameInHeader: true,
  };

  it('renders collapsed by default with rail items', () => {
    render(<AzNavRail content={mockContent} settings={mockSettings} />);

    expect(screen.getByText('TestApp')).toBeInTheDocument();
    expect(screen.getByTestId('rail-button-item1')).toBeInTheDocument();
    expect(screen.queryByTestId('menu-item-item2')).not.toBeInTheDocument();
    expect(screen.getByTestId('rail-button-item3')).toBeInTheDocument();
  });

  it('expands when the header is clicked, showing all menu items', () => {
    render(<AzNavRail content={mockContent} settings={mockSettings} />);

    const header = screen.getByText('TestApp');
    fireEvent.click(header);

    expect(screen.getByTestId('menu-item-item1')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-item2')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-item3')).toBeInTheDocument();
  });

  it('collapses back when the header is clicked again', () => {
    render(<AzNavRail content={mockContent} settings={mockSettings} />);

    const header = screen.getByText('TestApp');
    // Expand
    fireEvent.click(header);
    // Collapse
    fireEvent.click(header);

    expect(screen.getByTestId('rail-button-item1')).toBeInTheDocument();
    expect(screen.queryByTestId('menu-item-item2')).not.toBeInTheDocument();
    expect(screen.getByTestId('rail-button-item3')).toBeInTheDocument();
  });
});
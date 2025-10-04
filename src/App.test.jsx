import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the local AzNavRail component to prevent module resolution issues in the test environment
vi.mock('./components/AzNavRail.jsx', () => ({
    default: ({ settings }) => <div>{settings.appName}</div>,
}));


describe('App', () => {
  it('renders the App component and the mocked AzNavRail', () => {
    // Mock for A-Frame and THREE.js which are not standard in jsdom
    global.AFRAME = {
        registerComponent: vi.fn(),
        registerShader: vi.fn(),
    };
    global.THREE = {
        TextureLoader: vi.fn().mockReturnValue({
            load: vi.fn()
        })
    };

    render(<App />);

    // Check for the app name, which is rendered by our mock
    expect(screen.getByText('GraffitiXR')).toBeInTheDocument();
  });
});
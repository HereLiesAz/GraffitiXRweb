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

    // Mock for animation frame
    global.requestAnimationFrame = vi.fn();
    global.cancelAnimationFrame = vi.fn();

    // Mock for HTMLMediaElement.play
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
        configurable: true,
        get() {
            return () => Promise.resolve();
        }
    });

    // Mock for navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
    });

    render(<App />);

    // Check for the app name, which is rendered by our mock
    expect(screen.getByText('GraffitiXR')).toBeInTheDocument();
  });
});
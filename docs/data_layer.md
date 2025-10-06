# 4. Data Layer and State Management

This document details the application's approach to state management, data flow, and data persistence.

### **Architecture: Component-Based State**

The application follows a modern React architecture, managing state within components using hooks. There is no complex state management library (like Redux); instead, state is managed locally where it is used or hoisted to the nearest common ancestor component when it needs to be shared.

-   **Single Source of Truth:** The primary application state is centralized in the main `App.jsx` component. This component is responsible for managing the active mode (`Image Trace`, `Mock-Up`, or `AR Overlay`), the selected overlay image, and the current values for all adjustable properties (opacity, contrast, etc.).
-   **Unidirectional Data Flow:** State is passed down from parent components to child components via props. State changes are communicated from child components back up to the parent via callback functions passed as props (e.g., `onChange`). This ensures a predictable and maintainable data flow.
-   **React Hooks:** State is managed using standard React hooks:
    -   `useState`: For managing simple state variables like slider values or the active mode.
    -   `useRef`: For holding references to DOM elements like the video feed, canvas, or file inputs.
    -   `useCallback` and `useMemo`: For optimizing performance by memoizing functions and values.

### **Key Files and State Holders**

-   **`App.jsx`**: This is the central hub of the application. It holds the majority of the application's state and acts as the top-level container for all other components.
-   **`SliderDialog.jsx`**: A reusable component that receives its state (value, min, max) as props and communicates changes back to its parent via the `onChange` prop.
-   **`AzNavRail.jsx`**: The navigation component receives its content and the state for interactive items (like toggles) as props. It calls `onClick` handlers to signal user actions back to the `App` component.

### **Data Persistence: Saving and Loading Projects**

A crucial feature is the ability for users to save their work and resume later.

-   **Save Action:** The "Save" button in the navigation rail triggers the serialization of the application's current state.
-   **Data Format:** The project state is saved as a `.grf` file, which is a JSON representation of all relevant settings.
-   **Saved Data:** The data to be saved includes:
    -   **All Modes:** The URI or a data URL of the selected overlay image, its current transformation (position, scale, rotation), and the values for opacity, saturation, and contrast.
    -   **Mock-Up Mode:** The URI of the background image and the coordinates of the four perspective warp handles.
    -   **AR Overlay Mode:** A unique identifier for the `markerFingerprint`, which includes the keypoints and descriptors of the tracked features. This allows the application to recognize the same physical space and restore the overlay's position in a new session.
-   **Loading a Project:** When a user loads a `.grf` file, the application parses the JSON and restores the state, effectively re-creating the user's previous session.
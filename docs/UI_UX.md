# 3. User Interface (UI) and User Experience (UX)

This document outlines the UI components, design principles, and interaction patterns for the GraffitiXR web application.

### **Core UI Component: `AzNavRail`**

The entire user interface is built around the `AzNavRail` component, a custom, reusable component library that provides both a collapsed navigation rail and an expanded menu drawer. This component is located in `src/components/lib/` and is treated as a foundational piece of the application's UI.

-   **Structure:** It consists of a series of buttons (`AzNavRailButton`) in its collapsed state and a list of menu items (`MenuItem`) when expanded.
-   **State Management:** The `AzNavRail` component manages its own expanded/collapsed state. The application's responsibility is to provide the content (the list of navigation items) and hoist the state for any interactive elements within the menu, such as toggles or sliders.
-   **Dynamic Content:** The items displayed in the navigation rail are dynamically generated based on the application's current operational mode (`Image Trace`, `Mock-Up`, or `AR Overlay`), which is controlled by the application's central state.

### **Key UI Components and Patterns**

-   **`SliderDialog`:** When a user needs to adjust a numerical value (like opacity, saturation, or contrast), a `SliderDialog` modal is presented. This component provides a clean, focused interface with a slider, a numerical display, a reset button, and a done button.
-   **`Notification`:** A non-intrusive `Notification` component is used to provide temporary feedback to the user (e.g., "Keypoints captured"). It appears at the bottom of the screen and dismisses itself after a few seconds.
-   **State-Driven UI:** The UI is built on the principle of a single source of truth. All UI elements reactively update based on changes to the central application state, which is managed by React hooks. This creates a predictable and unidirectional data flow.
-   **Gestures:** The application makes extensive use of touch gestures for direct manipulation of the overlay image:
    -   **Pinch-to-zoom:** To scale the image.
    -   **Two-finger rotate:** To rotate the image.
    -   **Tap:** To place objects in AR mode.
    -   **Drag:** To move corner handles in Mock-Up mode's warp editor.

### **Onboarding**

A simple onboarding flow or tutorial is necessary to introduce new users to the three distinct operational modes and their respective functionalities. This will help ensure users can discover and effectively use all the application's features.
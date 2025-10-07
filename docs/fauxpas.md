# 10. Faux Pas (Common Mistakes)

This document lists common mistakes, anti-patterns, and pitfalls to avoid during the development of the GraffitiXR web application.

### **State Management**

-   **Don't create decentralized state.** All application state should follow the established unidirectional data flow. Avoid creating local state that conflicts with or duplicates state managed by a parent component. This leads to unpredictable UI behavior.
-   **Don't mutate props directly.** Props are read-only. To change a value, a child component must call a callback function provided by its parent.

### **Performance**

-   **Don't block the main thread.** Any computationally expensive operation (like complex calculations or image processing) must be moved to a Web Worker. Blocking the main thread will cause the UI to freeze.
-   **Don't forget to memoize.** In a real-time application, components may re-render frequently. Use `React.memo`, `useCallback`, and `useMemo` to prevent unnecessary re-renders and expensive recalculations.
-   **Don't forget to clean up.** Always remove event listeners and clean up subscriptions in a `useEffect` return function to prevent memory leaks. When large objects like image data are no longer needed, ensure all references to them are cleared.

### **API Usage**

-   **Don't ignore component lifecycles.** When integrating third-party libraries or browser APIs (like the camera or WebXR), ensure their setup and teardown are correctly tied to the React component lifecycle (`useEffect` for setup, and its cleanup function for teardown).
-   **Don't use brittle selectors in tests.** In E2E tests, prefer user-facing locators like `getByRole`, `getByText`, or `getByLabel`. Avoid relying on auto-generated class names or complex CSS selectors, which are prone to breaking.

### **General**

-   **Don't commit artifacts.** Do not commit development artifacts like build outputs, log files, or temporary verification scripts (`jules-scratch/`) to the main repository. Use the `.gitignore` file appropriately.
-   **Don't work on `main`.** All work must be done in a feature or bugfix branch and submitted via a Pull Request. Direct commits to the `main` branch are not allowed.
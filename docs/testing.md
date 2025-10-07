# 6. Testing Strategy

This document describes the testing strategy for the GraffitiXR web application, which includes unit testing with Vitest and end-to-end (E2E) testing with Playwright.

### **Unit Testing**

-   **Framework:** Unit tests are written using [**Vitest**](https://vitest.dev/), a fast and modern testing framework compatible with Vite projects.
-   **Environment:** Tests run in a `jsdom` environment, which simulates a browser environment for testing React components without needing a full browser.
-   **Location:** Test files are co-located with the components they test and follow the naming convention `*.test.jsx` (e.g., `src/SliderDialog.test.jsx`).
-   **Focus:** Unit tests focus on verifying the logic of individual React components and hooks. They ensure that components render correctly given specific props and that they respond to user interactions as expected.
-   **Execution:** To run the unit test suite, execute the following command:
    ```bash
    npm test
    ```

### **End-to-End (E2E) Testing**

-   **Framework:** E2E tests are written using [**Playwright**](https://playwright.dev/python/), a powerful framework for browser automation and testing.
-   **Purpose:** These tests verify complete user flows from start to finish. They simulate real user interactions with the application running in a browser to catch integration issues and ensure the application works as a whole.
-   **Location:** E2E tests are located in the `e2e/` directory at the root of the project.
-   **Visual Verification:** A key part of the E2E testing process is visual verification. Playwright is used to generate screenshots of the application at critical points in a user flow. These screenshots are used to confirm that UI changes have been implemented correctly.
-   **Execution:** To run the E2E tests, first ensure the development server is running (`npm run dev`). Then, execute the tests using `pytest`. In a headless environment (like the development sandbox), `xvfb-run` is required to simulate a display:
    ```bash
    # First, start the server in the background
    npm run dev &

    # Then, run the tests
    xvfb-run pytest e2e/
    ```

### **General Guidelines**

-   **New Features:** All new features or significant code changes should be accompanied by corresponding unit tests to verify their correctness.
-   **UI Changes:** All UI-facing changes must be visually verified using the E2e testing and screenshotting workflow before they are considered complete.
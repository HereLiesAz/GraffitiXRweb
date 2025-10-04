# GraffitiXRweb TODO List

This document outlines the remaining tasks and potential improvements for the GraffitiXRweb application.

## High-Priority Tasks

-   [ ] **Fix `handleLoad` Deserialization:**
    -   The current implementation for deserializing the `markerFingerprint` is a placeholder. Research and implement a robust method for converting the saved keypoint and descriptor data back into `cv.KeyPointVector` and `cv.Mat` objects.
-   [ ] **Resolve Testing Blockers:**
    -   The Vitest test suite is currently blocked by a persistent timeout issue. This needs to be diagnosed and resolved to enable automated testing.
-   [ ] **Implement AR Lock/Unlock Functionality:**
    -   The `isArLocked` state is not yet fully implemented in the WebXR scene. Add the necessary logic to freeze the position of the overlay when the user clicks the "Lock" button.

## Core Feature Enhancements

-   [ ] **Improve AR Tracking Robustness:**
    -   Investigate more advanced feature detectors and descriptors (e.g., SIFT, if available and performant in the browser) to improve the stability and accuracy of the tracking.
    -   Implement more sophisticated outlier rejection techniques to handle noisy matches and improve the stability of the homography calculation.
-   [ ] **Refine Homography-to-3D Conversion:**
    -   Research and implement a method to decompose the 2D homography matrix into a full 3D pose (rotation and translation). This would provide a more accurate and stable transformation for the WebXR overlay.
-   [ ] **Implement Mural Progress Tracking:**
    -   This is a key feature from the original requirements that has not yet been implemented.
    -   Develop a system for tracking changes to the real-world surface over time. This will likely involve:
        -   Periodically re-capturing the "fingerprint" and updating the feature set.
        -   Implementing a mechanism to diff the new fingerprint with the old one to identify areas where the mural has been filled in.
        -   Using the mural itself as a new source of tracking features as it's completed.

## UI/UX Improvements

-   [ ] **Add Visual Feedback for Fingerprint Capture:**
    -   Provide a clear visual indicator to the user when a marker "fingerprint" has been successfully captured.
-   [ ] **Improve the "Create Marker" UI:**
    -   Create a dedicated dialog for the "Create Marker" feature with clear instructions and a preview of the captured image.
-   [ ] **Refine the Slider Dialog:**
    -   Improve the design and user experience of the `SliderDialog` component, potentially by adding a live preview of the changes.

## Code Quality and Maintenance

-   [ ] **Add Comprehensive Tests:**
    -   Once the testing environment is fixed, write a full suite of unit and integration tests for all components and major functionalities.
-   [ ] **Create a Component Library:**
    -   Move the `AzNavRail` components to a separate directory to create a reusable component library.
-   [ ] **Expand Documentation:**
    -   Add more detailed documentation for the individual components, the computer vision pipeline, and the WebXR integration.
-   [ ] **Add PropType Validation:**
    -   Add `PropTypes` to all components to improve code quality and prevent bugs.
-   [ ] **Clean Up `jules-scratch` Directory:**
    -   Remove the temporary `jules-scratch` directory and its contents before final submission.
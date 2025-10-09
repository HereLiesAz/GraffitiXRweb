# 7. Task Flow and Project Roadmap

This document tracks the development status, future enhancements, and identified gaps in the GraffitiXR web application. It serves as a high-level guide for development priorities.

---

## **Project Backlog**

This section outlines the planned features and enhancements, categorized by priority.

### **High Priority**

-   **Enhance User Experience (UX):**
    -   **Create User Onboarding:** Design and implement a tutorial or onboarding flow to explain the three different modes (AR, Mock-up, On-the-Go) to new users.
    -   **Add Gesture Feedback:** Provide visual feedback in Mock-up mode when a scale or rotation gesture is active.
-   **Improve AR Tracking:**
    -   Implement a system to keep track of the real-world image's progress as the original tracking "fingerprint" is eventually covered by the artwork itself.

### **Medium Priority**

-   **Implement "Save/Export" Feature:**
    -   Allow users to save or export the final composed image from any of the modes.
    -   Allow users to save the project state, including the `markerFingerprint`, overlay location, size, and orientation.
    -   Ensure that saving the project includes the history of the fingerprint for robust restoration.
-   **Implement Advanced Image Editing:**
    -   Add more advanced image adjustment tools, such as color balance or different blending modes.

### **Low Priority / Future Ideas**

-   **Create a Project Library:**
    -   Implement a feature to allow users to save, load, and manage a library of different projects (each with its own background, overlay, and settings).

---

For a detailed list of completed features, please refer to the project's commit history and version release notes.
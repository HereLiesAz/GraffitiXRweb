# 2. Application Workflow and User Interaction

This document describes the application's general mechanics and the specific user flows for each operational mode.

### **How it Works**

The application leverages the device's camera and modern web technologies to project a user-selected image onto a view of the real world.

-   In **AR Overlay Mode**, the application uses the browser's built-in WebXR capabilities to understand the environment and detect surfaces. When a surface is found, the user can place an image that will appear anchored to the real world. A computer vision layer helps stabilize the projection.
-   In **Image Trace and Mock-Up Modes**, the application uses standard React components and the HTML Canvas API to overlay and manipulate images on top of either a live camera feed or a static background picture.

In all modes, the user has fine-grained control over the visual properties of the overlay image, including its opacity, saturation, and contrast.

### **User Interaction Flows**

The user interacts with the application through a simple navigation rail on the left side of the screen. The available controls change dynamically based on the selected mode.

#### **General Flow**

1.  The user selects an operational mode (Image Trace, Mock-Up, or AR Overlay).
2.  The user selects an image from their device to use as an overlay.
3.  The application presents the image according to the rules of the selected mode.
4.  The user adjusts the image's properties (scale, rotation, opacity, etc.) to achieve the desired look.
5.  The user can save the project state or export the final image.

#### **Mode-Specific Flows**

**1. Image Trace Flow:**

1.  The user points their device's camera at a physical surface. The device should be in a fixed position.
2.  The user selects an "Image" from the navigation rail and chooses a file from their device.
3.  The image appears as a semi-transparent overlay on top of the live camera feed.
4.  The user can use the "Opacity," "Saturation," and "Contrast" sliders to adjust the overlay.
5.  The user can use touch gestures (pinch-to-zoom, two-finger rotate) to change the size and orientation of the overlay.

**2. Mock-Up Flow:**

1.  The user is prompted to select a background image (e.g., a photo of a wall).
2.  The user selects their artwork image to overlay on top of the background.
3.  The user activates "Warp" mode. Four corner handles appear on the overlay image.
4.  The user drags the handles to apply a perspective transformation, making the artwork appear to fit the surface in the background photo.
5.  The user can use "Undo" and "Redo" to step through changes.

**3. AR Overlay Flow:**

1.  The user points the camera at a wall or other surface. The application begins searching for planes.
2.  Visual feedback indicates when a surface has been detected.
3.  The user selects an image from their device.
4.  The user taps on a detected plane to place the image, which creates a real-world anchor.
5.  The user can use touch gestures to scale and rotate the anchored image.
6.  The user can "Lock" the image's position. This engages a computer vision system to track user-placed marks on the real-world surface, providing enhanced stability and preventing drift.
# 11. Miscellaneous

This document contains a collection of miscellaneous information, including potential future enhancements for the GraffitiXR web application.

---

## **Potential Future Enhancements**

Once the core functionality is stable, several exciting features could be added to expand the application's capabilities.

-   **Video Overlays:** The rendering engine could be extended to support video playback. This would involve using an HTML `<video>` element as the source for a texture in the Canvas or WebGL context, allowing video files to be projected onto surfaces.

-   **Shared AR Experiences:** A truly collaborative AR mode could be created. While WebXR does not have a cross-platform "Cloud Anchor" standard, a custom implementation could be built. This would involve:
    1.  A user placing an object and saving its world-space transform to a server.
    2.  The user sharing a unique ID for that session.
    3.  A second user joining the session, who would then see the object rendered in the same shared physical space. This would likely require an initial manual calibration step between the two users.

-   **Advanced Grid-Based Stabilization:** The current computer vision stabilization relies on tracking arbitrary points. A more robust system could be built using predefined fiducial markers.
    -   **ArUco Markers:** The application could use a JavaScript port of OpenCV (OpenCV.js) to detect [ArUco markers](https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html). An artist could print a sheet with these markers and place it on the wall. The application could then detect these markers to get highly accurate 3D position and orientation information, creating an extremely stable local coordinate system and virtually eliminating any tracking drift.

-   **3D Model Support:** The rendering engine could be expanded beyond simple 2D images to support the loading and rendering of 3D models (e.g., in `.gltf` or `.glb` format) using libraries like [Three.js](https://threejs.org/) or [Babylon.js](https://www.babylonjs.com/). This would allow users to visualize 3D sculptures or installations in addition to 2D murals, significantly broadening the application's utility.
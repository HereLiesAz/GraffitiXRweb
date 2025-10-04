# GraffitiXRweb Documentation

## 1. Project Overview

GraffitiXRweb is a web-based augmented reality application designed to help artists, designers, and homeowners visualize and trace murals and other large-scale artwork onto real-world surfaces. The application's core innovation is its ability to use a user-defined set of real-world marks on a wall as a unique visual "fingerprint," creating a robust and persistent anchor for the AR overlay.

The application is built as a single-page application using React and Vite, and it incorporates a number of modern web technologies, including WebXR for augmented reality and OpenCV.js for computer vision.

## 2. Core Features

### 2.1. Mode-Based Interface

The application is designed around a flexible, mode-based interface that caters to a variety of use cases:

*   **Image Trace Mode:** A non-AR mode that overlays a user-selected image directly onto the device's camera feed. This mode provides a simple way to trace an image onto a surface without the need for complex AR setup. It includes controls for adjusting the opacity, saturation, and contrast of the overlay image.
*   **AR Overlay Mode:** The core WebXR-powered mode that uses a custom "marker fingerprint" to project an image onto a real-world surface. This mode provides a highly stable and persistent AR experience, allowing the user to move around freely without losing the overlay's position.
*   **Mock-Up Mode:** A non-AR mode for creating mock-ups on a static image of a surface. This mode includes a powerful "Warp" feature that allows the user to perform perspective transformations on the overlay image, making it easy to create realistic mock-ups.

### 2.2. Custom Marker "Fingerprint"

The application's key feature is its ability to use a user-provided set of real-world marks as a unique AR anchor. This is achieved through a sophisticated computer vision pipeline:

1.  **Capture Marks:** The user captures an image of their wall markings using their device's camera.
2.  **Feature Extraction:** The application uses OpenCV.js to detect and extract a set of unique feature keypoints and descriptors from the captured image. This set of features serves as the "fingerprint" for the scene.
3.  **Real-Time Tracking:** The application continuously analyzes the live camera feed, matching the features in the live view against the stored "fingerprint."
4.  **Pose Estimation:** When a sufficient number of high-quality matches are found, the application uses a homography transformation to calculate the precise position, scale, and perspective of the overlay.

### 2.3. Save/Load Functionality

The application includes a robust save/load system that allows users to preserve their work and resume later. The entire application state, including the overlay image, filter settings, warp points, and the custom marker "fingerprint," is serialized to a custom `.grf` file.

### 2.4. Custom UI

The application features a custom-built navigation rail component, `AzNavRail`, which provides a clean, intuitive, and highly configurable interface for switching between modes and accessing controls.

## 3. Project Structure

The project is organized into a clean and maintainable structure:

*   **`public/`:** Contains static assets.
*   **`src/`:** The main source code directory for the React application.
    *   **`components/`:** Contains all the React components for the application, including the custom `AzNavRail` component and its children.
    *   **`hooks/`:** Contains custom React hooks, such as `useFitText` for dynamically resizing text.
    *   **`App.jsx`:** The main application component, which manages the application's state, logic, and UI.
    *   **`main.jsx`:** The entry point for the React application.
    *   **`index.css`:** The main stylesheet for the application.
*   **`package.json`:** Defines the project's dependencies, scripts, and metadata.
*   **`vite.config.js`:** The configuration file for the Vite build tool.

## 4. Key Technologies

*   **React:** The core JavaScript library for building the user interface.
*   **Vite:** A modern, fast, and highly configurable build tool and development server.
*   **@react-three/fiber & @react-three/xr:** A powerful combination of libraries for creating the WebXR scene and handling AR functionality in a declarative, React-friendly way.
*   **three.js:** The underlying 3D graphics library for the WebXR scene.
*   **OpenCV.js:** A comprehensive computer vision library used for feature detection, matching, and pose estimation.
*   **perspectivets:** A lightweight library for performing perspective transformations on the HTML5 canvas, used in the Mock-Up mode.

## 5. Getting Started

To run the application locally, please follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
3.  Open your browser to the URL provided by the development server (usually `http://localhost:5173`).
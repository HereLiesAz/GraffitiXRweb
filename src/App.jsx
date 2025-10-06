import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AzNavRail from './components/lib/AzNavRail.jsx';
import SliderDialog from './SliderDialog';
import Notification from './components/lib/Notification.jsx';

function App() {
  // UI State
  const [opacity, setOpacity] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [activeSlider, setActiveSlider] = useState(null);
  const [notification, setNotification] = useState(null);

  // Data State
  const [overlayImage, setOverlayImage] = useState(null);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const imageInputRef = useRef(null);

  // Handlers
  const handleCaptureMarks = () => {
    // This is a placeholder. In a real scenario, this would involve
    // computer vision logic to detect features in the video feed.
    const keypointsCount = Math.floor(Math.random() * 100) + 50; // Simulate finding keypoints
    setNotification(`${keypointsCount} keypoints captured.`);
  };

  const handleImageLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageRef.current.onload = () => {
          setOverlayImage(imageRef.current);
        };
        imageRef.current.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Configs
  const sliderConfig = {
    Opacity: { value: opacity, min: 0, max: 1, step: 0.01, setter: setOpacity, defaultValue: 1 },
    Saturation: { value: saturation, min: 0, max: 2, step: 0.01, setter: setSaturation, defaultValue: 1 },
    Contrast: { value: contrast, min: 0, max: 2, step: 0.01, setter: setContrast, defaultValue: 1 },
  };

  const navItems = useMemo(() => {
    return [
      { id: 'load-image', text: 'Image', isRailItem: true, onClick: () => imageInputRef.current?.click() },
      { id: 'capture-marks', text: 'Capture Marks', isRailItem: true, onClick: handleCaptureMarks },
      { id: 'opacity', text: 'Opacity', isRailItem: true, onClick: () => setActiveSlider('Opacity') },
      { id: 'saturation', text: 'Saturation', isRailItem: true, onClick: () => setActiveSlider('Saturation') },
      { id: 'contrast', text: 'Contrast', isRailItem: true, onClick: () => setActiveSlider('Contrast') },
    ];
  }, []);

  const railSettings = { appName: 'GraffitiXR', displayAppNameInHeader: true };

  const drawOverlay = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (overlayImage) {
      ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
      ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    }
  }, [overlayImage, opacity, saturation, contrast]);

  // Effects
  useEffect(() => {
    const videoElement = videoRef.current;
    let stream;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play();
        }
      })
      .catch(err => console.error("Error accessing camera:", err));

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    let animationFrameId;
    const videoElement = videoRef.current;

    const drawLoop = () => {
      if (videoElement && !videoElement.paused && !videoElement.ended) {
        drawOverlay();
      }
      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [drawOverlay]);


  return (
    <div className="App">
      <AzNavRail content={navItems} settings={railSettings} />
      {activeSlider && (
        <SliderDialog
          title={activeSlider}
          {...sliderConfig[activeSlider]}
          onChange={sliderConfig[activeSlider].setter}
          onClose={() => setActiveSlider(null)}
        />
      )}
      <Notification message={notification} />
      <main className="main-content">
        <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageLoad} />
        <div className="video-container">
          <video ref={videoRef} id="camera-feed" playsInline />
          <canvas ref={canvasRef} id="overlay-canvas" />
        </div>
      </main>
    </div>
  );
}

export default App;
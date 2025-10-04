import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AzNavRail from './components/lib/AzNavRail.jsx';
import SliderDialog from './SliderDialog';

function App() {
  // UI State
  const [opacity, setOpacity] = useState(0.5);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [activeSlider, setActiveSlider] = useState(null);

  // Data State
  const [overlayImage, setOverlayImage] = useState(null);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const imageInputRef = useRef(null);

  const sliderConfig = {
    Opacity: { value: opacity, min: 0, max: 1, step: 0.01, setter: setOpacity, defaultValue: 0.5 },
    Saturation: { value: saturation, min: 0, max: 2, step: 0.01, setter: setSaturation, defaultValue: 1 },
    Contrast: { value: contrast, min: 0, max: 2, step: 0.01, setter: setContrast, defaultValue: 1 },
  };

  const navItems = useMemo(() => {
    return [
      { id: 'load-image', text: 'Image', isRailItem: true, onClick: () => imageInputRef.current?.click() },
      { id: 'opacity', text: 'Opacity', isRailItem: true, onClick: () => setActiveSlider('Opacity') },
      { id: 'saturation', text: 'Saturation', isRailItem: true, onClick: () => setActiveSlider('Saturation') },
      { id: 'contrast', text: 'Contrast', isRailItem: true, onClick: () => setActiveSlider('Contrast') },
    ];
  }, []);

  const railSettings = { appName: 'GraffitiXR', displayAppNameInHeader: true };

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

  // Effect for managing camera stream
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

  // Effect for drawing loop
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
      <SliderDialog
        title={activeSlider}
        {...(activeSlider && sliderConfig[activeSlider])}
        onChange={activeSlider && sliderConfig[activeSlider].setter}
        onClose={() => setActiveSlider(null)}
      />
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
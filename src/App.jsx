import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AzNavRail from './components/lib/AzNavRail.jsx';
import SliderDialog from './SliderDialog';
import Notification from './components/lib/Notification.jsx';
import Onboarding from './components/Onboarding.jsx';

function App() {
  // UI State
  const [opacity, setOpacity] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [activeSlider, setActiveSlider] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isGesturing, setIsGesturing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Transform State
  const [transform, setTransform] = useState({
    scale: 1,
    rotation: 0,
    offset: { x: 0, y: 0 },
  });

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
          if (canvasRef.current) {
            canvasRef.current.dataset.imageLoaded = 'true';
          }
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
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Match canvas resolution to its display size.
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (overlayImage) {
      ctx.save();
      // Center transformations on the canvas
      ctx.translate(canvas.width / 2 + transform.offset.x, canvas.height / 2 + transform.offset.y);
      ctx.rotate(transform.rotation);
      ctx.scale(transform.scale, transform.scale);

      const imgX = -overlayImage.width / 2;
      const imgY = -overlayImage.height / 2;

      ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
      ctx.drawImage(overlayImage, imgX, imgY);

      if (isGesturing) {
        ctx.strokeStyle = 'rgba(0, 123, 255, 0.7)';
        ctx.lineWidth = 8; // A thicker border for better visibility
        ctx.strokeRect(imgX, imgY, overlayImage.width, overlayImage.height);
      }

      ctx.restore();
    }
  }, [overlayImage, opacity, saturation, contrast, transform, isGesturing]);

  // Effects
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('graffitiXR.hasOnboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleDismissOnboarding = () => {
    localStorage.setItem('graffitiXR.hasOnboarded', 'true');
    setShowOnboarding(false);
  };

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

    const drawLoop = () => {
      drawOverlay();
      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [drawOverlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let pointers = [];
    let prevDistance = -1;
    let prevAngle = -1;

    const getDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.clientX - p2.clientX, 2) + Math.pow(p1.clientY - p2.clientY, 2));
    };

    const getAngle = (p1, p2) => {
      return Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX);
    };

    const handlePointerDown = (e) => {
      pointers.push(e);
      setIsGesturing(true);
    };

    const handlePointerMove = (e) => {
      const index = pointers.findIndex(p => p.pointerId === e.pointerId);
      if (index === -1) return;
      pointers[index] = e;

      if (pointers.length === 1) {
        // Pan
        setTransform(t => ({
          ...t,
          offset: {
            x: t.offset.x + e.movementX,
            y: t.offset.y + e.movementY,
          },
        }));
      } else if (pointers.length === 2) {
        // Pinch and Rotate
        const p1 = pointers[0];
        const p2 = pointers[1];

        const distance = getDistance(p1, p2);
        const angle = getAngle(p1, p2);

        if (prevDistance > 0) {
          const scaleChange = distance / prevDistance;
          setTransform(t => ({ ...t, scale: t.scale * scaleChange }));
        }

        if (prevAngle !== -1) {
          const angleChange = angle - prevAngle;
          setTransform(t => ({ ...t, rotation: t.rotation + angleChange }));
        }

        prevDistance = distance;
        prevAngle = angle;
      }
    };

    const handlePointerUp = (e) => {
      pointers = pointers.filter(p => p.pointerId !== e.pointerId);
      if (pointers.length < 2) {
        prevDistance = -1;
        prevAngle = -1;
      }
      if (pointers.length === 0) {
        setIsGesturing(false);
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [canvasRef]);


  return (
    <div className="App">
      {showOnboarding && <Onboarding onDismiss={handleDismissOnboarding} />}
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
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getPerspectiveTransform, warp } from 'perspectivets';
import AzNavRail from './components/lib/AzNavRail.jsx';
import SliderDialog from './SliderDialog';
import Notification from './components/lib/Notification.jsx';
import Onboarding from './components/Onboarding.jsx';
import AROverlay from './components/AROverlay.jsx';

const AppModes = {
  IMAGE_TRACE: 'Image Trace',
  MOCK_UP: 'Mock Up',
  AR_OVERLAY: 'AR Overlay',
};

function App() {
  // UI State
  const [opacity, setOpacity] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [activeSlider, setActiveSlider] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isGesturing, setIsGesturing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Mode State
  const [currentMode, setCurrentMode] = useState(AppModes.IMAGE_TRACE);
  const [isWarping, setIsWarping] = useState(false);
  const [warpPoints, setWarpPoints] = useState(null);

  // Transform State
  const [transform, setTransform] = useState({
    scale: 1,
    rotation: 0,
    offset: { x: 0, y: 0 },
  });

  // Data State
  const [overlayImage, setOverlayImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayImageRef = useRef(new Image());
  const imageInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

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
        overlayImageRef.current.onload = () => {
          const img = overlayImageRef.current;
          setOverlayImage(img);

          // Initialize warp points when image loads
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.dataset.imageLoaded = 'true';
            const centerX = canvas.clientWidth / 2;
            const centerY = canvas.clientHeight / 2;
            const halfW = img.width / 2;
            const halfH = img.height / 2;
            setWarpPoints([
              { x: centerX - halfW, y: centerY - halfH }, // Top-left
              { x: centerX + halfW, y: centerY - halfH }, // Top-right
              { x: centerX + halfW, y: centerY + halfH }, // Bottom-right
              { x: centerX - halfW, y: centerY + halfH }, // Bottom-left
            ]);
          }
        };
        overlayImageRef.current.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const bgImage = new Image();
        bgImage.onload = () => {
          setBackgroundImage(bgImage);
        };
        bgImage.src = event.target.result;
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
    const modeOptions = Object.values(AppModes);
    const handleModeCycle = () => {
      const currentIndex = modeOptions.indexOf(currentMode);
      const nextIndex = (currentIndex + 1) % modeOptions.length;
      setCurrentMode(modeOptions[nextIndex]);
    };

    const items = [
      { id: 'mode', text: 'Mode', isRailItem: true, isCycler: true, selectedOption: currentMode, onClick: handleModeCycle },
      { id: 'load-image', text: 'Image', isRailItem: true, onClick: () => imageInputRef.current?.click() },
    ];

    if (currentMode === AppModes.MOCK_UP) {
      items.push({ id: 'load-background', text: 'Background', isRailItem: true, onClick: () => backgroundInputRef.current?.click() });
      items.push({ id: 'warp', text: 'Warp', isRailItem: true, onClick: () => setIsWarping(!isWarping) });
    }

    if (currentMode === AppModes.AR_OVERLAY) {
      items.push({ id: 'capture-marks', text: 'Capture Marks', isRailItem: true, onClick: handleCaptureMarks });
    }

    items.push(
      { id: 'opacity', text: 'Opacity', isRailItem: true, onClick: () => setActiveSlider('Opacity') },
      { id: 'saturation', text: 'Saturation', isRailItem: true, onClick: () => setActiveSlider('Saturation') },
      { id: 'contrast', text: 'Contrast', isRailItem: true, onClick: () => setActiveSlider('Contrast') }
    );

    return items;
  }, [currentMode]);

  const railSettings = { appName: 'GraffitiXR', displayAppNameInHeader: true };

  const drawOverlay = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentMode === AppModes.MOCK_UP && backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    if (overlayImage) {
      if (currentMode === AppModes.MOCK_UP && warpPoints) {
        // Warp logic for Mock-Up mode
        const srcPoints = [
          { x: 0, y: 0 },
          { x: overlayImage.width, y: 0 },
          { x: overlayImage.width, y: overlayImage.height },
          { x: 0, y: overlayImage.height },
        ];

        try {
          const transformMatrix = getPerspectiveTransform(srcPoints, warpPoints);
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          warp(overlayImage, tempCanvas, transformMatrix);
          ctx.drawImage(tempCanvas, 0, 0);
        } catch (error) {
          // If points are collinear, transform will fail. Draw unwarped for now.
          ctx.drawImage(overlayImage, warpPoints[0].x, warpPoints[0].y);
        }

        if (isWarping) {
          // Draw warp points
          warpPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 123, 255, 0.7)';
            ctx.fill();
          });
        }

      } else {
        // Default gesture logic for Image Trace mode
        ctx.save();
        ctx.translate(canvas.width / 2 + transform.offset.x, canvas.height / 2 + transform.offset.y);
        ctx.rotate(transform.rotation);
        ctx.scale(transform.scale, transform.scale);
        const imgX = -overlayImage.width / 2;
        const imgY = -overlayImage.height / 2;
        ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
        ctx.drawImage(overlayImage, imgX, imgY);
        if (isGesturing) {
          ctx.strokeStyle = 'rgba(0, 123, 255, 0.7)';
          ctx.lineWidth = 8;
          ctx.strokeRect(imgX, imgY, overlayImage.width, overlayImage.height);
        }
        ctx.restore();
      }
    }
  }, [currentMode, backgroundImage, overlayImage, opacity, saturation, contrast, transform, isGesturing, warpPoints, isWarping]);

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

    if (currentMode === AppModes.IMAGE_TRACE) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    };
  }, [currentMode]);

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

    // General pan/zoom/rotate state
    let pointers = [];
    let prevDistance = -1;
    let prevAngle = -1;

    // Warp state
    let selectedPointIndex = -1;
    const handleRadius = 20;

    const getDistance = (p1, p2) => Math.sqrt(Math.pow(p1.clientX - p2.clientX, 2) + Math.pow(p1.clientY - p2.clientY, 2));
    const getAngle = (p1, p2) => Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX);

    const handlePointerDown = (e) => {
      if (currentMode === AppModes.MOCK_UP && isWarping && warpPoints) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < warpPoints.length; i++) {
          const p = warpPoints[i];
          if (Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < handleRadius) {
            selectedPointIndex = i;
            return;
          }
        }
      } else if (currentMode === AppModes.IMAGE_TRACE) {
        pointers.push(e);
        setIsGesturing(true);
      }
    };

    const handlePointerMove = (e) => {
      if (currentMode === AppModes.MOCK_UP && isWarping && selectedPointIndex !== -1) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newWarpPoints = [...warpPoints];
        newWarpPoints[selectedPointIndex] = { x, y };
        setWarpPoints(newWarpPoints);
      } else if (currentMode === AppModes.IMAGE_TRACE) {
        const index = pointers.findIndex(p => p.pointerId === e.pointerId);
        if (index === -1) return;
        pointers[index] = e;

        if (pointers.length === 1) {
          setTransform(t => ({ ...t, offset: { x: t.offset.x + e.movementX, y: t.offset.y + e.movementY } }));
        } else if (pointers.length === 2) {
          const p1 = pointers[0];
          const p2 = pointers[1];
          const distance = getDistance(p1, p2);
          const angle = getAngle(p1, p2);
          if (prevDistance > 0) {
            setTransform(t => ({ ...t, scale: t.scale * (distance / prevDistance) }));
          }
          if (prevAngle !== -1) {
            setTransform(t => ({ ...t, rotation: t.rotation + (angle - prevAngle) }));
          }
          prevDistance = distance;
          prevAngle = angle;
        }
      }
    };

    const handlePointerUp = (e) => {
      if (currentMode === AppModes.MOCK_UP) {
        selectedPointIndex = -1;
      } else if (currentMode === AppModes.IMAGE_TRACE) {
        pointers = pointers.filter(p => p.pointerId !== e.pointerId);
        if (pointers.length < 2) {
          prevDistance = -1;
          prevAngle = -1;
        }
        if (pointers.length === 0) {
          setIsGesturing(false);
        }
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
  }, [canvasRef, currentMode, isWarping, warpPoints]);


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
        <input type="file" ref={backgroundInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleBackgroundImageLoad} />
        {currentMode === AppModes.IMAGE_TRACE && (
          <div className="video-container">
            <video ref={videoRef} id="camera-feed" playsInline />
            <canvas ref={canvasRef} id="overlay-canvas" />
          </div>
        )}
        {currentMode === AppModes.MOCK_UP && (
          <div className="mockup-container" style={{ width: '100%', height: '100%', backgroundColor: '#333' }}>
            {/* Placeholder for Mock-up mode. The canvas will be used here. */}
            <canvas ref={canvasRef} id="overlay-canvas" />
          </div>
        )}
        {currentMode === AppModes.AR_OVERLAY && (
          <AROverlay overlayImage={overlayImage} />
        )}
      </main>
    </div>
  );
}

export default App;
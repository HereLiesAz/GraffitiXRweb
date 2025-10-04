import React, { useState, useEffect, useRef, useCallback } from 'react';
import AzNavRail from 'aznavrail-web';
import 'aznavrail-web/dist/index.css';
import SliderDialog from './SliderDialog';

function App() {
  // UI State
  const [mode, setMode] = useState('Image Trace');
  const [opacity, setOpacity] = useState(0.5);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isArLocked, setIsArLocked] = useState(false);
  const [isWarpActive, setIsWarpActive] = useState(false);
  const [activeSlider, setActiveSlider] = useState(null);

  // Data State
  const [overlayImage, setOverlayImage] = useState(null);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const aPlaneRef = useRef(null);
  const imageRef = useRef(new Image());

  const sliderConfig = {
    Opacity: { value: opacity, min: 0, max: 1, step: 0.01, setter: setOpacity },
    Saturation: { value: saturation, min: 0, max: 2, step: 0.01, setter: setSaturation },
    Contrast: { value: contrast, min: 0, max: 2, step: 0.01, setter: setContrast },
  };

  const navItems = React.useMemo(() => {
    const baseItems = [
      { id: 'mode-cycler', text: 'Mode', isRailItem: true, isCycler: true, options: ['Image Trace', 'AR Overlay', 'Mock-Up'], selectedOption: mode, onClick: setMode },
      { id: 'load-image', text: 'Image', isRailItem: true, onClick: () => document.getElementById('image-loader-hidden')?.click() },
    ];

    const modeItems = {
      'Image Trace': [
        { id: 'opacity', text: 'Opacity', onClick: () => setActiveSlider('Opacity') },
        { id: 'saturation', text: 'Saturation', onClick: () => setActiveSlider('Saturation') },
        { id: 'contrast', text: 'Contrast', onClick: () => setActiveSlider('Contrast') },
      ],
      'AR Overlay': [
        { id: 'opacity', text: 'Opacity', onClick: () => setActiveSlider('Opacity') },
        { id: 'lock', text: 'Lock/Unlock', isToggle: true, isChecked: isArLocked, toggleOnText: 'Unlock', toggleOffText: 'Lock', onClick: () => setIsArLocked(!isArLocked) },
      ],
      'Mock-Up': [
        { id: 'opacity', text: 'Opacity', onClick: () => setActiveSlider('Opacity') },
        { id: 'warp', text: 'Warp', isToggle: true, isChecked: isWarpActive, toggleOnText: 'Apply Warp', toggleOffText: 'Warp', onClick: () => setIsWarpActive(!isWarpActive) },
      ]
    };

    return [...baseItems, ...(modeItems[mode] || [])];
  }, [mode, isArLocked, isWarpActive]);

  const railSettings = { appName: 'GraffitiXR', displayAppNameInHeader: true };

  const handleImageLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageRef.current.onload = () => {
          setOverlayImage(imageRef.current);
          if (mode === 'AR Overlay') {
            const texture = new THREE.TextureLoader().load(event.target.result);
            aPlaneRef.current?.setAttribute('material', 'src', texture);
          }
        };
        imageRef.current.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawOverlay = useCallback(() => {
    if (!overlayImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }, [overlayImage, opacity, saturation, contrast]);

  useEffect(() => {
    if (mode === 'Image Trace' || mode === 'Mock-Up') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    }

    const videoElement = videoRef.current;
    const handlePlay = () => {
      const draw = () => {
        if (videoElement && !videoElement.paused && !videoElement.ended) {
          drawOverlay();
          requestAnimationFrame(draw);
        }
      };
      draw();
    };

    videoElement?.addEventListener('play', handlePlay);
    return () => videoElement?.removeEventListener('play', handlePlay);
  }, [mode, drawOverlay]);

  useEffect(() => {
    if (mode === 'AR Overlay' && aPlaneRef.current) {
        aPlaneRef.current.setAttribute('material', 'opacity', opacity);
    }
  }, [opacity, mode]);

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
        <input type="file" id="image-loader-hidden" accept="image/*" style={{ display: 'none' }} onChange={handleImageLoad} />

        {(mode === 'Image Trace' || mode === 'Mock-Up') && (
          <div className="video-container">
            <video ref={videoRef} id="camera-feed" playsInline />
            <canvas ref={canvasRef} id="overlay-canvas" />
          </div>
        )}

        {mode === 'AR Overlay' && (
          <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <a-marker preset="hiro">
              <a-plane ref={aPlaneRef} position="0 0 0" rotation="-90 0 0" width="1" height="1" material="opacity: 0.5; transparent: true;"></a-plane>
            </a-marker>
            <a-entity camera></a-entity>
          </a-scene>
        )}
      </main>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOpenCv } from 'opencv-react-ts';
import AzNavRail from './components/AzNavRail.jsx';
import SliderDialog from './SliderDialog';
import Perspective from 'perspectivets';
import { ARCanvas, ARButton } from '@react-three/xr';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

function App() {
  // UI State
  const [mode, setMode] = useState('Image Trace');
  const [opacity, setOpacity] = useState(0.5);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isWarpActive, setIsWarpActive] = useState(false);
  const [activeSlider, setActiveSlider] = useState(null);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [isArLocked, setIsArLocked] = useState(false);

  // Data State
  const [overlayImage, setOverlayImage] = useState(null);
  const [warpPoints, setWarpPoints] = useState(null);
  const [warpHistory, setWarpHistory] = useState([]);
  const [warpHistoryIndex, setWarpHistoryIndex] = useState(-1);
  const [markerFingerprint, setMarkerFingerprint] = useState(null);
  const [homography, setHomography] = useState(null);

  // Hooks
  const { cv } = useOpenCv();

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const imageInputRef = useRef(null);
  const loadInputRef = useRef(null);
  const planeRef = useRef();

  const overlayTexture = useMemo(() => {
    if (!overlayImage) return null;
    return new THREE.TextureLoader().load(overlayImage.src);
  }, [overlayImage]);


  const sliderConfig = {
    Opacity: { value: opacity, min: 0, max: 1, step: 0.01, setter: setOpacity },
    Saturation: { value: saturation, min: 0, max: 2, step: 0.01, setter: setSaturation },
    Contrast: { value: contrast, min: 0, max: 2, step: 0.01, setter: setContrast },
  };

  const handleUndo = () => {
    if (warpHistoryIndex > 0) {
      const newIndex = warpHistoryIndex - 1;
      setWarpHistoryIndex(newIndex);
      setWarpPoints(warpHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (warpHistoryIndex < warpHistory.length - 1) {
      const newIndex = warpHistoryIndex + 1;
      setWarpHistoryIndex(newIndex);
      setWarpPoints(warpHistory[newIndex]);
    }
  };

  const handleReset = () => {
    if (warpHistory.length > 0) {
      const initialPoints = warpHistory[0];
      setWarpPoints(initialPoints);
      const newHistory = [...warpHistory.slice(0, warpHistoryIndex + 1), initialPoints];
      setWarpHistory(newHistory);
      setWarpHistoryIndex(newHistory.length - 1);
    }
  };

  const handleSave = () => {
    const keypoints = [];
    if (markerFingerprint) {
      for (let i = 0; i < markerFingerprint.keypoints.size(); i++) {
        const kp = markerFingerprint.keypoints.get(i);
        keypoints.push({
          pt: { x: kp.pt.x, y: kp.pt.y },
          size: kp.size,
          angle: kp.angle,
          response: kp.response,
          octave: kp.octave,
          class_id: kp.class_id,
        });
      }
    }

    const state = {
        mode,
        opacity,
        saturation,
        contrast,
        isWarpActive,
        overlayImageSrc: imageRef.current.src,
        warpPoints,
        warpHistory,
        warpHistoryIndex,
        markerFingerprint: markerFingerprint ? {
          keypoints,
          descriptors: {
            rows: markerFingerprint.descriptors.rows,
            cols: markerFingerprint.descriptors.cols,
            type: markerFingerprint.descriptors.type(),
            data: Buffer.from(markerFingerprint.descriptors.data).toString('base64'),
          },
        } : null,
    };

    const stateStr = JSON.stringify(state, null, 2);
    const blob = new Blob([stateStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graffiti-state.grf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const state = JSON.parse(event.target.result);
            setMode(state.mode);
            setOpacity(state.opacity);
            setSaturation(state.saturation);
            setContrast(state.contrast);
            setIsWarpActive(state.isWarpActive);
            setWarpPoints(state.warpPoints);
            setWarpHistory(state.warpHistory);
            setWarpHistoryIndex(state.warpHistoryIndex);

            if (state.markerFingerprint && cv) {
              const keypoints = new cv.KeyPointVector();
              state.markerFingerprint.keypoints.forEach(kp => {
                keypoints.push_back(new cv.KeyPoint(kp.pt.x, kp.pt.y, kp.size, kp.angle, kp.response, kp.octave, kp.class_id));
              });

              const matData = new Uint8Array(Buffer.from(state.markerFingerprint.descriptors.data, 'base64'));
              const descriptors = cv.matFromArray(state.markerFingerprint.descriptors.rows, state.markerFingerprint.descriptors.cols, state.markerFingerprint.descriptors.type, matData);

              setMarkerFingerprint({ keypoints, descriptors });
            }

            if (state.overlayImageSrc) {
                imageRef.current.onload = () => {
                    setOverlayImage(imageRef.current);
                };
                imageRef.current.src = state.overlayImageSrc;
            } else {
                setOverlayImage(null);
            }

        } catch (err) {
            console.error("Error loading state file:", err);
            alert("Failed to load state file. It may be corrupted.");
        }
    };
    reader.readAsText(file);
  };

  const handleCaptureMarks = () => {
    if (!cv || !videoRef.current) return;
    const video = videoRef.current;
    const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    const cap = new cv.VideoCapture(video);
    cap.read(src);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const orb = new cv.ORB();
    const keypoints = new cv.KeyPointVector();
    const descriptors = new cv.Mat();
    orb.detectAndCompute(gray, new cv.Mat(), keypoints, descriptors);

    setMarkerFingerprint({ keypoints, descriptors });

    src.delete();
    gray.delete();
    orb.delete();
    console.log("Marker fingerprint captured.");
  };

  const navItems = React.useMemo(() => {
    const baseItems = [
      { id: 'mode-cycler', text: 'Mode', isRailItem: true, isCycler: true, options: ['Image Trace', 'AR Overlay', 'Mock-Up'], selectedOption: mode, onClick: setMode },
      { id: 'load-image', text: 'Image', isRailItem: true, onClick: () => imageInputRef.current?.click() },
      { id: 'save', text: 'Save', isRailItem: true, onClick: handleSave },
      { id: 'load', text: 'Load', isRailItem: true, onClick: () => loadInputRef.current?.click() },
    ];

    const modeItems = {
      'Image Trace': [
        { id: 'opacity', text: 'Opacity', onClick: () => setActiveSlider('Opacity') },
        { id: 'saturation', text: 'Saturation', onClick: () => setActiveSlider('Saturation') },
        { id: 'contrast', text: 'Contrast', onClick: () => setActiveSlider('Contrast') },
      ],
      'AR Overlay': [
        { id: 'opacity', text: 'Opacity', onClick: () => setActiveSlider('Opacity') },
        { id: 'saturation', text: 'Saturation', onClick: () => setActiveSlider('Saturation') },
        { id: 'contrast', text: 'Contrast', onClick: () => setActiveSlider('Contrast') },
        { id: 'capture-marks', text: 'Capture Marks', onClick: handleCaptureMarks },
        { id: 'lock', text: 'Lock/Unlock', isToggle: true, isChecked: isArLocked, toggleOnText: 'Unlock', toggleOffText: 'Lock', onClick: () => setIsArLocked(!isArLocked) },
      ],
      'Mock-Up': [
        { id: 'opacity', text: 'Opacity', onClick: () => setActiveSlider('Opacity') },
        { id: 'warp', text: 'Warp', isToggle: true, isChecked: isWarpActive, toggleOnText: 'Apply Warp', toggleOffText: 'Warp', onClick: () => setIsWarpActive(!isWarpActive) },
        { id: 'undo', text: 'Undo', onClick: handleUndo },
        { id: 'redo', text: 'Redo', onClick: handleRedo },
        { id: 'reset', text: 'Reset', onClick: handleReset },
      ]
    };

    return [...baseItems, ...(modeItems[mode] || [])];
  }, [mode, isWarpActive, warpHistoryIndex, warpHistory.length, isArLocked]);

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

  const drawTraceOverlay = useCallback(() => {
    if (!overlayImage || !canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }, [overlayImage, opacity, saturation, contrast]);

  // Effect for managing camera stream
  useEffect(() => {
    const videoElement = videoRef.current;
    let stream;

    if (mode === 'Image Trace' || mode === 'Mock-Up' || mode === 'AR Overlay') {
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
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [mode]);

  // Effect for real-time tracking in AR mode
  useEffect(() => {
    let animationFrameId;

    if (mode === 'AR Overlay' && cv && markerFingerprint) {
      const orb = new cv.ORB();
      const bf = new cv.BFMatcher(cv.NORM_HAMMING, true);
      const video = videoRef.current;
      const cap = new cv.VideoCapture(video);

      const processVideo = () => {
        try {
          const frame = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
          cap.read(frame);
          if (frame.empty()) {
            frame.delete();
            animationFrameId = requestAnimationFrame(processVideo);
            return;
          }
          const gray = new cv.Mat();
          cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

          const kp2 = new cv.KeyPointVector();
          const des2 = new cv.Mat();
          orb.detectAndCompute(gray, new cv.Mat(), kp2, des2);

          if (des2.rows > 0) {
            const matches = new cv.DMatchVectorVector();
            bf.knnMatch(markerFingerprint.descriptors, des2, matches, 2);

            const good_matches = [];
            for (let i = 0; i < matches.size(); ++i) {
                const match = matches.get(i);
                if (match.size() > 1) {
                    const m = match.get(0);
                    const n = match.get(1);
                    if (m.distance < 0.75 * n.distance) {
                        good_matches.push(m);
                    }
                }
            }

            if (good_matches.length > 10) {
                const srcPts = [];
                const dstPts = [];
                for (let i = 0; i < good_matches.length; i++) {
                    srcPts.push(markerFingerprint.keypoints.get(good_matches[i].queryIdx).pt.x);
                    srcPts.push(markerFingerprint.keypoints.get(good_matches[i].queryIdx).pt.y);
                    dstPts.push(kp2.get(good_matches[i].trainIdx).pt.x);
                    dstPts.push(kp2.get(good_matches[i].trainIdx).pt.y);
                }
                const srcMat = cv.matFromArray(srcPts.length / 2, 1, cv.CV_32FC2, srcPts);
                const dstMat = cv.matFromArray(dstPts.length / 2, 1, cv.CV_32FC2, dstPts);
                const h = cv.findHomography(srcMat, dstMat, cv.RANSAC);
                if (h && !h.empty()) {
                    setHomography(h.data64F);
                }
                h?.delete();
                srcMat.delete();
                dstMat.delete();
            }
          }

          frame.delete();
          gray.delete();
          kp2.delete();
          des2.delete();
          matches.delete();
        } catch (err) {
          console.error(err);
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };
      processVideo();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, cv, markerFingerprint]);

  // Effect to apply homography to the plane
  useEffect(() => {
    if (planeRef.current && homography && !isArLocked) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(homography);
      planeRef.current.matrix.copy(matrix);
      planeRef.current.matrix.decompose(
        planeRef.current.position,
        planeRef.current.quaternion,
        planeRef.current.scale
      );
    }
  }, [homography, isArLocked]);

  // Effect for Image Trace drawing loop
  useEffect(() => {
    let animationFrameId;
    const videoElement = videoRef.current;

    const drawLoop = () => {
      if (videoElement && !videoElement.paused && !videoElement.ended) {
        drawTraceOverlay();
      }
      animationFrameId = requestAnimationFrame(drawLoop);
    };

    if (mode === 'Image Trace') {
      drawLoop();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, drawTraceOverlay]);

  // Effect for Mock-Up mode drawing
  useEffect(() => {
    if (mode !== 'Mock-Up' || !canvasRef.current || !overlayImage || !warpPoints) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;

    const p = new Perspective(ctx, imageRef.current);
    p.draw({
        topLeftX: warpPoints.topLeft.x, topLeftY: warpPoints.topLeft.y,
        topRightX: warpPoints.topRight.x, topRightY: warpPoints.topRight.y,
        bottomRightX: warpPoints.bottomRight.x, bottomRightY: warpPoints.bottomRight.y,
        bottomLeftX: warpPoints.bottomLeft.x, bottomLeftY: warpPoints.bottomLeft.y,
    });
    ctx.filter = 'none';

    if (isWarpActive) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      Object.values(warpPoints).forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [mode, overlayImage, warpPoints, isWarpActive, opacity, saturation, contrast]);

  // Initialize warp points
  useEffect(() => {
    if (mode === 'Mock-Up' && overlayImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const imageWidth = overlayImage.width;
      const imageHeight = overlayImage.height;
      const canvasWidth = canvas.parentElement.clientWidth;
      const canvasHeight = canvas.parentElement.clientHeight;

      const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) * 0.8;
      const scaledWidth = imageWidth * scale;
      const scaledHeight = imageHeight * scale;

      const startX = (canvasWidth - scaledWidth) / 2;
      const startY = (canvasHeight - scaledHeight) / 2;

      const initialPoints = {
        topLeft: { x: startX, y: startY },
        topRight: { x: startX + scaledWidth, y: startY },
        bottomRight: { x: startX + scaledWidth, y: startY + scaledHeight },
        bottomLeft: { x: startX, y: startY + scaledHeight },
      };
      setWarpPoints(initialPoints);
      setWarpHistory([initialPoints]);
      setWarpHistoryIndex(0);
    }
  }, [mode, overlayImage]);

  const handleMouseDown = (e) => {
    if (!isWarpActive || !warpPoints) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const key in warpPoints) {
      const point = warpPoints[key];
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      if (distance < 15) {
        setDraggingPoint(key);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isWarpActive || !draggingPoint) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setWarpPoints(prev => ({ ...prev, [draggingPoint]: { x, y } }));
  };

  const handleMouseUp = () => {
    if (draggingPoint) {
      const newHistory = [...warpHistory.slice(0, warpHistoryIndex + 1), warpPoints];
      setWarpHistory(newHistory);
      setWarpHistoryIndex(newHistory.length - 1);
    }
    setDraggingPoint(null);
  };

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
        <input type="file" ref={loadInputRef} style={{ display: 'none' }} accept=".grf" onChange={handleLoad} />

        {(mode === 'Image Trace' || mode === 'Mock-Up' || mode === 'AR Overlay') && (
          <div className="video-container">
            <video ref={videoRef} id="camera-feed" playsInline />
            <canvas ref={canvasRef} id="overlay-canvas" className={isWarpActive ? 'warp-active' : ''} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} />
          </div>
        )}

        {mode === 'AR Overlay' && (
          <>
            <ARButton />
            <ARCanvas>
              <Plane ref={planeRef} args={[1, 1]}>
                <meshStandardMaterial map={overlayTexture} transparent opacity={opacity} />
              </Plane>
            </ARCanvas>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
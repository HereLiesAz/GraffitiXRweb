import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOpenCv } from 'opencv-react-ts';
import { getPerspectiveTransform, warpPerspective } from 'perspectivets';
import AzNavRail from './components/lib/AzNavRail.jsx';
import SliderDialog from './SliderDialog';

const MODES = ['Image Trace', 'AR Overlay', 'Mock Up'];

function App() {
  const { cv } = useOpenCv();
  // UI State
  const [mode, setMode] = useState(MODES[0]);
  const [opacity, setOpacity] = useState(0.5);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [activeSlider, setActiveSlider] = useState(null);

  const [isArLocked, setIsArLocked] = useState(false);

  // Data State
  const [overlayImage, setOverlayImage] = useState(null);
  const [markerFingerprint, setMarkerFingerprint] = useState(null);
  const [homography, setHomography] = useState(null);
  const [lastGoodHomography, setLastGoodHomography] = useState(null);
  const [isWarping, setIsWarping] = useState(false);
  const [warpCorners, setWarpCorners] = useState({
    tl: { x: 100, y: 100 },
    tr: { x: 400, y: 100 },
    br: { x: 400, y: 400 },
    bl: { x: 100, y: 400 },
  });
  const [warpHistory, setWarpHistory] = useState([warpCorners]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const imageInputRef = useRef(null);
  const loadInputRef = useRef(null);

  const handleWarpToggle = () => setIsWarping(!isWarping);

  const handleUndoWarp = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setWarpCorners(warpHistory[historyIndex - 1]);
    }
  };

  const handleRedoWarp = () => {
    if (historyIndex < warpHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setWarpCorners(warpHistory[historyIndex + 1]);
    }
  };

  const handleResetWarp = () => {
    const initialCorners = {
      tl: { x: 100, y: 100 },
      tr: { x: 400, y: 100 },
      br: { x: 400, y: 400 },
      bl: { x: 100, y: 400 },
    };
    setWarpCorners(initialCorners);
    setWarpHistory([initialCorners]);
    setHistoryIndex(0);
  };

  const handleMouseDown = (e) => {
    if (!isWarping) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const handleSize = 10;
    for (const key in warpCorners) {
      const corner = warpCorners[key];
      if (Math.abs(corner.x - offsetX) < handleSize && Math.abs(corner.y - offsetY) < handleSize) {
        e.target.dataset.dragging = key;
        break;
      }
    }
  };

  const handleMouseMove = (e) => {
    const draggingCorner = e.target.dataset.dragging;
    if (!isWarping || !draggingCorner) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setWarpCorners(prev => ({
      ...prev,
      [draggingCorner]: { x: offsetX, y: offsetY },
    }));
  };

  const handleMouseUp = (e) => {
    if (e.target.dataset.dragging) {
      const newHistory = warpHistory.slice(0, historyIndex + 1);
      setWarpHistory([...newHistory, warpCorners]);
      setHistoryIndex(newHistory.length);
    }
    e.target.dataset.dragging = '';
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

    // Visual feedback for capture
    alert(`${keypoints.size()} keypoints captured.`);

    // Cleanup
    src.delete();
    gray.delete();
    orb.delete();
  };

  const handleSave = () => {
    const state = {
      mode,
      opacity,
      saturation,
      contrast,
      overlayImageSrc: imageRef.current.src,
      markerFingerprint: markerFingerprint ? {
        keypoints: Array.from({ length: markerFingerprint.keypoints.size() }, (_, i) => {
          const kp = markerFingerprint.keypoints.get(i);
          return {
            pt: { x: kp.pt.x, y: kp.pt.y },
            size: kp.size,
            angle: kp.angle,
            response: kp.response,
            octave: kp.octave,
            class_id: kp.class_id,
          };
        }),
        descriptors: {
          rows: markerFingerprint.descriptors.rows,
          cols: markerFingerprint.descriptors.cols,
          type: markerFingerprint.descriptors.type(),
          data: Array.from(markerFingerprint.descriptors.data),
        },
      } : null,
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graffiti-xr-state.grf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const state = JSON.parse(event.target.result);
          setMode(state.mode || MODES[0]);
          setOpacity(state.opacity || 0.5);
          setSaturation(state.saturation || 1);
          setContrast(state.contrast || 1);
          if (state.overlayImageSrc) {
            imageRef.current.src = state.overlayImageSrc;
            imageRef.current.onload = () => {
              setOverlayImage(imageRef.current);
            };
          }
          if (state.markerFingerprint && cv) {
            const { keypoints: kpData, descriptors: descData } = state.markerFingerprint;

            const keypoints = new cv.KeyPointVector();
            kpData.forEach(kp => {
              keypoints.push_back(new cv.KeyPoint(kp.pt.x, kp.pt.y, kp.size, kp.angle, kp.response, kp.octave, kp.class_id));
            });

            const descriptors = cv.matFromArray(descData.rows, descData.cols, descData.type, descData.data);

            setMarkerFingerprint({ keypoints, descriptors });
          } else {
            setMarkerFingerprint(null);
          }
        } catch (error) {
          console.error("Failed to load or parse state file:", error);
          alert("Error: Could not load or parse the state file.");
        }
      };
      reader.readAsText(file);
    }
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

  const sliderConfig = {
    Opacity: { value: opacity, min: 0, max: 1, step: 0.01, setter: setOpacity, defaultValue: 0.5 },
    Saturation: { value: saturation, min: 0, max: 2, step: 0.01, setter: setSaturation, defaultValue: 1 },
    Contrast: { value: contrast, min: 0, max: 2, step: 0.01, setter: setContrast, defaultValue: 1 },
  };

  const navItems = useMemo(() => {
    const baseItems = [
      {
        id: 'mode',
        text: `Mode\n${mode}`,
        isRailItem: true,
        isCycler: true,
        options: MODES,
        selectedOption: mode,
        onClick: setMode,
      },
      { id: 'save', text: 'Save', isRailItem: true, onClick: handleSave },
      { id: 'load', text: 'Load', isRailItem: true, onClick: () => loadInputRef.current?.click() },
      { id: 'load-image', text: 'Image', isRailItem: true, onClick: () => imageInputRef.current?.click() },
      { id: 'opacity', text: 'Opacity', isRailItem: true, onClick: () => setActiveSlider('Opacity') },
      { id: 'saturation', text: 'Saturation', isRailItem: true, onClick: () => setActiveSlider('Saturation') },
      { id: 'contrast', text: 'Contrast', isRailItem: true, onClick: () => setActiveSlider('Contrast') },
    ];

    if (mode === 'AR Overlay') {
      baseItems.push(
        { id: 'capture-marks', text: 'Capture Marks', isRailItem: true, onClick: handleCaptureMarks },
        {
          id: 'ar-lock',
          text: isArLocked ? 'Unlock' : 'Lock',
          isRailItem: true,
          isToggle: true,
          isChecked: isArLocked,
          onClick: () => setIsArLocked(!isArLocked),
        }
      );
    }

    if (mode === 'Mock Up') {
      baseItems.push(
        { id: 'warp', text: isWarping ? 'Stop' : 'Warp', isRailItem: true, onClick: handleWarpToggle },
        { id: 'undo', text: 'Undo', isRailItem: true, onClick: handleUndoWarp },
        { id: 'redo', text: 'Redo', isRailItem: true, onClick: handleRedoWarp },
        { id: 'reset', text: 'Reset', isRailItem: true, onClick: handleResetWarp }
      );
    }

    return baseItems;
  }, [mode, isArLocked, isWarping]);

  const railSettings = { appName: 'GraffitiXR', displayAppNameInHeader: true };

  const drawOverlay = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === 'AR Overlay' && markerFingerprint && overlayImage && cv) {
      const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
      const cap = new cv.VideoCapture(video);
      cap.read(src);

      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      const orb = new cv.ORB();
      const keypoints2 = new cv.KeyPointVector();
      const descriptors2 = new cv.Mat();
      orb.detectAndCompute(gray, new cv.Mat(), keypoints2, descriptors2);

      const bf = new cv.BFMatcher();
      const matches = new cv.DMatchVectorVector();
      bf.knnMatch(markerFingerprint.descriptors, descriptors2, matches, 2);

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

      let h = null;
      if (good_matches.length > 10) {
        const srcPts = [];
        const dstPts = [];
        for (let i = 0; i < good_matches.length; i++) {
          srcPts.push(markerFingerprint.keypoints.get(good_matches[i].queryIdx).pt.x);
          srcPts.push(markerFingerprint.keypoints.get(good_matches[i].queryIdx).pt.y);
          dstPts.push(keypoints2.get(good_matches[i].trainIdx).pt.x);
          dstPts.push(keypoints2.get(good_matches[i].trainIdx).pt.y);
        }
        const srcMat = cv.matFromArray(srcPts.length / 2, 2, cv.CV_32F, srcPts);
        const dstMat = cv.matFromArray(dstPts.length / 2, 2, cv.CV_32F, dstPts);
        h = cv.findHomography(srcMat, dstMat, cv.RANSAC);
        if (h && !h.empty()) {
          setHomography(h);
          setLastGoodHomography(h);
        }
        srcMat.delete();
        dstMat.delete();
      } else {
        setHomography(null);
      }

      const currentHomography = isArLocked ? lastGoodHomography : homography;

      if (currentHomography && !currentHomography.empty()) {
        const h_data = currentHomography.data64F;
        ctx.save();
        ctx.transform(h_data[0], h_data[3], h_data[1], h_data[4], h_data[2], h_data[5]);
        ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
        ctx.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
        ctx.restore();
      }

      // Cleanup
      src.delete();
      gray.delete();
      keypoints2.delete();
      descriptors2.delete();
      bf.delete();
      matches.delete();
      orb.delete();
    } else if (mode === 'Mock Up' && overlayImage) {
      const srcCorners = [
        { x: 0, y: 0 }, // tl
        { x: overlayImage.width, y: 0 }, // tr
        { x: overlayImage.width, y: overlayImage.height }, // br
        { x: 0, y: overlayImage.height }, // bl
      ];

      const dstCorners = [warpCorners.tl, warpCorners.tr, warpCorners.br, warpCorners.bl];

      const transform = getPerspectiveTransform(srcCorners, dstCorners);

      ctx.save();
      ctx.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5]);
      ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
      ctx.drawImage(overlayImage, 0, 0);
      ctx.restore();

      if (isWarping) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        Object.values(warpCorners).forEach(corner => {
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, 10, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    } else if (overlayImage) { // Fallback for Image Trace mode
      ctx.filter = `opacity(${opacity}) saturate(${saturation}) contrast(${contrast})`;
      ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    }
  }, [cv, mode, markerFingerprint, overlayImage, opacity, saturation, contrast, isArLocked, homography, lastGoodHomography, isWarping, warpCorners]);

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
        <input type="file" ref={loadInputRef} style={{ display: 'none' }} accept=".grf" onChange={handleLoad} />
        <div className="video-container">
          <video ref={videoRef} id="camera-feed" playsInline />
          <canvas
            ref={canvasRef}
            id="overlay-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
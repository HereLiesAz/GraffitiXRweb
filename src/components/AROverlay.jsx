import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ARCanvas, ARButton, useHitTest } from '@react-three/xr';
import { Plane as DreiPlane, Ring } from '@react-three/drei';
import * as THREE from 'three';

const ImagePlane = ({ texture, position, rotation }) => {
  const [size, setSize] = useState({ width: 1, height: 1 });

  useEffect(() => {
    if (texture && texture.image) {
      const { width, height } = texture.image;
      const aspectRatio = width / height;
      const displayWidth = aspectRatio > 1 ? 1.0 : aspectRatio;
      const displayHeight = aspectRatio > 1 ? 1.0 / aspectRatio : 1.0;
      setSize({ width: displayWidth, height: displayHeight });
    }
  }, [texture]);

  return (
    <DreiPlane args={[size.width, size.height]} position={position} quaternion={rotation}>
      <meshStandardMaterial map={texture} transparent opacity={0.9} side={THREE.DoubleSide} />
    </DreiPlane>
  );
};

ImagePlane.propTypes = {
  texture: PropTypes.object,
  position: PropTypes.object,
  rotation: PropTypes.object,
};

function ReticleAndPlacement({ texture }) {
  const reticleRef = useRef();
  const [placements, setPlacements] = useState([]);

  useHitTest((hitMatrix, hit) => {
    if (hit) {
      reticleRef.current.visible = true;
      hitMatrix.decompose(reticleRef.current.position, reticleRef.current.quaternion, reticleRef.current.scale);
    } else {
      reticleRef.current.visible = false;
    }
  });

  const handleSelect = () => {
    if (reticleRef.current.visible && texture) {
      const position = reticleRef.current.position.clone();
      const rotation = reticleRef.current.quaternion.clone();
      setPlacements([...placements, { position, rotation, texture }]);
    }
  };

  return (
    <>
      <mesh ref={reticleRef} rotation-x={-Math.PI / 2} onClick={handleSelect}>
        <Ring args={[0.05, 0.1, 32]}>
          <meshBasicMaterial color="white" />
        </Ring>
      </mesh>
      {placements.map((p, i) => (
        <ImagePlane key={i} texture={p.texture} position={p.position} rotation={p.rotation} />
      ))}
    </>
  );
}

ReticleAndPlacement.propTypes = {
  texture: PropTypes.object,
};

const AROverlay = ({ overlayImage }) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (overlayImage) {
      const loader = new THREE.TextureLoader();
      setTexture(loader.load(overlayImage.src));
    } else {
      setTexture(null);
    }
  }, [overlayImage]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ARButton />
      <ARCanvas sessionInit={{ requiredFeatures: ['hit-test'] }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />
        {texture && <ReticleAndPlacement texture={texture} />}
      </ARCanvas>
    </div>
  );
};

AROverlay.propTypes = {
  overlayImage: PropTypes.object,
};

export default AROverlay;
import React from 'react';
import PropTypes from 'prop-types';
import './Onboarding.css';

const Onboarding = ({ onDismiss }) => {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <h2>Welcome to GraffitiXR!</h2>
        <p>This application helps you visualize your artwork in the real world. Here are the available modes:</p>
        <ul>
          <li><strong>Image Trace:</strong> Overlay an image on your camera feed to trace it onto a physical surface. Your device should be on a tripod for this.</li>
          <li><strong>Mock-Up:</strong> Place your artwork on a static photo of a surface and apply a perspective warp to see how it fits.</li>
          <li><strong>AR Overlay:</strong> Use augmented reality to project your artwork directly onto walls and other surfaces in your environment.</li>
        </ul>
        <button onClick={onDismiss}>Get Started</button>
      </div>
    </div>
  );
};

Onboarding.propTypes = {
  onDismiss: PropTypes.func.isRequired,
};

export default Onboarding;
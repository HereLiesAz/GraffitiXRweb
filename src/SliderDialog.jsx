import React from 'react';

const SliderDialog = ({ title, value, min, max, step, onChange, onClose }) => {
  if (!title) return null;

  return (
    <div className="slider-dialog-overlay">
      <div className="slider-dialog">
        <h3>{title}</h3>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SliderDialog;
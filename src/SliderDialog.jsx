import React from 'react';
import PropTypes from 'prop-types';
import './SliderDialog.css';

const SliderDialog = ({ title, value, min, max, step, defaultValue, onChange, onClose }) => {
  if (!title) return null;

  const handleReset = () => {
    onChange(defaultValue);
  };

  return (
    <div className="slider-dialog-overlay" onClick={onClose}>
      <div className="slider-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="slider-control">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
          <span className="slider-value">{value.toFixed(2)}</span>
        </div>
        <div className="dialog-buttons">
          <button className="reset-button" onClick={handleReset}>Reset</button>
          <button className="close-button" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

SliderDialog.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  defaultValue: PropTypes.number,
  onChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default SliderDialog;
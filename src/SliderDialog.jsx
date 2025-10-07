import React from 'react';
import PropTypes from 'prop-types';
import './SliderDialog.css';

/**
 * A modal dialog for adjusting a numerical value with a slider.
 *
 * This component provides a customizable slider within a modal overlay. It includes
 * a title, a range input, a numerical display of the current value, a reset button,
 * and a button to close the dialog.
 *
 * @param {object} props - The component props.
 * @param {string} props.title - The title displayed at the top of the dialog. If null, the component does not render.
 * @param {number} props.value - The current value of the slider.
 * @param {number} props.min - The minimum value of the slider.
 * @param {number} props.max - The maximum value of the slider.
 * @param {number} props.step - The step increment of the slider.
 * @param {number} props.defaultValue - The value to reset to when the reset button is clicked.
 * @param {function} props.onChange - The callback function invoked when the slider value changes.
 * @param {function} props.onClose - The callback function invoked when the dialog is closed.
 */
const SliderDialog = ({ title, value, min, max, step, defaultValue, onChange, onClose }) => {
  if (!title) return null;

  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  return (
    <div className="slider-dialog-overlay" onClick={onClose}>
      <div
        className="slider-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h3 id="dialog-title">{title}</h3>
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
  value: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  defaultValue: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SliderDialog;
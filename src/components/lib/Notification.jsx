import React from 'react';
import PropTypes from 'prop-types';
import './Notification.css';

/**
 * A non-blocking notification component that displays a message for a few seconds.
 *
 * @param {object} props - The component props.
 * @param {string} props.message - The message to be displayed in the notification.
 */
const Notification = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="notification">
      {message}
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string,
};

export default Notification;
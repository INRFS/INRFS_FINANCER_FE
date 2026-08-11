import React from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      className={`common-btn common-btn-${variant} common-btn-${size} ${fullWidth ? 'common-btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="common-btn-icon" size={size === 'small' ? 16 : 18} />}
      {children}
    </button>
  );
}

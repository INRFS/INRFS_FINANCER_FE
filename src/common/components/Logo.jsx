import React from 'react';
import './Logo.css';

export default function Logo({ size = 'medium', subtitle = true, variant = 'dark' }) {
  return (
    <div className={`common-logo common-logo-${size} common-logo-${variant}`}>
      <div className="common-logo-icon">
        <span className="common-logo-symbol">₹</span>
      </div>
      <div className="common-logo-text">
        <span className="common-logo-brand">INRFS</span>
        {subtitle && <span className="common-logo-sub">Financer Platform</span>}
      </div>
    </div>
  );
}

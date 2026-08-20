import React from 'react';
import logo from '../../assets/logo.png';
import './Logo.css';

export default function Logo({ size = 'medium', subtitle = true, variant = 'dark' }) {
  return (
    <div className={`common-logo common-logo-${size} common-logo-${variant}`}>
      <img className="common-logo-image" src={logo} alt="INRFS" />
      {subtitle && <span className="common-logo-sub">Financer Platform</span>}
    </div>
  );
}

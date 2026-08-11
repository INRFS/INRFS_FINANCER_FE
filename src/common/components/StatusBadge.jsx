import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status, label }) {
  const normalized = (status || label || '').toLowerCase().replace(/\s+/g, '-');
  
  return (
    <span className={`common-badge common-badge-${normalized}`}>
      {label || status}
    </span>
  );
}

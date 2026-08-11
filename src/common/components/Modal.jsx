import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '550px' }) {
  if (!isOpen) return null;

  return (
    <div className="common-modal-overlay" onClick={onClose}>
      <div
        className="common-modal-container animate-fade-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="common-modal-header">
          <h3 className="common-modal-title">{title}</h3>
          <button className="common-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="common-modal-content">{children}</div>
      </div>
    </div>
  );
}

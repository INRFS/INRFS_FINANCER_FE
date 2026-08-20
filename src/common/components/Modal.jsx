import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '550px' }) {
  const titleId = useId();
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const handleKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab') return;
      const focusable = containerRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    requestAnimationFrame(() => containerRef.current?.querySelector('input, select, textarea, button')?.focus());
    return () => { document.removeEventListener('keydown', handleKey); previouslyFocused?.focus?.(); };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="common-modal-overlay" onClick={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="common-modal-container animate-fade-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="common-modal-header">
          <h3 id={titleId} className="common-modal-title">{title}</h3>
          <button type="button" className="common-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <div className="common-modal-content">{children}</div>
      </div>
    </div>
  );
}

import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchInput.css';

export default function SearchInput({ value, onChange, placeholder = 'Search...', onClear }) {
  return (
    <div className="common-search-wrapper">
      <Search size={18} className="common-search-icon" />
      <input
        type="text"
        className="common-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="common-search-clear" onClick={onClear || (() => onChange(''))}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

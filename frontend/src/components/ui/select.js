import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ children, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find(child => child.type === SelectTrigger);
  const content = childrenArray.find(child => child.type === SelectContent);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {React.cloneElement(trigger, {
        onClick: () => setIsOpen(!isOpen),
        isOpen
      })}
      {isOpen && React.cloneElement(content, {
        onSelect: (selectedValue) => {
          onChange(selectedValue);
          setIsOpen(false);
        }
      })}
    </div>
  );
};

export const SelectTrigger = ({ children, onClick, isOpen, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center ${className}`}
    >
      <span>{children}</span>
      <svg
        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export const SelectContent = ({ children, onSelect, className = "" }) => {
  return (
    <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { onSelect })
      )}
    </div>
  );
};

export const SelectItem = ({ children, value, onSelect, className = "" }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}; 
import React from 'react';

export const Switch = ({ checked, onCheckedChange, label, className = "", ...props }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        {...props}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && (
        <span className="ml-2 text-sm text-gray-900">{label}</span>
      )}
    </div>
  );
}; 
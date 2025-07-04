// components/ui/textarea.js
import React from 'react';

export const Textarea = ({ className = '', error, ...props }) => (
  <textarea
    className={`border rounded text-gray-500 text-sm px-3 py-2 w-full ${
      error ? 'border-red-500' : 'border-gray-300'
    } ${className}`}
    {...props}
  />
);

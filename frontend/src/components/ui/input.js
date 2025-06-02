// components/ui/input.js
import React from 'react';

export const Input = ({ ...props }) => (
  <input className="border rounded px-3 py-2 w-full text-gray-500 text-sm" {...props} />
);
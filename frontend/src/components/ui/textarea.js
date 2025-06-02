// components/ui/textarea.js
import React from 'react';

export const Textarea = ({ ...props }) => (
  <textarea className="border rounded text-gray-500 text-sm px-3 py-2 w-full" {...props} />
);
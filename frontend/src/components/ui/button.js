// components/ui/button.js
import React from 'react';

export const Button = ({ children, ...props }) => (
  <button className="bg-[#343280] text-white px-4 py-2 rounded hover:bg-blue-700" {...props}>
    {children}
  </button>
);

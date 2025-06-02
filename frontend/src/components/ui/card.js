// components/ui/card.js
import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white shadow rounded-xl border border-gray-200">{children}</div>
);

export const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

import React, { useState, createContext, useContext } from 'react';

const SelectContext = createContext();

export const Select = ({ children, onChange }) => {
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);

  const handleSelect = (value) => {
    setSelected(value);
    setOpen(false);
    if (onChange) onChange(value);
  };

  return (
    <SelectContext.Provider value={{ selected, open, setOpen, handleSelect }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = () => {
  const { selected, open, setOpen } = useContext(SelectContext);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="border rounded px-3 py-2 bg-white cursor-pointer flex items-center justify-between"
    >
      <span className="text-gray-500 text-sm">{selected || 'Select an option'}</span>
      <span className="ml-2 text-gray-500">{open ? '▲' : '▼'}</span>
    </div>
  );
};
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = ({ children }) => {
  const { open } = useContext(SelectContext);
  return open ? (
    <div className="absolute mt-1 bg-white border rounded shadow z-10 w-full">
      {children}
    </div>
  ) : null;
};
SelectContent.displayName = 'SelectContent';

export const SelectItem = ({ value, children }) => {
  const { handleSelect } = useContext(SelectContext);
  return (
    <div
      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => handleSelect(value)}
    >
      {children}
    </div>
  );
};
SelectItem.displayName = 'SelectItem';

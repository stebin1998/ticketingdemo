import React, { useState } from 'react';

const TagsInput = ({ tags = [], onChange, placeholder = "Add tags...", className = "", error = false }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`${className}`}>
      <h3 className="mb-1">Tags<span className="text-red-500">*</span></h3>
      <div className={`flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${error ? 'border-red-500' : 'border-gray-300'}`}>
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-500 mt-1">At least one tag is required.</p>
      ) : (
        <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add tags</p>
      )}
    </div>
  );
};

export default TagsInput;

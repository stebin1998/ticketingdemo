import React, { useState, useRef } from 'react';

export default function TagsInput() {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef();

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim() !== '') {
      e.preventDefault();
      const newTag = input.trim().replace(/,$/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      e.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3 className="mb-1">Tags</h3>
      <div className="flex flex-wrap items-center gap-2 border p-2 rounded min-h-[42px]">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 bg-gray-200 text-sm px-2 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-gray-600 hover:text-red-500"
            >
              &times;
            </button>
          </span>
        ))}
        {/* Wrap input in a fixed-width container to avoid shrinkage */}
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press enter..."
            className="text-sm bg-transparent outline-none min-w-[10px] max-w-[200px]"
          />
        </div>
      </div>
    </div>
  );
}

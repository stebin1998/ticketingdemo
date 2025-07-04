// components/ui/switch.js
import React from 'react';

export const Switch = ({ checked, onCheckedChange }) => (
    <label className="inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-out-in ${checked ? 'bg-[#FF2D88]' : 'bg-gray-300'
                }`}
        >
            <span
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-out-in ${checked ? 'translate-x-4' : ''
                    }`}
            ></span>
        </span>

    </label>
);
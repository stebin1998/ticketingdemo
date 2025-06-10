import React, { useState, useRef } from 'react';

function FileUpload() {
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            setFileName(e.dataTransfer.files[0].name);
            const file = e.dataTransfer.files[0];
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <h3 className="mb-2">Event Banner</h3>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current.click()}
                className="relative cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-4 flex items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition"
                style={{ minHeight: '100px' }}
            >
                {fileName ? (
                    <span>{fileName}</span>
                ) : (
                    <span>Drag & drop your image here, or click to select</span>
                )}

                {/* File specs label */}
                <span className="absolute bottom-2 text-bold left-2 text-xs text-gray-400">
                    1200x600
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}

export default FileUpload;

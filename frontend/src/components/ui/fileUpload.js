import React, { useState, useRef } from 'react';
import AuthService from '../../utils/authService';

const FileUpload = ({ onUpload, className = "", hasError = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  // const [uploadedFiles, setUploadedFiles] = useState([]); // Unused for now
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const token = await AuthService.getAuthToken();
      const response = await fetch('http://localhost:4556/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        if (onUpload) onUpload(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      // Use server upload instead of client-side preview
      uploadFile(file);
    });
  };

  const borderColor = hasError
    ? 'border-red-500 text-red-500 hover:border-red-600 hover:text-red-600'
    : 'border-gray-400 text-gray-500 hover:border-indigo-500 hover:text-indigo-600';

  return (
    <div className={`${className}`}>
      <h3 className="mb-2">Event Banner<span className="text-red-500">*</span></h3>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${
          isDragOver ? 'border-blue-500 bg-blue-50' : borderColor
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {uploading ? (
            <p className="text-sm text-blue-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </div>
        <span className="absolute bottom-2 left-2 text-xs text-gray-400 font-bold">
          1200x600
        </span>
      </div>
    </div>
  );
};

export default FileUpload;

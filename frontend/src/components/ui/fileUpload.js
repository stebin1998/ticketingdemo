import React, { useState, useRef } from 'react';
import AuthService from '../../utils/authService';

function FileUpload({ onUpload }) {
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            // Get auth token for file upload
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

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileName(file.name);
            uploadFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setFileName(file.name);
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            uploadFile(file);
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
                {uploading ? (
                    <span>Uploading...</span>
                ) : fileName ? (
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

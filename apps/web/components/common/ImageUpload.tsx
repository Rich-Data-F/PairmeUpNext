'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onUploadSuccess?: (imageUrl: string) => void;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
}

export function ImageUpload({ 
  onUploadSuccess, 
  maxSize = 10485760, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      toast.success('Image uploaded successfully!');
      onUploadSuccess?.(result.url || result.fileId);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or WebP (MAX. 10MB)</p>
            </div>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Uploading...</span>
        </div>
      )}
    </div>
  );
}

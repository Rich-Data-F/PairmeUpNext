"use client";
import { useState, useRef } from 'react';
import { XMarkIcon, CameraIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PhotoUploadProps {
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
}

export interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  source: 'camera' | 'upload';
  sourceInfo?: string;
  file: File;
}

export default function PhotoUpload({ onPhotosChange, maxPhotos = 3 }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null, source: 'camera' | 'upload') => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedPhotos: UploadedPhoto[] = [];

      for (const file of newFiles) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files');
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          continue;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        const thumbnailUrl = url; // For now, use same URL as thumbnail

        const photo: UploadedPhoto = {
          id: `temp-${Date.now()}-${Math.random()}`,
          url,
          thumbnailUrl,
          source,
          file,
          sourceInfo: source === 'camera' ? 'Live photo taken with device camera' : 'Photo uploaded from device',
        };

        uploadedPhotos.push(photo);
      }

      const updatedPhotos = [...photos, ...uploadedPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);

    } catch (err) {
      setError('Failed to process images');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Photos ({photos.length}/{maxPhotos})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCamera}
            disabled={photos.length >= maxPhotos || uploading}
            className="btn btn-sm btn-outline gap-2"
          >
            <CameraIcon className="w-4 h-4" />
            Camera
          </button>
          <button
            type="button"
            onClick={openFileDialog}
            disabled={photos.length >= maxPhotos || uploading}
            className="btn btn-sm btn-outline gap-2"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, 'upload')}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files, 'camera')}
        className="hidden"
      />

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt="Uploaded photo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Authenticity badge */}
              {photo.source === 'camera' && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Live Photo
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload status */}
      {uploading && (
        <div className="text-sm text-blue-600">
          Processing images...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500">
        <p>• Upload up to {maxPhotos} photos</p>
        <p>• Photos taken with camera get a "Live Photo" authenticity badge</p>
        <p>• Supported formats: JPG, PNG, WebP (max 10MB each)</p>
      </div>
    </div>
  );
}

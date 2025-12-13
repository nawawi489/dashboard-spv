import React, { useRef, useState } from 'react';
import { Camera, X, Loader2, ImagePlus } from 'lucide-react';
import { compressImage } from '@utils/imageUtils';
import { MAX_PHOTOS } from '@constants';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
  accept?: string;
  label?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, onPhotosChange, disabled = false, accept = 'image/*', label = 'Bukti Foto' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (photos.length >= MAX_PHOTOS) return;

      setIsProcessing(true);
      const file = e.target.files[0];
      try {
        const base64 = await compressImage(file);
        onPhotosChange([...photos, base64]);
      } catch (err) {
        console.error("Image compression failed", err);
        alert("Failed to process image. Please try again.");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    if (disabled) return;
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  const triggerCamera = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const isSinglePhoto = MAX_PHOTOS === 1;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700">
          {label} <span className="text-slate-400 font-normal">({photos.length}/{MAX_PHOTOS})</span>
        </label>
      </div>

      <div className={`grid gap-3 ${isSinglePhoto ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {photos.map((photo, idx) => (
          <div key={idx} className={`relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group ${isSinglePhoto ? 'aspect-video' : 'aspect-square'}`}>
            <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
            {!disabled && (
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}

        {photos.length < MAX_PHOTOS && !disabled && (
          <button
            onClick={triggerCamera}
            disabled={isProcessing}
            className={`rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 ${isSinglePhoto ? 'aspect-video' : 'aspect-square'}`}
          >
            {isProcessing ? (
              <Loader2 size={32} className="animate-spin text-blue-600" />
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                   <Camera size={isSinglePhoto ? 24 : 20} />
                   <ImagePlus size={isSinglePhoto ? 24 : 20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isSinglePhoto ? 'Kamera / Galeri' : 'Add'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  );
};

export default PhotoUpload;

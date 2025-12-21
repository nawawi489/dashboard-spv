import React, { useState, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileSelect, required = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format gambar tidak didukung');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar (Maks 5MB)');
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let w = img.width;
        let h = img.height;
        const MAX = 1600;
        if (w > h && w > MAX) { h = Math.round(h * (MAX / w)); w = MAX; }
        if (h >= w && h > MAX) { w = Math.round(w * (MAX / h)); h = MAX; }
        canvas.width = w;
        canvas.height = h;
        if (!ctx) { URL.revokeObjectURL(url); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreview(dataUrl);
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        const safeName = file.name.replace(/\.[^.]+$/, '.jpg');
        const sanitized = new File([blob], safeName, { type: 'image/jpeg' });
        setFileName(safeName);
        onFileSelect(sanitized);
        URL.revokeObjectURL(url);
      };
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onFileSelect(null);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!preview ? (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 font-medium">Klik untuk upload gambar</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow-sm">
            <button onClick={handleRemove} type="button" className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-xs truncate">
            <ImageIcon className="inline-block w-3 h-3 mr-1" />
            {fileName}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

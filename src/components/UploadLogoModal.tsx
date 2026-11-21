import React, { useState, useRef } from 'react';
import { X, Upload, Check, Camera, RotateCcw } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { compressImageDataUrl } from '../utils/persistentStorage';

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl: string | null;
  onSaveLogo: (url: string | null) => void;
}

export const UploadLogoModal: React.FC<UploadLogoModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  onSaveLogo,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      let res = event.target?.result;
      if (typeof res === 'string') {
        try {
          res = await compressImageDataUrl(res, 500, 500, 0.88);
        } catch (e) {}
        setLogoPreview(res);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveLogo(logoPreview);
    onClose();
  };

  const handleResetToDefault = () => {
    setLogoPreview(null);
    onSaveLogo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#fffaf6] border border-[#e8c0c8] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fcedf0] border-b border-[#ebd0d6]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#9e4c5b]" />
            <h3 className="font-serif-display text-lg font-bold text-[#5e2632]">
              Customize TeeCake Logo Badge
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <p className="text-xs text-[#6e3b46]">
            Upload your custom circular logo file (such as your TeeCake Creations badge) or keep the authentic botanical emblem.
          </p>

          <div className="flex justify-center my-4">
            <BrandLogo size="xl" customLogoUrl={logoPreview} showText={false} />
          </div>

          <div className="flex items-center justify-center gap-3">
            <label className="relative inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#e0c2c8] text-[#8b3d4d] text-xs font-semibold rounded-lg hover:bg-[#fff0f3] cursor-pointer shadow-xs overflow-hidden">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-4 h-4" /> Choose Logo Image
            </label>

            {logoPreview && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 px-3 py-2 bg-stone-100 text-stone-600 text-xs rounded-lg hover:bg-stone-200 cursor-pointer"
                title="Reset to default emblem"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#fcedf0] border-t border-[#ebd0d6]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg shadow-md"
          >
            <Check className="w-4 h-4" /> Apply Logo
          </button>
        </div>
      </div>
    </div>
  );
};

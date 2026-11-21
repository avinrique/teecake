import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Instagram,
  Upload,
  Trash2,
  ExternalLink,
  QrCode,
  Sparkles,
  Maximize2,
  Download,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CafeContactDetails } from '../types';
import { compressImageDataUrl } from '../utils/persistentStorage';

interface InstagramQrCardProps {
  contact: CafeContactDetails;
  onUpdateContact?: (updated: CafeContactDetails) => void;
  variant?: 'footer' | 'section' | 'compact';
  className?: string;
}

export const InstagramQrCard: React.FC<InstagramQrCardProps> = ({
  contact,
  onUpdateContact,
  variant = 'footer',
  className = '',
}) => {
  const [generatedQr, setGeneratedQr] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute clean Instagram URL
  const instagramRaw = contact.socials?.instagram?.trim() || '@TeeCake_Creations';
  const instagramHandle = instagramRaw.startsWith('@')
    ? instagramRaw
    : instagramRaw.includes('instagram.com/')
    ? `@${instagramRaw.split('instagram.com/')[1].replace(/\/.*$/, '')}`
    : `@${instagramRaw}`;

  const instagramWebUrl = instagramRaw.startsWith('http')
    ? instagramRaw
    : `https://instagram.com/${instagramHandle.replace('@', '')}`;

  // Generate fallback/instant scannable QR Code using qrcode library
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(instagramWebUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#4a1c26', // Victorian deep burgundy rose for luxury scan contrast
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setGeneratedQr(url);
        }
      })
      .catch((err) => {
        console.warn('QR code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [instagramWebUrl]);

  // Handle custom QR code image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setSuccessNotice(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, or SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      let result = event.target?.result as string;
      if (result && onUpdateContact) {
        try {
          result = await compressImageDataUrl(result, 600, 600, 0.88);
        } catch (e) {}
        onUpdateContact({
          ...contact,
          instagramQrCodeUrl: result,
        });
        setSuccessNotice('QR code image uploaded successfully!');
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';
  };

  // Handle custom QR code delete
  const handleDeleteQr = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onUpdateContact) return;

    onUpdateContact({
      ...contact,
      instagramQrCodeUrl: null,
    });
    setSuccessNotice('Custom QR image removed. Default scannable QR restored.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Handle downloading QR image for bakery printing
  const handleDownloadQr = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qrSrc = contact.instagramQrCodeUrl || generatedQr;
    if (!qrSrc) return;

    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `teecake-instagram-qr-${instagramHandle.replace('@', '')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeQrImage = contact.instagramQrCodeUrl || generatedQr;
  const isCustomUploaded = Boolean(contact.instagramQrCodeUrl);

  return (
    <>
      <div
        className={`relative bg-gradient-to-br from-[#fffdfb] via-[#fff9fa] to-[#fbf0f3] rounded-2xl border border-[#ebd0d6] shadow-xs p-4 sm:p-5 text-[#4a1c26] transition-all ${className}`}
      >
        {/* Subtle decorative Victorian corner accents */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fae6ea] text-[#8b3d4d] border border-[#f0cdd5]">
            <Instagram className="w-2.5 h-2.5" /> Instagram
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* QR Code Container */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 p-2 bg-white rounded-xl border-2 border-[#edd4da] shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02]">
              {activeQrImage ? (
                <img
                  src={activeQrImage}
                  alt={`Scan to visit ${instagramHandle}`}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setIsZoomed(true)}
                  title="Click to view full size"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-400 gap-1 text-center p-2">
                  <QrCode className="w-6 h-6 animate-pulse" />
                  <span className="text-[9px]">Generating QR...</span>
                </div>
              )}

              {/* Hover Zoom Overlay Button */}
              {activeQrImage && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 rounded-xl cursor-pointer"
                  title="Zoom QR Code"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Zoom</span>
                </button>
              )}
            </div>

            {/* Custom / Auto indicator badge */}
            <div className="mt-1.5 text-center">
              {isCustomUploaded ? (
                <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                  Custom QR Image
                </span>
              ) : (
                <span className="inline-block text-[10px] text-[#8b5560] bg-[#f7e6ea] px-2 py-0.5 rounded-full font-medium border border-[#ebd0d6]">
                  Live Dynamic QR
                </span>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#8b3d4d] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#c99750]" />
                <span>Follow Our Bakehouse</span>
              </div>
              <h4 className="font-serif-display text-lg sm:text-xl font-bold text-[#4a1c26] truncate">
                Scan & Visit Instagram
              </h4>
              <p className="text-xs text-[#6e4650] leading-relaxed">
                Scan with your phone camera or tap below to explore fresh morning bakes, reels & story updates.
              </p>
            </div>

            {/* Clickable Instagram Link */}
            <div className="pt-0.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <a
                href={instagramWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9e4c5b] text-white hover:bg-[#853c49] shadow-2xs transition-all group"
              >
                <Instagram className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{instagramHandle}</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* Download QR button */}
              {activeQrImage && (
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[#7a424f] bg-white border border-[#e8c0c8] hover:bg-[#fceded] transition-colors cursor-pointer"
                  title="Download QR code image for print or packaging"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              )}
            </div>

            {/* Owner Controls: Upload & Delete QR Image */}
            {onUpdateContact && (
              <div className="pt-2 border-t border-[#f0d8de] flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label
                  className="relative inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#8b3d4d] bg-white border border-[#e8c0c8] hover:bg-[#fff0f3] hover:border-[#9e4c5b] transition-all cursor-pointer shadow-2xs overflow-hidden"
                  title="Upload your own custom Instagram QR Code image"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-3 h-3" />
                  <span>{isCustomUploaded ? 'Replace QR Image' : 'Upload QR Image'}</span>
                </label>

                {isCustomUploaded && (
                  <button
                    type="button"
                    onClick={handleDeleteQr}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                    title="Delete custom uploaded QR code and revert to automatic QR code"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete QR Image</span>
                  </button>
                )}
              </div>
            )}

            {/* Error or Success Feedback */}
            {uploadError && (
              <div className="text-[11px] text-red-600 flex items-center justify-center sm:justify-start gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {successNotice && (
              <div className="text-[11px] text-emerald-700 flex items-center justify-center sm:justify-start gap-1 font-medium">
                <Check className="w-3 h-3 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Full Size Zoom Modal for Quick Scanning from another phone/device */}
      {isZoomed && activeQrImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative bg-[#fffdfb] border-2 border-[#edd4da] rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#f2dbe0] pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="p-1.5 rounded-lg bg-[#fae6ea] text-[#9e4c5b]">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display font-bold text-base text-[#4a1c26]">
                    Instagram QR Code
                  </h3>
                  <span className="text-xs text-[#855762]">{instagramHandle}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="text-stone-400 hover:text-stone-700 p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Large QR Display */}
            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-inner flex items-center justify-center">
              <img
                src={activeQrImage}
                alt={`Instagram QR Code for ${instagramHandle}`}
                className="w-56 h-56 object-contain"
              />
            </div>

            <p className="text-xs text-[#6e4650] leading-relaxed">
              Open your smartphone camera or Instagram scanner and point at the QR code above to visit our page directly.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href={instagramWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#9e4c5b] text-white hover:bg-[#853c49]"
              >
                <Instagram className="w-4 h-4" /> Visit {instagramHandle}
              </a>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

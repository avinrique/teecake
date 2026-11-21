import React, { useState, useEffect, useRef } from 'react';
import { X, Check, MapPin, Clock, Phone, Mail, Sparkles, Instagram, Upload, Trash2, QrCode } from 'lucide-react';
import { CafeContactDetails } from '../types';
import { compressImageDataUrl } from '../utils/persistentStorage';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: CafeContactDetails;
  onSave: (updated: CafeContactDetails) => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSave,
}) => {
  const [formData, setFormData] = useState<CafeContactDetails>(contact);
  const [qrUploadError, setQrUploadError] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(contact);
      setQrUploadError(null);
    }
  }, [isOpen, contact]);

  if (!isOpen) return null;

  const handleHourChange = (index: number, field: 'days' | 'time' | 'note', value: string) => {
    const newHours = [...formData.hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData({ ...formData, hours: newHours });
  };

  const handleAddHourRow = () => {
    setFormData({
      ...formData,
      hours: [...formData.hours, { days: 'New Schedule', time: '8:00 AM – 6:00 PM' }],
    });
  };

  const handleRemoveHourRow = (index: number) => {
    const newHours = formData.hours.filter((_, i) => i !== index);
    setFormData({ ...formData, hours: newHours });
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setQrUploadError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setQrUploadError('Image size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      let result = event.target?.result as string;
      if (result) {
        try {
          result = await compressImageDataUrl(result, 600, 600, 0.88);
        } catch (e) {}
        setFormData((prev) => ({
          ...prev,
          instagramQrCodeUrl: result,
        }));
      }
    };
    reader.onerror = () => {
      setQrUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteQr = () => {
    setFormData((prev) => ({
      ...prev,
      instagramQrCodeUrl: null,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-[#fffaf6] border border-[#e8c0c8] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fcedf0] border-b border-[#ebd0d6]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-lg text-[#9e4c5b]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#5e2632]">
                Edit Bakery Contact, Hours & Socials
              </h3>
              <p className="text-xs text-[#8f5d68]">
                Customize your storefront address, schedules, domain, and phone number.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Brand Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Bakery Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Website Domain
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={formData.subheading}
                onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
              />
            </div>
          </div>

          {/* Direct Contact (Phone & Email) */}
          <div className="pt-4 border-t border-[#f0d8de]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a3b47] mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Direct Contact & Inquiries
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 (0) 191 261 8490"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Direct Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="hello@teecake-creations.com"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Home Bakehouse Location / Pickup Region (No street address required)
                </label>
                <input
                  type="text"
                  value={formData.cityStateZip}
                  onChange={(e) => setFormData({ ...formData, cityStateZip: e.target.value })}
                  placeholder="Newcastle upon Tyne (Local Pickup & Delivery)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="pt-4 border-t border-[#f0d8de]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a3b47] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Boutique Schedules & Hours
              </h4>
              <button
                type="button"
                onClick={handleAddHourRow}
                className="text-xs text-[#9e4c5b] hover:underline font-semibold cursor-pointer"
              >
                + Add Schedule Row
              </button>
            </div>

            <div className="space-y-3">
              {formData.hours.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h.days}
                    onChange={(e) => handleHourChange(idx, 'days', e.target.value)}
                    placeholder="Days (e.g. Tuesday – Friday)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
                  />
                  <input
                    type="text"
                    value={h.time}
                    onChange={(e) => handleHourChange(idx, 'time', e.target.value)}
                    placeholder="Hours (e.g. 7:30 AM – 6:00 PM)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
                  />
                  {formData.hours.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHourRow(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instagram Page & QR Code Management */}
          <div className="pt-4 border-t border-[#f0d8de]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a3b47] mb-3 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-[#9e4c5b]" /> Instagram Page & Scannable QR Code
            </h4>
            
            <div className="space-y-4 bg-[#fcf5f7] p-4 rounded-xl border border-[#edd7dd]">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Instagram Handle or Profile Link
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-mono">instagram.com/</span>
                  <input
                    type="text"
                    value={formData.socials?.instagram ? formData.socials.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '') : 'TeeCake_Creations'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: {
                          ...formData.socials,
                          instagram: e.target.value.trim() ? `@${e.target.value.replace(/^@/, '').trim()}` : '',
                        },
                      })
                    }
                    placeholder="TeeCake_Creations"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800 font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Customers can scan the QR code to visit this Instagram profile directly from their phone camera.
                </p>
              </div>

              {/* QR Code Upload / Delete in Modal */}
              <div className="pt-2 border-t border-[#edd0d6]">
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Instagram QR Code Image (Upload / Delete)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current QR Code Image Preview */}
                  <div className="w-24 h-24 bg-white rounded-lg border-2 border-[#edd4da] p-1.5 shadow-2xs flex items-center justify-center shrink-0">
                    {formData.instagramQrCodeUrl ? (
                      <img
                        src={formData.instagramQrCodeUrl}
                        alt="Uploaded QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-stone-400 p-1">
                        <QrCode className="w-6 h-6 mx-auto mb-1 text-[#9e4c5b]" />
                        <span className="text-[9px] block text-stone-500 leading-tight">Live Dynamic QR Active</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <p className="text-xs text-[#6e4650]">
                      {formData.instagramQrCodeUrl
                        ? 'A custom QR code image is currently uploaded and displayed on your footer.'
                        : 'Currently using the auto-generated scannable QR code matching your Instagram handle.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <label
                        className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8b3d4d] bg-white border border-[#e8c0c8] hover:bg-[#fff0f3] hover:border-[#9e4c5b] transition-all cursor-pointer shadow-2xs overflow-hidden"
                      >
                        <input
                          type="file"
                          ref={qrInputRef}
                          onChange={handleQrFileUpload}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.instagramQrCodeUrl ? 'Upload New QR Image' : 'Upload QR Image'}</span>
                      </label>

                      {formData.instagramQrCodeUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteQr}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Custom QR</span>
                        </button>
                      )}
                    </div>

                    {qrUploadError && (
                      <p className="text-[11px] text-red-600 font-medium">{qrUploadError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
            <Check className="w-4 h-4" /> Save Contact Details
          </button>
        </div>
      </div>
    </div>
  );
};

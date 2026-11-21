import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Camera,
  Upload,
  RotateCcw,
  Sparkles,
  Type,
  Bold,
  Sun,
  Plus,
  Minus,
  Crown,
  Eye,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTypography } from '../context/TypographyContext';
import { compressImageDataUrl } from '../utils/persistentStorage';

export const BRAND_PRESETS = [
  { name: 'TeeCake', subtitle: 'CREATIONS', note: 'Original botanical brand' },
  { name: 'TeeCake', subtitle: 'ARTISAN PATISSERIE', note: 'French patisserie style' },
  { name: 'TeeCake', subtitle: 'TEAROOM & BAKERY', note: 'Classic British tearoom' },
  { name: 'Tyneside Bakehouse', subtitle: 'TEA ROOM & PATISSERIE', note: 'Newcastle upon Tyne theme' },
  { name: 'Grey Street Bakery', subtitle: 'NEWCASTLE UPON TYNE', note: 'Historic city centre theme' },
];

interface BrandEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandSubtitle: string;
  brandLogoSize?: 'sm' | 'md' | 'lg' | 'xl';
  customLogoUrl: string | null;
  onSaveBrand: (data: {
    brandName: string;
    brandSubtitle: string;
    brandLogoSize: 'sm' | 'md' | 'lg' | 'xl';
    customLogoUrl: string | null;
  }) => void;
}

export const BrandEditorModal: React.FC<BrandEditorModalProps> = ({
  isOpen,
  onClose,
  brandName,
  brandSubtitle,
  brandLogoSize = 'md',
  customLogoUrl,
  onSaveBrand,
}) => {
  const [nameInput, setNameInput] = useState(brandName || 'TeeCake');
  const [subInput, setSubInput] = useState(brandSubtitle || 'CREATIONS');
  const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(brandLogoSize || 'md');
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogoUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { getTextFormatting, updateCustomFormat, stepFontSize, toggleContrast } = useTypography();
  const nameFormat = getTextFormatting('brandName');
  const subFormat = getTextFormatting('brandSubtitle');

  const nameWeight = nameFormat.fontWeight || 'bold';
  const nameSizeStep = nameFormat.fontSizeStep ?? 0;
  const nameContrast = Boolean(nameFormat.enhanceContrast);

  const subWeight = subFormat.fontWeight || 'semibold';
  const subSizeStep = subFormat.fontSizeStep ?? 0;
  const subContrast = Boolean(subFormat.enhanceContrast);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleApplyPreset = (preset: typeof BRAND_PRESETS[0]) => {
    setNameInput(preset.name);
    setSubInput(preset.subtitle);
  };

  const handleSave = () => {
    onSaveBrand({
      brandName: nameInput.trim() || 'TeeCake',
      brandSubtitle: subInput.trim() || 'CREATIONS',
      brandLogoSize: logoSize,
      customLogoUrl: logoPreview,
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setNameInput('TeeCake');
    setSubInput('CREATIONS');
    setLogoSize('md');
    setLogoPreview(null);
    updateCustomFormat('brandName', { fontWeight: 'bold', fontSizeStep: 0, enhanceContrast: false });
    updateCustomFormat('brandSubtitle', { fontWeight: 'semibold', fontSizeStep: 0, enhanceContrast: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fffdfb] rounded-2xl shadow-2xl border border-[#ebd0d6] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#ebd0d6] bg-[#faeaee]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#9e4c5b] text-white rounded-lg shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#4a1c26]">
                Edit Brand Logo, Title & Typography
              </h2>
              <p className="text-xs text-[#6e3943]">
                Customize bakery name, subtitle, font sizing, weights, and circular logo badge.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* REAL-TIME PREVIEW CARD */}
          <div className="p-4 bg-gradient-to-br from-[#fff7f9] to-[#faedf0] rounded-xl border border-[#e8bac4] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9e4c5b] flex items-center gap-1 mb-2">
              <Eye className="w-3 h-3" /> Live Header Appearance Preview
            </span>
            <div className="bg-white/95 p-4 rounded-lg border border-[#edd4d9] flex items-center justify-between gap-4 overflow-x-auto">
              <BrandLogo
                size={logoSize}
                customLogoUrl={logoPreview}
                brandName={nameInput}
                brandSubtitle={subInput}
                showText={true}
                isEditable={false}
              />
              <div className="text-right shrink-0">
                <span className="text-[10px] text-stone-400 font-mono block">Logo: {logoSize.toUpperCase()}</span>
                <span className="text-[10px] text-stone-400 font-mono block">
                  Title: {nameSizeStep === 0 ? 'Default' : nameSizeStep > 0 ? `+${nameSizeStep * 16}%` : '-12%'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1: BRAND TITLE ("TeeCake") */}
          <div className="bg-white p-4 rounded-xl border border-[#ebd0d6] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4a1c26] flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#9e4c5b]" /> Bakery Brand Name
              </label>
              <span className="text-[11px] text-stone-400">Main header heading</span>
            </div>

            <div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. TeeCake"
                className="w-full px-3.5 py-2 text-base font-serif-display font-bold bg-[#fffdfb] border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
              />
            </div>

            {/* Typography Formatting Controls for Brand Name */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Font Weight */}
              <div className="flex items-center gap-1 bg-[#fcedf0] p-1 rounded-md text-xs">
                <span className="text-[10px] font-bold text-[#6e3943] px-1">Weight:</span>
                {(['normal', 'semibold', 'bold', 'extrabold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateCustomFormat('brandName', { fontWeight: w })}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                      nameWeight === w
                        ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                        : 'text-[#6e3943] hover:bg-[#faeaee]'
                    }`}
                  >
                    {w === 'normal' ? 'Norm' : w === 'semibold' ? 'Semi' : w === 'bold' ? 'Bold' : 'Black'}
                  </button>
                ))}
              </div>

              {/* Font Size Step Buttons */}
              <div className="flex items-center gap-1 bg-[#fcedf0] px-2 py-1 rounded-md text-xs text-[#6e3943]">
                <span className="text-[10px] font-bold px-0.5">Font Size:</span>
                <button
                  type="button"
                  onClick={() => stepFontSize('brandName', 'down')}
                  disabled={nameSizeStep <= -1}
                  className="p-1 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
                  title="Decrease font size"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold min-w-[3rem] text-center text-xs text-[#9e4c5b]">
                  {nameSizeStep === 0 ? 'Default' : nameSizeStep > 0 ? `+${nameSizeStep * 16}%` : '-12%'}
                </span>
                <button
                  type="button"
                  onClick={() => stepFontSize('brandName', 'up')}
                  disabled={nameSizeStep >= 4}
                  className="p-1 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
                  title="Increase font size"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Contrast Aura Toggle */}
              <button
                type="button"
                onClick={() => toggleContrast('brandName')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  nameContrast
                    ? 'bg-[#c99750] text-white shadow-xs'
                    : 'bg-[#fcedf0] text-[#6e3943] hover:bg-[#faeaee]'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Contrast {nameContrast ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: BRAND SUBTITLE ("CREATIONS") */}
          <div className="bg-white p-4 rounded-xl border border-[#ebd0d6] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4a1c26] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#c99750]" /> Brand Subtitle / Tagline
              </label>
              <span className="text-[11px] text-stone-400">Appears below the brand name</span>
            </div>

            <div>
              <input
                type="text"
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                placeholder="e.g. CREATIONS"
                className="w-full px-3.5 py-2 text-xs uppercase tracking-widest font-semibold bg-[#fffdfb] border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
              />
            </div>

            {/* Typography Formatting Controls for Subtitle */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Font Weight */}
              <div className="flex items-center gap-1 bg-[#fcedf0] p-1 rounded-md text-xs">
                <span className="text-[10px] font-bold text-[#6e3943] px-1">Weight:</span>
                {(['normal', 'semibold', 'bold', 'extrabold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateCustomFormat('brandSubtitle', { fontWeight: w })}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                      subWeight === w
                        ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                        : 'text-[#6e3943] hover:bg-[#faeaee]'
                    }`}
                  >
                    {w === 'normal' ? 'Norm' : w === 'semibold' ? 'Semi' : w === 'bold' ? 'Bold' : 'Black'}
                  </button>
                ))}
              </div>

              {/* Font Size Step Buttons */}
              <div className="flex items-center gap-1 bg-[#fcedf0] px-2 py-1 rounded-md text-xs text-[#6e3943]">
                <span className="text-[10px] font-bold px-0.5">Size:</span>
                <button
                  type="button"
                  onClick={() => stepFontSize('brandSubtitle', 'down')}
                  disabled={subSizeStep <= -1}
                  className="p-1 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
                  title="Decrease subtitle font size"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold min-w-[3rem] text-center text-xs text-[#9e4c5b]">
                  {subSizeStep === 0 ? 'Default' : subSizeStep > 0 ? `+${subSizeStep * 16}%` : '-12%'}
                </span>
                <button
                  type="button"
                  onClick={() => stepFontSize('brandSubtitle', 'up')}
                  disabled={subSizeStep >= 4}
                  className="p-1 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
                  title="Increase subtitle font size"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Contrast Aura Toggle */}
              <button
                type="button"
                onClick={() => toggleContrast('brandSubtitle')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  subContrast
                    ? 'bg-[#c99750] text-white shadow-xs'
                    : 'bg-[#fcedf0] text-[#6e3943] hover:bg-[#faeaee]'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Contrast {subContrast ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: CIRCULAR LOGO BADGE & SIZE */}
          <div className="bg-white p-4 rounded-xl border border-[#ebd0d6] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4a1c26] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#9e4c5b]" /> Circular Logo Badge & Emblem
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Logo Size Selection */}
              <div>
                <span className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Circular Badge Dimensions:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'sm', label: 'Small', desc: '40px' },
                    { id: 'md', label: 'Medium', desc: '64px' },
                    { id: 'lg', label: 'Large', desc: '84px' },
                    { id: 'xl', label: 'X-Large', desc: '112px' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setLogoSize(s.id as any)}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        logoSize === s.id
                          ? 'bg-[#9e4c5b] text-white border-[#7a3b47] shadow-xs'
                          : 'bg-[#fffdfb] hover:bg-[#faeaee] text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="block text-xs font-bold leading-tight">{s.label}</span>
                      <span className="block text-[9px] opacity-75 font-mono">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo File Upload / Switcher */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-stone-700">
                  Emblem Graphic:
                </span>
                <div className="flex items-center gap-2">
                  <label
                    className="relative flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#fcedf0] hover:bg-[#faeaee] text-[#8b3d4d] border border-[#e0c2c8] rounded-lg text-xs font-semibold transition-colors cursor-pointer overflow-hidden"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Upload className="w-3.5 h-3.5" /> Upload Custom Logo
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => setLogoPreview(null)}
                      className="px-2.5 py-2 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Switch back to botanical medallion"
                    >
                      Use Medallion
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">
                  {logoPreview
                    ? 'Using custom uploaded logo image.'
                    : 'Using authentic botanical teacup & floral garland medallion (text inside syncs automatically!).'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: CURATED BRAND PRESETS */}
          <div className="p-3 bg-[#fdf4f6] rounded-xl border border-[#ebd0d6]">
            <span className="text-[11px] font-bold text-[#7a3b47] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
              Quick-Apply Brand Presets (Click any to test):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {BRAND_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-left text-xs p-2 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    nameInput === preset.name && subInput === preset.subtitle
                      ? 'bg-[#9e4c5b] text-white border-[#7d3240] shadow-xs'
                      : 'bg-white hover:bg-[#faeaee] text-[#5e2632] border-[#ebd0d6]'
                  }`}
                >
                  <div>
                    <span className="font-serif-display font-bold block">{preset.name}</span>
                    <span className="text-[10px] tracking-wider uppercase opacity-85 block">
                      {preset.subtitle}
                    </span>
                  </div>
                  <span className="text-[9px] opacity-60 italic shrink-0 pt-0.5">{preset.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-[#faeaee] border-t border-[#ebd0d6]">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg shadow-md cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" /> Save Brand Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

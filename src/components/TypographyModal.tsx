import React from 'react';
import {
  X,
  Type,
  Bold,
  Sun,
  Sparkles,
  RotateCcw,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { useTypography } from '../context/TypographyContext';

interface TypographyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TypographyModal: React.FC<TypographyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    updateCustomFormat,
    resetSettings,
  } = useTypography();

  if (!isOpen) return null;

  const heroSubFormat = settings.customFormats?.heroSubheading || {
    fontWeight: settings.subheadingWeight || 'bold',
    fontSizeStep: 1,
    enhanceContrast: true,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fffdfb] rounded-2xl shadow-2xl border border-[#ebd0d6] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebd0d6] bg-[#faeaee]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#9e4c5b] text-white rounded-lg shadow-xs">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-[#4a1c26]">
                Text Size & Boldness Controls
              </h2>
              <p className="text-xs text-[#6e3943]">
                Adjust font weight, size scale, and readability contrast across all texts.
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Preview Box */}
          <div className="relative rounded-xl p-5 border border-[#ebd0d6] bg-gradient-to-br from-[#fff7f8] via-[#fff1f3] to-[#ffebee] overflow-hidden shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9e4c5b] mb-1.5 block">
              Live Preview of Hero Tagline & Subheading
            </span>
            <p
              className={`font-serif-subtle italic text-center transition-all duration-200 text-[#4a1c26] ${
                heroSubFormat.fontWeight === 'extrabold'
                  ? 'font-extrabold'
                  : heroSubFormat.fontWeight === 'bold'
                  ? 'font-bold'
                  : heroSubFormat.fontWeight === 'semibold'
                  ? 'font-semibold'
                  : heroSubFormat.fontWeight === 'medium'
                  ? 'font-medium'
                  : 'font-normal'
              }`}
              style={{
                fontSize: `${1.15 * (1 + (heroSubFormat.fontSizeStep || 0) * 0.16) * (settings.globalScale || 1.0)}rem`,
                ...(heroSubFormat.enhanceContrast || settings.enhanceAllContrast
                  ? {
                      textShadow: '0 1px 3px rgba(255,255,255,0.95), 0 2px 8px rgba(255,235,240,0.85)',
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))',
                    }
                  : {}),
              }}
            >
              &ldquo;Where the art of delicate French baking harmonizes with floral elegance and sweet serenity.&rdquo;
            </p>
          </div>

          {/* Hero Subheading & Tagline Specific Controls */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#4a1c26] flex items-center gap-1.5">
                  <Bold className="w-4 h-4 text-[#9e4c5b]" />
                  Hero Tagline / Subheading
                </h3>
                <p className="text-xs text-stone-500">
                  Control the prominent tagline under the main bakery title.
                </p>
              </div>

              {/* Contrast toggle */}
              <button
                type="button"
                onClick={() =>
                  updateCustomFormat('heroSubheading', {
                    enhanceContrast: !heroSubFormat.enhanceContrast,
                  })
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  heroSubFormat.enhanceContrast
                    ? 'bg-[#c99750] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                {heroSubFormat.enhanceContrast ? 'Contrast Glow: ON' : 'Contrast Glow: OFF'}
              </button>
            </div>

            {/* Boldness Buttons */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Font Weight / Boldness:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'normal', label: 'Normal' },
                    { id: 'semibold', label: 'Semibold' },
                    { id: 'bold', label: 'Bold (Recommended)' },
                    { id: 'extrabold', label: 'Extra Bold' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      updateCustomFormat('heroSubheading', { fontWeight: opt.id })
                    }
                    className={`py-2 px-2 text-xs rounded-lg font-medium text-center cursor-pointer transition-all ${
                      heroSubFormat.fontWeight === opt.id
                        ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Step */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Font Size:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: -1, label: 'Small' },
                  { step: 0, label: 'Default' },
                  { step: 1, label: 'Large (+16%)' },
                  { step: 2, label: 'XL (+32%)' },
                  { step: 3, label: 'Huge (+52%)' },
                ].map((opt) => (
                  <button
                    key={opt.step}
                    type="button"
                    onClick={() =>
                      updateCustomFormat('heroSubheading', { fontSizeStep: opt.step })
                    }
                    className={`py-2 px-1 text-xs rounded-lg font-medium text-center cursor-pointer transition-all ${
                      (heroSubFormat.fontSizeStep ?? 0) === opt.step
                        ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Global Site-Wide Text Scale */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#4a1c26]">
                Global Site-Wide Text Scale
              </h3>
              <p className="text-xs text-stone-500">
                Enlarge or shrink all typography throughout the entire website proportionally.
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { scale: 1.0, label: '100% (Standard)' },
                { scale: 1.1, label: '110% (+10%)' },
                { scale: 1.2, label: '120% (+20%)' },
                { scale: 1.3, label: '130% (+30%)' },
                { scale: 1.4, label: '140% (+40%)' },
              ].map((opt) => (
                <button
                  key={opt.scale}
                  type="button"
                  onClick={() => updateSettings({ globalScale: opt.scale })}
                  className={`py-2 px-2 text-xs rounded-lg font-medium text-center cursor-pointer transition-all ${
                    settings.globalScale === opt.scale
                      ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Subheadings & Descriptions Boldness */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#4a1c26]">
                All Section Subheadings & Descriptions
              </h3>
              <p className="text-xs text-stone-500">
                Applies to Signature, Gallery, Catalog, Quotes, and parlor descriptions.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'normal', label: 'Normal' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'semibold', label: 'Semibold' },
                  { id: 'bold', label: 'Bold' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateSettings({ subheadingWeight: opt.id })}
                  className={`py-2 px-2 text-xs rounded-lg font-medium text-center cursor-pointer transition-all ${
                    settings.subheadingWeight === opt.id
                      ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Headings Boldness */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#4a1c26]">
                Section Titles & Headings
              </h3>
              <p className="text-xs text-stone-500">
                Main headers for sections across the website.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'medium', label: 'Medium' },
                  { id: 'semibold', label: 'Semibold' },
                  { id: 'bold', label: 'Bold (Default)' },
                  { id: 'extrabold', label: 'Extra Bold' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateSettings({ headingWeight: opt.id })}
                  className={`py-2 px-2 text-xs rounded-lg font-medium text-center cursor-pointer transition-all ${
                    settings.headingWeight === opt.id
                      ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Alignment Settings (Center by Default) */}
          <div className="bg-white rounded-xl p-4 border-2 border-[#f0cdd5] shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#4a1c26] flex items-center gap-1.5">
                <AlignCenter className="w-4 h-4 text-[#9e4c5b]" />
                Headings & Quotes Page Alignment
              </h3>
              <p className="text-xs text-stone-500">
                Adjust alignment for all main titles, subheadings, and quote philosophy cards across the page.
              </p>
            </div>

            {/* Main Headings Alignment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Main Titles & Section Headings:</span>
                <span className="font-mono text-[#9e4c5b] font-bold uppercase text-[11px]">
                  {settings.headingAlign || 'center'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'center', label: 'Center (Default & Recommended) ★', icon: AlignCenter },
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'right', label: 'Right', icon: AlignRight },
                ].map((al) => {
                  const Icon = al.icon;
                  const isActive = (settings.headingAlign || 'center') === al.id;
                  return (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => updateSettings({ headingAlign: al.id as any })}
                      className={`py-2 px-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{al.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subheadings Alignment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Subheadings & Descriptions:</span>
                <span className="font-mono text-[#9e4c5b] font-bold uppercase text-[11px]">
                  {settings.subheadingAlign || 'center'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'center', label: 'Center ★', icon: AlignCenter },
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'right', label: 'Right', icon: AlignRight },
                ].map((al) => {
                  const Icon = al.icon;
                  const isActive = (settings.subheadingAlign || 'center') === al.id;
                  return (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => updateSettings({ subheadingAlign: al.id as any })}
                      className={`py-2 px-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{al.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quotes Alignment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Philosophy Quotes:</span>
                <span className="font-mono text-[#9e4c5b] font-bold uppercase text-[11px]">
                  {settings.quoteAlign || 'center'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'center', label: 'Center ★', icon: AlignCenter },
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'right', label: 'Right', icon: AlignRight },
                  { id: 'justify', label: 'Justify', icon: AlignJustify },
                ].map((al) => {
                  const Icon = al.icon;
                  const isActive = (settings.quoteAlign || 'center') === al.id;
                  return (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => updateSettings({ quoteAlign: al.id as any })}
                      className={`py-2 px-1 text-xs rounded-lg font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{al.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Global Contrast Backdrop Enhancement */}
          <div className="bg-[#fbf4f6] rounded-xl p-4 border border-[#ebd0d6] flex items-center justify-between">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-[#5e2632] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                Universal High-Contrast Legibility
              </h4>
              <p className="text-[11px] text-[#7a424e]">
                Automatically adds a subtle glow/shadow to all floating texts to guarantee crisp visibility over floral backdrops.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSettings({ enhanceAllContrast: !settings.enhanceAllContrast })
              }
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                settings.enhanceAllContrast
                  ? 'bg-[#9e4c5b] text-white shadow-xs'
                  : 'bg-white text-[#5e2632] border border-[#ebd0d6] hover:bg-[#fcedf0]'
              }`}
            >
              {settings.enhanceAllContrast ? 'Active (ON)' : 'Inactive (OFF)'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ebd0d6] bg-stone-50">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" /> Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

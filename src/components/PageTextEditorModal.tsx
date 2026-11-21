import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Type,
  RotateCcw,
  Bold,
  Sun,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Mail,
  Trash2,
  Quote,
  PlusCircle,
  Building2,
  Crown,
  Eye,
  Camera,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PageTexts, BakingQuote, CafeContactDetails } from '../types';
import {
  DEFAULT_PAGE_TEXTS,
  INITIAL_BAKING_QUOTES,
  INITIAL_CONTACT_DETAILS,
} from '../data/initialData';
import { useTypography } from '../context/TypographyContext';

export const TOP_CAFE_TAGLINES = [
  'Warm morning sourdough, flaky butter pastries, and a proper brew in Newcastle.',
  'Freshly baked on the banks of the Tyne with British farmhouse butter.',
  'Baking with soul, brewing with passion, welcoming with Northern warmth.',
  'Your daily sanctuary of warm scones, Earl Grey tea, and handcrafted bakes.',
  'Where traditional British craft meets delicate artisan patisserie.',
  'Step in from the North East drizzle to the aroma of freshly baked loaves.',
  'Crafted before sunrise by artisan hands, savoured in timeless moments.',
  'Delicate scones, clotted cream, golden ovens, and unforgettable flavours.',
  'A taste of artisanal craft in every crumb, a proper cuppa in every cup.',
  'Named after our own Earl Grey—honouring heritage in every pastry.',
];

interface PageTextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageTexts: PageTexts;
  onSavePageTexts: (updated: PageTexts) => void;
  quotes?: BakingQuote[];
  onSaveQuotes?: (quotes: BakingQuote[]) => void;
  contact?: CafeContactDetails;
  onSaveContact?: (contact: CafeContactDetails) => void;
  customLogoUrl?: string | null;
  onUploadLogo?: () => void;
}

const InlineTypographyToolbar: React.FC<{ textKey: string; label?: string }> = ({ textKey }) => {
  const { getTextFormatting, updateCustomFormat, stepFontSize, toggleContrast } = useTypography();
  const format = getTextFormatting(textKey);
  const activeWeight = format.fontWeight || 'normal';
  const sizeStep = format.fontSizeStep ?? 0;
  const isEnhancedContrast = Boolean(format.enhanceContrast);

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1.5 text-xs">
      <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
        <Bold className="w-3 h-3 text-[#9e4c5b]" /> Format:
      </span>

      {/* Boldness Buttons */}
      <div className="inline-flex items-center bg-[#fcedf0] p-0.5 rounded-md">
        {(['normal', 'semibold', 'bold', 'extrabold'] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => updateCustomFormat(textKey, { fontWeight: w })}
            className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
              activeWeight === w
                ? 'bg-[#9e4c5b] text-white font-bold shadow-2xs'
                : 'text-[#6e3943] hover:bg-[#faeaee]'
            }`}
          >
            {w === 'normal' ? 'Norm' : w === 'semibold' ? 'Semi' : w === 'bold' ? 'Bold' : 'Black'}
          </button>
        ))}
      </div>

      {/* Font Size Step */}
      <div className="inline-flex items-center gap-1 bg-[#fcedf0] px-1.5 py-0.5 rounded-md text-[10px] text-[#6e3943]">
        <button
          type="button"
          onClick={() => stepFontSize(textKey, 'down')}
          disabled={sizeStep <= -1}
          className="p-0.5 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
          title="Decrease font size"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <span className="font-bold min-w-[2.2rem] text-center">
          {sizeStep === 0 ? 'Default' : sizeStep > 0 ? `+${sizeStep * 16}%` : '-12%'}
        </span>
        <button
          type="button"
          onClick={() => stepFontSize(textKey, 'up')}
          disabled={sizeStep >= 4}
          className="p-0.5 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
          title="Increase font size"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Contrast Aura Toggle */}
      <button
        type="button"
        onClick={() => toggleContrast(textKey)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
          isEnhancedContrast
            ? 'bg-[#c99750] text-white shadow-2xs'
            : 'bg-[#fcedf0] text-[#6e3943] hover:bg-[#faeaee]'
        }`}
        title="Enhance contrast shadow for visibility"
      >
        <Sun className="w-2.5 h-2.5" />
        <span>{isEnhancedContrast ? 'Contrast: ON' : 'Contrast: OFF'}</span>
      </button>
    </div>
  );
};

export const PageTextEditorModal: React.FC<PageTextEditorModalProps> = ({
  isOpen,
  onClose,
  pageTexts,
  onSavePageTexts,
  quotes,
  onSaveQuotes,
  contact,
  onSaveContact,
  customLogoUrl,
  onUploadLogo,
}) => {
  const [formData, setFormData] = useState<PageTexts>(pageTexts);
  const [quoteList, setQuoteList] = useState<BakingQuote[]>(quotes || INITIAL_BAKING_QUOTES);
  const [contactData, setContactData] = useState<CafeContactDetails>(contact || INITIAL_CONTACT_DETAILS);
  const [activeTab, setActiveTab] = useState<'brand' | 'hero' | 'signature' | 'gallery' | 'all-dishes' | 'other'>('brand');
  const [notification, setNotification] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(pageTexts);
      if (quotes) setQuoteList(quotes);
      if (contact) setContactData(contact);
      setShowResetConfirm(false);
    }
  }, [isOpen, pageTexts, quotes, contact]);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChange = (field: keyof PageTexts, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Quote handlers
  const handleQuoteChange = (index: number, field: keyof BakingQuote, val: string) => {
    setQuoteList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddQuote = () => {
    const newQ: BakingQuote = {
      id: `q-${Date.now()}`,
      quote: 'A fresh batch from the oven brings people together across all walks of life.',
      author: 'Tyneside Baker',
      context: 'Daily Hearth',
    };
    setQuoteList((prev) => [...prev, newQ]);
  };

  const handleDeleteQuote = (index: number) => {
    setQuoteList((prev) => prev.filter((_, i) => i !== index));
  };

  // Contact handlers
  const handleContactChange = (field: keyof CafeContactDetails, val: any) => {
    setContactData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleHourRowChange = (index: number, field: 'days' | 'time' | 'note', val: string) => {
    setContactData((prev) => {
      const newHours = [...prev.hours];
      newHours[index] = { ...newHours[index], [field]: val };
      return { ...prev, hours: newHours };
    });
  };

  const handleAddHourRow = () => {
    setContactData((prev) => ({
      ...prev,
      hours: [...prev.hours, { days: 'Monday – Friday', time: '8:00 AM – 5:00 PM', note: 'Morning bakes' }],
    }));
  };

  const handleRemoveHourRow = (index: number) => {
    setContactData((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, i) => i !== index),
    }));
  };

  // 1-Click UK / Newcastle Theme Quick Apply
  const handleApplyNewcastleTheme = () => {
    // 1. Page texts
    setFormData((prev) => ({
      ...prev,
      quotesHeading: 'The Art & Philosophy of Baking',
      quotesSubheading: 'Reflections on the patience, heritage, and pure joy poured into every handcrafted bake.',
      locationHeading: 'Visit Our Bakehouse & Tea Room',
      locationSubheading:
        "Pop in for a warm pastry on your morning commute or join us for a slow afternoon tea. Just a short stroll from Grey's Monument and Central Station.",
    }));

    // 2. 4 Newcastle Quotes
    setQuoteList([
      {
        id: 'q1',
        quote:
          'There is nothing a warm scone with clotted cream and a proper cup of Earl Grey cannot mend on a brisk Tyneside morning.',
        author: 'Tyneside Bakehouse Philosophy',
        context: 'A Proper Brew & Bake',
      },
      {
        id: 'q2',
        quote:
          'Baking isn’t just flour and butter; it’s the warmth and comfort you step into when escaping the North East chill.',
        author: 'Hearth & Counter Notes',
        context: 'Northern Warmth',
      },
      {
        id: 'q3',
        quote:
          'Respect the sourdough starter, butter the tins generously, and never rush a morning loaf out of the oven.',
        author: 'British Craft Bakery Tradition',
        context: 'Artisan Craft',
      },
      {
        id: 'q4',
        quote:
          'Named after Newcastle’s own Earl Grey—no afternoon on the Tyne is complete without tea and a slice of something sweet.',
        author: 'Newcastle Tea Room Guild',
        context: 'Local Heritage',
      },
    ]);

    // 3. Newcastle contact & hours (preserving custom uploaded Instagram QR code and socials)
    setContactData((prev) => ({
      ...prev,
      name: prev.name || 'TeeCake Creations',
      address: '14 Grey Street',
      cityStateZip: 'Newcastle upon Tyne, NE1 6EE, UK',
      phone: '+44 (0) 191 234 5678',
      email: prev.email || 'hello@teecake-creations.com',
      hours: [
        { days: 'Tuesday – Saturday', time: '8:00 AM – 5:00 PM', note: 'Fresh morning bakes out by 8:00 AM' },
        { days: 'Sunday', time: '9:00 AM – 4:00 PM', note: 'Sunday afternoon tea & fresh scones' },
        { days: 'Monday', time: 'Closed for Baking & Artisan Prep', note: 'Kitchen prep day' },
      ],
      // Never wipe user custom uploaded QR code or socials!
      instagramQrCodeUrl: prev.instagramQrCodeUrl,
      socials: prev.socials,
    }));

    showNotice('✨ Applied Newcastle upon Tyne & UK Theme! Click "Save All Changes" below to apply.');
  };

  const handleApplyNewcastleHero = () => {
    setFormData((prev) => ({
      ...prev,
      heroEmblem: 'Tyneside’s Artisan Bakehouse & Tea Room',
      heroTitle: 'Freshly Baked on the Banks of the Tyne',
      heroSubheading:
        'Warm morning sourdough, flaky butter pastries, and a proper brew. Baked fresh before dawn in the heart of Newcastle.',
      heroBadge1: 'British Farmhouse Butter & Stoneground Flour',
      heroBadge2: 'Hand-Baked Daily Before Sunrise',
      heroBadge3: 'Fresh Counter Bakes & Afternoon Tea',
    }));
    showNotice('✨ Applied Newcastle upon Tyne Hero text! Click "Save All Changes" below to apply.');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset section headings and text copy to default values?')) {
      setFormData((prev) => ({
        ...DEFAULT_PAGE_TEXTS,
        // Keep brand name and brand subtitle if user customized
        brandName: prev.brandName,
        brandSubtitle: prev.brandSubtitle,
      }));
      if (INITIAL_BAKING_QUOTES) setQuoteList(INITIAL_BAKING_QUOTES);
      if (INITIAL_CONTACT_DETAILS) {
        setContactData((prev) => ({
          ...INITIAL_CONTACT_DETAILS,
          // Preserve any custom uploaded QR code
          instagramQrCodeUrl: prev.instagramQrCodeUrl,
          socials: prev.socials || INITIAL_CONTACT_DETAILS.socials,
        }));
      }
    }
  };

  const handleSave = () => {
    onSavePageTexts(formData);
    if (onSaveQuotes) onSaveQuotes(quoteList);
    if (onSaveContact) onSaveContact(contactData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fffdfb] rounded-2xl shadow-2xl border border-[#ebd0d6] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#ebd0d6] bg-[#faeaee]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#9e4c5b] text-white rounded-lg shadow-xs">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#4a1c26]">
                Edit Website Texts, Quotes & Location
              </h2>
              <p className="text-xs text-[#6e3943]">
                Full access to edit headings, quotes, address, phone, hours, and feature badges.
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

        {/* Notification Toast */}
        {notification && (
          <div className="bg-[#5a1e2a] text-white text-xs px-4 py-2 font-medium flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 bg-white border-b border-stone-200 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'brand', label: 'Brand & Logo (TeeCake CREATIONS)' },
            { id: 'other', label: 'Quotes & Location (Newcastle / UK)' },
            { id: 'hero', label: 'Hero & Headlines' },
            { id: 'signature', label: 'Signature Dishes' },
            { id: 'gallery', label: 'Dishes Gallery' },
            { id: 'all-dishes', label: 'All Dishes Section' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#9e4c5b] text-white shadow-2xs font-bold'
                  : 'text-[#6e3943] hover:bg-[#faeaee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 0: BRAND & LOGO (TEECAKE CREATIONS) */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              {/* Real-Time Header Preview */}
              <div className="p-4 bg-gradient-to-br from-[#fff7f9] to-[#faedf0] rounded-xl border border-[#e8bac4] shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9e4c5b] flex items-center gap-1 mb-2">
                  <Eye className="w-3 h-3" /> Live Header Brand Preview
                </span>
                <div className="bg-white/95 p-4 rounded-lg border border-[#edd4d9] flex items-center justify-between gap-4 overflow-x-auto">
                  <BrandLogo
                    size={formData.brandLogoSize || 'md'}
                    customLogoUrl={customLogoUrl}
                    brandName={formData.brandName || 'TeeCake'}
                    brandSubtitle={formData.brandSubtitle || 'CREATIONS'}
                    showText={true}
                    isEditable={false}
                  />
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 font-mono block">
                      Badge: {(formData.brandLogoSize || 'md').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono block">
                      Text inside badge syncs automatically
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Name Input */}
              <div className="bg-[#fffdfb] p-4 rounded-xl border border-[#ebd0d6] space-y-3">
                <div className="flex items-center justify-between border-b border-[#faeaee] pb-2">
                  <h4 className="font-serif-display text-base font-bold text-[#4a1c26] flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-[#9e4c5b]" />
                    Bakery Brand Name
                  </h4>
                  <span className="text-[11px] text-stone-400">Main header title & emblem text</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Brand Name (e.g. TeeCake)
                  </label>
                  <input
                    type="text"
                    value={formData.brandName ?? ''}
                    onChange={(e) => handleChange('brandName', e.target.value)}
                    placeholder="TeeCake"
                    className="w-full px-3.5 py-2 text-base bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                  />
                  <InlineTypographyToolbar textKey="brandName" />
                </div>
              </div>

              {/* Brand Subtitle Input */}
              <div className="bg-[#fffdfb] p-4 rounded-xl border border-[#ebd0d6] space-y-3">
                <div className="flex items-center justify-between border-b border-[#faeaee] pb-2">
                  <h4 className="font-serif-display text-base font-bold text-[#4a1c26] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c99750]" />
                    Brand Subtitle / Tagline
                  </h4>
                  <span className="text-[11px] text-stone-400">Subtext displayed under brand name</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Brand Subtitle (e.g. CREATIONS)
                  </label>
                  <input
                    type="text"
                    value={formData.brandSubtitle ?? ''}
                    onChange={(e) => handleChange('brandSubtitle', e.target.value)}
                    placeholder="CREATIONS"
                    className="w-full px-3.5 py-2 text-xs uppercase tracking-widest bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-semibold"
                  />
                  <InlineTypographyToolbar textKey="brandSubtitle" />
                </div>
              </div>

              {/* Logo Badge Dimensions & Controls */}
              <div className="bg-[#fffdfb] p-4 rounded-xl border border-[#ebd0d6] space-y-3">
                <div className="flex items-center justify-between border-b border-[#faeaee] pb-2">
                  <h4 className="font-serif-display text-base font-bold text-[#4a1c26] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#9e4c5b]" />
                    Circular Logo Badge Size & Graphic
                  </h4>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47]">
                    Circular Badge Dimensions:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'sm', label: 'Small', desc: '40px' },
                      { id: 'md', label: 'Medium', desc: '64px (Default)' },
                      { id: 'lg', label: 'Large', desc: '84px' },
                      { id: 'xl', label: 'X-Large', desc: '112px' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, brandLogoSize: sz.id as any }))}
                        className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          (formData.brandLogoSize || 'md') === sz.id
                            ? 'bg-[#9e4c5b] text-white border-[#7a3b47] shadow-xs'
                            : 'bg-white hover:bg-[#faeaee] text-stone-700 border-stone-200'
                        }`}
                      >
                        <span className="block text-xs font-bold leading-tight">{sz.label}</span>
                        <span className="block text-[10px] opacity-75 font-mono">{sz.desc}</span>
                      </button>
                    ))}
                  </div>

                  {onUploadLogo && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={onUploadLogo}
                        className="px-3.5 py-1.5 bg-[#fcedf0] hover:bg-[#faeaee] text-[#8b3d4d] border border-[#e0c2c8] rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Upload Custom Logo File...
                      </button>
                      <span className="text-[11px] text-stone-500">
                        {customLogoUrl ? 'Custom logo is active.' : 'Using illustrated teacup & floral garland medallion.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Brand Presets */}
              <div className="p-3.5 bg-[#fdf4f6] rounded-xl border border-[#ebd0d6]">
                <span className="text-xs font-bold text-[#7a3b47] flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                  Quick Brand Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'TeeCake', subtitle: 'CREATIONS' },
                    { name: 'TeeCake', subtitle: 'ARTISAN PATISSERIE' },
                    { name: 'TeeCake', subtitle: 'TEAROOM & BAKERY' },
                    { name: 'Tyneside Bakehouse', subtitle: 'TEA ROOM & PATISSERIE' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          brandName: p.name,
                          brandSubtitle: p.subtitle,
                        }))
                      }
                      className="p-2 bg-white hover:bg-[#faeaee] border border-[#ebd0d6] rounded-lg text-left cursor-pointer transition-colors"
                    >
                      <span className="font-serif-display font-bold text-xs text-[#5e2632] block">{p.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[#9b6832] font-semibold block">{p.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* TAB 1: QUOTES & LOCATION (FULL ACCESS) */}
          {activeTab === 'other' && (
            <div className="space-y-6">
              
              {/* One-Click Newcastle / UK Theme Box */}
              <div className="p-4 bg-gradient-to-r from-[#faeaee] to-[#fff3f5] rounded-xl border-2 border-[#e8bac4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#4a1c26] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c99750]" />
                    Newcastle upon Tyne & UK Quick-Apply
                  </h3>
                  <p className="text-xs text-[#6e3943] mt-0.5">
                    Fills in British baking quotes, Earl Grey references, Grey Street address, and 0191 phone with one click.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApplyNewcastleTheme}
                  className="px-4 py-2 bg-[#9e4c5b] hover:bg-[#853c49] text-white text-xs font-bold rounded-lg shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f9d77e]" />
                  <span>Apply Newcastle Theme</span>
                </button>
              </div>

              {/* PART A: QUOTES SECTION */}
              <div className="bg-[#fffdfb] p-4 rounded-xl border border-[#ebd0d6] space-y-4">
                <div className="flex items-center justify-between border-b border-[#faeaee] pb-2">
                  <h4 className="font-serif-display text-base font-bold text-[#4a1c26] flex items-center gap-1.5">
                    <Quote className="w-4 h-4 text-[#9e4c5b]" />
                    Quotes Section Headings
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Quotes Section Heading
                  </label>
                  <input
                    type="text"
                    value={formData.quotesHeading ?? ''}
                    onChange={(e) => handleChange('quotesHeading', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                  />
                  <InlineTypographyToolbar textKey="quotesHeading" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Quotes Section Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={formData.quotesSubheading ?? ''}
                    onChange={(e) => handleChange('quotesSubheading', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                  />
                  <InlineTypographyToolbar textKey="quotesSubheading" />
                </div>

                {/* List of individual Quotes */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4a1c26]">
                      Baking Quotes ({quoteList.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuote}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#8b3d4d] bg-[#fcedf0] hover:bg-[#f7dbe1] rounded-md cursor-pointer transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#9e4c5b]" />
                      <span>Add Quote</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {quoteList.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-3 bg-white rounded-lg border border-[#ebd0d6] shadow-2xs relative group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-[#9e4c5b]">
                            Quote #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuote(idx)}
                            className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                            title="Delete this quote"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={q.quote}
                          onChange={(e) => handleQuoteChange(idx, 'quote', e.target.value)}
                          placeholder="Quote text..."
                          className="w-full px-3 py-1.5 text-xs bg-[#fffcfd] border border-stone-200 rounded focus:border-[#9e4c5b] focus:outline-hidden mb-2 text-stone-800 resize-none font-serif-subtle italic"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-stone-500 mb-0.5">
                              Author / Speaker
                            </span>
                            <input
                              type="text"
                              value={q.author}
                              onChange={(e) => handleQuoteChange(idx, 'author', e.target.value)}
                              placeholder="e.g. Tyneside Bakehouse Philosophy"
                              className="w-full px-2.5 py-1 text-xs bg-[#fffcfd] border border-stone-200 rounded focus:border-[#9e4c5b] focus:outline-hidden text-stone-800"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-stone-500 mb-0.5">
                              Tag / Context
                            </span>
                            <input
                              type="text"
                              value={q.context || ''}
                              onChange={(e) => handleQuoteChange(idx, 'context', e.target.value)}
                              placeholder="e.g. A Proper Brew & Bake"
                              className="w-full px-2.5 py-1 text-xs bg-[#fffcfd] border border-stone-200 rounded focus:border-[#9e4c5b] focus:outline-hidden text-stone-800"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PART B: LOCATION & CONTACT SECTION */}
              <div className="bg-[#fffdfb] p-4 rounded-xl border border-[#ebd0d6] space-y-4">
                <div className="flex items-center justify-between border-b border-[#faeaee] pb-2">
                  <h4 className="font-serif-display text-base font-bold text-[#4a1c26] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#9e4c5b]" />
                    Location Section & Contact Details
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Location Section Heading
                  </label>
                  <input
                    type="text"
                    value={formData.locationHeading ?? ''}
                    onChange={(e) => handleChange('locationHeading', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                  />
                  <InlineTypographyToolbar textKey="locationHeading" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Location Section Subtitle / Welcome Text
                  </label>
                  <textarea
                    rows={2}
                    value={formData.locationSubheading ?? ''}
                    onChange={(e) => handleChange('locationSubheading', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                  />
                  <InlineTypographyToolbar textKey="locationSubheading" />
                </div>

                {/* Direct Address & Phone inputs */}
                <div className="pt-2 border-t border-stone-100 space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#4a1c26]">
                    Bakehouse Boutique Address & Contact Info
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#9e4c5b]" /> Bakery / Cafe Name
                      </label>
                      <input
                        type="text"
                        value={contactData.name ?? ''}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        placeholder="e.g. Tyneside Bakehouse"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b] focus:outline-hidden text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#9e4c5b]" /> Street Address
                      </label>
                      <input
                        type="text"
                        value={contactData.address ?? ''}
                        onChange={(e) => handleContactChange('address', e.target.value)}
                        placeholder="e.g. 14 Grey Street"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b] focus:outline-hidden text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        City, Postcode & Country
                      </label>
                      <input
                        type="text"
                        value={contactData.cityStateZip ?? ''}
                        onChange={(e) => handleContactChange('cityStateZip', e.target.value)}
                        placeholder="Newcastle upon Tyne, NE1 6EE, UK"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b] focus:outline-hidden text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#9e4c5b]" /> Phone Number
                      </label>
                      <input
                        type="text"
                        value={contactData.phone ?? ''}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="+44 (0) 191 234 5678"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b] focus:outline-hidden text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#9e4c5b]" /> Email Address
                      </label>
                      <input
                        type="text"
                        value={contactData.email ?? ''}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        placeholder="hello@tynesidebakehouse.co.uk"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b] focus:outline-hidden text-stone-800"
                      />
                    </div>
                  </div>

                  {/* Opening Hours list */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-bold text-stone-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9e4c5b]" /> Opening Hours Schedule
                      </label>
                      <button
                        type="button"
                        onClick={handleAddHourRow}
                        className="text-[11px] font-semibold text-[#8b3d4d] hover:underline cursor-pointer"
                      >
                        + Add Schedule Row
                      </button>
                    </div>

                    <div className="space-y-2">
                      {contactData.hours.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h.days}
                            onChange={(e) => handleHourRowChange(i, 'days', e.target.value)}
                            placeholder="e.g. Tuesday – Saturday"
                            className="w-1/3 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded focus:border-[#9e4c5b] text-stone-800"
                          />
                          <input
                            type="text"
                            value={h.time}
                            onChange={(e) => handleHourRowChange(i, 'time', e.target.value)}
                            placeholder="e.g. 8:00 AM – 5:00 PM"
                            className="w-1/3 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded focus:border-[#9e4c5b] text-stone-800"
                          />
                          <input
                            type="text"
                            value={h.note || ''}
                            onChange={(e) => handleHourRowChange(i, 'note', e.target.value)}
                            placeholder="Note (optional)"
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded focus:border-[#9e4c5b] text-stone-800"
                          />
                          {contactData.hours.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHourRow(i)}
                              className="text-stone-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & HEADLINES */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-[#faeaee] to-[#fff3f5] rounded-xl border border-[#e8bac4] flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#4a1c26] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                  Quick-Fill UK / Newcastle Hero Copy
                </span>
                <button
                  type="button"
                  onClick={handleApplyNewcastleHero}
                  className="px-3 py-1 bg-[#9e4c5b] hover:bg-[#853c49] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Apply Newcastle Hero Copy
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Hero Top Emblem / Badge
                </label>
                <input
                  type="text"
                  value={formData.heroEmblem ?? ''}
                  onChange={(e) => handleChange('heroEmblem', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                />
                <InlineTypographyToolbar textKey="heroEmblem" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Main Hero Title
                </label>
                <input
                  type="text"
                  value={formData.heroTitle ?? ''}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                />
                <InlineTypographyToolbar textKey="heroHeading" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubheading ?? ''}
                  onChange={(e) => handleChange('heroSubheading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                />
                <InlineTypographyToolbar textKey="heroSubheading" />

                {/* 10 Curated Catchy Taglines Quick Chooser */}
                <div className="mt-2.5 p-3 bg-[#fdf2f4] rounded-xl border border-[#edd1d7]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#7a3b47] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                      Top 10 Curated Catchy Taglines (Click any to test & apply):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {TOP_CAFE_TAGLINES.map((tagline, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleChange('heroSubheading', tagline)}
                        className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-start gap-1.5 ${
                          formData.heroSubheading === tagline
                            ? 'bg-[#9e4c5b] text-white border-[#7d3240] font-semibold shadow-xs'
                            : 'bg-white hover:bg-[#faeaee] text-[#5e2632] border-[#ebd0d6]'
                        }`}
                        title="Click to apply this tagline"
                      >
                        <span className="opacity-60 text-[10px] font-mono shrink-0 pt-0.5">
                          {i + 1}.
                        </span>
                        <span className="leading-snug">&ldquo;{tagline}&rdquo;</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Feature Badge 1
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadge1 ?? ''}
                    onChange={(e) => handleChange('heroBadge1', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Feature Badge 2
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadge2 ?? ''}
                    onChange={(e) => handleChange('heroBadge2', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                    Feature Badge 3
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadge3 ?? ''}
                    onChange={(e) => handleChange('heroBadge3', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIGNATURE DISHES */}
          {activeTab === 'signature' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Signature Top Emblem
                </label>
                <input
                  type="text"
                  value={formData.signatureEmblem ?? ''}
                  onChange={(e) => handleChange('signatureEmblem', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                />
                <InlineTypographyToolbar textKey="signatureEmblem" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Signature Section Heading
                </label>
                <input
                  type="text"
                  value={formData.signatureHeading ?? ''}
                  onChange={(e) => handleChange('signatureHeading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                />
                <InlineTypographyToolbar textKey="signatureHeading" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Signature Section Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.signatureSubheading ?? ''}
                  onChange={(e) => handleChange('signatureSubheading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                />
                <InlineTypographyToolbar textKey="signatureSubheading" />
              </div>
            </div>
          )}

          {/* TAB 4: DISHES GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Gallery Top Emblem
                </label>
                <input
                  type="text"
                  value={formData.galleryEmblem ?? ''}
                  onChange={(e) => handleChange('galleryEmblem', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                />
                <InlineTypographyToolbar textKey="galleryEmblem" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Gallery Section Heading
                </label>
                <input
                  type="text"
                  value={formData.galleryHeading ?? ''}
                  onChange={(e) => handleChange('galleryHeading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                />
                <InlineTypographyToolbar textKey="galleryHeading" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Gallery Section Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.gallerySubheading ?? ''}
                  onChange={(e) => handleChange('gallerySubheading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                />
                <InlineTypographyToolbar textKey="gallerySubheading" />
              </div>
            </div>
          )}

          {/* TAB 5: ALL DISHES SECTION */}
          {activeTab === 'all-dishes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  All Dishes Top Emblem
                </label>
                <input
                  type="text"
                  value={formData.allDishesEmblem ?? ''}
                  onChange={(e) => handleChange('allDishesEmblem', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                />
                <InlineTypographyToolbar textKey="allDishesEmblem" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  All Dishes Section Heading
                </label>
                <input
                  type="text"
                  value={formData.allDishesHeading ?? ''}
                  onChange={(e) => handleChange('allDishesHeading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs font-serif-display font-bold"
                />
                <InlineTypographyToolbar textKey="allDishesHeading" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  All Dishes Section Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.allDishesSubheading ?? ''}
                  onChange={(e) => handleChange('allDishesSubheading', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                />
                <InlineTypographyToolbar textKey="allDishesSubheading" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-[#faeaee] border-t border-[#ebd0d6]">
          <button
            type="button"
            onClick={handleResetToDefaults}
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
              <Check className="w-4 h-4" /> Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

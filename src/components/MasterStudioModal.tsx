import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Type,
  Image as ImageIcon,
  Sliders,
  Upload,
  Trash2,
  Check,
  RotateCw,
  Play,
  Pause,
  Palette,
  Eye,
  Layers,
  Phone,
  Mail,
  Clock,
  Flower2,
  Maximize2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  BackdropSettings,
  PageTexts,
  CafeContactDetails,
  CustomUploadedBackdrop,
} from '../types';
import { useTypography } from '../context/TypographyContext';
import { FLOWER_BLOSSOM_PRESETS } from '../data/initialData';
import { compressImageDataUrl } from '../utils/persistentStorage';

interface MasterStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  backdropSettings: BackdropSettings;
  onUpdateBackdropSettings: (settings: BackdropSettings) => void;
  secondsRemaining?: number;
  onNextBackdrop?: () => void;
  onPrevBackdrop?: () => void;
  pageTexts: PageTexts;
  onUpdatePageText: (field: keyof PageTexts, value: string) => void;
  contact: CafeContactDetails;
  onUpdateContact: (contact: CafeContactDetails) => void;
}

type TabType = 'texts' | 'backdrop' | 'contact';

const FONT_FAMILY_OPTIONS = [
  { id: 'victorian', label: 'IM Fell English (Oliver Twist 1838 Victorian)', value: '"IM Fell English", "Cormorant Garamond", Georgia, serif' },
  { id: 'cinzel', label: 'Cinzel Roman (Vintage Classical Inscription)', value: '"Cinzel", Georgia, serif' },
  { id: 'serif', label: 'Playfair Display (Serif Elegance)', value: '"Playfair Display", Georgia, serif' },
  { id: 'cormorant', label: 'Cormorant Garamond (Editorial Luxury)', value: '"Cormorant Garamond", Georgia, serif' },
  { id: 'sans', label: 'Modern Sans-Serif (Crisp & Clean)', value: 'system-ui, -apple-system, sans-serif' },
  { id: 'mono', label: 'Artisan Monospace (Typewriter Atelier)', value: 'ui-monospace, monospace' },
  { id: 'cursive', label: 'Botanical Script (Handwritten Cursive)', value: 'cursive, "Brush Script MT", Georgia' },
];

const PRESET_COLORS = [
  { label: 'Deep Victorian Mahogany', hex: '#3d1c14' },
  { label: 'Burgundy Rose', hex: '#7a2838' },
  { label: 'Antique Gold', hex: '#b8863b' },
  { label: 'Deep Espresso', hex: '#261b17' },
  { label: 'Warm Cocoa', hex: '#543126' },
  { label: 'Aged Charcoal', hex: '#2c2929' },
  { label: 'Floral Blush', hex: '#be5d71' },
];

const SITE_TEXT_KEYS: { key: keyof PageTexts; label: string; group: string }[] = [
  { key: 'brandName', label: 'Brand Name', group: 'Header & Brand' },
  { key: 'brandSubtitle', label: 'Brand Subtitle / Est.', group: 'Header & Brand' },
  { key: 'heroEmblem', label: 'Hero Victorian Emblem Badge', group: 'Hero Section' },
  { key: 'heroTitle', label: 'Hero Main Title', group: 'Hero Section' },
  { key: 'heroSubheading', label: 'Hero Story & Subtitle', group: 'Hero Section' },
  { key: 'heroBadge1', label: 'Hero Feature Badge 1', group: 'Hero Section' },
  { key: 'heroBadge2', label: 'Hero Feature Badge 2', group: 'Hero Section' },
  { key: 'heroBadge3', label: 'Hero Feature Badge 3', group: 'Hero Section' },
  { key: 'heroCta1', label: 'Hero Primary Button Text', group: 'Hero Section' },
  { key: 'heroCta2', label: 'Hero Secondary Button Text', group: 'Hero Section' },
  { key: 'signatureEmblem', label: 'Signature Section Emblem', group: 'Signature Section' },
  { key: 'signatureHeading', label: 'Signature Menu Title', group: 'Signature Section' },
  { key: 'signatureSubheading', label: 'Signature Menu Subheading', group: 'Signature Section' },
  { key: 'galleryEmblem', label: 'Gallery Section Emblem', group: 'Gallery Section' },
  { key: 'galleryHeading', label: 'Dishes Gallery Title', group: 'Gallery Section' },
  { key: 'gallerySubheading', label: 'Dishes Gallery Subheading', group: 'Gallery Section' },
  { key: 'allDishesEmblem', label: 'Catalog Section Emblem', group: 'Catalog Section' },
  { key: 'allDishesHeading', label: 'All Creations Catalog Title', group: 'Catalog Section' },
  { key: 'allDishesSubheading', label: 'All Creations Catalog Subtitle', group: 'Catalog Section' },
  { key: 'quotesHeading', label: 'Art of Baking Quotes Title', group: 'Quotes Section' },
  { key: 'quotesSubheading', label: 'Art of Baking Quotes Subtitle', group: 'Quotes Section' },
  { key: 'oliverQuote', label: 'Oliver Twist Featured Quote', group: 'Quotes Section' },
  { key: 'oliverQuoteAuthor', label: 'Oliver Twist Author & Citation', group: 'Quotes Section' },
  { key: 'locationHeading', label: 'Contact & Orders Title', group: 'Contact Section' },
  { key: 'locationSubheading', label: 'Contact & Orders Subtitle', group: 'Contact Section' },
  { key: 'footerMotto', label: 'Footer Bakehouse Motto', group: 'Footer Section' },
  { key: 'footerCopyright', label: 'Footer Bottom Note', group: 'Footer Section' },
];

export const MasterStudioModal: React.FC<MasterStudioModalProps> = ({
  isOpen,
  onClose,
  backdropSettings,
  onUpdateBackdropSettings,
  secondsRemaining,
  onNextBackdrop,
  onPrevBackdrop,
  pageTexts,
  onUpdatePageText,
  contact,
  onUpdateContact,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('texts');
  const [selectedTextKey, setSelectedTextKey] = useState<keyof PageTexts>('heroTitle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    settings: typoSettings,
    updateSettings: updateTypoSettings,
    updateCustomFormat,
    getTextFormatting,
  } = useTypography();

  if (!isOpen) return null;

  const currentFormat = getTextFormatting(selectedTextKey);
  const currentTextValue = pageTexts[selectedTextKey] || '';

  // Handle uploading background images from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      setUploadError('Please select valid image file(s) (PNG, JPG, WebP).');
      return;
    }

    const oversizedFiles = validFiles.filter((f) => f.size > 15 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError('One or more images exceed the 15MB limit.');
      return;
    }

    // Read each file, compress for fast buttery rendering and permanent quota resilience
    const promises = validFiles.map((file, idx) => {
      return new Promise<CustomUploadedBackdrop>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          let dataUrl = ev.target?.result as string;
          if (!dataUrl) {
            reject(new Error('Failed to read image data'));
            return;
          }
          // Compress high-res camera photos to optimal web canvas dimensions (max 1600px)
          try {
            dataUrl = await compressImageDataUrl(dataUrl, 1600, 1600, 0.85);
          } catch (e) {
            console.warn('Backdrop compression skipped:', e);
          }
          resolve({
            id: `custom-bg-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, '').slice(0, 30),
            imageUrl: dataUrl,
            createdAt: new Date().toLocaleDateString(),
          });
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((newItems) => {
        const updatedList = [...newItems, ...(backdropSettings.customUploadedImages || [])];
        const allUploadedIds = updatedList.map((c) => c.id);

        // Immediately set the newest uploaded image as active and enable autoRotate if multiple wallpapers are selected
        onUpdateBackdropSettings({
          ...backdropSettings,
          imageUrl: newItems[0].imageUrl,
          presetName: newItems[0].name,
          locationLabel: 'Custom Upload from Computer',
          noWallpaperMode: false,
          autoRotate: allUploadedIds.length > 1,
          customUploadedImages: updatedList,
          selectedWallpaperIds: allUploadedIds,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch(() => {
        setUploadError('Failed to read one or more images. Please try again.');
      });
  };

  // Handle deleting an uploaded background image
  const handleDeleteUploadedImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = (backdropSettings.customUploadedImages || []).filter((item) => item.id !== id);
    const deletedItem = (backdropSettings.customUploadedImages || []).find((item) => item.id === id);

    let newImageUrl = backdropSettings.imageUrl;
    let newPresetName = backdropSettings.presetName;
    let newLocationLabel = backdropSettings.locationLabel;
    let newNoWallpaper = backdropSettings.noWallpaperMode;
    let newAutoRotate = backdropSettings.autoRotate;

    if (deletedItem && backdropSettings.imageUrl === deletedItem.imageUrl) {
      if (updatedList.length > 0) {
        newImageUrl = updatedList[0].imageUrl;
        newPresetName = updatedList[0].name;
        newLocationLabel = 'Custom Upload';
      } else {
        const remainingPresets = FLOWER_BLOSSOM_PRESETS.filter(
          (p) => !(backdropSettings.hiddenPresetIds || []).includes(p.id)
        );
        if (remainingPresets.length > 0) {
          newImageUrl = remainingPresets[0].imageUrl;
          newPresetName = remainingPresets[0].name;
          newLocationLabel = remainingPresets[0].location;
        } else {
          // No wallpapers left at all! Switch to parchment
          newImageUrl = '';
          newPresetName = 'No Wallpaper (Victorian Aged Parchment)';
          newLocationLabel = 'Oliver Twist 1838 Texture';
          newNoWallpaper = true;
          newAutoRotate = false;
        }
      }
    }

    onUpdateBackdropSettings({
      ...backdropSettings,
      imageUrl: newImageUrl,
      presetName: newPresetName,
      locationLabel: newLocationLabel,
      noWallpaperMode: newNoWallpaper,
      autoRotate: newAutoRotate,
      customUploadedImages: updatedList,
      selectedWallpaperIds: backdropSettings.selectedWallpaperIds
        ? backdropSettings.selectedWallpaperIds.filter((wid) => wid !== id)
        : undefined,
    });
  };

  // Handle deleting / hiding a curated preset wallpaper
  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hidden = backdropSettings.hiddenPresetIds || [];
    const updatedHidden = hidden.includes(presetId) ? hidden : [...hidden, presetId];

    const preset = FLOWER_BLOSSOM_PRESETS.find((p) => p.id === presetId);
    let newImageUrl = backdropSettings.imageUrl;
    let newPresetName = backdropSettings.presetName;
    let newLocationLabel = backdropSettings.locationLabel;
    let newNoWallpaper = backdropSettings.noWallpaperMode;
    let newAutoRotate = backdropSettings.autoRotate;

    if (preset && backdropSettings.imageUrl === preset.imageUrl) {
      const remainingPresets = FLOWER_BLOSSOM_PRESETS.filter((p) => !updatedHidden.includes(p.id));
      if (remainingPresets.length > 0) {
        newImageUrl = remainingPresets[0].imageUrl;
        newPresetName = remainingPresets[0].name;
        newLocationLabel = remainingPresets[0].location;
      } else if ((backdropSettings.customUploadedImages || []).length > 0) {
        newImageUrl = backdropSettings.customUploadedImages![0].imageUrl;
        newPresetName = backdropSettings.customUploadedImages![0].name;
        newLocationLabel = 'Custom Upload';
      } else {
        // No wallpapers left at all! Switch to parchment
        newImageUrl = '';
        newPresetName = 'No Wallpaper (Victorian Aged Parchment)';
        newLocationLabel = 'Oliver Twist 1838 Texture';
        newNoWallpaper = true;
        newAutoRotate = false;
      }
    }

    onUpdateBackdropSettings({
      ...backdropSettings,
      imageUrl: newImageUrl,
      presetName: newPresetName,
      locationLabel: newLocationLabel,
      noWallpaperMode: newNoWallpaper,
      autoRotate: newAutoRotate,
      hiddenPresetIds: updatedHidden,
      selectedWallpaperIds: backdropSettings.selectedWallpaperIds
        ? backdropSettings.selectedWallpaperIds.filter((wid) => wid !== presetId)
        : undefined,
    });
  };

  // Handle restoring all deleted preset wallpapers
  const handleRestorePresets = () => {
    onUpdateBackdropSettings({
      ...backdropSettings,
      hiddenPresetIds: [],
    });
  };

  // Helper to determine all available wallpapers for loop multi-selection
  const hiddenPresetIds = backdropSettings.hiddenPresetIds || [];
  const availablePresets = FLOWER_BLOSSOM_PRESETS.filter((p) => !hiddenPresetIds.includes(p.id));
  const customUploads = backdropSettings.customUploadedImages || [];
  const allAvailableWallpaperIds = [
    ...customUploads.map((c) => c.id),
    ...availablePresets.map((p) => p.id),
  ];

  // Active loop multi-selected wallpaper IDs (default to all available if undefined)
  const currentLoopIds = backdropSettings.selectedWallpaperIds ?? allAvailableWallpaperIds;

  const isWallpaperInLoop = (id: string) => {
    return currentLoopIds.includes(id);
  };

  // Toggle or activate wallpaper in loop
  const handleToggleWallpaperLoop = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyIn = isWallpaperInLoop(id);
    let updated: string[];
    let newActiveId = backdropSettings.activeWallpaperId;
    let newImageUrl = backdropSettings.imageUrl;
    let newPresetName = backdropSettings.presetName;
    let newLocationLabel = backdropSettings.locationLabel;

    if (isCurrentlyIn) {
      updated = currentLoopIds.filter((item) => item !== id);
      // If we just removed the currently showing image, switch to the first remaining active wallpaper
      if (updated.length > 0) {
        const matchingCustom = (backdropSettings.customUploadedImages || []).find((c) => c.id === id);
        const matchingPreset = FLOWER_BLOSSOM_PRESETS.find((p) => p.id === id);
        if (
          backdropSettings.activeWallpaperId === id ||
          (matchingCustom && matchingCustom.imageUrl === backdropSettings.imageUrl) ||
          (matchingPreset && matchingPreset.imageUrl === backdropSettings.imageUrl)
        ) {
          const firstRemainingId = updated[0];
          const nextCustom = (backdropSettings.customUploadedImages || []).find((c) => c.id === firstRemainingId);
          const nextPreset = FLOWER_BLOSSOM_PRESETS.find((p) => p.id === firstRemainingId);
          if (nextCustom) {
            newActiveId = nextCustom.id;
            newImageUrl = nextCustom.imageUrl;
            newPresetName = nextCustom.name;
            newLocationLabel = 'Custom Upload';
          } else if (nextPreset) {
            newActiveId = nextPreset.id;
            newImageUrl = nextPreset.imageUrl;
            newPresetName = nextPreset.name;
            newLocationLabel = nextPreset.location;
          }
        }
      }
    } else {
      // Activating this wallpaper into the loop (allowing more than 1 background to be active)
      updated = [...currentLoopIds, id];
      // Display this newly activated wallpaper immediately on screen
      newActiveId = id;
      const matchingCustom = (backdropSettings.customUploadedImages || []).find((c) => c.id === id);
      const matchingPreset = FLOWER_BLOSSOM_PRESETS.find((p) => p.id === id);
      if (matchingCustom) {
        newImageUrl = matchingCustom.imageUrl;
        newPresetName = matchingCustom.name;
        newLocationLabel = 'Custom Upload';
      } else if (matchingPreset) {
        newImageUrl = matchingPreset.imageUrl;
        newPresetName = matchingPreset.name;
        newLocationLabel = matchingPreset.location;
      }
    }

    onUpdateBackdropSettings({
      ...backdropSettings,
      activeWallpaperId: newActiveId,
      imageUrl: newImageUrl,
      presetName: newPresetName,
      locationLabel: newLocationLabel,
      noWallpaperMode: false,
      autoRotate: updated.length > 1,
      selectedWallpaperIds: updated,
    });
  };

  // Clicking a card toggles it into/out of the loop, or activates it
  const handleSelectBackgroundCard = (id: string, imageUrl: string, name: string, location: string) => {
    const isCurrentlyIn = isWallpaperInLoop(id);
    const updatedLoop = isCurrentlyIn ? currentLoopIds : [...currentLoopIds, id];
    const shouldAutoRotate = updatedLoop.length > 1;

    onUpdateBackdropSettings({
      ...backdropSettings,
      activeWallpaperId: id,
      imageUrl: imageUrl,
      presetName: name,
      locationLabel: location,
      noWallpaperMode: false,
      autoRotate: shouldAutoRotate,
      selectedWallpaperIds: updatedLoop,
    });
  };

  // Solo select: only display this 1 wallpaper statically and pause slideshow
  const handleSelectOnlyThisWallpaper = (id: string, imageUrl: string, name: string, location: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateBackdropSettings({
      ...backdropSettings,
      activeWallpaperId: id,
      imageUrl: imageUrl,
      presetName: name,
      locationLabel: location,
      noWallpaperMode: false,
      autoRotate: false,
      selectedWallpaperIds: [id],
    });
  };

  const handleSelectAllForLoop = () => {
    onUpdateBackdropSettings({
      ...backdropSettings,
      selectedWallpaperIds: allAvailableWallpaperIds,
      noWallpaperMode: false,
      autoRotate: allAvailableWallpaperIds.length > 1,
    });
  };

  const handleSelectOnlyUploads = () => {
    const uploadIds = (backdropSettings.customUploadedImages || []).map((c) => c.id);
    if (uploadIds.length === 0) return;
    const firstCustom = backdropSettings.customUploadedImages![0];
    onUpdateBackdropSettings({
      ...backdropSettings,
      activeWallpaperId: firstCustom.id,
      imageUrl: firstCustom.imageUrl,
      presetName: firstCustom.name,
      locationLabel: 'Custom Upload',
      noWallpaperMode: false,
      autoRotate: uploadIds.length > 1,
      selectedWallpaperIds: uploadIds,
    });
  };

  const handleDeselectAllForLoop = () => {
    onUpdateBackdropSettings({
      ...backdropSettings,
      selectedWallpaperIds: [],
      autoRotate: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-[#fffaf8] border border-[#e8c0c8] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fcedf0] border-b border-[#ebd0d6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl text-[#9e4c5b] shadow-2xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#5e2632] leading-tight">
                Master Studio Control
              </h2>
              <p className="text-xs text-[#8f5d68]">
                One-stop studio to customize all texts, font styles, colors, temple backdrops & orders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-white/80 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#ebd0d6] bg-[#fdf5f7] px-6 gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('texts')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'texts'
                ? 'border-[#9e4c5b] text-[#9e4c5b] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-[#5e2632]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>All Texts & Typography</span>
          </button>

          <button
            onClick={() => setActiveTab('backdrop')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'backdrop'
                ? 'border-[#9e4c5b] text-[#9e4c5b] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-[#5e2632]'
            }`}
          >
            <Flower2 className="w-4 h-4 text-[#df7084]" />
            <span>Background & Temple Drop</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-[#9e4c5b] text-[#9e4c5b] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-[#5e2632]'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact & Inquiries</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 grow bg-[#fffdfb]">
          
          {/* TAB 1: ALL TEXTS, FONT SIZE, COLOR, FONT STYLE */}
          {activeTab === 'texts' && (
            <div className="space-y-6">
              
              {/* Top Banner / Helper */}
              <div className="p-3.5 bg-[#fcedf0]/70 border border-[#edd7dd] rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs text-[#733543]">
                  <strong>Select any text element</strong> on the site to adjust its <strong>Font Size, Color, Weight, Italic & Font Style</strong> in real-time.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs font-semibold text-stone-600">Global Text Scale:</label>
                  <select
                    value={typoSettings.globalScale || 1.0}
                    onChange={(e) => updateTypoSettings({ globalScale: parseFloat(e.target.value) })}
                    className="text-xs bg-white border border-[#ebd0d6] rounded-lg px-2 py-1 font-semibold text-[#5e2632]"
                  >
                    <option value={0.9}>Compact (90%)</option>
                    <option value={1.0}>Default (100%)</option>
                    <option value={1.1}>Large (110%)</option>
                    <option value={1.2}>Extra Large (120%)</option>
                    <option value={1.3}>Huge (130%)</option>
                  </select>
                </div>
              </div>

              {/* Text Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Select Text Element */}
                <div className="md:col-span-5 bg-white border border-[#ebd0d6] rounded-2xl p-4 shadow-2xs max-h-[480px] overflow-y-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8a4b57] block mb-3">
                    Choose Site Text Element
                  </span>

                  <div className="space-y-1.5">
                    {SITE_TEXT_KEYS.map((item) => {
                      const isSelected = selectedTextKey === item.key;
                      const val = pageTexts[item.key] || '';
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedTextKey(item.key)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#faeaee] border-[#df7084] shadow-2xs'
                              : 'bg-stone-50/70 border-transparent hover:bg-stone-100 hover:border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#5e2632]">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {item.group}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 truncate mt-0.5">
                            {val}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Controls for Selected Text */}
                <div className="md:col-span-7 bg-white border border-[#ebd0d6] rounded-2xl p-5 shadow-2xs space-y-5">
                  
                  {/* Active Text Element Header */}
                  <div className="border-b border-[#f0d8de] pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#9e4c5b] uppercase tracking-wider">
                        Now Editing
                      </span>
                      <h4 className="font-serif-display text-lg font-bold text-[#4a1c26]">
                        {SITE_TEXT_KEYS.find((k) => k.key === selectedTextKey)?.label || selectedTextKey}
                      </h4>
                    </div>
                    <button
                      onClick={() =>
                        updateCustomFormat(selectedTextKey, {
                          fontSizeStep: 0,
                          fontWeight: undefined,
                          color: undefined,
                          fontFamily: undefined,
                          italic: false,
                        })
                      }
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      Reset to Default
                    </button>
                  </div>

                  {/* 1. Edit Text Content */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Text Content
                    </label>
                    <textarea
                      rows={2}
                      value={currentTextValue}
                      onChange={(e) => onUpdatePageText(selectedTextKey, e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#fffcfd] border border-[#ebd0d6] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#9e4c5b]"
                    />
                  </div>

                  {/* 2. Font Size Stepper */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-[#9e4c5b]" /> Font Size
                      </label>
                      <span className="text-xs font-mono font-bold text-[#9e4c5b] bg-[#fcedf0] px-2 py-0.5 rounded border border-[#eed0d6]">
                        {currentFormat.fontSizeStep === -1
                          ? 'Compact (-12%)'
                          : currentFormat.fontSizeStep === 1
                          ? 'Large (+16%)'
                          : currentFormat.fontSizeStep === 2
                          ? 'Extra Large (+32%)'
                          : currentFormat.fontSizeStep === 3
                          ? 'Huge (+52%)'
                          : currentFormat.fontSizeStep === 4
                          ? 'Maximum (+76%)'
                          : 'Default (100%)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                      {[
                        { step: -1, label: '-12%' },
                        { step: 0, label: 'Normal' },
                        { step: 1, label: '+16%' },
                        { step: 2, label: '+32%' },
                        { step: 3, label: '+52%' },
                        { step: 4, label: '+76%' },
                      ].map((btn) => (
                        <button
                          key={btn.step}
                          onClick={() => updateCustomFormat(selectedTextKey, { fontSizeStep: btn.step })}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            (currentFormat.fontSizeStep ?? 0) === btn.step
                              ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Font Style & Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Font Family */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        Font Style (Family)
                      </label>
                      <select
                        value={currentFormat.fontFamily || 'serif'}
                        onChange={(e) =>
                          updateCustomFormat(selectedTextKey, {
                            fontFamily: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800"
                      >
                        {FONT_FAMILY_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        Font Bold / Weight
                      </label>
                      <select
                        value={currentFormat.fontWeight || 'normal'}
                        onChange={(e) =>
                          updateCustomFormat(selectedTextKey, {
                            fontWeight: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800 font-semibold"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                        <option value="extrabold">Extra Bold</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Text Color Picker & Swatches */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#9e4c5b]" /> Text Color
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Color swatch buttons */}
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => updateCustomFormat(selectedTextKey, { color: c.hex })}
                          title={c.label}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-2xs ${
                            currentFormat.color === c.hex
                              ? 'scale-110 border-black ring-2 ring-[#df7084]'
                              : 'border-white hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}

                      {/* Custom color input */}
                      <div className="flex items-center gap-1.5 ml-2 border-l border-stone-200 pl-3">
                        <input
                          type="color"
                          value={currentFormat.color || '#4a1c26'}
                          onChange={(e) => updateCustomFormat(selectedTextKey, { color: e.target.value })}
                          className="w-7 h-7 rounded-md cursor-pointer border border-stone-300 p-0"
                          title="Choose custom color"
                        />
                        <span className="font-mono text-[11px] text-stone-600">
                          {currentFormat.color || 'Default'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Alignment & Italic */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-600">Style:</span>
                      <button
                        onClick={() =>
                          updateCustomFormat(selectedTextKey, {
                            italic: !currentFormat.italic,
                          })
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 cursor-pointer ${
                          currentFormat.italic
                            ? 'bg-[#9e4c5b] text-white border-[#853c49]'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        <Italic className="w-3 h-3" /> Italic
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-stone-600 mr-1">Align:</span>
                      {(['left', 'center', 'right'] as const).map((al) => (
                        <button
                          key={al}
                          onClick={() => updateCustomFormat(selectedTextKey, { textAlign: al })}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            (currentFormat.textAlign || 'center') === al
                              ? 'bg-[#faeaee] text-[#9e4c5b] border-[#e8ccd2]'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {al === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : al === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div className="p-4 rounded-xl bg-[#fbf5f2] border border-[#ecd5cb] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Live Text Preview
                    </span>
                    <div
                      className="p-3 bg-white rounded-lg border border-[#f0ded5] min-h-[50px] flex items-center justify-center transition-all"
                      style={{
                        color: currentFormat.color,
                        fontFamily:
                          currentFormat.fontFamily === 'victorian'
                            ? '"IM Fell English", "Cormorant Garamond", Georgia, serif'
                            : currentFormat.fontFamily === 'cinzel'
                            ? '"Cinzel", Georgia, serif'
                            : currentFormat.fontFamily === 'serif' || currentFormat.fontFamily === 'playfair'
                            ? '"Playfair Display", Georgia, serif'
                            : currentFormat.fontFamily === 'cormorant'
                            ? '"Cormorant Garamond", Georgia, serif'
                            : currentFormat.fontFamily === 'sans'
                            ? 'system-ui, -apple-system, sans-serif'
                            : currentFormat.fontFamily === 'mono'
                            ? 'ui-monospace, monospace'
                            : currentFormat.fontFamily === 'cursive'
                            ? 'cursive, "Brush Script MT", Georgia'
                            : undefined,
                        fontStyle: currentFormat.italic ? 'italic' : 'normal',
                        fontWeight: currentFormat.fontWeight || 'bold',
                        textAlign: currentFormat.textAlign || 'center',
                      }}
                    >
                      {currentTextValue || 'Sample Text Preview'}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND & TEMPLE DROP (UPLOAD FROM COMPUTER & DELETE) */}
          {activeTab === 'backdrop' && (
            <div className="space-y-6">

              {/* SECTION A: UPLOAD FROM COMPUTER (AUTO-ACTIVATES ALL UPLOADED WALLPAPERS) */}
              <div className="p-5 bg-gradient-to-br from-[#fef5f7] to-[#fff4ee] border-2 border-dashed border-[#df7084] rounded-2xl shadow-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl text-[#9e4c5b] shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif-display text-base font-bold text-[#5e2632]">
                        Upload Background Image(s) from Your Computer
                      </h4>
                      <p className="text-xs text-[#7d4853]">
                        Upload any photo (or multiple photos) from your computer. Every image you upload is automatically activated and displayed in your background rotation loop.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] shadow-sm hover:shadow-md transition-all cursor-pointer tracking-wide shrink-0 overflow-hidden"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-4 h-4" />
                      <span>Choose File(s) from Computer</span>
                    </label>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 mt-2 font-semibold">
                    {uploadError}
                  </p>
                )}
              </div>

              {/* SECTION 0: VICTORIAN AGED PARCHMENT / NO WALLPAPER TOGGLE */}
              <div className="p-4 bg-[#fbf6ec] border border-[#d6be96] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#eedfbe] text-[#59341f] rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif-display text-sm font-bold text-[#42220f]">
                      Victorian Aged Parchment Mode (No Wallpaper)
                    </h4>
                    <p className="text-xs text-[#70482b]">
                      Display authentic Oliver Twist 1838 aged tea-stained parchment paper texture instead of photo wallpapers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateBackdropSettings({
                      ...backdropSettings,
                      noWallpaperMode: !backdropSettings.noWallpaperMode,
                    })
                  }
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    backdropSettings.noWallpaperMode
                      ? 'bg-[#59341f] text-white shadow-sm'
                      : 'bg-white border border-[#c4a478] text-[#59341f] hover:bg-[#f3ebd9]'
                  }`}
                >
                  {backdropSettings.noWallpaperMode ? '✓ Parchment Mode Active' : 'Enable Parchment Mode'}
                </button>
              </div>

              {/* SLIDESHOW LOOP MULTI-SELECT & TIMER CONTROLS HEADER BAR */}
              <div className="p-4 bg-gradient-to-r from-[#fdf0f3] via-[#fae8ec] to-[#f8e0e6] border-2 border-[#e098a8] rounded-2xl shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1.5 bg-[#9e4c5b] text-white rounded-lg shadow-2xs">
                        <RotateCw className="w-4 h-4" />
                      </span>
                      <h4 className="font-serif-display text-base font-bold text-[#4a1c26]">
                        Wallpaper Slideshow & Rotation Timer
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs flex items-center gap-1 ${
                        currentLoopIds.length > 1
                          ? 'bg-emerald-600 text-white'
                          : currentLoopIds.length === 1
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-500 text-white'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                        {currentLoopIds.length} of {allAvailableWallpaperIds.length} Selected
                      </span>
                    </div>
                    <p className="text-xs text-[#703b47] mt-1">
                      Select 2 or more wallpapers below and they will automatically cycle and fade slowly on your page.
                    </p>
                  </div>

                  {/* Multi-Select Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0 w-full sm:w-auto">
                    {(backdropSettings.customUploadedImages || []).length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectOnlyUploads}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#9e4c5b] hover:bg-[#853c49] text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                        title="Select only custom uploaded images to cycle in slideshow"
                      >
                        <span>Only My Uploads ({backdropSettings.customUploadedImages?.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSelectAllForLoop}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      title="Activate all wallpapers to cycle in loop"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Select All ({allAvailableWallpaperIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllForLoop}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs transition-all cursor-pointer"
                      title="Clear active backgrounds"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Slideshow Status & Direct Play/Pause + Timer Adjustment */}
                <div className="pt-3 border-t border-[#ebd0d6] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/60 p-3 rounded-xl">
                  {/* Status & Play/Pause */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          autoRotate: !backdropSettings.autoRotate,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        backdropSettings.autoRotate
                          ? 'bg-[#9e4c5b] text-white hover:bg-[#853c49]'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {backdropSettings.autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{backdropSettings.autoRotate ? 'Pause Slideshow' : 'Start Auto-Slideshow'}</span>
                    </button>

                    <div className="text-xs">
                      {currentLoopIds.length > 1 ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>
                            Auto-cycling {currentLoopIds.length} wallpapers (change in{' '}
                            <span className="font-mono font-bold text-[#9e4c5b]">
                              {secondsRemaining !== undefined ? `${secondsRemaining}s` : `${backdropSettings.intervalSeconds || 10}s`}
                            </span>
                            ).
                          </span>
                        </div>
                      ) : currentLoopIds.length === 1 ? (
                        <span className="text-stone-600 font-medium">
                          💡 1 wallpaper selected. Click another wallpaper or "+ Add" to start auto-changing.
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">
                          ⚠️ No wallpapers in rotation. Showing parchment.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Manual Prev / Next Buttons */}
                  <div className="flex items-center gap-1.5 self-end md:self-auto">
                    {onPrevBackdrop && (
                      <button
                        type="button"
                        onClick={onPrevBackdrop}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-[#e098a8] text-[#703b47] hover:bg-[#fae8ec] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Previous wallpaper in loop"
                      >
                        <SkipBack className="w-3 h-3" /> Prev
                      </button>
                    )}
                    {onNextBackdrop && (
                      <button
                        type="button"
                        onClick={onNextBackdrop}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#9e4c5b] text-white hover:bg-[#853c49] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Switch to next wallpaper now"
                      >
                        Next <SkipForward className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Inline Timer & Slow Fade Dissolve Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#eed0d6]">
                  {/* Rotation Interval Duration */}
                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#eed0d6] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9e4c5b]" />
                        Timer Rotation Interval:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateBackdropSettings({
                              ...backdropSettings,
                              intervalSeconds: Math.max(2, (backdropSettings.intervalSeconds || 10) - 1),
                            })
                          }
                          className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                          title="Decrease 1 second"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="2"
                          max="180"
                          value={backdropSettings.intervalSeconds || 10}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              onUpdateBackdropSettings({
                                ...backdropSettings,
                                intervalSeconds: Math.max(2, Math.min(180, val)),
                              });
                            }
                          }}
                          className="w-11 px-1 py-0.5 text-center font-mono font-bold text-[#9e4c5b] bg-[#faeaee] border border-[#e4b3bc] rounded text-xs"
                        />
                        <span className="text-xs text-stone-600 font-semibold">sec</span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateBackdropSettings({
                              ...backdropSettings,
                              intervalSeconds: Math.min(180, (backdropSettings.intervalSeconds || 10) + 1),
                            })
                          }
                          className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                          title="Increase 1 second"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="3"
                      max="60"
                      step="1"
                      value={backdropSettings.intervalSeconds || 10}
                      onChange={(e) =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          intervalSeconds: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-[#9e4c5b] cursor-pointer"
                    />

                    {/* Quick interval chips */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {[3, 5, 8, 10, 15, 20, 30, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() =>
                            onUpdateBackdropSettings({
                              ...backdropSettings,
                              intervalSeconds: sec,
                            })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            (backdropSettings.intervalSeconds || 10) === sec
                              ? 'bg-[#9e4c5b] text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slow Fade Dissolve Speed */}
                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#eed0d6] space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                        Slow Fade Dissolve Speed:
                      </span>
                      <span className="font-mono font-bold text-[#9e4c5b] text-xs">
                        {((backdropSettings.fadeDuration || 3000) / 1000).toFixed(1)}s
                      </span>
                    </div>

                    <select
                      value={backdropSettings.fadeDuration || 3000}
                      onChange={(e) =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          fadeDuration: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800 font-medium cursor-pointer"
                    >
                      <option value={5000}>Cinema Ultra Slow (5.0s)</option>
                      <option value={4000}>Dreamy Slow Fade (4.0s)</option>
                      <option value={3000}>Smooth Slow Dissolve (3.0s)</option>
                      <option value={2000}>Gentle Fade (2.0s)</option>
                      <option value={1000}>Subtle Dissolve (1.0s)</option>
                      <option value={400}>Quick Cut (0.4s)</option>
                    </select>

                    <div className="text-[10px] text-stone-500 italic">
                      Seamless dual-layer dissolve with zero flash or brightness dip.
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: USER'S UPLOADED CUSTOM BACKGROUNDS (WITH MULTI-SELECT & DELETE) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-serif-display text-base font-bold text-[#4a1c26]">
                      Your Uploaded Background Images
                    </h4>
                    <span className="text-xs text-stone-500">
                      Click any image to activate into loop and display. You can activate multiple uploaded backgrounds.
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {(backdropSettings.customUploadedImages || []).length} uploaded
                  </span>
                </div>

                {(backdropSettings.customUploadedImages || []).length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 text-stone-500 text-xs">
                    No custom backgrounds uploaded yet. Click "Choose File(s) from Computer" above to upload your images!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(backdropSettings.customUploadedImages || []).map((img) => {
                      const isShowingNow = (backdropSettings.activeWallpaperId === img.id || backdropSettings.imageUrl === img.imageUrl) && !backdropSettings.noWallpaperMode;
                      const isActiveInLoop = isWallpaperInLoop(img.id);
                      return (
                        <div
                          key={img.id}
                          onClick={() => handleSelectBackgroundCard(img.id, img.imageUrl, img.name, 'Custom Upload')}
                          className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-4/3 shadow-2xs ${
                            isActiveInLoop
                              ? 'border-emerald-600 ring-2 ring-emerald-400/60 bg-emerald-50/20'
                              : 'border-stone-200 opacity-65 hover:opacity-100 hover:border-[#9e4c5b]'
                          }`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=400&auto=format&fit=crop';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />

                          {/* Top Controls: Active Status, Loop Toggle Checkbox, & Delete */}
                          <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between gap-1 z-10">
                            {/* Loop Multi-Select Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleWallpaperLoop(img.id, e)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                                isActiveInLoop
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-white/60'
                                  : 'bg-black/65 hover:bg-black/85 text-stone-300'
                              }`}
                              title={isActiveInLoop ? 'Active in loop (click to deactivate)' : 'Click to activate for loop'}
                            >
                              <Check className={`w-2.5 h-2.5 ${isActiveInLoop ? 'opacity-100 stroke-[3]' : 'opacity-30'}`} />
                              <span>{isActiveInLoop ? 'Active in Loop' : '+ Activate'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {isShowingNow && (
                                <span className="px-1.5 py-0.5 bg-[#9e4c5b] text-white text-[9px] font-bold rounded-full shadow-xs flex items-center gap-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                  Showing Now
                                </span>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteUploadedImage(img.id, e)}
                                className="p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-md transition-all hover:scale-110 cursor-pointer"
                                title="Delete this uploaded background image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom Caption */}
                          <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] font-medium truncate">
                            {img.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION C: CURATED BLOSSOM & VICTORIAN PRESETS (WITH MULTI-SELECT & DELETE) */}
              <div className="pt-4 border-t border-[#f0d8de]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-serif-display text-base font-bold text-[#4a1c26]">
                      Curated Wallpaper Presets
                    </h4>
                    <p className="text-xs text-stone-500">
                      Click any preset to activate into loop. Multiple presets can be active simultaneously.
                    </p>
                  </div>
                  {(backdropSettings.hiddenPresetIds || []).length > 0 && (
                    <button
                      type="button"
                      onClick={handleRestorePresets}
                      className="text-xs font-semibold text-[#9e4c5b] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      Restore {(backdropSettings.hiddenPresetIds || []).length} Deleted Presets
                    </button>
                  )}
                </div>

                {FLOWER_BLOSSOM_PRESETS.filter((p) => !(backdropSettings.hiddenPresetIds || []).includes(p.id)).length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 text-stone-500 text-xs">
                    All preset wallpapers have been deleted. You can upload custom wallpapers above or click "Restore Deleted Presets".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FLOWER_BLOSSOM_PRESETS.filter((p) => !(backdropSettings.hiddenPresetIds || []).includes(p.id)).slice(0, 8).map((preset) => {
                      const isShowingNow = (backdropSettings.activeWallpaperId === preset.id || backdropSettings.imageUrl === preset.imageUrl) && !backdropSettings.noWallpaperMode;
                      const isActiveInLoop = isWallpaperInLoop(preset.id);
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectBackgroundCard(preset.id, preset.imageUrl, preset.name, preset.location)}
                          className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer aspect-4/3 shadow-2xs ${
                            isActiveInLoop
                              ? 'border-emerald-600 ring-2 ring-emerald-400/60 bg-emerald-50/20'
                              : 'border-stone-200 opacity-65 hover:opacity-100 hover:border-[#9e4c5b]'
                          }`}
                        >
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=400&auto=format&fit=crop';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                            <span className="text-[11px] font-bold truncate">{preset.name}</span>
                            <span className="text-[9px] text-stone-300 truncate">{preset.location}</span>
                          </div>
                          
                          {/* Top Controls: Loop Multi-Select Checkbox & Delete Trash Button */}
                          <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between gap-1 z-10">
                            {/* Loop Checkbox Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleWallpaperLoop(preset.id, e)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                                isActiveInLoop
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-white/60'
                                  : 'bg-black/65 hover:bg-black/85 text-stone-300'
                              }`}
                              title={isActiveInLoop ? 'Active in loop (click to deactivate)' : 'Click to activate for loop'}
                            >
                              <Check className={`w-2.5 h-2.5 ${isActiveInLoop ? 'opacity-100 stroke-[3]' : 'opacity-30'}`} />
                              <span>{isActiveInLoop ? 'Active in Loop' : '+ Activate'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {isShowingNow && (
                                <span className="px-1.5 py-0.5 bg-[#9e4c5b] text-white text-[9px] font-bold rounded-full shadow-xs flex items-center gap-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                  Showing Now
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeletePreset(preset.id, e)}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md hover:scale-110 cursor-pointer"
                                title="Delete this wallpaper preset"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION D: ROTATING LOOP, ATMOSPHERIC TINT & TRANSITION CONTROLS */}
              <div className="p-5 bg-white border border-[#ebd0d6] rounded-2xl shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="font-serif-display text-base font-bold text-[#4a1c26] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#9e4c5b]" /> Slideshow Rotation & Timing Controls
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          autoRotate: !backdropSettings.autoRotate,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        backdropSettings.autoRotate
                          ? 'bg-[#9e4c5b] text-white hover:bg-[#853c49]'
                          : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${backdropSettings.autoRotate ? 'animate-spin [animation-duration:8s]' : ''}`} />
                      <span>{backdropSettings.autoRotate ? 'Loop Running' : 'Loop Paused'}</span>
                    </button>
                  </div>
                </div>

                {/* Sliders & Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-stone-100">
                  
                  {/* Atmospheric Tint */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Atmospheric Tint:
                    </label>
                    <select
                      value={backdropSettings.tint || 'victorian-sepia'}
                      onChange={(e) =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          tint: e.target.value as any,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800"
                    >
                      <option value="victorian-sepia">Aged Victorian Sepia</option>
                      <option value="warm-cream">Warm Hearth Cream</option>
                      <option value="rose-blush">Vintage Rose Blush</option>
                      <option value="antique-gold">Antique Gold Ochre</option>
                      <option value="clear">Clear / No Tint</option>
                    </select>
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                      <span>Opacity:</span>
                      <span className="font-mono text-[#9e4c5b]">{Math.round(backdropSettings.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.95"
                      step="0.05"
                      value={backdropSettings.opacity}
                      onChange={(e) =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-[#9e4c5b] cursor-pointer"
                    />
                  </div>

                  {/* Timer Interval with Complete Controls */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9e4c5b]" />
                        Rotation Interval:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateBackdropSettings({
                              ...backdropSettings,
                              intervalSeconds: Math.max(3, (backdropSettings.intervalSeconds || 10) - 1),
                            })
                          }
                          className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                          title="Decrease 1 second"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="3"
                          max="120"
                          value={backdropSettings.intervalSeconds || 10}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              onUpdateBackdropSettings({
                                ...backdropSettings,
                                intervalSeconds: Math.max(3, Math.min(120, val)),
                              });
                            }
                          }}
                          className="w-12 px-1 py-0.5 text-center font-mono font-bold text-[#9e4c5b] bg-[#faeaee] border border-[#e4b3bc] rounded text-xs"
                        />
                        <span className="text-xs font-semibold text-stone-600">sec</span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateBackdropSettings({
                              ...backdropSettings,
                              intervalSeconds: Math.min(120, (backdropSettings.intervalSeconds || 10) + 1),
                            })
                          }
                          className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                          title="Increase 1 second"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="3"
                      max="60"
                      step="1"
                      value={backdropSettings.intervalSeconds || 10}
                      onChange={(e) =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          intervalSeconds: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-[#9e4c5b] cursor-pointer"
                    />

                    {/* Quick interval chips */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {[3, 5, 8, 10, 15, 20, 30, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() =>
                            onUpdateBackdropSettings({
                              ...backdropSettings,
                              intervalSeconds: sec,
                            })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            (backdropSettings.intervalSeconds || 10) === sec
                              ? 'bg-[#9e4c5b] text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transition Speed / Type */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Slow Fade Transition:
                    </label>
                    <select
                      value={backdropSettings.fadeDuration || 3000}
                      onChange={(e) =>
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          fadeDuration: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg text-stone-800 font-medium"
                    >
                      <option value={4000}>Dreamy Ultra Slow (4.0s)</option>
                      <option value={3000}>Smooth Slow Fade (3.0s)</option>
                      <option value={2000}>Gentle Dissolve (2.0s)</option>
                      <option value={1000}>Subtle Fade (1.0s)</option>
                      <option value={400}>Quick Cut (0.4s)</option>
                    </select>
                  </div>

                </div>

                {/* Canvas Base Background Color (Saved Permanently) */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      Canvas Base Background Color:
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Permanently saved tone rendered behind wallpapers and throughout parchment mode.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { hex: '#faf4ea', label: 'Victorian Parchment' },
                      { hex: '#fffdfa', label: 'Warm Ivory' },
                      { hex: '#fdf0f3', label: 'Blossom Rose' },
                      { hex: '#f4ece1', label: 'Stone Hearth' },
                      { hex: '#ffffff', label: 'Pure White' },
                      { hex: '#271f21', label: 'Midnight Hearth' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() =>
                          onUpdateBackdropSettings({
                            ...backdropSettings,
                            backgroundColor: c.hex,
                          })
                        }
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer shadow-2xs ${
                          (backdropSettings.backgroundColor || '#faf4ea') === c.hex
                            ? 'scale-115 border-black ring-2 ring-[#df7084]'
                            : 'border-white hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                    <div className="flex items-center gap-1 border-l border-stone-200 pl-2 ml-1">
                      <input
                        type="color"
                        value={backdropSettings.backgroundColor || '#faf4ea'}
                        onChange={(e) =>
                          onUpdateBackdropSettings({
                            ...backdropSettings,
                            backgroundColor: e.target.value,
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        title="Choose custom background color"
                      />
                      <span className="font-mono text-[10px] text-stone-600">
                        {backdropSettings.backgroundColor || '#faf4ea'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CONTACT & INQUIRIES (HOME BAKEHOUSE, PHONE, EMAIL) */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-[#fcedf0]/70 border border-[#edd7dd] rounded-2xl text-xs text-[#733543]">
                <strong>Home-Based Bakehouse Studio:</strong> Physical storefront address is excluded. Customers can contact you directly via Phone, WhatsApp, and Email to reserve small-batch bakes or custom cakes.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contact Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Contact / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => onUpdateContact({ ...contact, phone: e.target.value })}
                    placeholder="+44 (0) 191 261 8490"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800 focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>

                {/* Direct Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Direct Email Address
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => onUpdateContact({ ...contact, email: e.target.value })}
                    placeholder="hello@teecake-creations.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800 focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>

                {/* Home Bakehouse Studio Region */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Home Bakehouse Region / Local Pickup Area (No street address)
                  </label>
                  <input
                    type="text"
                    value={contact.cityStateZip}
                    onChange={(e) => onUpdateContact({ ...contact, cityStateZip: e.target.value })}
                    placeholder="Newcastle upon Tyne (Local Pickup & Pre-Arranged Delivery)"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800 focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>

                {/* Order & Pre-Order Policy Notice */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Custom Order & Collection Lead Time Notice
                  </label>
                  <textarea
                    rows={3}
                    value={contact.pickupNotice}
                    onChange={(e) => onUpdateContact({ ...contact, pickupNotice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800 focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fcedf0] border-t border-[#ebd0d6] shrink-0">
          <span className="text-xs text-[#7d4853] font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> All edits are automatically saved to server disk & cloud.
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done & Close Studio</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  X,
  Sparkles,
  PlusCircle,
  Sliders,
  MapPin,
  Clock,
  Phone,
  Eye,
  Edit3,
  Camera,
  Flower2,
  Check,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCw,
  ExternalLink,
  Layers,
  Type,
  Bold,
  Filter,
  Crown,
  Trash2,
  ImageOff,
  Upload,
  Share2,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BackdropSettings, CafeContactDetails, PageSection, BakeryItem, PageTexts } from '../types';
import { FLOWER_BLOSSOM_PRESETS } from '../data/initialData';
import { compressImageDataUrl } from '../utils/persistentStorage';
import { useEditMode } from '../context/EditModeContext';

interface HeaderProps {
  contact: CafeContactDetails;
  backdropSettings: BackdropSettings;
  onUpdateBackdropSettings: (settings: BackdropSettings) => void;
  onNextBackdrop?: () => void;
  onPrevBackdrop?: () => void;
  onToggleAutoRotate?: () => void;
  onDeleteCurrentWallpaper?: () => void;
  secondsRemaining?: number;
  isBackdropControlsOpen?: boolean;
  setIsBackdropControlsOpen?: (open: boolean) => void;
  onOpenAddModal: () => void;
  onOpenEditContactModal: () => void;
  onOpenPageTextModal?: () => void;
  onOpenManageSections?: () => void;
  onOpenTypographyModal?: () => void;
  onOpenManageFilters?: () => void;
  sections?: PageSection[];
  customLogoUrl?: string | null;
  onUploadLogo: () => void;
  items?: BakeryItem[];
  pageTexts?: PageTexts;
  onUpdatePageText?: (field: keyof PageTexts, value: string) => void;
  onOpenBrandEditor?: () => void;
  onOpenMasterStudio?: () => void;
  onOpenShareModal?: () => void;
  isSaving?: boolean;
  lastSavedTime?: string | null;
  onManualSave?: () => Promise<boolean>;
}

export const Header: React.FC<HeaderProps> = ({
  contact,
  backdropSettings,
  onUpdateBackdropSettings,
  onNextBackdrop,
  onPrevBackdrop,
  onToggleAutoRotate,
  onDeleteCurrentWallpaper,
  secondsRemaining,
  isBackdropControlsOpen,
  setIsBackdropControlsOpen,
  onOpenAddModal,
  onOpenEditContactModal,
  onOpenPageTextModal,
  onOpenManageSections,
  onOpenTypographyModal,
  onOpenManageFilters,
  sections,
  customLogoUrl,
  onUploadLogo,
  items,
  pageTexts,
  onUpdatePageText,
  onOpenBrandEditor,
  onOpenMasterStudio,
  onOpenShareModal,
  isSaving,
  lastSavedTime,
  onManualSave,
}) => {
  const { isEditMode, isAdmin, toggleEditMode } = useEditMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [internalShowControls, setInternalShowControls] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Controlled or uncontrolled dropdown visibility
  const showBackdropControls = isBackdropControlsOpen !== undefined ? isBackdropControlsOpen : internalShowControls;
  const setShowBackdropControls = (val: boolean) => {
    if (setIsBackdropControlsOpen) {
      setIsBackdropControlsOpen(val);
    } else {
      setInternalShowControls(val);
    }
  };

  // Dynamically compute counts from items
  const totalCount = items ? items.length : 25;
  const signatureCount = items
    ? items.filter((i) => i.featured || i.dishType === 'signature' || i.dishType === 'both').length
    : 5;
  const galleryCount = items
    ? items.filter((i) => i.inGallery || i.dishType === 'gallery' || i.dishType === 'both').length
    : 20;

  // Wallpaper items & loop selection helpers
  const hiddenPresetIds = backdropSettings.hiddenPresetIds || [];
  const activePresets = FLOWER_BLOSSOM_PRESETS.filter((p) => !hiddenPresetIds.includes(p.id));
  const customUploads = backdropSettings.customUploadedImages || [];
  const headerAllIds = [
    ...customUploads.map((c) => c.id),
    ...activePresets.map((p) => p.id),
  ];
  const headerLoopIds = backdropSettings.selectedWallpaperIds ?? headerAllIds;

  const isHeaderWallpaperInLoop = (id: string) => headerLoopIds.includes(id);

  const toggleHeaderWallpaperLoop = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyIn = isHeaderWallpaperInLoop(id);
    const updated = isCurrentlyIn
      ? headerLoopIds.filter((item) => item !== id)
      : [...headerLoopIds, id];
    onUpdateBackdropSettings({
      ...backdropSettings,
      noWallpaperMode: false,
      selectedWallpaperIds: updated,
      autoRotate: updated.length > 1,
    });
  };

  const handleSelectHeaderWallpaper = (id: string, imageUrl: string, name: string, location: string) => {
    const isCurrentlyIn = isHeaderWallpaperInLoop(id);
    const updated = isCurrentlyIn ? headerLoopIds : [...headerLoopIds, id];
    onUpdateBackdropSettings({
      ...backdropSettings,
      activeWallpaperId: id,
      imageUrl,
      presetName: name,
      locationLabel: location,
      noWallpaperMode: false,
      selectedWallpaperIds: updated,
      autoRotate: updated.length > 1,
    });
  };

  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = (Array.from(files) as File[]).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    const promises = fileList.map((file, idx) => {
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          let dataUrl = ev.target?.result as string;
          if (!dataUrl) return reject(new Error('Failed to read file'));
          try {
            dataUrl = await compressImageDataUrl(dataUrl, 1600, 1600, 0.85);
          } catch (e) {}
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

        onUpdateBackdropSettings({
          ...backdropSettings,
          imageUrl: newItems[0].imageUrl,
          presetName: newItems[0].name,
          locationLabel: 'Custom Upload',
          noWallpaperMode: false,
          autoRotate: allUploadedIds.length > 1,
          customUploadedImages: updatedList,
          selectedWallpaperIds: allUploadedIds,
        });
      })
      .catch(() => {});
  };

  // Dynamically derive nav links from active sections so Header updates instantly when sections are reordered, renamed, deleted, or created
  const navLinks = sections && sections.length > 0
    ? sections
        .filter((s) => s.visible && s.showInNav)
        .map((s) => {
          let dynamicLabel = s.navLabel;
          if (s.id === 'signature-menu') {
            dynamicLabel = dynamicLabel.includes('(')
              ? dynamicLabel.replace(/\(\d+\)/, `(${signatureCount})`)
              : `${dynamicLabel} (${signatureCount})`;
          } else if (s.id === 'dishes-gallery') {
            dynamicLabel = dynamicLabel.includes('(')
              ? dynamicLabel.replace(/\(\d+\)/, `(${galleryCount})`)
              : `${dynamicLabel} (${galleryCount})`;
          } else if (s.id === 'all-dishes') {
            dynamicLabel = dynamicLabel.includes('(')
              ? dynamicLabel.replace(/\(\d+\)/, `(${totalCount})`)
              : `${dynamicLabel} (${totalCount})`;
          }
          const targetId = s.id === 'hero' ? 'home' : s.id;
          return {
            label: dynamicLabel,
            href: `#${targetId}`,
          };
        })
    : [
        { label: 'Home', href: '#home' },
        { label: `All Creations (${totalCount})`, href: '#all-dishes' },
        { label: 'Art of Baking', href: '#art-of-baking' },
        { label: `Signature Dishes (${signatureCount})`, href: '#signature-menu' },
        { label: 'Location & Hours', href: '#location-hours' },
      ];

  const currentInterval = backdropSettings.intervalSeconds || 10;
  const isAuto = backdropSettings.autoRotate;

  return (
    <header className="sticky top-0 z-40 bg-[#fffdfa]/85 backdrop-blur-md border-b border-[#edd4d9] transition-all duration-200">
      
      {/* Top micro-bar with domain, phone, and auto-loop status button */}
      <div className="bg-[#fcedf0] border-b border-[#edd4d9]/70 px-4 py-1.5 text-xs text-[#6e3943] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono tracking-wider font-semibold text-[#8b3d4d] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#c99750]" /> {contact.domain}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#7a4852]">
            <MapPin className="w-3 h-3 text-[#c99750]" /> {contact.cityStateZip}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
            className="hidden md:inline-flex items-center gap-1 hover:text-[#9e4c5b] transition-colors"
          >
            <Phone className="w-3 h-3 text-[#c99750]" /> {contact.phone}
          </a>

          {/* Quick loop control & settings button */}
          <button
            onClick={() => setShowBackdropControls(!showBackdropControls)}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/95 border border-[#e8c0c8] text-[#7a3b47] hover:bg-white hover:text-[#9e4c5b] cursor-pointer shadow-2xs transition-all"
            title="Adjust blossom backdrop endless loop & timer settings"
          >
            <Flower2 className="w-3 h-3 text-[#df7084]" />
            <span className="font-bold">Blossom Loop:</span>
            {isAuto ? (
              <span className="font-mono text-[#9e4c5b] font-bold">
                {secondsRemaining !== undefined ? `${secondsRemaining}s` : `${currentInterval}s`} ({currentInterval}s timer)
              </span>
            ) : (
              <span className="text-stone-500 font-semibold">Paused</span>
            )}
            <span className="hidden lg:inline text-[10px] text-[#915f69]">
              • {Math.round(backdropSettings.opacity * 100)}%
            </span>
          </button>
        </div>
      </div>

      {/* Flower & Blossom Backdrops floating control panel */}
      {showBackdropControls && (
        <div className="absolute right-2 sm:right-4 top-11 z-50 bg-[#fffbf8] border border-[#e4b3bc] rounded-2xl shadow-2xl p-4 sm:p-5 w-[350px] sm:w-[440px] max-h-[88vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#eed6dc] mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#fae8ec] flex items-center justify-center text-[#9e4c5b] shadow-2xs">
                <Flower2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#541e2a] font-serif-display leading-tight">
                  Flower & Blossom Backdrops
                </h2>
                <p className="text-[11px] text-[#85545e]">
                  Endless 10s loop with adjustable timer controls
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBackdropControls(false)}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-[#f6e6e9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Upload from Computer (Auto-Activates all Uploaded Wallpapers) */}
          <div className="mb-3.5 p-3 bg-gradient-to-r from-[#fef5f7] to-[#fff4ee] border border-[#df7084] rounded-xl flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <Upload className="w-4 h-4 text-[#9e4c5b] shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#5e2632] block truncate">Upload Wallpaper</span>
                <span className="text-[10px] text-[#7d4853] block truncate">Auto-activates all uploaded photos</span>
              </div>
            </div>
            <label
              className="relative px-3 py-1.5 bg-[#9e4c5b] hover:bg-[#853c49] text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 inline-flex items-center gap-1 overflow-hidden"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleHeaderUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-3 h-3" />
              <span>Choose File(s)</span>
            </label>
          </div>

          {/* SECTION 1: Endless Loop & Timer Settings Controls */}
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-br from-[#fdf0f3] to-[#fae6eb] border border-[#f2ccd4] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#541e2a] flex items-center gap-1.5 uppercase tracking-wider">
                <RotateCw className={`w-3.5 h-3.5 text-[#9e4c5b] ${isAuto ? 'animate-spin [animation-duration:8s]' : ''}`} />
                Auto-Rotate (Endless Loop)
              </span>

              {/* Loop Play / Pause Toggle Button */}
              {onToggleAutoRotate ? (
                <button
                  onClick={onToggleAutoRotate}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isAuto
                      ? 'bg-[#9e4c5b] text-white hover:bg-[#853c49]'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {isAuto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAuto ? 'Looping' : 'Paused'}</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    onUpdateBackdropSettings({
                      ...backdropSettings,
                      autoRotate: !isAuto,
                    })
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isAuto
                      ? 'bg-[#9e4c5b] text-white hover:bg-[#853c49]'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {isAuto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAuto ? 'Looping' : 'Paused'}</span>
                </button>
              )}
            </div>

            {/* Next / Previous & Countdown display */}
            <div className="flex items-center justify-between bg-white/80 rounded-lg p-2 border border-[#f0d0d8] mb-3">
              <div className="flex items-center gap-1">
                {onPrevBackdrop && (
                  <button
                    onClick={onPrevBackdrop}
                    className="px-2 py-1 rounded bg-[#faeaee] hover:bg-[#f6d8e0] text-[#7a3b47] hover:text-[#9e4c5b] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Previous backdrop"
                  >
                    <SkipBack className="w-3 h-3" /> Prev
                  </button>
                )}
                {onNextBackdrop && (
                  <button
                    onClick={onNextBackdrop}
                    className="px-2 py-1 rounded bg-[#faeaee] hover:bg-[#f6d8e0] text-[#7a3b47] hover:text-[#9e4c5b] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Next backdrop"
                  >
                    Next <SkipForward className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Countdown badge & progress */}
              <div className="text-right">
                <div className="text-[11px] font-medium text-stone-500">
                  {isAuto ? (
                    <span>Next transition in: <strong className="font-mono text-[#9e4c5b] text-xs">{secondsRemaining ?? currentInterval}s</strong></span>
                  ) : (
                    <span className="text-stone-400">Timer is paused</span>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Interval Settings Slider & Presets */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#541e2a] mb-1">
                <span>Timer Setting:</span>
                <span className="font-mono text-[#8b3d4d] bg-white px-2 py-0.5 rounded border border-[#eed0d6] font-bold">
                  {currentInterval} seconds
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={currentInterval}
                onChange={(e) =>
                  onUpdateBackdropSettings({
                    ...backdropSettings,
                    intervalSeconds: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-[#9e4c5b] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 mt-0.5 font-mono">
                <span>3s (fast)</span>
                <span className="font-bold text-[#8b3d4d]">10s (default)</span>
                <span>30s</span>
                <span>60s (slow)</span>
              </div>

              {/* Quick Timer Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-[#f2ccd4]/60">
                {[5, 10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() =>
                      onUpdateBackdropSettings({
                        ...backdropSettings,
                        intervalSeconds: sec,
                      })
                    }
                    className={`flex-1 min-w-[50px] py-1 text-[11px] font-mono font-semibold rounded-md border text-center transition-all cursor-pointer ${
                      currentInterval === sec
                        ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                        : 'bg-white text-[#7a3b47] border-[#eed0d6] hover:bg-[#faeaee]'
                    }`}
                  >
                    {sec}s {sec === 10 ? '★' : ''}
                  </button>
                ))}
              </div>

              {/* Transition Cross-Fade Speed Control */}
              <div className="mt-3 pt-2.5 border-t border-[#f2ccd4]/60">
                <div className="flex items-center justify-between text-xs font-semibold text-[#541e2a] mb-1.5">
                  <span>Transition Fade Effect:</span>
                  <span className="font-mono text-[#8b3d4d] bg-white px-2 py-0.5 rounded border border-[#eed0d6] font-bold text-[11px]">
                    {((backdropSettings.fadeDuration || 2500) / 1000).toFixed(1)}s slow fade
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '5.0s Cinema', ms: 5000 },
                    { label: '4.0s Dreamy', ms: 4000 },
                    { label: '3.0s Smooth', ms: 3000, default: true },
                    { label: '1.5s Gentle', ms: 1500 },
                  ].map((item) => {
                    const currentFade = backdropSettings.fadeDuration || 3000;
                    const isSelected = currentFade === item.ms;
                    return (
                      <button
                        key={item.ms}
                        onClick={() =>
                          onUpdateBackdropSettings({
                            ...backdropSettings,
                            fadeDuration: item.ms,
                          })
                        }
                        className={`py-1 px-1 text-[10px] font-semibold rounded-md border text-center transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                            : 'bg-white text-[#7a3b47] border-[#eed0d6] hover:bg-[#faeaee]'
                        }`}
                        title={`${item.label} cross-dissolve`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Wallpapers & Curated Blossom Backdrops list */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-[#541e2a] uppercase tracking-wider block">
                  Wallpapers & Loop Playlist
                </span>
                <span className="text-[10px] text-stone-500">
                  Select multiple backgrounds to rotate in loop
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  {headerLoopIds.length}/{headerAllIds.length} Active
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateBackdropSettings({ ...backdropSettings, selectedWallpaperIds: headerAllIds, noWallpaperMode: false, autoRotate: true })}
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  title="Activate all available wallpapers in the rotation loop"
                >
                  All
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => onUpdateBackdropSettings({ ...backdropSettings, selectedWallpaperIds: [] })}
                  className="text-[10px] font-bold text-stone-500 hover:underline cursor-pointer"
                  title="Clear all wallpapers from the rotation loop"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {/* Custom Uploads first */}
              {(backdropSettings.customUploadedImages || []).map((customImg) => {
                const isShowingNow = backdropSettings.imageUrl === customImg.imageUrl && !backdropSettings.noWallpaperMode;
                const isInLoop = isHeaderWallpaperInLoop(customImg.id);
                return (
                  <div
                    key={customImg.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-xl border transition-all ${
                      isInLoop
                        ? 'border-emerald-600 bg-emerald-50/25 ring-1 ring-emerald-400/50'
                        : 'bg-white border-stone-200 opacity-70 hover:opacity-100 hover:border-[#9e4c5b]'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectHeaderWallpaper(customImg.id, customImg.imageUrl, customImg.name, 'Custom Upload')}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-[#eed0d6] shadow-2xs relative"
                        style={{ backgroundImage: `url('${customImg.imageUrl}')` }}
                      >
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 rounded bg-[#9e4c5b] text-white">
                          MY
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-xs font-bold text-[#4a1c26] truncate">
                            {customImg.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {isInLoop && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                              </span>
                            )}
                            {isShowingNow && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#9e4c5b] text-white text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Showing
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] font-semibold text-[#c47888]">Custom Upload</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Loop Multi-Select Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleHeaderWallpaperLoop(customImg.id, e)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isInLoop
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                        }`}
                        title={isInLoop ? 'Active in loop (click to deactivate)' : 'Click to activate for loop'}
                      >
                        <Check className={`w-2.5 h-2.5 ${isInLoop ? 'opacity-100 stroke-[3]' : 'opacity-30'}`} />
                        <span>{isInLoop ? 'In Loop' : '+ Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = (backdropSettings.customUploadedImages || []).filter((i) => i.id !== customImg.id);
                          let nextUrl = backdropSettings.imageUrl;
                          let nextName = backdropSettings.presetName;
                          let nextNoWallpaper = backdropSettings.noWallpaperMode;
                          if (backdropSettings.imageUrl === customImg.imageUrl) {
                            if (updated.length > 0) {
                              nextUrl = updated[0].imageUrl;
                              nextName = updated[0].name;
                            } else {
                              const rem = FLOWER_BLOSSOM_PRESETS.filter((p) => !(backdropSettings.hiddenPresetIds || []).includes(p.id));
                              if (rem.length > 0) {
                                nextUrl = rem[0].imageUrl;
                                nextName = rem[0].name;
                              } else {
                                nextUrl = '';
                                nextName = 'Aged Parchment';
                                nextNoWallpaper = true;
                              }
                            }
                          }
                          onUpdateBackdropSettings({
                            ...backdropSettings,
                            imageUrl: nextUrl,
                            presetName: nextName,
                            noWallpaperMode: nextNoWallpaper,
                            customUploadedImages: updated,
                            selectedWallpaperIds: backdropSettings.selectedWallpaperIds
                              ? backdropSettings.selectedWallpaperIds.filter((wid) => wid !== customImg.id)
                              : undefined,
                          });
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete uploaded image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Presets */}
              {FLOWER_BLOSSOM_PRESETS.filter((p) => !(backdropSettings.hiddenPresetIds || []).includes(p.id)).map((preset, idx) => {
                const isShowingNow = backdropSettings.imageUrl === preset.imageUrl && !backdropSettings.noWallpaperMode;
                const isInLoop = isHeaderWallpaperInLoop(preset.id);
                return (
                  <div
                    key={preset.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-xl border transition-all ${
                      isInLoop
                        ? 'border-emerald-600 bg-emerald-50/25 ring-1 ring-emerald-400/50'
                        : 'bg-white border-stone-200 opacity-70 hover:opacity-100 hover:border-[#9e4c5b]'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectHeaderWallpaper(preset.id, preset.imageUrl, preset.name, preset.location)}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-[#eed0d6] shadow-2xs relative"
                        style={{ backgroundImage: `url('${preset.imageUrl}')` }}
                      >
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] font-mono px-1 rounded bg-black/60 text-white font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-xs font-bold text-[#4a1c26] truncate">
                            {preset.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {isInLoop && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                              </span>
                            )}
                            {isShowingNow && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#9e4c5b] text-white text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Showing
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] font-semibold text-[#c47888]">{preset.location}</p>
                        <p className="text-[10px] text-stone-500 line-clamp-1 leading-tight">{preset.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Loop Multi-Select Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleHeaderWallpaperLoop(preset.id, e)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isInLoop
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                        }`}
                        title={isInLoop ? 'Active in loop (click to deactivate)' : 'Click to activate for loop'}
                      >
                        <Check className={`w-2.5 h-2.5 ${isInLoop ? 'opacity-100 stroke-[3]' : 'opacity-30'}`} />
                        <span>{isInLoop ? 'In Loop' : '+ Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const hidden = backdropSettings.hiddenPresetIds || [];
                          const updatedHidden = [...hidden, preset.id];
                          let nextUrl = backdropSettings.imageUrl;
                          let nextName = backdropSettings.presetName;
                          let nextNoWallpaper = backdropSettings.noWallpaperMode;
                          if (backdropSettings.imageUrl === preset.imageUrl) {
                            const rem = FLOWER_BLOSSOM_PRESETS.filter((p) => !updatedHidden.includes(p.id));
                            if (rem.length > 0) {
                              nextUrl = rem[0].imageUrl;
                              nextName = rem[0].name;
                            } else if ((backdropSettings.customUploadedImages || []).length > 0) {
                              nextUrl = backdropSettings.customUploadedImages![0].imageUrl;
                              nextName = backdropSettings.customUploadedImages![0].name;
                            } else {
                              nextUrl = '';
                              nextName = 'Aged Parchment';
                              nextNoWallpaper = true;
                            }
                          }
                          onUpdateBackdropSettings({
                            ...backdropSettings,
                            imageUrl: nextUrl,
                            presetName: nextName,
                            noWallpaperMode: nextNoWallpaper,
                            hiddenPresetIds: updatedHidden,
                            selectedWallpaperIds: backdropSettings.selectedWallpaperIds
                              ? backdropSettings.selectedWallpaperIds.filter((wid) => wid !== preset.id)
                              : undefined,
                          });
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete / remove this preset wallpaper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Opacity, Tint & Custom Settings */}
          <div className="space-y-3 pt-3 border-t border-[#eed6dc]">
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                <span>Blossom Backdrop Opacity</span>
                <span className="font-mono font-bold text-[#8b3d4d]">
                  {Math.round(backdropSettings.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.85"
                step="0.05"
                value={backdropSettings.opacity}
                onChange={(e) =>
                  onUpdateBackdropSettings({
                    ...backdropSettings,
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-[#8b3d4d] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>Subtle (20%)</span>
                <span>Balanced (50%)</span>
                <span>Vivid (85%)</span>
              </div>
            </div>

            {/* Quick Tint Selection */}
            <div>
              <span className="block text-xs font-medium text-stone-700 mb-1.5">Atmosphere Tint</span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => onUpdateBackdropSettings({ ...backdropSettings, tint: 'rose-blush' })}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                    backdropSettings.tint === 'rose-blush'
                      ? 'bg-[#fcedf0] border-[#d97c8d] text-[#8b3d4d]'
                      : 'bg-white border-[#ebd0d6] text-stone-600 hover:bg-[#fff5f7]'
                  }`}
                >
                  Rose Blush
                </button>
                <button
                  onClick={() => onUpdateBackdropSettings({ ...backdropSettings, tint: 'warm-cream' })}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                    backdropSettings.tint === 'warm-cream'
                      ? 'bg-[#fff5ea] border-[#e0aa62] text-[#8c591c]'
                      : 'bg-white border-[#ebd0d6] text-stone-600 hover:bg-[#fff5f7]'
                  }`}
                >
                  Warm Cream
                </button>
                <button
                  onClick={() => onUpdateBackdropSettings({ ...backdropSettings, tint: 'clear' })}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                    backdropSettings.tint === 'clear'
                      ? 'bg-[#f4f4f4] border-stone-400 text-stone-800'
                      : 'bg-white border-[#ebd0d6] text-stone-600 hover:bg-[#fff5f7]'
                  }`}
                >
                  Natural Clear
                </button>
              </div>
            </div>

            {/* Custom URL accordion */}
            <div className="pt-2 border-t border-[#f0d8de]">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-[11px] text-[#8b3d4d] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>{showCustomInput ? '− Hide custom URL' : '+ Use custom blossom photo URL'}</span>
              </button>
              {showCustomInput && (
                <div className="mt-2 space-y-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#ebd0d6] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4c5b]"
                  />
                  <button
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        onUpdateBackdropSettings({
                          ...backdropSettings,
                          imageUrl: customUrlInput.trim(),
                          presetName: 'Custom Blossom Photo',
                          locationLabel: 'Custom Location',
                          noWallpaperMode: false,
                          autoRotate: false,
                        });
                        setCustomUrlInput('');
                        setShowCustomInput(false);
                      }
                    }}
                    disabled={!customUrlInput.trim()}
                    className="w-full py-1 text-xs rounded-lg bg-[#9e4c5b] hover:bg-[#853c49] disabled:bg-stone-300 text-white font-medium cursor-pointer disabled:cursor-not-allowed"
                  >
                    Apply Custom Blossom Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar: Logo & Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.75rem] py-2.5 gap-4">
          
          {/* Brand Logo & Bakery Name - Ample breathing room, shrink-0 to never compress */}
          <div className="flex items-center gap-3 shrink-0">
            <BrandLogo
              size={pageTexts?.brandLogoSize || 'md'}
              customLogoUrl={customLogoUrl}
              brandName={pageTexts?.brandName || 'TeeCake'}
              brandSubtitle={pageTexts?.brandSubtitle || 'CREATIONS'}
              isEditable={isEditMode}
              onUpdateBrandName={(val) => onUpdatePageText?.('brandName', val)}
              onUpdateBrandSubtitle={(val) => onUpdatePageText?.('brandSubtitle', val)}
              onOpenBrandEditor={onOpenBrandEditor}
              onUploadLogo={onUploadLogo}
            />
          </div>

          {/* Action Buttons Toolbar */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 flex-wrap justify-end">
            {/* Master Hide / Unhide Editor Options Toggle Button */}
            <button
              type="button"
              onClick={toggleEditMode}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs hover:shadow-xs ${
                isEditMode
                  ? 'bg-[#faeaee] hover:bg-[#f5d5dc] text-[#782837] border border-[#e4b3bc]'
                  : 'bg-gradient-to-r from-[#9e4c5b] to-[#782837] hover:from-[#8d3a4b] hover:to-[#68202d] text-white shadow-sm ring-2 ring-[#e4b3bc]/40'
              }`}
              title={
                isEditMode
                  ? 'Hide all editor buttons, pencils & controls across the page (Switch to View Only Mode). Shortcut: Ctrl+E'
                  : 'Sign in as an admin to edit this website'
              }
            >
              {isEditMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#9e4c5b]" />
                  <span>Hide Editor (View Mode)</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-pink-200" />
                  <span>{isAdmin ? 'Edit website' : 'Admin sign in'}</span>
                </>
              )}
            </button>

            {/* Share with Friends & Cloud Sync Button - Available in both view and edit modes */}
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#5e2632] bg-[#fdf0f3] hover:bg-[#faeaee] border border-[#e4b3bc] transition-all cursor-pointer shrink-0 shadow-2xs hover:shadow-xs"
                title="Share live link with friends & verify cloud synchronization"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Share2 className="w-3.5 h-3.5 text-[#9e4c5b]" />
                <span>Share with Friends</span>
              </button>
            )}

            {/* Editing Action Buttons - Only visible when Editor is Unhidden */}
            {isEditMode && (
              <>
                {/* Auto-Save & Disk Status Pill */}
                <button
                  onClick={onManualSave}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 shadow-2xs ${
                    isSaving
                      ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                      : 'bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-300 text-emerald-900'
                  }`}
                  title={
                    isSaving
                      ? 'Saving changes to server disk...'
                      : lastSavedTime
                      ? `All changes saved to disk at ${lastSavedTime}. Click to save now.`
                      : 'All changes automatically saved to disk. Click to save now.'
                  }
                >
                  {isSaving ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      <span>Saved to Disk</span>
                    </>
                  )}
                </button>

                {/* Master Studio Control Button */}
                {onOpenMasterStudio && (
                  <button
                    onClick={onOpenMasterStudio}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#9e4c5b] to-[#7a2c3d] hover:from-[#883e4c] hover:to-[#682231] shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 border border-[#b85e70]"
                    title="Master Studio: Edit all texts, font styles, colors, upload custom backgrounds & temple drops"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#fcedf0]" />
                    <span>Master Control</span>
                  </button>
                )}

                {/* Edit Brand Title & Font button */}
                {onOpenBrandEditor && (
                  <button
                    onClick={onOpenBrandEditor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                    title="Edit bakery brand title, subtitle, font size & logo badge"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span>Edit Brand & Font</span>
                  </button>
                )}

                {/* Logo swap button */}
                <button
                  onClick={onUploadLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                  title="Upload your bakery logo (PNG/JPG)"
                >
                  <Camera className="w-3.5 h-3.5 text-[#9e4c5b]" />
                  <span>Change Logo</span>
                </button>

                {onOpenManageSections && (
                  <button
                    onClick={onOpenManageSections}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                    title="Manage, reorder, swap, or create new page sections"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span>Manage Sections</span>
                  </button>
                )}

                {onOpenPageTextModal && (
                  <button
                    onClick={onOpenPageTextModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                    title="Edit all headings, descriptions and text boxes on the page"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span>Edit Site Texts</span>
                  </button>
                )}

                {onOpenTypographyModal && (
                  <button
                    onClick={onOpenTypographyModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                    title="Adjust text size and bold options for all texts"
                  >
                    <Type className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span className="flex items-center gap-0.5">
                      Text Bold & Size
                    </span>
                  </button>
                )}

                {onOpenManageFilters && (
                  <button
                    onClick={onOpenManageFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                    title="Manage and self-edit category filters (Savory, Assorted Combo, etc.)"
                  >
                    <Filter className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span>Filters</span>
                  </button>
                )}

                <button
                  onClick={onOpenEditContactModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] hover:bg-[#f5e1e5] border border-[#ebd0d6] transition-colors cursor-pointer shrink-0"
                  title="Edit cafe name, hours, address & phone"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] shadow-sm hover:shadow-md transition-all cursor-pointer tracking-wide shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex sm:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => setShowBackdropControls(!showBackdropControls)}
              className="p-2 rounded-lg text-[#5e2632] hover:bg-[#fcedf0] transition-colors"
              title="Backdrop Settings"
            >
              <Flower2 className="w-5 h-5 text-[#df7084]" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[#5e2632] hover:bg-[#fcedf0] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Navigation Bar Placed Under Logo & Bakery Name */}
      <div className="border-t border-[#f0dce1]/90 bg-[#fffbfc]/90 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto py-2 scrollbar-none">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  const targetId = link.href.replace('#', '');
                  if (targetId === 'home' || targetId === 'hero') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#543037] hover:text-[#9e4c5b] hover:bg-[#fbedf0] border border-transparent hover:border-[#ebd0d6] transition-all duration-150 whitespace-nowrap cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#fffdfa] border-b border-[#edd4d9] px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  const targetId = link.href.replace('#', '');
                  if (targetId === 'home' || targetId === 'hero') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-sm font-medium text-[#4a3539] hover:text-[#9e4c5b] py-2 border-b border-stone-100 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          <div className="pt-2 flex flex-col gap-2">
            {/* Mobile Master Hide/Unhide Editor Toggle */}
            <button
              onClick={() => {
                toggleEditMode();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
                isEditMode
                  ? 'bg-[#faeaee] text-[#782837] border-[#e4b3bc]'
                  : 'bg-gradient-to-r from-[#9e4c5b] to-[#782837] text-white border-[#b85e70]'
              }`}
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4 text-[#9e4c5b]" />
                  <span>Hide Editor (Switch to View Only)</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-pink-200" />
                  <span>{isAdmin ? 'Edit website' : 'Admin sign in'}</span>
                </>
              )}
            </button>

            {onOpenShareModal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenShareModal();
                }}
                className="w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#5e2632] bg-[#fdf0f3] border border-[#e4b3bc] shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Share2 className="w-4 h-4 text-[#9e4c5b]" />
                <span>Share with Friends (Live Synced)</span>
              </button>
            )}

            {isEditMode && (
              <>
                <button
                  onClick={() => {
                    onManualSave?.();
                  }}
                  className={`w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer ${
                    isSaving
                      ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                      <span>Saving changes to disk...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      <span>All Changes Saved to Disk</span>
                    </>
                  )}
                </button>

                {onOpenMasterStudio && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenMasterStudio();
                    }}
                    className="w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#9e4c5b] to-[#7a2c3d] shadow-sm cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>🎛️ Master Studio Control</span>
                  </button>
                )}

                {onOpenBrandEditor && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenBrandEditor();
                    }}
                    className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                  >
                    <Crown className="w-4 h-4 text-[#9e4c5b]" />
                    <span>👑 Edit Brand Name, Logo & Font</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onUploadLogo();
                  }}
                  className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                >
                  <Camera className="w-4 h-4 text-[#9e4c5b]" />
                  <span>Upload / Change Bakery Logo</span>
                </button>

                {onOpenManageSections && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenManageSections();
                    }}
                    className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                  >
                    <Layers className="w-4 h-4 text-[#9e4c5b]" />
                    <span>📑 Manage & Reorder Sections</span>
                  </button>
                )}

                {onOpenPageTextModal && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenPageTextModal();
                    }}
                    className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                  >
                    <Sparkles className="w-4 h-4 text-[#9e4c5b]" />
                    <span>Edit Site Headings & Texts</span>
                  </button>
                )}

                {onOpenTypographyModal && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenTypographyModal();
                    }}
                    className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                  >
                    <Type className="w-4 h-4 text-[#9e4c5b]" />
                    <span>Text Bold & Font Size Options</span>
                  </button>
                )}

                {onOpenManageFilters && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenManageFilters();
                    }}
                    className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                  >
                    <Filter className="w-4 h-4 text-[#9e4c5b]" />
                    <span>Customize & Self-Edit Filters</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenEditContactModal();
                  }}
                  className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5e2632] bg-[#fbf0f2] border border-[#ebd0d6]"
                >
                  <Sparkles className="w-4 h-4 text-[#c99750]" />
                  <span>Edit Cafe Details & Hours</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAddModal();
                  }}
                  className="w-full justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#9e4c5b]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

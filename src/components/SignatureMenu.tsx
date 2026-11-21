import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  PlusCircle,
  Eye,
  Star,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
  Edit2,
  Camera,
  Timer,
  Sliders,
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Copy,
  Layers,
  Check,
  RotateCcw,
  ShieldCheck,
  Download,
  Save,
} from 'lucide-react';
import { BakeryItem, PageTexts } from '../types';
import { EditableText } from './EditableText';
import {
  saveItemsToIndexedDB,
  safeSaveItemsToLocalStorage,
  setIndexedDBValue,
  saveAppDataToServer,
} from '../utils/persistentStorage';

interface SignatureMenuProps {
  items: BakeryItem[];
  pageTexts: PageTexts;
  onUpdatePageText: (field: keyof PageTexts, value: string) => void;
  onOpenLightbox: (index: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: BakeryItem) => void;
  onOpenReplacePhoto: (item: BakeryItem) => void;
  onDeleteItem: (id: string) => void;
  onRestoreDefaults: () => void;
  onSwapItems?: (idA: string, idB: string) => void;
  onMoveToPosition?: (id: string, targetSlot: number) => void;
  onToggleSignature?: (id: string) => void;
  onToggleGallery?: (id: string) => void;
  onDuplicateItem?: (item: BakeryItem) => void;
  onQuickUploadPhoto?: (item: BakeryItem, file: File) => void;
}

const STORAGE_TIMER_KEY = 'signature_menu_timer_seconds';
const STORAGE_FADE_SPEED_KEY = 'signature_fade_speed_mode';

export const SignatureMenu: React.FC<SignatureMenuProps> = ({
  items,
  pageTexts,
  onUpdatePageText,
  onOpenLightbox,
  onOpenAddModal,
  onOpenEditModal,
  onOpenReplacePhoto,
  onDeleteItem,
  onSwapItems,
  onMoveToPosition,
  onToggleSignature,
  onToggleGallery,
  onDuplicateItem,
  onQuickUploadPhoto,
}) => {
  // Live signature dishes: any dish from catalog that is marked as signature or featured
  const signatureDishes = items.filter(
    (item) => item.featured || item.dishType === 'signature' || item.dishType === 'both'
  );

  // Editable Timer Interval state (in seconds, default 1.0s or saved in localStorage)
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TIMER_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 60) return parsed;
      }
    } catch (e) {
      console.warn('Could not read timer setting from localStorage:', e);
    }
    return 1.0;
  });

  // Fade speed transition mode ('slow' [1200ms], 'gentle' [800ms], 'cinematic' [1800ms])
  const [fadeMode, setFadeMode] = useState<'gentle' | 'slow' | 'cinematic'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FADE_SPEED_KEY);
      if (saved === 'gentle' || saved === 'slow' || saved === 'cinematic') return saved;
    } catch (e) {
      console.warn('Could not read fade speed from localStorage:', e);
    }
    return 'slow';
  });

  // Computed fade duration in ms based on user preference and timer length
  const fadeDurationMs = React.useMemo(() => {
    let base = 1200;
    if (fadeMode === 'gentle') base = 750;
    if (fadeMode === 'cinematic') base = 1800;
    // Don't let fade exceed the total timer cycle
    const maxAllowed = Math.max(300, Math.floor(timerSeconds * 1000 * 0.95));
    return Math.min(base, maxAllowed);
  }, [fadeMode, timerSeconds]);

  // Persist timer setting
  const updateTimerSeconds = (newVal: number) => {
    const clamped = Math.max(0.5, Math.min(60, Math.round(newVal * 10) / 10));
    setTimerSeconds(clamped);
    try {
      localStorage.setItem(STORAGE_TIMER_KEY, String(clamped));
    } catch (e) {
      console.warn('Failed to save timer to localStorage:', e);
    }
  };

  const updateFadeMode = (mode: 'gentle' | 'slow' | 'cinematic') => {
    setFadeMode(mode);
    try {
      localStorage.setItem(STORAGE_FADE_SPEED_KEY, mode);
    } catch (e) {
      console.warn('Failed to save fade mode:', e);
    }
  };

  // Live cycling state
  const [liveIndex, setLiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cross-fading states: hold previous dish while current dish slowly fades in over it
  const [prevDish, setPrevDish] = useState<BakeryItem | null>(null);
  const [currentDish, setCurrentDish] = useState<BakeryItem | null>(signatureDishes[0] || null);
  const [fadeKey, setFadeKey] = useState<number>(0);

  // Settings popover / expanded timer control
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const timerSettingsRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Carousel track visibility: default to hidden as requested
  const [showCarouselTrack, setShowCarouselTrack] = useState<boolean>(false);

  // Manual save confirmation state & feedback
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleExplicitSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. Save all bakery items to localStorage and unlimited IndexedDB
      safeSaveItemsToLocalStorage('teecake_bakery_items_v2_categorized', items);
      await saveItemsToIndexedDB(items);

      // 2. Save timer and signature settings
      localStorage.setItem(STORAGE_TIMER_KEY, String(timerSeconds));
      localStorage.setItem(STORAGE_FADE_SPEED_KEY, fadeMode);
      await setIndexedDBValue('signature_timer_settings', {
        timerSeconds,
        fadeMode,
        updatedAt: new Date().toISOString(),
      });

      // 3. Save page texts snapshot
      localStorage.setItem('teecake_page_texts_v1', JSON.stringify(pageTexts));
      await setIndexedDBValue('page_texts', pageTexts);

      // 4. Save to shared Cloud server database so friends and visitors immediately see the updates
      const saved = await saveAppDataToServer({
        items,
        pageTexts,
        timerSeconds,
        fadeMode,
        showCarouselTrack,
      });

      if (!saved.success) throw new Error('Website save failed');
      setSaveSuccessMessage(`All ${items.length} creations and settings saved to the website.`);
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Error saving data:', err);
      setSaveSuccessMessage('Website save failed. Changes are on this device only; sign in or reload before retrying.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'TeeCake Artisan Bakery',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        itemsCount: items.length,
        items,
        pageTexts,
        timerSeconds,
        fadeMode,
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teecake-bakery-creations-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveSuccessMessage('Backup downloaded to your device!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (e) {
      console.warn('Backup export failed:', e);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timerSettingsRef.current && !timerSettingsRef.current.contains(e.target as Node)) {
        setIsTimerSettingsOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize current and previous dish on index change with smooth cross-fade
  useEffect(() => {
    if (signatureDishes.length === 0) {
      setLiveIndex(0);
      setCurrentDish(null);
      setPrevDish(null);
      return;
    }

    const safeIndex = liveIndex >= signatureDishes.length ? 0 : liveIndex;
    const targetDish = signatureDishes[safeIndex];

    if (!currentDish) {
      setCurrentDish(targetDish);
    } else if (currentDish.id !== targetDish.id) {
      setPrevDish(currentDish);
      setCurrentDish(targetDish);
      setFadeKey((k) => k + 1);
    }
  }, [liveIndex, signatureDishes]);

  // Timer interval for advancing liveIndex
  useEffect(() => {
    if (!isPlaying || signatureDishes.length <= 1) {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      return;
    }

    const ms = Math.max(500, Math.round(timerSeconds * 1000));
    liveTimerRef.current = setInterval(() => {
      setLiveIndex((prev) => (prev + 1) % signatureDishes.length);
    }, ms);

    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [isPlaying, timerSeconds, signatureDishes.length]);

  const activeDish = currentDish || signatureDishes[liveIndex] || signatureDishes[0];
  const globalIndexOfActive = activeDish
    ? items.findIndex((i) => i.id === activeDish.id)
    : 0;

  const handlePrevLive = () => {
    if (signatureDishes.length === 0) return;
    setLiveIndex((prev) => (prev - 1 + signatureDishes.length) % signatureDishes.length);
  };

  const handleNextLive = () => {
    if (signatureDishes.length === 0) return;
    setLiveIndex((prev) => (prev + 1) % signatureDishes.length);
  };

  // Reorder signature dish helpers
  const handleSwapWithNeighbor = (direction: 'left' | 'right') => {
    if (!activeDish || !onSwapItems || signatureDishes.length <= 1) return;
    const curIdx = signatureDishes.findIndex((d) => d.id === activeDish.id);
    if (curIdx < 0) return;
    const targetIdx = direction === 'left' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= signatureDishes.length) return;
    const neighbor = signatureDishes[targetIdx];
    onSwapItems(activeDish.id, neighbor.id);
    setLiveIndex(targetIdx);
  };

  const handleSlotSelect = (targetSlot: number) => {
    if (!activeDish || !onMoveToPosition) return;
    onMoveToPosition(activeDish.id, targetSlot);
    setLiveIndex(targetSlot);
  };

  return (
    <section id="signature-menu" className="py-12 md:py-18 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Editable Text */}
        <div className="text-center max-w-2xl mx-auto mb-8 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcedf0] border border-[#e8c0c8] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
            <EditableText
              value={pageTexts.signatureEmblem}
              onSave={(val) => onUpdatePageText('signatureEmblem', val)}
              textKey="signatureEmblem"
              label="Signature Section Emblem"
              defaultAlign="center"
              className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47] text-center"
            />
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a1c26] tracking-tight mb-2 text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.signatureHeading}
              onSave={(val) => onUpdatePageText('signatureHeading', val)}
              textKey="signatureHeading"
              label="Signature Section Heading"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h2>

          <div className="font-serif-subtle italic text-base sm:text-lg text-[#5a222e] leading-relaxed text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.signatureSubheading}
              onSave={(val) => onUpdatePageText('signatureSubheading', val)}
              textKey="signatureSubheading"
              defaultWeight="semibold"
              defaultAlign="center"
              label="Signature Section Subheading"
              multiline
              as="span"
              className="text-center"
            />
          </div>
        </div>

        {/* Live Status & Comprehensive Timer Controls Bar */}
        <div className="bg-[#fffdfb]/95 border border-[#e8ccd2] rounded-2xl px-4 py-3 sm:px-5 shadow-sm backdrop-blur-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Live Indicator & Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9e4c5b] text-white shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75 ${!isPlaying ? 'hidden' : ''}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE SIGNATURE
            </span>

            <span className="text-xs font-medium text-stone-700">
              Auto-cycling every <strong className="text-[#9e4c5b] font-bold">{timerSeconds}s</strong> with slow fade ({signatureDishes.length} bakes)
            </span>
          </div>

          {/* Right: Timer Editor, Presets & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-[#faeaee] text-[#7a2c3d] border-[#e8c0c8] hover:bg-[#f6d7df]'
                  : 'bg-[#9e4c5b] text-white border-[#9e4c5b] hover:bg-[#853c49]'
              }`}
              title={isPlaying ? 'Pause auto-cycle' : 'Resume auto-cycle'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Quick Timer Presets */}
            <div className="inline-flex items-center bg-[#f7ebe6] rounded-full p-0.5 border border-[#ebd0d6]">
              {[0.5, 1.0, 2.0, 3.0, 5.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateTimerSeconds(preset)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                    Math.abs(timerSeconds - preset) < 0.05
                      ? 'bg-[#9e4c5b] text-white shadow-xs'
                      : 'text-[#6e2836] hover:bg-white/80'
                  }`}
                  title={`Set timer to ${preset} seconds`}
                >
                  {preset}s
                </button>
              ))}
            </div>

            {/* Stepper & Custom Seconds Input */}
            <div className="inline-flex items-center border border-[#e8ccd2] bg-white rounded-full px-1.5 py-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => updateTimerSeconds(timerSeconds - 0.5)}
                disabled={timerSeconds <= 0.5}
                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-[#9e4c5b] hover:bg-[#faeaee] rounded-full disabled:opacity-30 cursor-pointer"
                title="Decrease timer speed (-0.5s)"
              >
                -
              </button>
              <div className="flex items-center px-1">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="60"
                  value={timerSeconds}
                  onChange={(e) => updateTimerSeconds(parseFloat(e.target.value) || 1)}
                  className="w-9 text-center text-xs font-bold text-[#7a2c3d] bg-transparent focus:outline-none"
                  title="Directly edit timer in seconds"
                />
                <span className="text-[10px] font-semibold text-stone-500">sec</span>
              </div>
              <button
                type="button"
                onClick={() => updateTimerSeconds(timerSeconds + 0.5)}
                disabled={timerSeconds >= 60}
                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-[#9e4c5b] hover:bg-[#faeaee] rounded-full disabled:opacity-30 cursor-pointer"
                title="Increase timer speed (+0.5s)"
              >
                +
              </button>
            </div>

            {/* Timer & Fading Settings Popover Toggle */}
            <div className="relative" ref={timerSettingsRef}>
              <button
                type="button"
                onClick={() => setIsTimerSettingsOpen(!isTimerSettingsOpen)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isTimerSettingsOpen
                    ? 'bg-[#9e4c5b] text-white border-[#9e4c5b]'
                    : 'bg-[#fff4f6] text-[#7a2c3d] border-[#e8c0c8] hover:bg-[#fcebef]'
                }`}
                title="Adjust timer speed and slow fade transition"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* Popover Menu for Transition & Timer Fine-Tuning */}
              {isTimerSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#ebd0d6] p-4 z-50 text-stone-800 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7a2c3d] flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-[#9e4c5b]" />
                      Timer & Transition
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTimerSettingsOpen(false)}
                      className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Cycle Timer Range Slider */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-stone-700">Cycle Interval:</span>
                      <span className="font-bold text-[#9e4c5b]">{timerSeconds} seconds</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={timerSeconds}
                      onChange={(e) => updateTimerSeconds(parseFloat(e.target.value))}
                      className="w-full accent-[#9e4c5b] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                      <span>Fast (0.5s)</span>
                      <span>1.0s (default)</span>
                      <span>Slow (10s)</span>
                    </div>
                  </div>

                  {/* Transition Fading Speed Selector */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Fade Transition Style:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateFadeMode('gentle')}
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                          fadeMode === 'gentle'
                            ? 'bg-[#faeaee] text-[#7a2c3d] border-[#9e4c5b] font-bold shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        Gentle (0.8s)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFadeMode('slow')}
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                          fadeMode === 'slow'
                            ? 'bg-[#faeaee] text-[#7a2c3d] border-[#9e4c5b] font-bold shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        Slow (1.2s)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFadeMode('cinematic')}
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                          fadeMode === 'cinematic'
                            ? 'bg-[#faeaee] text-[#7a2c3d] border-[#9e4c5b] font-bold shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        Cinematic (1.8s)
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 italic">
                      Provides smooth, slow cross-dissolve with zero flickering.
                    </p>
                  </div>

                  {/* Toggle Carousel Track Visibility */}
                  <div className="pt-2.5 pb-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-stone-700 block">Carousel Track:</span>
                      <span className="text-[10px] text-stone-400">Thumbnail strip at bottom</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCarouselTrack(!showCarouselTrack)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        showCarouselTrack
                          ? 'bg-[#faeaee] text-[#7a2c3d] border-[#9e4c5b]'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {showCarouselTrack ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  {/* Backup and Reset actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="text-[11px] font-medium text-stone-600 hover:text-[#9e4c5b] flex items-center gap-1 cursor-pointer"
                      title="Download complete offline backup file"
                    >
                      <Download className="w-3 h-3 text-[#9e4c5b]" /> Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateTimerSeconds(1.0);
                        updateFadeMode('slow');
                      }}
                      className="text-[11px] font-medium text-stone-500 hover:text-[#9e4c5b] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset 1.0s
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Save All Changes Button */}
            <button
              type="button"
              onClick={handleExplicitSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#5e2632] bg-[#faeaee] hover:bg-[#f6d7df] border border-[#e8c0c8] rounded-full shadow-2xs cursor-pointer whitespace-nowrap transition-all"
              title="Save all dishes, order positions, and customizations to permanent storage"
            >
              <Save className="w-3.5 h-3.5 text-[#9e4c5b]" />
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </button>

            {/* Add Signature Dish Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-full shadow-xs cursor-pointer whitespace-nowrap transition-colors"
              title="Add a new dish to your signature catalog"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Signature Dish</span>
            </button>
          </div>
        </div>

        {/* Save Confirmation Notification Banner */}
        {saveSuccessMessage && (
          <div className="mb-5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              {saveSuccessMessage}
            </span>
            <button
              type="button"
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Presentation Display (ONLY PHOTO AND NAME OF THE DISH AS REQUESTED) */}
        {signatureDishes.length === 0 ? (
          <div className="text-center py-16 bg-[#fffaf6] border border-dashed border-[#ebd0d6] rounded-3xl p-8">
            <Star className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-lg font-bold text-[#5e2632] mb-1">
              No Signature Dishes Added Yet
            </h3>
            <p className="text-xs text-stone-500 mb-4 max-w-md mx-auto">
              Any creation you mark as Signature in the catalog or add below will appear in this live slow-fading presentation.
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add First Signature Dish</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Main Stage: Live Slow-Fading Screen */}
            <div className="relative mx-auto max-w-4xl bg-stone-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 aspect-16/10 sm:aspect-16/9 flex items-center justify-center group">
              
              {/* Layer 1: Outgoing Dish (sits in the back during cross-dissolve) */}
              {prevDish && (
                <img
                  src={prevDish.image}
                  alt={prevDish.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Layer 2: Incoming Current Dish (slowly fading in over outgoing layer) */}
              {activeDish && (
                <img
                  key={`sig-active-${activeDish.id}-${fadeKey}`}
                  src={activeDish.image}
                  alt={activeDish.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = 'true';
                      e.currentTarget.src = activeDish.image && activeDish.image.startsWith('/uploads/')
                        ? `${activeDish.image}?retry=1`
                        : '/uploads/dish_item-1793425238012-ka1o_5ab4054267b4.jpg';
                    }
                  }}
                  style={{
                    '--fade-duration': `${fadeDurationMs}ms`,
                  } as React.CSSProperties}
                  className="absolute inset-0 w-full h-full object-cover animate-slow-fade cursor-pointer"
                  onClick={() => onOpenLightbox(globalIndexOfActive >= 0 ? globalIndexOfActive : 0)}
                />
              )}

              {/* Navigation Arrows for manual step */}
              <button
                type="button"
                onClick={handlePrevLive}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20"
                title="Previous Dish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNextLive}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20"
                title="Next Dish"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Top Quick Actions & Fully Functional More Menu on Active Dish */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-20">
                
                {/* Swap Left / Right position in Signature list */}
                {onSwapItems && signatureDishes.length > 1 && (
                  <div className="inline-flex items-center bg-black/60 backdrop-blur-xs rounded-lg p-0.5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleSwapWithNeighbor('left')}
                      disabled={liveIndex === 0}
                      className="p-1.5 text-white/80 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move this dish Left in signature order"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-white/70 px-1 font-bold">
                      #{liveIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSwapWithNeighbor('right')}
                      disabled={liveIndex === signatureDishes.length - 1}
                      className="p-1.5 text-white/80 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move this dish Right in signature order"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Inspect Fullscreen */}
                <button
                  type="button"
                  onClick={() => onOpenLightbox(globalIndexOfActive >= 0 ? globalIndexOfActive : 0)}
                  className="p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs cursor-pointer transition-colors shadow-md"
                  title="Inspect Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-[#f0afbd]" />
                </button>

                {/* Crop or replace photo */}
                <label
                  className="relative p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs cursor-pointer transition-colors shadow-md overflow-hidden"
                  title="Upload or change this photo"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (onQuickUploadPhoto) {
                          onQuickUploadPhoto(activeDish, f);
                        } else if (onOpenReplacePhoto) {
                          onOpenReplacePhoto(activeDish);
                        }
                      }
                      e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Camera className="w-4 h-4 text-[#f0afbd]" />
                </label>

                {/* Edit dish name */}
                <button
                  type="button"
                  onClick={() => onOpenEditModal(activeDish)}
                  className="p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs cursor-pointer transition-colors shadow-md"
                  title="Edit dish name"
                >
                  <Edit2 className="w-4 h-4 text-white" />
                </button>

                {/* Fully Functional More Menu */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className={`p-1.5 rounded-lg backdrop-blur-xs cursor-pointer transition-colors shadow-md ${
                      isMoreMenuOpen ? 'bg-white text-stone-900' : 'bg-black/60 hover:bg-black text-white'
                    }`}
                    title="More actions for this dish"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 z-50 text-stone-800 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        {activeDish.name}
                      </div>

                      {/* Direct Slot Position Selector */}
                      {onMoveToPosition && (
                        <div className="px-3 py-2 border-b border-stone-100">
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Set Order Position:
                          </label>
                          <select
                            value={liveIndex}
                            onChange={(e) => {
                              handleSlotSelect(parseInt(e.target.value, 10));
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full text-xs font-medium py-1 px-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#9e4c5b]"
                          >
                            {signatureDishes.map((_, sIdx) => (
                              <option key={sIdx} value={sIdx}>
                                Position #{sIdx + 1} {sIdx === liveIndex ? '(Current)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Toggle Gallery Inclusion */}
                      {onToggleGallery && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleGallery(activeDish.id);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-[#faeaee] text-stone-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#9e4c5b]" />
                          <span>
                            {activeDish.inGallery || activeDish.dishType === 'gallery' || activeDish.dishType === 'both'
                              ? 'Remove from Gallery'
                              : 'Include in Gallery'}
                          </span>
                        </button>
                      )}

                      {/* Duplicate Dish */}
                      {onDuplicateItem && (
                        <button
                          type="button"
                          onClick={() => {
                            onDuplicateItem(activeDish);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-[#faeaee] text-stone-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-amber-600" />
                          <span>Duplicate Dish</span>
                        </button>
                      )}

                      {/* Crop / Replace Photo */}
                      <button
                        type="button"
                        onClick={() => {
                          onOpenReplacePhoto(activeDish);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-[#faeaee] text-stone-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-stone-600" />
                        <span>Replace / Crop Photo</span>
                      </button>

                      {/* Edit Details */}
                      <button
                        type="button"
                        onClick={() => {
                          onOpenEditModal(activeDish);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-[#faeaee] text-stone-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                        <span>Edit Dish Details</span>
                      </button>

                      {/* Remove from Signature or Delete */}
                      {onToggleSignature && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleSignature(activeDish.id);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-600" />
                          <span>Remove from Signature</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onDeleteItem(activeDish.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-red-50 text-red-700 flex items-center gap-2 border-t border-stone-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Delete Dish Completely</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeleteItem(activeDish.id)}
                  className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs cursor-pointer transition-colors shadow-md"
                  title="Delete dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Overlay: ONLY PHOTO AND NAME OF THE DISH ARE DISPLAYED */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-5 px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 pointer-events-none z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-[#f7cdd6] bg-[#5e2632]/80 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
                      #{liveIndex + 1} of {signatureDishes.length}
                    </span>
                    <span className="text-[11px] text-white/70 font-sans">Chef&apos;s Signature</span>
                  </div>

                  {/* Dish Name with Slow-Fade Animation */}
                  <h3
                    key={`name-${activeDish.id}-${fadeKey}`}
                    onClick={() => onOpenLightbox(globalIndexOfActive >= 0 ? globalIndexOfActive : 0)}
                    style={{
                      '--fade-duration': `${fadeDurationMs}ms`,
                    } as React.CSSProperties}
                    className="animate-slow-fade font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-md pointer-events-auto cursor-pointer hover:text-[#f7cdd6] transition-colors leading-tight"
                  >
                    {activeDish.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(globalIndexOfActive >= 0 ? globalIndexOfActive : 0)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#5e2632] text-xs font-semibold backdrop-blur-xs shadow-md transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span>View Dish</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation Bar with Photo & Name: Hidden by default as requested */}
            {showCarouselTrack && (
              <div className="bg-[#fffdfb]/80 border border-[#ebd4d9] rounded-2xl p-3 shadow-xs backdrop-blur-xs animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-stone-600 mb-2 px-1">
                  <span className="font-semibold text-[#5e2632] flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[#c99750] fill-current" />
                    Signature Carousel Track:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">
                      Click to select • Use arrows below to swap order
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCarouselTrack(false)}
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-700 px-1.5 py-0.5 rounded hover:bg-stone-100 cursor-pointer"
                      title="Hide carousel track"
                    >
                      Hide Track ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
                  {signatureDishes.map((item, idx) => {
                    const isActive = idx === liveIndex;
                    return (
                      <div
                        key={item.id}
                        className={`group relative shrink-0 w-28 sm:w-32 rounded-xl overflow-hidden border-2 transition-all p-1 text-left ${
                          isActive
                            ? 'border-[#9e4c5b] bg-[#faeaee] shadow-md scale-102 ring-2 ring-[#9e4c5b]/40'
                            : 'border-stone-200 bg-white hover:border-[#cf8a99] hover:bg-[#fff9fa] opacity-85 hover:opacity-100'
                        }`}
                      >
                        {/* Photo Thumbnail */}
                        <button
                          type="button"
                          onClick={() => setLiveIndex(idx)}
                          className="w-full text-left cursor-pointer"
                          title={`Jump to #${idx + 1} ${item.name}`}
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 mb-1">
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-black/70 text-white rounded">
                              #{idx + 1}
                            </span>
                            {isActive && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#9e4c5b] text-white rounded shadow-xs">
                                LIVE
                              </span>
                            )}
                          </div>

                          {/* Dish Name */}
                          <p className="text-[11px] font-medium text-stone-800 truncate px-0.5 leading-tight">
                            {item.name}
                          </p>
                        </button>

                        {/* Quick Swap Left & Right Buttons */}
                        {onSwapItems && signatureDishes.length > 1 && (
                          <div className="flex items-center justify-between mt-1 px-0.5 pt-0.5 border-t border-black/10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (idx > 0) {
                                  onSwapItems(item.id, signatureDishes[idx - 1].id);
                                  if (isActive) setLiveIndex(idx - 1);
                                }
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-black/5 disabled:opacity-20 cursor-pointer"
                              title="Move bake left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>

                            <span className="text-[9px] font-mono text-stone-500 font-bold">
                              Slot {idx + 1}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (idx < signatureDishes.length - 1) {
                                  onSwapItems(item.id, signatureDishes[idx + 1].id);
                                  if (isActive) setLiveIndex(idx + 1);
                                }
                              }}
                              disabled={idx === signatureDishes.length - 1}
                              className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-black/5 disabled:opacity-20 cursor-pointer"
                              title="Move bake right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

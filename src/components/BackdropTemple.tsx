import React, { useEffect, useState, useRef } from 'react';
import { BackdropSettings } from '../types';
import { FLOWER_BLOSSOM_PRESETS } from '../data/initialData';
import { useEditMode } from '../context/EditModeContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  Flower2,
  Trash2,
  ImageOff,
  Clock,
  Sparkles,
  X,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';

interface BackdropTempleProps {
  settings: BackdropSettings;
  onUpdateSettings?: (settings: BackdropSettings) => void;
  onOpenSelector?: () => void;
  onNextBackdrop?: () => void;
  onPrevBackdrop?: () => void;
  onToggleAutoRotate?: () => void;
  onDeleteCurrentWallpaper?: () => void;
  secondsRemaining?: number;
}

export const BackdropTemple: React.FC<BackdropTempleProps> = ({
  settings,
  onUpdateSettings,
  onOpenSelector,
  onNextBackdrop,
  onPrevBackdrop,
  onToggleAutoRotate,
  onDeleteCurrentWallpaper,
  secondsRemaining,
}) => {
  const { isEditMode } = useEditMode();
  // Eagerly pre-decode all available wallpapers into GPU VRAM
  useEffect(() => {
    const urlsToPreload = new Set<string>();
    FLOWER_BLOSSOM_PRESETS.forEach((preset) => urlsToPreload.add(preset.imageUrl));
    (settings.customUploadedImages || []).forEach((c) => {
      if (c?.imageUrl) urlsToPreload.add(c.imageUrl);
    });

    urlsToPreload.forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, [settings.customUploadedImages]);

  // Fade duration (default 2500ms cinema slow cross-fade)
  const fadeDuration = settings.fadeDuration || 2500;

  // True Dual-Buffer Architecture:
  // Buffer A and Buffer B are two permanent hardware-accelerated layers.
  // One buffer displays the current wallpaper at full target opacity.
  // The other buffer silently pre-loads and pre-decodes the incoming wallpaper at opacity 0.
  // When transitioning, the outgoing buffer slowly fades out (1 -> 0) while the incoming buffer slowly fades in (0 -> 1).
  // No DOM nodes are unmounted and no background images are swapped on active layers, eliminating all glitches/flickering.
  const initialUrl = (!settings.noWallpaperMode && settings.imageUrl) ? settings.imageUrl : '';
  const [layerA, setLayerA] = useState<{ url: string; opacity: number }>({
    url: initialUrl,
    opacity: initialUrl ? 1 : 0,
  });
  const [layerB, setLayerB] = useState<{ url: string; opacity: number }>({
    url: '',
    opacity: 0,
  });

  const activeBufferRef = useRef<'A' | 'B'>(initialUrl ? 'A' : 'B');
  const displayedUrlRef = useRef<string>(initialUrl);
  const transitionIdRef = useRef<number>(0);

  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close timer popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsTimerPopoverOpen(false);
      }
    };
    if (isTimerPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimerPopoverOpen]);

  // Silky-Smooth Dual-Buffer Pre-Decoded Cross-Fade (Fade-out & Fade-in)
  useEffect(() => {
    const incomingUrl = (!settings.noWallpaperMode && settings.imageUrl) ? settings.imageUrl : '';

    // If no wallpaper mode or empty: slowly fade out both layers
    if (!incomingUrl) {
      displayedUrlRef.current = '';
      setLayerA((prev) => (prev.opacity > 0 ? { ...prev, opacity: 0 } : prev));
      setLayerB((prev) => (prev.opacity > 0 ? { ...prev, opacity: 0 } : prev));
      return;
    }

    // Already showing this exact URL in the active buffer
    if (incomingUrl === displayedUrlRef.current) {
      return;
    }

    // If starting fresh with no active image (e.g. initial mount or coming out of noWallpaperMode)
    if (!displayedUrlRef.current && layerA.opacity === 0 && layerB.opacity === 0) {
      displayedUrlRef.current = incomingUrl;
      activeBufferRef.current = 'A';
      setLayerA({ url: incomingUrl, opacity: 1 });
      return;
    }

    const currentTransitionId = ++transitionIdRef.current;
    const targetBuffer = activeBufferRef.current === 'A' ? 'B' : 'A';

    // Preload & decode incoming image before starting the opacity transition
    const img = new Image();
    img.src = incomingUrl;

    let didExecute = false;
    let safetyTimer: ReturnType<typeof setTimeout>;

    const executeTransition = () => {
      if (didExecute) return;
      didExecute = true;
      clearTimeout(safetyTimer);
      if (transitionIdRef.current !== currentTransitionId) return;
      displayedUrlRef.current = incomingUrl;

      // 1. Assign the new URL to the INACTIVE buffer while keeping its opacity strictly at 0
      if (targetBuffer === 'B') {
        setLayerB({ url: incomingUrl, opacity: 0 });
      } else {
        setLayerA({ url: incomingUrl, opacity: 0 });
      }

      // 2. Allow a brief tick for texture preparation before animating crossfade
      setTimeout(() => {
        if (transitionIdRef.current !== currentTransitionId) return;
        if (targetBuffer === 'B') {
          setLayerA((prev) => ({ ...prev, opacity: 0 }));
          setLayerB({ url: incomingUrl, opacity: 1 });
          activeBufferRef.current = 'B';
        } else {
          setLayerB((prev) => ({ ...prev, opacity: 0 }));
          setLayerA({ url: incomingUrl, opacity: 1 });
          activeBufferRef.current = 'A';
        }
      }, 40);
    };

    // Safety timeout: Never hang longer than 250ms on mobile Safari / iPad WebKit
    safetyTimer = setTimeout(executeTransition, 250);

    if (img.decode) {
      img.decode().then(executeTransition).catch(executeTransition);
    } else if (img.complete) {
      executeTransition();
    } else {
      img.onload = executeTransition;
      img.onerror = executeTransition;
    }

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [settings.imageUrl, settings.noWallpaperMode]);

  // Helper to adjust rotation interval seconds
  const handleSetInterval = (seconds: number) => {
    const clamped = Math.max(2, Math.min(180, Math.round(seconds)));
    onUpdateSettings?.({
      ...settings,
      intervalSeconds: clamped,
    });
  };

  // Helper to adjust fade duration
  const handleSetFadeDuration = (durationMs: number) => {
    onUpdateSettings?.({
      ...settings,
      fadeDuration: durationMs,
    });
  };

  const allAvailableWallpapers = [
    ...(settings.customUploadedImages || []).map((c) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
      isCustom: true,
    })),
    ...FLOWER_BLOSSOM_PRESETS.filter((p) => !(settings.hiddenPresetIds || []).includes(p.id)).map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      isCustom: false,
    })),
  ];

  const handleToggleLoopWallpaper = (id: string) => {
    const currentSelected = settings.selectedWallpaperIds || [];
    const isCurrentlySelected = currentSelected.includes(id);
    const updated = isCurrentlySelected
      ? currentSelected.filter((item) => item !== id)
      : [...currentSelected, id];

    // When user selects more than 1 wallpaper, auto-activate slideshow loop!
    const shouldRotate = updated.length > 1;

    let nextImageUrl = settings.imageUrl;
    let nextPresetName = settings.presetName;
    if (!isCurrentlySelected) {
      const match = allAvailableWallpapers.find((w) => w.id === id);
      if (match) {
        nextImageUrl = match.imageUrl;
        nextPresetName = match.name;
      }
    }

    onUpdateSettings?.({
      ...settings,
      imageUrl: nextImageUrl,
      presetName: nextPresetName,
      activeWallpaperId: !isCurrentlySelected ? id : settings.activeWallpaperId,
      noWallpaperMode: false,
      selectedWallpaperIds: updated,
      autoRotate: shouldRotate,
    });
  };

  const handleSelectAllWallpapers = () => {
    const allIds = allAvailableWallpapers.map((w) => w.id);
    onUpdateSettings?.({
      ...settings,
      selectedWallpaperIds: allIds,
      autoRotate: allIds.length > 1,
      noWallpaperMode: false,
    });
  };

  const handleClearLoopWallpapers = () => {
    onUpdateSettings?.({
      ...settings,
      selectedWallpaperIds: [],
      autoRotate: false,
    });
  };

  const selectedCount = settings.selectedWallpaperIds ? settings.selectedWallpaperIds.length : FLOWER_BLOSSOM_PRESETS.length;
  const intervalSec = settings.intervalSeconds || 10;
  const progressPercent = secondsRemaining !== undefined
    ? Math.max(0, Math.min(100, ((intervalSec - secondsRemaining) / intervalSec) * 100))
    : 0;

  return (
    <aside
      aria-label="Decorative flower and blossom background"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Base soft spring / antique parchment canvas with custom background color */}
      <div
        className="absolute inset-0 parchment-texture transition-colors duration-700"
        style={{ backgroundColor: settings.backgroundColor || '#faf4ea' }}
      />

      {/* Dual Buffer Layer A: Hardware-accelerated smooth fade out & fade in */}
      {!settings.noWallpaperMode && Boolean(layerA.url) && (
        <img
          src={layerA.url}
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{
            opacity: layerA.opacity * (settings.opacity ?? 0.85),
            transition: `opacity ${fadeDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
            filter: settings.blur > 0 ? `blur(${settings.blur}px)` : 'none',
            transform: 'scale(1.02) translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'opacity',
          }}
        />
      )}

      {/* Dual Buffer Layer B: Hardware-accelerated smooth fade out & fade in */}
      {!settings.noWallpaperMode && Boolean(layerB.url) && (
        <img
          src={layerB.url}
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{
            opacity: layerB.opacity * (settings.opacity ?? 0.85),
            transition: `opacity ${fadeDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
            filter: settings.blur > 0 ? `blur(${settings.blur}px)` : 'none',
            transform: 'scale(1.02) translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'opacity',
          }}
        />
      )}

      {/* Soft natural antique tint */}
      <div
        className="absolute inset-0 transition-colors duration-700 pointer-events-none"
        style={{
          backgroundColor:
            settings.tint === 'victorian-sepia'
              ? 'rgba(235, 215, 185, 0.38)'
              : settings.tint === 'rose-blush'
              ? 'rgba(253, 238, 242, 0.28)'
              : settings.tint === 'warm-cream'
              ? 'rgba(255, 250, 240, 0.30)'
              : settings.tint === 'vintage-gold'
              ? 'rgba(248, 240, 226, 0.25)'
              : 'transparent',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Atmospheric radial vignette for card legibility while keeping wallpaper visible */}
      <div className="absolute inset-0 bg-radial from-transparent via-[rgba(255,250,242,0.22)] to-[rgba(248,238,225,0.65)] pointer-events-none" />

      {/* Floating Bottom Blossom Loop & Timer Controller (Edit Mode Only) */}
      {isEditMode && (
        <div
          data-editor-control="true"
          ref={popoverRef}
          className="editor-control absolute bottom-4 left-4 z-20 pointer-events-auto flex flex-col items-start"
        >
        {/* Interactive Timer & Speed Settings Popover */}
        {isTimerPopoverOpen && (
          <div className="mb-2 p-4 bg-[#fffcf9] border border-[#e4b3bc] rounded-2xl shadow-2xl w-[330px] sm:w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-200 text-stone-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#ebd0d6] mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#faeaee] text-[#9e4c5b]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#541e2a] font-serif-display">
                    Wallpaper Rotation & Timer Controls
                  </h4>
                  <p className="text-[10px] text-[#85545e]">
                    {selectedCount} wallpaper{selectedCount !== 1 ? 's' : ''} in automatic loop
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerPopoverOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#faeaee] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto-Rotate Play/Pause Status & Progress Bar */}
            <div className="p-2.5 rounded-xl bg-[#fdf2f4] border border-[#f2ccd4] mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${settings.autoRotate ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                  <span className="text-xs font-bold text-[#5e2632]">
                    {settings.autoRotate ? 'Slideshow Auto-Changing' : 'Slideshow Paused'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleAutoRotate}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all shadow-2xs ${
                    settings.autoRotate
                      ? 'bg-[#9e4c5b] text-white hover:bg-[#853c49]'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {settings.autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{settings.autoRotate ? 'Pause' : 'Start Auto'}</span>
                </button>
              </div>

              {/* Live countdown info */}
              {settings.autoRotate && selectedCount > 1 && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-[#85545e] font-semibold mb-1">
                    <span>Next change in:</span>
                    <span className="font-mono font-bold text-[#9e4c5b]">{secondsRemaining ?? intervalSec}s / {intervalSec}s</span>
                  </div>
                  <div className="w-full bg-[#faeaee] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#9e4c5b] h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Timer Interval Duration */}
            <div className="mb-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9e4c5b]" />
                  Rotation Interval (Seconds):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetInterval((settings.intervalSeconds || 10) - 1)}
                    className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                    title="Decrease 1 second"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="2"
                    max="180"
                    value={settings.intervalSeconds || 10}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) handleSetInterval(v);
                    }}
                    className="font-mono font-bold text-[#9e4c5b] px-1.5 py-0.5 bg-[#faeaee] border border-[#e4b3bc] rounded text-xs w-[44px] text-center"
                  />
                  <span className="text-[11px] text-stone-500">sec</span>
                  <button
                    type="button"
                    onClick={() => handleSetInterval((settings.intervalSeconds || 10) + 1)}
                    className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                    title="Increase 1 second"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={settings.intervalSeconds || 10}
                onChange={(e) => handleSetInterval(parseInt(e.target.value, 10))}
                className="w-full accent-[#9e4c5b] cursor-pointer"
              />

              {/* Quick Interval Preset Chips */}
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {[3, 5, 8, 10, 15, 20, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleSetInterval(sec)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      (settings.intervalSeconds || 10) === sec
                        ? 'bg-[#9e4c5b] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Slow Fade Transition Duration */}
            <div className="mb-3 pt-2.5 border-t border-[#ebd0d6]/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
                  Slow Fade Dissolve Speed:
                </span>
                <span className="font-mono font-bold text-[#9e4c5b] text-xs">
                  {((fadeDuration) / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Fade duration preset options */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { ms: 5000, label: 'Cinema Slow (5.0s)' },
                  { ms: 4000, label: 'Dreamy Slow (4.0s)' },
                  { ms: 3000, label: 'Smooth Fade (3.0s)' },
                  { ms: 2000, label: 'Gentle Fade (2.0s)' },
                  { ms: 1000, label: 'Subtle Fade (1.0s)' },
                  { ms: 400, label: 'Quick Cut (0.4s)' },
                ].map((opt) => (
                  <button
                    key={opt.ms}
                    type="button"
                    onClick={() => handleSetFadeDuration(opt.ms)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                      fadeDuration === opt.ms
                        ? 'bg-[#9e4c5b] text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Multi-Wallpaper Slideshow Selector */}
            <div className="mb-3 pt-2.5 border-t border-[#ebd0d6]/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#9e4c5b]" />
                  Select Wallpapers to Auto-Rotate:
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={handleSelectAllWallpapers}
                    className="text-[#9e4c5b] hover:underline font-bold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearLoopWallpapers}
                    className="text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {allAvailableWallpapers.map((w) => {
                  const isChecked = (settings.selectedWallpaperIds || []).includes(w.id);
                  const isCurrent = settings.imageUrl === w.imageUrl || settings.activeWallpaperId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleToggleLoopWallpaper(w.id)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#fbf0f2] border-[#e4b3bc] ring-1 ring-[#e4b3bc]'
                          : 'bg-white border-stone-200 hover:bg-stone-50 opacity-70'
                      }`}
                    >
                      <img
                        src={w.imageUrl}
                        alt={w.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=200&auto=format&fit=crop';
                        }}
                        className="w-7 h-7 rounded-md object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-stone-800 truncate leading-tight">
                          {w.name}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] text-[#9e4c5b] font-semibold flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#9e4c5b] animate-ping" />
                            Showing
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white text-[9px] font-bold ${
                          isChecked ? 'bg-emerald-600' : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Open Full Studio Link */}
            {onOpenSelector && (
              <button
                type="button"
                onClick={() => {
                  setIsTimerPopoverOpen(false);
                  onOpenSelector();
                }}
                className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-[#faeaee] to-[#fce4ea] hover:from-[#f6dbe2] hover:to-[#f9d7e0] text-[#7a2c3d] text-xs font-bold border border-[#e4b3bc] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Select & Manage Multiple Wallpapers</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
              </button>
            )}
          </div>
        )}

        {/* Floating Controller Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ebd0d6] text-xs text-[#7a3b47] shadow-lg hover:bg-white transition-all cursor-default max-w-[calc(100vw-2rem)]">
          {/* Blossom indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {settings.noWallpaperMode || !settings.imageUrl ? (
              <ImageOff className="w-3.5 h-3.5 text-[#a8652f]" />
            ) : (
              <Flower2
                className={`w-3.5 h-3.5 text-[#a8652f] ${
                  settings.autoRotate ? 'animate-spin [animation-duration:14s]' : ''
                }`}
              />
            )}
            <span className="font-bold text-[#4a2414] hidden md:inline">Wallpaper:</span>
          </div>

          {/* Current scene name */}
          <span
            className="text-[#59341f] font-medium truncate max-w-[130px] sm:max-w-[170px]"
            title={settings.presetName}
          >
            {settings.noWallpaperMode || !settings.imageUrl
              ? 'Victorian Aged Parchment'
              : settings.presetName || 'London Bakehouse'}
          </span>

          {/* Delete / Remove Wallpaper Button */}
          {!settings.noWallpaperMode && settings.imageUrl && (
            <button
              type="button"
              onClick={() => {
                if (onDeleteCurrentWallpaper) {
                  onDeleteCurrentWallpaper();
                } else if (onUpdateSettings) {
                  onUpdateSettings({
                    ...settings,
                    imageUrl: '',
                    presetName: 'No Wallpaper (Victorian Parchment)',
                    locationLabel: 'Oliver Twist 1838 Texture',
                    noWallpaperMode: true,
                    autoRotate: false,
                  });
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs shrink-0"
              title="Delete / Remove active wallpaper (switch to aged parchment)"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Remove</span>
            </button>
          )}

          {/* Slow fade indicator badge */}
          {!settings.noWallpaperMode && settings.imageUrl && (
            <button
              type="button"
              onClick={() => setIsTimerPopoverOpen((prev) => !prev)}
              className="hidden lg:inline-flex items-center gap-1 text-[10px] text-[#9e4c5b] bg-[#fcedf0] hover:bg-[#f8dfe5] px-2 py-0.5 rounded-full border border-[#f3ccd5] font-semibold shrink-0 cursor-pointer transition-colors"
              title="Click to adjust fade speed & timer"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#c99750]" />
              <span>{((fadeDuration) / 1000).toFixed(1)}s slow fade</span>
            </button>
          )}

          {/* Interactive Countdown Badge with Direct Click to Open Controls */}
          {!settings.noWallpaperMode && settings.imageUrl && (
            <button
              type="button"
              onClick={() => setIsTimerPopoverOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 pl-2 pr-2 py-0.5 rounded-full border shrink-0 transition-all cursor-pointer ${
                settings.autoRotate
                  ? 'bg-[#faeaee] hover:bg-[#f6d9e1] border-[#f2ccd4] text-[#8b3d4d]'
                  : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600'
              }`}
              title="Click to open full timer controls"
            >
              {settings.autoRotate ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df7084] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9e4c5b]" />
                  </span>
                  <span className="font-mono text-[11px] font-bold">
                    {secondsRemaining !== undefined ? `${secondsRemaining}s` : `${intervalSec}s`}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  <span className="text-[10px] font-bold">Paused</span>
                </>
              )}
              <Clock className="w-3 h-3 opacity-60 ml-0.5" />
            </button>
          )}

          {/* Quick controls: Prev, Play/Pause, Next, Slider settings button */}
          <div className="flex items-center gap-1 border-l border-[#ebd0d6] pl-1.5 shrink-0">
            {!settings.noWallpaperMode && onPrevBackdrop && (
              <button
                onClick={onPrevBackdrop}
                className="p-1 rounded-full hover:bg-[#faeaee] text-[#7a3b47] hover:text-[#9e4c5b] transition-colors cursor-pointer"
                title="Previous wallpaper"
              >
                <SkipBack className="w-3 h-3" />
              </button>
            )}

            {!settings.noWallpaperMode && onToggleAutoRotate && (
              <button
                onClick={onToggleAutoRotate}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  settings.autoRotate
                    ? 'bg-[#faeaee] text-[#9e4c5b] hover:bg-[#f6dbe2]'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title={settings.autoRotate ? 'Pause auto-changing' : 'Start auto-changing slideshow'}
              >
                {settings.autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            )}

            {!settings.noWallpaperMode && onNextBackdrop && (
              <button
                onClick={onNextBackdrop}
                className="p-1 rounded-full hover:bg-[#faeaee] text-[#7a3b47] hover:text-[#9e4c5b] transition-colors cursor-pointer"
                title="Next wallpaper"
              >
                <SkipForward className="w-3 h-3" />
              </button>
            )}

            {/* Quick Timer & Full Options Opener */}
            <button
              onClick={() => setIsTimerPopoverOpen((prev) => !prev)}
              className={`p-1 rounded-full transition-colors cursor-pointer ml-0.5 ${
                isTimerPopoverOpen ? 'bg-[#faeaee] text-[#9e4c5b]' : 'hover:bg-[#faeaee] text-[#7a3b47]'
              }`}
              title="Full timer and fade duration access"
            >
              <Clock className="w-3 h-3 text-[#9e4c5b]" />
            </button>

            {onOpenSelector && (
              <button
                onClick={onOpenSelector}
                className="p-1 rounded-full hover:bg-[#faeaee] text-[#7a3b47] hover:text-[#9e4c5b] transition-colors cursor-pointer"
                title="Master Studio: Select wallpapers and customize atelier"
              >
                <Sliders className="w-3 h-3 text-[#c99750]" />
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </aside>
  );
};

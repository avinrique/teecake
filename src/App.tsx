import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BackdropTemple } from './components/BackdropTemple';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { SignatureMenu } from './components/SignatureMenu';
import { DishesGallery } from './components/DishesGallery';
import { AllDishesSection } from './components/AllDishesSection';
import { ArtOfBakingQuotes } from './components/ArtOfBakingQuotes';
import { LocationAndHours } from './components/LocationAndHours';
import { Footer } from './components/Footer';
import { FloatingNavbar } from './components/FloatingNavbar';
import { LightboxModal } from './components/LightboxModal';
import { ImageUploadCropModal } from './components/ImageUploadCropModal';
import { EditContactModal } from './components/EditContactModal';
import { UploadLogoModal } from './components/UploadLogoModal';
import { BrandEditorModal } from './components/BrandEditorModal';
import { PageTextEditorModal } from './components/PageTextEditorModal';
import { SectionWrapper } from './components/SectionWrapper';
import { CustomSection } from './components/CustomSection';
import { ManageSectionsModal } from './components/ManageSectionsModal';
import { TypographyModal } from './components/TypographyModal';
import { MasterStudioModal } from './components/MasterStudioModal';
import { EditFiltersModal } from './components/EditFiltersModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PromptConfirmModal, ConfirmDialogState } from './components/PromptConfirmModal';
import { useEditMode } from './context/EditModeContext';
import { EditorModeToggle } from './components/EditorModeToggle';
import { useTypography } from './context/TypographyContext';
import { Type, Sliders } from 'lucide-react';
import { ShareModal } from './components/ShareModal';
import {
  saveItemsToIndexedDB,
  loadItemsFromIndexedDB,
  safeSaveItemsToLocalStorage,
  safeSetLocalStorage,
  setIndexedDBValue,
  getIndexedDBValue,
  saveAppDataToServer,
  loadAppDataFromServer,
  getDishImageBackup,
  uploadImageToServer,
} from './utils/persistentStorage';

import {
  BakeryItem,
  CafeContactDetails,
  BakingQuote,
  BackdropSettings,
  PageTexts,
  QuoteStyleSettings,
  PageSection,
} from './types';

import {
  INITIAL_25_BAKERY_ITEMS,
  INITIAL_CONTACT_DETAILS,
  INITIAL_BAKING_QUOTES,
  INITIAL_BACKDROP_SETTINGS,
  FLOWER_BLOSSOM_PRESETS,
  DEFAULT_PAGE_TEXTS,
  DEFAULT_QUOTE_STYLE_SETTINGS,
  INITIAL_PAGE_SECTIONS,
  DEFAULT_CATEGORIES,
} from './data/initialData';

const STORAGE_KEY_ITEMS = 'teecake_bakery_items_v21';
const STORAGE_KEY_DELETED_ITEMS = 'teecake_deleted_item_ids_v21';
const STORAGE_KEY_CATEGORIES = 'teecake_categories_v21';
const STORAGE_KEY_CONTACT = 'teecake_contact_details_v21';
const STORAGE_KEY_QUOTES = 'teecake_baking_quotes_v21';
const STORAGE_KEY_BACKDROP = 'teecake_backdrop_settings_v21';
const STORAGE_KEY_LOGO = 'teecake_custom_logo_v21';
const STORAGE_KEY_PAGETEXTS = 'teecake_page_texts_v21';
const STORAGE_KEY_QUOTE_STYLES = 'teecake_quote_styles_v21';
const STORAGE_KEY_SECTIONS = 'teecake_page_sections_v21';

export default function App() {
  const { isAdmin, isEditMode } = useEditMode();
  // Clear any stale legacy cache keys from earlier sessions so updated dishes load immediately
  useEffect(() => {
    const legacyKeys = [
      'teecake_bakery_items_v20',
      'teecake_deleted_item_ids_v20',
      'teecake_bakery_items_v2_categorized',
      'teecake_bakery_items_v1',
      'teecake_deleted_item_ids_v1',
      'teecake_categories_v3_savory_combo',
      'teecake_backdrop_settings_v6_flower_loop',
      'teecake_custom_logo_v1',
      'teecake_page_texts_v1',
      'teecake_baking_quotes_v1',
      'teecake_contact_details_v1',
      'teecake_page_sections_v2',
    ];
    legacyKeys.forEach((k) => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }, []);

  // Site typography & text glow settings
  const { settings: typographySettings, updateSettings: updateTypographySettings } = useTypography();

  // Gatekeeper ref to ensure initial IndexedDB load completes before any write effect runs
  const isIdbHydrated = useRef<boolean>(false);
  // Dirty tracking ref so fresh server state is never overwritten by unedited client mount
  const hasUserEditedRef = useRef<boolean>(false);
  const [editRevision, setEditRevision] = useState<number>(0);
  const markUserEdited = useCallback(() => {
    hasUserEditedRef.current = true;
    setEditRevision((r) => r + 1);
  }, []);

  // Page Texts State for full site copy editability
  const [pageTexts, setPageTexts] = useState<PageTexts>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.pageTexts;
    if (srv && typeof srv === 'object') return { ...DEFAULT_PAGE_TEXTS, ...srv };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAGETEXTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PAGE_TEXTS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load page texts from storage:', e);
    }
    return DEFAULT_PAGE_TEXTS;
  });

  const [isPageTextModalOpen, setIsPageTextModalOpen] = useState<boolean>(false);
  const [isBrandEditorModalOpen, setIsBrandEditorModalOpen] = useState<boolean>(false);
  const [isTypographyModalOpen, setIsTypographyModalOpen] = useState<boolean>(false);
  const [isManageFiltersOpen, setIsManageFiltersOpen] = useState<boolean>(false);

  const handleUpdatePageText = (field: keyof PageTexts, value: string) => {
    markUserEdited();
    setPageTexts((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePageTexts = (updated: PageTexts) => {
    markUserEdited();
    setPageTexts(updated);
  };

  const handleSaveBrand = (data: {
    brandName: string;
    brandSubtitle: string;
    brandLogoSize: 'sm' | 'md' | 'lg' | 'xl';
    customLogoUrl: string | null;
  }) => {
    markUserEdited();
    setPageTexts((prev) => ({
      ...prev,
      brandName: data.brandName,
      brandSubtitle: data.brandSubtitle,
      brandLogoSize: data.brandLogoSize,
    }));
    setCustomLogoUrl(data.customLogoUrl);
  };

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      safeSetLocalStorage(STORAGE_KEY_PAGETEXTS, JSON.stringify(pageTexts));
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
    setIndexedDBValue('page_texts', pageTexts);
  }, [pageTexts]);

  // Category filters state (Self-editable, customizable list of categories)
  const [categories, setCategories] = useState<string[]>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.categories;
    if (Array.isArray(srv) && srv.length > 0) return srv;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let updated = [...parsed];
          if (!updated.includes('Savory')) updated.push('Savory');
          if (!updated.includes('Assorted Combo')) updated.push('Assorted Combo');
          return updated;
        }
      }
    } catch (e) {
      console.warn('Failed to load categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    try {
      safeSetLocalStorage(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories to storage:', e);
    }
  }, [categories]);

  const handleSaveCategories = (newCategories: string[]) => {
    markUserEdited();
    setCategories(newCategories);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    markUserEdited();
    setCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
    setItems((prev) =>
      prev.map((item) =>
        (item.category || '').toLowerCase() === oldName.toLowerCase()
          ? { ...item, category: newName }
          : item
      )
    );
  };

  // Items state (Authoritative dishes)
  const [items, setItems] = useState<BakeryItem[]>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.items;
    if (Array.isArray(srv)) return srv;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load items from storage:', e);
    }
    return INITIAL_25_BAKERY_ITEMS;
  });

  // Contact details state
  const [contact, setContact] = useState<CafeContactDetails>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.contact;
    if (srv && typeof srv === 'object') return srv;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTACT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.socials?.instagram === '@teecakecreations' || parsed?.socials?.instagram === 'teecakecreations') {
          parsed.socials.instagram = '@TeeCake_Creations';
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load contact from storage:', e);
    }
    return INITIAL_CONTACT_DETAILS;
  });

  // Quotes state
  const [quotes, setQuotes] = useState<BakingQuote[]>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.quotes;
    if (Array.isArray(srv) && srv.length > 0) return srv;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load quotes from storage:', e);
    }
    return INITIAL_BAKING_QUOTES;
  });

  // Quote visual typography & styling settings state
  const [quoteStyleSettings, setQuoteStyleSettings] = useState<QuoteStyleSettings>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.quoteStyleSettings;
    if (srv && typeof srv === 'object') {
      return { ...DEFAULT_QUOTE_STYLE_SETTINGS, ...srv };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUOTE_STYLES);
      if (saved) {
        return { ...DEFAULT_QUOTE_STYLE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load quote style settings:', e);
    }
    return DEFAULT_QUOTE_STYLE_SETTINGS;
  });

  // Page Sections & Navigation state
  const [sections, setSections] = useState<PageSection[]>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.sections;
    if (Array.isArray(srv) && srv.length > 0) return srv;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SECTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load sections from storage:', e);
    }
    return INITIAL_PAGE_SECTIONS;
  });

  const [isManageSectionsModalOpen, setIsManageSectionsModalOpen] = useState<boolean>(false);
  const [insertAfterOrder, setInsertAfterOrder] = useState<number | undefined>(undefined);

  // Flowers & Blossoms Backdrop Settings state
  const [backdropSettings, setBackdropSettings] = useState<BackdropSettings>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.backdropSettings;
    if (srv && typeof srv === 'object') {
      return {
        ...INITIAL_BACKDROP_SETTINGS,
        ...srv,
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BACKDROP);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_BACKDROP_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load backdrop settings:', e);
    }
    return INITIAL_BACKDROP_SETTINGS;
  });

  // Timer countdown and backdrop control panel visibility state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    () => backdropSettings.intervalSeconds || 12
  );
  const [isBackdropControlsOpen, setIsBackdropControlsOpen] = useState<boolean>(false);

  // Helper to retrieve active wallpapers (excluding hidden/deleted presets, including custom uploaded images, and respecting multi-select for loop)
  const getActiveBackdropPlaylist = (current: BackdropSettings) => {
    if (current.noWallpaperMode) return [];
    const hidden = current.hiddenPresetIds || [];
    const activePresets = FLOWER_BLOSSOM_PRESETS.filter((p) => !hidden.includes(p.id)).map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      name: p.name,
      location: p.location,
    }));
    const custom = (current.customUploadedImages || []).map((c) => ({
      id: c.id,
      imageUrl: c.imageUrl,
      name: c.name,
      location: 'Custom Upload',
    }));
    const allAvailable = [...custom, ...activePresets];

    // If user has multi-selected specific wallpapers to run in the loop:
    if (current.selectedWallpaperIds && Array.isArray(current.selectedWallpaperIds) && current.selectedWallpaperIds.length > 0) {
      const selected = allAvailable.filter((item) => current.selectedWallpaperIds!.includes(item.id));
      if (selected.length > 0) {
        return selected;
      }
    }

    return allAvailable;
  };

  // Dedicated function to advance to the next backdrop in playlist
  const advanceToNextBackdrop = useCallback(() => {
    setBackdropSettings((current) => {
      if (current.noWallpaperMode) return current;
      const playlist = getActiveBackdropPlaylist(current);
      if (playlist.length <= 1) return current;

      const currentIndex = playlist.findIndex(
        (p) => (current.activeWallpaperId && p.id === current.activeWallpaperId) || p.imageUrl === current.imageUrl
      );
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextPreset = playlist[nextIndex >= 0 ? nextIndex : 0];
      return {
        ...current,
        activeWallpaperId: nextPreset.id,
        imageUrl: nextPreset.imageUrl,
        presetName: nextPreset.name,
        locationLabel: nextPreset.location,
      };
    });
    setSecondsRemaining(backdropSettings.intervalSeconds || 10);
  }, [backdropSettings.intervalSeconds]);

  // Dedicated function to retreat to previous backdrop in playlist
  const retreatToPrevBackdrop = useCallback(() => {
    setBackdropSettings((current) => {
      if (current.noWallpaperMode) return current;
      const playlist = getActiveBackdropPlaylist(current);
      if (playlist.length <= 1) return current;

      const currentIndex = playlist.findIndex(
        (p) => (current.activeWallpaperId && p.id === current.activeWallpaperId) || p.imageUrl === current.imageUrl
      );
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      const nextPreset = playlist[prevIndex >= 0 ? prevIndex : 0];
      return {
        ...current,
        activeWallpaperId: nextPreset.id,
        imageUrl: nextPreset.imageUrl,
        presetName: nextPreset.name,
        locationLabel: nextPreset.location,
      };
    });
    setSecondsRemaining(backdropSettings.intervalSeconds || 10);
  }, [backdropSettings.intervalSeconds]);

  // Auto-rotate endless loop timer effect
  useEffect(() => {
    // If noWallpaperMode is active or autoRotate is false, do not rotate
    if (!backdropSettings.autoRotate || backdropSettings.noWallpaperMode) {
      return;
    }

    const intervalSec = backdropSettings.intervalSeconds || 10;
    let count = intervalSec;
    setSecondsRemaining(count);

    const intervalId = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        count = intervalSec;
        setSecondsRemaining(intervalSec);

        // Advance to next backdrop
        setBackdropSettings((current) => {
          if (current.noWallpaperMode || !current.autoRotate) return current;
          const playlist = getActiveBackdropPlaylist(current);
          if (playlist.length <= 1) return current;

          const currentIndex = playlist.findIndex(
            (p) => (current.activeWallpaperId && p.id === current.activeWallpaperId) || p.imageUrl === current.imageUrl
          );
          let nextIndex = currentIndex >= 0 ? (currentIndex + 1) % playlist.length : 0;
          if (playlist[nextIndex]?.imageUrl === current.imageUrl && playlist.length > 1) {
            nextIndex = (nextIndex + 1) % playlist.length;
          }
          const nextPreset = playlist[nextIndex];
          if (!nextPreset) return current;

          return {
            ...current,
            activeWallpaperId: nextPreset.id,
            imageUrl: nextPreset.imageUrl,
            presetName: nextPreset.name,
            locationLabel: nextPreset.location,
          };
        });
      } else {
        setSecondsRemaining(count);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    backdropSettings.autoRotate,
    backdropSettings.intervalSeconds,
    backdropSettings.noWallpaperMode,
    backdropSettings.hiddenPresetIds,
    backdropSettings.customUploadedImages,
    backdropSettings.selectedWallpaperIds,
  ]);

  // Handlers for backdrop navigation and timer adjustment
  const handleNextBackdrop = () => {
    markUserEdited();
    advanceToNextBackdrop();
  };

  const handlePrevBackdrop = () => {
    markUserEdited();
    retreatToPrevBackdrop();
  };

  const handleToggleAutoRotate = () => {
    markUserEdited();
    setBackdropSettings((prev) => ({
      ...prev,
      autoRotate: !prev.autoRotate,
    }));
    setSecondsRemaining(backdropSettings.intervalSeconds || 10);
  };

  const handleUpdateBackdropSettings = (newSettings: BackdropSettings) => {
    markUserEdited();
    const prevSelCount = backdropSettings.selectedWallpaperIds?.length ?? 0;
    const newSelCount = newSettings.selectedWallpaperIds?.length ?? 0;

    // When the user selects more than 1 wallpaper, auto-enable loop automatically!
    let resolvedAutoRotate = newSettings.autoRotate;
    if (newSelCount > 1 && (newSelCount !== prevSelCount || resolvedAutoRotate === undefined)) {
      resolvedAutoRotate = true;
    } else if (newSelCount <= 1 && resolvedAutoRotate === undefined) {
      resolvedAutoRotate = false;
    } else if (resolvedAutoRotate === undefined) {
      resolvedAutoRotate = backdropSettings.autoRotate;
    }

    const safeInterval = Math.max(2, newSettings.intervalSeconds || 10);
    const safeFade = Math.min(newSettings.fadeDuration || 3000, Math.max(800, safeInterval * 1000 - 400));

    const resolved: BackdropSettings = {
      ...newSettings,
      autoRotate: Boolean(resolvedAutoRotate),
      intervalSeconds: safeInterval,
      fadeDuration: safeFade,
    };
    setBackdropSettings(resolved);
    if (resolved.intervalSeconds !== backdropSettings.intervalSeconds) {
      setSecondsRemaining(resolved.intervalSeconds);
    }
  };

  // Immediate delete / remove current active wallpaper handler
  const handleDeleteCurrentWallpaper = () => {
    markUserEdited();
    setBackdropSettings((current) => {
      const matchingPreset = FLOWER_BLOSSOM_PRESETS.find((p) => p.imageUrl === current.imageUrl);
      const hidden = current.hiddenPresetIds || [];
      const updatedHidden = matchingPreset && !hidden.includes(matchingPreset.id)
        ? [...hidden, matchingPreset.id]
        : hidden;

      const filteredCustom = (current.customUploadedImages || []).filter(
        (img) => img.imageUrl !== current.imageUrl
      );

      return {
        ...current,
        imageUrl: '',
        presetName: 'No Wallpaper (Victorian Parchment)',
        locationLabel: 'Oliver Twist 1838 Aged Texture',
        noWallpaperMode: true,
        autoRotate: false,
        hiddenPresetIds: updatedHidden,
        customUploadedImages: filteredCustom,
      };
    });
  };

  // Custom Logo Url state
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    const srv = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__?.customLogoUrl;
    if (srv && typeof srv === 'string') return srv;
    try {
      return localStorage.getItem(STORAGE_KEY_LOGO) || '/uploads/logo_b8t0adwr.jpg';
    } catch (e) {
      return '/uploads/logo_b8t0adwr.jpg';
    }
  });

  // Lightbox & Navigation states
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState<number>(0);

  // Modals state
  const [isUploadCropModalOpen, setIsUploadCropModalOpen] = useState<boolean>(false);
  const [cropModalMode, setCropModalMode] = useState<'add' | 'replace-photo' | 'edit-full'>('add');
  const [activeEditItem, setActiveEditItem] = useState<BakeryItem | null>(null);
  const [cropModalInitialFile, setCropModalInitialFile] = useState<File | null>(null);

  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState<boolean>(false);
  const [isUploadLogoModalOpen, setIsUploadLogoModalOpen] = useState<boolean>(false);
  const [isMasterStudioModalOpen, setIsMasterStudioModalOpen] = useState<boolean>(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<BakeryItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Cloud & Disk Sync states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  useEffect(() => {
    const conflict = () => {
      setSaveNotification('Another admin changed the website. Reload this page before saving again.');
    };
    window.addEventListener('teecake-save-conflict', conflict);
    return () => window.removeEventListener('teecake-save-conflict', conflict);
  }, []);

  // Helper to sync all current state to the cloud server database
  const syncAllToServer = useCallback(async (customItems?: BakeryItem[]) => {
    if (!isAdmin) return false;
    try {
      const activeItems = customItems || items;
      const timerSec = typeof window !== 'undefined' && localStorage.getItem('teecake_signature_timer_seconds')
        ? parseFloat(localStorage.getItem('teecake_signature_timer_seconds')!)
        : 1.0;
      const fadeSpd = typeof window !== 'undefined' && localStorage.getItem('teecake_signature_fade_speed')
        ? localStorage.getItem('teecake_signature_fade_speed')!
        : 'slow';
      const showCarousel = typeof window !== 'undefined' && localStorage.getItem('teecake_signature_show_carousel_track') === 'true';

      const payload = {
        updatedAt: new Date().toISOString(),
        items: activeItems,
        contact,
        quotes,
        quoteStyleSettings,
        typographySettings,
        backdropSettings,
        pageTexts,
        categories,
        sections,
        customLogoUrl,
        timerSeconds: timerSec,
        fadeMode: fadeSpd,
        showCarouselTrack: showCarousel,
      };

      const res = await saveAppDataToServer(payload);
      if (res && res.success) {
        setLastCloudSyncTime(new Date().toLocaleTimeString());
        // If server sanitized base64 images into physical /uploads/ files, update local state
        if (res.data?.items && Array.isArray(res.data.items)) {
          const serverItems = res.data.items;
          const serverMap = new Map<string, string>(serverItems.map((i: any) => [i.id, String(i.image || '')]));
          setItems((prev) => {
            let changed = false;
            const updated = prev.map((item) => {
              const serverImg = serverMap.get(item.id);
              if (serverImg && serverImg !== item.image && serverImg.startsWith('/uploads/') && activeItems.find(sent => sent.id === item.id)?.image === item.image) {
                changed = true;
                return { ...item, image: serverImg };
              }
              return item;
            });
            if (changed) {
              safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, updated);
              saveItemsToIndexedDB(updated);
              return updated;
            }
            return prev;
          });
        }

        // Also update backdropSettings if base64 uploads were converted to physical /uploads/ URLs
        if (res.data?.backdropSettings) {
          const srvBackdrop = res.data.backdropSettings;
          setBackdropSettings((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(backdropSettings)) return prev;
            const resolved = {
              ...prev,
              ...srvBackdrop,
              imageUrl: srvBackdrop.imageUrl || prev.imageUrl,
              customUploadedImages: srvBackdrop.customUploadedImages || prev.customUploadedImages,
            };
            if (JSON.stringify(prev) === JSON.stringify(resolved)) return prev;
            try {
              safeSetLocalStorage(STORAGE_KEY_BACKDROP, JSON.stringify(resolved));
            } catch (e) {}
            setIndexedDBValue('backdrop_settings', resolved);
            return resolved;
          });
        }

        // Also update customLogoUrl if converted
        if (res.data?.customLogoUrl && res.data.customLogoUrl !== customLogoUrl) {
          setCustomLogoUrl(current => current === customLogoUrl ? res.data.customLogoUrl : current);
          try {
            safeSetLocalStorage(STORAGE_KEY_LOGO, res.data.customLogoUrl);
          } catch (e) {}
          setIndexedDBValue('custom_logo', res.data.customLogoUrl);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Sync to server failed:', e);
      return false;
    }
  }, [isAdmin, items, contact, quotes, quoteStyleSettings, typographySettings, backdropSettings, pageTexts, categories, sections, customLogoUrl]);

  const handleExplicitSyncToCloud = async (): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const result = await syncAllToServer();
      if (result) {
        setSaveNotification('✓ All changes saved to disk! Your friend link is up to date.');
        setTimeout(() => setSaveNotification(null), 3500);
      }
      return result;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Asynchronously synchronize with Server Database + IndexedDB on mount so any items, custom uploaded wallpapers,
  // custom logo, page texts, and contact details are flawlessly shared across devices & viewers
  useEffect(() => {
    let isMounted = true;

    async function hydrateFromStorageAndServer() {
      try {
        const [
          serverData,
          idbItems,
          idbBackdrop,
          idbLogo,
          idbContact,
          idbTexts,
          idbQuotes,
          idbSections,
        ] = await Promise.all([
          loadAppDataFromServer(),
          loadItemsFromIndexedDB(),
          getIndexedDBValue<BackdropSettings>('backdrop_settings'),
          getIndexedDBValue<string>('custom_logo'),
          getIndexedDBValue<CafeContactDetails>('contact_details'),
          getIndexedDBValue<PageTexts>('page_texts'),
          getIndexedDBValue<BakingQuote[]>('baking_quotes'),
          getIndexedDBValue<PageSection[]>('page_sections'),
        ]);

        if (!isMounted) return;

        // 1. Authoritative Server Items (Faithfully adopt server creations without overriding or resurrecting deleted items)
        let resolvedItems: BakeryItem[] | null = null;
        if (serverData && Array.isArray(serverData.items)) {
          resolvedItems = serverData.items;
        } else if (Array.isArray(idbItems)) {
          resolvedItems = idbItems;
        } else {
          try {
            const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                resolvedItems = parsed;
              }
            }
          } catch (e) {}
        }

        if (resolvedItems === null) {
          resolvedItems = INITIAL_25_BAKERY_ITEMS;
        }

        // Self-healing: Check for any local IndexedDB image backups only if a dish image is missing
        let itemsWereRestored = false;
        for (let i = 0; i < resolvedItems.length; i++) {
          const item = resolvedItems[i];
          let missingImage = !item?.image || item.image.trim() === '';
          if (item?.image?.startsWith('/uploads/')) {
            try { missingImage = (await fetch(item.image, { method: 'HEAD', cache: 'no-store' })).status === 404; } catch {}
          }
          if (item && item.id && missingImage) {
            const backup = await getDishImageBackup(item.id);
            if (backup && (backup.startsWith('data:image/') || backup.startsWith('/uploads/') || backup.startsWith('http'))) {
              item.image = backup;
              itemsWereRestored = true;

            }
          }
        }

        setItems([...resolvedItems]);
        safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, resolvedItems);
        saveItemsToIndexedDB(resolvedItems);


        // 2. Consolidate Contact Details
        const resolvedContact = serverData?.contact || idbContact || null;
        if (resolvedContact) {
          setContact((prev) => ({
            ...prev,
            ...resolvedContact,
            socials: {
              ...prev.socials,
              ...(resolvedContact.socials || {}),
              instagram: (resolvedContact.socials?.instagram === '@teecakecreations' || resolvedContact.socials?.instagram === 'teecakecreations')
                ? '@TeeCake_Creations'
                : (resolvedContact.socials?.instagram || '@TeeCake_Creations'),
            },
          }));
          safeSetLocalStorage(STORAGE_KEY_CONTACT, JSON.stringify(resolvedContact));
          setIndexedDBValue('contact_details', resolvedContact);
        }

        // 3. Consolidate Page Texts
        const resolvedTexts = {
          ...DEFAULT_PAGE_TEXTS,
          ...(idbTexts || {}),
          ...(serverData?.pageTexts || {}),
        };
        setPageTexts(resolvedTexts);
        safeSetLocalStorage(STORAGE_KEY_PAGETEXTS, JSON.stringify(resolvedTexts));
        setIndexedDBValue('page_texts', resolvedTexts);

        // 4. Consolidate Background & Wallpapers
        const srvBackdrop = serverData?.backdropSettings;
        const srvCustom = Array.isArray(srvBackdrop?.customUploadedImages) ? srvBackdrop.customUploadedImages : [];
        const idbCustom = Array.isArray(idbBackdrop?.customUploadedImages) ? idbBackdrop.customUploadedImages : [];
        const customMap = new Map();
        (srvBackdrop ? srvCustom : idbCustom).forEach((c: any) => {
          if (c && c.imageUrl) customMap.set(c.id || c.imageUrl, c);
        });
        const mergedCustomWallpapers = Array.from(customMap.values());

        const resolvedSelectedWallpapers = Array.isArray(srvBackdrop?.selectedWallpaperIds)
          ? srvBackdrop.selectedWallpaperIds
          : Array.isArray(idbBackdrop?.selectedWallpaperIds)
          ? idbBackdrop.selectedWallpaperIds
          : FLOWER_BLOSSOM_PRESETS.map((p) => p.id);

        const resolvedBackdrop: BackdropSettings = {
          ...INITIAL_BACKDROP_SETTINGS,
          ...(idbBackdrop || {}),
          ...(srvBackdrop || {}),
          customUploadedImages: srvBackdrop ? mergedCustomWallpapers : (mergedCustomWallpapers.length > 0 ? mergedCustomWallpapers : INITIAL_BACKDROP_SETTINGS.customUploadedImages),
          selectedWallpaperIds: resolvedSelectedWallpapers.length > 0 ? resolvedSelectedWallpapers : INITIAL_BACKDROP_SETTINGS.selectedWallpaperIds,
          autoRotate: srvBackdrop?.autoRotate ?? idbBackdrop?.autoRotate ?? INITIAL_BACKDROP_SETTINGS.autoRotate ?? true,
          intervalSeconds: srvBackdrop?.intervalSeconds || INITIAL_BACKDROP_SETTINGS.intervalSeconds || 10,
          fadeDuration: srvBackdrop?.fadeDuration || INITIAL_BACKDROP_SETTINGS.fadeDuration || 3000,
        };
        setBackdropSettings(resolvedBackdrop);
        setIndexedDBValue('backdrop_settings', resolvedBackdrop);
        safeSetLocalStorage(STORAGE_KEY_BACKDROP, JSON.stringify(resolvedBackdrop));

        // 5. Consolidate Custom Logo
        const resolvedLogo = serverData?.customLogoUrl ?? idbLogo ?? '/uploads/logo_b8t0adwr.jpg';
        setCustomLogoUrl(resolvedLogo);
        safeSetLocalStorage(STORAGE_KEY_LOGO, resolvedLogo);
        setIndexedDBValue('custom_logo', resolvedLogo);

        // 6. Consolidate Baking Quotes
        const resolvedQuotes = (Array.isArray(serverData?.quotes) && serverData.quotes.length > 0)
          ? serverData.quotes
          : (Array.isArray(idbQuotes) && idbQuotes.length > 0)
          ? idbQuotes
          : INITIAL_BAKING_QUOTES;
        setQuotes(resolvedQuotes);
        setIndexedDBValue('baking_quotes', resolvedQuotes);

        // 7. Consolidate Quote Style Settings
        if (serverData?.quoteStyleSettings) {
          setQuoteStyleSettings(serverData.quoteStyleSettings);
        }

        // 7b. Consolidate Site Typography Settings (font size, style, text glow, weights)
        if (serverData?.typographySettings) {
          updateTypographySettings(serverData.typographySettings);
        }

        // 8. Consolidate Categories
        if (Array.isArray(serverData?.categories) && serverData.categories.length > 0) {
          setCategories(serverData.categories);
        }

        // 9. Consolidate Page Sections
        const resolvedSections = (Array.isArray(serverData?.sections) && serverData.sections.length > 0)
          ? serverData.sections
          : (Array.isArray(idbSections) && idbSections.length > 0)
          ? idbSections
          : INITIAL_PAGE_SECTIONS;
        setSections(resolvedSections);
        setIndexedDBValue('page_sections', resolvedSections);

        // 10. Timer & Carousel controls
        if (serverData?.timerSeconds) {
          safeSetLocalStorage('teecake_signature_timer_seconds', String(serverData.timerSeconds));
        }
        if (serverData?.fadeMode) {
          safeSetLocalStorage('teecake_signature_fade_speed', serverData.fadeMode);
        }
        if (typeof serverData?.showCarouselTrack === 'boolean') {
          safeSetLocalStorage('teecake_signature_show_carousel_track', String(serverData.showCarouselTrack));
        }

        setLastCloudSyncTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn('Hydration error:', err);
      } finally {
        setTimeout(() => {
          if (isMounted) {
            isIdbHydrated.current = true;
          }
        }, 100);
      }
    }

    hydrateFromStorageAndServer();

    return () => {
      isMounted = false;
    };
  }, []);

  const typographyConfigKey = JSON.stringify(typographySettings);

  const latestSync = useRef(syncAllToServer);
  latestSync.current = syncAllToServer;

  // Continuous Auto-Persistence: Debounced save to server disk whenever ANY content,
  // images, backdrop configuration, typography, text glow, logo, quotes, categories, or contact details change!
  useEffect(() => {
    if (!isAdmin || !isIdbHydrated.current || editRevision === 0) return;

    setIsSaving(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const success = await latestSync.current();
        if (!success) {
          setSaveNotification(previous => previous?.includes('Another admin') ? previous : 'Changes are saved on this device only. Sign in and retry saving to the website.');
          setTimeout(() => setSaveNotification(null), 6000);
        }
      } finally {
        setIsSaving(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimer);
  }, [
    editRevision,
    typographyConfigKey,
    isAdmin,
  ]);

  // Dual-layer Persistence: IndexedDB (unlimited quota, supports high-res photos) + safe localStorage
  // Guarded by isIdbHydrated so initial mount state never overwrites stored user data
  useEffect(() => {
    if (!isIdbHydrated.current) return;
    safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, items);
    saveItemsToIndexedDB(items);
  }, [items]);

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      safeSetLocalStorage(STORAGE_KEY_CONTACT, JSON.stringify(contact));
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
    setIndexedDBValue('contact_details', contact);
  }, [contact]);

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      safeSetLocalStorage(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
    setIndexedDBValue('baking_quotes', quotes);
  }, [quotes]);

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      safeSetLocalStorage(STORAGE_KEY_QUOTE_STYLES, JSON.stringify(quoteStyleSettings));
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
  }, [quoteStyleSettings]);

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      safeSetLocalStorage(STORAGE_KEY_SECTIONS, JSON.stringify(sections));
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
    setIndexedDBValue('page_sections', sections);
  }, [sections]);

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      safeSetLocalStorage(STORAGE_KEY_BACKDROP, JSON.stringify(backdropSettings));
    } catch (e) {
      console.warn('Storage quota or error (saving full backdrop snapshot to IndexedDB):', e);
      try {
        const compactBackdrop = {
          ...backdropSettings,
          customUploadedImages: (backdropSettings.customUploadedImages || []).map((img) => ({
            ...img,
            imageUrl: img.imageUrl.startsWith('data:') && img.imageUrl.length > 50000 ? '' : img.imageUrl,
          })),
        };
        safeSetLocalStorage(STORAGE_KEY_BACKDROP, JSON.stringify(compactBackdrop));
      } catch (e2) {}
    }
    setIndexedDBValue('backdrop_settings', backdropSettings);
  }, [backdropSettings]);

  useEffect(() => {
    if (!isIdbHydrated.current) return;
    try {
      if (customLogoUrl) {
        safeSetLocalStorage(STORAGE_KEY_LOGO, customLogoUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY_LOGO);
      }
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
    setIndexedDBValue('custom_logo', customLogoUrl);
  }, [customLogoUrl]);

  // Dish Operations
  const handleSaveDish = async (
    dishData: Omit<BakeryItem, 'id' | 'order'>,
    existingId?: string,
    forcedNewId?: string
  ) => {
    markUserEdited();
    // Automatically register any new category assigned to a dish so filters update instantly
    if (dishData.category && dishData.category.trim()) {
      const catTrimmed = dishData.category.trim();
      setCategories((prev) => {
        if (!prev.some((c) => c.toLowerCase() === catTrimmed.toLowerCase())) {
          return [...prev, catTrimmed];
        }
        return prev;
      });
    }

    let updatedList: BakeryItem[] = [];
    if (existingId) {
      // Update existing item
      updatedList = items.map((item) =>
        item.id === existingId
          ? { ...item, ...dishData }
          : item
      );
      setItems(updatedList);
    } else {
      // Add new item
      const newItem: BakeryItem = {
        ...dishData,
        id: forcedNewId || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order: items.length + 1,
      };
      updatedList = [...items, newItem];
      setItems(updatedList);
      setCurrentGalleryIndex(items.length); // focus on new item
    }

    // Persist immediately to localStorage and IndexedDB
    safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, updatedList);
    saveItemsToIndexedDB(updatedList);

    // Save to server immediately so reloads never lose photos
    try {
      setIsSaving(true);
      const res = await saveAppDataToServer({
        items: updatedList,
        contact,
        quotes,
        quoteStyleSettings,
        typographySettings,
        backdropSettings,
        pageTexts,
        categories,
        sections,
        customLogoUrl,
      });
      if (res?.success && Array.isArray(res.data?.items)) {
        setItems(current => JSON.stringify(current) === JSON.stringify(updatedList) ? res.data.items : current);
      }
      setLastCloudSyncTime(new Date().toLocaleTimeString());
      if (!res?.success) throw new Error('Server save failed');
      setSaveNotification('✓ Photo & dish saved to the website.');
      setTimeout(() => setSaveNotification(null), 3000);
    } catch (e) {
      setSaveNotification('Saved on this device only. Please retry saving to the website.');
      throw e;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = async (updated: BakeryItem) => {
    markUserEdited();
    if (updated.category && updated.category.trim()) {
      const catTrimmed = updated.category.trim();
      setCategories((prev) => {
        if (!prev.some((c) => c.toLowerCase() === catTrimmed.toLowerCase())) {
          return [...prev, catTrimmed];
        }
        return prev;
      });
    }
    const updatedList = items.map((item) => (item.id === updated.id ? updated : item));
    setItems(updatedList);
    safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, updatedList);
    saveItemsToIndexedDB(updatedList);
    try {
      setIsSaving(true);
      const res = await saveAppDataToServer({
        items: updatedList,
        contact,
        quotes,
        quoteStyleSettings,
        typographySettings,
        backdropSettings,
        pageTexts,
        categories,
        sections,
        customLogoUrl,
      });
      if (res?.success && Array.isArray(res.data?.items)) {
        setItems(current => JSON.stringify(current) === JSON.stringify(updatedList) ? res.data.items : current);
      }
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Direct dish update notice:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick category assignment that updates item and category list immediately
  const handleAssignItemCategory = (itemId: string, newCategory: string) => {
    markUserEdited();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (!prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        return [...prev, trimmed];
      }
      return prev;
    });
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, category: trimmed } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setItemPendingDelete(item);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemPendingDelete) return;
    markUserEdited();
    const deletedId = itemPendingDelete.id;

    // Persist deleted ID so it is never resurrected automatically on reload
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELETED_ITEMS);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(deletedId)) {
        list.push(deletedId);
        safeSetLocalStorage(STORAGE_KEY_DELETED_ITEMS, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed to record deleted item id:', e);
    }

    const updatedList = items.filter((item) => item.id !== deletedId);
    setItems(updatedList);
    safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, updatedList);
    saveItemsToIndexedDB(updatedList);

    if (currentGalleryIndex >= updatedList.length) {
      setCurrentGalleryIndex(Math.max(0, updatedList.length - 1));
    }

    if (activeEditItem?.id === deletedId) {
      setIsUploadCropModalOpen(false);
      setActiveEditItem(null);
    }

    if (isLightboxOpen && updatedList.length <= 1) {
      setIsLightboxOpen(false);
    }

    setItemPendingDelete(null);

    try {
      setIsSaving(true);
      const res = await saveAppDataToServer({
        items: updatedList,
        contact,
        quotes,
        quoteStyleSettings,
        typographySettings,
        backdropSettings,
        pageTexts,
        categories,
        sections,
        customLogoUrl,
      });
      if (res?.success && Array.isArray(res.data?.items)) {
        setItems(current => JSON.stringify(current) === JSON.stringify(updatedList) ? res.data.items : current);
      }
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Delete dish cloud sync notice:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear all dishes permanently so user can re-add custom dishes from a clean slate
  const handleClearAllDishes = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Dishes?',
      message:
        'Are you sure you want to delete ALL creations? This will empty the catalog so you can add your own fresh dishes and photographs from scratch.\n\nDeleted dishes will not reappear on reload.',
      confirmLabel: 'Yes, Clear All Dishes',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        markUserEdited();
        const emptyList: BakeryItem[] = [];
        setItems(emptyList);
        setCurrentGalleryIndex(0);
        setIsLightboxOpen(false);
        setActiveEditItem(null);
        setIsUploadCropModalOpen(false);
        safeSaveItemsToLocalStorage(STORAGE_KEY_ITEMS, emptyList);
        saveItemsToIndexedDB(emptyList);
        try {
          setIsSaving(true);
          const res = await saveAppDataToServer({
            items: emptyList,
            contact,
            quotes,
            quoteStyleSettings,
            typographySettings,
            backdropSettings,
            pageTexts,
            categories,
            sections,
            customLogoUrl,
          });
          if (res?.success && Array.isArray(res.data?.items)) {
            setItems(current => current.length === 0 ? res.data.items : current);
          }
          setLastCloudSyncTime(new Date().toLocaleTimeString());
          setSaveNotification('✓ All dishes cleared! Catalog is ready for your creations.');
          setTimeout(() => setSaveNotification(null), 3000);
        } catch (e) {
          console.warn('Clear all dishes save notice:', e);
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  const handleRestoreDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Default Creations?',
      message: 'Restore all 27 artisan creations (5 Signature Dishes + 22 Gallery Creations)?\n\nThis will re-synchronize the complete patisserie catalog.',
      confirmLabel: 'Restore 27 Creations',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: () => {
        try {
          localStorage.removeItem(STORAGE_KEY_DELETED_ITEMS);
        } catch (e) {
          console.warn('Failed to clear deleted items list:', e);
        }
        setItems(INITIAL_25_BAKERY_ITEMS);
        setCurrentGalleryIndex(0);
      },
    });
  };

  // Filmstrip Swap Items
  const handleSwapItems = (indexA: number, indexB: number) => {
    if (
      indexA < 0 ||
      indexA >= items.length ||
      indexB < 0 ||
      indexB >= items.length ||
      indexA === indexB
    ) {
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      const temp = next[indexA];
      next[indexA] = next[indexB];
      next[indexB] = temp;
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });

    if (currentGalleryIndex === indexA) {
      setCurrentGalleryIndex(indexB);
    } else if (currentGalleryIndex === indexB) {
      setCurrentGalleryIndex(indexA);
    }
  };

  // Swap any two items directly by their unique IDs
  const handleSwapItemsById = (idA: string, idB: string) => {
    if (!idA || !idB || idA === idB) return;
    setItems((prev) => {
      const idxA = prev.findIndex((i) => i.id === idA);
      const idxB = prev.findIndex((i) => i.id === idB);
      if (idxA < 0 || idxB < 0) return prev;
      const next = [...prev];
      const temp = next[idxA];
      next[idxA] = next[idxB];
      next[idxB] = temp;
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // Move an item to a specific position index among all items
  const handleMoveItemToPosition = (id: string, targetOrderIndex: number) => {
    setItems((prev) => {
      const curIdx = prev.findIndex((i) => i.id === id);
      if (curIdx < 0) return prev;
      const clamped = Math.max(0, Math.min(prev.length - 1, targetOrderIndex));
      if (curIdx === clamped) return prev;
      const next = [...prev];
      const [moved] = next.splice(curIdx, 1);
      next.splice(clamped, 0, moved);
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // Move a signature item to a specific slot within the signature dishes list
  const handleMoveSignatureToPosition = (id: string, targetSlot: number) => {
    setItems((prev) => {
      const sigList = prev.filter((i) => i.featured || i.dishType === 'signature' || i.dishType === 'both');
      const curSigIdx = sigList.findIndex((i) => i.id === id);
      if (curSigIdx < 0) return prev;
      const clamped = Math.max(0, Math.min(sigList.length - 1, targetSlot));
      if (curSigIdx === clamped) return prev;

      const nextSigList = [...sigList];
      const [moved] = nextSigList.splice(curSigIdx, 1);
      nextSigList.splice(clamped, 0, moved);

      let sigPointer = 0;
      return prev.map((item) => {
        const isSig = item.featured || item.dishType === 'signature' || item.dishType === 'both';
        if (isSig) {
          return nextSigList[sigPointer++];
        }
        return item;
      }).map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // Move a gallery item to a specific slot within the gallery dishes list
  const handleMoveGalleryToPosition = (id: string, targetSlot: number) => {
    markUserEdited();
    setItems((prev) => {
      const galList = prev.filter((i) => i.inGallery || i.dishType === 'gallery' || i.dishType === 'both');
      const curGalIdx = galList.findIndex((i) => i.id === id);
      if (curGalIdx < 0) return prev;
      const clamped = Math.max(0, Math.min(galList.length - 1, targetSlot));
      if (curGalIdx === clamped) return prev;

      const nextGalList = [...galList];
      const [moved] = nextGalList.splice(curGalIdx, 1);
      nextGalList.splice(clamped, 0, moved);

      let galPointer = 0;
      return prev.map((item) => {
        const isGal = item.inGallery || item.dishType === 'gallery' || item.dishType === 'both';
        if (isGal) {
          return nextGalList[galPointer++];
        }
        return item;
      }).map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // Quick toggle Chef's Signature (featured) flag
  const handleToggleDishSignature = (id: string) => {
    markUserEdited();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const willBeFeatured = !item.featured;
        let newDishType = item.dishType;
        if (willBeFeatured) {
          newDishType = item.inGallery ? 'both' : 'signature';
        } else {
          newDishType = 'gallery';
        }
        return {
          ...item,
          featured: willBeFeatured,
          dishType: newDishType,
        };
      })
    );
  };

  // Quick toggle Gallery flag
  const handleToggleDishGallery = (id: string) => {
    markUserEdited();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const willBeInGallery = !item.inGallery;
        let newDishType = item.dishType;
        if (willBeInGallery) {
          newDishType = item.featured ? 'both' : 'gallery';
        } else {
          newDishType = 'signature';
        }
        return {
          ...item,
          inGallery: willBeInGallery,
          dishType: newDishType,
        };
      })
    );
  };

  // Duplicate a dish creation
  const handleDuplicateDish = (item: BakeryItem) => {
    markUserEdited();
    const clone: BakeryItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${item.name} (Copy)`,
      order: items.length + 1,
    };
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next.splice(idx + 1, 0, clone);
        return next.map((it, i) => ({ ...it, order: i + 1 }));
      }
      return [...prev, clone].map((it, i) => ({ ...it, order: i + 1 }));
    });
  };

  // Replace photo or edit details on specific dish
  const handleOpenReplacePhoto = (item: BakeryItem) => {
    setCropModalInitialFile(null);
    setActiveEditItem(item);
    setCropModalMode('replace-photo');
    setIsUploadCropModalOpen(true);
  };

  const handleOpenEditItemModal = (item: BakeryItem) => {
    setCropModalInitialFile(null);
    setActiveEditItem(item);
    setCropModalMode('edit-full');
    setIsUploadCropModalOpen(true);
  };

  const handleOpenAddDishModal = () => {
    setActiveEditItem(null);
    setCropModalInitialFile(null);
    setCropModalMode('add');
    setIsUploadCropModalOpen(true);
  };

  const handleQuickUploadPhoto = (item: BakeryItem, file: File) => {
    setActiveEditItem(item);
    setCropModalMode('replace-photo');
    setCropModalInitialFile(file);
    setIsUploadCropModalOpen(true);
  };

  const handleQuickAddNewDishWithFile = (file: File) => {
    setActiveEditItem(null);
    setCropModalMode('add');
    setCropModalInitialFile(file);
    setIsUploadCropModalOpen(true);
  };

  // Contact & Quote Operations with persistent dirty tracking
  const handleUpdateContact = (newContact: CafeContactDetails) => {
    markUserEdited();
    setContact(newContact);
  };

  const handleSaveQuotes = (newQuotes: BakingQuote[]) => {
    markUserEdited();
    setQuotes(newQuotes);
  };

  // Quote Operations
  const handleAddQuote = (newQuote: Omit<BakingQuote, 'id'>) => {
    markUserEdited();
    const q: BakingQuote = {
      ...newQuote,
      id: `q-${Date.now()}`,
    };
    setQuotes((prev) => [q, ...prev]);
  };

  const handleUpdateQuote = (updated: BakingQuote) => {
    markUserEdited();
    setQuotes((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  };

  const handleDeleteQuote = (id: string) => {
    markUserEdited();
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  // Section Management Operations (Reordering, Swap, Edit, Delete, Create)
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    markUserEdited();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    });
  };

  const handleUpdateSection = (updated: PageSection) => {
    markUserEdited();
    setSections((prev) =>
      prev.map((sec) => (sec.id === updated.id ? updated : sec))
    );
  };

  const handleDeleteSection = (id: string) => {
    markUserEdited();
    setSections((prev) => {
      const filtered = prev.filter((sec) => sec.id !== id);
      return filtered.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    });
  };

  const handleAddSection = (
    newSec: Omit<PageSection, 'id' | 'order'>,
    insertAfter?: number
  ) => {
    markUserEdited();
    const id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setSections((prev) => {
      const created: PageSection = {
        ...newSec,
        id,
        order: (insertAfter ?? prev.length) + 1,
      };

      let nextList: PageSection[];
      if (typeof insertAfter === 'number') {
        const idx = prev.findIndex((s) => s.order === insertAfter);
        if (idx >= 0) {
          nextList = [...prev.slice(0, idx + 1), created, ...prev.slice(idx + 1)];
        } else {
          nextList = [...prev, created];
        }
      } else {
        nextList = [...prev, created];
      }

      return nextList.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    });
  };

  const handleResetDefaultSections = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Sections & Navigation?',
      message: 'Restore all standard page sections and navigation order to the default layout?',
      confirmLabel: 'Reset Layout',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: () => {
        markUserEdited();
        setSections(INITIAL_PAGE_SECTIONS);
      },
    });
  };

  const handleSaveLogo = (newLogoUrl: string | null) => {
    markUserEdited();
    setCustomLogoUrl(newLogoUrl);
  };

  return (
    <div className="relative min-h-screen text-[#2c2425] font-sans overflow-x-clip selection:bg-[#f3d5dc] selection:text-[#802c3e]">
      
      {/* Classical Temple & Blooming Flowers/Blossoms Fixed Backdrop with 10s Auto-Rotate & Slow Fade */}
      <BackdropTemple
        settings={backdropSettings}
        onUpdateSettings={handleUpdateBackdropSettings}
        onOpenSelector={() => setIsBackdropControlsOpen(true)}
        onNextBackdrop={handleNextBackdrop}
        onPrevBackdrop={handlePrevBackdrop}
        onToggleAutoRotate={handleToggleAutoRotate}
        onDeleteCurrentWallpaper={handleDeleteCurrentWallpaper}
        secondsRemaining={secondsRemaining}
      />

      {/* Main Website Structure */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Floating Navbar (Appears when scrolling up or down for instant 1-click section jumps) */}
        <FloatingNavbar
          sections={sections}
          signatureCount={items.filter((i) => i.featured || i.dishType === 'signature' || i.dishType === 'both').length}
          galleryCount={items.filter((i) => i.inGallery || i.dishType === 'gallery' || i.dishType === 'both').length}
          totalCount={items.length}
          brandName={pageTexts.brandName || 'TeeCake'}
          customLogoUrl={customLogoUrl}
        />

        {/* Navigation Header with Timer Settings & Loop Controls */}
        <Header
          contact={contact}
          backdropSettings={backdropSettings}
          onUpdateBackdropSettings={handleUpdateBackdropSettings}
          onNextBackdrop={handleNextBackdrop}
          onPrevBackdrop={handlePrevBackdrop}
          onToggleAutoRotate={handleToggleAutoRotate}
          onDeleteCurrentWallpaper={handleDeleteCurrentWallpaper}
          secondsRemaining={secondsRemaining}
          isBackdropControlsOpen={isBackdropControlsOpen}
          setIsBackdropControlsOpen={setIsBackdropControlsOpen}
          onOpenAddModal={handleOpenAddDishModal}
          onOpenEditContactModal={() => setIsEditContactModalOpen(true)}
          onOpenPageTextModal={() => setIsPageTextModalOpen(true)}
          onOpenManageSections={() => setIsManageSectionsModalOpen(true)}
          onOpenTypographyModal={() => setIsTypographyModalOpen(true)}
          onOpenManageFilters={() => setIsManageFiltersOpen(true)}
          sections={sections}
          items={items}
          customLogoUrl={customLogoUrl}
          onUploadLogo={() => setIsUploadLogoModalOpen(true)}
          pageTexts={pageTexts}
          onUpdatePageText={handleUpdatePageText}
          onOpenBrandEditor={() => setIsBrandEditorModalOpen(true)}
          onOpenMasterStudio={() => setIsMasterStudioModalOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          isSaving={isSaving}
          lastSavedTime={lastCloudSyncTime}
          onManualSave={handleExplicitSyncToCloud}
        />

        {/* Dynamic Page Sections - Reorderable, Editable, Deletable, and Expandable */}
        <main className="flex-1">
          {sections.map((sec, idx) => {
            if (!sec.visible) return null;

            let contentNode: React.ReactNode = null;
            switch (sec.type) {
              case 'hero':
                contentNode = (
                  <HeroBanner
                    contact={contact}
                    pageTexts={pageTexts}
                    onUpdatePageText={handleUpdatePageText}
                    onOpenAddModal={handleOpenAddDishModal}
                    photoCount={items.length}
                    signatureCount={items.filter((i) => i.featured || i.dishType === 'signature' || i.dishType === 'both').length}
                    galleryCount={items.filter((i) => i.inGallery || i.dishType === 'gallery' || i.dishType === 'both').length}
                    onOpenPageTextModal={() => setIsPageTextModalOpen(true)}
                  />
                );
                break;
              case 'signature':
                contentNode = (
                  <SignatureMenu
                    items={items}
                    pageTexts={pageTexts}
                    onUpdatePageText={handleUpdatePageText}
                    onOpenLightbox={(lightboxIdx) => {
                      setCurrentGalleryIndex(lightboxIdx);
                      setIsLightboxOpen(true);
                    }}
                    onOpenAddModal={handleOpenAddDishModal}
                    onOpenEditModal={handleOpenEditItemModal}
                    onOpenReplacePhoto={handleOpenReplacePhoto}
                    onDeleteItem={handleDeleteItem}
                    onRestoreDefaults={handleRestoreDefaults}
                    onSwapItems={handleSwapItemsById}
                    onMoveToPosition={handleMoveSignatureToPosition}
                    onToggleSignature={handleToggleDishSignature}
                    onToggleGallery={handleToggleDishGallery}
                    onDuplicateItem={handleDuplicateDish}
                    onQuickUploadPhoto={handleQuickUploadPhoto}
                  />
                );
                break;
              case 'gallery':
                contentNode = (
                  <DishesGallery
                    items={items}
                    pageTexts={pageTexts}
                    onUpdatePageText={handleUpdatePageText}
                    currentIndex={currentGalleryIndex}
                    onSelectIndex={setCurrentGalleryIndex}
                    onOpenLightbox={(lightboxIdx) => {
                      setCurrentGalleryIndex(lightboxIdx);
                      setIsLightboxOpen(true);
                    }}
                    onOpenAddModal={handleOpenAddDishModal}
                    onOpenEditModal={handleOpenEditItemModal}
                    onOpenReplacePhoto={handleOpenReplacePhoto}
                    onSwapItems={handleSwapItems}
                    onSwapItemsById={handleSwapItemsById}
                    onMoveToPosition={handleMoveGalleryToPosition}
                    onToggleSignature={handleToggleDishSignature}
                    onToggleGallery={handleToggleDishGallery}
                    onDuplicateItem={handleDuplicateDish}
                    onDeleteItem={handleDeleteItem}
                    onQuickUploadPhoto={handleQuickUploadPhoto}
                  />
                );
                break;
              case 'all-dishes':
                contentNode = (
                  <AllDishesSection
                    items={items}
                    pageTexts={pageTexts}
                    onUpdatePageText={handleUpdatePageText}
                    onOpenLightbox={(lightboxIdx) => {
                      setCurrentGalleryIndex(lightboxIdx);
                      setIsLightboxOpen(true);
                    }}
                    onOpenAddModal={handleOpenAddDishModal}
                    onOpenEditModal={handleOpenEditItemModal}
                    onOpenReplacePhoto={handleOpenReplacePhoto}
                    onDeleteItem={handleDeleteItem}
                    categories={categories}
                    onSaveCategories={handleSaveCategories}
                    onRenameCategory={handleRenameCategory}
                    onAssignCategory={handleAssignItemCategory}
                    onToggleSignature={handleToggleDishSignature}
                    onClearAllDishes={handleClearAllDishes}
                    onQuickUploadPhoto={handleQuickUploadPhoto}
                    onQuickAddNewWithFile={handleQuickAddNewDishWithFile}
                  />
                );
                break;
              case 'quotes':
                contentNode = (
                  <ArtOfBakingQuotes
                    quotes={quotes}
                    pageTexts={pageTexts}
                    onUpdatePageText={handleUpdatePageText}
                    onAddQuote={handleAddQuote}
                    onUpdateQuote={handleUpdateQuote}
                    onDeleteQuote={handleDeleteQuote}
                    styleSettings={quoteStyleSettings}
                    onUpdateStyleSettings={setQuoteStyleSettings}
                  />
                );
                break;
              case 'location':
                contentNode = (
                  <LocationAndHours
                    contact={contact}
                    pageTexts={pageTexts}
                    onUpdatePageText={handleUpdatePageText}
                    onOpenEditModal={() => setIsEditContactModalOpen(true)}
                  />
                );
                break;
              case 'custom':
                contentNode = (
                  <CustomSection
                    section={sec}
                    onEditSection={() => setIsManageSectionsModalOpen(true)}
                  />
                );
                break;
              default:
                contentNode = null;
            }

            return (
              <SectionWrapper
                key={sec.id}
                section={sec}
                index={idx}
                totalSections={sections.length}
                onMoveUp={() => handleMoveSection(idx, 'up')}
                onMoveDown={() => handleMoveSection(idx, 'down')}
                onEditSection={() => setIsManageSectionsModalOpen(true)}
                onDeleteSection={() => handleDeleteSection(sec.id)}
                onOpenAddSectionModal={(order) => {
                  setInsertAfterOrder(order);
                  setIsManageSectionsModalOpen(true);
                }}
                onOpenManageSections={() => setIsManageSectionsModalOpen(true)}
              >
                {contentNode}
              </SectionWrapper>
            );
          })}
        </main>

        {/* Footer */}
        <Footer
          contact={contact}
          backdropSettings={backdropSettings}
          onUpdateBackdropSettings={handleUpdateBackdropSettings}
          onOpenBackdropSelector={() => setIsBackdropControlsOpen(true)}
          onOpenEditContact={() => setIsEditContactModalOpen(true)}
          onUpdateContact={handleUpdateContact}
          customLogoUrl={customLogoUrl}
          itemCount={items.length}
          pageTexts={pageTexts}
        />
      </div>

      {/* Lightbox / Inspector Modal with Full Text Editing (No Pricing) */}
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        items={items}
        currentIndex={currentGalleryIndex}
        onSelectIndex={setCurrentGalleryIndex}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={(id) => {
          handleDeleteItem(id);
          if (items.length <= 1) {
            setIsLightboxOpen(false);
          }
        }}
        onSwapItems={handleSwapItems}
        onSwapItemsById={handleSwapItemsById}
        onMoveToPosition={handleMoveItemToPosition}
        onToggleSignature={handleToggleDishSignature}
        onToggleGallery={handleToggleDishGallery}
        onDuplicateItem={handleDuplicateDish}
        onRequestReplacePhoto={(item) => {
          handleOpenReplacePhoto(item);
        }}
        categories={categories}
      />

      {/* Interactive Crop & Image Upload Modal (Categorize into Signature, Gallery, or Both) */}
      <ImageUploadCropModal
        isOpen={isEditMode && isUploadCropModalOpen}
        onClose={() => {
          setIsUploadCropModalOpen(false);
          setCropModalInitialFile(null);
        }}
        onSave={handleSaveDish}
        onDelete={handleDeleteItem}
        editItem={activeEditItem}
        mode={cropModalMode}
        categories={categories}
        initialFile={cropModalInitialFile}
      />

      {/* Edit Contact, Schedules & Socials Modal */}
      <EditContactModal
        isOpen={isEditMode && isEditContactModalOpen}
        onClose={() => setIsEditContactModalOpen(false)}
        contact={contact}
        onSave={handleUpdateContact}
      />

      {/* Custom Logo Upload Modal */}
      <UploadLogoModal
        isOpen={isEditMode && isUploadLogoModalOpen}
        onClose={() => setIsUploadLogoModalOpen(false)}
        currentLogoUrl={customLogoUrl}
        onSaveLogo={handleSaveLogo}
      />

      {/* Dedicated Brand Title, Subtitle, Font & Logo Customizer Modal */}
      <BrandEditorModal
        isOpen={isEditMode && isBrandEditorModalOpen}
        onClose={() => setIsBrandEditorModalOpen(false)}
        brandName={pageTexts.brandName || 'TeeCake'}
        brandSubtitle={pageTexts.brandSubtitle || 'CREATIONS'}
        brandLogoSize={pageTexts.brandLogoSize || 'md'}
        customLogoUrl={customLogoUrl}
        onSaveBrand={handleSaveBrand}
      />

      {/* Master Site-Wide Text Box Editor Modal */}
      <PageTextEditorModal
        isOpen={isEditMode && isPageTextModalOpen}
        onClose={() => setIsPageTextModalOpen(false)}
        pageTexts={pageTexts}
        onSavePageTexts={handleSavePageTexts}
        quotes={quotes}
        onSaveQuotes={handleSaveQuotes}
        contact={contact}
        onSaveContact={handleUpdateContact}
        customLogoUrl={customLogoUrl}
        onUploadLogo={() => setIsUploadLogoModalOpen(true)}
      />

      {/* Master Page Sections & Navigation Manager Modal */}
      <ManageSectionsModal
        isOpen={isEditMode && isManageSectionsModalOpen}
        onClose={() => {
          setIsManageSectionsModalOpen(false);
          setInsertAfterOrder(undefined);
        }}
        sections={sections}
        onMoveSection={handleMoveSection}
        onUpdateSection={handleUpdateSection}
        onDeleteSection={handleDeleteSection}
        onAddSection={handleAddSection}
        onResetDefaultSections={handleResetDefaultSections}
        insertAfterOrder={insertAfterOrder}
      />

      {/* Master Studio Control Modal: Texts (Font Size, Color, Font Style), Background & Temple Drop */}
      <MasterStudioModal
        isOpen={isEditMode && isMasterStudioModalOpen}
        onClose={() => setIsMasterStudioModalOpen(false)}
        backdropSettings={backdropSettings}
        onUpdateBackdropSettings={handleUpdateBackdropSettings}
        secondsRemaining={secondsRemaining}
        onNextBackdrop={handleNextBackdrop}
        onPrevBackdrop={handlePrevBackdrop}
        pageTexts={pageTexts}
        onUpdatePageText={handleUpdatePageText}
        contact={contact}
        onUpdateContact={handleUpdateContact}
      />

      {/* Global Typography & Text Customization Modal */}
      <TypographyModal
        isOpen={isEditMode && isTypographyModalOpen}
        onClose={() => setIsTypographyModalOpen(false)}
      />

      {/* Global Category Filters & Customizer Modal */}
      <EditFiltersModal
        isOpen={isEditMode && isManageFiltersOpen}
        onClose={() => setIsManageFiltersOpen(false)}
        categories={categories}
        items={items}
        onSaveCategories={handleSaveCategories}
        onRenameCategory={handleRenameCategory}
      />

      {/* In-App Safe Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isEditMode && !!itemPendingDelete}
        item={itemPendingDelete}
        onClose={() => setItemPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Global In-App Action Confirmation Modal */}
      <PromptConfirmModal
        dialog={isEditMode ? confirmDialog : null}
        onClose={() => setConfirmDialog(null)}
      />

      {/* Share with Friends & Cloud Sync Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSyncNow={handleExplicitSyncToCloud}
        isSyncing={isCloudSyncing}
        lastSyncedTime={lastCloudSyncTime}
        itemsCount={items.length}
        signatureCount={items.filter((i) => i.featured || i.dishType === 'signature' || i.dishType === 'both').length}
      />

      {/* Floating Quick Master Studio Control Button */}
      {isEditMode && <div className="fixed bottom-20 right-5 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMasterStudioModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#9e4c5b] to-[#7a2c3d] hover:from-[#8a3f4e] hover:to-[#64212f] text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer backdrop-blur-md group hover:scale-105 border border-[#c4697c]"
          title="Open Master Studio: Customize all texts, font styles, colors, upload backgrounds & temple drop"
        >
          <Sliders className="w-4 h-4 text-[#fcedf0] group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-bold tracking-wide">Master Control</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTypographyModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white/95 hover:bg-white text-[#5e2632] border border-[#ebd0d6] shadow-lg hover:shadow-xl transition-all cursor-pointer backdrop-blur-md group hover:scale-105"
          title="Quick text boldness, font size, and contrast options"
        >
          <Type className="w-4 h-4 text-[#9e4c5b]" />
        </button>
      </div>

      }
      <EditorModeToggle />

      {/* Floating Save Confirmation Toast */}
      {saveNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2d1218]/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-[#c4697c]/50 flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{saveNotification}</span>
        </div>
      )}
    </div>
  );
}

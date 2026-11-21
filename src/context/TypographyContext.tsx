import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SiteTypographySettings, TextFormatSetting } from '../types';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../data/initialData';
import { getIndexedDBValue, setIndexedDBValue, loadAppDataFromServer } from '../utils/persistentStorage';

export const STORAGE_KEY_TYPOGRAPHY = 'teecake_typography_settings_v20';

interface TypographyContextType {
  settings: SiteTypographySettings;
  updateSettings: (partial: Partial<SiteTypographySettings>) => void;
  updateCustomFormat: (key: string, format: Partial<TextFormatSetting>) => void;
  setTextAlignment: (key: string, align: 'left' | 'center' | 'right') => void;
  setHeadingAlignment: (align: 'left' | 'center' | 'right') => void;
  setQuoteAlignment: (align: 'left' | 'center' | 'right' | 'justify') => void;
  toggleBold: (key: string, defaultWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold') => void;
  stepFontSize: (key: string, direction: 'up' | 'down') => void;
  toggleContrast: (key: string) => void;
  resetSettings: () => void;
  getTextFormatting: (key?: string) => TextFormatSetting;
}

const TypographyContext = createContext<TypographyContextType | null>(null);

export const TypographyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isIdbLoaded = useRef(false);

  const [settings, setSettings] = useState<SiteTypographySettings>(() => {
    // 1. Check dynamically injected server state first for zero-delay hydration
    const serverState = typeof window !== 'undefined' && (window as any).__SERVER_APP_STATE__;
    if (serverState?.typographySettings) {
      return {
        ...DEFAULT_TYPOGRAPHY_SETTINGS,
        ...serverState.typographySettings,
        customFormats: {
          ...DEFAULT_TYPOGRAPHY_SETTINGS.customFormats,
          ...(serverState.typographySettings.customFormats || {}),
        },
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TYPOGRAPHY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_TYPOGRAPHY_SETTINGS,
          ...parsed,
          customFormats: {
            ...DEFAULT_TYPOGRAPHY_SETTINGS.customFormats,
            ...(parsed.customFormats || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to load typography settings:', e);
    }
    return DEFAULT_TYPOGRAPHY_SETTINGS;
  });

  // Restore typography from server and IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      loadAppDataFromServer(),
      getIndexedDBValue<SiteTypographySettings>('typography_settings'),
    ]).then(([serverData, idbTypo]) => {
      if (!isMounted) return;
      const srvTypo = serverData?.typographySettings;
      const resolved = srvTypo || idbTypo;
      if (resolved) {
        setSettings((prev) => ({
          ...prev,
          ...resolved,
          customFormats: {
            ...prev.customFormats,
            ...(resolved.customFormats || {}),
          },
        }));
      }
      setTimeout(() => {
        if (isMounted) isIdbLoaded.current = true;
      }, 50);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isIdbLoaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY_TYPOGRAPHY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save typography settings:', e);
    }
    setIndexedDBValue('typography_settings', settings);
  }, [settings]);

  const updateSettings = (partial: Partial<SiteTypographySettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...partial,
      customFormats: partial.customFormats
        ? { ...prev.customFormats, ...partial.customFormats }
        : prev.customFormats,
    }));
  };

  const updateCustomFormat = (key: string, format: Partial<TextFormatSetting>) => {
    setSettings((prev) => {
      const existing = prev.customFormats[key] || {
        fontWeight: prev.subheadingWeight || 'semibold',
        fontSizeStep: 0,
        enhanceContrast: false,
      };

      return {
        ...prev,
        customFormats: {
          ...prev.customFormats,
          [key]: {
            ...existing,
            ...format,
          },
        },
      };
    });
  };

  const setTextAlignment = (key: string, align: 'left' | 'center' | 'right') => {
    updateCustomFormat(key, { textAlign: align });
  };

  const setHeadingAlignment = (align: 'left' | 'center' | 'right') => {
    updateSettings({ headingAlign: align, subheadingAlign: align });
  };

  const setQuoteAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    updateSettings({ quoteAlign: align });
  };

  const toggleBold = (
    key: string,
    defaultWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' = 'normal'
  ) => {
    setSettings((prev) => {
      const current = prev.customFormats[key]?.fontWeight || defaultWeight;
      // Cycle: normal -> semibold -> bold -> extrabold -> normal
      let nextWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' = 'bold';
      if (current === 'normal') nextWeight = 'semibold';
      else if (current === 'semibold') nextWeight = 'bold';
      else if (current === 'bold') nextWeight = 'extrabold';
      else nextWeight = 'normal';

      const existing = prev.customFormats[key] || { fontSizeStep: 0 };
      return {
        ...prev,
        customFormats: {
          ...prev.customFormats,
          [key]: {
            ...existing,
            fontWeight: nextWeight,
          },
        },
      };
    });
  };

  const stepFontSize = (key: string, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const existing = prev.customFormats[key] || {
        fontWeight: prev.subheadingWeight,
        fontSizeStep: 0,
      };
      const currentStep = existing.fontSizeStep ?? 0;
      const nextStep =
        direction === 'up'
          ? Math.min(currentStep + 1, 4)
          : Math.max(currentStep - 1, -1);

      return {
        ...prev,
        customFormats: {
          ...prev.customFormats,
          [key]: {
            ...existing,
            fontSizeStep: nextStep,
          },
        },
      };
    });
  };

  const toggleContrast = (key: string) => {
    setSettings((prev) => {
      const existing = prev.customFormats[key] || {
        fontWeight: prev.subheadingWeight,
        fontSizeStep: 0,
      };
      return {
        ...prev,
        customFormats: {
          ...prev.customFormats,
          [key]: {
            ...existing,
            enhanceContrast: !existing.enhanceContrast,
          },
        },
      };
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_TYPOGRAPHY_SETTINGS);
  };

  const getTextFormatting = (key?: string): TextFormatSetting => {
    if (!key) {
      return {
        fontWeight: settings.globalWeight || 'normal',
        fontSizeStep: 0,
      };
    }
    return (
      settings.customFormats[key] || {
        fontWeight: undefined,
        fontSizeStep: 0,
        enhanceContrast: false,
      }
    );
  };

  return (
    <TypographyContext.Provider
      value={{
        settings,
        updateSettings,
        updateCustomFormat,
        setTextAlignment,
        setHeadingAlignment,
        setQuoteAlignment,
        toggleBold,
        stepFontSize,
        toggleContrast,
        resetSettings,
        getTextFormatting,
      }}
    >
      {children}
    </TypographyContext.Provider>
  );
};

export const useTypography = () => {
  const context = useContext(TypographyContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      settings: DEFAULT_TYPOGRAPHY_SETTINGS,
      updateSettings: () => {},
      updateCustomFormat: () => {},
      setTextAlignment: () => {},
      setHeadingAlignment: () => {},
      setQuoteAlignment: () => {},
      toggleBold: () => {},
      stepFontSize: () => {},
      toggleContrast: () => {},
      resetSettings: () => {},
      getTextFormatting: () => ({
        fontWeight: 'normal',
        fontSizeStep: 0,
      }),
    };
  }
  return context;
};

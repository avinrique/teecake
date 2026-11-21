import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Bold, Plus, Minus, Sun, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useTypography } from '../context/TypographyContext';
import { useEditMode } from '../context/EditModeContext';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  textKey?: string;
  defaultWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  defaultAlign?: 'left' | 'center' | 'right';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  label?: string;
  placeholder?: string;
}

const FONT_WEIGHT_CLASSES: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const FONT_SIZE_MULTIPLIERS: Record<number, number> = {
  [-1]: 0.88,
  0: 1.0,
  1: 1.16,
  2: 1.32,
  3: 1.52,
  4: 1.76,
};

const FONT_SIZE_LABELS: Record<number, string> = {
  [-1]: 'Compact (-12%)',
  0: 'Default Size',
  1: 'Large (+16%)',
  2: 'Extra Large (+32%)',
  3: 'Huge (+52%)',
  4: 'Maximum (+76%)',
};

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  textKey,
  defaultWeight,
  defaultAlign = 'center',
  className = '',
  as = 'span',
  multiline = false,
  label,
  placeholder = 'Click to edit text...',
}) => {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // If view-only mode is active, close any open inline input
  useEffect(() => {
    if (!isEditMode && isEditing) {
      setIsEditing(false);
    }
  }, [isEditMode, isEditing]);

  const key = textKey || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '') : undefined);
  const {
    getTextFormatting,
    updateCustomFormat,
    toggleBold,
    stepFontSize,
    toggleContrast,
    settings,
  } = useTypography();

  const currentFormat = getTextFormatting(key);
  const activeWeight = currentFormat.fontWeight || defaultWeight || settings.subheadingWeight || 'normal';
  const activeSizeStep = currentFormat.fontSizeStep ?? 0;
  const isEnhancedContrast = Boolean(currentFormat.enhanceContrast || settings.enhanceAllContrast);

  const isHeading =
    as === 'h1' ||
    as === 'h2' ||
    as === 'h3' ||
    as === 'h4' ||
    Boolean(key?.toLowerCase().includes('heading')) ||
    Boolean(key?.toLowerCase().includes('title'));

  const isSubheading =
    Boolean(key?.toLowerCase().includes('subheading')) ||
    Boolean(key?.toLowerCase().includes('subtitle')) ||
    Boolean(key?.toLowerCase().includes('tagline')) ||
    Boolean(key?.toLowerCase().includes('emblem'));

  const activeAlign: 'left' | 'center' | 'right' =
    currentFormat.textAlign ||
    defaultAlign ||
    (isHeading
      ? (settings.headingAlign || 'center')
      : isSubheading
      ? (settings.subheadingAlign || 'center')
      : 'center');

  const textAlignClass =
    activeAlign === 'left'
      ? 'text-left'
      : activeAlign === 'right'
      ? 'text-right'
      : 'text-center';

  const alignWrapperClass =
    activeAlign === 'left'
      ? 'text-left justify-start items-start'
      : activeAlign === 'right'
      ? 'text-right justify-end items-end ml-auto'
      : 'text-center justify-center items-center mx-auto';

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onSave(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Compute calculated style & classes
  const weightClass = FONT_WEIGHT_CLASSES[activeWeight] || 'font-normal';
  const sizeMultiplier = (FONT_SIZE_MULTIPLIERS[activeSizeStep] || 1.0) * (settings.globalScale || 1.0);

  const customStyle: React.CSSProperties = {
    ...(sizeMultiplier !== 1.0 ? { fontSize: `calc(1em * ${sizeMultiplier})` } : {}),
    ...(currentFormat.color ? { color: currentFormat.color } : {}),
    ...(currentFormat.fontFamily ? {
      fontFamily: currentFormat.fontFamily === 'victorian'
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
        : undefined
    } : {}),
    ...(currentFormat.italic !== undefined ? { fontStyle: currentFormat.italic ? 'italic' : 'normal' } : {}),
    ...(isEnhancedContrast
      ? {
          textShadow: '0 1px 3px rgba(255,255,255,0.95), 0 2px 8px rgba(255,235,240,0.85)',
          filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))',
        }
      : {}),
  };

  if (isEditing) {
    return (
      <div className="inline-flex flex-col gap-2 w-full my-1 z-30 relative bg-[#fffcfd]/95 p-3 rounded-xl border-2 border-[#9e4c5b] shadow-xl backdrop-blur-md">
        {/* Header with Title and Formatting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[#ebd0d6]">
          {label && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e4c5b]">
              Editing: {label}
            </span>
          )}

          {/* Quick Font Styling Controls */}
          {key && (
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Alignment Selector */}
              <div className="flex items-center bg-[#f7e6e9] p-0.5 rounded-md text-[11px]">
                {(['left', 'center', 'right'] as const).map((al) => {
                  const Icon = al === 'left' ? AlignLeft : al === 'center' ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={al}
                      type="button"
                      onClick={() => updateCustomFormat(key, { textAlign: al })}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        activeAlign === al
                          ? 'bg-[#9e4c5b] text-white shadow-xs'
                          : 'text-[#6c2937] hover:bg-[#ebd0d6]'
                      }`}
                      title={`Align ${al}`}
                      aria-label={`Align ${al}`}
                    >
                      <Icon className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>

              {/* Bold Selector */}
              <div className="flex items-center bg-[#f7e6e9] p-0.5 rounded-md text-[11px]">
                {(['normal', 'semibold', 'bold', 'extrabold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateCustomFormat(key, { fontWeight: w })}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeWeight === w
                        ? 'bg-[#9e4c5b] text-white font-bold shadow-xs'
                        : 'text-[#6c2937] hover:bg-[#ebd0d6]'
                    }`}
                  >
                    {w === 'normal' ? 'Norm' : w === 'semibold' ? 'Semi' : w === 'bold' ? 'Bold' : 'Black'}
                  </button>
                ))}
              </div>

              {/* Font Size Step Controls */}
              <div className="flex items-center gap-1 bg-[#f7e6e9] px-1.5 py-0.5 rounded-md text-[11px] text-[#6c2937]">
                <button
                  type="button"
                  onClick={() => stepFontSize(key, 'down')}
                  disabled={activeSizeStep <= -1}
                  className="p-0.5 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
                  title="Decrease font size"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-semibold px-1 min-w-[2.75rem] text-center text-[10px]">
                  {FONT_SIZE_LABELS[activeSizeStep] || 'Default'}
                </span>
                <button
                  type="button"
                  onClick={() => stepFontSize(key, 'up')}
                  disabled={activeSizeStep >= 4}
                  className="p-0.5 hover:bg-[#ebd0d6] rounded cursor-pointer disabled:opacity-30"
                  title="Increase font size"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Contrast / Legibility Toggle */}
              <button
                type="button"
                onClick={() => toggleContrast(key)}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  isEnhancedContrast
                    ? 'bg-[#c99750] text-white shadow-xs'
                    : 'bg-[#f7e6e9] text-[#6c2937] hover:bg-[#ebd0d6]'
                }`}
                title="Enhance contrast shadow for visibility over flowers"
              >
                <Sun className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className={`w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:bg-white resize-y shadow-inner ${textAlignClass}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:bg-white shadow-inner ${textAlignClass}`}
            placeholder={placeholder}
          />
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-stone-500 italic">
            Tip: Adjust bold, size & alignment in toolbar above
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-md cursor-pointer shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Save Text
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Tag = as;
  const WrapperTag = as === 'span' ? 'span' : 'div';

  return (
    <WrapperTag className={`relative group/edit inline-flex max-w-full ${alignWrapperClass}`}>
      <Tag
        className={`${className} ${weightClass} ${textAlignClass} block w-full transition-all duration-150`}
        style={customStyle}
      >
        {value}
      </Tag>

      {/* Floating Hover Controls: Quick Bold, Quick Font Size, Quick Align, and Edit Pencil */}
      {isEditMode && (
        <span
          data-editor-control="true"
          className="editor-control absolute -top-3.5 -right-3.5 inline-flex items-center gap-1 opacity-0 group-hover/edit:opacity-100 focus-within:opacity-100 transition-opacity bg-white/95 p-0.5 rounded-full shadow-md border border-[#ebd0d6] backdrop-blur-xs shrink-0 scale-90 z-20 pointer-events-auto"
        >
          {key && (
            <>
              {/* Quick Bold Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBold(key, defaultWeight);
                }}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                  activeWeight === 'bold' || activeWeight === 'extrabold'
                    ? 'bg-[#9e4c5b] text-white shadow-2xs'
                    : 'text-[#6c2937] hover:bg-[#fcedf0]'
                }`}
                title={`Toggle text bold (${activeWeight})`}
                aria-label="Toggle text bold"
              >
                <Bold className="w-2.5 h-2.5 inline mr-0.5" />
                <span className="text-[9px] uppercase">
                  {activeWeight === 'bold' || activeWeight === 'extrabold' ? 'Bold' : 'B'}
                </span>
              </button>

              {/* Quick Size Increase Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stepFontSize(key, 'up');
                }}
                className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-[#6c2937] hover:bg-[#fcedf0] transition-colors cursor-pointer"
                title={`Increase font size (${FONT_SIZE_LABELS[activeSizeStep]})`}
                aria-label="Increase font size"
              >
                A+
              </button>

              {/* Quick Align Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextAlign = activeAlign === 'center' ? 'left' : activeAlign === 'left' ? 'right' : 'center';
                  updateCustomFormat(key, { textAlign: nextAlign });
                }}
                className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-[#6c2937] hover:bg-[#fcedf0] transition-colors cursor-pointer"
                title={`Toggle text alignment (current: ${activeAlign})`}
                aria-label="Toggle text alignment"
              >
                {activeAlign === 'center' ? (
                  <AlignCenter className="w-2.5 h-2.5 inline" />
                ) : activeAlign === 'left' ? (
                  <AlignLeft className="w-2.5 h-2.5 inline" />
                ) : (
                  <AlignRight className="w-2.5 h-2.5 inline" />
                )}
              </button>
            </>
          )}

          {/* Edit Pencil Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 rounded-full text-[#9e4c5b] hover:bg-[#fcedf0] transition-colors cursor-pointer"
            title={`Click to edit text: ${label || 'text'}`}
            aria-label={`Edit ${label || 'text'}`}
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
        </span>
      )}
    </WrapperTag>
  );
};

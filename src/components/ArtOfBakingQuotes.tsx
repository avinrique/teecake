import React, { useState } from 'react';
import {
  Sparkles,
  Quote,
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  Sliders,
  Type,
  Eye,
  RotateCcw,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { BakingQuote, PageTexts, QuoteStyleSettings } from '../types';
import { EditableText } from './EditableText';

interface ArtOfBakingQuotesProps {
  quotes: BakingQuote[];
  styleSettings: QuoteStyleSettings;
  onUpdateStyleSettings: (settings: QuoteStyleSettings) => void;
  onAddQuote: (newQuote: Omit<BakingQuote, 'id'>) => void;
  onUpdateQuote: (updated: BakingQuote) => void;
  onDeleteQuote: (id: string) => void;
  pageTexts?: PageTexts;
  onUpdatePageText?: (field: keyof PageTexts, value: string) => void;
}

export const ArtOfBakingQuotes: React.FC<ArtOfBakingQuotesProps> = ({
  quotes,
  styleSettings,
  onUpdateStyleSettings,
  onAddQuote,
  onUpdateQuote,
  onDeleteQuote,
  pageTexts,
  onUpdatePageText,
}) => {
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [showTypographyControls, setShowTypographyControls] = useState(false);

  const quotesHeading = pageTexts?.quotesHeading || 'The Art & Philosophy of Baking';
  const quotesSubheading = pageTexts?.quotesSubheading || 'In our ovens, baking is an alchemy of flour, cultured butter, wildflower honey, and patient love.';

  const [newQuoteText, setNewQuoteText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContext, setNewContext] = useState('');

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editContext, setEditContext] = useState('');

  const handleStartEdit = (q: BakingQuote) => {
    setEditingQuoteId(q.id);
    setEditQuoteText(q.quote);
    setEditAuthor(q.author);
    setEditContext(q.context || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateQuote({
      id,
      quote: editQuoteText.trim(),
      author: editAuthor.trim() || 'TeeCake Creations',
      context: editContext.trim() || 'The Art of Baking',
    });
    setEditingQuoteId(null);
  };

  const handleCreateQuote = () => {
    if (!newQuoteText.trim()) return;
    onAddQuote({
      quote: newQuoteText.trim(),
      author: newAuthor.trim() || 'TeeCake Creations Artisans',
      context: newContext.trim() || 'Baking Philosophy',
    });
    setNewQuoteText('');
    setNewAuthor('');
    setNewContext('');
    setIsAddingQuote(false);
  };

  // Map font-family
  const getFontFamilyClass = (family: string) => {
    switch (family) {
      case 'display':
        return 'font-serif-display';
      case 'sans':
        return 'font-sans';
      case 'mono':
        return 'font-mono';
      case 'cormorant':
      case 'serif':
      default:
        return 'font-serif-subtle';
    }
  };

  // Map font-weight
  const getFontWeightClass = (weight: string) => {
    switch (weight) {
      case 'normal':
        return 'font-normal';
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      case 'extrabold':
        return 'font-extrabold';
      default:
        return 'font-bold';
    }
  };

  // Map font-size
  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'base':
        return 'text-base sm:text-lg';
      case 'lg':
        return 'text-lg sm:text-xl';
      case 'xl':
        return 'text-xl sm:text-2xl';
      case '2xl':
        return 'text-2xl sm:text-3xl';
      case '3xl':
        return 'text-3xl sm:text-4xl';
      default:
        return 'text-xl sm:text-2xl';
    }
  };

  // Map card theme for maximum contrast
  const getCardThemeClass = (theme: string) => {
    switch (theme) {
      case 'pure-white':
        return 'bg-white border-[#ebd0d6] text-stone-900 shadow-md';
      case 'warm-cream':
        return 'bg-[#fffaf0] border-[#ecdcc5] text-stone-900 shadow-sm';
      case 'rose-tint':
        return 'bg-[#fff4f6] border-[#f2cbd4] text-stone-900 shadow-sm';
      case 'contrast-dark':
        return 'bg-[#2a0e16] border-[#541e2a] text-white shadow-xl';
      case 'classic-light':
      default:
        return 'bg-[#fffdfb]/95 border-[#edd7dd] text-stone-900 shadow-sm';
    }
  };

  return (
    <section id="art-of-baking" className="py-14 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Editable text */}
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcedf0] border border-[#e8c0c8] mb-3">
            <Quote className="w-3.5 h-3.5 text-[#9e4c5b]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47]">
              Philosophy & Passion
            </span>
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a1c26] tracking-tight mb-3 text-center flex flex-col items-center justify-center">
            <EditableText
              value={quotesHeading}
              onSave={(val) => onUpdatePageText?.('quotesHeading', val)}
              textKey="quotesHeading"
              label="Quotes Section Title"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h2>

          <div className="font-serif-subtle italic text-base sm:text-lg text-[#5a222e] leading-relaxed text-center flex flex-col items-center justify-center">
            <EditableText
              value={quotesSubheading}
              onSave={(val) => onUpdatePageText?.('quotesSubheading', val)}
              textKey="quotesSubheading"
              defaultWeight="semibold"
              defaultAlign="center"
              label="Quotes Section Subtitle"
              multiline
              as="span"
              className="text-center"
            />
          </div>

          {/* Action Bar: Typography Customizer & Add Quote */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setShowTypographyControls(!showTypographyControls)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                showTypographyControls
                  ? 'bg-[#9e4c5b] text-white'
                  : 'bg-white/95 border border-[#e4b3bc] text-[#7a3b47] hover:bg-white'
              }`}
              title="Customize quote text boldness, transparency, size and font style"
            >
              <Type className="w-3.5 h-3.5 text-[#c99750]" />
              <span>{showTypographyControls ? 'Close Typography Controls' : 'Quote Typography & Visibility'}</span>
            </button>

            <button
              onClick={() => setIsAddingQuote(!isAddingQuote)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white/95 border border-[#e4b3bc] text-[#7a3b47] hover:bg-white transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#9e4c5b]" />
              <span>{isAddingQuote ? 'Cancel Adding' : 'Add Custom Baking Quote'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Typography & Visibility Control Panel */}
        {showTypographyControls && (
          <div className="max-w-4xl mx-auto mb-10 bg-[#fffdfb] border-2 border-[#e8bcc5] rounded-2xl p-5 sm:p-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebd4d9]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#faeaee] rounded-lg text-[#9e4c5b]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif-display font-bold text-base text-[#4a1c26]">
                    Quote Text Appearance & Visibility Controls
                  </h4>
                  <p className="text-xs text-[#6e3943]">
                    Adjust text boldness, transparency, size, font family, and card contrast in real time.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onUpdateStyleSettings({
                    fontWeight: 'bold',
                    fontSize: 'xl',
                    fontFamily: 'cormorant',
                    fontStyle: 'normal',
                    textColor: '#260a11',
                    textOpacity: 1.0,
                    cardTheme: 'pure-white',
                    cardOpacity: 0.95,
                  })
                }
                className="inline-flex items-center gap-1 text-[11px] text-[#9e4c5b] hover:text-[#783944] font-semibold cursor-pointer"
                title="Reset to recommended bold high-contrast settings"
              >
                <RotateCcw className="w-3 h-3" /> Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* 1. Boldness / Weight */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Text Boldness:</span>
                  <span className="font-mono text-[#9e4c5b] font-bold">
                    {styleSettings.fontWeight.toUpperCase()}
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { id: 'normal', label: 'Regular' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'semibold', label: 'Semi' },
                    { id: 'bold', label: 'Bold ★' },
                    { id: 'extrabold', label: 'Heavy' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() =>
                        onUpdateStyleSettings({
                          ...styleSettings,
                          fontWeight: w.id as any,
                        })
                      }
                      className={`py-1.5 px-1 rounded-md text-[10px] font-semibold border text-center transition-all cursor-pointer ${
                        styleSettings.fontWeight === w.id
                          ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Text Size */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Text Size:</span>
                  <span className="font-mono text-[#9e4c5b] font-bold">
                    {styleSettings.fontSize.toUpperCase()}
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { id: 'base', label: '16px' },
                    { id: 'lg', label: '18px' },
                    { id: 'xl', label: '22px ★' },
                    { id: '2xl', label: '26px' },
                    { id: '3xl', label: '32px' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        onUpdateStyleSettings({
                          ...styleSettings,
                          fontSize: s.id as any,
                        })
                      }
                      className={`py-1.5 px-1 rounded-md text-[10px] font-semibold border text-center transition-all cursor-pointer ${
                        styleSettings.fontSize === s.id
                          ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Text Transparency / Opacity */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Text Opacity:</span>
                  <span className="font-mono text-[#9e4c5b] font-bold">
                    {Math.round(styleSettings.textOpacity * 100)}%
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { val: 0.65, label: '65%' },
                    { val: 0.8, label: '80%' },
                    { val: 0.9, label: '90%' },
                    { val: 1.0, label: '100% ★' },
                  ].map((op) => (
                    <button
                      key={op.val}
                      onClick={() =>
                        onUpdateStyleSettings({
                          ...styleSettings,
                          textOpacity: op.val,
                        })
                      }
                      className={`py-1.5 rounded-md text-[10px] font-semibold border text-center transition-all cursor-pointer ${
                        Math.abs(styleSettings.textOpacity - op.val) < 0.05
                          ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Font Style & Posture */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2">
                  Font Family & Style:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'cormorant', label: 'Cormorant Serif' },
                    { id: 'display', label: 'Playfair Display' },
                    { id: 'sans', label: 'Plus Jakarta Sans' },
                    { id: 'mono', label: 'Artisan Typewriter' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() =>
                        onUpdateStyleSettings({
                          ...styleSettings,
                          fontFamily: f.id as any,
                        })
                      }
                      className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border text-left truncate transition-all cursor-pointer ${
                        styleSettings.fontFamily === f.id
                          ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Posture: Normal vs Italic */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2">
                  Letter Posture:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateStyleSettings({
                        ...styleSettings,
                        fontStyle: 'normal',
                      })
                    }
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                      styleSettings.fontStyle === 'normal'
                        ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                    }`}
                  >
                    Upright (Clear)
                  </button>
                  <button
                    onClick={() =>
                      onUpdateStyleSettings({
                        ...styleSettings,
                        fontStyle: 'italic',
                      })
                    }
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border text-center italic transition-all cursor-pointer ${
                      styleSettings.fontStyle === 'italic'
                        ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                    }`}
                  >
                    Italic (Poetic)
                  </button>
                </div>
              </div>

              {/* 6. Card Background Contrast Theme */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2">
                  Card Visibility Theme:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'pure-white', label: 'Solid White' },
                    { id: 'classic-light', label: 'Soft Ivory' },
                    { id: 'rose-tint', label: 'Rose Mist' },
                    { id: 'warm-cream', label: 'Warm Cream' },
                    { id: 'contrast-dark', label: 'Dark Velvet' },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() =>
                        onUpdateStyleSettings({
                          ...styleSettings,
                          cardTheme: ct.id as any,
                        })
                      }
                      className={`py-1 px-1 rounded-md text-[10px] font-semibold border text-center truncate transition-all cursor-pointer ${
                        styleSettings.cardTheme === ct.id
                          ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Quote Text Alignment (Centered by default) */}
              <div>
                <label className="block font-bold text-[#5e2632] uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Quote Alignment:</span>
                  <span className="font-mono text-[#9e4c5b] font-bold">
                    {(styleSettings.textAlign || 'center').toUpperCase()}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'center', label: 'Center ★', icon: AlignCenter },
                    { id: 'left', label: 'Left', icon: AlignLeft },
                    { id: 'right', label: 'Right', icon: AlignRight },
                    { id: 'justify', label: 'Justify', icon: AlignJustify },
                  ].map((al) => {
                    const Icon = al.icon;
                    const isActive = (styleSettings.textAlign || 'center') === al.id;
                    return (
                      <button
                        key={al.id}
                        onClick={() =>
                          onUpdateStyleSettings({
                            ...styleSettings,
                            textAlign: al.id as any,
                          })
                        }
                        className={`py-1.5 px-1 rounded-md text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                        }`}
                        title={`Align quotes ${al.id}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{al.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Quote Inline Form */}
        {isAddingQuote && (
          <div className="max-w-xl mx-auto mb-10 bg-[#fffdfb] border border-[#e4b3bc] rounded-2xl p-5 shadow-lg animate-in fade-in duration-200">
            <h4 className="font-serif-display font-semibold text-base text-[#4a1c26] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c99750]" /> New Baking Quote
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Quote Text *
                </label>
                <textarea
                  rows={2}
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="e.g. Baking is a conversation between heat, time, and flour..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Head Baker"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Context / Category
                  </label>
                  <input
                    type="text"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    placeholder="e.g. Morning Brioche"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuote(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateQuote}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg cursor-pointer shadow-xs"
                >
                  Save Quote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quotes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((q) => {
            const isEditing = editingQuoteId === q.id;

            if (isEditing) {
              return (
                <div
                  key={q.id}
                  className="bg-[#fffdfb] border border-[#9e4c5b] rounded-2xl p-6 shadow-md"
                >
                  <textarea
                    rows={2}
                    value={editQuoteText}
                    onChange={(e) => setEditQuoteText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg mb-2 focus:outline-hidden focus:ring-1 focus:ring-[#9e4c5b]"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      placeholder="Author"
                      className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={editContext}
                      onChange={(e) => setEditContext(e.target.value)}
                      placeholder="Context"
                      className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingQuoteId(null)}
                      className="px-3 py-1 text-xs text-stone-600 bg-stone-100 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 inline mr-1" /> Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(q.id)}
                      className="px-3 py-1 text-xs text-white bg-[#9e4c5b] rounded-md cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 inline mr-1" /> Save
                    </button>
                  </div>
                </div>
              );
            }

            const cardThemeClass = getCardThemeClass(styleSettings.cardTheme);
            const fontFamilyClass = getFontFamilyClass(styleSettings.fontFamily);
            const fontWeightClass = getFontWeightClass(styleSettings.fontWeight);
            const fontSizeClass = getFontSizeClass(styleSettings.fontSize);
            const isItalic = styleSettings.fontStyle === 'italic';
            const isDarkTheme = styleSettings.cardTheme === 'contrast-dark';
            const quoteAlign = styleSettings.textAlign || 'center';
            const isCentered = quoteAlign === 'center';
            const quoteAlignClass =
              quoteAlign === 'left'
                ? 'text-left'
                : quoteAlign === 'right'
                ? 'text-right'
                : quoteAlign === 'justify'
                ? 'text-justify'
                : 'text-center mx-auto';

            return (
              <div
                key={q.id}
                className={`group relative rounded-2xl p-7 transition-all duration-300 backdrop-blur-xs flex flex-col justify-between hover:shadow-xl ${cardThemeClass}`}
              >
                <div>
                  <div className={`flex items-center mb-4 ${isCentered ? 'justify-center relative' : 'justify-between'}`}>
                    <Quote
                      className={`w-7 h-7 transition-colors ${
                        isDarkTheme ? 'text-[#f2aab8]' : 'text-[#9e4c5b]'
                      } ${isCentered ? 'mx-auto' : ''}`}
                    />
                    {q.context && (
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isCentered ? 'absolute right-0 top-0' : ''
                        } ${
                          isDarkTheme
                            ? 'text-[#f2cbd4] bg-white/10 border-white/20'
                            : 'text-[#8b535e] bg-[#fcedf0] border-[#edd4d9]'
                        }`}
                      >
                        {q.context}
                      </span>
                    )}
                  </div>

                  {/* Primary Quote Text with Customizable Boldness, Size, Opacity, Font, and Alignment (Centered by default) */}
                  <p
                    className={`${fontFamilyClass} ${fontWeightClass} ${fontSizeClass} ${
                      isItalic ? 'italic' : 'not-italic'
                    } ${quoteAlignClass} leading-relaxed mb-6 tracking-normal transition-all`}
                    style={{
                      color: isDarkTheme ? '#ffffff' : styleSettings.textColor || '#260a11',
                      opacity: styleSettings.textOpacity ?? 1.0,
                    }}
                  >
                    &ldquo;{q.quote}&rdquo;
                  </p>
                </div>

                <div
                  className={`flex items-center pt-4 border-t ${
                    isDarkTheme ? 'border-white/15' : 'border-[#f0dce1]'
                  } ${isCentered ? 'justify-center relative' : 'justify-between'}`}
                >
                  <span
                    className={`text-xs font-bold tracking-wide uppercase ${
                      isCentered ? 'text-center' : ''
                    } ${
                      isDarkTheme ? 'text-[#f5d9e0]' : 'text-[#6e3943]'
                    }`}
                  >
                    — {q.author}
                  </span>

                  {/* Actions to edit/delete */}
                  <div className={`${isCentered ? 'absolute right-0' : ''} opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5`}>
                    <button
                      onClick={() => handleStartEdit(q)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDarkTheme
                          ? 'hover:bg-white/20 text-white/80 hover:text-white'
                          : 'hover:bg-[#faeaee] text-stone-600 hover:text-[#9e4c5b]'
                      }`}
                      title="Edit quote text or author"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {quotes.length > 1 && (
                      <button
                        onClick={() => onDeleteQuote(q.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDarkTheme
                            ? 'hover:bg-red-500/30 text-red-300 hover:text-red-100'
                            : 'hover:bg-red-50 text-stone-400 hover:text-red-600'
                        }`}
                        title="Delete quote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

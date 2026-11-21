import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Camera,
  Eye,
  Tag,
  Grid,
  Filter,
  SlidersHorizontal,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import { BakeryItem, PageTexts } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { EditableText } from './EditableText';
import { EditFiltersModal } from './EditFiltersModal';

interface AllDishesSectionProps {
  items: BakeryItem[];
  pageTexts: PageTexts;
  onUpdatePageText: (field: keyof PageTexts, value: string) => void;
  onOpenLightbox: (index: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: BakeryItem) => void;
  onOpenReplacePhoto: (item: BakeryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAllDishes?: () => void;
  categories?: string[];
  onSaveCategories: (newCategories: string[]) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onAssignCategory?: (itemId: string, newCategory: string) => void;
  onToggleSignature?: (id: string) => void;
  onQuickUploadPhoto?: (item: BakeryItem, file: File) => void;
  onQuickAddNewWithFile?: (file: File) => void;
}

export const AllDishesSection: React.FC<AllDishesSectionProps> = ({
  items,
  pageTexts,
  onUpdatePageText,
  onOpenLightbox,
  onOpenAddModal,
  onOpenEditModal,
  onOpenReplacePhoto,
  onDeleteItem,
  onClearAllDishes,
  categories = DEFAULT_CATEGORIES,
  onSaveCategories,
  onRenameCategory,
  onAssignCategory,
  onToggleSignature,
  onQuickUploadPhoto,
  onQuickAddNewWithFile,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'signature' | 'gallery'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal & inline filter editing states
  const [isManageFiltersOpen, setIsManageFiltersOpen] = useState<boolean>(false);
  const [inlineEditingCat, setInlineEditingCat] = useState<string | null>(null);
  const [inlineDraftName, setInlineDraftName] = useState<string>('');
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [quickAddValue, setQuickAddValue] = useState<string>('');
  const [filterWarning, setFilterWarning] = useState<string | null>(null);

  const triggerFilterWarning = (msg: string) => {
    setFilterWarning(msg);
    setTimeout(() => {
      setFilterWarning((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // Quick category picker for individual dish cards
  const [openCategoryPickerId, setOpenCategoryPickerId] = useState<string | null>(null);
  const [isCreatingNewCat, setIsCreatingNewCat] = useState<boolean>(false);
  const [newCatDraft, setNewCatDraft] = useState<string>('');

  // Ingredients & details expansion state (individual dish cards & global toggle for all dishes)
  const [expandedDishIds, setExpandedDishIds] = useState<Set<string>>(new Set());
  const [areAllIngredientsExpanded, setAreAllIngredientsExpanded] = useState<boolean>(false);

  // Toggle single individual dish card expansion (details & ingredients)
  const handleToggleItemExpansion = (itemId: string) => {
    setExpandedDishIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleToggleAllIngredients = () => {
    if (areAllIngredientsExpanded || expandedDishIds.size > 0) {
      // Minimize all dishes back to short
      setAreAllIngredientsExpanded(false);
      setExpandedDishIds(new Set());
    } else {
      // Pop down all ingredients for all dishes
      setAreAllIngredientsExpanded(true);
      const allIds = new Set(items.map((i) => i.id));
      setExpandedDishIds(allIds);
    }
  };

  const signatureCount = items.filter(
    (i) => i.featured || i.dishType === 'signature' || i.dishType === 'both'
  ).length;

  const galleryCount = items.filter(
    (i) => i.inGallery || i.dishType === 'gallery' || i.dishType === 'both'
  ).length;

  // Compute how many items match a category (with case insensitivity and smart fallback for savory/combo)
  const getCategoryCount = (catName: string): number => {
    return items.filter((item) => {
      const itemCat = (item.category || '').toLowerCase().trim();
      const targetCat = catName.toLowerCase().trim();
      if (itemCat === targetCat) return true;

      // Smart semantic fallback for Savory and Assorted Combo
      if (targetCat.includes('savory')) {
        const itemText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        return itemText.includes('savory') || itemText.includes('quiche') || itemText.includes('focaccia');
      }
      if (targetCat.includes('combo')) {
        const itemText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        return itemText.includes('combo') || itemText.includes('tasting box') || itemText.includes('assorted');
      }
      return false;
    }).length;
  };

  const handleAssignCategory = (itemId: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (onAssignCategory) {
      onAssignCategory(itemId, trimmed);
    }
    setOpenCategoryPickerId(null);
    setIsCreatingNewCat(false);
    setNewCatDraft('');
  };

  const filteredItems = items.filter((item) => {
    // Filter by type
    if (activeFilter === 'signature') {
      const isSig = item.featured || item.dishType === 'signature' || item.dishType === 'both';
      if (!isSig) return false;
    } else if (activeFilter === 'gallery') {
      const isGal = item.inGallery || item.dishType === 'gallery' || item.dishType === 'both';
      if (!isGal) return false;
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const itemCat = (item.category || '').toLowerCase().trim();
      const targetCat = selectedCategory.toLowerCase().trim();
      let matches = itemCat === targetCat;

      // Smart semantic fallback
      if (!matches && targetCat.includes('savory')) {
        const itemText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        matches = itemText.includes('savory') || itemText.includes('quiche') || itemText.includes('focaccia');
      } else if (!matches && targetCat.includes('combo')) {
        const itemText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        matches = itemText.includes('combo') || itemText.includes('tasting box') || itemText.includes('assorted');
      }

      if (!matches) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        item.ingredients.some((ing) => ing.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  });

  // Handle inline rename of a filter
  const handleStartInlineEdit = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInlineEditingCat(catName);
    setInlineDraftName(catName);
  };

  const handleSaveInlineEdit = (oldName: string) => {
    const trimmed = inlineDraftName.trim();
    if (!trimmed || trimmed === oldName) {
      setInlineEditingCat(null);
      return;
    }

    // Check duplicate
    if (categories.some((c) => c !== oldName && c.toLowerCase() === trimmed.toLowerCase())) {
      triggerFilterWarning(`A filter named "${trimmed}" already exists.`);
      return;
    }

    onRenameCategory(oldName, trimmed);
    if (selectedCategory === oldName) {
      setSelectedCategory(trimmed);
    }
    setInlineEditingCat(null);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickAddValue.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      triggerFilterWarning(`Filter "${trimmed}" already exists.`);
      return;
    }
    const updated = [...categories, trimmed];
    onSaveCategories(updated);
    setSelectedCategory(trimmed);
    setQuickAddValue('');
    setQuickAddOpen(false);
  };

  return (
    <section id="all-dishes" className="py-16 md:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Editable text */}
        <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fcedf0] border border-[#e8c0c8] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
            <EditableText
              value={pageTexts.allDishesEmblem}
              onSave={(val) => onUpdatePageText('allDishesEmblem', val)}
              textKey="allDishesEmblem"
              label="All Dishes Section Emblem"
              defaultAlign="center"
              className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47] text-center"
            />
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a1c26] tracking-tight mb-3 text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.allDishesHeading}
              onSave={(val) => onUpdatePageText('allDishesHeading', val)}
              textKey="allDishesHeading"
              label="All Dishes Section Heading"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h2>

          <div className="font-serif-subtle italic text-base sm:text-lg text-[#5a222e] leading-relaxed text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.allDishesSubheading}
              onSave={(val) => onUpdatePageText('allDishesSubheading', val)}
              textKey="allDishesSubheading"
              defaultWeight="semibold"
              defaultAlign="center"
              label="All Dishes Subheading"
              multiline
              as="span"
              className="text-center"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff3f5] border border-[#f0cdd4] text-[#853443]">
              🌟 {signatureCount} Signature Dishes
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff8ef] border border-[#f5debe] text-[#805021]">
              🖼️ {galleryCount} Dishes Gallery
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9e4c5b] text-white shadow-xs">
              🍰 {items.length} Total Creations
            </span>
          </div>
        </div>

        {/* Toolbar & Filter Controls */}
        <div className="bg-[#fffdfb]/95 border border-[#e8ccd2] rounded-2xl p-4 sm:p-6 shadow-md backdrop-blur-xs mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Primary Scope Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'all'
                    ? 'bg-[#9e4c5b] text-white shadow-xs ring-2 ring-[#e293a3]/50'
                    : 'bg-white text-[#633f47] border border-[#ecd5da] hover:bg-[#fff0f3]'
                }`}
              >
                <span>All Creations</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#faeaee] text-[#8b3d4d]'
                }`}>
                  {items.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('signature')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'signature'
                    ? 'bg-[#9e4c5b] text-white shadow-xs ring-2 ring-[#e293a3]/50'
                    : 'bg-white text-[#633f47] border border-[#ecd5da] hover:bg-[#fff0f3]'
                }`}
              >
                <span>Signature Dishes</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeFilter === 'signature' ? 'bg-white/20 text-white' : 'bg-[#faeaee] text-[#8b3d4d]'
                }`}>
                  {signatureCount}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('gallery')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'gallery'
                    ? 'bg-[#9e4c5b] text-white shadow-xs ring-2 ring-[#e293a3]/50'
                    : 'bg-white text-[#633f47] border border-[#ecd5da] hover:bg-[#fff0f3]'
                }`}
              >
                <span>Dishes Gallery</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeFilter === 'gallery' ? 'bg-white/20 text-white' : 'bg-[#faeaee] text-[#8b3d4d]'
                }`}>
                  {galleryCount}
                </span>
              </button>
            </div>

            {/* Right Side: Search, Clear All & Add Creation Button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:w-64 min-w-[180px]">
                <Search className="w-4 h-4 text-[#9e4c5b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search all ${items.length} creations & ingredients...`}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#ebd0d6] rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] shadow-2xs"
                />
              </div>

              {onClearAllDishes && items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllDishes}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-2xs cursor-pointer whitespace-nowrap transition-colors"
                  title="Clear all dishes so you can add your own from scratch"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear All Dishes</span>
                </button>
              )}

              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-xs cursor-pointer whitespace-nowrap transition-colors"
                title="Add a new bakery dish"
              >
                <PlusCircle className="w-4 h-4" /> Add Dish
              </button>
            </div>
          </div>

          {/* Optional inline warning notice */}
          {filterWarning && (
            <div className="mb-3 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between animate-fadeIn">
              <span>{filterWarning}</span>
              <button
                type="button"
                onClick={() => setFilterWarning(null)}
                className="text-amber-600 hover:text-amber-900 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Category Pills Bar with Self-Editing controls */}
          <div className="pt-3 border-t border-[#f2dbe0] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a5762] flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#9e4c5b]" /> Filters:
              </span>

              {/* "All Categories" pill */}
              <button
                key="all"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#5e2632] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-[#faeaee] hover:text-[#783944] border border-stone-200/60'
                }`}
              >
                <span>All Categories</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-600'
                }`}>
                  {items.length}
                </span>
              </button>

              {/* Dynamic Categories Pills (including Savory, Assorted Combo, and Custom Filters) */}
              {categories.map((cat) => {
                const count = getCategoryCount(cat);
                const isSelected = selectedCategory === cat;
                const isInlineEditing = inlineEditingCat === cat;

                if (isInlineEditing) {
                  return (
                    <div
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-white border-2 border-[#9e4c5b] shadow-xs shrink-0"
                    >
                      <input
                        type="text"
                        value={inlineDraftName}
                        onChange={(e) => setInlineDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') handleSaveInlineEdit(cat);
                          if (e.key === 'Escape') setInlineEditingCat(null);
                        }}
                        autoFocus
                        className="w-32 px-1.5 py-0.5 text-xs font-semibold text-[#5e2632] bg-transparent border-0 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveInlineEdit(cat)}
                        className="p-1 rounded bg-[#9e4c5b] text-white hover:bg-[#853c49] cursor-pointer"
                        title="Save renamed filter"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInlineEditingCat(null)}
                        className="p-1 rounded bg-stone-200 text-stone-600 hover:bg-stone-300 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`group/pill relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? 'bg-[#5e2632] text-white border-[#5e2632] shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-[#faeaee] hover:text-[#783944] border-stone-200/70 hover:border-[#ebd0d6]'
                    }`}
                  >
                    <span>{cat}</span>

                    {/* Dish count badge */}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-200/70 text-stone-600 group-hover/pill:bg-[#ebd0d6] group-hover/pill:text-[#783944]'
                      }`}
                    >
                      {count}
                    </span>

                    {/* Self-Edit pencil button directly on the pill */}
                    <button
                      type="button"
                      onClick={(e) => handleStartInlineEdit(cat, e)}
                      className={`p-0.5 rounded transition-opacity cursor-pointer ${
                        isSelected
                          ? 'text-white/70 hover:text-white hover:bg-white/20'
                          : 'text-stone-400 hover:text-[#9e4c5b] hover:bg-[#faeaee]'
                      }`}
                      title={`Edit/Rename filter "${cat}"`}
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right side: Self-Edit & Manage Filters buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {quickAddOpen ? (
                <form onSubmit={handleQuickAdd} className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-[#ebd0d6] shadow-2xs">
                  <input
                    type="text"
                    value={quickAddValue}
                    onChange={(e) => setQuickAddValue(e.target.value)}
                    placeholder="Filter name..."
                    autoFocus
                    className="w-28 px-2 py-0.5 text-xs text-stone-800 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded-lg bg-[#9e4c5b] text-white hover:bg-[#853c49] cursor-pointer"
                    title="Add filter"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen(false)}
                    className="p-1 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#8b3d4d] bg-[#faeaee] hover:bg-[#f6dce2] border border-[#ebd0d6] rounded-xl cursor-pointer transition-colors"
                  title="Quick add a new filter category"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Filter</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsManageFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#8b3d4d] hover:bg-[#732f3d] rounded-xl shadow-2xs cursor-pointer transition-colors"
                title="Open filter management modal to edit text, reorder, or remove filters"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Manage Filters</span>
              </button>

              {/* Global Pop Down / Minimize Ingredients for all dishes */}
              <button
                type="button"
                onClick={handleToggleAllIngredients}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#8b3d4d] hover:text-[#5e2632] bg-[#faeaee] hover:bg-[#f6dce2] border border-[#ebd0d6] rounded-xl shadow-2xs cursor-pointer transition-colors"
                title={areAllIngredientsExpanded ? "Minimize all dishes to short ingredients view" : "Pop down full ingredients for all dishes"}
              >
                {areAllIngredientsExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-[#8b3d4d]" />
                    <span>Minimize All Ingredients</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8b3d4d]" />
                    <span>Expand All Ingredients</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Grid of Dishes */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-[#fffaf6] border-2 border-dashed border-[#e8ccd2] rounded-3xl p-8 max-w-xl mx-auto">
            <PlusCircle className="w-12 h-12 text-[#9e4c5b] mx-auto mb-3 opacity-80" />
            <h3 className="font-serif-display text-xl font-bold text-[#5e2632] mb-1">
              Your Creations Catalog Is Empty
            </h3>
            <p className="text-xs text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
              You can now add your own creations with your own photographs and descriptions. Your custom photos will be saved permanently.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Your First Dish & Upload Photo</span>
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#fffaf6] border border-dashed border-[#ebd0d6] rounded-2xl p-8">
            <Grid className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-lg font-bold text-[#5e2632] mb-1">
              {selectedCategory !== 'all'
                ? `No creations currently in "${selectedCategory}"`
                : 'No creations match this filter'}
            </h3>
            <p className="text-xs text-stone-500 mb-4 max-w-md mx-auto">
              {selectedCategory !== 'all'
                ? `You can edit existing dishes into the "${selectedCategory}" category, rename this filter, or click below to add a new dish directly.`
                : 'Try adjusting your search query or selecting a different category tab.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-semibold text-[#9e4c5b] bg-white border border-[#e8c0c8] rounded-xl hover:bg-[#fff0f3] cursor-pointer"
              >
                Show All Dishes
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add New Dish</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Backdrop for closing quick category picker */}
            {openCategoryPickerId && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => {
                  setOpenCategoryPickerId(null);
                  setIsCreatingNewCat(false);
                }}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const originalIndex = items.findIndex((i) => i.id === item.id);
                const isSignature = item.featured || item.dishType === 'signature' || item.dishType === 'both';
                const isGallery = item.inGallery || item.dishType === 'gallery' || item.dishType === 'both';
                const isPickerOpen = openCategoryPickerId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`group bg-[#fffdfb]/95 border border-[#e8ccd2] hover:border-[#cf8a99] rounded-2xl ${
                      isPickerOpen ? 'z-30 overflow-visible' : 'overflow-hidden'
                    } shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between backdrop-blur-xs`}
                  >
                    <div>
                      {/* Dish Image Container with drag & drop support */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (onQuickUploadPhoto) {
                              onQuickUploadPhoto(item, file);
                            } else {
                              onOpenReplacePhoto(item);
                            }
                          }
                        }}
                        className={`relative aspect-4/3 ${isPickerOpen ? 'overflow-visible' : 'overflow-hidden'} bg-stone-100`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.retried) {
                              e.currentTarget.dataset.retried = 'true';
                              // Self-heal with timestamp or valid guaranteed pastry photo
                              e.currentTarget.src = item.image && item.image.startsWith('/uploads/')
                                ? `${item.image}?retry=1`
                                : '/uploads/dish_item-1793425238012-ka1o_5ab4054267b4.jpg';
                            }
                          }}
                          className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => onOpenLightbox(originalIndex >= 0 ? originalIndex : 0)}
                        />
                        <label
                          style={{ display: item.image ? 'none' : 'flex' }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute inset-0 bg-[#fbf5f7] hover:bg-[#faeaee] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group/upload overflow-hidden z-10"
                          title="Click to choose or upload photo from device"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                if (onQuickUploadPhoto) {
                                  onQuickUploadPhoto(item, f);
                                } else {
                                  onOpenReplacePhoto(item);
                                }
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />
                          <Camera className="w-8 h-8 text-[#9e4c5b]/70 group-hover/upload:scale-110 mb-1 transition-transform" />
                          <span className="text-xs font-bold text-[#5c2430]">No photo</span>
                          <span className="text-[11px] font-semibold text-[#8b3d4d] underline mt-0.5">Click to choose or upload photo</span>
                        </label>

                        {/* Section Tags */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                          {isSignature && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#5e2632]/90 text-[#fae1e6] rounded-full backdrop-blur-xs shadow-2xs">
                              🌟 Signature
                            </span>
                          )}
                          {isGallery && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#804824]/90 text-[#fdecdb] rounded-full backdrop-blur-xs shadow-2xs">
                              🖼️ Gallery
                            </span>
                          )}
                        </div>

                        {/* Category Badge & Quick Reassign */}
                        <div className="absolute top-2.5 right-2.5 z-20">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCategoryPickerId(isPickerOpen ? null : item.id);
                                setIsCreatingNewCat(false);
                                setNewCatDraft('');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold bg-white/95 hover:bg-white text-stone-700 hover:text-[#9e4c5b] rounded-full backdrop-blur-xs shadow-xs border border-stone-200/80 cursor-pointer transition-all hover:scale-105"
                              title="Click to quickly change category"
                            >
                              <Tag className="w-2.5 h-2.5 text-[#9e4c5b]" />
                              <span className="truncate max-w-[100px]">{item.category}</span>
                              <ChevronDown className="w-2.5 h-2.5 text-stone-400" />
                            </button>

                            {isPickerOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#e8c0c8] rounded-xl shadow-2xl z-40 p-2 text-left animate-in fade-in zoom-in-95 duration-150"
                              >
                                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#f2dbe0]">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a3b47] flex items-center gap-1">
                                    <Tag className="w-2.5 h-2.5 text-[#9e4c5b]" /> Reassign Category
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenCategoryPickerId(null);
                                      setIsCreatingNewCat(false);
                                    }}
                                    className="text-stone-400 hover:text-stone-600 p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="max-h-44 overflow-y-auto space-y-0.5 py-0.5">
                                  {categories.map((cat) => {
                                    const isCurrent = (item.category || '').toLowerCase() === cat.toLowerCase();
                                    const catCount = getCategoryCount(cat);
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleAssignCategory(item.id, cat)}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                                          isCurrent
                                            ? 'bg-[#faeaee] text-[#802c3e] font-semibold'
                                            : 'hover:bg-[#fff4f6] text-stone-700'
                                        }`}
                                      >
                                        <span className="truncate pr-1.5">{cat}</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-500 font-mono">
                                            {catCount}
                                          </span>
                                          {isCurrent && <Check className="w-3 h-3 text-[#9e4c5b]" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Create New Category Option */}
                                <div className="mt-1.5 pt-1.5 border-t border-[#f2dbe0]">
                                  {!isCreatingNewCat ? (
                                    <button
                                      type="button"
                                      onClick={() => setIsCreatingNewCat(true)}
                                      className="w-full text-left text-xs font-semibold text-[#9e4c5b] hover:text-[#802c3e] flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[#faeaee] transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" /> + New Category...
                                    </button>
                                  ) : (
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={newCatDraft}
                                        onChange={(e) => setNewCatDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAssignCategory(item.id, newCatDraft);
                                          } else if (e.key === 'Escape') {
                                            setIsCreatingNewCat(false);
                                          }
                                        }}
                                        placeholder="New category name..."
                                        autoFocus
                                        className="w-full px-2 py-1 text-xs bg-white border border-[#9e4c5b] rounded-lg focus:outline-hidden text-stone-800"
                                      />
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setIsCreatingNewCat(false)}
                                          className="px-1.5 py-0.5 text-[10px] text-stone-500 hover:text-stone-700 rounded cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAssignCategory(item.id, newCatDraft)}
                                          className="px-2 py-0.5 text-[10px] font-semibold bg-[#9e4c5b] text-white hover:bg-[#802c3e] rounded cursor-pointer"
                                        >
                                          Save & Assign
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hover Action Strip */}
                      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-10">
                        <button
                          onClick={() => onOpenLightbox(originalIndex >= 0 ? originalIndex : 0)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/90 text-[#5e2632] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#9e4c5b]" /> Inspect
                        </button>

                        <div className="flex items-center gap-1.5">
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="relative p-1.5 rounded bg-white/80 hover:bg-white text-stone-700 transition-colors cursor-pointer flex items-center justify-center hover:scale-110 overflow-hidden"
                            title="Click to select & upload a new photo from your device"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  if (onQuickUploadPhoto) {
                                    onQuickUploadPhoto(item, f);
                                  } else {
                                    onOpenReplacePhoto(item);
                                  }
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <Camera className="w-3.5 h-3.5 text-[#9e4c5b]" />
                          </label>
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(item)}
                            className="p-1.5 rounded bg-white/80 hover:bg-white text-stone-700 transition-colors cursor-pointer hover:scale-110"
                            title="Edit dish details"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-stone-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 rounded bg-white/80 hover:bg-red-50 text-red-600 transition-colors cursor-pointer hover:scale-110"
                            title="Delete dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <h3
                        onClick={() => onOpenLightbox(originalIndex >= 0 ? originalIndex : 0)}
                        className="font-serif-display text-base font-bold text-[#4a1c26] hover:text-[#9e4c5b] transition-colors cursor-pointer leading-snug mb-1.5 line-clamp-2"
                      >
                        {item.name}
                      </h3>

                      {(() => {
                        const isExpanded = expandedDishIds.has(item.id);
                        const displayedIngredients = isExpanded
                          ? item.ingredients
                          : item.ingredients.slice(0, 3);
                        const hasMoreIngredients = item.ingredients.length > 3;
                        const hasLongDescription = item.description && item.description.length > 60;

                        return (
                          <div className="space-y-2">
                            {/* Dish Description: clamps when minimized, shows full text when expanded */}
                            <p className={`text-xs text-[#5d4449] leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {item.description}
                            </p>

                            {/* Ingredients & Individual Card Minimize/Maximize Toggle */}
                            <div className="transition-all duration-300 ease-in-out">
                              <div className="flex flex-wrap items-center gap-1">
                                {displayedIngredients.map((ing, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 text-[10px] font-medium bg-[#fbedf0] text-[#783944] rounded border border-[#f0d1d7] transition-all"
                                  >
                                    {ing}
                                  </span>
                                ))}

                                {(hasMoreIngredients || hasLongDescription) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleItemExpansion(item.id);
                                    }}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border cursor-pointer transition-all duration-200 select-none shadow-2xs ${
                                      isExpanded
                                        ? 'bg-[#faeaee] hover:bg-[#f5d5de] text-[#8b3d4d] hover:text-[#5e2632] border-[#ebd0d6]'
                                        : 'bg-white hover:bg-[#faeaee] text-[#783944] hover:text-[#5e2632] border-[#ebd0d6] hover:border-[#cf8a99] hover:scale-105'
                                    }`}
                                    title={isExpanded ? 'Minimize details & ingredients for this dish' : 'Maximize details & ingredients for this dish'}
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Minimize</span>
                                        <ChevronUp className="w-2.5 h-2.5 text-[#8b3d4d]" />
                                      </>
                                    ) : (
                                      <>
                                        <span>{hasMoreIngredients ? `+${item.ingredients.length - 3} more` : 'Details'}</span>
                                        <ChevronDown className="w-2.5 h-2.5 text-[#8b3d4d]" />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-4 py-2.5 bg-stone-50/60 border-t border-[#f2dbe0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenEditModal(item)}
                        className="inline-flex items-center gap-1 text-[#8b3d4d] hover:text-[#5a2732] font-semibold cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenReplacePhoto(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#8b3d4d] hover:text-[#5a2732] bg-[#faeaee] hover:bg-[#f5d7df] border border-[#ebd0d6] cursor-pointer transition-all hover:scale-105 shadow-2xs"
                        title="Upload, change, or crop photo for this dish"
                      >
                        <Camera className="w-3 h-3 text-[#9e4c5b]" />
                        <span>Photo</span>
                      </button>

                      {/* Quick Add / Remove from Signature button */}
                      {onToggleSignature && (
                        <button
                          type="button"
                          onClick={() => onToggleSignature(item.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                            isSignature
                              ? 'bg-[#5e2632] text-white border-[#5e2632] shadow-2xs'
                              : 'bg-white hover:bg-[#faeaee] text-stone-600 hover:text-[#9e4c5b] border-stone-200'
                          }`}
                          title={isSignature ? 'Remove from Chef’s Signature section' : 'Add to Chef’s Signature live section'}
                        >
                          <Star className={`w-2.5 h-2.5 ${isSignature ? 'fill-current text-[#f0afbd]' : 'text-stone-400'}`} />
                          <span>{isSignature ? '★ Signature' : '+ Signature'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="inline-flex items-center gap-1 text-stone-400 hover:text-red-600 transition-colors px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                        title="Delete dish from portfolio"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span className="text-[11px] font-medium text-stone-500 hover:text-red-600">Delete</span>
                      </button>
                      <button
                        onClick={() => onOpenLightbox(originalIndex >= 0 ? originalIndex : 0)}
                        className="text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div>

      {/* Customize & Self-Edit Filters Modal */}
      <EditFiltersModal
        isOpen={isManageFiltersOpen}
        onClose={() => setIsManageFiltersOpen(false)}
        categories={categories}
        items={items}
        onSaveCategories={onSaveCategories}
        onRenameCategory={onRenameCategory}
      />
    </section>
  );
};

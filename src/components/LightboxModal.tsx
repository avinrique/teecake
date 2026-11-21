import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  Trash2,
  Upload,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Tag,
  Sparkles,
  MoreVertical,
  Star,
  Layers,
  Copy,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { BakeryItem } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BakeryItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onUpdateItem: (updated: BakeryItem) => void;
  onDeleteItem: (id: string) => void;
  onSwapItems: (indexA: number, indexB: number) => void;
  onSwapItemsById?: (idA: string, idB: string) => void;
  onMoveToPosition?: (id: string, targetSlot: number) => void;
  onToggleSignature?: (id: string) => void;
  onToggleGallery?: (id: string) => void;
  onDuplicateItem?: (item: BakeryItem) => void;
  onRequestReplacePhoto: (item: BakeryItem) => void;
  categories?: string[];
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onSelectIndex,
  onUpdateItem,
  onDeleteItem,
  onSwapItems,
  onSwapItemsById,
  onMoveToPosition,
  onToggleSignature,
  onToggleGallery,
  onDuplicateItem,
  onRequestReplacePhoto,
  categories = DEFAULT_CATEGORIES,
}) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<BakeryItem['category']>('Cakes & TeaCakes');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [editDishType, setEditDishType] = useState<'signature' | 'gallery' | 'both'>('gallery');
  const [editDescription, setEditDescription] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Close More menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentItem = items[currentIndex];
  const lastItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentItem && currentItem.id !== lastItemIdRef.current) {
      lastItemIdRef.current = currentItem.id;
      setEditName(currentItem.name);
      setEditCategory(currentItem.category);
      setIsCustomCategory(false);
      setCustomCategoryName('');
      setEditDishType(
        currentItem.dishType
          ? currentItem.dishType
          : currentItem.featured && currentItem.inGallery
          ? 'both'
          : currentItem.featured
          ? 'signature'
          : 'gallery'
      );
      setEditDescription(currentItem.description);
      setEditIngredients(currentItem.ingredients.join(', '));
      setIsEditingText(false);
      setIsZoomed(false);
    }
  }, [currentIndex, currentItem]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingText) {
          setIsEditingText(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isEditingText) handlePrev();
      } else if (e.key === 'ArrowRight') {
        if (!isEditingText) handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditingText, currentIndex, items.length]);

  if (!isOpen || !currentItem) return null;

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + items.length) % items.length;
    onSelectIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % items.length;
    onSelectIndex(nextIdx);
  };

  const handleSaveTextChanges = () => {
    const ingredientsArr = editIngredients
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const finalCategory = isCustomCategory
      ? (customCategoryName.trim() || currentItem.category)
      : editCategory;

    onUpdateItem({
      ...currentItem,
      name: editName.trim() || currentItem.name,
      category: finalCategory,
      dishType: editDishType,
      featured: editDishType === 'signature' || editDishType === 'both',
      inGallery: editDishType === 'gallery' || editDishType === 'both',
      description: editDescription.trim() || currentItem.description,
      ingredients: ingredientsArr.length > 0 ? ingredientsArr : currentItem.ingredients,
    });

    setIsEditingText(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-md select-none">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-950/80 border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#f0afbd] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Lightbox Inspector
          </span>
          <span className="text-xs text-white/60 font-mono">
            {currentIndex + 1} of {items.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 text-white/75 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title={isZoomed ? 'Zoom Out' : 'Zoom In'}
          >
            {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Edit Text Toggle */}
          <button
            onClick={() => setIsEditingText(!isEditingText)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isEditingText
                ? 'bg-[#9e4c5b] text-white shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Edit dish name, ingredients, and description directly"
          >
            <Edit3 className="w-3.5 h-3.5" /> {isEditingText ? 'Done Editing' : 'Edit Dish Info'}
          </button>

          {/* Fully Functional More Options Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreMenuOpen(!isMoreMenuOpen);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isMoreMenuOpen
                  ? 'bg-[#9e4c5b] text-white shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="More options for this dish"
            >
              <MoreVertical className="w-3.5 h-3.5" />
              <span>More</span>
            </button>

            {isMoreMenuOpen && (
              <div
                ref={moreMenuRef}
                className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-stone-900 border border-white/20 rounded-xl shadow-2xl py-1.5 text-xs text-white backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-white/10 font-semibold text-[#f7cdd6] flex items-center justify-between">
                  <span className="truncate">{currentItem.name}</span>
                  <span className="text-[10px] text-white/40 font-mono">#{currentIndex + 1}</span>
                </div>

                {/* Edit info */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsEditingText(true);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-stone-200 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#f7cdd6]" />
                  <span>Edit Name, Category & Recipe</span>
                </button>

                {/* Change photo */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onRequestReplacePhoto(currentItem);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-stone-200 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#f7cdd6]" />
                  <span>Crop / Replace Photo</span>
                </button>

                {/* Toggle Chef's Signature */}
                {onToggleSignature && (
                  <div className="border-t border-white/10 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSignature(currentItem.id);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center justify-between text-stone-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-[#c99750] fill-current" />
                        <span>Chef&apos;s Signature Dish</span>
                      </span>
                      {(currentItem.featured || currentItem.dishType === 'signature' || currentItem.dishType === 'both') && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      )}
                    </button>
                  </div>
                )}

                {/* Toggle Gallery */}
                {onToggleGallery && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleGallery(currentItem.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center justify-between text-stone-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#e4a8b2]" />
                      <span>Show in Dishes Gallery</span>
                    </span>
                    {(currentItem.inGallery || currentItem.dishType === 'gallery' || currentItem.dishType === 'both') && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    )}
                  </button>
                )}

                {/* Direct Move to #1 or Last */}
                <div className="border-t border-white/10 my-1 pt-1 px-3 py-1">
                  <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Move Order Position:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        if (onMoveToPosition) {
                          onMoveToPosition(currentItem.id, 0);
                        } else {
                          onSwapItems(currentIndex, 0);
                        }
                        onSelectIndex(0);
                      }}
                      disabled={currentIndex === 0}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 text-[10px] font-bold rounded text-center cursor-pointer border border-white/10"
                    >
                      Move to #1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        if (onMoveToPosition) {
                          onMoveToPosition(currentItem.id, items.length - 1);
                        } else {
                          onSwapItems(currentIndex, items.length - 1);
                        }
                        onSelectIndex(items.length - 1);
                      }}
                      disabled={currentIndex === items.length - 1}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 text-[10px] font-bold rounded text-center cursor-pointer border border-white/10"
                    >
                      Move to Last
                    </button>
                  </div>
                </div>

                {/* Duplicate Dish */}
                {onDuplicateItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onDuplicateItem(currentItem);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-stone-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    <span>Duplicate Dish</span>
                  </button>
                )}

                {/* Delete Dish */}
                <div className="border-t border-white/10 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onDeleteItem(currentItem.id);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-red-950/60 flex items-center gap-2 text-red-400 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete Dish</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Dish */}
          <button
            onClick={() => onDeleteItem(currentItem.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 transition-colors cursor-pointer"
            title="Delete this dish from your portfolio"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" /> <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer ml-2"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Showcase & Inspector Area */}
      <div className="flex-1 relative flex flex-col md:flex-row items-center justify-center overflow-hidden p-3 md:p-6 gap-6">
        
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-3 md:left-6 z-30 p-3 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer shadow-lg"
          title="Previous Dish (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-3 md:right-6 z-30 p-3 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer shadow-lg"
          title="Next Dish (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center Stage: Photo */}
        <div className="relative flex-1 max-w-3xl h-full flex items-center justify-center overflow-hidden">
          <img
            src={currentItem.image}
            alt={currentItem.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = currentItem.image && currentItem.image.startsWith('/uploads/')
                  ? `${currentItem.image}?retry=1`
                  : '/uploads/dish_item-1793425238012-ka1o_5ab4054267b4.jpg';
              }
            }}
            className={`max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 ${
              isZoomed ? 'scale-135 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Quick Photo Swap overlay button */}
          <button
            onClick={() => onRequestReplacePhoto(currentItem)}
            className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-medium rounded-lg backdrop-blur-xs border border-white/20 transition-colors cursor-pointer shadow-md"
            title="Crop or upload a new photo for this dish"
          >
            <Upload className="w-3.5 h-3.5 text-[#f0afbd]" /> Change Photo
          </button>
        </div>

        {/* Right / Side Panel: Dish Details & Full Text Editing Option */}
        <div className="w-full md:w-96 max-h-[65vh] overflow-y-auto bg-stone-900/90 border border-white/15 rounded-xl p-5 text-white/90 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          {isEditingText ? (
            /* Live Edit Form inside Lightbox */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-semibold tracking-wider text-[#f0afbd] uppercase flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Lightbox Info
                </span>
                <span className="text-[11px] text-white/50">Changes save instantly</span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-400 mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-3 py-1.5 text-sm bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-hidden focus:border-[#e38294]"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-400 mb-1">
                    Section
                  </label>
                  <select
                    value={editDishType}
                    onChange={(e) => setEditDishType(e.target.value as 'signature' | 'gallery' | 'both')}
                    className="w-full px-2 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-hidden focus:border-[#e38294]"
                  >
                    <option value="signature">🌟 Signature</option>
                    <option value="gallery">🖼️ Gallery</option>
                    <option value="both">🍰 Both</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold uppercase text-stone-400">
                      Category
                    </label>
                    {!isCustomCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(true);
                          setCustomCategoryName('');
                        }}
                        className="text-[10px] text-[#e38294] hover:underline cursor-pointer"
                      >
                        + New
                      </button>
                    )}
                  </div>
                  {!isCustomCategory ? (
                    <select
                      value={editCategory}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setCustomCategoryName('');
                        } else {
                          setEditCategory(e.target.value);
                        }
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-hidden focus:border-[#e38294]"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      {editCategory && !categories.includes(editCategory) && (
                        <option value={editCategory}>{editCategory}</option>
                      )}
                      <option value="__custom__">+ Create New Category...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Category name..."
                        autoFocus
                        className="flex-1 px-2 py-1 text-xs bg-stone-800 border border-[#e38294] rounded-lg text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className="px-1.5 py-1 text-[10px] text-stone-400 hover:text-stone-200 bg-stone-700 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-400 mb-1">
                  Ingredients (comma separated)
                </label>
                <input
                  type="text"
                  value={editIngredients}
                  onChange={(e) => setEditIngredients(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-hidden focus:border-[#e38294]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  spellCheck={false}
                  className="w-full px-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-hidden focus:border-[#e38294] resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => onDeleteItem(currentItem.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer border border-red-900/40"
                  title="Delete this dish"
                >
                  <Trash2 className="w-3 h-3 text-red-400" /> Delete
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingText(false)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTextChanges}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#9e4c5b] hover:bg-[#883d4b] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-[#5e2632] text-[#f7cdd6] rounded-full">
                      {currentItem.category}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium tracking-wide bg-white/10 text-[#fcdfe5] rounded-full border border-white/10">
                      {currentItem.dishType === 'signature'
                        ? '🌟 Signature Dish'
                        : currentItem.dishType === 'both'
                        ? '🍰 Signature & Gallery'
                        : '🖼️ Gallery Dish'}
                    </span>
                  </div>
                  <h2 className="font-serif-display text-xl font-bold text-white leading-snug">
                    {currentItem.name}
                  </h2>
                </div>
              </div>

              {/* Small Description */}
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                {currentItem.description}
              </p>

              {/* Ingredients */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1 mb-2">
                  <Tag className="w-3 h-3 text-[#f0afbd]" /> Ingredients & Elements
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentItem.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] bg-white/10 text-stone-200 rounded-md border border-white/10"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Swap Position Controls within Lightbox */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <span className="flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#e4a8b2]" /> Dish Catalog Position:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-white/70">Place #{currentIndex + 1}</span>
                    <select
                      value={currentIndex}
                      onChange={(e) => {
                        const targetSlot = Number(e.target.value);
                        if (onMoveToPosition) {
                          onMoveToPosition(currentItem.id, targetSlot);
                        } else {
                          onSwapItems(currentIndex, targetSlot);
                        }
                        onSelectIndex(targetSlot);
                      }}
                      className="text-[11px] font-mono font-bold py-0.5 px-1 bg-stone-800 border border-white/20 rounded text-[#f7cdd6] focus:outline-hidden cursor-pointer"
                      title="Directly move to any place in catalog"
                    >
                      {items.map((_, i) => (
                        <option key={i} value={i}>
                          #{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (currentIndex > 0) {
                        if (onSwapItemsById) {
                          onSwapItemsById(currentItem.id, items[currentIndex - 1].id);
                        } else {
                          onSwapItems(currentIndex, currentIndex - 1);
                        }
                        onSelectIndex(currentIndex - 1);
                      }
                    }}
                    disabled={currentIndex === 0}
                    className="px-2 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-md text-stone-200 transition-colors flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                  >
                    ← Move Earlier
                  </button>
                  <button
                    onClick={() => {
                      if (currentIndex < items.length - 1) {
                        if (onSwapItemsById) {
                          onSwapItemsById(currentItem.id, items[currentIndex + 1].id);
                        } else {
                          onSwapItems(currentIndex, currentIndex + 1);
                        }
                        onSelectIndex(currentIndex + 1);
                      }
                    }}
                    disabled={currentIndex === items.length - 1}
                    className="px-2 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-md text-stone-200 transition-colors flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                  >
                    Move Later →
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setIsEditingText(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#f7cdd6] hover:text-white cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Dish Details
                </button>
                <button
                  onClick={() => onDeleteItem(currentItem.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Delete this dish"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Quick Thumbnail Filmstrip (25 photos) with Easy Swap */}
      <div className="bg-stone-950/95 border-t border-white/15 px-4 py-2.5 z-20">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
            Quick Filmstrip ({items.length} photos) — click any to jump, or use swap buttons
          </span>
          <span className="text-[11px] text-[#f7cdd6]">
            Active: #{currentIndex + 1} &bull; {currentItem.name}
          </span>
        </div>

        {/* Filmstrip Horizontal Track */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-stone-700">
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={item.id}
                className="relative flex-shrink-0 group"
              >
                <button
                  onClick={() => onSelectIndex(idx)}
                  className={`relative block w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#e4a8b2] scale-105 ring-2 ring-[#e4a8b2]/40 shadow-lg'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/40'
                  }`}
                  title={`${idx + 1}. ${item.name}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono text-white/90 px-1 rounded-tl">
                    {idx + 1}
                  </span>
                </button>

                {/* Quick Swap Overlay Controls on Hover */}
                <div className="absolute -top-1 -right-1 hidden group-hover:flex items-center bg-black/80 rounded shadow-md z-30">
                  {idx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwapItems(idx, idx - 1);
                      }}
                      className="p-1 text-[10px] text-white hover:text-[#f7cdd6] cursor-pointer"
                      title="Swap Left"
                    >
                      ‹
                    </button>
                  )}
                  {idx < items.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwapItems(idx, idx + 1);
                      }}
                      className="p-1 text-[10px] text-white hover:text-[#f7cdd6] cursor-pointer"
                      title="Swap Right"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

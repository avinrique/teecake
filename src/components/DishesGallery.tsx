import React, { useState, useEffect, useRef } from 'react';
import {
  Images,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Camera,
  Trash2,
  Tag,
  ArrowLeft,
  ArrowRight,
  Edit2,
  MoreVertical,
  Copy,
  Layers,
  ArrowUpDown,
  Check,
  Eye,
  Star,
} from 'lucide-react';
import { BakeryItem, PageTexts } from '../types';
import { EditableText } from './EditableText';

interface DishesGalleryProps {
  items: BakeryItem[];
  pageTexts: PageTexts;
  onUpdatePageText: (field: keyof PageTexts, value: string) => void;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenLightbox: (index: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: BakeryItem) => void;
  onOpenReplacePhoto: (item: BakeryItem) => void;
  onSwapItems: (indexA: number, indexB: number) => void;
  onSwapItemsById?: (idA: string, idB: string) => void;
  onMoveToPosition?: (id: string, targetSlot: number) => void;
  onToggleSignature?: (id: string) => void;
  onDuplicateItem?: (item: BakeryItem) => void;
  onDeleteItem: (id: string) => void;
  onQuickUploadPhoto?: (item: BakeryItem, file: File) => void;
}

export const DishesGallery: React.FC<DishesGalleryProps> = ({
  items,
  pageTexts,
  onUpdatePageText,
  currentIndex,
  onSelectIndex,
  onOpenLightbox,
  onOpenAddModal,
  onOpenEditModal,
  onOpenReplacePhoto,
  onSwapItems,
  onSwapItemsById,
  onMoveToPosition,
  onToggleSignature,
  onToggleGallery,
  onDuplicateItem,
  onDeleteItem,
  onQuickUploadPhoto,
}) => {
  const [activeMoreMenuId, setActiveMoreMenuId] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Close More menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setActiveMoreMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Gallery dishes: items that are inGallery or gallery dishType
  const galleryItems = items.filter(
    (item) => item.inGallery || item.dishType === 'gallery' || item.dishType === 'both'
  );

  const safeIndex = Math.min(currentIndex, Math.max(0, galleryItems.length - 1));
  const currentItem = galleryItems[safeIndex] || galleryItems[0];

  const handlePrev = () => {
    if (galleryItems.length === 0) return;
    const nextIdx = (safeIndex - 1 + galleryItems.length) % galleryItems.length;
    onSelectIndex(nextIdx);
  };

  const handleNext = () => {
    if (galleryItems.length === 0) return;
    const nextIdx = (safeIndex + 1) % galleryItems.length;
    onSelectIndex(nextIdx);
  };

  return (
    <section id="dishes-gallery" className="py-14 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Editable text */}
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcedf0] border border-[#e8c0c8] mb-3">
            <Images className="w-3.5 h-3.5 text-[#9e4c5b]" />
            <EditableText
              value={pageTexts.galleryEmblem}
              onSave={(val) => onUpdatePageText('galleryEmblem', val)}
              textKey="galleryEmblem"
              label="Gallery Section Emblem"
              defaultAlign="center"
              className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47] text-center"
            />
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a1c26] tracking-tight mb-3 text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.galleryHeading}
              onSave={(val) => onUpdatePageText('galleryHeading', val)}
              textKey="galleryHeading"
              label="Gallery Section Heading"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h2>

          <div className="font-serif-subtle italic text-base sm:text-lg text-[#5a222e] leading-relaxed text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.gallerySubheading}
              onSave={(val) => onUpdatePageText('gallerySubheading', val)}
              textKey="gallerySubheading"
              defaultWeight="semibold"
              defaultAlign="center"
              label="Gallery Section Subheading"
              multiline
              as="span"
              className="text-center"
            />
          </div>
        </div>

        {/* Gallery Top Control Bar */}
        <div className="bg-[#fffdfb]/90 border border-[#e8ccd2] rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#804824] text-white shadow-2xs">
              <Images className="w-3.5 h-3.5" />
              Dishes Gallery ({galleryItems.length} Items)
            </span>
            <span className="text-xs text-stone-500">
              Select or swap thumbnails below to reorder
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-full shadow-xs cursor-pointer transition-colors"
              title="Add a new dish to this gallery"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Gallery Dish
            </button>
          </div>
        </div>

        {/* Horizontal Filmstrip Carousel (All Gallery Dishes) */}
        {galleryItems.length === 0 ? (
          <div className="text-center py-16 bg-[#fffaf6] border border-dashed border-[#ebd0d6] rounded-3xl p-8 mb-8">
            <Images className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-lg font-bold text-[#5e2632] mb-1">
              No Gallery Dishes Added Yet
            </h3>
            <p className="text-xs text-stone-500 mb-4 max-w-md mx-auto">
              Any creation added to the Gallery section will appear here with filmstrip navigation and full showcase previews.
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add First Gallery Dish</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#fffdfb]/80 border border-[#ebd4d9] rounded-2xl p-4 shadow-sm backdrop-blur-xs mb-8">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-3 px-1">
            <span className="font-semibold text-[#5e2632]">
              Dishes Gallery Filmstrip ({galleryItems.length} creations):
            </span>
            <span className="text-[11px] text-stone-500">
              Click thumbnail to preview • Use arrows to swap positions
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin">
            {galleryItems.map((item, idx) => {
              const isActive = idx === safeIndex;
              return (
                <div
                  key={item.id}
                  className={`group relative shrink-0 w-28 sm:w-32 rounded-xl overflow-hidden border-2 transition-all p-1 ${
                    isActive
                      ? 'border-[#9e4c5b] bg-[#faeaee] shadow-md scale-102'
                      : 'border-stone-200 bg-white hover:border-[#cf8a99] hover:bg-[#fff9fa]'
                  }`}
                >
                  <div
                    onClick={() => onSelectIndex(idx)}
                    className="cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 mb-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Delete this dish"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-black/70 text-white rounded">
                        #{idx + 1}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-stone-800 truncate px-0.5 leading-tight">
                      {item.name}
                    </p>
                  </div>

                  {/* Easy Swap Buttons (Left and Right) */}
                  <div className="flex items-center justify-between mt-1 px-0.5 pt-0.5 border-t border-black/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (idx > 0) {
                          if (onSwapItemsById) {
                            onSwapItemsById(item.id, galleryItems[idx - 1].id);
                          } else {
                            onSwapItems(idx, idx - 1);
                          }
                          onSelectIndex(idx - 1);
                        }
                      }}
                      disabled={idx === 0}
                      className={`p-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        idx === 0
                          ? 'opacity-20 cursor-not-allowed'
                          : isActive
                          ? 'hover:bg-white/40 text-[#5e2632]'
                          : 'hover:bg-[#fcedf0] text-[#7a3b47]'
                      }`}
                      title="Swap this photo to the left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>

                    <span className="text-[9px] font-mono opacity-60">
                      swap
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (idx < galleryItems.length - 1) {
                          if (onSwapItemsById) {
                            onSwapItemsById(item.id, galleryItems[idx + 1].id);
                          } else {
                            onSwapItems(idx, idx + 1);
                          }
                          onSelectIndex(idx + 1);
                        }
                      }}
                      disabled={idx === galleryItems.length - 1}
                      className={`p-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        idx === galleryItems.length - 1
                          ? 'opacity-20 cursor-not-allowed'
                          : isActive
                          ? 'hover:bg-white/40 text-[#5e2632]'
                          : 'hover:bg-[#fcedf0] text-[#7a3b47]'
                      }`}
                      title="Swap this photo to the right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Selected Photo Showcase Carousel Stage */}
        {currentItem && (
          <div className="bg-[#fffdfb]/95 border border-[#ebd4d9] rounded-2xl shadow-xl overflow-hidden backdrop-blur-xs grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left/Main Showcase Photo (7 cols) */}
            <div className="lg:col-span-7 relative min-h-[360px] md:min-h-[480px] bg-stone-900 flex items-center justify-center overflow-hidden">
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
                className="w-full h-full max-h-[550px] object-cover transition-transform duration-700 ease-out"
              />

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/85 text-white rounded-full backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer shadow-lg z-20"
                title="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/85 text-white rounded-full backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer shadow-lg z-20"
                title="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Inspect / Fullscreen Button */}
              <button
                onClick={() => {
                  const globalIdx = items.findIndex((i) => i.id === currentItem.id);
                  onOpenLightbox(globalIdx >= 0 ? globalIdx : 0);
                }}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/65 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs transition-all shadow-md cursor-pointer z-20"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#f0afbd]" /> Open Inspect Lightbox
              </button>

              {/* Replace Photo Overlay */}
              <button
                onClick={() => onOpenReplacePhoto(currentItem)}
                className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/65 hover:bg-black text-white text-xs font-medium rounded-lg backdrop-blur-xs transition-all shadow-md cursor-pointer z-20"
              >
                <Camera className="w-3.5 h-3.5 text-[#f0afbd]" /> Crop / Change Photo
              </button>
            </div>

            {/* Right Details Panel (5 cols) (NO PRICE) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white/70">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[#5e2632] text-white rounded-full">
                    {currentItem.category}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    Gallery Item {safeIndex + 1} of {galleryItems.length}
                  </span>
                </div>

                <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#4a1c26] mb-3 leading-tight">
                  {currentItem.name}
                </h3>

                <p className="text-sm text-[#5d4449] leading-relaxed mb-6">
                  {currentItem.description}
                </p>

                {/* Key Ingredients */}
                <div className="mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7a3b47] block mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#c99750]" /> Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentItem.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-medium bg-[#fbedf0] text-[#783944] rounded-md border border-[#f0d1d7]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gallery Position Reorder & Swap Bar in Showcase */}
                <div className="mb-4 p-3 rounded-xl bg-[#fdf2f4]/90 border border-[#f0d4da] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#9e4c5b]" />
                    <span className="font-semibold text-[#541e2a] text-[11px]">Gallery Place:</span>
                    <span className="font-mono font-bold text-[#9e4c5b] bg-white px-2 py-0.5 rounded border border-[#ebd0d6] text-[11px]">
                      #{safeIndex + 1} of {galleryItems.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Swap Left */}
                    <button
                      type="button"
                      onClick={() => {
                        if (safeIndex > 0) {
                          if (onSwapItemsById) {
                            onSwapItemsById(currentItem.id, galleryItems[safeIndex - 1].id);
                          } else {
                            onSwapItems(safeIndex, safeIndex - 1);
                          }
                          onSelectIndex(safeIndex - 1);
                        }
                      }}
                      disabled={safeIndex === 0}
                      className="px-2 py-1 rounded bg-white hover:bg-[#9e4c5b] text-[#541e2a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#ebd0d6] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      title="Move dish earlier in gallery"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Earlier</span>
                    </button>

                    {/* Move to any slot dropdown */}
                    <select
                      value={safeIndex}
                      onChange={(e) => {
                        const targetSlot = Number(e.target.value);
                        if (onMoveToPosition) {
                          onMoveToPosition(currentItem.id, targetSlot);
                        } else if (onSwapItemsById) {
                          onSwapItemsById(currentItem.id, galleryItems[targetSlot].id);
                        }
                        onSelectIndex(targetSlot);
                      }}
                      className="text-[11px] font-mono font-bold py-1 px-1.5 bg-white border border-[#ebd0d6] rounded text-[#541e2a] focus:outline-hidden focus:ring-1 focus:ring-[#9e4c5b] cursor-pointer"
                      title="Place at exact position in gallery"
                    >
                      {galleryItems.map((_, i) => (
                        <option key={i} value={i}>
                          Place #{i + 1}
                        </option>
                      ))}
                    </select>

                    {/* Swap Right */}
                    <button
                      type="button"
                      onClick={() => {
                        if (safeIndex < galleryItems.length - 1) {
                          if (onSwapItemsById) {
                            onSwapItemsById(currentItem.id, galleryItems[safeIndex + 1].id);
                          } else {
                            onSwapItems(safeIndex, safeIndex + 1);
                          }
                          onSelectIndex(safeIndex + 1);
                        }
                      }}
                      disabled={safeIndex === galleryItems.length - 1}
                      className="px-2 py-1 rounded bg-white hover:bg-[#9e4c5b] text-[#541e2a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#ebd0d6] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      title="Move dish later in gallery"
                    >
                      <span>Later</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Footer in Showcase with FULLY FUNCTIONAL More Options */}
              <div className="pt-4 border-t border-[#edd4d9] flex flex-wrap items-center justify-between gap-2 relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditModal(currentItem)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#e8c0c8] hover:bg-[#faeaee] text-[#783944] text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Text
                  </button>

                  <label
                    className="relative inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#e8c0c8] hover:bg-[#faeaee] text-[#783944] text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer overflow-hidden"
                    title="Upload or change this photo"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (onQuickUploadPhoto) {
                            onQuickUploadPhoto(currentItem, f);
                          } else if (onOpenReplacePhoto) {
                            onOpenReplacePhoto(currentItem);
                          }
                        }
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Camera className="w-3.5 h-3.5 text-[#9e4c5b]" /> Crop / Upload
                  </label>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <button
                    onClick={() => {
                      const globalIdx = items.findIndex((i) => i.id === currentItem.id);
                      onOpenLightbox(globalIdx >= 0 ? globalIdx : 0);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#9e4c5b] hover:bg-[#853c49] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Inspect Lightbox
                  </button>

                  {/* Fully Functional More Options Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMoreMenuId(activeMoreMenuId === currentItem.id ? null : currentItem.id);
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                        activeMoreMenuId === currentItem.id
                          ? 'bg-[#9e4c5b] text-white shadow-xs'
                          : 'bg-white border border-[#ebd0d6] text-[#6b2c3a] hover:bg-[#faeaee]'
                      }`}
                      title="More dish options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                      <span>More</span>
                    </button>

                    {activeMoreMenuId === currentItem.id && (
                      <div
                        ref={moreMenuRef}
                        className="absolute right-0 bottom-full mb-2 z-50 w-60 bg-white border border-[#ebd0d6] rounded-xl shadow-2xl py-1.5 text-xs text-stone-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
                      >
                        <div className="px-3 py-1.5 border-b border-stone-100 font-semibold text-[#5e2632] flex items-center justify-between">
                          <span className="truncate">{currentItem.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">#{safeIndex + 1}</span>
                        </div>

                        {/* Inspect */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMoreMenuId(null);
                            const globalIdx = items.findIndex((i) => i.id === currentItem.id);
                            onOpenLightbox(globalIdx >= 0 ? globalIdx : 0);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-[#faeaee] flex items-center gap-2 text-stone-700 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#9e4c5b]" />
                          <span>Inspect Lightbox Fullscreen</span>
                        </button>

                        {/* Replace photo */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMoreMenuId(null);
                            onOpenReplacePhoto(currentItem);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-[#faeaee] flex items-center gap-2 text-stone-700 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#9e4c5b]" />
                          <span>Crop / Replace Photo</span>
                        </button>

                        {/* Edit text */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMoreMenuId(null);
                            onOpenEditModal(currentItem);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-[#faeaee] flex items-center gap-2 text-stone-700 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                          <span>Edit Dish Details & Recipe</span>
                        </button>

                        {/* Change Position in Gallery */}
                        <div className="border-t border-stone-100 my-1 pt-1 px-3 py-1">
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                            Change Gallery Position:
                          </span>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMoreMenuId(null);
                                if (onMoveToPosition) onMoveToPosition(currentItem.id, 0);
                                onSelectIndex(0);
                              }}
                              disabled={safeIndex === 0}
                              className="px-2 py-1 bg-stone-50 hover:bg-[#fcedf0] disabled:opacity-30 disabled:cursor-not-allowed text-stone-700 text-[10px] font-bold rounded text-center cursor-pointer border border-stone-200"
                            >
                              Move to #1 (First)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMoreMenuId(null);
                                if (onMoveToPosition) onMoveToPosition(currentItem.id, galleryItems.length - 1);
                                onSelectIndex(galleryItems.length - 1);
                              }}
                              disabled={safeIndex === galleryItems.length - 1}
                              className="px-2 py-1 bg-stone-50 hover:bg-[#fcedf0] disabled:opacity-30 disabled:cursor-not-allowed text-stone-700 text-[10px] font-bold rounded text-center cursor-pointer border border-stone-200"
                            >
                              Move to Last
                            </button>
                          </div>
                        </div>

                        {/* Toggle Chef's Signature */}
                        {onToggleSignature && (
                          <div className="border-t border-stone-100 my-1 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                onToggleSignature(currentItem.id);
                                setActiveMoreMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-[#faeaee] flex items-center justify-between text-stone-700 cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Star className="w-3.5 h-3.5 text-[#c99750] fill-current" />
                                <span>Also Show in Chef&apos;s Signature</span>
                              </span>
                              {(currentItem.featured || currentItem.dishType === 'signature' || currentItem.dishType === 'both') && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Duplicate Dish */}
                        {onDuplicateItem && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMoreMenuId(null);
                              onDuplicateItem(currentItem);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-[#faeaee] flex items-center gap-2 text-stone-700 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-stone-600" />
                            <span>Duplicate Dish</span>
                          </button>
                        )}

                        {/* Delete Dish */}
                        <div className="border-t border-stone-100 my-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMoreMenuId(null);
                              onDeleteItem(currentItem.id);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete Dish</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteItem(currentItem.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                    title="Delete this dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

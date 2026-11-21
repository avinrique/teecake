import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { BakeryItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: BakeryItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#fffdfc] border border-[#f0cfd6] rounded-2xl shadow-2xl overflow-hidden p-6 text-stone-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#5e222f] leading-snug">
              Delete This Dish?
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              This action cannot be undone and will automatically update dish counts.
            </p>
          </div>
        </div>

        {/* Dish Preview Card */}
        <div className="bg-[#faeaee]/60 border border-[#f2dbe0] rounded-xl p-3 flex items-center gap-3.5 mb-5">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-white shadow-2xs bg-stone-100"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-serif-display text-sm font-bold text-[#4a1c26] truncate">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase bg-white text-[#783944] rounded border border-[#eed0d7]">
                {item.category}
              </span>
              <span className="text-[11px] text-stone-500">
                {item.dishType === 'signature'
                  ? '🌟 Signature'
                  : item.dishType === 'both'
                  ? '🍰 Signature & Gallery'
                  : '🖼️ Gallery'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-6">
          Removing <span className="font-semibold text-stone-800">&ldquo;{item.name}&rdquo;</span> will immediately update your active category count in <span className="font-semibold text-[#8b3d4d]">&ldquo;{item.category}&rdquo;</span> and remove it from all gallery showcases.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete Dish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

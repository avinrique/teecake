import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Tag,
  Filter,
  Layers,
  Sparkles,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { BakeryItem } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';

interface EditFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  items: BakeryItem[];
  onSaveCategories: (newCategories: string[]) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
}

export const EditFiltersModal: React.FC<EditFiltersModalProps> = ({
  isOpen,
  onClose,
  categories,
  items,
  onSaveCategories,
  onRenameCategory,
}) => {
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [newFilterName, setNewFilterName] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraftName, setEditDraftName] = useState<string>('');
  const [updateDishesAutomatically, setUpdateDishesAutomatically] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [confirmingReset, setConfirmingReset] = useState<boolean>(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategories(categories);
      setEditingIndex(null);
      setEditDraftName('');
      setNewFilterName('');
      setSuccessMessage(null);
      setErrorMessage(null);
      setPendingDeleteIndex(null);
      setConfirmingReset(false);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 3500);
  };

  // Start editing a specific filter's text
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditDraftName(localCategories[index]);
    setPendingDeleteIndex(null);
  };

  // Commit text edit for a category filter
  const commitEdit = (index: number) => {
    const trimmed = editDraftName.trim();
    if (!trimmed) return;

    const oldName = localCategories[index];
    if (oldName === trimmed) {
      setEditingIndex(null);
      return;
    }

    // Check duplicate
    if (localCategories.some((c, i) => i !== index && c.toLowerCase() === trimmed.toLowerCase())) {
      showError(`A filter named "${trimmed}" already exists.`);
      return;
    }

    const updated = [...localCategories];
    updated[index] = trimmed;
    setLocalCategories(updated);
    setEditingIndex(null);

    // If updateDishesAutomatically is true, also update dishes with this category!
    if (updateDishesAutomatically) {
      onRenameCategory(oldName, trimmed);
    } else {
      onSaveCategories(updated);
    }

    showNotification(`Renamed filter "${oldName}" to "${trimmed}"`);
  };

  // Add a new filter
  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFilterName.trim();
    if (!trimmed) return;

    if (localCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showError(`A filter named "${trimmed}" already exists.`);
      return;
    }

    const updated = [...localCategories, trimmed];
    setLocalCategories(updated);
    onSaveCategories(updated);
    setNewFilterName('');
    showNotification(`Added new filter "${trimmed}"`);
  };

  // Move a filter up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...localCategories];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setLocalCategories(updated);
    onSaveCategories(updated);
  };

  // Move a filter down
  const handleMoveDown = (index: number) => {
    if (index >= localCategories.length - 1) return;
    const updated = [...localCategories];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setLocalCategories(updated);
    onSaveCategories(updated);
  };

  // Delete a filter
  const handleConfirmDeleteFilter = (index: number) => {
    const categoryToDelete = localCategories[index];
    const updated = localCategories.filter((_, i) => i !== index);
    setLocalCategories(updated);
    onSaveCategories(updated);
    setPendingDeleteIndex(null);
    showNotification(`Removed filter "${categoryToDelete}"`);
  };

  // Reset to default categories
  const handleExecuteResetDefaults = () => {
    setLocalCategories(DEFAULT_CATEGORIES);
    onSaveCategories(DEFAULT_CATEGORIES);
    setConfirmingReset(false);
    showNotification('Filters reset to default configuration');
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfb] rounded-3xl border border-[#ebd0d6] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#fdedf1] to-[#fff6f8] border-b border-[#ebd0d6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9e4c5b] text-white flex items-center justify-center shadow-xs">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#4a1c26] font-serif-display">
                Customize & Self-Edit Filters
              </h2>
              <p className="text-xs text-[#7e4753]">
                Rename any filter text, add custom categories, or reorder your menu filters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/50 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast notice if any */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error notice if any */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 text-xs font-semibold text-rose-800 flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add New Filter Form */}
          <div className="bg-[#fff7f9] p-4 rounded-2xl border border-[#edd1d8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a3b47] mb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#9e4c5b]" />
              Add a New Category / Filter
            </h3>
            <form onSubmit={handleAddFilter} className="flex gap-2">
              <input
                type="text"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                placeholder="e.g. Chef Specials, French Brunch, Beverages, Vegan..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#ebd0d6] rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] shadow-2xs"
              />
              <button
                type="submit"
                disabled={!newFilterName.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Filter
              </button>
            </form>
          </div>

          {/* Existing Filters List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a3b47] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#9e4c5b]" />
                Current Active Filters ({localCategories.length}):
              </h3>
              <span className="text-[11px] text-stone-500">
                Click pencil or text to edit filter name
              </span>
            </div>

            <div className="space-y-2">
              {localCategories.map((cat, index) => {
                const dishCount = getCategoryCount(cat);
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={cat + index}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isEditing
                        ? 'bg-[#faeaee] border-[#c47787] shadow-sm'
                        : 'bg-white border-[#ebd0d6] hover:border-[#cf92a0]'
                    }`}
                  >
                    {/* Left: Reorder arrows & Title/Input */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Move Up/Down Controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded text-stone-400 hover:text-[#9e4c5b] hover:bg-[#faeaee] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move filter up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === localCategories.length - 1}
                          className="p-1 rounded text-stone-400 hover:text-[#9e4c5b] hover:bg-[#faeaee] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move filter down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display name OR Inline Edit Input */}
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editDraftName}
                            onChange={(e) => setEditDraftName(e.target.value)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') commitEdit(index);
                              if (e.key === 'Escape') setEditingIndex(null);
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-white border border-[#9e4c5b] rounded-lg text-[#5e2632] focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b]"
                          />
                          <button
                            type="button"
                            onClick={() => commitEdit(index)}
                            className="p-2 rounded-lg bg-[#9e4c5b] text-white hover:bg-[#853c49] shadow-xs cursor-pointer"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="p-2 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 cursor-pointer"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditing(index)}
                          className="flex items-center gap-2 flex-1 cursor-pointer group/item"
                        >
                          <span className="text-sm font-bold text-[#4a1c26] group-hover/item:text-[#9e4c5b] transition-colors">
                            {cat}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#fbedf0] text-[#7a3b47] border border-[#ebd0d6]">
                            {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                          </span>

                          <Edit2 className="w-3.5 h-3.5 text-stone-300 group-hover/item:text-[#9e4c5b] transition-colors ml-1" />
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {pendingDeleteIndex === index ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            <span className="text-[11px] font-medium text-rose-800">
                              {dishCount > 0 ? `Remove? (${dishCount} dishes)` : 'Remove?'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteFilter(index)}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteIndex(null)}
                              className="px-1.5 py-0.5 text-[10px] text-stone-600 hover:text-stone-900 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(index)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#7a3b47] hover:bg-[#faeaee] rounded-lg border border-[#ebd0d6] cursor-pointer transition-colors flex items-center gap-1"
                              title="Rename this filter text"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Rename</span>
                            </button>

                            {localCategories.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setPendingDeleteIndex(index)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete this filter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Synchronize Option & Reset */}
          <div className="pt-2 border-t border-[#f0d8dd] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={updateDishesAutomatically}
                onChange={(e) => setUpdateDishesAutomatically(e.target.checked)}
                className="w-4 h-4 text-[#9e4c5b] rounded border-stone-300 focus:ring-[#9e4c5b] cursor-pointer"
              />
              <span className="font-medium text-stone-700">
                Automatically update existing creations to match renamed filters
              </span>
            </label>

            {confirmingReset ? (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <span className="text-xs font-medium text-amber-900">Reset to default filters?</span>
                <button
                  type="button"
                  onClick={handleExecuteResetDefaults}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="px-2 py-1 text-xs text-stone-600 hover:text-stone-900 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="text-stone-500 hover:text-[#9e4c5b] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset all filters back to standard Patisserie defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#fffaf8] border-t border-[#ebd0d6] flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Tip: Changes take effect immediately across all menus and dish pickers.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};

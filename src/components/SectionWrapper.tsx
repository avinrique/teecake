import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  PlusCircle,
  Layers,
  EyeOff,
} from 'lucide-react';
import { PageSection } from '../types';
import { useEditMode } from '../context/EditModeContext';

interface SectionWrapperProps {
  section: PageSection;
  index: number;
  totalSections: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onOpenAddSectionModal: (insertAfterOrder: number) => void;
  onOpenManageSections: () => void;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  section,
  index,
  totalSections,
  onMoveUp,
  onMoveDown,
  onEditSection,
  onDeleteSection,
  onOpenAddSectionModal,
  onOpenManageSections,
  children,
}) => {
  const { isEditMode } = useEditMode();
  const isFirst = index === 0;
  const isLast = index === totalSections - 1;

  return (
    <div className="relative group/section">
      {/* Discreet floating control pill for section reordering (appears only on hover in Edit Mode) */}
      {isEditMode && (
        <div
          data-editor-control="true"
          className="editor-control absolute top-2 right-4 sm:right-6 lg:right-8 z-20 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/section:pointer-events-auto"
        >
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#ebd0d6] shadow-md">
          {/* Section Title Indicator without numbers */}
          <span className="text-[10px] font-semibold text-[#7a3b47] px-1 hidden md:inline-block">
            {section.title}
          </span>
          <span className="w-px h-3 bg-stone-200 mx-0.5 hidden md:inline-block" />

          {/* Move Up */}
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1 rounded-full text-stone-700 transition-colors cursor-pointer ${
              isFirst
                ? 'opacity-25 cursor-not-allowed'
                : 'hover:bg-[#faeaee] hover:text-[#9e4c5b]'
            }`}
            title="Move section UP"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          {/* Move Down */}
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1 rounded-full text-stone-700 transition-colors cursor-pointer ${
              isLast
                ? 'opacity-25 cursor-not-allowed'
                : 'hover:bg-[#faeaee] hover:text-[#9e4c5b]'
            }`}
            title="Move section DOWN"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-3 bg-stone-200 mx-0.5" />

          {/* Edit Section Settings */}
          <button
            onClick={onEditSection}
            className="p-1 rounded-full hover:bg-[#faeaee] text-stone-700 hover:text-[#9e4c5b] transition-colors cursor-pointer"
            title="Edit section title or content"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Add Section Below */}
          <button
            onClick={() => onOpenAddSectionModal(section.order)}
            className="p-1 rounded-full hover:bg-[#faeaee] text-stone-700 hover:text-[#9e4c5b] transition-colors cursor-pointer"
            title="Add a new section below this one"
          >
            <PlusCircle className="w-3.5 h-3.5" />
          </button>

          {/* Delete Section */}
          {totalSections > 1 && (
            <button
              onClick={onDeleteSection}
              className="p-1 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
              title="Delete this section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="w-px h-3 bg-stone-200 mx-0.5" />

          {/* Master Sections Manager Modal */}
          <button
            onClick={onOpenManageSections}
            className="px-2 py-0.5 rounded-full bg-[#9e4c5b] hover:bg-[#853c49] text-white text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            title="Open page sections manager"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Sections</span>
          </button>
          </div>
        </div>
      )}

      {/* Render the actual section component */}
      {children}
    </div>
  );
};
